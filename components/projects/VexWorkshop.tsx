"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- Game field: draggable pieces per season ---------- */

const SEASONS = [
  { id: "tp", years: "2021–22", game: "Tipping Point", piece: "ring", goal: "stake", note: "Rings go onto mobile goals." },
  { id: "su", years: "2022–23", game: "Spin Up", piece: "disc", goal: "box", note: "Discs go into the goals." },
  { id: "ou", years: "2023–24", game: "Over Under", piece: "tri", goal: "net", note: "Triballs go into the goal." },
  { id: "hs", years: "2024–25", game: "High Stakes", piece: "ring", goal: "stake", note: "Rings go onto stakes." },
] as const;

const W = 480, H = 230;
const ZONE = { x: 310, y: 50, w: 140, h: 150 };
const START = [
  [40, 190], [80, 200], [120, 188], [60, 150], [100, 160], [150, 205], [30, 120], [140, 150],
];

function Piece({ kind, i }: { kind: string; i: number }) {
  const c = i % 2 ? "rgb(var(--accent2))" : "rgb(var(--accent))";
  if (kind === "ring")
    return <circle r="12" fill="none" stroke={c} strokeWidth="6" />;
  if (kind === "disc")
    return (
      <>
        <circle r="13" fill={c} stroke="rgb(var(--edge))" strokeWidth="2" />
        <circle r="6" fill="none" stroke="rgb(var(--edge))" strokeWidth="1.5" />
      </>
    );
  return (
    <polygon points="0,-15 15,11 -15,11" fill={c} stroke="rgb(var(--edge))" strokeWidth="2" strokeLinejoin="round" />
  );
}

function GoalArt({ kind }: { kind: string }) {
  const { x, y, w, h } = ZONE;
  const stroke = "rgb(var(--edge))";
  if (kind === "stake")
    return (
      <g stroke={stroke} strokeWidth="2.5" fill="none">
        <line x1={x + w / 2} x2={x + w / 2} y1={y} y2={y + h} />
        <rect x={x + 20} y={y + h - 8} width={w - 40} height="8" fill="rgb(var(--paper2))" />
      </g>
    );
  if (kind === "box")
    return (
      <g stroke={stroke} strokeWidth="2.5" fill="rgb(var(--paper2) / 0.5)">
        <path d={`M${x} ${y + 20} V${y + h} H${x + w} V${y + 20}`} fill="none" />
        <rect x={x} y={y + h - 10} width={w} height="10" />
      </g>
    );
  return (
    <g stroke={stroke} strokeWidth="1.5" fill="none">
      <rect x={x} y={y} width={w} height={h} strokeWidth="2.5" />
      {[1, 2, 3, 4].map((n) => (
        <line key={n} x1={x + (w / 5) * n} x2={x + (w / 5) * n} y1={y} y2={y + h} opacity="0.35" />
      ))}
      {[1, 2, 3].map((n) => (
        <line key={n} x1={x} x2={x + w} y1={y + (h / 4) * n} y2={y + (h / 4) * n} opacity="0.35" />
      ))}
    </g>
  );
}

function Field() {
  const [season, setSeason] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label="VRC season" className="flex flex-wrap gap-2">
        {SEASONS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={i === season}
            onClick={() => setSeason(i)}
            className={`glass-btn !min-h-[34px] !px-3 !text-[0.78rem] ${i === season ? "btn-primary" : ""}`}
          >
            {s.years}
          </button>
        ))}
      </div>
      <Sandbox key={SEASONS[season].id} s={SEASONS[season]} />
    </div>
  );
}

