// Procedural geometry for the Banff-style wallpaper.
// Everything is generated from fixed seeds, so the server and the browser
// produce identical paths (no hydration mismatch) and the scene never changes
// between visits. Coordinates live in a 1600 x 960 viewBox.

export const VB_W = 1600;
export const VB_H = 960;

type Pt = [number, number];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const join = (p: Pt[]) => p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L ");
const closed = (p: Pt[]) => `M ${join(p)} Z`;

/** Adds small jagged steps between hand-placed ridge points. */
function jag(ridge: Pt[], rand: () => number, step: number, amp: number) {
  const pts: Pt[] = [];
  const idx: number[] = [];
  for (let i = 0; i < ridge.length; i++) {
    idx.push(pts.length);
    pts.push(ridge[i]);
    if (i === ridge.length - 1) break;
    const [x0, y0] = ridge[i];
    const [x1, y1] = ridge[i + 1];
    const n = Math.max(1, Math.floor(Math.abs(x1 - x0) / step));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      pts.push([
        x0 + (x1 - x0) * t + (rand() - 0.5) * step * 0.5,
        y0 + (y1 - y0) * t + (rand() - 0.5) * amp,
      ]);
    }
  }
  return { pts, idx };
}

type RangeOpts = {
  seed: number;
  ridge: Pt[];
  peaks: number[]; // indices into `ridge` that are summits
  bottom: number;
  step: number;
  amp: number;
  lean: number; // how far the shadow/light split drifts right going down
  snowLine: number; // summits higher (smaller y) than this get snow
  snowDepth: number;
  strata?: { gap: number; slope: number };
};

export type Range = {
  silhouette: string;
  lit: string;
  snow: string;
  strata: string;
};

/**
 * One mountain range: a jagged silhouette, a sunlit face on the right of each
 * summit (the sun sits to the right), snow caps with couloir fingers, and
 * optional tilted rock strata like Mt. Rundle's.
 */
export function buildRange(o: RangeOpts): Range {
  const rand = rng(o.seed);
  const { pts, idx } = jag(o.ridge, rand, o.step, o.amp);
  const first = pts[0];
  const last = pts[pts.length - 1];

  const silhouette = closed([...pts, [last[0], o.bottom], [first[0], o.bottom]]);

  const lit: string[] = [];
  const snow: string[] = [];

  o.peaks.forEach((pi, n) => {
    const p = idx[pi];
    const [px, py] = pts[p];
    // The lit face ends at the saddle: the lowest hand-placed point before the
    // next summit.
    const nextPeak = n + 1 < o.peaks.length ? o.peaks[n + 1] : o.ridge.length;
    let endAuthored = Math.min(pi + 1, o.ridge.length - 1);
    for (let k = pi + 1; k < nextPeak && k < o.ridge.length; k++) {
      if (o.ridge[k][1] > o.ridge[endAuthored][1]) endAuthored = k;
    }
    const e = idx[endAuthored];

    // Sunlit face: a triangular facet from the summit, along the ridge to the
    // saddle, down to the foot of the spine, then back up a slightly wandering
    // spine to the summit. It ends just below the saddle, like a real face.
    const [sx, sy] = pts[e];
    const foot: Pt = [px + o.lean + (rand() - 0.5) * 10, Math.min(o.bottom, sy + (sy - py) * 0.5)];
    const face: Pt[] = pts.slice(p, e + 1);
    face.push([sx + (foot[0] - sx) * 0.4, sy + (foot[1] - sy) * 0.55]);
    face.push(foot);
    const segs = 5;
    for (let k = segs - 1; k >= 1; k--) {
      const s = k / segs;
      face.push([
        px + (foot[0] - px) * s + (rand() - 0.5) * 8 * s,
        py + (foot[1] - py) * s,
      ]);
    }
    lit.push(closed(face));

    // Snow cap on the tall summits.
    if (py < o.snowLine) {
      const depth = o.snowDepth * (0.6 + rand() * 0.5);
      const floor = py + depth;
      const walk = (dir: -1 | 1) => {
        const out: Pt[] = [];
        let j = p;
        while (j + dir >= 0 && j + dir < pts.length && pts[j + dir][1] < floor) {
          j += dir;
          out.push(pts[j]);
        }
        if (j + dir >= 0 && j + dir < pts.length) {
          const [ax, ay] = pts[j];
          const [bx, by] = pts[j + dir];
          const t = (floor - ay) / (by - ay || 1);
          out.push([ax + (bx - ax) * t, floor]);
        }
        return out;
      };
      const left = walk(-1).reverse();
      const right = walk(1);
      const cap: Pt[] = [...left, [px, py], ...right];
      const a = cap[cap.length - 1];
      const b = cap[0];
      // Ragged lower edge, with a few tapered snow-filled gullies.
      const n2 = Math.max(4, Math.round(Math.abs(a[0] - b[0]) / 9));
      for (let k = 1; k < n2; k++) {
        const t = k / n2;
        const x = a[0] + (b[0] - a[0]) * t;
        const y = floor - depth * 0.3 + rand() * depth * 0.3;
        if (rand() < 0.08) {
          const g = depth * (0.25 + rand() * 0.3);
          const drift = (rand() - 0.5) * 6;
          cap.push([x + 3, y + 1], [x + drift + 0.6, y + g], [x + drift - 0.6, y + g * 0.92], [x - 3, y + 1]);
        } else {
          cap.push([x, y]);
        }
      }
      snow.push(closed(cap));
    }
  });

  let strata = "";
  if (o.strata) {
    const lines: string[] = [];
    const top = Math.min(...o.ridge.map((p) => p[1]));
    for (let y = top; y < o.bottom + 900; y += o.strata.gap * (0.7 + rand() * 0.6)) {
      const x0 = first[0] - 50;
      const x1 = last[0] + 50;
      lines.push(`M ${r1(x0)} ${r1(y)} L ${r1(x1)} ${r1(y - (x1 - x0) * o.strata.slope)}`);
    }
    strata = lines.join(" ");
  }

  return { silhouette, lit: lit.join(" "), snow: snow.join(" "), strata };
}

