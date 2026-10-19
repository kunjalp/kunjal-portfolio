/**
 * The exploded Formula Slug car, as plain data: edit parts, positions, colors
 * and callouts here. No three.js in this file, so the phone/reduced-motion
 * parts list can use it without loading the 3D code.
 *
 * Styled after the team's open-wheel car: low narrow yellow body, blue nose and
 * wings, black slicks, a tall rear wing with big curved blue endplates, and #96.
 * Plain colors and the number only: no sponsor logos, wordmarks or school name.
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
};

/** Racing number, drawn as a plain bold decal. */
export const CAR_NUMBER = "96";

/**
 * Which color a shape uses. Livery colors are fixed; the rest are read live from the
 * site's CSS variables, so the hardware (tray, VCU, wiring) and floor follow light/dark.
 */
export type ColorRole = "yellow" | "blue" | "black" | "accent" | "paper" | "fg" | "edge" | "rim";
export const COLORS: Record<ColorRole, { hex: string } | { cssVar: string }> = {
  yellow: { hex: LIVERY.yellow },
  blue: { hex: LIVERY.blue },
  black: { hex: LIVERY.black },
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
// Layout
// ---------------------------------------------------------------------------

const R90 = Math.PI / 2;
/** Slicks: wide and squat. Fronts sit well outside the narrow nose. */
const TIRE = { r: 0.25, w: 0.27 };
const AXLE = { front: 0.98, rear: -0.72 };
const TRACK = { front: 0.64, rear: 0.6 };
/** Body half-width where the suspension arms meet it. */
const BODY_HALF = 0.17;

/** A slick with its hub and two suspension arms back to the body. */
const wheel = (id: string, x: number, z: number): Part => {
  const side = Math.sign(z);
  const armLen = Math.abs(z) - BODY_HALF - TIRE.w / 2;
  const armZ = side * (BODY_HALF + armLen / 2);
  return {
    id,
    color: "black",
    explode: [0, 0, side * 0.45],
    shapes: [
      { kind: "cyl", r: TIRE.r, h: TIRE.w, pos: [x, TIRE.r, z], rot: [R90, 0, 0], seg: 16 },
      { kind: "cyl", r: 0.13, h: TIRE.w + 0.01, pos: [x, TIRE.r, z], rot: [R90, 0, 0], color: "rim", seg: 10 },
      // upper and lower wishbones, angled a little like the real ones
      { kind: "box", size: [0.03, 0.02, armLen], pos: [x, TIRE.r + 0.08, armZ], rot: [side * -0.12, 0, 0] },
      { kind: "box", size: [0.03, 0.02, armLen], pos: [x, TIRE.r - 0.07, armZ], rot: [side * 0.08, 0, 0] },
    ],
  };
};

/** Rear wing endplate outline: tall, with a curved leading edge and top (traced smooth). */
const ENDPLATE: [number, number][] = [
  [0, 0],
  [0.5, 0],
  [0.56, 0.2],
  [0.52, 0.46],
  [0.36, 0.62],
  [0.1, 0.64],
  [-0.04, 0.4],
];

export const PARTS: Part[] = [
  {
    id: "chassis",
    color: "edge",
    explode: [0, -0.22, 0],
    shapes: [{ kind: "box", size: [2.2, 0.05, 0.42], pos: [-0.05, 0.1, 0] }],
  },
  {
    id: "bodywork",
    color: "yellow",
    explode: [0, 0.8, -0.7],
    shapes: [
      // low, narrow tub tapering into the nose
      { kind: "box", size: [1.0, 0.26, 0.34], pos: [0.2, 0.27, 0] },
      { kind: "cone", r: 0.15, h: 0.62, pos: [1.0, 0.24, 0], rot: [0, 0, -R90], color: "blue" },
      // sidepods between the wheels
      { kind: "box", size: [0.7, 0.22, 0.2], pos: [-0.3, 0.24, 0.26] },
      { kind: "box", size: [0.7, 0.22, 0.2], pos: [-0.3, 0.24, -0.26] },
      // engine cover behind the driver, tapering toward the rear wing
      // (rotated so `r` ends up at the rear end, `r2` at the driver)
      { kind: "cyl", r: 0.12, r2: 0.2, h: 0.55, pos: [-0.85, 0.3, 0], rot: [0, 0, R90], seg: 8 },
      // cockpit: black seat area, roll hoop, and a blue driver (helmet and shoulders)
      { kind: "box", size: [0.42, 0.04, 0.26], pos: [-0.05, 0.41, 0], color: "black" },
      { kind: "box", size: [0.1, 0.1, 0.3], pos: [-0.12, 0.46, 0], color: "blue" },
      { kind: "sphere", r: 0.095, pos: [-0.1, 0.6, 0], color: "blue" },
      { kind: "box", size: [0.04, 0.36, 0.04], pos: [-0.3, 0.55, 0.14], color: "black" },
      { kind: "box", size: [0.04, 0.36, 0.04], pos: [-0.3, 0.55, -0.14], color: "black" },
      { kind: "box", size: [0.04, 0.04, 0.32], pos: [-0.3, 0.73, 0], color: "black" },
      // #96 on both sidepods
      { kind: "decal", size: [0.24, 0.14], pos: [-0.28, 0.25, 0.362] },
      { kind: "decal", size: [0.24, 0.14], pos: [-0.28, 0.25, -0.362], rot: [0, Math.PI, 0] },
    ],
  },
  {
    id: "front-wing",
    color: "blue",
    explode: [0.5, 0, 0],
    shapes: [
      { kind: "box", size: [0.3, 0.025, 1.28], pos: [1.5, 0.07, 0] },
      { kind: "box", size: [0.18, 0.02, 1.28], pos: [1.44, 0.12, 0], rot: [0, 0, 0.25] },
      { kind: "box", size: [0.34, 0.14, 0.02], pos: [1.48, 0.12, 0.65] },
      { kind: "box", size: [0.34, 0.14, 0.02], pos: [1.48, 0.12, -0.65] },
    ],
  },
  {
    id: "rear-wing",
    color: "black",
    explode: [-0.55, 0.3, 0],
    shapes: [
      // stacked elements, high up
      { kind: "box", size: [0.34, 0.025, 0.92], pos: [-1.28, 0.92, 0] },
      { kind: "box", size: [0.24, 0.025, 0.92], pos: [-1.18, 1.03, 0], rot: [0, 0, 0.3] },
      { kind: "box", size: [0.16, 0.025, 0.92], pos: [-1.1, 1.12, 0], rot: [0, 0, 0.5] },
      // struts
      { kind: "box", size: [0.04, 0.6, 0.04], pos: [-1.2, 0.6, 0.18] },
      { kind: "box", size: [0.04, 0.6, 0.04], pos: [-1.2, 0.6, -0.18] },
      // big curved blue endplates
      { kind: "plate", outline: ENDPLATE, depth: 0.02, pos: [-1.5, 0.62, 0.46], color: "blue" },
      { kind: "plate", outline: ENDPLATE, depth: 0.02, pos: [-1.5, 0.62, -0.48], color: "blue" },
    ],
  },
  wheel("wheel-fl", AXLE.front, TRACK.front),
  wheel("wheel-fr", AXLE.front, -TRACK.front),
  wheel("wheel-rl", AXLE.rear, TRACK.rear),
  wheel("wheel-rr", AXLE.rear, -TRACK.rear),

  // ---- the parts with callouts (the firmware side of the car) ----
  // Battery tray: middle of the car, low, between the sidepods.
  {
    id: "battery-tray",
    color: "paper",
    explode: [-0.3, 0.05, 0.5],
    shapes: [
      { kind: "box", size: [0.5, 0.14, 0.3], pos: [-0.3, 0.2, 0] },
      { kind: "box", size: [0.54, 0.025, 0.34], pos: [-0.3, 0.13, 0], color: "edge" },
    ],
    callout: { label: "Battery tray", note: "The tray whose temperatures the firmware monitors.", at: [-0.45, 0.02, 0.2] },
  },
  {
    id: "temp-sensors",
    color: "accent",
    explode: [-0.3, 0.55, 0.5],
    shapes: [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz): Shape => ({ kind: "cyl", r: 0.03, h: 0.045, pos: [-0.3 + sx * 0.17, 0.29, sz * 0.09], seg: 8 })),
    ),
    callout: {
      label: "4x DS18B20 temperature sensors",
      note: "OneWire sensors on the tray, with automatic shutdown on safety-threshold faults.",
      at: [-0.45, 0.6, 0],
    },
  },
  // VCU: behind the driver, above the tray, ahead of the engine cover.
  {
    id: "vcu",
    color: "paper",
    explode: [0.55, 0.35, 0.75],
    shapes: [
      { kind: "box", size: [0.16, 0.05, 0.14], pos: [-0.5, 0.38, 0.05] },
      { kind: "box", size: [0.06, 0.02, 0.06], pos: [-0.5, 0.415, 0.05], color: "fg" }, // the chip
    ],
    callout: { label: "STM32 VCU", note: "STM32 C/C++ firmware: sensor readings in, CAN reports out, plus the throttle map.", at: [-0.45, 0.3, 0.05] },
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
          [-0.5, 0.36, 0.1],
          [-0.42, 0.2, 0.18],
          [-0.05, 0.15, 0.15],
          [0.4, 0.15, 0.1],
          [0.72, 0.17, 0.04],
        ],
      },
    ],
    callout: { label: "CAN bus", note: "Protocol I redesigned for the new battery and chip architecture, now used for telemetry.", at: [0.5, 0.06, 0.1] },
  },
  {
    id: "throttle-pedal",
    color: "edge",
    explode: [0.75, 0.55, -0.2],
    shapes: [
      { kind: "box", size: [0.025, 0.14, 0.07], pos: [0.78, 0.22, -0.05], rot: [0, 0, 0.45] },
      { kind: "box", size: [0.1, 0.02, 0.09], pos: [0.75, 0.15, -0.05] },
    ],
    callout: { label: "Throttle pedal", note: "Pedal travel in, torque request out, through the throttle map.", at: [0.78, 0.3, -0.05] },
  },
];

export const CALLOUT_PARTS = PARTS.filter((p) => p.callout);
