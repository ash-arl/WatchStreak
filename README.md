# WatchStreak 🎯

> Turn YouTube playlists into structured, trackable courses.

WatchStreak converts any YouTube playlist into a goal-oriented learning experience — with daily watch targets, real-time progress tracking, and a GitHub-style activity heatmap to keep you consistent.

![WatchStreak Landing](stitch/screen.png)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📥 **Playlist Import** | Paste any YouTube playlist URL — fetches all videos, titles, and durations via YouTube Data API v3 |
| 🎯 **Goal Setting** | Set a completion target (e.g. 14 days) — app calculates required daily watch time |
| ✅ **Video Tracking** | Mark videos as watched one-by-one; progress updates instantly |
| ⏱️ **Time Logger** | Log daily minutes watched manually; synced to the heatmap |
| 🟩 **Activity Heatmap** | GitHub-style pastel heatmap showing your watch activity over the past year |
| 📊 **Dashboard** | At-a-glance metrics: % complete, hours watched, remaining, daily goal |
| 📈 **Smart Forecast** | Dynamically recalculates completion date based on real pace |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** with custom "Ethereal Academic" design system
- **TypeScript**
- Fonts: Manrope (headlines) + Inter (body)

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2** + **Alembic** (ORM + migrations)
- **SQLite** (dev) / **PostgreSQL** (production)
- **httpx** for async YouTube Data API v3 calls
- **Pydantic v2** for all request/response validation

