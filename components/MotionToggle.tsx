"use client";

import { Pause, Play } from "lucide-react";
import { setMotionPaused, useMotionPaused, useReducedMotion } from "./motion";

/**
 * Navbar switch that pauses the ambient scenery motion. Hidden when the visitor
 * has reduced motion on, since nothing moves then anyway.
 */
export default function MotionToggle() {
  const paused = useMotionPaused();
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={paused ? "Resume scenery animation" : "Pause scenery animation"}
      title={paused ? "Resume animation" : "Pause animation"}
      className="menu-link flex h-9 items-center gap-1.5 !px-2.5"
    >
      {paused ? <Play size={16} strokeWidth={2.2} aria-hidden /> : <Pause size={16} strokeWidth={2.2} aria-hidden />}
      <span className="hidden text-sm font-semibold lg:inline">{paused ? "Play" : "Pause"}</span>
    </button>
  );
}
