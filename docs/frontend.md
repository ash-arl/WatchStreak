# Frontend — Next.js

The frontend is **Next.js 16** with the App Router, React 19, and Tailwind CSS v4.

## Stack

| Tool | Purpose |
|------|---------|
| Next.js 16 | React framework, App Router, SSR |
| React 19 | UI library |
| Tailwind CSS v4 | Utility-first styling with `@theme` tokens |
| TypeScript | Type safety |
| Manrope | Display/headline font |
| Inter | Body/label font |
| Material Symbols | Icon library (Google) |

## Running the Frontend

```bash
# From the repo root
pnpm turbo run dev --filter=web

# Or from apps/web/
cd apps/web
pnpm dev
```

Visit `http://localhost:3000`

## Project Structure

```
apps/web/src/
├── app/
│   ├── layout.tsx          Root layout — Nav, fonts, mobile bottom nav
│   ├── globals.css         Design system — all Tailwind @theme color tokens
│   ├── page.tsx            / — Landing page, playlist import
│   ├── dashboard/
│   │   └── page.tsx        /dashboard — metrics, heatmap, active courses
│   └── courses/
│       ├── page.tsx        /courses — filterable course library
│       └── [id]/
│           └── page.tsx    /courses/{id} — video list, progress tracking
├── components/
│   ├── Nav.tsx             Glassmorphism top navigation bar
│   └── Heatmap.tsx         52-week activity heatmap component
└── lib/
    └── api.ts              Typed API client (all fetch calls live here)
```

## API Client

All backend communication goes through `src/lib/api.ts`. It provides:

- Full TypeScript types for every API response
- A single `BASE` URL (from `NEXT_PUBLIC_API_URL`)
- Consistent error handling

```typescript
import { api, formatDuration } from "@/lib/api";

// Import a playlist
const course = await api.courses.create(url, 14);

// List all courses
const courses = await api.courses.list();

// Toggle a video watched
const video = await api.videos.toggleWatch(videoId, true);

// Log time
await api.logs.create(courseId, "2026-04-03", 45);
```

## Pages

### Landing (`/`)
- YouTube playlist URL input
- Live preview (fetches from `/courses/preview` before saving)
- Goal-setting input (target days + daily min/day calculation)
- "Start Learning →" creates course and redirects to detail page
- Bento grid explaining the 3-step flow
- Course preview mockup for first-time visitors

### Dashboard (`/dashboard`)
- 4 metric cards: overall %, hours watched, remaining, active courses
- 52-week activity heatmap (from real `DailyLog` data)
- In-progress courses list with progress bars

### My Courses (`/courses`)
- Filterable grid: All / In Progress / Completed / Not Started
- Each card: title, channel, progress bar, metadata (duration, goal, video count)
- Empty state with CTA when no courses exist

### Course Detail (`/courses/[id]`)
- Breadcrumb navigation
- Overall progress bar
- Grouped video list (groups of 5) with click-to-toggle watched state
- Sidebar: stats (total, watched, remaining, goal), daily goal + time logger, forecast

## Design System — Ethereal Academic

All color tokens are defined as Tailwind CSS v4 `@theme` variables in `globals.css`.

### Core Philosophy
- **No borders at 100% opacity** — depth via background color shifts only
- **Glassmorphism nav** — `rgba(248, 249, 250, 0.72)` + `backdrop-filter: blur(20px)`
- **Pastel palette** — soft blues, mints, lavenders; never pure `#000000`
- **Asymmetric spacing** — hero sections use uneven padding for a designed feel

### Color Tokens

```css
/* Primary — Blue Focus */
--color-primary:              #346482;
--color-primary-container:    #abdafd;
--color-on-primary:           #f5f9ff;

/* Secondary — Mint Growth */
--color-secondary:            #4a6641;
--color-secondary-container:  #cbecbc;

/* Tertiary — Lavender Insight */
--color-tertiary:             #69558e;
--color-tertiary-container:   #d6beff;

/* Surfaces */
--color-surface:              #f8f9fa;
--color-surface-container-lowest: #ffffff;
--color-surface-container-low:    #f1f4f5;
```

Use these as Tailwind classes: `bg-primary`, `text-on-surface-variant`, `ring-outline-variant/10`, etc.

### Heatmap Levels

The activity heatmap uses a 5-level pastel mint scale:

| Level | Minutes | Class |
|-------|---------|-------|
| 0 | 0 | `bg-surface-container-high` (#e5e9eb) |
| 1 | 1–19 | `bg-secondary-fixed` (#cbecbc) |
| 2 | 20–39 | `bg-secondary-fixed-dim` (#bddeaf) |
| 3 | 40–59 | `bg-secondary` (#4a6641) |
| 4 | 60+ | `bg-on-secondary-container` (#3d5934) |

### Typography

- Headlines / display: `font-headline` (Manrope), `font-extralight`, `tracking-tighter`
- Body: `font-body` (Inter), `font-light`, `leading-relaxed`
- Labels / metadata: `font-label` (Inter), `text-xs`, `uppercase`, `tracking-widest`

### Buttons

```tsx
{/* Primary */}
<button className="px-10 py-4 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary font-medium shadow-xl shadow-primary/20">

{/* Secondary */}
<button className="px-5 py-2 rounded-full bg-surface-container-high text-on-surface-variant">

{/* Ghost / text */}
<button className="text-primary text-sm font-medium hover:underline">
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL |

Set in `apps/web/.env.local` (copy from `apps/web/.env.example`).
