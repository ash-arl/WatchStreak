"""WatchStreak ORM models — Course, Video, DailyLog."""

import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    playlist_url: Mapped[str] = mapped_column(String, nullable=False)
    playlist_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    channel: Mapped[str] = mapped_column(String, nullable=False, default="")
    thumbnail_url: Mapped[str] = mapped_column(String, nullable=False, default="")
    total_videos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    target_days: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    videos: Mapped[list["Video"]] = relationship(
        "Video", back_populates="course", order_by="Video.position", cascade="all, delete-orphan"
    )
    daily_logs: Mapped[list["DailyLog"]] = relationship(
        "DailyLog", back_populates="course", cascade="all, delete-orphan"
    )


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("courses.id"), nullable=False)
    youtube_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    watched: Mapped[bool] = mapped_column(Boolean, default=False)
    watched_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="videos")


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("courses.id"), nullable=False)
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    minutes_watched: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    course: Mapped["Course"] = relationship("Course", back_populates="daily_logs")
