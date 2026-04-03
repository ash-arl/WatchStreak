"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Heatmap from "@/components/Heatmap";
import { api, formatDuration, type CourseOut, type HeatmapDay } from "@/lib/api";

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.courses.list().then((data) => {
      setCourses(data);
      // Load heatmap for the most active course
      if (data.length > 0) {
        const active = data.find((c) => c.completion_pct < 100) ?? data[0];
        api.courses.heatmap(active.id).then(setHeatmap).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalWatchedSeconds = courses.reduce((s, c) => s + c.watched_seconds, 0);
  const totalSeconds = courses.reduce((s, c) => s + c.total_duration_seconds, 0);
  const overallPct = totalSeconds > 0 ? Math.round((totalWatchedSeconds / totalSeconds) * 100) : 0;
  const activeCourses = courses.filter((c) => c.completion_pct < 100 && c.watched_videos > 0);
  const remainingSeconds = Math.max(totalSeconds - totalWatchedSeconds, 0);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <main className="pt-28 pb-28 px-6 md:px-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-1">{today}</p>
        <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-on-surface font-headline">
          Welcome back.
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-on-surface-variant font-label py-8">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: 48 }}>video_library</span>
          <p className="text-on-surface-variant font-label">No courses yet. Import your first playlist!</p>
          <Link href="/" className="px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium">
            Import a Playlist →
          </Link>
        </div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Overall Progress", value: `${overallPct}%`, icon: "check_circle", color: "text-secondary", bg: "bg-secondary-container" },
              { label: "Hours Watched", value: formatDuration(totalWatchedSeconds), icon: "schedule", color: "text-primary", bg: "bg-primary-container/30" },
              { label: "Remaining", value: formatDuration(remainingSeconds), icon: "hourglass_bottom", color: "text-tertiary", bg: "bg-tertiary-container/40" },
              { label: "Active Courses", value: String(activeCourses.length), icon: "local_library", color: "text-error", bg: "bg-error-container/20" },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-3 ring-1 ring-outline-variant/10">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-medium text-on-surface font-headline">{value}</p>
                  <p className="text-xs text-on-surface-variant font-label mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heatmap */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-8 ring-1 ring-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-on-surface font-headline">Activity</h2>
                <span className="text-xs text-on-surface-variant font-label bg-secondary-container/40 px-3 py-1 rounded-full">Last 12 months</span>
              </div>
              <Heatmap data={heatmap} />
            </div>

            {/* Active courses */}
            <div className="bg-surface-container-lowest rounded-xl p-8 ring-1 ring-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-on-surface font-headline">In Progress</h2>
                <Link href="/courses" className="text-xs text-primary font-medium font-label hover:underline">View all →</Link>
              </div>
              <div className="space-y-6">
                {(activeCourses.length > 0 ? activeCourses : courses).slice(0, 4).map((c) => (
                  <Link key={c.id} href={`/courses/${c.id}`} className="block group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors line-clamp-1">{c.title}</p>
                      <span className="text-xs text-on-surface-variant font-label shrink-0 ml-3">{c.watched_videos}/{c.total_videos}</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary-container/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.completion_pct}%` }} />
                    </div>
                    <p className="text-[10px] text-primary font-label font-bold uppercase tracking-widest mt-1.5">{c.completion_pct}%</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