function Sandbox({ s }: { s: (typeof SEASONS)[number] }) {
  const [pos, setPos] = useState(() => START.map(([x, y]) => ({ x, y })));
  const drag = useRef<{ i: number; dx: number; dy: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const pt = (e: React.PointerEvent) => {
    const b = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H };
  };
  const inZone = (p: { x: number; y: number }) =>
    p.x > ZONE.x && p.x < ZONE.x + ZONE.w && p.y > ZONE.y && p.y < ZONE.y + ZONE.h;
  const scored = pos.filter(inZone).length;

  return (
    <div className="mt-3">
      <p className="text-sm">
        <span className="font-bold">{s.game}</span> <span className="text-muted">· {s.note} Drag the pieces.</span>
      </p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full touch-none select-none border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]"
        role="img"
        aria-label={`${s.game} sandbox: drag game pieces into the goal`}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const p = pt(e);
          setPos((arr) =>
            arr.map((a, i) =>
              i === d.i ? { x: Math.min(W - 14, Math.max(14, p.x - d.dx)), y: Math.min(H - 14, Math.max(14, p.y - d.dy)) } : a,
            ),
          );
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <rect
          x={ZONE.x - 8}
          y={ZONE.y - 8}
          width={ZONE.w + 16}
          height={ZONE.h + 16}
          fill="rgb(var(--accent2) / 0.12)"
          stroke="rgb(var(--accent2))"
          strokeDasharray="5 4"
        />
        <GoalArt kind={s.goal} />
        {pos.map((p, i) => (
          <g
            key={i}
            transform={`translate(${p.x} ${p.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const q = pt(e);
              drag.current = { i, dx: q.x - p.x, dy: q.y - p.y };
            }}
          >
            <circle r="20" fill="transparent" />
            <Piece kind={s.piece} i={i} />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-mono" aria-live="polite">
          scored: {scored} / {pos.length}
        </span>
        <button type="button" className="glass-btn !min-h-[32px] !px-3 !text-[0.78rem]" onClick={() => setPos(START.map(([x, y]) => ({ x, y })))}>
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---------- Mechanisms ---------- */

function Wheel({ cx, cy, r, speed, dir = 1 }: { cx: number; cy: number; r: number; speed: number; dir?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g
        className="vex-spin"
        style={{
          animationDuration: `${Math.max(0.25, 3.2 - speed * 2.9)}s`,
          animationDirection: dir > 0 ? "normal" : "reverse",
          animationPlayState: speed < 0.02 ? "paused" : "running",
        }}
      >
        <circle r={r} fill="rgb(var(--tire))" stroke="rgb(var(--edge))" strokeWidth="2" />
        <circle r={r * 0.55} fill="rgb(var(--paper2))" stroke="rgb(var(--edge))" strokeWidth="2" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1="0" y1="0" x2="0" y2={-r * 0.55} stroke="rgb(var(--edge))" strokeWidth="2.5" transform={`rotate(${a})`} />
        ))}
      </g>
    </g>
  );
}

function Drivetrain() {
  const [v, setV] = useState(0.4);
  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Drivetrain with four spinning wheels">
        <rect x="90" y="52" width="300" height="46" rx="6" fill="rgb(var(--paper))" stroke="rgb(var(--edge))" strokeWidth="2.5" />
        <rect x="120" y="62" width="240" height="26" fill="none" stroke="rgb(var(--edge) / 0.5)" strokeDasharray="4 4" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={[130, 350, 130, 350][i]} cy={[52, 52, 98, 98][i]} r="3" fill="rgb(var(--edge))" />
        ))}
        <Wheel cx={118} cy={116} r={34} speed={v} />
        <Wheel cx={362} cy={116} r={34} speed={v} />
        <line x1="20" x2="460" y1="152" y2="152" stroke="rgb(var(--edge))" strokeWidth="2" />
      </svg>
      <label className="mt-3 flex items-center gap-3 text-sm">
        <span className="shrink-0 font-mono text-xs">drive speed</span>
        <input type="range" min={0} max={100} value={Math.round(v * 100)} onChange={(e) => setV(+e.target.value / 100)} className="w-full accent-[rgb(var(--accent))]" />
      </label>
      <p className="mt-2 text-sm text-muted">The base everything else bolts to.</p>
    </div>
  );
}

function Flywheel() {
  const [angle, setAngle] = useState(0);
  const [w, setW] = useState(0);
  const hold = useRef(false);
  const state = useRef({ a: 0, w: 0 });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = state.current;
      s.w = hold.current ? Math.min(1, s.w + dt * 0.9) : Math.max(0, s.w - dt * 0.25);
      s.a = (s.a + s.w * 900 * dt) % 360;
      setAngle(s.a);
      setW(s.w);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const press = (on: boolean) => () => (hold.current = on);
  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Flywheel that spins up while the button is held">
        <g transform="translate(240 95)">
          <g transform={`rotate(${angle})`}>
            <circle r="68" fill="rgb(var(--tire))" stroke="rgb(var(--edge))" strokeWidth="3" />
            <circle r="46" fill="rgb(var(--paper2))" stroke="rgb(var(--edge))" strokeWidth="2.5" />
            {[0, 72, 144, 216, 288].map((a) => (
              <line key={a} x2="0" y2="-46" stroke="rgb(var(--edge))" strokeWidth="3" transform={`rotate(${a})`} />
            ))}
            <circle r="9" fill="rgb(var(--accent))" stroke="rgb(var(--edge))" strokeWidth="2" />
            <circle cx="0" cy="-60" r="5" fill="rgb(var(--accent2))" />
          </g>
        </g>
      </svg>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="glass-btn btn-primary shrink-0 select-none"
          onPointerDown={press(true)}
          onPointerUp={press(false)}
          onPointerLeave={press(false)}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (hold.current = true)}
          onKeyUp={() => (hold.current = false)}
        >
          Hold to spin up
        </button>
        <div className="h-3 flex-1 overflow-hidden border-2 border-[rgb(var(--edge))]" aria-hidden>
          <div className="h-full bg-[rgb(var(--accent))]" style={{ width: `${w * 100}%` }} />
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">It takes time to build speed, and it keeps spinning when you let go.</p>
    </div>
  );
}

function Intake() {
  const [on, setOn] = useState(true);
  return (
    <div>
      <svg viewBox="0 0 480 190" className="w-full border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)]" role="img" aria-label="Intake rollers pulling rings into a robot">
        <rect x="260" y="40" width="190" height="110" rx="6" fill="rgb(var(--paper))" stroke="rgb(var(--edge))" strokeWidth="2.5" />
        <line x1="20" x2="260" y1="132" y2="132" stroke="rgb(var(--edge))" strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <g key={i} className="vex-feed" style={{ animationDelay: `${i * -1.1}s`, animationPlayState: on ? "running" : "paused" }}>
            <circle cx="40" cy="112" r="12" fill="none" stroke={i % 2 ? "rgb(var(--accent2))" : "rgb(var(--accent))"} strokeWidth="6" />
          </g>
        ))}
        <g transform="translate(262 118)">
          <g className="vex-spin" style={{ animationDuration: "0.9s", animationPlayState: on ? "running" : "paused" }}>
            <circle r="16" fill="rgb(var(--tire))" stroke="rgb(var(--edge))" strokeWidth="2" />
            {[0, 90, 180, 270].map((a) => (
              <line key={a} y2="-16" stroke="rgb(var(--paper))" strokeWidth="3" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
        <g transform="translate(262 82)">
          <g className="vex-spin" style={{ animationDuration: "0.9s", animationDirection: "reverse", animationPlayState: on ? "running" : "paused" }}>
            <circle r="16" fill="rgb(var(--tire))" stroke="rgb(var(--edge))" strokeWidth="2" />
            {[0, 90, 180, 270].map((a) => (
              <line key={a} y2="-16" stroke="rgb(var(--paper))" strokeWidth="3" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
      </svg>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" aria-pressed={on} className="glass-btn" onClick={() => setOn((o) => !o)}>
          {on ? "Stop intake" : "Run intake"}
        </button>
        <p className="text-sm text-muted">Two rollers spinning opposite ways pull a piece in.</p>
      </div>
    </div>
  );
}

const MECH = [
  { id: "drive", label: "Drivetrain", el: <Drivetrain /> },
  { id: "fly", label: "Flywheel", el: <Flywheel /> },
  { id: "intake", label: "Intake", el: <Intake /> },
] as const;

function Mechanisms() {
  const [m, setM] = useState(0);
  return (
    <div>
      <div role="tablist" aria-label="Mechanism" className="flex flex-wrap gap-2">
        {MECH.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            aria-selected={i === m}
            onClick={() => setM(i)}
            className={`glass-btn !min-h-[34px] !px-3 !text-[0.78rem] ${i === m ? "btn-primary" : ""}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-3">{MECH[m].el}</div>
    </div>
  );
}

/* ---------- Shell ---------- */

export default function VexWorkshop() {
  const [tab, setTab] = useState<"field" | "mech">("field");
  return (
    <div>
      <div role="tablist" aria-label="VEX views" className="flex gap-2 border-b-2 border-[rgb(var(--edge)/0.3)] pb-3">
        {[
          ["field", "Game field"],
          ["mech", "What I built"],
        ].map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id as "field" | "mech")}
            className={`glass-btn !min-h-[36px] !px-3 !text-[0.8rem] ${tab === id ? "btn-primary" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tab === "field" ? <Field /> : <Mechanisms />}</div>
      <p className="mt-3 font-mono text-xs text-muted">Simplified drawings, not my actual robots.</p>
    </div>
  );
}
