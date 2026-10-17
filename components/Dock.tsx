"use client";

import { useDock } from "./windowDock";

/** Floating dock at the bottom of the screen. Minimized windows live here. */
export default function Dock() {
  const items = useDock();
  if (items.length === 0) return null;
  return (
    <nav aria-label="Minimized windows" className="win-dock">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className="win-dock-item"
          onClick={it.restore}
          aria-label={`Restore ${it.title}`}
        >
          <span aria-hidden className="win-dock-icon">
            <span className="win-dock-lines" />
            <span className="win-dock-lines" />
            <span className="win-dock-lines w-1/2" />
          </span>
          <span className="win-dock-tip">{it.title}</span>
          <span aria-hidden className="win-dock-dot" />
        </button>
      ))}
    </nav>
  );
}
