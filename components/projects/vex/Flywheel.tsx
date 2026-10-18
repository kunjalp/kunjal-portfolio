"use client";

import { useEffect, useRef, useState } from "react";
import { C1, C2, INK, TIRE } from "./colors";

type Shot = { x: number; y: number; vx: number; vy: number; done: boolean; made: boolean };
const FW = { x: 120, y: 112, r: 50 };
const TARGET = { x1: 388, x2: 452, y: 112 };

export default function Flywheel() {
  const [, force] = useState(0);
  const hold = useRef(false);
  const st = useRef({ a: 0, w: 0, shots: [] as Shot[], made: 0, fired: 0 });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      const s = st.current;
      s.w = hold.current ? Math.min(1, s.w + dt * 0.8) : Math.max(0, s.w - dt * 0.22);
      s.a = (s.a + s.w * 1100 * dt) % 360;
      for (const p of s.shots) {
        if (p.done) continue;
        p.vy += 520 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.vy > 0 && p.y >= TARGET.y - 4 && p.x > TARGET.x1 && p.x < TARGET.x2 && !p.made) {
          p.made = true;
          p.done = true;
          p.y = TARGET.y - 4;
          s.made += 1;
        } else if (p.y > 172) {
          p.y = 172;
          p.done = true;
        }
      }
      s.shots = s.shots.slice(-8);
      force((n) => (n + 1) % 1e6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const s = st.current;
  const fire = () => {
    if (s.w < 0.08) return;
    s.fired += 1;
    s.shots.push({ x: FW.x + 6, y: FW.y - FW.r - 8, vx: 140 + s.w * 360, vy: -(120 + s.w * 260), done: false, made: false });
  };
  const press = (on: boolean) => () => (hold.current = on);

  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full rounded-sm border-[3px] border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Flywheel launcher: spin it up, then fire discs at a goal">
        <rect y="172" width="480" height="18" fill="rgb(var(--paper2))" />
        <line x1="0" x2="480" y1="172" y2="172" stroke={INK} strokeWidth="2.5" />
        {/* goal */}
        <path d={`M${TARGET.x1} ${TARGET.y - 26} V${TARGET.y} H${TARGET.x2} V${TARGET.y - 26}`} fill="rgb(var(--accent2) / 0.15)" stroke={INK} strokeWidth="3" />
        <line x1={(TARGET.x1 + TARGET.x2) / 2} x2={(TARGET.x1 + TARGET.x2) / 2} y1={TARGET.y} y2="172" stroke={INK} strokeWidth="4" />
        {/* hood */}
        <path d={`M${FW.x - 46} ${FW.y - 62} A 72 72 0 0 1 ${FW.x + 58} ${FW.y - 52}`} fill="none" stroke="rgb(var(--muted))" strokeWidth="8" strokeLinecap="round" />
        <rect x={FW.x - 14} y={FW.y + 4} width="28" height="68" fill="rgb(var(--muted) / 0.55)" stroke={INK} strokeWidth="2" />
        <g transform={`translate(${FW.x} ${FW.y}) rotate(${s.a})`}>
          <circle r={FW.r} fill={TIRE} stroke={INK} strokeWidth="2.5" />
          <circle r={FW.r - 9} fill="rgb(var(--paper2))" stroke={INK} strokeWidth="2" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx="0" cy={-(FW.r - 22)} r="6" fill="none" stroke={INK} strokeWidth="2" transform={`rotate(${a})`} />
          ))}
          <circle r="7" fill={C1} stroke={INK} strokeWidth="2" />
        </g>
        {/* motion blur ring */}
        <circle cx={FW.x} cy={FW.y} r={FW.r + 4} fill="none" stroke={C1} strokeWidth="2" opacity={s.w * 0.7} strokeDasharray="4 8" />
        {s.shots.map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx="12" ry="4" fill={p.made ? C1 : C2} stroke={INK} strokeWidth="1.5" opacity={p.done && !p.made ? 0.45 : 1} />
        ))}
        <text x="472" y="20" textAnchor="end" className="font-mono" fontSize="12" fill={INK}>
          {s.made} / {s.fired} in
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="glass-btn shrink-0 touch-none select-none [-webkit-touch-callout:none]"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            press(true)();
          }}
          onPointerUp={press(false)}
          onPointerCancel={press(false)}
          onPointerLeave={press(false)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (hold.current = true)}
          onKeyUp={() => (hold.current = false)}
        >
          Hold to spin up
        </button>
        <button type="button" className="glass-btn btn-primary shrink-0" onClick={fire} disabled={s.w < 0.08}>
          Fire
        </button>
        <div className="flex min-w-[120px] flex-1 items-center gap-2">
          <span className="font-mono text-xs">rpm</span>
          <div className="relative h-3 flex-1 overflow-hidden border-2 border-[rgb(var(--edge))]" aria-hidden>
            <div className="absolute inset-y-0 bg-[rgb(var(--accent2)/0.45)]" style={{ left: "28%", width: "15%" }} />
            <div className="relative h-full bg-[rgb(var(--accent))]" style={{ width: `${s.w * 100}%` }} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">Speed decides distance. Fire while the bar is in the green band to land it in the goal.</p>
    </div>
  );
}
