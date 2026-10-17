"use client";

import { useEffect, useRef, useState } from "react";

const INK = "rgb(var(--edge))";
const PAPER = "rgb(var(--paper))";
const TIRE = "rgb(var(--tire))";
const C1 = "rgb(var(--accent))";
const C2 = "rgb(var(--accent2))";

/* ================= Game field ================= */

type Kind = "ring" | "disc" | "tri";
type Goal = "mogo" | "hexgoal" | "box" | "net";

const SEASONS: { id: string; years: string; game: string; piece: Kind; goal: Goal; note: string }[] = [
  { id: "tp", years: "2021–22", game: "Tipping Point", piece: "ring", goal: "mogo", note: "Rings go onto mobile goals." },
  { id: "su", years: "2022–23", game: "Spin Up", piece: "disc", goal: "box", note: "Discs go into the goals." },
  { id: "ou", years: "2023–24", game: "Over Under", piece: "tri", goal: "net", note: "Triballs go into the goal." },
  { id: "hs", years: "2024–25", game: "High Stakes", piece: "ring", goal: "hexgoal", note: "Rings go onto stakes." },
];

const W = 480, H = 210, TILE = 35;
const ZONE = { x: 318, y: 26, w: 144, h: 170 };
const GX = ZONE.x + ZONE.w / 2; // goal center x
const START: [number, number][] = [
  [42, 160], [86, 176], [128, 152], [60, 112], [108, 118], [168, 178], [34, 66], [150, 92],
];

type P = { x: number; y: number; slot: number | null };
const fresh = (): P[] => START.map(([x, y]) => ({ x, y, slot: null }));

// Over Under goal, seen from the side: mouth faces the field (left).
const NET_X = ZONE.x + 12;
const NET_TOP = 96;
const NET_SLOTS: [number, number][] = [
  [22, 172], [48, 172], [74, 172], [100, 172], [22, 147], [48, 147], [74, 147], [34, 122],
];

function slotPos(goal: Goal, n: number) {
  if (goal === "mogo" || goal === "hexgoal") return { x: GX, y: 170 - n * 11 };
  if (goal === "box") return { x: GX + (n % 2 ? 13 : -13), y: 143 - Math.floor(n / 2) * 7 };
  const [dx, y] = NET_SLOTS[n] ?? NET_SLOTS[NET_SLOTS.length - 1];
  return { x: NET_X + dx, y };
}

/** Loose piece, seen from above. */
function PieceTop({ kind, c }: { kind: Kind; c: string }) {
  if (kind === "ring")
    return (
      <>
        <circle r="13" fill="none" stroke={INK} strokeWidth="9" />
        <circle r="13" fill="none" stroke={c} strokeWidth="6" />
      </>
    );
  if (kind === "disc")
    return (
      <>
        <circle r="14" fill={c} stroke={INK} strokeWidth="2" />
        <circle r="8" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.6" />
      </>
    );
  return (
    <path
      d="M0 -15 Q2 -15 15 9 Q16 12 12 12 H-12 Q-16 12 -15 9 Q-2 -15 0 -15Z"
      fill={c}
      stroke={INK}
      strokeWidth="2"
    />
  );
}

/** Scored piece, seen from the side (stacked on a stake or in a goal). */
function PieceSide({ kind, c }: { kind: Kind; c: string }) {
  if (kind === "ring")
    return <ellipse rx="18" ry="5.5" fill="none" stroke={c} strokeWidth="5" />;
  if (kind === "disc")
    return <ellipse rx="16" ry="4.5" fill={c} stroke={INK} strokeWidth="1.5" />;
  return <PieceTop kind="tri" c={c} />;
}

