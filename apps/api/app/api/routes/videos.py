"""Video routes — toggle watched state."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.watchstreak import Video
from app.schemas.watchstreak import VideoOut, VideoWatchToggle

router = APIRouter(prefix="/videos", tags=["videos"])


@router.patch("/{video_id}/watch", response_model=VideoOut)
def toggle_watch(video_id: str, body: VideoWatchToggle, db: Session = Depends(get_db)):
    """Mark a video as watched or unwatched."""
    video = db.execute(
        select(Video).where(Video.id == video_id)
    ).scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    video.watched = body.watched
    video.watched_at = datetime.now(timezone.utc) if body.watched else None
    db.commit()
    db.refresh(video)
    return VideoOut.model_validate(video)
