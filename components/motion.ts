"use client";

import { useSyncExternalStore } from "react";
import { MOTION_KEY as KEY } from "./motionScript";

/**
 * Site-wide "pause animation" switch for the ambient scenery (swaying pines,
 * lake shimmer, birds, falling leaves, mouse parallax). Remembered per browser.
 * motionScript.ts (inlined in <head>) applies a saved pause before first paint.
 * CSS reads html[data-motion="paused"].
 */

let paused = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  paused = document.documentElement.dataset.motion === "paused";
}

export function setMotionPaused(next: boolean) {
  if (next === paused) return;
  paused = next;
  if (paused) document.documentElement.dataset.motion = "paused";
  else delete document.documentElement.dataset.motion;
  try {
    localStorage.setItem(KEY, paused ? "1" : "0");
  } catch {
    /* storage blocked: the switch still works for this visit */
  }
  emit();
}

export const isMotionPaused = () => paused;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useMotionPaused = () => useSyncExternalStore(subscribe, () => paused, () => false);


/** Live prefers-reduced-motion, for components that should hide or skip work when it's on. */
const rmQuery = "(prefers-reduced-motion: reduce)";
const subscribeRM = (l: () => void) => {
  const mq = matchMedia(rmQuery);
  mq.addEventListener("change", l);
  return () => mq.removeEventListener("change", l);
};
export const useReducedMotion = () =>
  useSyncExternalStore(subscribeRM, () => matchMedia(rmQuery).matches, () => false);
