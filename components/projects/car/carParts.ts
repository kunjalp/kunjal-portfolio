/**
 * The exploded Formula Slug car, as plain data: edit parts, positions, colors
 * and callouts here. No three.js in this file, so the phone/reduced-motion
 * parts list can use it without loading the 3D code.
 *
 * Styled after the team's open-wheel car: long wheelbase, narrow yellow skin over
 * a triangulated tube space frame, blue nose sloping down to a small blue front
 * wing, black slicks, tall hoop behind the driver, open rear bay with the battery
 * tray and electronics, and a tall rear wing behind the rear axle with big blue
 * endplates. Plain colors and the number only: no logos, wordmarks or school name.
 *
 * Units are roughly meters. +x points to the nose, +y up, +z toward the camera.
 * `explode` is how far a part travels when fully exploded.
 *
 * Callout text uses only facts already on the site (FormulaSlug.tsx).
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

/** The car's own paint. Fixed: these are the car's colors in both light and dark mode. */
export const LIVERY = {
  yellow: "#f2c12e",
  blue: "#1d4fb3",
  black: "#151517",
  /** the tube space frame */
  frame: "#8a8e99",
};

/** Racing number, drawn as a plain bold decal. */
export const CAR_NUMBER = "96";

/**
 * Which color a shape uses. Livery colors are fixed; the rest are read live from the
 * site's CSS variables, so the hardware (tray, VCU, wiring) follows light/dark.
 */
export type ColorRole = "yellow" | "blue" | "black" | "frame" | "accent" | "paper" | "fg" | "edge" | "rim";
export const COLORS: Record<ColorRole, { hex: string } | { cssVar: string }> = {
  yellow: { hex: LIVERY.yellow },
  blue: { hex: LIVERY.blue },
  black: { hex: LIVERY.black },
  frame: { hex: LIVERY.frame },
  accent: { cssVar: "--accent" },
  paper: { cssVar: "--paper" },
  fg: { cssVar: "--fg" },
  edge: { cssVar: "--edge" },
  rim: { cssVar: "--rim" },
};

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

export type Shape =
  | { kind: "box"; size: Vec3; pos: Vec3; rot?: Vec3; color?: ColorRole }
  | { kind: "cyl"; r: number; h: number; pos: Vec3; rot?: Vec3; color?: ColorRole; seg?: number; r2?: number }
  | { kind: "cone"; r: number; h: number; pos: Vec3; rot?: Vec3; color?: ColorRole }
  | { kind: "sphere"; r: number; pos: Vec3; color?: ColorRole }
  | { kind: "tube"; points: Vec3[]; r: number; color?: ColorRole }
  /** a straight round tube from a to b (frame members, suspension arms, struts) */
  | { kind: "rod"; a: Vec3; b: Vec3; r: number; color?: ColorRole }
  /** a flat plate cut from a smooth 2D outline (x, y), extruded `depth` along z */
  | { kind: "plate"; outline: [number, number][]; depth: number; pos: Vec3; rot?: Vec3; color?: ColorRole }
  /** the racing number on a transparent plane, `size` = [width, height] */
  | { kind: "decal"; size: [number, number]; pos: Vec3; rot?: Vec3 };

export type Part = {
  id: string;
  color: ColorRole;
  shapes: Shape[];
  explode: Vec3;
  /** shown as a label when exploded, plus a one-line note */
  callout?: { label: string; note: string; at: Vec3 };
};

// ---------------------------------------------------------------------------
// Layout (proportions after the team's drawings: long wheelbase, narrow body)
// ---------------------------------------------------------------------------

const R90 = Math.PI / 2;
const TIRE = { r: 0.25, w: 0.26 };
const AXLE = { front: 1.05, rear: -0.85 };
const TRACK = { front: 0.62, rear: 0.6 };
/** Space frame: half-width, rail heights, and the stations (x) where verticals sit. */
const FRAME = { half: 0.18, low: 0.1, high: 0.4, stations: [0.55, 0.12, -0.32, -0.66, -1.0], r: 0.011 };
/** Main roll hoop, right behind the driver's head. */
const HOOP = { x: -0.32, top: 0.9, half: 0.16 };

