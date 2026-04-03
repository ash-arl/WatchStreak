# Architecture

WatchStreak is a full-stack monorepo split into a Next.js frontend, a FastAPI backend, and shared packages — all orchestrated with pnpm workspaces and Turborepo.

## System Overview

```
Browser
  │
  ▼
Next.js (port 3000)
  │  src/lib/api.ts  ──  typed fetch() wrapper
  │
  ▼  HTTP / JSON
FastAPI (port 8000)
  │
  ├──► YouTube Data API v3 (httpx)   ──  playlist import
  │
  └──► SQLite (dev) / PostgreSQL (prod)  ──  course, video, log storage
```

## Monorepo Layout

```
/
├── apps/
│   ├── web/               Next.js 16 frontend
│   └── api/               FastAPI backend
├── packages/
│   ├── shared-types/      Auto-generated TypeScript types from OpenAPI
│   └── ui/                Shared React components
├── skills/                Bash automation scripts
└── docs/                  Documentation
```

Managed with **pnpm workspaces** + **Turborepo** for parallel dev servers and cached builds.

## Request Lifecycle

### Importing a Playlist

1. User pastes a YouTube URL on the landing page and clicks "Preview Playlist"
2. Frontend calls `GET /courses/preview?url=...` → shows title, channel, duration, video count
3. User sets target days and clicks "Start Learning →"
4. Frontend calls `POST /courses` with `{ playlist_url, target_days }`
5. Backend:
   - Extracts playlist ID from URL with regex
   - Calls YouTube `/playlists` → title, channel, thumbnail
   - Paginates YouTube `/playlistItems` → collects all video IDs
   - Batch-fetches YouTube `/videos` (50 at a time) → ISO 8601 durations
   - Parses `PT1H23M45S` → total seconds
   - Saves one `Course` + N `Video` rows in a single DB transaction
6. Frontend receives the new `CourseOut` and redirects to `/courses/{id}`

### Tracking a Video as Watched

1. User clicks a video row in `/courses/{id}`
2. Frontend calls `PATCH /videos/{id}/watch` with `{ watched: true }`
3. Backend updates `video.watched = True`, `video.watched_at = now()`
4. Returns updated `VideoOut`; React state merges the change (no full refetch)
5. Completion % and progress bar recalculate instantly on the client

### Logging Daily Watch Time (Heatmap)

1. User enters minutes in the sidebar and clicks "Log"
2. Frontend calls `POST /logs` with `{ course_id, log_date, minutes_watched }`
3. Backend **upserts**: if a log exists for `(course_id, log_date)` it adds the minutes; otherwise creates new
4. Heatmap reads `GET /courses/{id}/heatmap` → `[{ date, minutes }, ...]`
5. `Heatmap.tsx` renders a 52-week grid with pastel mint intensity levels

## Key Design Decisions

### Computed Fields, Not Stored
`completion_pct`, `watched_videos`, `watched_seconds`, and `daily_goal_minutes` are computed at query time inside `_enrich()` in `courses.py`. They are never written to the DB — derived from the live video list. This keeps the model simple and always accurate.

### SQLite in Dev, PostgreSQL in Prod
Zero-setup for local development. Switch the `DATABASE_URL` in `.env` to a Postgres URI for production. Alembic handles both dialects with the same migration files.

### Client Components Only Where Needed
App Router defaults to Server Components. Pages that need real-time state (`useEffect` + `useState`) opt into `"use client"`. The heatmap, video toggle, and log form are all client-side; static content stays server-rendered.

### No Authentication (MVP)
Auth is intentionally out of scope. The natural extension is NextAuth.js + a `user_id` FK on `Course`, gated behind a session check in each route.

### Heatmap as Accumulator
`POST /logs` is additive — calling it multiple times on the same date accumulates minutes. This allows partial logging throughout the day without needing a separate "update" endpoint.
