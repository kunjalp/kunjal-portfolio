"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isMotionPaused } from "./motion";
import { prefersReducedMotion } from "./gravity";

/**
 * Fades a block up once as it scrolls into view (opacity and transform only, so
 * layout never moves). The server render and a page without JS show everything:
 * the hidden state is added only after mount, and only for blocks below the fold.
 * Children marked data-rv="1".."4" build up after the block, one short step apart.
 *
 * Once revealed, the wrapper carries no transform or opacity at all, so fixed or
 * transformed children (a full-screen window, a dragged one) behave as before.
 */

const REVEAL_NOW = "reveal-now";
/** Show the block with this name at once, no animation (before jumping to it). */
export const revealNow = (name: string) => window.dispatchEvent(new CustomEvent(REVEAL_NOW, { detail: name }));

const STAGGER = 80; // ms between blocks that enter together
const DONE = 800; // block fade (500) plus the last inner step, then the classes come off

// blocks that enter in the same frame stagger in DOM order (observers fire in creation order)
let queued = 0;
let queueFrame = 0;
const nextDelay = () => {
  if (!queueFrame) queueFrame = requestAnimationFrame(() => ((queued = 0), (queueFrame = 0)));
  return queued++ * STAGGER;
};

type Phase = "static" | "armed" | "in";

export default function Reveal({ name, className = "", children }: { name?: string; className?: string; children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");
  const [delay, setDelay] = useState(0);
  const phaseRef = useRef<Phase>("static");
  phaseRef.current = phase;

  // before the first client paint: hide only what is off screen, so nothing visible blinks
  useLayoutEffect(() => {
    const node = el.current;
    if (!node || isMotionPaused() || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    if (name && location.hash === `#${name}`) return;
    const r = node.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    setPhase("armed");
  }, [name]);

  useEffect(() => {
    if (phase !== "armed") return;
    const node = el.current!;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setDelay(nextDelay());
        setPhase("in");
      },
      { threshold: 0.15 },
    );
    io.observe(node);
    const now = () => phaseRef.current !== "static" && setPhase("static");
    const onNow = (e: Event) => (e as CustomEvent<string>).detail === name && now();
    const onHash = () => name && location.hash === `#${name}` && now();
    window.addEventListener(REVEAL_NOW, onNow);
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener(REVEAL_NOW, onNow);
      window.removeEventListener("hashchange", onHash);
    };
  }, [phase, name]);

  // after the fade, drop the classes so no transform is left on the wrapper
  useEffect(() => {
    if (phase !== "in") return;
    const t = setTimeout(() => setPhase("static"), delay + DONE);
    return () => clearTimeout(t);
  }, [phase, delay]);

  // focus (Tab) or a press on a card mid-fade: finish at once
  const finish = () => phaseRef.current !== "static" && setPhase("static");

  return (
    <div
      ref={el}
      className={`${phase === "static" ? "" : "rv"} ${phase === "in" ? "rv-in" : ""} ${className}`.trim() || undefined}
      style={phase === "in" ? ({ "--rv-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      onFocus={finish}
      onPointerDownCapture={finish}
    >
      {children}
    </div>
  );
}
