# Backend — FastAPI

The backend is a **FastAPI** application using Python 3.11+, SQLAlchemy 2, and Alembic.

## Stack

| Library | Purpose |
|---------|---------|
| `fastapi` | HTTP framework, auto OpenAPI docs |
| `pydantic v2` | Request/response validation, settings |
| `sqlalchemy 2.0` | ORM for relational data |
| `alembic` | Schema migrations |
| `httpx` | Async YouTube Data API v3 client |
| `uvicorn` | ASGI server |
| `chromadb` | Local vector DB (agent memory) |

## Running the Backend

```bash
cd apps/api
cp .env.example .env          # first time only — then add YOUTUBE_API_KEY
uv sync                        # install dependencies
uv run alembic upgrade head    # create/update tables
uv run uvicorn app.main:app --reload
```

API: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`

## Project Structure

```
apps/api/app/
├── main.py               FastAPI app, CORS middleware, lifespan
├── api/
│   └── routes/
│       ├── __init__.py   Registers all routers into api_router
│       ├── courses.py    POST/GET /courses, GET /courses/{id}/heatmap
│       ├── videos.py     PATCH /videos/{id}/watch
│       ├── logs.py       POST/GET /logs
│       ├── health.py     GET /health
│       └── memory.py     Agent memory endpoints
├── core/
│   ├── config.py         Pydantic Settings — reads .env
│   ├── database.py       SQLAlchemy engine + get_db dependency
│   └── logging.py        Structured logger (JSON in prod)
├── models/
│   ├── example.py        Template example model
│   └── watchstreak.py    Course, Video, DailyLog ORM models
├── schemas/
│   ├── health.py         HealthResponse
│   ├── memory.py         Memory schemas
│   └── watchstreak.py    CourseCreate/Out/Detail, VideoOut, DailyLogOut, etc.
└── services/
    ├── memory.py         ChromaDB agent memory
    └── youtube.py        YouTube Data API v3 client
```

## Data Models

### Course
```python
class Course(Base):
    id: str                    # UUID
    playlist_url: str
    playlist_id: str           # YouTube playlist ID (e.g. PLxxxx)
    title: str
    channel: str
    thumbnail_url: str
    total_videos: int
    total_duration_seconds: int
    target_days: int
    created_at: datetime
```

### Video
```python
class Video(Base):
    id: str                    # UUID
    course_id: str             # FK → courses.id
    youtube_id: str            # YouTube video ID
    title: str
    duration_seconds: int
    position: int              # Order in playlist
    watched: bool
    watched_at: datetime | None
```

### DailyLog
```python
class DailyLog(Base):
    id: str                    # UUID
    course_id: str             # FK → courses.id
    log_date: date
    minutes_watched: int       # Accumulated per day (upsert)
    created_at: datetime
```

## API Endpoints

### Courses

```
GET  /courses/preview?url=<youtube_url>
     → PlaylistPreview (no DB write)

POST /courses
     Body: { playlist_url, target_days }
     → CourseOut (201 Created)

GET  /courses
     → list[CourseOut] (with computed progress fields)

GET  /courses/{id}
     → CourseDetail (includes videos list)

GET  /courses/{id}/heatmap
     → list[HeatmapDay] { date, minutes }
```

### Videos

```
PATCH /videos/{id}/watch
      Body: { watched: bool }
      → VideoOut
```

### Logs

```
POST /logs
     Body: { course_id, log_date, minutes_watched }
     → DailyLogOut (upserts — adds minutes if date exists)

GET  /logs?course_id={id}
     → list[DailyLogOut]
```

## YouTube Service

`app/services/youtube.py` handles all YouTube Data API v3 communication.

**Key functions:**

- `extract_playlist_id(url)` — Regex extracts playlist ID from any YouTube URL format
- `_parse_duration(iso)` — Converts `PT1H23M45S` → total seconds
- `fetch_playlist(playlist_id)` — Async function that:
  1. Fetches playlist info (`/playlists`)
  2. Paginates through all video IDs (`/playlistItems`, 50 per page)
  3. Batch-fetches video details including durations (`/videos`, 50 per request)
  4. Returns a `PlaylistMeta` TypedDict with everything needed

## Configuration

All config is in `app/core/config.py` using Pydantic Settings. Access it anywhere:

```python
from app.core.config import settings

settings.DATABASE_URL
settings.YOUTUBE_API_KEY
settings.CORS_ORIGINS
settings.DEBUG
```

## Adding a New Endpoint

1. **Create schema** in `app/schemas/watchstreak.py`
2. **Add to** `app/schemas/__init__.py`
3. **Write route** in `app/api/routes/<name>.py`
4. **Register** in `app/api/routes/__init__.py`
5. If new model: **add to** `app/models/__init__.py`, then run migration

## Migrations

```bash
# After changing any ORM model:
cd apps/api
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head

# Roll back:
uv run alembic downgrade -1
```
