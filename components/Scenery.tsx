"use client";

import { useEffect, useRef } from "react";
import { isMotionPaused } from "./motion";
import { buildRange, rng, scatter, treeLine, treeList, underCurve, VB_H, VB_W } from "./scenery/geometry";

// ---------------------------------------------------------------------------
// Scene geometry, generated once at module load from fixed seeds.
// ---------------------------------------------------------------------------

const SHORE = 742; // waterline of the lake

// Ambient motion. Amplitudes live in globals.css (search "Ambient motion").
/** Pine sway: each tree's cycle length is picked between these (seconds). */
const SWAY = { minS: 7, maxS: 12 };
/** Lake shimmer: each glint drifts and fades on a cycle between these (seconds). */
const SHIMMER = { minS: 5, maxS: 9 };
/** Mouse parallax: how quickly layers ease toward the cursor (0..1 per frame). */
const PARALLAX_EASE = 0.06;
const SUN = { x: 1182, y: 384, r: 50 };

// Far range: a Three Sisters-style trio on the right, the sun setting between them.
const far = buildRange({
  seed: 11,
  ridge: [
    [-20, 540], [60, 488], [130, 528], [215, 452], [300, 520], [360, 500],
    [430, 432], [520, 512], [610, 470], [690, 528], [790, 450], [880, 520],
    [960, 460], [1020, 492], [1080, 372], [1150, 452], [1215, 336], [1285, 434],
    [1350, 360], [1430, 472], [1500, 432], [1560, 502], [1620, 474],
  ],
  peaks: [1, 3, 6, 8, 10, 12, 14, 16, 18, 20],
  bottom: VB_H,
  step: 13,
  amp: 7,
  lean: 24,
  snowLine: 446,
  snowDepth: 40,
});

// Mid range: a Rundle-style tilted slab on the left, rougher peaks to the right.
const mid = buildRange({
  seed: 23,
  ridge: [
    [-20, 600], [40, 584], [90, 614], [300, 560], [470, 518], [560, 490],
    [600, 560], [660, 630], [760, 600], [860, 642], [960, 612], [1060, 648],
    [1180, 592], [1260, 642], [1370, 552], [1412, 578], [1470, 518], [1560, 604],
    [1620, 592],
  ],
  peaks: [1, 5, 8, 10, 12, 14, 16],
  bottom: VB_H,
  step: 11,
  amp: 6,
  lean: 30,
  snowLine: 540,
  snowDepth: 28,
  strata: { gap: 8, slope: 0.3 },
});

const backGround = (x: number) => 676 + 13 * Math.sin(x / 150 + 0.6) + 7 * Math.sin(x / 53);
const frontGround = (x: number) => 712 + 10 * Math.sin(x / 120 + 2) + 5 * Math.sin(x / 41);
const shoreGround = (x: number) =>
  884 +
  6 * Math.sin(x / 90) -
  46 * Math.exp(-(((x - 90) / 210) ** 2)) -
  58 * Math.exp(-(((x - 1560) / 230) ** 2));

const backHill = underCurve(backGround, -20, 1620, SHORE + 4);
const backTrees = treeLine({ seed: 31, from: -20, to: 1620, ground: backGround, minH: 16, maxH: 38, spacing: 6 });
const frontHill = underCurve(frontGround, -20, 1620, SHORE + 4);
const frontTrees = treeLine({ seed: 37, from: -20, to: 1620, ground: frontGround, minH: 24, maxH: 56, spacing: 7, density: 0.95 });

const shore = underCurve(shoreGround, -20, 1620, VB_H + 10, 6);
// The big framing spruces sway one by one, each pivoting at its base on its own slow cycle.
const swayRand = rng(53);
const edgeTrees = [
  ...treeList({ seed: 41, from: -30, to: 300, ground: shoreGround, minH: 120, maxH: 330, spacing: 30, density: 1 }),
  ...treeList({ seed: 43, from: 1330, to: 1640, ground: shoreGround, minH: 140, maxH: 360, spacing: 32, density: 1 }),
].map((t) => ({ ...t, dur: SWAY.minS + swayRand() * (SWAY.maxS - SWAY.minS), delay: -swayRand() * SWAY.maxS }));
const shoreBrush = treeLine({ seed: 47, from: 260, to: 1350, ground: shoreGround, minH: 10, maxH: 30, spacing: 9, density: 0.5 });

const stars = scatter(7, 110, 0, VB_W, 0, 520);
const shimmerRand = rng(59);
const shimmer = scatter(13, 46, 60, 1540, SHORE + 8, 880).map((g) => ({
  ...g,
  dur: SHIMMER.minS + shimmerRand() * (SHIMMER.maxS - SHIMMER.minS),
  delay: -shimmerRand() * SHIMMER.maxS,
}));

