"use client";

import { useSyncExternalStore } from "react";

/**
 * Gravity mode: a site-wide switch. When it's on, every window hangs from a
 * pivot at the top of its title bar and swings like a damped pendulum.
 * On phones it also listens to the device tilt so windows hang toward real gravity.
 */

let on = false;
let tilt = 0; // radians; where "down" is relative to the screen (0 = straight down)
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function onOrient(e: DeviceOrientationEvent) {
  // gamma: left/right tilt in degrees. Right side down -> windows hang to the right.
  if (e.gamma == null) return;
  tilt = Math.max(-0.5, Math.min(0.5, (-e.gamma * Math.PI) / 180));
}

type OrientationCtor = { requestPermission?: () => Promise<"granted" | "denied"> };

export async function setGravity(next: boolean) {
  if (next === on) return;
  on = next;
  if (typeof window !== "undefined") {
    if (on) {
      // iOS asks permission for motion sensors; this runs inside the click that turned gravity on.
      const D = (window as unknown as { DeviceOrientationEvent?: OrientationCtor }).DeviceOrientationEvent;
      try {
        if (D?.requestPermission) await D.requestPermission();
      } catch {
        /* no sensor access: windows still swing, they just don't follow the phone's tilt */
      }
      window.addEventListener("deviceorientation", onOrient);
    } else {
      window.removeEventListener("deviceorientation", onOrient);
      tilt = 0;
    }
  }
  emit();
}

export const toggleGravity = () => setGravity(!on);
export const gravityTilt = () => tilt;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useGravity() {
  return useSyncExternalStore(subscribe, () => on, () => false);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
