"use client";

import { useEffect, useRef } from "react";
import { isMotionPaused } from "./motion";
import { prefersReducedMotion } from "./gravity";

/**
 * Stacks its children one per row and rolls them in and out like iOS notification cards:
 * a card entering from the bottom starts small, low and faint and settles into place;
 * a card leaving at the top shrinks and lingers a little, as if tucking under the next one.
 * Transform and opacity only, so layout never moves. Between the two edge zones every card
 * has no transform at all, and a card whose window is full-screen is left alone (a transformed
 * ancestor would break position: fixed).
 */
const NAV = 56;

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export default function RollList({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host || prefersReducedMotion()) return;
    let raf = 0;

    const clear = (el: HTMLElement) => {
      if (el.style.transform || el.style.opacity) {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.transformOrigin = "";
        el.style.willChange = "";
      }
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const still = isMotionPaused() || prefersReducedMotion();
      for (const el of Array.from(host.children) as HTMLElement[]) {
        if (still || el.querySelector(".win-expanded")) {
          clear(el);
          continue;
        }
        const r = el.getBoundingClientRect();
        // entering: the lower 38% of the screen
        const t = clamp((r.top - vh * 0.62) / (vh * 0.38));
        // leaving: its top edge passes under the nav bar
        const p = clamp((NAV + 20 - r.top) / Math.min(r.height, vh * 0.55));
        if (t === 0 && p === 0) {
          clear(el);
          continue;
        }
        el.style.willChange = "transform, opacity";
        if (t > 0) {
          const e = 1 - Math.pow(1 - t, 2); // ease so the first scroll already shows motion
          el.style.transformOrigin = "50% 0";
          el.style.transform = `translateY(${(e * 56).toFixed(1)}px) scale(${(1 - e * 0.08).toFixed(4)})`;
          el.style.opacity = String((1 - e * 0.8).toFixed(3));
        } else {
          el.style.transformOrigin = "50% 0";
          el.style.transform = `translateY(${(p * 26).toFixed(1)}px) scale(${(1 - p * 0.07).toFixed(4)})`;
          el.style.opacity = String((1 - p * 0.6).toFixed(3));
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const mo = new MutationObserver(schedule); // a window going full-screen or closing
    mo.observe(host, { subtree: true, attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      for (const el of Array.from(host.children) as HTMLElement[]) clear(el);
    };
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