function GoalArt({ goal, front }: { goal: Goal; front?: boolean }) {
  const base = 184;
  if (goal === "mogo" || goal === "hexgoal") {
    if (front) return null;
    return (
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        {goal === "mogo" ? (
          <path d={`M${GX - 54} ${base} L${GX - 44} ${base - 12} H${GX + 44} L${GX + 54} ${base} Z`} fill="rgb(var(--sun, 214 176 92) / 0.9)" />
        ) : (
          <polygon
            points={`${GX - 50},${base - 6} ${GX - 30},${base - 14} ${GX + 30},${base - 14} ${GX + 50},${base - 6} ${GX + 30},${base + 2} ${GX - 30},${base + 2}`}
            fill="rgb(var(--paper2))"
          />
        )}
        <rect x={GX - 3} y={70} width="6" height={base - 82} fill={TIRE} />
        <circle cx={GX} cy={70} r="4" fill={TIRE} />
      </g>
    );
  }
  if (goal === "box") {
    // Spin Up high goal, drawn like a disc-golf basket: pole, catch band, chains, basket.
    const bandY = 46, bandW = 108, chainY = 126;
    const tray = { top: 128, bot: 152, wTop: 100, wBot: 64 };
    const trayPath = `M${GX - tray.wTop / 2} ${tray.top} L${GX - tray.wBot / 2} ${tray.bot} H${GX + tray.wBot / 2} L${GX + tray.wTop / 2} ${tray.top}`;
    if (front)
      return (
        <g stroke={INK} strokeLinejoin="round">
          <path d={trayPath} fill="none" strokeWidth="3" />
          {[-30, -10, 10, 30].map((d) => (
            <line key={d} x1={GX + d * (tray.wTop / 100)} x2={GX + d * (tray.wBot / 100)} y1={tray.top} y2={tray.bot} strokeWidth="1.5" opacity="0.5" />
          ))}
          <ellipse cx={GX} cy={tray.top} rx={tray.wTop / 2} ry="5" fill="none" strokeWidth="2.5" />
          {/* front half of the catch band */}
          <path d={`M${GX - bandW / 2} ${bandY} A ${bandW / 2} 6 0 0 0 ${GX + bandW / 2} ${bandY}`} fill="none" stroke="rgb(var(--muted))" strokeWidth="5" />
        </g>
      );
    return (
      <g stroke={INK} strokeLinejoin="round">
        {/* pole + foot */}
        <rect x={GX - 3} y={bandY - 10} width="6" height={base - bandY + 10} fill={TIRE} strokeWidth="1.5" />
        <path d={`M${GX - 30} ${base} L${GX - 18} ${base - 8} H${GX + 18} L${GX + 30} ${base} Z`} fill="rgb(var(--paper2))" strokeWidth="2.5" />
        {/* back half of the catch band */}
        <path d={`M${GX - bandW / 2} ${bandY} A ${bandW / 2} 6 0 0 1 ${GX + bandW / 2} ${bandY}`} fill="none" stroke="rgb(var(--muted))" strokeWidth="5" />
        {/* chains: band edge sweeping in to the pole */}
        {[-1, -0.66, -0.33, 0.33, 0.66, 1].map((k) => (
          <path
            key={k}
            d={`M${GX + (k * bandW) / 2} ${bandY + 2} Q ${GX + (k * bandW) / 3} ${(bandY + chainY) / 2} ${GX + k * 6} ${chainY}`}
            fill="none"
            strokeWidth="1.6"
            strokeDasharray="3 2"
            opacity="0.75"
          />
        ))}
        <path d={`${trayPath} Z`} fill="rgb(var(--paper2) / 0.95)" strokeWidth="0" />
      </g>
    );
  }
  // Over Under goal, side view: front post at the mouth, top bar, net sloping to the back.
  const x0 = NET_X, top = NET_TOP, bar = 70, back = 126;
  const outline = `M${x0} ${base} V${top} H${x0 + bar} L${x0 + back} ${base}`;
  const mesh = (
    <>
      {Array.from({ length: 9 }, (_, n) => {
        const x = x0 + 8 + n * 14;
        const yTop = x <= x0 + bar ? top : top + ((x - x0 - bar) / (back - bar)) * (base - top);
        return x < x0 + back ? <line key={`v${n}`} x1={x} x2={x} y1={yTop} y2={base} /> : null;
      })}
      {Array.from({ length: 6 }, (_, n) => {
        const y = top + 14 + n * 14;
        const xEnd = x0 + bar + ((y - top) / (base - top)) * (back - bar);
        return <line key={`h${n}`} x1={x0} x2={xEnd} y1={y} y2={y} />;
      })}
    </>
  );
  return front ? (
    <g stroke={INK} fill="none" strokeLinejoin="round">
      <g strokeWidth="1" opacity="0.4">{mesh}</g>
      <path d={outline} strokeWidth="3.5" />
      <rect x={x0 - 4} y={top - 4} width="8" height={base - top + 4} fill="rgb(var(--muted))" strokeWidth="2" />
    </g>
  ) : (
    <path d={`${outline} Z`} fill="rgb(var(--paper2) / 0.85)" stroke="none" />
  );
}

