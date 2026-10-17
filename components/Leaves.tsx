"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Coffee,
  Footprints,
  Mountain,
  Palette,
  Scissors,
  Sunset,
  X,
  type LucideIcon,
} from "lucide-react";

type Shape = "fern" | "vine" | "petal";

type Fact = { title: string; text: string; icon: LucideIcon };

type LeafDef = {
  id: string;
  shape: Shape;
  tone: "leaf" | "petal";
  x: number; // vw
  size: number; // px
  dur: number; // s, fall duration
  delay: number; // s, negative so leaves are already mid-air on load
  sway: number; // s
  staticY: number; // vh, used when reduced motion is on
  fact: Fact;
};

const facts: Fact[] = [
  {
    title: "Chai",
    text: "I love making chai, and drinking it even more.",
    icon: Coffee,
  },
  {
    title: "Golden hour",
    text: "I'm obsessed with golden hour sunsets.",
    icon: Sunset,
  },
  {
    title: "Charcoal art",
    text: "I sketch flowers and landscapes in charcoal.",
    icon: Palette,
  },
  {
    title: "Travel memories",
    text: "Hiking Mt. Tamalpais and skiing trips are some of the memories I collect.",
    icon: Mountain,
  },
  {
    title: "Almost a barber",
    text: "I once wanted to be a barber, and I've cut hair for friends.",
    icon: Scissors,
  },
  {
    title: "Pet peeve",
    text: "Slow walkers. Please keep moving.",
    icon: Footprints,
  },
];

const leaves: LeafDef[] = [
  { id: "l1", shape: "fern", tone: "leaf", x: 6, size: 62, dur: 58, delay: -9, sway: 8, staticY: 18, fact: facts[0] },
  { id: "l2", shape: "petal", tone: "petal", x: 24, size: 52, dur: 70, delay: -36, sway: 10.5, staticY: 62, fact: facts[1] },
  { id: "l3", shape: "vine", tone: "leaf", x: 40, size: 70, dur: 52, delay: -21, sway: 9, staticY: 36, fact: facts[2] },
  { id: "l4", shape: "fern", tone: "leaf", x: 58, size: 58, dur: 78, delay: -54, sway: 12, staticY: 78, fact: facts[3] },
  { id: "l5", shape: "petal", tone: "petal", x: 74, size: 54, dur: 64, delay: -5, sway: 8.5, staticY: 28, fact: facts[4] },
  { id: "l6", shape: "vine", tone: "leaf", x: 88, size: 68, dur: 66, delay: -42, sway: 10.5, staticY: 54, fact: facts[5] },
];

function LeafShape({ shape }: { shape: Shape }) {
  if (shape === "fern") {
    return (
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden className="h-full w-full">
        <ellipse cx="32" cy="33" rx="16" ry="29" fill="transparent" />
        <path d="M32 62 Q33 34 32 3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const y = 52 - i * 8;
          const w = 15 - i * 1.9;
          return (
            <g key={i}>
              <ellipse cx={32 - w / 2} cy={y} rx={w / 2 + 1} ry={2.6} transform={`rotate(-26 32 ${y})`} />
              <ellipse cx={32 + w / 2} cy={y} rx={w / 2 + 1} ry={2.6} transform={`rotate(26 32 ${y})`} />
            </g>
          );
        })}
      </svg>
    );
  }
  if (shape === "vine") {
    return (
      <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden className="h-full w-full">
        <ellipse cx="32" cy="32" rx="14" ry="30" fill="transparent" transform="rotate(30 32 32)" />
        <path
          d="M12 60 C6 42 40 40 30 24 S44 8 52 3"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="14" cy="46" rx="8" ry="4" transform="rotate(-35 14 46)" />
        <ellipse cx="36" cy="40" rx="8" ry="4" transform="rotate(25 36 40)" />
        <ellipse cx="22" cy="28" rx="8" ry="4" transform="rotate(-40 22 28)" />
        <ellipse cx="40" cy="18" rx="7" ry="3.6" transform="rotate(30 40 18)" />
        <ellipse cx="50" cy="8" rx="6" ry="3.2" transform="rotate(-30 50 8)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
      <path
        d="M32 4 C50 20 52 42 32 60 C12 42 14 20 32 4 Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <path
        d="M32 14 L32 52"
        stroke="rgb(255 255 255 / 0.55)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

type Active = {
  id: string;
  left: number;
  top: number;
  width: number;
  flip: boolean;
};

export default function Leaves() {
  const [active, setActive] = useState<Active | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  const open = (leaf: LeafDef, el: HTMLElement) => {
    if (active?.id === leaf.id) {
      close();
      return;
    }
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(300, vw - 32);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, 16), vw - width - 16);
    const flip = r.bottom > vh * 0.55;
    setActive({
      id: leaf.id,
      left,
      width,
      flip,
      top: flip ? r.top - 12 : r.bottom + 12,
    });
  };

  const activeLeaf = active ? leaves.find((l) => l.id === active.id) : undefined;
  const ActiveIcon = activeLeaf?.fact.icon;

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[15]" onClick={close} aria-hidden />
      )}

      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {leaves.map((leaf) => {
          const isActive = active?.id === leaf.id;
          return (
            <div
              key={leaf.id}
              className={`leaf ${isActive ? "is-paused" : ""}`}
              style={
                {
                  "--x": `${leaf.x}vw`,
                  "--dur": `${leaf.dur}s`,
                  "--delay": `${leaf.delay}s`,
                  "--sway": `${leaf.sway}s`,
                  "--y": `${leaf.staticY}vh`,
                } as React.CSSProperties
              }
            >
              <div className="leaf-sway">
                <button
                  type="button"
                  onClick={(e) => open(leaf, e.currentTarget)}
                  aria-label={`Drifting leaf: fun fact about ${leaf.fact.title.toLowerCase()}`}
                  aria-expanded={isActive}
                  className={`leaf-btn ${isActive ? "is-active" : ""} ${
                    leaf.tone === "leaf" ? "leaf-green" : "leaf-petal"
                  }`}
                  style={{ width: leaf.size, height: leaf.size }}
                >
                  <LeafShape shape={leaf.shape} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {active && activeLeaf && ActiveIcon && (
        <div
          role="dialog"
          aria-label={activeLeaf.fact.title}
          className="glass tooltip-in fixed z-40 rounded-2xl p-4 max-sm:!inset-x-4 max-sm:!bottom-6 max-sm:!top-auto max-sm:!w-auto max-sm:!transform-none"
          style={{
            left: active.left,
            top: active.top,
            width: active.width,
            transform: active.flip ? "translateY(-100%)" : undefined,
          }}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <ActiveIcon size={18} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold tracking-tight">{activeLeaf.fact.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{activeLeaf.fact.text}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-1 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-fg/5 hover:text-fg"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
