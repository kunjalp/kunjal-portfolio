"use client";

import { useRef, useState } from "react";
import TabBar from "./TabBar";
import { GoalArt, PieceSide, PieceTop } from "./Pieces";
import { GX, H, SEASONS, TILE, W, ZONE, fresh, slotPos, type P } from "./seasons";
import { C1, C2 } from "./colors";

export default function GameField() {
  const [season, setSeason] = useState(0);
  const s = SEASONS[season];
  return (
    <div>
      <TabBar
        label="VRC season"
        tabs={SEASONS.map((x, i) => ({ id: i, label: x.years }))}
        value={season}
        onChange={setSeason}
      />
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
