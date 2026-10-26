"use client";

import { useEffect, useRef } from "react";
import { isMotionPaused } from "./motion";

/**
 * Custom cursor for mouse users: a small dot that sticks to the pointer and a ring that trails it.
 * The ring grows over links and buttons, shrinks while pressed, and turns into a caret over text
 * fields. The real cursor is never hidden over inputs or while dragging windows, so nothing about
 * the site depends on it. Not mounted for touch or reduced motion.
 */
export default function Cursor() {
  const ball = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, seen = false;
    const tick = () => {
      const k = isMotionPaused() ? 1 : 0.42;
      rx += (x - rx) * k;
      ry += (y - ry) * k;
      ball.current?.style.setProperty("transform", `translate3d(${rx}px,${ry}px,0)`);
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const kindOf = (el: Element | null) => {
      if (el?.closest("input, textarea, [contenteditable='true']")) return "text";
      if (el?.closest(".menubar")) return "nav";
      if (el?.closest(".win-bar")) return "grab";
      if (el?.closest("a, button, summary, [role='button'], [role='option'], .drive-scene, label")) return "link";
      return "";
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; rx = x; ry = y; root.classList.add("cursor-on"); }
      root.dataset.cursor = kindOf(e.target as Element);
      kick();
    };
    const down = () => root.classList.add("cursor-down");
    const up = () => root.classList.remove("cursor-down");
    const leave = () => { seen = false; root.classList.remove("cursor-on"); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
      root.classList.remove("has-cursor", "cursor-on", "cursor-down");
      delete root.dataset.cursor;
    };
  }, []);

  return <div ref={ball} aria-hidden className="c-ball" />;
}