function Field() {
  const [season, setSeason] = useState(0);
  const s = SEASONS[season];
  return (
    <div>
      <div role="tablist" aria-label="VRC season" className="flex flex-wrap gap-2">
        {SEASONS.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            aria-selected={i === season}
            onClick={() => setSeason(i)}
            className={`glass-btn !min-h-[34px] !px-3 !text-[0.78rem] ${i === season ? "btn-primary" : ""}`}
          >
            {x.years}
          </button>
        ))}
      </div>
      <Sandbox key={s.id} s={s} />
    </div>
  );
}

function Sandbox({ s }: { s: (typeof SEASONS)[number] }) {
  const [pieces, setPieces] = useState<P[]>(fresh);
  const [dragging, setDragging] = useState<number | null>(null);
  const [pop, setPop] = useState(0);
  const off = useRef({ dx: 0, dy: 0 });
  const svg = useRef<SVGSVGElement>(null);

  const pt = (e: React.PointerEvent) => {
    const b = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * W, y: ((e.clientY - b.top) / b.height) * H };
  };
  const inZone = (p: { x: number; y: number }) =>
    p.x > ZONE.x && p.x < ZONE.x + ZONE.w && p.y > ZONE.y && p.y < ZONE.y + ZONE.h;
  const where = (p: P) => (p.slot === null ? p : slotPos(s.goal, p.slot));
  const scored = pieces.filter((p) => p.slot !== null).length;

  const down = (i: number) => (e: React.PointerEvent<SVGGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const q = pt(e);
    const cur = where(pieces[i]);
    off.current = { dx: q.x - cur.x, dy: q.y - cur.y };
    setPieces((arr) => {
      const was = arr[i].slot;
      return arr.map((p, k) => {
        if (k === i) return { x: cur.x, y: cur.y, slot: null };
        if (was !== null && p.slot !== null && p.slot > was) return { ...p, slot: p.slot - 1 };
        return p;
      });
    });
    setDragging(i);
  };

  const move = (e: React.PointerEvent) => {
    if (dragging === null) return;
    const q = pt(e);
    const x = Math.min(W - 16, Math.max(16, q.x - off.current.dx));
    const y = Math.min(H - 16, Math.max(16, q.y - off.current.dy));
    setPieces((arr) => arr.map((p, k) => (k === dragging ? { ...p, x, y } : p)));
  };

  const up = () => {
    if (dragging === null) return;
    const i = dragging;
    setPieces((arr) => {
      if (!inZone(arr[i])) return arr;
      const n = arr.filter((p) => p.slot !== null).length;
      setPop((v) => v + 1);
      return arr.map((p, k) => (k === i ? { ...p, slot: n } : p));
    });
    setDragging(null);
  };

  const renderPiece = (p: P, i: number) => {
    const at = where(p);
    const side = p.slot !== null && s.piece !== "tri";
    const c = i % 2 ? C2 : C1;
    return (
      <g
        key={i}
        onPointerDown={down(i)}
        className={dragging === i ? "cursor-grabbing" : "cursor-grab"}
        style={{
          transform: `translate(${at.x}px, ${at.y}px) scale(${dragging === i ? 1.12 : 1})`,
          transition: dragging === i ? "none" : "transform 320ms cubic-bezier(.3,1.5,.5,1)",
        }}
      >
        <circle r="22" fill="transparent" />
        {side ? <PieceSide kind={s.piece} c={c} /> : <PieceTop kind={s.piece} c={c} />}
      </g>
    );
  };

  return (
    <div className="mt-3">
      <p className="text-sm">
        <span className="font-bold">{s.game}</span>{" "}
        <span className="text-muted">· {s.note} Drag the pieces in.</span>
      </p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full touch-none select-none rounded-sm border-[3px] border-[rgb(var(--edge))]"
        role="img"
        aria-label={`${s.game} sandbox: drag game pieces into the goal`}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {/* foam tiles */}
        {Array.from({ length: Math.ceil(W / TILE) * Math.ceil(H / TILE) }, (_, k) => {
          const cx = k % Math.ceil(W / TILE), cy = Math.floor(k / Math.ceil(W / TILE));
          return (
            <rect
              key={k}
              x={cx * TILE}
              y={cy * TILE}
              width={TILE}
              height={TILE}
              fill={`rgb(var(--paper2) / ${(cx + cy) % 2 ? 0.95 : 0.6})`}
              stroke="rgb(var(--edge) / 0.12)"
            />
          );
        })}
        {/* tape lines */}
        <line x1={W / 2 - 20} x2={W / 2 - 20} y1="0" y2={H} stroke="rgb(255 255 255 / 0.6)" strokeWidth="4" />
        <rect x={ZONE.x} y={ZONE.y} width={ZONE.w} height={ZONE.h} fill="rgb(var(--accent2) / 0.1)" stroke={C2} strokeWidth="2" strokeDasharray="6 5" rx="4" />

        <GoalArt goal={s.goal} />
        {pieces.map((p, i) => (p.slot !== null && dragging !== i ? renderPiece(p, i) : null))}
        <GoalArt goal={s.goal} front />
        {pieces.map((p, i) => (p.slot === null || dragging === i ? renderPiece(p, i) : null))}

        {pop > 0 && (
          <text key={pop} x={GX} y={ZONE.y + 18} textAnchor="middle" className="vex-pop font-mono" fontSize="14" fontWeight="700" fill={C1}>
            +1
          </text>
        )}
      </svg>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-mono" aria-live="polite">
          scored {scored} / {pieces.length}
          {scored === pieces.length && <span className="ml-2 text-[rgb(var(--accent))]">· full clear!</span>}
        </span>
        <button type="button" className="glass-btn !min-h-[32px] !px-3 !text-[0.78rem]" onClick={() => setPieces(fresh())}>
          Reset
        </button>
      </div>
    </div>
  );
}