/** A single spruce: narrow, tiered, with drooping branch tips. */
function spruce(x: number, base: number, h: number, w: number, rand: () => number) {
  const tiers = 5 + Math.floor(rand() * 3);
  const top = base - h;
  const right: Pt[] = [];
  for (let k = 1; k <= tiers; k++) {
    const t = k / tiers;
    const y = top + h * 0.9 * t;
    const ww = w * t * (0.8 + rand() * 0.35);
    right.push([x + ww, y]);
    if (k < tiers) right.push([x + ww * 0.32, y - h * 0.035]);
  }
  const trunk = Math.max(0.8, w * 0.1);
  const left = right.map(([px, py]) => [2 * x - px, py] as Pt).reverse();
  return closed([[x, top], ...right, [x + trunk, base], [x - trunk, base], ...left]);
}

/** A band of trees following a ground curve, with natural clumps and gaps. */
export function treeLine(opts: {
  seed: number;
  from: number;
  to: number;
  ground: (x: number) => number;
  minH: number;
  maxH: number;
  spacing: number;
  density?: number;
}) {
  const rand = rng(opts.seed);
  const out: string[] = [];
  let x = opts.from;
  while (x < opts.to) {
    const clump = 0.5 + 0.5 * Math.sin(x / 47 + opts.seed) * Math.sin(x / 131);
    if (rand() < (opts.density ?? 0.85) * (0.45 + clump * 0.75)) {
      const h = opts.minH + (opts.maxH - opts.minH) * (0.35 + 0.65 * rand()) * (0.7 + clump * 0.45);
      out.push(spruce(x, opts.ground(x) + 2, h, h * (0.17 + rand() * 0.06), rand));
    }
    x += opts.spacing * (0.6 + rand() * 0.8);
  }
  return out.join(" ");
}

/** Closed shape under a curve, for hills and shorelines. */
export function underCurve(f: (x: number) => number, from: number, to: number, bottom: number, step = 8) {
  const pts: Pt[] = [];
  for (let x = from; x <= to; x += step) pts.push([x, f(x)]);
  return closed([...pts, [to, bottom], [from, bottom]]);
}

/** Scattered points, used for stars and lake shimmer. */
export function scatter(seed: number, n: number, x0: number, x1: number, y0: number, y1: number) {
  const rand = rng(seed);
  return Array.from({ length: n }, () => ({
    x: r1(x0 + rand() * (x1 - x0)),
    y: r1(y0 + Math.pow(rand(), 1.4) * (y1 - y0)),
    s: rand(),
  }));
}
