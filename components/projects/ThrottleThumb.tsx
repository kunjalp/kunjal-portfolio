"use client";

import { newMap, oldMap } from "./ThrottleMap";

/**
 * Static thumbnail of the throttle map for the collapsed Formula Slug card.
 * Same curves as the interactive chart (it imports the same functions and LUT),
 * drawn twice so the lines keep their weight in both card layouts:
 * a wide one for the phone strip and a tall one for the side column.
 * Colors come from the theme tokens, so it follows light and dark.
 */
function Chart({ w, h, className }: { w: number; h: number; className: string }) {
  const m = { l: 34, r: 12, t: 14, b: 26 };
  const X = (p: number) => m.l + p * (w - m.l - m.r);
  const Y = (v: number) => h - m.b - v * (h - m.t - m.b);
  const path = (f: (p: number) => number) =>
    Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"} ${X(i / 100).toFixed(1)} ${Y(f(i / 100)).toFixed(1)}`).join(" ");

  // lift the "old map" label clear of the rising dashed line, whatever the chart's proportions
  const rise = (0.57 * (h - m.t - m.b)) / (w - m.l - m.r);
  const oldDy = 8 + 28 * rise;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" aria-hidden className={className}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={m.l} x2={w - m.r} y1={Y(t)} y2={Y(t)} stroke="rgb(var(--edge) / 0.16)" />
          <text x={m.l - 6} y={Y(t) + 3.5} textAnchor="end" className="chart-tick">
            {Math.round(t * 100)}%
          </text>
        </g>
      ))}
      <line x1={m.l} x2={m.l} y1={m.t} y2={h - m.b} stroke="rgb(var(--edge) / 0.3)" />
      <text x={m.l} y={h - 9} textAnchor="start" className="chart-tick">
        0%
      </text>
      <text x={(m.l + w - m.r) / 2} y={h - 9} textAnchor="middle" className="chart-tick">
        pedal travel
      </text>
      <text x={w - m.r} y={h - 9} textAnchor="end" className="chart-tick">
        100%
      </text>

      <path d={path(oldMap)} fill="none" stroke="rgb(var(--muted))" strokeWidth="2" strokeDasharray="5 4" />
      <path d={path(newMap)} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.75" strokeLinejoin="round" />

      <text x={X(0.4)} y={Y(oldMap(0.4)) - oldDy} textAnchor="middle" className="chart-label" fill="rgb(var(--muted))">
        old map
      </text>
      <text x={X(0.6)} y={Y(newMap(0.6)) + 18} textAnchor="start" className="chart-label" fill="rgb(var(--accent))">
        cubic LUT
      </text>
    </svg>
  );
}

export default function ThrottleThumb() {
  return (
    <div
      role="img"
      aria-label="Line chart of torque request against pedal travel. The old piecewise map is a dashed line with two kinks; the new 41-point cubic lookup table is a smooth solid curve that sits lower at low pedal, rises faster toward full pedal, and meets the old map at 100%."
      className="absolute inset-0"
    >
      <Chart w={340} h={180} className="card-chart sm:hidden" />
      <Chart w={190} h={240} className="card-chart hidden sm:block" />
    </div>
  );
}
