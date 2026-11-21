"use client";

import { useEffect, useRef, useState } from "react";
import { isMotionPaused, useReducedMotion } from "./motion";

type Sky = { top: string; low: string };

/**
 * Light/dark switch drawn as a tiny landscape: a low sun behind the hills in light mode,
 * a moon and stars in dark mode. All visuals are driven by html[data-theme] in CSS, so the
 * first paint already matches the stored theme (the inline script in layout sets it).
 * State here only feeds aria-checked and the cross-fade ghost.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [ghost, setGhost] = useState<{ id: number; sky: Sky } | null>(null);
  const reduced = useReducedMotion();
  const pill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
    // enable transitions only after the first paint, so a stored dark theme never animates in
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    if (!reduced && !isMotionPaused()) {
      // remember the old sky colours (own --ts-* tokens) so the pill can cross-fade from them
      const cs = getComputedStyle(pill.current ?? root);
      const read = (v: string) => cs.getPropertyValue(v).trim();
      setGhost({ id: Date.now(), sky: { top: read("--ts-a"), low: read("--ts-b") } });
    } else {
      setGhost(null);
    }
    setDark(!dark);
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable; theme still applies for this visit */
    }
  };

  const instant = reduced || isMotionPaused();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={toggle}
      className="theme-switch"
      data-ready={ready && !instant ? "" : undefined}
    >
      <span className="theme-pill" ref={pill}>
        <span className="theme-sky" aria-hidden />
        {ghost && (
          <span
            key={ghost.id}
            className="theme-sky theme-ghost"
            aria-hidden
            style={
              {
                "--gt": ghost.sky.top,
                "--gl": ghost.sky.low,
              } as React.CSSProperties
            }
            onAnimationEnd={() => setGhost(null)}
          />
        )}
        <svg className="theme-stars" viewBox="0 0 56 28" aria-hidden>
          <circle cx="11" cy="8" r="1" />
          <circle cx="19" cy="17" r="0.8" />
          <circle cx="25" cy="7" r="1.1" />
        </svg>
        <span className="theme-disc" aria-hidden>
          <span className="theme-sun" />
          <span className="theme-moon">
            <i />
            <i />
          </span>
        </span>
        <svg className="theme-land" viewBox="0 0 56 28" aria-hidden>
          <path className="theme-hill" d="M0 28V22.5C9 17.5 17 17.5 27 21.5S46 23 56 18.5V28Z" />
        </svg>
      </span>
    </button>
  );
}
