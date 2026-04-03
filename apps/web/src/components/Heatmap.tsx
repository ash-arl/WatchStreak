"use client";

import { useMemo } from "react";
import type { HeatmapDay } from "@/lib/api";

const LEVELS = [
  "bg-surface-container-high",
  "bg-secondary-fixed",
  "bg-secondary-fixed-dim",
  "bg-secondary",
  "bg-on-secondary-container",
];

function getLevel(minutes: number) {
  if (minutes === 0) return 0;
  if (minutes < 20) return 1;
  if (minutes < 40) return 2;
  if (minutes < 60) return 3;
  return 4;
}

function buildYear(data: HeatmapDay[]) {
  const map = new Map(data.map((d) => [d.date, d.minutes]));
  const today = new Date();
  const days: { date: Date; minutes: number }[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: d, minutes: map.get(key) ?? 0 });
  }
  return days;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Heatmap({ data = [] }: { data?: HeatmapDay[] }) {
  const days = useMemo(() => buildYear(data), [data]);

  const firstDow = days[0].date.getDay();
  const padded = Array(firstDow).fill(null).concat(days);

  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7) as (typeof days[0] | null)[]);
  }

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d !== null);
    if (first && first.date.getMonth() !== lastMonth) {
      lastMonth = first.date.getMonth();
      monthLabels.push({ label: MONTHS[lastMonth], col: wi });
    }
  });

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex gap-[3px] mb-1 ml-8">
        {weeks.map((week, wi) => {
          const label = monthLabels.find((m) => m.col === wi);
          return (
            <div key={wi} className="w-[10px] shrink-0">
              {label && <span className="text-[9px] text-on-surface-variant font-label whitespace-nowrap">{label.label}</span>}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 mt-[2px]">
          {DAYS.map((d, i) => (
            <span key={d} className={`text-[9px] text-on-surface-variant font-label h-[10px] leading-[10px] ${i % 2 !== 0 ? "" : "invisible"}`}>
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => {
                if (!day) return <div key={di} className="w-[10px] h-[10px]" />;
                const lvl = getLevel(day.minutes);
                return (
                  <div
                    key={di}
                    title={`${day.date.toDateString()}: ${day.minutes} min`}
                    className={`w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-opacity hover:opacity-70 ${LEVELS[lvl]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-on-surface-variant font-label">Less</span>
        {LEVELS.map((cls, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-on-surface-variant font-label">More</span>
      </div>
    </div>
  );
}