// Thin stratus clouds catching the low sun on their undersides.
const clouds: { x: number; y: number; w: number }[] = [
  { x: 250, y: 300, w: 300 },
  { x: 560, y: 252, w: 190 },
  { x: 900, y: 318, w: 240 },
  { x: 1440, y: 262, w: 230 },
  { x: 1300, y: 330, w: 140 },
];

// flap: wing-beat cycle (s); drift: slow wander loop (s); delay staggers them.
const birds = [
  { x: 1010, y: 236, s: 1, flap: 2.6, drift: 26, delay: 0 },
  { x: 1034, y: 226, s: 0.8, flap: 2.2, drift: 31, delay: -0.9 },
  { x: 1052, y: 240, s: 0.65, flap: 1.9, drift: 23, delay: -1.6 },
];

// ---------------------------------------------------------------------------

function Layer({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <svg
      className={`scene-layer ${className}`}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
    >
      {children}
    </svg>
  );
}

function Range({ id, r, strataClip }: { id: string; r: typeof far; strataClip?: boolean }) {
  return (
    <>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={r.silhouette} />
        </clipPath>
        <clipPath id={`${id}-lit`}>
          <path d={r.lit} />
        </clipPath>
      </defs>
      <path className={`${id}-rock`} d={r.silhouette} />
      <g clipPath={`url(#${id}-clip)`}>
        <path className={`${id}-rock-lit`} d={r.lit} />
        {strataClip && r.strata && <path className="strata" d={r.strata} />}
        <path className={`${id}-snow`} d={r.snow} />
        <path className={`${id}-snow-lit`} d={r.snow} clipPath={`url(#${id}-lit)`} />
      </g>
    </>
  );
}

