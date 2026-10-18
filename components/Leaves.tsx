"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./gravity";
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

type Shape = "sprig" | "bundle" | "cone";

type Fact = {
  title: string;
  text: string;
  icon: LucideIcon;
  photo?: { src: string; alt: string };
  tint: string; // background of the drawn-icon print when there is no photo
};

type LeafDef = {
  id: string;
  shape: Shape;
  tone: "pine" | "cone";
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
    tint: "#e8c9a0",
  },
  {
    title: "Golden hour",
    text: "I'm obsessed with golden hour sunsets.",
    icon: Sunset,
    tint: "#f0c9a4",
    photo: { src: "/images/about/sunset-beach.jpg", alt: "Sun setting over the ocean" },
  },
  {
    title: "Charcoal art",
    text: "I sketch flowers and landscapes in charcoal.",
    icon: Palette,
    tint: "#d9d4c4",
    photo: { src: "/images/about/charcoal-buddha.jpg", alt: "Charcoal drawing of a Buddha face" },
  },
  {
    title: "Travel memories",
    text: "Hiking Mt. Tamalpais and skiing trips are some of the memories I collect.",
    icon: Mountain,
    tint: "#cfd8b8",
    photo: { src: "/images/about/mount-tam.jpg", alt: "Green hills and clouds seen from Mount Tamalpais" },
  },
  {
    title: "Almost a barber",
    text: "I once wanted to be a barber, and I've cut hair for friends.",
    icon: Scissors,
    tint: "#e6b9ad",
  },
  {
    title: "Pet peeve",
    text: "Slow walkers. Please keep moving.",
    icon: Footprints,
    tint: "#d6dca8",
  },
];

const leaves: LeafDef[] = [
  { id: "l1", shape: "sprig", tone: "pine", x: 6, size: 66, dur: 58, delay: -9, sway: 8, staticY: 18, fact: facts[0] },
  { id: "l2", shape: "cone", tone: "cone", x: 24, size: 44, dur: 46, delay: -36, sway: 10.5, staticY: 62, fact: facts[1] },
  { id: "l3", shape: "bundle", tone: "pine", x: 40, size: 70, dur: 66, delay: -21, sway: 9, staticY: 36, fact: facts[2] },
  { id: "l4", shape: "sprig", tone: "pine", x: 58, size: 60, dur: 78, delay: -54, sway: 12, staticY: 78, fact: facts[3] },
  { id: "l5", shape: "cone", tone: "cone", x: 74, size: 40, dur: 50, delay: -5, sway: 8.5, staticY: 28, fact: facts[4] },
  { id: "l6", shape: "bundle", tone: "pine", x: 88, size: 64, dur: 70, delay: -42, sway: 10.5, staticY: 54, fact: facts[5] },
];

const LEAF_IDS = leaves.map((l) => l.id);

// Short needles along a twig, pairs angled forward toward the tip.
function Sprig() {
  const needles: JSX.Element[] = [];
  // twig: quadratic from base (16,60) to tip (46,4), control (22,28)
  const pt = (t: number) => ({
    x: (1 - t) ** 2 * 16 + 2 * (1 - t) * t * 22 + t * t * 46,
    y: (1 - t) ** 2 * 60 + 2 * (1 - t) * t * 28 + t * t * 4,
  });
  for (let i = 0; i < 15; i++) {
    const t = 0.1 + i * 0.062;
    const p = pt(t);
    const q = pt(Math.min(1, t + 0.02));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const len = 13 - i * 0.45;
    for (const side of [-1, 1]) {
      const a = ang + side * 0.62;
      needles.push(
        <line
          key={`${i}${side}`}
          x1={p.x}
          y1={p.y}
          x2={p.x + Math.cos(a) * len}
          y2={p.y + Math.sin(a) * len}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />,
      );
    }
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
      <ellipse cx="30" cy="32" rx="17" ry="30" fill="transparent" transform="rotate(24 30 32)" />
      {needles}
      <path d="M16 60 Q22 28 46 4" fill="none" stroke="rgb(var(--cone))" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="46" cy="4" r="1.8" fill="rgb(var(--cone))" />
    </svg>
  );
}

