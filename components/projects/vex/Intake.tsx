"use client";

import { useState } from "react";
import { C1, C2, INK, PAPER, TIRE } from "./colors";
import { CChannel } from "./Drivetrain";

function Roller({ cx, cy, dir, on }: { cx: number; cy: number; dir: 1 | -1; on: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="vex-spin" style={{ animationDuration: "0.8s", animationDirection: dir > 0 ? "normal" : "reverse", animationPlayState: on ? "running" : "paused" }}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M0 -12 Q 7 -20 3 -27" fill="none" stroke={C2} strokeWidth="4" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        <circle r="13" fill={TIRE} stroke={INK} strokeWidth="2" />
        <rect x="-3" y="-3" width="6" height="6" fill={C1} />
      </g>
    </g>
  );
}

export default function Intake() {
  const [on, setOn] = useState(true);
  const ps = on ? "running" : "paused";
  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full overflow-hidden rounded-sm border-[3px] border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Intake with two flapped rollers pulling rings into the robot">
        <rect y="150" width="480" height="40" fill="rgb(var(--paper2))" />
        <line x1="0" x2="480" y1="150" y2="150" stroke={INK} strokeWidth="2.5" />
        {/* robot body */}
        <rect x="300" y="28" width="168" height="104" rx="4" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <CChannel x={300} y={118} w={168} h={14} />
        <circle cx="330" cy="140" r="12" fill={TIRE} stroke={INK} strokeWidth="2" />
        <circle cx="440" cy="140" r="12" fill={TIRE} stroke={INK} strokeWidth="2" />
        {/* internal conveyor */}
        <line x1="306" x2="410" y1="100" y2="52" stroke={INK} strokeWidth="2" strokeDasharray="5 5" className="vex-belt" style={{ animationPlayState: ps }} />
        <rect x="408" y="40" width="50" height="36" rx="3" fill="rgb(var(--paper2))" stroke={INK} strokeWidth="2" />
        <text x="433" y="62" textAnchor="middle" className="font-mono" fontSize="10" fill={INK}>
          stored
        </text>
        {/* rings on the floor */}
        {[0, 1, 2].map((i) => (
          <g key={i} className="vex-feed" style={{ animationDelay: `${i * -1.1}s`, animationPlayState: ps }}>
            <ellipse cx="40" cy="142" rx="20" ry="6" fill="none" stroke={INK} strokeWidth="8" />
            <ellipse cx="40" cy="142" rx="20" ry="6" fill="none" stroke={i % 2 ? C2 : C1} strokeWidth="5" />
          </g>
        ))}
        {/* intake arm + rollers */}
        <line x1="296" y1="80" x2="276" y2="104" stroke={INK} strokeWidth="5" />
        <line x1="296" y1="132" x2="276" y2="138" stroke={INK} strokeWidth="5" />
        <Roller cx={272} cy={104} dir={-1} on={on} />
        <Roller cx={272} cy={140} dir={1} on={on} />
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" aria-pressed={on} className="glass-btn" onClick={() => setOn((o) => !o)}>
          {on ? "Stop intake" : "Run intake"}
        </button>
        <p className="text-sm text-muted">Flexible flaps on two counter-spinning rollers grab a piece off the floor.</p>
      </div>
    </div>
  );
}
