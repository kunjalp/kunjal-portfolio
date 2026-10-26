"use client";

import { useEffect } from "react";
import { isMotionPaused } from "./motion";

/**
 * Eased wheel scrolling: the wheel moves a target and the page glides toward it.
 * Mouse and trackpad on desktop only. Native scrolling is left alone for touch,
 * reduced motion, the motion pause switch, open dialogs, inner scrollers, the
 * drivable road, and anything that is not a plain vertical wheel.
 */
const EASE = 0.11;

export default function SmoothScroll() {
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let target = window.scrollY;
    let raf = 0;
    let last = -1; // the position we set ourselves, so our own scroll events are not mistaken for outside ones

    const max = () => document.documentElement.scrollHeight - window.innerHeight;
    const active = () => fine.matches && !reduce.matches && !isMotionPaused();

    const innerScroller = (el: Element | null, dy: number) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 1) {
          const atTop = n.scrollTop <= 0 && dy < 0;
          const atEnd = n.scrollTop + n.clientHeight >= n.scrollHeight - 1 && dy > 0;
          if (!atTop && !atEnd) return true;
        }
      }
      return false;
    };

    const step = () => {
      const y = window.scrollY;
      const d = target - y;
      if (Math.abs(d) < 0.4) {
        last = target;
        window.scrollTo({ top: target, behavior: "instant" as ScrollBehavior });
        raf = 0;
        return;
      }
      last = y + d * EASE;
      window.scrollTo({ top: last, behavior: "instant" as ScrollBehavior });
      raf = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.shiftKey || e.deltaX !== 0 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (!active() || document.body.style.overflow === "hidden") return;
      const t = e.target as Element | null;
      if (t?.closest?.(".drive-scene, [data-native-scroll]") || innerScroller(t, e.deltaY)) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      if (!raf) target = window.scrollY;
      target = Math.min(Math.max(target + e.deltaY * unit, 0), max());
      if (!raf) raf = requestAnimationFrame(step);
    };

    // keyboard, scrollbar drag, anchor jumps and scrollIntoView: follow along, don't fight them
    const onScroll = () => {
      if (Math.abs(window.scrollY - last) < 2) return; // ours
      cancelAnimationFrame(raf);
      raf = 0;
      target = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
