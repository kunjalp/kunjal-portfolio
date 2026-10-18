"use client";

import { useEffect } from "react";

/** Re-paints the sky each minute so it keeps up with the visitor's clock. */
export default function SkyClock() {
  useEffect(() => {
    const w = window as unknown as { __sky?: () => void };
    w.__sky?.();
    const id = setInterval(() => w.__sky?.(), 60_000);
    return () => clearInterval(id);
  }, []);
  return null;
}
