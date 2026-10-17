"use client";

import { useEffect, useRef } from "react";

// Fixed golden-hour landscape behind the whole page. Scroll progress (0..1)
// drives --p: the sky cross-fades from golden hour to dusk, the sun sinks,
// and each hill layer drifts at its own rate for parallax.
export default function Scenery() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="scenery">
      <div className="sky" />
      <div className="sky sky-dusk" />
      <div className="sun" />

      {/* far ridge: angular peaks */}
      <svg className="hill hill-1" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 230 L110 175 L210 205 L330 120 L450 195 L570 145 L690 215 L830 95 L970 185 L1090 150 L1230 205 L1350 165 L1440 195 L1440 400 L0 400 Z" />
      </svg>

      {/* rolling mid hills */}
      <svg className="hill hill-2" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 265 C160 205 300 215 460 255 S760 315 940 245 S1260 195 1440 255 L1440 400 L0 400 Z" />
      </svg>
      <svg className="hill hill-3" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 300 C180 250 340 270 520 305 S860 345 1060 290 S1320 260 1440 290 L1440 400 L0 400 Z" />
      </svg>

      {/* foreground hill with a few pines */}
      <svg className="hill hill-4" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 335 C200 295 380 305 560 340 S980 365 1180 325 S1360 310 1440 325 L1440 400 L0 400 Z" />
        <path d="M80 332 l10 -52 l10 52 Z M112 336 l8 -40 l8 40 Z M148 334 l9 -46 l9 46 Z M1010 352 l10 -52 l10 52 Z M1046 350 l8 -40 l8 40 Z M1082 346 l10 -48 l10 48 Z M1330 330 l9 -44 l9 44 Z M1362 332 l8 -38 l8 38 Z" />
      </svg>
    </div>
  );
}