/** A slick with its hub and upper/lower A-arms back to the frame. */
const wheel = (id: string, x: number, z: number): Part => {
  const side = Math.sign(z);
  const hubZ = side * (Math.abs(z) - TIRE.w / 2);
  const fz = side * FRAME.half;
  const arm = (y: number, yHub: number): Shape[] => [
    { kind: "rod", a: [x - 0.16, y, fz], b: [x, yHub, hubZ], r: 0.012 },
    { kind: "rod", a: [x + 0.16, y, fz], b: [x, yHub, hubZ], r: 0.012 },
  ];
  return {
    id,
    color: "black",
    explode: [0, 0, side * 0.45],
    shapes: [
      { kind: "cyl", r: TIRE.r, h: TIRE.w, pos: [x, TIRE.r, z], rot: [R90, 0, 0], seg: 18 },
      { kind: "cyl", r: 0.13, h: TIRE.w + 0.01, pos: [x, TIRE.r, z], rot: [R90, 0, 0], color: "rim", seg: 12 },
      ...arm(FRAME.high - 0.04, TIRE.r + 0.08),
      ...arm(FRAME.low + 0.04, TIRE.r - 0.08),
    ],
  };
};

/** Triangulated tube frame: lower and upper rails, verticals, diagonals, cross members. */
function spaceFrame(): Shape[] {
  const { half: h, low, high, stations: xs, r } = FRAME;
  const rods: Shape[] = [];
  const rod = (a: Vec3, b: Vec3) => rods.push({ kind: "rod", a, b, r });
  for (const z of [-h, h]) {
    // lower rail runs nose to tail; upper rail from the front bulkhead back
    rod([1.0, low, z * 0.7], [xs[0], low, z]);
    for (let i = 0; i < xs.length - 1; i++) {
      rod([xs[i], low, z], [xs[i + 1], low, z]);
      rod([xs[i], high, z], [xs[i + 1], high, z]);
      rod([xs[i], low, z], [xs[i + 1], high, z]); // triangulating diagonal
    }
    for (const x of xs) rod([x, low, z], [x, high, z]);
    // front section slopes down toward the nose
    rod([xs[0], high, z], [1.0, 0.24, z * 0.7]);
    rod([1.0, low, z * 0.7], [1.0, 0.24, z * 0.7]);
  }
  for (const x of [xs[0], HOOP.x, xs[xs.length - 1]]) {
    rod([x, low, -h], [x, low, h]);
    rod([x, high, -h], [x, high, h]);
  }
  return rods;
}

/** Rear wing endplate outline: big and tall, nearly a box, with a rounded front top. */
const ENDPLATE: [number, number][] = [
  [0, 0],
  [0.58, 0],
  [0.62, 0.3],
  [0.58, 0.54],
  [0.42, 0.64],
  [0.06, 0.64],
  [0, 0.36],
];