// A fascicle: long needles fanning out from one papery sheath.
function Bundle() {
  const tips: [number, number, number][] = [
    [8, 10, 26], [18, 4, 30], [32, 2, 32], [46, 6, 30], [56, 14, 26],
  ];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
      <path d="M32 60 L4 8 Q32 -6 60 10 Z" fill="transparent" />
      {tips.map(([x, y, cx], i) => (
        <path
          key={i}
          d={`M32 52 Q ${cx} ${(52 + y) / 2} ${x} ${y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ))}
      <path d="M29.5 50 L34.5 50 L33.5 60 L30.5 60 Z" fill="rgb(var(--cone))" />
    </svg>
  );
}

// Pinecone: rows of overlapping scales, a short stem on top.
function Cone() {
  const rows = [
    { y: 16, xs: [32], w: 7 },
    { y: 22, xs: [26, 38], w: 7.5 },
    { y: 29, xs: [20, 32, 44], w: 7.5 },
    { y: 36, xs: [22, 32, 42], w: 7.5 },
    { y: 43, xs: [24, 33, 41], w: 6.8 },
    { y: 50, xs: [28, 36], w: 6 },
    { y: 56, xs: [32], w: 5 },
  ];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
      <path d="M31 4 Q33 9 32 13" fill="none" stroke="rgb(var(--cone))" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 10 C47 14 54 30 47 46 C43 56 36 62 32 62 C28 62 21 56 17 46 C10 30 17 14 32 10 Z" fill="currentColor" />
      {rows.map((r) =>
        r.xs.map((x) => (
          <g key={`${r.y}-${x}`}>
            <path
              d={`M${x - r.w} ${r.y - 2} Q ${x} ${r.y + r.w * 0.9} ${x + r.w} ${r.y - 2}`}
              fill="rgb(255 255 255 / 0.2)"
              stroke="rgb(var(--edge) / 0.7)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx={x} cy={r.y + r.w * 0.35} r="0.9" fill="rgb(var(--edge) / 0.5)" />
          </g>
        )),
      )}
    </svg>
  );
}

function LeafShape({ shape }: { shape: Shape }) {
  if (shape === "sprig") return <Sprig />;
  if (shape === "bundle") return <Bundle />;
  return <Cone />;
}


/* ---------- cursor wind ----------
 * A fast cursor stirs the air. Each leaf gets pushed along the cursor's path and a
 * little away from it, then a spring-damper pulls it back onto its falling path:
 *   a = F_wind - k*offset - c*velocity
 * Slow cursor movement does nothing, so the leaves stay easy to click.
 */
type Body = { x: number; y: number; vx: number; vy: number; r: number; vr: number };
const WIND_RADIUS = 170; // px around the cursor path that feels the gust
const WIND_MIN_SPEED = 550; // px/s before the cursor makes any wind
const SPRING = 5.5;
const DAMP = 2.6;
const MAX_OFFSET = 130;
const MAX_SPIN = 50; // deg

function useCursorWind(count: number, frozen: React.MutableRefObject<string | null>, ids: string[]) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bodies: Body[] = Array.from({ length: count }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0 }));
    let raf = 0;
    let awake = false;
    let last = 0;
    let prev: { x: number; y: number; t: number } | null = null;

    const step = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000) || 0.016;
      last = now;
      let moving = false;
      bodies.forEach((b, i) => {
        if (frozen.current === ids[i]) return; // its fact card is open; don't blow it away
        b.vx += (-SPRING * b.x - DAMP * b.vx) * dt;
        b.vy += (-SPRING * b.y - DAMP * b.vy) * dt;
        b.vr += (-7 * b.r - 2.4 * b.vr) * dt;
        b.x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, b.x + b.vx * dt));
        b.y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, b.y + b.vy * dt));
        b.r = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, b.r + b.vr * dt));
        const el = els.current[i];
        if (el) el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) rotate(${b.r.toFixed(1)}deg)`;
        if (Math.abs(b.x) + Math.abs(b.y) > 0.3 || Math.abs(b.vx) + Math.abs(b.vy) > 2 || Math.abs(b.r) > 0.2) moving = true;
      });
      if (moving) raf = requestAnimationFrame(step);
      else awake = false;
    };
    const wake = () => {
      if (awake) return;
      awake = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const t = e.timeStamp;
      const p = { x: e.clientX, y: e.clientY, t };
      if (!prev || t - prev.t > 120) {
        prev = p;
        return;
      }
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      const dtp = Math.max(1, t - prev.t) / 1000;
      const speed = Math.hypot(dx, dy) / dtp;
      const a = prev;
      prev = p;
      if (speed < WIND_MIN_SPEED) return;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      let hit = false;
      els.current.forEach((el, i) => {
        if (!el || frozen.current === ids[i]) return;
        // the leaf's resting spot on its fall path (parent isn't moved by the wind)
        const r = (el.parentElement ?? el).getBoundingClientRect();
        const b = bodies[i];
        const cx = r.left + r.width / 2 + b.x;
        const cy = r.top + r.height / 2 + b.y;
        // distance from the leaf to the cursor's path this frame
        const s = Math.max(0, Math.min(1, ((cx - a.x) * dx + (cy - a.y) * dy) / (len * len)));
        const px = a.x + dx * s;
        const py = a.y + dy * s;
        const d = Math.hypot(cx - px, cy - py);
        if (d > WIND_RADIUS) return;
        const fall = (1 - d / WIND_RADIUS) ** 2;
        const gust = Math.min(speed, 3000) * fall * 0.13;
        // mostly along the swipe, partly away from it
        const ax = (cx - px) / (d || 1);
        const ay = (cy - py) / (d || 1);
        b.vx += (ux * 0.7 + ax * 0.3) * gust;
        b.vy += (uy * 0.7 + ay * 0.3) * gust - gust * 0.08; // a little lift
        // which side of the path the leaf is on decides which way it spins
        b.vr = Math.max(-240, Math.min(240, b.vr + Math.sign(ux * (cy - py) - uy * (cx - px) || 1) * gust * 0.35));
        hit = true;
      });
      if (hit) wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [count, frozen, ids]);
  return els;
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
  const frozen = useRef<string | null>(null);
  frozen.current = active?.id ?? null;
  const windEls = useCursorWind(leaves.length, frozen, LEAF_IDS);

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

  return (
    <>
      {active && (
        <div className="fixed inset-0 z-[15]" onClick={close} aria-hidden />
      )}

      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {leaves.map((leaf, i) => {
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
                <div className="leaf-wind" ref={(el) => { windEls.current[i] = el; }}>
                <button
                  type="button"
                  onClick={(e) => open(leaf, e.currentTarget)}
                  aria-label={`Falling ${leaf.tone === "cone" ? "pinecone" : "pine sprig"}: fun fact about ${leaf.fact.title.toLowerCase()}`}
                  aria-expanded={isActive}
                  className={`leaf-btn ${isActive ? "is-active" : ""} ${
                    leaf.tone === "pine" ? "leaf-green" : "leaf-cone"
                  }`}
                  style={{ width: leaf.size, height: leaf.size }}
                >
                  <LeafShape shape={leaf.shape} />
                </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {active && activeLeaf && (
        <div
          role="dialog"
          aria-label={activeLeaf.fact.title}
          className="polaroid fixed z-[2000] max-sm:!inset-x-4 max-sm:!bottom-6 max-sm:!top-auto max-sm:!w-auto max-sm:!transform-none"
          style={{
            left: active.left,
            top: active.top,
            width: Math.min(active.width, 270),
            transform: `${active.flip ? "translateY(-100%) " : ""}rotate(-2deg)`,
          }}
        >
          <span aria-hidden className="polaroid-tape" />
          <button type="button" onClick={close} aria-label="Close" className="polaroid-x">
            <X size={14} />
          </button>
          {activeLeaf.fact.photo && (
            <div key={active.id} className="polaroid-print">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeLeaf.fact.photo.src} alt={activeLeaf.fact.photo.alt} className="h-full w-full object-cover" />
            </div>
          )}
          <p className={`polaroid-title ${activeLeaf.fact.photo ? "" : "polaroid-title-bare"}`}>{activeLeaf.fact.title}</p>
          <p className="polaroid-text">{activeLeaf.fact.text}</p>
        </div>
      )}
    </>
  );
}
