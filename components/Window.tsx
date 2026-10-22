"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { dockAdd, dockRemove, setWindowExpanded, type Section } from "./windowDock";
import { stackAnchor, NAV_H } from "./stackLayout";
import { isMotionPaused } from "./motion";
import { prefersReducedMotion, useGravity } from "./gravity";
import { useSwing } from "./useSwing";
import { useSpringPosition } from "./useSpringPosition";

// Shared across all windows so whichever you touch last sits on top.
let topZ = 1;

const MIN_W = 260;
const MIN_H = 140;
const CLOSE_MSG = "Nice try! System cannot be closed without hiring Kunjal first.";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Which desk stack this window joins when minimized. */
  section?: Section;
};

// Motion paused (site toggle) or reduced motion: windows just appear and disappear.
const instant = () => isMotionPaused() || prefersReducedMotion();

export default function Window({ title, children, className = "", section = "other" }: Props) {
  const id = useId();
  const [z, setZ] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [resizing, setResizing] = useState(false);
  const [minState, setMinState] = useState<"off" | "going" | "on" | "back">("off");
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(false);
  const [slotH, setSlotH] = useState(0);

  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const rs = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);
  const win = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const backFrom = useRef<DOMRect | null>(null);

  // Gravity mode: each window hangs from its title bar and swings.
  const gravity = useGravity();
  // Spring-driven position: trails the pointer a little, leans while carried, settles on release.
  // In gravity mode the pendulum does the swinging, so the carry-lean is switched off.
  const spring = useSpringPosition(win, !gravity);
  const pivotX = useMemo(
    () => ({
      get current() {
        return spring.state.current.x;
      },
    }) as React.MutableRefObject<number>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const seed = useRef(0);
  if (seed.current === 0) {
    let h = 7;
    for (const c of title) h = (h * 31 + c.charCodeAt(0)) | 0;
    seed.current = ((Math.abs(h) % 1000) / 1000) * 1.4 - 0.7 || 0.3; // -0.7..0.7, which way it hangs off-center
  }
  const front = () => setZ(++topZ);

  /* ---------- red: playful refusal ---------- */
  const pokeClose = () => {
    clearTimeout(toastTimer.current);
    setToast((t) => {
      if (!t) toastTimer.current = setTimeout(() => setToast(false), 4500);
      return !t;
    });
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------- yellow: minimize to a desk stack ---------- */
  const restore = useCallback(
    (from?: DOMRect | null) => {
      dockRemove(id);
      backFrom.current = from ?? null;
      setMinState("back");
      setZ(++topZ);
      setTimeout(() => setMinState("off"), instant() ? 0 : 260);
    },
    [id],
  );

  const minimize = () => {
    if (expanded) setExpanded(false);
    setToast(false);
    const hadFocus = !!win.current?.contains(document.activeElement);
    const done = () => {
      setMinState("on");
      dockAdd({ id, title, section, node: win.current, restore });
      // keyboard users land on the stack the window went into
      if (hadFocus)
        requestAnimationFrame(() =>
          document.querySelector<HTMLElement>(`[data-stack="${section}"] .dstk-icon`)?.focus({ preventScroll: true }),
        );
    };
    if (instant()) return done();
    setMinState("going");
    setTimeout(done, 240);
  };
  useEffect(() => () => dockRemove(id), [id]);

  // Aim the shrink (or the grow-back) at the stack, or at the fanned card that was picked.
  useLayoutEffect(() => {
    const node = win.current;
    if (!node || (minState !== "going" && minState !== "back")) return;
    // measure without the animation's first frame applied
    node.style.animation = "none";
    let r = node.getBoundingClientRect();
    if (minState === "back") {
      if (r.top < NAV_H + 16 || r.top > window.innerHeight * 0.7) {
        window.scrollTo({ top: window.scrollY + r.top - NAV_H - 48, behavior: "instant" });
        r = node.getBoundingClientRect();
      }
      node.querySelector<HTMLElement>(".win-bar")?.focus({ preventScroll: true });
    }
    const a = (minState === "back" && backFrom.current) || stackAnchor(section);
    const s = Math.min(0.3, Math.max(0.05, a.width / Math.max(1, r.width)));
    node.style.setProperty("--min-s", s.toFixed(3));
    node.style.setProperty("--min-dx", `${(a.left + a.width / 2 - (r.left + r.width / 2)).toFixed(1)}px`);
    node.style.setProperty("--min-dy", `${(a.top + a.height / 2 - r.top - (r.height * s) / 2).toFixed(1)}px`);
    node.style.animation = "";
  }, [minState, section]);

  /* ---------- green: expand / restore ---------- */
  const toggleExpand = () => {
    if (!expanded) {
      setSlotH(win.current?.getBoundingClientRect().height ?? 0);
      front();
    }
    setExpanded((x) => !x);
  };
  useEffect(() => {
    if (!expanded) return;
    setWindowExpanded(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setWindowExpanded(false);
    };
  }, [expanded]);

  /* ---------- dragging ---------- */
  const onBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (expanded || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const o = spring.grab();
    drag.current = { sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y };
    setDragging(true);
  };
  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    spring.moveTo(d.ox + e.clientX - d.sx, d.oy + e.clientY - d.sy);
  };
  const endDrag = () => {
    if (drag.current) spring.release();
    drag.current = null;
    setDragging(false);
  };
  const onBarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (expanded) return;
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
    spring.nudge(m[0], m[1]);
  };
  const resetPlacement = () => {
    spring.reset();
    setSize(null);
  };

  /* ---------- resizing ---------- */
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

  const fixed = expanded;
  const sized = !!size && !expanded;
  useSwing(win, gravity && !expanded && minState === "off", pivotX, seed.current);

  return (
    <>
      {/* keeps the page layout from jumping while the window is full-screen */}
      {expanded && <div aria-hidden style={{ height: slotH }} />}
      {expanded && <div className="win-backdrop" onClick={() => setExpanded(false)} aria-hidden />}

      <div
        ref={win}
        className={[
          "win",
          dragging || resizing || expanded ? "is-dragging" : "",
          sized || fixed ? "flex flex-col" : "",
          minState === "going" ? "win-min-going" : "",
          minState === "back" ? "win-min-back" : "",
          minState === "on" ? "hidden" : "",
          fixed ? "win-expanded" : "",
          className,
        ].join(" ")}
        style={
          fixed
            ? { zIndex: 70 }
            : {
                transform:
                  "translate(var(--tx, 0px), var(--ty, 0px)) translateY(var(--drop, 0px)) rotate(calc(var(--swing, 0rad) + var(--lean, 0deg)))",
                transformOrigin: "50% 0",
                zIndex: z,
                ...(size ? { width: size.w, height: size.h, maxWidth: "none" } : {}),
              }
        }
        onPointerDown={front}
      >
        <div
          className="win-bar"
          tabIndex={0}
          aria-label={`${title} window. Drag the title bar, or use arrow keys to move. Double-click to reset position and size.`}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onBarKeyDown}
          onDoubleClick={(e) => {
            if (!(e.target as HTMLElement).closest("button")) resetPlacement();
          }}
        >
          <button
            type="button"
            className="win-dot win-dot-close"
            aria-label="Close window"
            aria-expanded={toast}
            onClick={pokeClose}
          />
          <button
            type="button"
            className="win-dot win-dot-min"
            aria-label={`Minimize ${title} to the desk`}
            onClick={minimize}
          />
          <button
            type="button"
            className="win-dot win-dot-reset"
            aria-label={expanded ? "Exit full screen" : "Expand window to full screen"}
            aria-pressed={expanded}
            onClick={toggleExpand}
          />
          <span className="win-title-wrap">
            <span className="win-title">{title}</span>
          </span>
          {/* spacer so the title stays centered between the dots and the edge */}
          <span aria-hidden className="w-[3.1rem] flex-none" />
        </div>

        <div className={sized || fixed ? "min-h-0 flex-1 overflow-auto" : ""}>{children}</div>

        {toast && (
          <button type="button" role="status" className="win-toast" onClick={pokeClose}>
            <span>{CLOSE_MSG}</span>
          </button>
        )}

        {!expanded && (
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
    </>
  );
}
