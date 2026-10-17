"use client";

import { useRef, useState } from "react";

// Shared across all windows so whichever you touch last sits on top.
let topZ = 1;

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Window({ title, children, className = "" }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [z, setZ] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const front = () => setZ(++topZ);

  if (!open) {
    return (
      <button
        type="button"
        className="glass-btn"
        onClick={() => {
          setOpen(true);
          front();
        }}
      >
        Reopen {title}
      </button>
    );
  }

  const onBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    setDragging(true);
  };

  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const onBarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 48 : 16;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setPos((p) => ({ x: p.x + m[0], y: p.y + m[1] }));
  };

  return (
    <div
      className={`win ${dragging ? "is-dragging" : ""} ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex: z }}
      onPointerDown={front}
    >
      <div
        className="win-bar"
        tabIndex={0}
        aria-label={`${title} window. Drag the title bar, or use arrow keys to move.`}
        onPointerDown={onBarPointerDown}
        onPointerMove={onBarPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onBarKeyDown}
      >
        <button
          type="button"
          className="win-dot win-dot-close"
          aria-label="Close window"
          onClick={() => setOpen(false)}
        />
        <button
          type="button"
          className="win-dot win-dot-min"
          aria-label={collapsed ? "Expand window" : "Collapse window"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        />
        <button
          type="button"
          className="win-dot win-dot-reset"
          aria-label="Reset window position"
          onClick={() => setPos({ x: 0, y: 0 })}
        />
        <span className="win-title-wrap">
          <span className="win-title">{title}</span>
        </span>
        {/* spacer so the title stays centered between the dots and the edge */}
        <span aria-hidden className="w-[3.1rem] flex-none" />
      </div>

      {!collapsed && <div>{children}</div>}
    </div>
  );
}
