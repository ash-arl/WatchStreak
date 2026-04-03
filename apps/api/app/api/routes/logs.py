"""Daily log routes — log watch time, get heatmap data."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.watchstreak import DailyLog
from app.schemas.watchstreak import DailyLogCreate, DailyLogOut

router = APIRouter(prefix="/logs", tags=["logs"])


@router.post("", response_model=DailyLogOut, status_code=status.HTTP_201_CREATED)
def create_log(body: DailyLogCreate, db: Session = Depends(get_db)):
    """Log minutes watched for a course on a given date.
    If a log already exists for that date, it is updated (upsert).
    """
    existing = db.execute(
        select(DailyLog).where(
            DailyLog.course_id == body.course_id,
            DailyLog.log_date == body.log_date,
        )
    ).scalar_one_or_none()

    if existing:
        existing.minutes_watched += body.minutes_watched
        db.commit()
        db.refresh(existing)
        return DailyLogOut.model_validate(existing)

    log = DailyLog(
        course_id=body.course_id,
        log_date=body.log_date,
        minutes_watched=body.minutes_watched,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return DailyLogOut.model_validate(log)


@router.get("", response_model=list[DailyLogOut])
def list_logs(course_id: str, db: Session = Depends(get_db)):
    """Return all daily logs for a course (for heatmap rendering)."""
    logs = db.execute(
        select(DailyLog)
        .where(DailyLog.course_id == course_id)
        .order_by(DailyLog.log_date)
    ).scalars().all()

    return [DailyLogOut.model_validate(log) for log in logs]
