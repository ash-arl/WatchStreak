"""Pydantic schemas for WatchStreak — Course, Video, DailyLog."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, HttpUrl


# ── Course ────────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    playlist_url: str
    target_days: int = 30


class VideoOut(BaseModel):
    id: str
    youtube_id: str
    title: str
    duration_seconds: int
    position: int
    watched: bool
    watched_at: datetime | None

    model_config = {"from_attributes": True}


class CourseOut(BaseModel):
    id: str
    playlist_url: str
    playlist_id: str
    title: str
    channel: str
    thumbnail_url: str
    total_videos: int
    total_duration_seconds: int
    target_days: int
    created_at: datetime

    # Computed helpers (populated by route)
    watched_videos: int = 0
    watched_seconds: int = 0
    completion_pct: float = 0.0
    daily_goal_minutes: int = 0

    model_config = {"from_attributes": True}


class CourseDetail(CourseOut):
    videos: list[VideoOut] = []


# ── Video ─────────────────────────────────────────────────────────────────────

class VideoWatchToggle(BaseModel):
    watched: bool


# ── Daily Log ─────────────────────────────────────────────────────────────────

class DailyLogCreate(BaseModel):
    course_id: str
    log_date: date
    minutes_watched: int


class DailyLogOut(BaseModel):
    id: str
    course_id: str
    log_date: date
    minutes_watched: int
    created_at: datetime

    model_config = {"from_attributes": True}


class HeatmapDay(BaseModel):
    date: date
    minutes: int


# ── YouTube Import ────────────────────────────────────────────────────────────

class PlaylistPreview(BaseModel):
    playlist_id: str
    title: str
    channel: str
    thumbnail_url: str
    total_videos: int
    total_duration_seconds: int
