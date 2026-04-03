# Environment Variables

## Backend — `apps/api/.env`

Copy from `apps/api/.env.example`.

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `YOUTUBE_API_KEY` | *(empty)* | **Yes** | YouTube Data API v3 key. Get one at [console.cloud.google.com](https://console.cloud.google.com) |
| `DATABASE_URL` | `sqlite:///./dev.db` | No | SQLAlchemy connection string. Use SQLite for dev, PostgreSQL for production |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | No | Comma-separated list of allowed frontend origins |
| `APP_NAME` | `WatchStreak API` | No | Displayed in Swagger UI |
| `APP_VERSION` | `0.1.0` | No | Displayed in Swagger UI |
| `DEBUG` | `false` | No | Set `true` to enable SQLAlchemy query logging |
| `LOG_LEVEL` | `INFO` | No | Logging threshold: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_JSON` | `false` | No | Set `true` in production for structured JSON log output |
| `MEMORY_DB_PATH` | `.data/chromadb` | No | Path for ChromaDB vector store (agent memory feature) |

### Full example `.env`

```env
# YouTube
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Database (SQLite for dev)
DATABASE_URL=sqlite:///./dev.db

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# App
APP_NAME=WatchStreak API
APP_VERSION=0.1.0
DEBUG=false

# Logging
LOG_LEVEL=INFO
LOG_JSON=false
```

---

## Frontend — `apps/web/.env.local`

Copy from `apps/web/.env.example`.

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | No | Base URL of the FastAPI backend |

### Full example `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Docker Compose — `.env` (repo root)

Copy from `.env.example` at the repo root. Used when running the stack with `docker compose up`.

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `monorepo` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `monorepo` | PostgreSQL password |
| `POSTGRES_DB` | `monorepo` | PostgreSQL database name |
| `LOG_LEVEL` | `INFO` | API log level inside Docker |
| `DEBUG` | `false` | API debug mode inside Docker |

---

## Production DATABASE_URL

### PostgreSQL (recommended for production)

```env
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
```

### Docker Compose PostgreSQL

```env
DATABASE_URL=postgresql+psycopg2://monorepo:monorepo@localhost:5432/monorepo
```

---

## Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **APIs & Services → Library**
4. Search for **"YouTube Data API v3"** → click Enable
5. Go to **APIs & Services → Credentials**
6. Click **Create Credentials → API Key**
7. Copy the key and paste it into `apps/api/.env`

### Free Quota

The YouTube Data API gives you **10,000 units per day** for free.

| Operation | Cost |
|-----------|------|
| Fetch playlist info | ~1 unit |
| Fetch playlist items (per page of 50) | ~1 unit |
| Fetch video details (per page of 50) | ~1 unit |
| **Total per playlist import** | **~3–5 units** |

You can import ~2,000–3,000 playlists per day before hitting the free quota.