export const PARTS: Part[] = [
  {
    id: "chassis",
    color: "frame",
    explode: [0, -0.22, 0],
    shapes: spaceFrame(),
  },
  {
    id: "bodywork",
    color: "yellow",
    explode: [0, 0.8, -0.7],
    shapes: [
      // narrow yellow skin from the bulkhead back to the hoop; the frame shows above and below it
      { kind: "box", size: [0.88, 0.2, 0.02], pos: [0.12, 0.26, 0.2] },
      { kind: "box", size: [0.88, 0.2, 0.02], pos: [0.12, 0.26, -0.2] },
      { kind: "box", size: [0.42, 0.05, 0.4], pos: [0.36, 0.41, 0], rot: [0, 0, -0.12] }, // cowl ahead of the driver
      // sidepods between the wheels
      { kind: "box", size: [0.6, 0.2, 0.15], pos: [-0.05, 0.24, 0.285] },
      { kind: "box", size: [0.6, 0.2, 0.15], pos: [-0.05, 0.24, -0.285] },
      // blue nose, sloping down to a low point
      { kind: "cone", r: 0.15, h: 0.82, pos: [0.94, 0.25, 0], rot: [0, 0, -R90 - 0.32], color: "blue" },
      // cockpit: black seat (pan and back) just ahead of the hoop, blue driver
      { kind: "box", size: [0.3, 0.04, 0.3], pos: [-0.1, 0.3, 0], color: "black" },
      { kind: "box", size: [0.04, 0.3, 0.3], pos: [-0.26, 0.43, 0], rot: [0, 0, 0.15], color: "black" },
      { kind: "box", size: [0.12, 0.1, 0.3], pos: [-0.17, 0.49, 0], color: "blue" },
      { kind: "sphere", r: 0.095, pos: [-0.14, 0.63, 0], color: "blue" },
      // tall main roll hoop right behind the helmet, braced back to the frame
      { kind: "rod", a: [HOOP.x, FRAME.high, HOOP.half], b: [HOOP.x, HOOP.top, HOOP.half * 0.8], r: 0.02, color: "black" },
      { kind: "rod", a: [HOOP.x, FRAME.high, -HOOP.half], b: [HOOP.x, HOOP.top, -HOOP.half * 0.8], r: 0.02, color: "black" },
      { kind: "rod", a: [HOOP.x, HOOP.top, HOOP.half * 0.8], b: [HOOP.x, HOOP.top, -HOOP.half * 0.8], r: 0.02, color: "black" },
      { kind: "rod", a: [HOOP.x, HOOP.top - 0.02, 0.12], b: [-0.78, FRAME.high, 0.17], r: 0.014, color: "black" },
      { kind: "rod", a: [HOOP.x, HOOP.top - 0.02, -0.12], b: [-0.78, FRAME.high, -0.17], r: 0.014, color: "black" },
      // #96 on both sidepods
      { kind: "decal", size: [0.24, 0.14], pos: [-0.05, 0.24, 0.362] },
      { kind: "decal", size: [0.24, 0.14], pos: [-0.05, 0.24, -0.362], rot: [0, Math.PI, 0] },
    ],
  },
  {
    id: "front-wing",
    color: "blue",
    explode: [0.5, 0, 0],
    shapes: [
      // small wing, under and ahead of the nose tip
      { kind: "box", size: [0.26, 0.02, 1.1], pos: [1.52, 0.06, 0] },
      { kind: "box", size: [0.16, 0.02, 1.1], pos: [1.46, 0.1, 0], rot: [0, 0, 0.28] },
      { kind: "box", size: [0.3, 0.13, 0.02], pos: [1.5, 0.1, 0.56] },
      { kind: "box", size: [0.3, 0.13, 0.02], pos: [1.5, 0.1, -0.56] },
      { kind: "rod", a: [1.3, 0.14, 0.07], b: [1.48, 0.07, 0.09], r: 0.01 },
      { kind: "rod", a: [1.3, 0.14, -0.07], b: [1.48, 0.07, -0.09], r: 0.01 },
    ],
  },
  {
    id: "rear-wing",
    color: "black",
    explode: [-0.55, 0.3, 0],
    shapes: [
      // tall stack of elements, high and behind the rear axle
      { kind: "box", size: [0.36, 0.025, 0.86], pos: [-1.24, 0.96, 0] },
      { kind: "box", size: [0.26, 0.025, 0.86], pos: [-1.13, 1.08, 0], rot: [0, 0, 0.3] },
      { kind: "box", size: [0.18, 0.025, 0.86], pos: [-1.05, 1.18, 0], rot: [0, 0, 0.5] },
      // struts down to the back of the frame
      { kind: "rod", a: [-1.0, FRAME.high, 0.15], b: [-1.2, 0.95, 0.2], r: 0.016 },
      { kind: "rod", a: [-1.0, FRAME.high, -0.15], b: [-1.2, 0.95, -0.2], r: 0.016 },
      // big flat blue endplates
      { kind: "plate", outline: ENDPLATE, depth: 0.02, pos: [-1.48, 0.66, 0.43], color: "blue" },
      { kind: "plate", outline: ENDPLATE, depth: 0.02, pos: [-1.48, 0.66, -0.45], color: "blue" },
    ],
  },
  wheel("wheel-fl", AXLE.front, TRACK.front),
  wheel("wheel-fr", AXLE.front, -TRACK.front),
  wheel("wheel-rl", AXLE.rear, TRACK.rear),
  wheel("wheel-rr", AXLE.rear, -TRACK.rear),

  // ---- the parts with callouts: the open bay behind the seat, between the hoop and the rear wheels ----
  {
    id: "battery-tray",
    color: "paper",
    explode: [-0.3, 0.05, 0.5],
    shapes: [
      { kind: "box", size: [0.38, 0.14, 0.3], pos: [-0.56, 0.2, 0] },
      { kind: "box", size: [0.42, 0.025, 0.34], pos: [-0.56, 0.12, 0], color: "edge" },
    ],
    callout: { label: "Battery tray", note: "The tray whose temperatures the firmware monitors.", at: [-0.7, 0.02, 0.2] },
  },
  {
    id: "temp-sensors",
    color: "accent",
    explode: [-0.3, 0.55, 0.5],
    shapes: [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz): Shape => ({ kind: "cyl", r: 0.03, h: 0.045, pos: [-0.56 + sx * 0.12, 0.29, sz * 0.09], seg: 8 })),
    ),
    callout: {
      label: "4x DS18B20 temperature sensors",
      note: "OneWire sensors on the tray, with automatic shutdown on safety-threshold faults.",
      at: [-0.7, 0.6, 0],
    },
  },
  {
    id: "vcu",
    color: "paper",
    explode: [0.55, 0.35, 0.75],
    shapes: [
      { kind: "box", size: [0.14, 0.05, 0.12], pos: [-0.62, 0.4, 0.06] },
      { kind: "box", size: [0.05, 0.02, 0.05], pos: [-0.62, 0.435, 0.06], color: "fg" }, // the chip
    ],
    callout: { label: "STM32 VCU", note: "STM32 C/C++ firmware: sensor readings in, CAN reports out, plus the throttle map.", at: [-0.62, 0.3, 0.06] },
  },
  // CAN bus: from the VCU, down past the tray, forward along the floor to the pedal box.
  {
    id: "can-bus",
    color: "accent",
    explode: [0, -0.18, 1.15],
    shapes: [
      {
        kind: "tube",
        r: 0.012,
        points: [
          [-0.62, 0.38, 0.11],
          [-0.52, 0.2, 0.19],
          [-0.1, 0.14, 0.16],
          [0.4, 0.14, 0.1],
          [0.72, 0.16, 0.04],
        ],
      },
    ],
    callout: { label: "CAN bus", note: "Protocol I redesigned for the new battery and chip architecture, now used for telemetry.", at: [0.5, 0.05, 0.1] },
  },
  {
    id: "throttle-pedal",
    color: "edge",
    explode: [0.75, 0.55, -0.2],
    shapes: [
      { kind: "box", size: [0.025, 0.14, 0.07], pos: [0.76, 0.21, -0.05], rot: [0, 0, 0.45] },
      { kind: "box", size: [0.1, 0.02, 0.09], pos: [0.73, 0.14, -0.05] },
    ],
    callout: { label: "Throttle pedal", note: "Pedal travel in, torque request out, through the throttle map.", at: [0.76, 0.29, -0.05] },
  },
];

export const CALLOUT_PARTS = PARTS.filter((p) => p.callout);
