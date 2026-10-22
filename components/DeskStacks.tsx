"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useReducer, useRef, useState } from "react";
import { SECTIONS, useAnyExpanded, useDock, type DockItem, type Section } from "./windowDock";
import { DESK_MIN, NAV_H, STACK_W, activeSections, clampPos, savePos, stackPos, type Pos } from "./stackLayout";

/**
 * Minimized windows, kept as little piles of paper: one stack per page section,
 * with a clip on top and a count of what's in it. Click a stack to fan its cards
 * out, then pick a card to bring that window back.
 */

const ROT = [-3, 7, -9]; // top card first
const OFF: [number, number][] = [
  [0, 0],
  [6, -2],
  [-6, 4],
];

function Clip() {
  return (
    <svg aria-hidden className="dstk-clip" viewBox="0 0 15 30" width="12" height="24">
      <path className="dstk-clip-halo" d="M5 9v12a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v17a5.5 5.5 0 0 0 11 0V8" />
      <path className="dstk-clip-wire" d="M5 9v12a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v17a5.5 5.5 0 0 0 11 0V8" />
    </svg>
  );
}

/** A tiny copy of a window: title bar with the three dots, the title, a few ruled lines. */
function MiniWin({ title, className = "", style }: { title?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span aria-hidden className={`dstk-card ${className}`} style={style}>
      <span className="dstk-card-bar">
        <i className="win-dot win-dot-close dstk-dot" />
        <i className="win-dot win-dot-min dstk-dot" />
        <i className="win-dot win-dot-reset dstk-dot" />
        {title && <span className="dstk-card-title">{title}</span>}
      </span>
      <span className="dstk-card-lines">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

type Group = { id: Section; label: string; items: DockItem[] };

export default function DeskStacks() {
  const items = useDock();
  const away = useAnyExpanded();
  const [desk, setDesk] = useState(true);
  const [tick, relayout] = useReducer((n: number) => n + 1, 0);
  const [open, setOpen] = useState<Section | null>(null);
  const [drag, setDrag] = useState<{ s: Section; p: Pos } | null>(null);
  const [fanAt, setFanAt] = useState<React.CSSProperties | null>(null);
  const fanId = useId();

  const dragRef = useRef<{ s: Section; sx: number; sy: number; o: Pos; moved: boolean } | null>(null);
  const swallowClick = useRef(false);
  const focusFirst = useRef(false);
  const fan = useRef<HTMLDivElement>(null);

  const groups: Group[] = SECTIONS.map((s) => ({ ...s, items: items.filter((i) => i.section === s.id) })).filter(
    (g) => g.items.length > 0,
  );
  const active = groups.map((g) => g.id);
  const openGroup = groups.find((g) => g.id === open) ?? null;
  const openCount = openGroup?.items.length ?? 0;

  useEffect(() => {
    const mq = matchMedia(`(min-width: ${DESK_MIN}px)`);
    const sync = () => setDesk(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", relayout);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", relayout);
    };
  }, []);

  // the strip on small screens reserves room at the bottom of the page
  const strip = !desk && groups.length > 0;
  useEffect(() => {
    document.documentElement.classList.toggle("has-dstk-strip", strip);
    return () => document.documentElement.classList.remove("has-dstk-strip");
  }, [strip]);

  // an emptied stack, a maximized window or a drag closes the fan
  useEffect(() => {
    if ((open && !openGroup) || away || drag) setOpen(null);
  }, [open, openGroup, away, drag]);

  const close = useCallback((refocus: boolean) => {
    setOpen((o) => {
      if (o && refocus)
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-stack="${o}"] .dstk-icon`)?.focus());
      return null;
    });
  }, []);

  // place the fan beside its stack (desk) or above it (strip), kept on screen
  useLayoutEffect(() => {
    if (!openGroup) return setFanAt(null);
    const icon = document.querySelector<HTMLElement>(`[data-stack="${openGroup.id}"] .dstk-icon`);
    if (!icon) return;
    const r = icon.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const w = Math.min(220, vw - 24);
    const h = openGroup.items.length * 66 + 24;
    if (desk) {
      const left = r.left > vw / 2 ? r.left - w - 14 : r.right + 14;
      const top = Math.min(Math.max(r.top - 8, NAV_H + 8), Math.max(NAV_H + 8, vh - h - 8));
      setFanAt({ left, top, width: w, maxHeight: vh - NAV_H - 16, "--fx": `${r.left > vw / 2 ? 60 : -60}px`, "--fy": "0px" } as React.CSSProperties);
    } else {
      const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 12), vw - w - 12);
      setFanAt({ left, bottom: vh - r.top + 10, width: w, maxHeight: r.top - NAV_H - 20, "--fx": "0px", "--fy": "40px" } as React.CSSProperties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openCount, desk, tick]);

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      requestAnimationFrame(() => fan.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus());
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".dstk-fan") && !t.closest(`[data-stack="${open}"]`)) close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  if (groups.length === 0) return null;

  /* ---------- dragging a stack (wide screens only) ---------- */
  const onDown = (s: Section, e: React.PointerEvent<HTMLButtonElement>) => {
    swallowClick.current = false; // a release outside the window never sent its click
    if (!desk || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { s, sx: e.clientX, sy: e.clientY, o: stackPos(s, active), moved: false };
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    setDrag({ s: d.s, p: clampPos({ x: d.o.x + dx, y: d.o.y + dy }) });
  };
  const onUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d?.moved) return;
    swallowClick.current = true; // the click that follows a drag isn't an "open"
    setDrag((cur) => {
      if (cur) savePos(cur.s, cur.p);
      return null;
    });
  };

  const onIconClick = (s: Section, e: React.MouseEvent) => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    // Enter / Space arrive as a click with no pointer position: move focus into the fan
    focusFirst.current = e.detail === 0;
    setOpen((o) => (o === s ? null : s));
  };
  const onIconKey = (s: Section, e: React.KeyboardEvent) => {
    swallowClick.current = false;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      focusFirst.current = true;
      setOpen(s);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close(true);
    }
  };

  const onFanKey = (e: React.KeyboardEvent) => {
    const cards = Array.from(fan.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
    const i = cards.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      cards[(n + cards.length) % cards.length]?.focus();
    };
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(cards.length - 1);
    else if (e.key === "Tab") close(false);
  };

  const pick = (it: DockItem, e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOpen(null);
    it.restore(r);
  };

  return (
    <>
      <nav
        aria-label="Minimized windows"
        className={`${desk ? "dstk-desk" : "dstk-strip"} ${away ? "dstk-away" : ""}`}
        aria-hidden={away || undefined}
      >
        {groups.map((g) => {
          const n = g.items.length;
          const pile = g.items.slice(-3).reverse(); // newest on top
          const p = desk ? (drag?.s === g.id ? drag.p : stackPos(g.id, active)) : null;
          return (
            <div
              key={g.id}
              data-stack={g.id}
              className={`dstk ${drag?.s === g.id ? "is-dragging" : ""} ${open === g.id ? "is-open" : ""}`}
              style={p ? { left: p.x, top: p.y, width: STACK_W } : undefined}
            >
              <button
                type="button"
                className="dstk-icon"
                aria-label={`${g.label}, ${n} minimized window${n === 1 ? "" : "s"}`}
                aria-haspopup="menu"
                aria-expanded={open === g.id}
                aria-controls={open === g.id ? fanId : undefined}
                tabIndex={away ? -1 : 0}
                onPointerDown={(e) => onDown(g.id, e)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onClick={(e) => onIconClick(g.id, e)}
                onKeyDown={(e) => onIconKey(g.id, e)}
              >
                <span aria-hidden className="dstk-pile">
                  {pile
                    .map((it, d) => (
                      <MiniWin
                        key={it.id}
                        title={d === 0 ? it.title : undefined}
                        style={{ "--r": `${ROT[d]}deg`, "--ox": `${OFF[d][0]}px`, "--oy": `${OFF[d][1]}px` } as React.CSSProperties}
                      />
                    ))
                    .reverse()}
                  <Clip />
                  <span className="dstk-badge">{n}</span>
                </span>
                <span aria-hidden className="dstk-label">
                  {g.label}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {openGroup && fanAt && (
        <div
          ref={fan}
          id={fanId}
          role="menu"
          aria-label={`${openGroup.label}: pick a window to restore`}
          className="dstk-fan"
          style={fanAt}
          onKeyDown={onFanKey}
        >
          {openGroup.items
            .slice()
            .reverse()
            .map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="menuitem"
                tabIndex={i === 0 ? 0 : -1}
                className="dstk-fan-card"
                style={{ "--i": i, "--r": `${i % 2 ? 1.6 : -1.4}deg` } as React.CSSProperties}
                aria-label={`Restore ${it.title}`}
                onClick={(e) => pick(it, e)}
              >
                <MiniWin title={it.title} className="is-big" />
              </button>
            ))}
        </div>
      )}
    </>
  );
}