### Monorepo
- **pnpm** workspaces + **Turborepo**
- `apps/web` — Next.js frontend
- `apps/api` — FastAPI backend
- `packages/shared-types` — shared TypeScript types
- `packages/ui` — shared React components

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 10+
- Python 3.11+
- [uv](https://astral.sh/uv) (Python package manager)
- YouTube Data API v3 key ([get one free](https://console.cloud.google.com))

### 1. Clone & install

```bash
git clone https://github.com/your-username/watchstreak.git
cd watchstreak
pnpm install
```

### 2. Configure environment

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env` and add your YouTube API key:
```env
YOUTUBE_API_KEY=AIza...your_key_here
```

### 3. Install Python dependencies & run migrations

```bash
cd apps/api
uv sync
uv run alembic upgrade head
cd ../..
```

### 4. Start dev servers

Open **two terminals**:

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd apps/api
uv run uvicorn app.main:app --reload

# Terminal 2 — Frontend (http://localhost:3000)
pnpm turbo run dev --filter=web
```

Visit `http://localhost:3000` and paste a YouTube playlist URL to get started.

---

## 📁 Project Structure

```
watchstreak/
├── apps/
│   ├── api/                        # FastAPI backend
│   │   ├── alembic/                # Database migrations
│   │   │   └── versions/           # Migration files
│   │   └── app/
│   │       ├── api/
│   │       │   └── routes/
│   │       │       ├── courses.py  # POST /courses, GET /courses, GET /courses/{id}
│   │       │       ├── videos.py   # PATCH /videos/{id}/watch
│   │       │       ├── logs.py     # POST /logs, GET /logs
│   │       │       ├── health.py   # GET /health
│   │       │       └── memory.py   # Agent memory endpoints
│   │       ├── core/
│   │       │   ├── config.py       # Settings (Pydantic, reads .env)
│   │       │   ├── database.py     # SQLAlchemy engine + session
│   │       │   └── logging.py      # Structured logging
│   │       ├── models/
│   │       │   └── watchstreak.py  # Course, Video, DailyLog ORM models
│   │       ├── schemas/
│   │       │   └── watchstreak.py  # Pydantic request/response schemas
│   │       └── services/
│   │           └── youtube.py      # YouTube Data API v3 client
│   │
│   └── web/                        # Next.js frontend
│       └── src/
│           ├── app/
│           │   ├── layout.tsx       # Root layout (Nav, fonts, mobile nav)
│           │   ├── globals.css      # Design system (Tailwind @theme tokens)
│           │   ├── page.tsx         # Landing page — playlist import
│           │   ├── dashboard/
│           │   │   └── page.tsx     # Dashboard — metrics, heatmap
│           │   └── courses/
│           │       ├── page.tsx     # My Courses list
│           │       └── [id]/
│           │           └── page.tsx # Course detail — video list, tracking
│           ├── components/
│           │   ├── Nav.tsx          # Glass navigation bar
│           │   └── Heatmap.tsx      # Activity heatmap component
│           └── lib/
│               └── api.ts           # Typed API client
│
├── packages/
│   ├── shared-types/               # Auto-generated TypeScript types
│   └── ui/                         # Shared React components
│
├── skills/                         # Bash automation scripts
├── docs/                           # Extended documentation
├── stitch/                         # Original design assets (Figma export)
├── docker-compose.yml              # PostgreSQL + API stack
├── Makefile                        # Dev shortcuts
└── turbo.json                      # Turborepo pipeline
```

---

## 🔌 API Reference

Base URL: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courses/preview?url=...` | Fetch playlist metadata without saving |
| `POST` | `/courses` | Import playlist → create course |
| `GET` | `/courses` | List all courses with progress stats |
| `GET` | `/courses/{id}` | Course detail with all videos |
| `GET` | `/courses/{id}/heatmap` | Daily log data for heatmap |

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH` | `/videos/{id}/watch` | Toggle watched state |

### Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/logs` | Log minutes watched (upserts by date) |
| `GET` | `/logs?course_id=...` | List all logs for a course |

### Example — Import a playlist

```bash
curl -X POST http://localhost:8000/courses \
  -H "Content-Type: application/json" \
  -d '{"playlist_url": "https://youtube.com/playlist?list=PLxxxx", "target_days": 14}'
```

---

## 🎨 Design System

WatchStreak uses the **"Ethereal Academic"** design language:

- **No borders** — depth is created through background color shifts, not lines
- **Glassmorphism** nav with `backdrop-filter: blur(20px)`
- **Pastel palette** — soft blues, mints, and lavenders; never pure black
- **Heatmap** — stepped pastel mint gradient (5 levels) instead of harsh greens
- **Typography** — Manrope (editorial headlines) + Inter (functional body text)

All 40+ color tokens are defined as Tailwind v4 CSS variables in `globals.css`.

---

## ⚙️ Environment Variables

### `apps/api/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./dev.db` | Database connection string |
| `YOUTUBE_API_KEY` | *(required)* | YouTube Data API v3 key |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Allowed frontend origins |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DEBUG` | `false` | Enable SQLAlchemy query logging |

### `apps/web/.env.local`

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend URL |

---

## 🗄️ Database

WatchStreak uses SQLite for local development and PostgreSQL for production.

### Models

**Course** — A YouTube playlist imported as a course
```
id, playlist_url, playlist_id, title, channel, thumbnail_url,
total_videos, total_duration_seconds, target_days, created_at
```

**Video** — Individual video within a course
```
id, course_id, youtube_id, title, duration_seconds, position, watched, watched_at
```

**DailyLog** — Time logged per day per course (for heatmap)
```
id, course_id, log_date, minutes_watched, created_at
```

### Migrations

```bash
# Generate a new migration after model changes
cd apps/api
uv run alembic revision --autogenerate -m "description"

# Apply all pending migrations
uv run alembic upgrade head

# Roll back one migration
uv run alembic downgrade -1
```

---

## 🐳 Docker (Production-like)

```bash
# Start API + PostgreSQL
docker compose up

# Apply migrations inside the container
docker compose exec api uv run alembic upgrade head
```

Switch the database in `apps/api/.env`:
```env
DATABASE_URL=postgresql+psycopg2://monorepo:monorepo@localhost:5432/monorepo
```

---

## 🔑 Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **APIs & Services → Library**
4. Search for **"YouTube Data API v3"** → Enable
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key into `apps/api/.env`

> **Free quota:** 10,000 units/day. Importing one playlist costs ~3–5 units.

---

## 🧰 Useful Commands

```bash
# Install all dependencies
pnpm install

# Start frontend only
pnpm turbo run dev --filter=web

# Start backend only (from apps/api/)
uv run uvicorn app.main:app --reload

# Run DB migrations
cd apps/api && uv run alembic upgrade head

# Lint everything
pnpm run lint

# Build for production
pnpm run build
```

---

## 🗺️ Roadmap

- [ ] User authentication (NextAuth.js)
- [ ] Auto-sync with YouTube watch history
- [ ] Browser extension for automatic tracking
- [ ] Mobile app (React Native)
- [ ] AI-generated video summaries
- [ ] Smart reminders / push notifications
- [ ] Gamification (badges, streak rewards)
- [ ] Social features (share progress)

---

## 📄 License

MIT — feel free to use, fork, and build on this.

---

Built with ❤️ using the [AgentOptimisedMonorepo](https://github.com/whyujjwal/AgentOptimisedMonorepo) template.
#   w a t c h s t r e a k  
 