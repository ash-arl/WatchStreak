# WatchStreak

Turn YouTube playlists into structured, trackable courses.

---

## What it does

Paste a YouTube playlist URL and WatchStreak turns it into a learning plan with daily watch targets, video-by-video progress tracking, and an activity heatmap.

---

## Stack

**Frontend** — Next.js 16, React 19, Tailwind CSS v4, TypeScript

**Backend** — FastAPI, SQLAlchemy 2, Alembic, SQLite (dev) / PostgreSQL (prod)

**External** — YouTube Data API v3

---

## Setup

### Requirements

- Node.js 20+, pnpm 10+
- Python 3.11+, [uv](https://astral.sh/uv)
- YouTube Data API v3 key ([get one free](https://console.cloud.google.com))

### Install

```bash
git clone https://github.com/your-username/watchstreak.git
cd watchstreak
pnpm install
```

### Configure

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Add your key to `apps/api/.env`:

```env
YOUTUBE_API_KEY=your_key_here
```

### Database

```bash
cd apps/api
uv sync
uv run alembic upgrade head
cd ../..
```

### Run

```bash
# Terminal 1 — backend (http://localhost:8000)
cd apps/api && uv run uvicorn app.main:app --reload

# Terminal 2 — frontend (http://localhost:3000)
pnpm turbo run dev --filter=web
```

---

## API

Interactive docs at `http://localhost:8000/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses/preview?url=` | Preview playlist before importing |
| POST | `/courses` | Import playlist as a course |
| GET | `/courses` | List all courses |
| GET | `/courses/{id}` | Course detail with videos |
| GET | `/courses/{id}/heatmap` | Daily activity data |
| PATCH | `/videos/{id}/watch` | Toggle video watched |
| POST | `/logs` | Log minutes watched |

---

## Project structure

```
apps/
  api/          FastAPI backend
  web/          Next.js frontend
packages/
  shared-types/ TypeScript types
  ui/           Shared components
docs/           Documentation
```

---

## License

MIT
