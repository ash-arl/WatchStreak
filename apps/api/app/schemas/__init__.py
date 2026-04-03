"""Pydantic request/response schemas.

These are the source of truth for the OpenAPI spec and shared-types generation.
"""

from app.schemas.health import HealthResponse
from app.schemas.memory import (
    MemoryAddRequest,
    MemoryAddResponse,
    MemorySearchRequest,
    MemorySearchResponse,
    MemorySearchResult,
)
from app.schemas.watchstreak import (
    CourseCreate,
    CourseOut,
    CourseDetail,
    VideoOut,
    VideoWatchToggle,
    DailyLogCreate,
    DailyLogOut,
    HeatmapDay,
    PlaylistPreview,
)

__all__ = [
    "HealthResponse",
    "MemoryAddRequest",
    "MemoryAddResponse",
    "MemorySearchRequest",
    "MemorySearchResponse",
    "MemorySearchResult",
    "CourseCreate",
    "CourseOut",
    "CourseDetail",
    "VideoOut",
    "VideoWatchToggle",
    "DailyLogCreate",
    "DailyLogOut",
    "HeatmapDay",
    "PlaylistPreview",
]
