import { type Goal, type Kind, GX, NET_TOP, NET_X } from "./seasons";
import { INK, TIRE } from "./colors";

/** Loose piece, seen from above. */
export function PieceTop({ kind, c }: { kind: Kind; c: string }) {
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
export function PieceSide({ kind, c }: { kind: Kind; c: string }) {
  if (kind === "ring")
    return <ellipse rx="18" ry="5.5" fill="none" stroke={c} strokeWidth="5" />;
  if (kind === "disc")
    return <ellipse rx="16" ry="4.5" fill={c} stroke={INK} strokeWidth="1.5" />;
  return <PieceTop kind="tri" c={c} />;
}

export function GoalArt({ goal, front }: { goal: Goal; front?: boolean }) {
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
