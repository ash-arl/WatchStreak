"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, formatDuration, type CourseDetail, type VideoOut } from "@/lib/api";

function groupBySection(videos: VideoOut[]): [string, VideoOut[]][] {
  // Group every 5 videos as a pseudo-section since YouTube doesn't provide sections
  const groups: [string, VideoOut[]][] = [];
  const chunkSize = 5;
  for (let i = 0; i < videos.length; i += chunkSize) {
    const chunk = videos.slice(i, i + chunkSize);
    groups.push([`Part ${Math.floor(i / chunkSize) + 1}`, chunk]);
  }
  return groups;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logMinutes, setLogMinutes] = useState("");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    api.courses.get(id)
      .then(setCourse)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleWatch(video: VideoOut) {
    try {
      const updated = await api.videos.toggleWatch(video.id, !video.watched);
      setCourse((prev) => {
        if (!prev) return prev;
        const videos = prev.videos.map((v) => (v.id === updated.id ? updated : v));
        const watchedVideos = videos.filter((v) => v.watched).length;
        const watchedSeconds = videos.filter((v) => v.watched).reduce((s, v) => s + v.duration_seconds, 0);
        const completion_pct = Math.round((watchedSeconds / (prev.total_duration_seconds || 1)) * 1000) / 10;
        return { ...prev, videos, watched_videos: watchedVideos, watched_seconds: watchedSeconds, completion_pct };
      });
    } catch (e) {
      console.error("Failed to toggle watch", e);
    }
  }

  async function logTime() {
    if (!course || !logMinutes) return;
    setLogging(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.logs.create(course.id, today, Number(logMinutes));
      setLogMinutes("");
    } catch (e) {
      console.error("Failed to log time", e);
    } finally {
      setLogging(false);
    }
  }

  if (loading) return (
    <main className="pt-28 pb-28 px-6 md:px-12 max-w-5xl mx-auto flex items-center justify-center py-24">
      <span className="material-symbols-outlined animate-spin text-primary mr-2">progress_activity</span>
      <span className="text-on-surface-variant font-label">Loading course…</span>
    </main>
  );

  if (error || !course) return (
    <main className="pt-28 pb-28 px-6 md:px-12 max-w-5xl mx-auto text-center py-24">
      <p className="text-error font-label mb-4">{error || "Course not found"}</p>
      <Link href="/courses" className="text-primary text-sm underline">← Back to courses</Link>
    </main>
  );

  const sections = groupBySection(course.videos);
  const remainingSeconds = Math.max(course.total_duration_seconds - course.watched_seconds, 0);

  return (
    <main className="pt-28 pb-28 px-6 md:px-12 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-on-surface-variant font-label mb-8">
        <Link href="/courses" className="hover:text-primary transition-colors">My Courses</Link>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className="text-on-surface line-clamp-1">{course.title}</span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-2">{course.channel}</p>
        <h1 className="text-3xl md:text-4xl font-light tracking-tight text-on-surface font-headline mb-6 leading-snug">
          {course.title}
        </h1>
        <div className="h-2 w-full bg-primary-container/20 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${course.completion_pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs font-label text-on-surface-variant">
          <span>{course.watched_videos} of {course.total_videos} videos watched</span>
          <span className="text-primary font-bold">{course.completion_pct}% complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video list */}
        <div className="lg:col-span-2 space-y-8">
          {sections.map(([section, vids]) => (
            <div key={section}>
              <h2 className="text-xs font-label font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                {section}
              </h2>
              <div className="space-y-2">
                {vids.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleWatch(v)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all group ${
                      v.watched
                        ? "bg-surface-container-low hover:bg-surface-container"
                        : "bg-surface-container-lowest ring-1 ring-outline-variant/10 hover:ring-outline-variant/30 hover:shadow-ambient"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl shrink-0 transition-colors ${
                      v.watched ? "text-secondary" : "text-outline group-hover:text-primary"
                    }`}>
                      {v.watched ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug transition-colors ${
                        v.watched ? "line-through text-on-surface-variant" : "text-on-surface group-hover:text-primary"
                      }`}>
                        {v.title}
                      </p>
                    </div>
                    <span className="text-xs text-on-surface-variant font-label shrink-0">
                      {formatDuration(v.duration_seconds)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ring-1 ring-outline-variant/10">
            <h3 className="text-sm font-medium text-on-surface font-headline mb-5">Course Stats</h3>
            <div className="space-y-4">
              {[
                { icon: "schedule", label: "Total", value: formatDuration(course.total_duration_seconds) },
                { icon: "done_all", label: "Watched", value: formatDuration(course.watched_seconds) },
                { icon: "hourglass_bottom", label: "Remaining", value: formatDuration(remainingSeconds) },
                { icon: "calendar_today", label: "Goal", value: `${course.target_days} days` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    <span className="text-xs font-label">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily goal + log time */}
          <div className="bg-surface-container-lowest rounded-xl p-6 ring-1 ring-outline-variant/10">
            <h3 className="text-sm font-medium text-on-surface font-headline mb-2">Daily Goal</h3>
            <p className="text-3xl font-light text-primary font-headline mb-1">{course.daily_goal_minutes} min</p>
            <p className="text-xs text-on-surface-variant font-label mb-5">needed per day to finish on time</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={logMinutes}
                onChange={(e) => setLogMinutes(e.target.value)}
                placeholder="Minutes watched"
                className="flex-1 bg-surface-container-low rounded-full px-4 py-2.5 text-sm outline-none text-on-surface placeholder:text-outline font-label border-none"
              />
              <button
                onClick={logTime}
                disabled={logging || !logMinutes}
                className="px-4 py-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium whitespace-nowrap hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                {logging ? "…" : "Log"}
              </button>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-secondary-container/40 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-base">event_available</span>
              <h3 className="text-sm font-medium text-on-secondary-container font-headline">Forecast</h3>
            </div>
            <p className="text-xs text-on-secondary-fixed-variant font-label leading-relaxed">
              Watch <span className="font-semibold text-secondary">{course.daily_goal_minutes} min/day</span> to finish within your {course.target_days}-day goal.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
