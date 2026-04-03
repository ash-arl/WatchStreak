"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, formatDuration, type CourseOut } from "@/lib/api";

type Filter = "All" | "In Progress" | "Completed" | "Not Started";

function getTag(c: CourseOut): Filter {
  if (c.completion_pct >= 100) return "Completed";
  if (c.watched_videos === 0) return "Not Started";
  return "In Progress";
}

const tagColors: Record<Filter, string> = {
  "All": "",
  "In Progress": "bg-primary-container/40 text-primary",
  "Completed": "bg-secondary-container text-on-secondary-container",
  "Not Started": "bg-surface-container-high text-on-surface-variant",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseOut[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.courses.list()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? courses : courses.filter((c) => getTag(c) === filter);

  return (
    <main className="pt-28 pb-28 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label mb-1">Library</p>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-on-surface font-headline">My Courses</h1>
        </div>
        <Link
          href="/"
          className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Course
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {(["All", "In Progress", "Completed", "Not Started"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-label font-medium transition-colors ${
              filter === f
                ? "bg-on-surface text-surface"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant font-label">
          <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          Loading courses…
        </div>
      )}

      {error && <p className="text-error text-sm font-label py-8 text-center">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: 48 }}>video_library</span>
          <p className="text-on-surface-variant font-label text-sm">No courses yet.</p>
          <Link href="/" className="px-6 py-3 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium">
            Import your first playlist →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((c) => {
          const tag = getTag(c);
          return (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="group bg-surface-container-lowest rounded-xl p-7 ring-1 ring-outline-variant/10 hover:ring-outline-variant/30 transition-all hover:shadow-ambient block"
            >
              <span className={`inline-flex text-[10px] font-label font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5 ${tagColors[tag]}`}>
                {tag}
              </span>
              <h2 className="text-lg font-medium text-on-surface group-hover:text-primary transition-colors font-headline mb-1 leading-snug">
                {c.title}
              </h2>
              <p className="text-sm text-on-surface-variant font-label mb-6">{c.channel}</p>

              <div className="h-1.5 w-full bg-primary-container/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${c.completion_pct}%` }} />
              </div>
              <div className="flex justify-between text-xs font-label text-on-surface-variant mb-6">
                <span>{c.watched_videos}/{c.total_videos} videos</span>
                <span className="text-primary font-semibold">{c.completion_pct}%</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant font-label flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {formatDuration(c.total_duration_seconds)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {c.target_days} day goal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">play_circle</span>
                  {c.total_videos} videos
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/"
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary flex items-center justify-center shadow-xl shadow-primary/30 z-40"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </main>
  );
}
