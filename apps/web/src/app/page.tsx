"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, formatDuration, type PlaylistPreview } from "@/lib/api";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [targetDays, setTargetDays] = useState(14);
  const [preview, setPreview] = useState<PlaylistPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handlePreview() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const data = await api.courses.preview(url.trim());
      setPreview(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not fetch playlist. Check the URL.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!preview) return;
    setCreating(true);
    try {
      const course = await api.courses.create(url.trim(), targetDays);
      router.push(`/courses/${course.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create course.");
      setCreating(false);
    }
  }

  return (
    <main className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center mb-28">
        <span className="text-primary font-semibold tracking-widest text-[10px] uppercase mb-5 bg-primary-container/30 px-4 py-1.5 rounded-full font-label">
          Educational Sanctuary
        </span>

        <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter text-on-surface mb-8 leading-[1.08] font-headline">
          Turn Playlists into{" "}
          <span className="text-primary font-normal">Courses.</span>
        </h1>

        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-14 font-light leading-relaxed">
          A high-end editorial environment for learning. Curate your digital
          growth without the noise of the algorithm.
        </p>

        {/* URL Input */}
        <div className="w-full max-w-3xl bg-surface-container-lowest p-3 rounded-full flex flex-col md:flex-row items-center gap-2 shadow-ambient ring-1 ring-outline-variant/15">
          <div className="flex items-center gap-3 px-6 w-full">
            <span className="material-symbols-outlined text-outline text-xl">link</span>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setPreview(null); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handlePreview()}
              placeholder="Paste YouTube playlist URL here..."
              className="w-full border-none focus:ring-0 bg-transparent text-on-surface placeholder:text-outline font-light py-4 text-base outline-none"
            />
          </div>
          <button
            onClick={handlePreview}
            disabled={loading || !url.trim()}
            className="w-full md:w-auto px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-medium transition-all active:scale-95 whitespace-nowrap shadow-xl shadow-primary/20 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching…" : "Preview Playlist"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-error font-label">{error}</p>
        )}

        {/* Preview card */}
        {preview && (
          <div className="w-full max-w-3xl mt-6 bg-surface-container-lowest rounded-xl p-6 ring-1 ring-outline-variant/10 text-left shadow-ambient">
            <div className="flex gap-5 items-start mb-5">
              {preview.thumbnail_url && (
                <img
                  src={preview.thumbnail_url}
                  alt={preview.title}
                  className="w-24 aspect-video object-cover rounded-lg shrink-0"
                />
              )}
              <div>
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">{preview.channel}</p>
                <h2 className="text-base font-medium text-on-surface font-headline leading-snug mb-2">{preview.title}</h2>
                <div className="flex gap-4 text-xs text-on-surface-variant font-label">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">play_circle</span>{preview.total_videos} videos</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{formatDuration(preview.total_duration_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Goal setting */}
            <div className="flex items-center gap-4 mb-5 p-4 bg-surface-container-low rounded-xl">
              <label className="text-sm text-on-surface-variant font-label whitespace-nowrap">Complete in</label>
              <input
                type="number"
                min={1}
                max={365}
                value={targetDays}
                onChange={(e) => setTargetDays(Number(e.target.value))}
                className="w-20 bg-surface-container rounded-full px-3 py-1.5 text-sm text-on-surface outline-none font-label text-center border-none"
              />
              <span className="text-sm text-on-surface-variant font-label">days</span>
              <span className="ml-auto text-xs text-primary font-semibold font-label">
                ≈ {Math.ceil(preview.total_duration_seconds / 60 / targetDays)} min/day
              </span>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3.5 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-medium transition-all active:scale-95 hover:opacity-95 disabled:opacity-50"
            >
              {creating ? "Creating course…" : "Start Learning →"}
            </button>
          </div>
        )}
      </section>

      {/* ── Bento: How it Works ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        <div className="bg-surface-container-low p-10 rounded-xl flex flex-col items-start transition-all hover:bg-surface-container">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-on-primary-container text-2xl">content_paste</span>
          </div>
          <h3 className="text-xl font-medium mb-4 text-on-surface font-headline">Paste link</h3>
          <p className="text-on-surface-variant font-light leading-relaxed">
            Drop any YouTube playlist URL. We extract the structure and metadata to create your personal syllabus.
          </p>
        </div>

        <div className="bg-secondary-container p-10 rounded-xl flex flex-col items-start transition-all hover:opacity-90">
          <div className="w-14 h-14 rounded-full bg-on-secondary-container flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-secondary-container text-2xl">flag</span>
          </div>
          <h3 className="text-xl font-medium mb-4 text-on-secondary-container font-headline">Set goals</h3>
          <p className="text-on-secondary-fixed-variant font-light leading-relaxed">
            Define your completion target. Our scheduler distributes the content to fit your rhythm.
          </p>
        </div>

        <div className="bg-tertiary-container p-10 rounded-xl flex flex-col items-start transition-all hover:opacity-90">
          <div className="w-14 h-14 rounded-full bg-on-tertiary-container flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-tertiary-container text-2xl">trending_up</span>
          </div>
          <h3 className="text-xl font-medium mb-4 text-on-tertiary-container font-headline">Track progress</h3>
          <p className="text-on-tertiary-fixed-variant font-light leading-relaxed">
            Visualize your journey with a pastel heatmap and completion streaks. Stay motivated.
          </p>
        </div>
      </div>

      {/* ── Course Preview Mockup ────────────────────────── */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl ring-1 ring-outline-variant/10">
          <div className="h-12 bg-surface-container-high flex items-center px-6 gap-2">
            <div className="w-3 h-3 rounded-full bg-outline-variant/40" />
            <div className="w-3 h-3 rounded-full bg-outline-variant/40" />
            <div className="w-3 h-3 rounded-full bg-outline-variant/40" />
          </div>
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <div className="aspect-video rounded-xl bg-surface-container-high overflow-hidden mb-6 flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: 64 }}>smart_display</span>
                </div>
                <div className="h-2 w-full bg-primary-container/30 rounded-full overflow-hidden mb-2">
                  <div className="h-full w-[65%] bg-primary rounded-full" />
                </div>
                <p className="text-[10px] text-primary uppercase tracking-widest font-bold font-label">65% Completed</p>
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-7 w-2/3 bg-surface-container-high rounded-lg mb-6" />
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-4"><span className="material-symbols-outlined text-secondary">check_circle</span><div className="h-3.5 bg-surface-variant rounded w-48" /></div>
                  <div className="h-3.5 bg-surface-variant rounded w-10" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/10">
                  <div className="flex items-center gap-4"><span className="material-symbols-outlined text-outline">play_circle</span><div className="h-3.5 bg-surface-variant rounded w-64" /></div>
                  <div className="h-3.5 bg-surface-variant rounded w-10" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest opacity-50">
                  <div className="flex items-center gap-4"><span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span><div className="h-3.5 bg-surface-variant rounded w-40" /></div>
                  <div className="h-3.5 bg-surface-variant rounded w-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
