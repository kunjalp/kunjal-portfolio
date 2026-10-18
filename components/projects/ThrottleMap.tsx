"use client";

import { useState } from "react";

// Real curves, taken from vcu/etc/etc_controller.cpp (PR #26).
// Old: piecewise map with regions of 30% / 40% / 30% and 2x scaling at the ends.
function oldMap(p: number) {
  const r1 = 0.3, r2 = 0.4, k = 2;
  const s1 = r1 / k;
  const s3 = (1 - r1 - r2) / k;
  const s2 = 1 - s1 - s3;
  const k2 = r2 / s2;
  if (p < s1) return p * k;
  if (p < s1 + s2) return s1 * k + (p - s1) * k2;
  return s1 * k + s2 * k2 + (p - s1 - s2) * k;
}

// New: 17-point power-law (k = 1.4) lookup table with linear interpolation.
export const LUT = [
  0.0, 0.020785, 0.054854, 0.098863, 0.151214, 0.210744, 0.276632, 0.34825, 0.425114,
  0.506822, 0.593026, 0.683424, 0.777748, 0.875758, 0.977239, 1.0, 1.0,
];
function newMap(p: number) {
  p = Math.min(1, Math.max(0, p));
  const x = p * 16;
  const i = Math.floor(x);
  if (i >= 16) return 1;
  return LUT[i] + (x - i) * (LUT[i + 1] - LUT[i]);
}

const W = 420, H = 280;
const M = { l: 44, r: 16, t: 14, b: 40 };
const X = (p: number) => M.l + p * (W - M.l - M.r);
const Y = (v: number) => H - M.b - v * (H - M.t - M.b);
const path = (f: (p: number) => number) =>
  Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"} ${X(i / 100).toFixed(1)} ${Y(f(i / 100)).toFixed(1)}`).join(" ");

const ROWS = [0.1, 0.2, 0.5, 1];

export default function ThrottleMap() {
  const [pct, setPct] = useState(20);
  const p = pct / 100;
  const o = oldMap(p);
  const n = newMap(p);

  const scrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * W;
    setPct(Math.round(Math.min(1, Math.max(0, (px - M.l) / (W - M.l - M.r))) * 100));
  };

  return (
    <div>
      <p className="text-sm text-muted">
        Pedal position in, torque request out. Drag across the chart or use the slider.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto mt-2 max-h-[270px] w-full cursor-crosshair touch-pan-y"
        onPointerMove={scrub}
        onPointerDown={scrub}
        role="img"
        aria-label="Line chart comparing the old and new accelerator torque maps"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={Y(t)} y2={Y(t)} stroke="rgb(var(--edge) / 0.14)" />
            <text x={M.l - 8} y={Y(t) + 4} textAnchor="end" className="chart-tick">
              {Math.round(t * 100)}%
            </text>
            <text x={X(t)} y={H - M.b + 16} textAnchor="middle" className="chart-tick">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" className="chart-tick">
          Pedal travel
        </text>
        <text transform={`translate(12 ${(M.t + H - M.b) / 2}) rotate(-90)`} textAnchor="middle" className="chart-tick">
          Torque request
        </text>

        <path d={path(oldMap)} fill="none" stroke="rgb(var(--muted))" strokeWidth="2" strokeDasharray="5 4" />
        <path d={path(newMap)} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinejoin="round" />

        {/* direct labels */}
        <text x={X(0.7)} y={Y(oldMap(0.7)) - 8} className="chart-label" fill="rgb(var(--muted))">Old</text>
        <text x={X(0.78)} y={Y(newMap(0.78)) + 18} className="chart-label" fill="rgb(var(--fg))">New</text>

        {/* readout */}
        <line x1={X(p)} x2={X(p)} y1={M.t} y2={H - M.b} stroke="rgb(var(--edge) / 0.5)" strokeDasharray="2 3" />
        <circle cx={X(p)} cy={Y(o)} r="4.5" fill="rgb(var(--muted))" stroke="rgb(var(--paper))" strokeWidth="2" />
        <circle cx={X(p)} cy={Y(n)} r="4.5" fill="rgb(var(--accent))" stroke="rgb(var(--paper))" strokeWidth="2" />
      </svg>

      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <svg width="22" height="8" aria-hidden>
            <line x1="0" x2="22" y1="4" y2="4" stroke="rgb(var(--muted))" strokeWidth="2" strokeDasharray="5 4" />
          </svg>
          Old piecewise map
        </span>
        <span className="flex items-center gap-2">
          <svg width="22" height="8" aria-hidden>
            <line x1="0" x2="22" y1="4" y2="4" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          </svg>
          New power-law table
        </span>
        <span className="ml-auto font-mono text-xs" aria-live="polite">
          {pct}% pedal → old {o.toFixed(2)}, new {n.toFixed(2)}
        </span>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Pedal travel percent</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full accent-[rgb(var(--accent))]"
        />
      </label>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium">View as table</summary>
        <table className="mt-2 w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-1 pr-4 font-medium">Pedal</th>
              <th className="py-1 pr-4 font-medium">Old</th>
              <th className="py-1 font-medium">New</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r} className="border-t border-[rgb(var(--edge)/0.2)]">
                <td className="py-1 pr-4">{Math.round(r * 100)}%</td>
                <td className="py-1 pr-4">{oldMap(r).toFixed(2)}</td>
                <td className="py-1">{newMap(r).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
