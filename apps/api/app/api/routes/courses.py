"""Course routes — import playlist, list, get detail."""

from __future__ import annotations

import math
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.logging import get_logger
from app.models.watchstreak import Course, DailyLog, Video
from app.schemas.watchstreak import (
    CourseCreate,
    CourseDetail,
    CourseOut,
    HeatmapDay,
    PlaylistPreview,
)
from app.services.youtube import extract_playlist_id, fetch_playlist

router = APIRouter(prefix="/courses", tags=["courses"])
logger = get_logger(__name__)


def _enrich(course: Course) -> dict:
    """Add computed fields to a course ORM object."""
    watched = [v for v in course.videos if v.watched]
    watched_secs = sum(v.duration_seconds for v in watched)
    total_secs = course.total_duration_seconds or 1
    pct = round((watched_secs / total_secs) * 100, 1)
    remaining_secs = max(total_secs - watched_secs, 0)
    daily_goal = math.ceil(remaining_secs / 60 / max(course.target_days, 1))

    return {
        "watched_videos": len(watched),
        "watched_seconds": watched_secs,
        "completion_pct": pct,
        "daily_goal_minutes": daily_goal,
    }


# ── Preview (no DB write) ─────────────────────────────────────────────────────

@router.get("/preview", response_model=PlaylistPreview)
async def preview_playlist(url: str):
    """Fetch playlist metadata from YouTube without saving to DB."""
    playlist_id = extract_playlist_id(url)
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube playlist URL")

    try:
        meta = await fetch_playlist(playlist_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return PlaylistPreview(
        playlist_id=meta["playlist_id"],
        title=meta["title"],
        channel=meta["channel"],
        thumbnail_url=meta["thumbnail_url"],
        total_videos=meta["total_videos"],
        total_duration_seconds=meta["total_duration_seconds"],
    )


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
async def create_course(body: CourseCreate, db: Session = Depends(get_db)):
    """Import a YouTube playlist as a new course."""
    playlist_id = extract_playlist_id(body.playlist_url)
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube playlist URL")

    try:
        meta = await fetch_playlist(playlist_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    course = Course(
        playlist_url=body.playlist_url,
        playlist_id=meta["playlist_id"],
        title=meta["title"],
        channel=meta["channel"],
        thumbnail_url=meta["thumbnail_url"],
        total_videos=meta["total_videos"],
        total_duration_seconds=meta["total_duration_seconds"],
        target_days=body.target_days,
    )
    db.add(course)
    db.flush()  # get course.id

    for v in meta["videos"]:
        db.add(
            Video(
                course_id=course.id,
                youtube_id=v["youtube_id"],
                title=v["title"],
                duration_seconds=v["duration_seconds"],
                position=v["position"],
            )
        )

    db.commit()
    db.refresh(course)

    enriched = _enrich(course)
    return CourseOut.model_validate({**course.__dict__, **enriched})


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db)):
    """Return all courses with computed progress stats."""
    courses = db.execute(
        select(Course).options(selectinload(Course.videos))
    ).scalars().all()

    result = []
    for c in courses:
        enriched = _enrich(c)
        result.append(CourseOut.model_validate({**c.__dict__, **enriched}))
    return result


# ── Detail ────────────────────────────────────────────────────────────────────

@router.get("/{course_id}", response_model=CourseDetail)
def get_course(course_id: str, db: Session = Depends(get_db)):
    """Return course detail including all videos."""
    course = db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.videos))
    ).scalar_one_or_none()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enriched = _enrich(course)
    return CourseDetail.model_validate({**course.__dict__, **enriched})


# ── Heatmap ───────────────────────────────────────────────────────────────────

@router.get("/{course_id}/heatmap", response_model=list[HeatmapDay])
def get_heatmap(course_id: str, db: Session = Depends(get_db)):
    """Return daily log data for heatmap rendering."""
    logs = db.execute(
        select(DailyLog).where(DailyLog.course_id == course_id)
    ).scalars().all()

    return [HeatmapDay(date=log.log_date, minutes=log.minutes_watched) for log in logs]
