"use client";

import { useState } from "react";
import { C1, C2, INK, TIRE } from "./colors";

export const dur = (v: number) => `${Math.max(0.22, 2.6 - v * 2.4)}s`;

function OmniWheel({ cx, cy, r, v }: { cx: number; cy: number; r: number; v: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="vex-spin" style={{ animationDuration: dur(v), animationPlayState: v < 0.02 ? "paused" : "running" }}>
        <circle r={r} fill={TIRE} stroke={INK} strokeWidth="2" />
        {Array.from({ length: 12 }, (_, k) => (
          <rect key={k} x="-3" y={-r} width="6" height="8" rx="2" fill="rgb(var(--muted))" transform={`rotate(${k * 30})`} />
        ))}
        <circle r={r * 0.58} fill="rgb(var(--paper2))" stroke={INK} strokeWidth="2" />
        {[0, 90, 180, 270].map((a) => (
          <rect key={a} x="-2.5" y={-r * 0.58} width="5" height={r * 0.58} fill={INK} transform={`rotate(${a})`} />
        ))}
        <rect x="-3.5" y="-3.5" width="7" height="7" fill={C1} stroke={INK} strokeWidth="1.5" />
      </g>
    </g>
  );
}

export function CChannel({ x, y, w, h = 18 }: { x: number; y: number; w: number; h?: number }) {
  const holes = Math.floor((w - 10) / 12);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="rgb(var(--muted) / 0.55)" stroke={INK} strokeWidth="2" />
      <line x1={x} x2={x + w} y1={y + 4} y2={y + 4} stroke={INK} strokeWidth="1" opacity="0.5" />
      <line x1={x} x2={x + w} y1={y + h - 4} y2={y + h - 4} stroke={INK} strokeWidth="1" opacity="0.5" />
      {Array.from({ length: holes }, (_, k) => (
        <rect key={k} x={x + 8 + k * 12} y={y + h / 2 - 2} width="4" height="4" fill={INK} opacity="0.7" />
      ))}
    </g>
  );
}

function Motor({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="34" height="22" rx="3" fill={TIRE} stroke={INK} strokeWidth="2" />
      <rect x={x + 5} y={y + 5} width="12" height="5" rx="1" fill={C1} />
    </g>
  );
}

export default function Drivetrain() {
  const [drive, setDrive] = useState(0.55);
  const [torque, setTorque] = useState(0.3);
  // Gearing trade-off: more torque means a lower top speed.
  const v = drive * (1 - 0.6 * torque);
  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full overflow-hidden rounded-sm border-[3px] border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Drivetrain side view with spinning omni wheels">
        <defs>
          <clipPath id="dt-clip">
            <rect width="480" height="190" />
          </clipPath>
        </defs>
        <g clipPath="url(#dt-clip)">
          <rect y="160" width="480" height="30" fill="rgb(var(--paper2))" />
          <g className="vex-scroll" style={{ animationDuration: dur(v), animationPlayState: v < 0.02 ? "paused" : "running" }}>
            {Array.from({ length: 15 }, (_, k) => (
              <line key={k} x1={k * 40} x2={k * 40} y1="160" y2="190" stroke={INK} strokeWidth="1.5" opacity="0.35" />
            ))}
          </g>
          <line x1="0" x2="480" y1="160" y2="160" stroke={INK} strokeWidth="2.5" />
        </g>
        {/* upright towers + top rail */}
        <rect x="150" y="46" width="10" height="66" fill="rgb(var(--muted) / 0.55)" stroke={INK} strokeWidth="2" />
        <rect x="320" y="46" width="10" height="66" fill="rgb(var(--muted) / 0.55)" stroke={INK} strokeWidth="2" />
        <CChannel x={130} y={38} w={220} h={14} />
        <Motor x={172} y={84} />
        <Motor x={276} y={84} />
        <rect x="214" y="62" width="54" height="40" rx="4" fill="rgb(var(--paper))" stroke={INK} strokeWidth="2" />
        <circle cx="226" cy="74" r="3" fill={C2} />
        <CChannel x={84} y={106} w={312} />
        <OmniWheel cx={118} cy={132} r={27} v={v} />
        <OmniWheel cx={240} cy={132} r={27} v={v} />
        <OmniWheel cx={362} cy={132} r={27} v={v} />
      </svg>
      <div className="mt-3 space-y-2 text-sm">
        <label className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs">drive speed</span>
          <input type="range" min={0} max={100} value={Math.round(drive * 100)} onChange={(e) => setDrive(+e.target.value / 100)} className="w-full accent-[rgb(var(--accent))]" />
          <span className="w-10 shrink-0 text-right font-mono text-xs">{Math.round(v * 100)}%</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs">torque</span>
          <input type="range" min={0} max={100} value={Math.round(torque * 100)} onChange={(e) => setTorque(+e.target.value / 100)} className="w-full accent-[rgb(var(--accent2))]" />
          <span className="w-10 shrink-0 text-right font-mono text-xs">{Math.round(torque * 100)}%</span>
        </label>
      </div>
      <p className="mt-2 text-sm text-muted">
        More torque pushes harder but lowers top speed. Drivetrains are always that gear-ratio trade-off.
      </p>
    </div>
  );
}
