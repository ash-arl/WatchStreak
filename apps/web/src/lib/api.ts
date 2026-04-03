/**
 * WatchStreak API client — thin wrapper around fetch.
 * All types mirror the FastAPI Pydantic schemas.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VideoOut {
  id: string;
  youtube_id: string;
  title: string;
  duration_seconds: number;
  position: number;
  watched: boolean;
  watched_at: string | null;
}

export interface CourseOut {
  id: string;
  playlist_url: string;
  playlist_id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
  total_videos: number;
  total_duration_seconds: number;
  target_days: number;
  created_at: string;
  watched_videos: number;
  watched_seconds: number;
  completion_pct: number;
  daily_goal_minutes: number;
}

export interface CourseDetail extends CourseOut {
  videos: VideoOut[];
}

export interface PlaylistPreview {
  playlist_id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
  total_videos: number;
  total_duration_seconds: number;
}

export interface DailyLogOut {
  id: string;
  course_id: string;
  log_date: string;
  minutes_watched: number;
  created_at: string;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
}

// ── Course API ────────────────────────────────────────────────────────────────

export const api = {
  courses: {
    preview: (url: string) =>
      request<PlaylistPreview>(`/courses/preview?url=${encodeURIComponent(url)}`),

    create: (playlist_url: string, target_days: number) =>
      request<CourseOut>("/courses", {
        method: "POST",
        body: JSON.stringify({ playlist_url, target_days }),
      }),

    list: () => request<CourseOut[]>("/courses"),

    get: (id: string) => request<CourseDetail>(`/courses/${id}`),

    heatmap: (id: string) => request<HeatmapDay[]>(`/courses/${id}/heatmap`),
  },

  videos: {
    toggleWatch: (id: string, watched: boolean) =>
      request<VideoOut>(`/videos/${id}/watch`, {
        method: "PATCH",
        body: JSON.stringify({ watched }),
      }),
  },

  logs: {
    create: (course_id: string, log_date: string, minutes_watched: number) =>
      request<DailyLogOut>("/logs", {
        method: "POST",
        body: JSON.stringify({ course_id, log_date, minutes_watched }),
      }),

    list: (course_id: string) =>
      request<DailyLogOut[]>(`/logs?course_id=${course_id}`),
  },
};

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
