"""YouTube Data API v3 service — fetch playlist metadata."""

import re
from typing import TypedDict

import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

YT_API = "https://www.googleapis.com/youtube/v3"


# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_playlist_id(url: str) -> str | None:
    """Extract playlist ID from any YouTube playlist URL format."""
    patterns = [
        r"[?&]list=([A-Za-z0-9_-]+)",
    ]
    for pattern in patterns:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    # If it looks like a raw playlist ID already
    if re.fullmatch(r"[A-Za-z0-9_-]{10,}", url):
        return url
    return None


def _parse_duration(iso: str) -> int:
    """Parse ISO 8601 duration string (PT1H2M3S) → total seconds."""
    m = re.match(
        r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?",
        iso or "",
    )
    if not m:
        return 0
    h = int(m.group(1) or 0)
    mi = int(m.group(2) or 0)
    s = int(m.group(3) or 0)
    return h * 3600 + mi * 60 + s


# ── Typed dicts ───────────────────────────────────────────────────────────────

class VideoMeta(TypedDict):
    youtube_id: str
    title: str
    duration_seconds: int
    position: int


class PlaylistMeta(TypedDict):
    playlist_id: str
    title: str
    channel: str
    thumbnail_url: str
    total_videos: int
    total_duration_seconds: int
    videos: list[VideoMeta]


# ── API calls ─────────────────────────────────────────────────────────────────

async def fetch_playlist(playlist_id: str) -> PlaylistMeta:
    """Fetch full playlist metadata + all video durations from YouTube API."""
    if not settings.YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        # 1. Playlist info
        pl_resp = await client.get(
            f"{YT_API}/playlists",
            params={
                "part": "snippet,contentDetails",
                "id": playlist_id,
                "key": settings.YOUTUBE_API_KEY,
            },
        )
        pl_resp.raise_for_status()
        pl_data = pl_resp.json()

        if not pl_data.get("items"):
            raise ValueError(f"Playlist not found: {playlist_id}")

        pl_item = pl_data["items"][0]
        snippet = pl_item["snippet"]
        title = snippet["title"]
        channel = snippet.get("channelTitle", "")
        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = (
            thumbnails.get("high", thumbnails.get("default", {})).get("url", "")
        )

        # 2. Collect all video IDs (paginated)
        video_ids: list[str] = []
        positions: dict[str, int] = {}
        page_token: str | None = None

        while True:
            params: dict = {
                "part": "snippet,contentDetails",
                "playlistId": playlist_id,
                "maxResults": 50,
                "key": settings.YOUTUBE_API_KEY,
            }
            if page_token:
                params["pageToken"] = page_token

            items_resp = await client.get(f"{YT_API}/playlistItems", params=params)
            items_resp.raise_for_status()
            items_data = items_resp.json()

            for item in items_data.get("items", []):
                vid_id = item["snippet"]["resourceId"]["videoId"]
                pos = item["snippet"]["position"]
                video_ids.append(vid_id)
                positions[vid_id] = pos

            page_token = items_data.get("nextPageToken")
            if not page_token:
                break

        # 3. Fetch durations in batches of 50
        durations: dict[str, int] = {}
        titles: dict[str, str] = {}

        for i in range(0, len(video_ids), 50):
            batch = video_ids[i : i + 50]
            vid_resp = await client.get(
                f"{YT_API}/videos",
                params={
                    "part": "contentDetails,snippet",
                    "id": ",".join(batch),
                    "key": settings.YOUTUBE_API_KEY,
                },
            )
            vid_resp.raise_for_status()
            for v in vid_resp.json().get("items", []):
                vid_id = v["id"]
                durations[vid_id] = _parse_duration(
                    v["contentDetails"].get("duration", "PT0S")
                )
                titles[vid_id] = v["snippet"]["title"]

        # 4. Assemble
        videos: list[VideoMeta] = [
            {
                "youtube_id": vid_id,
                "title": titles.get(vid_id, "Unknown"),
                "duration_seconds": durations.get(vid_id, 0),
                "position": positions.get(vid_id, idx),
            }
            for idx, vid_id in enumerate(video_ids)
        ]

        total_duration = sum(v["duration_seconds"] for v in videos)

        logger.info(
            "playlist fetched",
            playlist_id=playlist_id,
            videos=len(videos),
            total_seconds=total_duration,
        )

        return {
            "playlist_id": playlist_id,
            "title": title,
            "channel": channel,
            "thumbnail_url": thumbnail_url,
            "total_videos": len(videos),
            "total_duration_seconds": total_duration,
            "videos": videos,
        }
