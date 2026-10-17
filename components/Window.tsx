"use client";

import { useEffect, useRef, useState } from "react";

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
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [resizing, setResizing] = useState(false);
  const rs = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);
  const win = useRef<HTMLDivElement>(null);
  const MIN_W = 260, MIN_H = 140;

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

  // If the browser shrinks after a window was enlarged, keep it on screen.
  useEffect(() => {
    if (!size) return;
    const onResize = () =>
      setSize((s) => (s && s.w > window.innerWidth - 24 ? { ...s, w: Math.max(MIN_W, window.innerWidth - 24) } : s));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size]);

  const clampSize = (w: number, h: number) => ({
    w: Math.min(Math.max(w, MIN_W), Math.max(MIN_W, window.innerWidth - 24)),
    h: Math.max(h, MIN_H),
  });

  const onGripDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    front();
    const r = win.current!.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    rs.current = { sx: e.clientX, sy: e.clientY, w: r.width, h: r.height };
    setResizing(true);
  };
  const onGripMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = rs.current;
    if (!d) return;
    setSize(clampSize(d.w + e.clientX - d.sx, d.h + e.clientY - d.sy));
  };
  const endResize = () => {
    rs.current = null;
    setResizing(false);
  };
  const onGripKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 48 : 16;
    const m: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = m[e.key];
    if (!d) return;
    e.preventDefault();
    const r = win.current!.getBoundingClientRect();
    const cur = size ?? { w: r.width, h: r.height };
    setSize(clampSize(cur.w + d[0], cur.h + d[1]));
  };

  return (
    <div
      ref={win}
      className={`win ${dragging || resizing ? "is-dragging" : ""} ${size ? "flex flex-col" : ""} ${className}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: z,
        ...(size ? { width: size.w, height: collapsed ? undefined : size.h, maxWidth: "none" } : {}),
      }}
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
          aria-label="Reset window position and size"
          onClick={() => {
            setPos({ x: 0, y: 0 });
            setSize(null);
          }}
        />
        <span className="win-title-wrap">
          <span className="win-title">{title}</span>
        </span>
        {/* spacer so the title stays centered between the dots and the edge */}
        <span aria-hidden className="w-[3.1rem] flex-none" />
      </div>

      {!collapsed && <div className={size ? "min-h-0 flex-1 overflow-auto" : ""}>{children}</div>}

      {!collapsed && (
        <button
          type="button"
          className="win-grip"
          aria-label={`Resize ${title} window. Drag, or use arrow keys.`}
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onKeyDown={onGripKey}
        />
      )}
    </div>
  );
}
