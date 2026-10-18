"use client";

import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./gravity";

/**
 * Spring-driven position for a draggable window.
 *
 * The window chases a target point through a damped spring:
 *   a = k * (target - x) - c * v
 * While you hold it, the spring is stiff, so it follows closely with a hint of weight.
 * When you let go, it keeps some of its momentum, then a softer spring settles it
 * with a small overshoot. It also leans a few degrees in the direction it's carried.
 *
 * Writes --tx, --ty and --lean straight onto the element, so the window's
 * contents don't re-render every frame.
 */

const HOLD = { k: 900, zeta: 0.82 }; // while dragging: close follow
const SETTLE = { k: 240, zeta: 0.5 }; // after release: a little bounce
const THROW = 0.09; // seconds of momentum carried past the release point
const MAX_THROW = 140; // px
const MAX_LEAN = 5; // deg

type S = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; lean: number; held: boolean };

export function useSpringPosition(el: React.RefObject<HTMLElement>, lean: boolean) {
  const s = useRef<S>({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, lean: 0, held: false });
  const raf = useRef(0);
  const leanOn = useRef(lean);
  leanOn.current = lean;

  const write = useCallback(() => {
    const node = el.current;
    if (!node) return;
    const st = s.current;
    node.style.setProperty("--tx", `${st.x.toFixed(2)}px`);
    node.style.setProperty("--ty", `${st.y.toFixed(2)}px`);
    node.style.setProperty("--lean", `${st.lean.toFixed(3)}deg`);
  }, [el]);

  const run = useCallback(() => {
    if (raf.current) return;
    const st = s.current;
    if (prefersReducedMotion()) {
      st.x = st.tx;
      st.y = st.ty;
      st.vx = st.vy = st.lean = 0;
      write();
      return;
    }
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000) || 0.016;
      last = now;
      const { k, zeta } = st.held ? HOLD : SETTLE;
      const c = 2 * Math.sqrt(k) * zeta;
      // two half-steps keep the stiff spring stable at 30fps
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        st.vx += (k * (st.tx - st.x) - c * st.vx) * h;
        st.vy += (k * (st.ty - st.y) - c * st.vy) * h;
        st.x += st.vx * h;
        st.y += st.vy * h;
      }
      const want = leanOn.current ? Math.max(-MAX_LEAN, Math.min(MAX_LEAN, st.vx * 0.006)) : 0;
      st.lean += (want - st.lean) * Math.min(1, dt * 14);
      write();

      const settled =
        !st.held &&
        Math.abs(st.tx - st.x) < 0.1 &&
        Math.abs(st.ty - st.y) < 0.1 &&
        Math.abs(st.vx) + Math.abs(st.vy) < 2 &&
        Math.abs(st.lean) < 0.02;
      if (settled) {
        st.x = st.tx;
        st.y = st.ty;
        st.vx = st.vy = st.lean = 0;
        write();
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [write]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    /** current spring state; x is the live horizontal position (the gravity pendulum's pivot) */
    state: s,
    grab() {
      s.current.held = true;
      return { x: s.current.tx, y: s.current.ty };
    },
    moveTo(x: number, y: number) {
      s.current.tx = x;
      s.current.ty = y;
      run();
    },
    release() {
      const st = s.current;
      if (!st.held) return;
      st.held = false;
      // carry a little momentum past where it was let go
      const clamp = (v: number) => Math.max(-MAX_THROW, Math.min(MAX_THROW, v));
      st.tx += clamp(st.vx * THROW);
      st.ty += clamp(st.vy * THROW);
      run();
    },
    nudge(dx: number, dy: number) {
      s.current.tx += dx;
      s.current.ty += dy;
      run();
    },
    reset() {
      s.current.tx = 0;
      s.current.ty = 0;
      run();
    },
  };
}