/* ================= Mechanisms ================= */

const dur = (v: number) => `${Math.max(0.22, 2.6 - v * 2.4)}s`;

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

function CChannel({ x, y, w, h = 18 }: { x: number; y: number; w: number; h?: number }) {
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

function Drivetrain() {
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

type Shot = { x: number; y: number; vx: number; vy: number; done: boolean; made: boolean };
const FW = { x: 120, y: 112, r: 50 };
const TARGET = { x1: 388, x2: 452, y: 112 };

function Flywheel() {
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
          className="glass-btn shrink-0 select-none"
          onPointerDown={press(true)}
          onPointerUp={press(false)}
          onPointerLeave={press(false)}
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

function Intake() {
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

const MECH = [
  { id: "drive", label: "Drivetrain", El: Drivetrain },
  { id: "fly", label: "Flywheel", El: Flywheel },
  { id: "intake", label: "Intake", El: Intake },
] as const;

function Mechanisms() {
  const [m, setM] = useState(0);
  const El = MECH[m].El;
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
      <div className="mt-3">
        <El />
      </div>
    </div>
  );
}

/* ================= Shell ================= */

export default function VexWorkshop() {
  const [tab, setTab] = useState<"field" | "mech">("field");
  return (
    <div>
      <div role="tablist" aria-label="VEX views" className="flex gap-2 border-b-2 border-[rgb(var(--edge)/0.3)] pb-3">
        {(
          [
            ["field", "Game field"],
            ["mech", "What I built"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
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