/**
 * Fixed Banff-style wallpaper behind the whole page. Scroll progress (0..1) is
 * written to --p; CSS uses it to fade golden hour into dusk, sink the sun, and
 * drift each layer at its own rate.
 */
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

  // Mouse parallax: --mx / --my (-1..1) ease toward the cursor; CSS moves near layers more than far ones.
  // Only with a fine pointer that can hover (not touch), and never with reduced motion or while paused.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const step = () => {
      cur.x += (target.x - cur.x) * PARALLAX_EASE;
      cur.y += (target.y - cur.y) * PARALLAX_EASE;
      el.style.setProperty("--mx", cur.x.toFixed(4));
      el.style.setProperty("--my", cur.y.toFixed(4));
      const settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001;
      raf = settled ? 0 : requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches || reduced.matches || isMotionPaused()) return;
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="scenery">
      <div className="sky" />
      <div className="sky sky-dusk" />

      {/* Sky: stars, moon, sun, clouds, birds */}
      <Layer className="layer-sky">
        <defs>
          <radialGradient id="sun-glow">
            <stop offset="0" style={{ stopColor: "rgb(var(--sun-glow))", stopOpacity: 0.85 }} />
            <stop offset="0.35" style={{ stopColor: "rgb(var(--sun-glow))", stopOpacity: 0.35 }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--sun-glow))", stopOpacity: 0 }} />
          </radialGradient>
          <filter id="soft" x="-10%" y="-200%" width="120%" height="500%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <mask id="crescent">
            <circle cx="1390" cy="150" r="24" fill="white" />
            <circle cx="1401" cy="142" r="22" fill="black" />
          </mask>
        </defs>

        <g className="stars">
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={0.6 + s.s * 1.1} opacity={0.35 + s.s * 0.65} />
          ))}
        </g>
        <circle className="moon" cx="1390" cy="150" r="24" mask="url(#crescent)" />

        <g className="sun">
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 4.2} fill="url(#sun-glow)" />
          <circle className="sun-disc" cx={SUN.x} cy={SUN.y} r={SUN.r} />
        </g>

        <g className="clouds" filter="url(#soft)">
          {clouds.map((c, i) => (
            <g key={i}>
              <ellipse className="cloud" cx={c.x} cy={c.y} rx={c.w / 2} ry={7} />
              <ellipse className="cloud" cx={c.x - c.w * 0.18} cy={c.y - 6} rx={c.w * 0.28} ry={7} />
              <ellipse className="cloud" cx={c.x + c.w * 0.14} cy={c.y - 4} rx={c.w * 0.22} ry={6} />
              <ellipse className="cloud-lit" cx={c.x + c.w * 0.05} cy={c.y + 4} rx={c.w * 0.4} ry={4.5} />
            </g>
          ))}
        </g>

        <g className="birds">
          {birds.map((b, i) => (
            <g
              key={i}
              className="bird-drift"
              style={{ animationDuration: `${b.drift}s`, animationDelay: `${b.delay * 5}s` }}
            >
              <path
                className="bird-flap"
                style={{ animationDuration: `${b.flap}s`, animationDelay: `${b.delay}s` }}
                d={`M ${b.x - 7 * b.s} ${b.y - 3 * b.s} Q ${b.x - 3 * b.s} ${b.y - 4 * b.s} ${b.x} ${b.y} Q ${b.x + 3 * b.s} ${b.y - 4 * b.s} ${b.x + 7 * b.s} ${b.y - 3 * b.s}`}
              />
            </g>
          ))}
        </g>
      </Layer>

      {/* Far range, with a haze band settling in front of it */}
      <Layer className="layer-far">
        <defs>
          <linearGradient id="haze-far" x1="0" y1="430" x2="0" y2="640" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0.85 }} />
          </linearGradient>
        </defs>
        <Range id="far" r={far} />
        <rect x="-20" y="430" width={VB_W + 40} height={VB_H} fill="url(#haze-far)" />
      </Layer>

      {/* Mid range */}
      <Layer className="layer-mid">
        <defs>
          <linearGradient id="haze-mid" x1="0" y1="560" x2="0" y2="700" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        <Range id="mid" r={mid} strataClip />
        <rect x="-20" y="560" width={VB_W + 40} height={VB_H} fill="url(#haze-mid)" />
      </Layer>

      {/* Forested shoreline and the glacial lake */}
      <Layer className="layer-forest">
        <defs>
          <linearGradient id="lake" x1="0" y1={SHORE} x2="0" y2="900" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "rgb(var(--lake-top))" }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--lake-bottom))" }} />
          </linearGradient>
          <linearGradient id="shore-mist" x1="0" y1={SHORE - 30} x2="0" y2={SHORE + 14} gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0 }} />
            <stop offset="0.7" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0.45 }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--haze))", stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="sun-path" x1="0" y1={SHORE} x2="0" y2="890" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "rgb(var(--shine))", stopOpacity: 0.9 }} />
            <stop offset="1" style={{ stopColor: "rgb(var(--shine))", stopOpacity: 0 }} />
          </linearGradient>
          <clipPath id="lake-clip">
            <rect x="-20" y={SHORE} width={VB_W + 40} height={VB_H - SHORE} />
          </clipPath>
        </defs>

        <path className="hill-back" d={backHill} />
        <path className="trees-back" d={backTrees} />
        <path className="hill-front" d={frontHill} />
        <path className="trees-front" d={frontTrees} />

        <rect x="-20" y={SHORE} width={VB_W + 40} height={VB_H - SHORE} fill="url(#lake)" />

        {/* Mirror of the shoreline across the waterline */}
        <g className="reflection" clipPath="url(#lake-clip)">
          <g transform={`translate(0 ${SHORE * 2}) scale(1 -1)`}>
            <path className="mid-rock" d={mid.silhouette} />
            <path className="hill-back" d={backHill} />
            <path className="trees-back" d={backTrees} />
            <path className="hill-front" d={frontHill} />
            <path className="trees-front" d={frontTrees} />
          </g>
        </g>

        <g className="sun-path">
          <rect x={SUN.x - 34} y={SHORE} width="68" height="150" fill="url(#sun-path)" opacity="0.35" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect
              key={i}
              x={SUN.x - (30 - i * 3) + ((i * 37) % 11) - 5}
              y={SHORE + 6 + i * 15}
              width={(30 - i * 3) * 2}
              height="2"
              rx="1"
              fill="rgb(var(--shine))"
              opacity={0.75 - i * 0.08}
            />
          ))}
        </g>

        <rect x="-20" y={SHORE - 30} width={VB_W + 40} height="44" fill="url(#shore-mist)" />
      </Layer>

      {/* Lake glints on their own layer, so their animation doesn't repaint the forest and reflection */}
      <Layer className="layer-forest layer-shimmer">
        <g className="shimmer">
          {shimmer.map((s, i) => (
            <rect
              key={i}
              x={s.x}
              y={s.y}
              width={10 + s.s * 46}
              height="1.4"
              rx="0.7"
              style={{ animationDuration: `${s.dur.toFixed(2)}s`, animationDelay: `${s.delay.toFixed(2)}s` }}
            />
          ))}
        </g>
      </Layer>

      {/* Foreground shore and framing spruces */}
      <Layer className="layer-fore">
        <path className="shore" d={shore} />
        <path className="shore" d={shoreBrush} />
      </Layer>

      {/* Framing spruces, on their own layer so swaying repaints only them */}
      <Layer className="layer-fore layer-pines">
        {edgeTrees.map((t, i) => (
          <path
            key={i}
            className="fore-trees pine-sway"
            d={t.d}
            style={{
              transformOrigin: `${t.x}px ${t.y}px`,
              animationDuration: `${t.dur.toFixed(2)}s`,
              animationDelay: `${t.delay.toFixed(2)}s`,
            }}
          />
        ))}
      </Layer>

      <div className="dusk-tint" />
      <div className="grain" />
    </div>
  );
}
