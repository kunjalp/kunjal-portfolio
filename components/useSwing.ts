"use client";

import { useEffect, useRef } from "react";
import { gravityTilt, prefersReducedMotion } from "./gravity";

type State = { th: number; w: number; y: number; vy: number };

/**
 * Damped pendulum for one window, pivoting at the top-center of its title bar.
 *
 *   th'' = -K sin(th - th_eq) - C th' + (forces)
 *
 * Forces come from: the pivot being dragged sideways (inertia), a fast scroll
 * (each window hangs a little off-center, so a jolt makes it rock), and the cursor
 * brushing across it. Writes CSS variables --swing and --drop; nothing re-renders.
 */
export function useSwing(
  ref: React.RefObject<HTMLElement>,
  enabled: boolean,
  pivotX: React.MutableRefObject<number>,
  seed: number,
) {
  const s = useRef<State>({ th: 0, w: 0, y: 0, vy: 0 });
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const st = s.current;
    const asym = seed; // -1..1: how far off-center this window "hangs"

    if (enabled) {
      // the "drop": everything sags as gravity switches on, then bounces and rocks
      st.vy = 420 + Math.abs(seed) * 160;
      st.w += seed * 1.6;
    }

    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let scrollV = 0;
    let lastX = pivotX.current;
    let pivotV = 0;
    let brush = 0;

    const onPointer = (e: PointerEvent) => {
      // skip touch, and skip while a button is held (that's a drag, handled as pivot motion)
      if (!enabledRef.current || e.pointerType === "touch" || e.buttons) return;
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      // movementX is per event; scale to an impulse, weighted by how far down the window you push
      const lever = (e.clientY - r.top) / Math.max(1, r.height);
      brush += -e.movementX * 0.0045 * lever;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const step = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000) || 0.016;
      last = now;
      const on = enabledRef.current;
      const width = el.offsetWidth || 500;
      const k = Math.max(0.22, Math.min(1, 520 / width)); // big windows swing less
      const maxTh = 0.2 * k;

      if (on) {
        // scroll jolt
        const sy = window.scrollY;
        const v = (sy - lastScroll) / dt;
        const dv = Math.max(-6000, Math.min(6000, v - scrollV));
        lastScroll = sy;
        scrollV = v;
        st.w += asym * dv * 0.00009 * k;

        // pivot carried sideways by a drag: the bottom lags behind
        const x = pivotX.current;
        const pv = (x - lastX) / dt;
        st.w += Math.max(-3000, Math.min(3000, pv - pivotV)) * 0.0011 * k;
        lastX = x;
        pivotV = pv;

        st.w += brush * k;
        brush = 0;
      } else {
        brush = 0;
      }

      const K = 15; // ~0.6 Hz swing
      const C = on ? 0.85 : 7; // light damping while on, settles fast when switched off
      const eq = on ? gravityTilt() * k : 0;
      st.w += (-K * Math.sin(st.th - eq) - C * st.w) * dt;
      st.th = Math.max(-maxTh, Math.min(maxTh, st.th + st.w * dt));
      if (Math.abs(st.th) === maxTh) st.w *= -0.4; // soft stop

      st.vy += (-140 * st.y - 11 * st.vy) * dt;
      st.y += st.vy * dt;

      el.style.setProperty("--swing", `${st.th.toFixed(4)}rad`);
      el.style.setProperty("--drop", `${st.y.toFixed(2)}px`);

      const settled = Math.abs(st.th) < 0.0004 && Math.abs(st.w) < 0.002 && Math.abs(st.y) < 0.2 && Math.abs(st.vy) < 1;
      if (!on && settled) {
        el.style.removeProperty("--swing");
        el.style.removeProperty("--drop");
        st.th = st.w = st.y = st.vy = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // When gravity switches off, this effect re-runs with enabled=false and the
    // same loop (heavier damping) lets the window settle, then stops itself.
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [enabled, ref, pivotX, seed]);
}
