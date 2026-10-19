/**
 * The exploded Formula Slug car, as plain data: edit parts, positions, colors
 * and callouts here. No three.js in this file, so the phone/reduced-motion
 * parts list can use it without loading the 3D code.
 *
 * Units are roughly meters. +x points to the nose, +y up, +z toward the camera.
 * `explode` is how far a part travels when fully exploded.
 *
 * Callout text uses only facts already on the site (FormulaSlug.tsx).
 */

/**
 * Which site color a shape uses. Read live from the CSS variables, so light and dark both work.
 * Wheels use the site's --tire / --rim tokens (the 2D Journey car's wheel colors), because --fg
 * turns light in dark mode and would make white tires.
 */
export type ColorRole = "accent" | "paper" | "fg" | "edge" | "tire" | "rim";
export const COLOR_VARS: Record<ColorRole, string> = {
  accent: "--accent",
  paper: "--paper",
  fg: "--fg",
  edge: "--edge",
  tire: "--tire",
  rim: "--rim",
};

type Vec3 = [number, number, number];

export type Shape =
  | { kind: "box"; size: Vec3; pos: Vec3; rot?: Vec3; color?: ColorRole }
  | { kind: "cyl"; r: number; h: number; pos: Vec3; rot?: Vec3; color?: ColorRole; seg?: number }
  | { kind: "cone"; r: number; h: number; pos: Vec3; rot?: Vec3; color?: ColorRole }
  | { kind: "tube"; points: Vec3[]; r: number; color?: ColorRole };

export type Part = {
  id: string;
  color: ColorRole;
  shapes: Shape[];
  explode: Vec3;
  /** shown as a label when exploded, plus a one-line note */
  callout?: { label: string; note: string; at: Vec3 };
};

const WHEEL = { r: 0.26, w: 0.22, x: 0.82, z: 0.62 };
const R90 = Math.PI / 2;

const wheel = (id: string, x: number, z: number): Part => ({
  id,
  color: "tire",
  explode: [0, 0, Math.sign(z) * 0.45],
  shapes: [
    { kind: "cyl", r: WHEEL.r, h: WHEEL.w, pos: [x, WHEEL.r, z], rot: [R90, 0, 0], seg: 14 },
    { kind: "cyl", r: 0.1, h: WHEEL.w + 0.02, pos: [x, WHEEL.r, z], rot: [R90, 0, 0], color: "rim", seg: 10 },
  ],
});

export const PARTS: Part[] = [
  {
    id: "chassis",
    color: "edge",
    explode: [0, -0.22, 0],
    shapes: [{ kind: "box", size: [2.5, 0.07, 0.62], pos: [0, 0.12, 0] }],
  },
  {
    id: "bodywork",
    color: "accent",
    explode: [0, 0.8, -0.7],
    shapes: [
      { kind: "box", size: [1.25, 0.3, 0.5], pos: [0.3, 0.32, 0] }, // tub
      { kind: "cone", r: 0.21, h: 0.62, pos: [1.22, 0.29, 0], rot: [0, 0, -R90] }, // nose
      { kind: "box", size: [0.85, 0.24, 0.26], pos: [-0.3, 0.27, 0.4] }, // side pods
      { kind: "box", size: [0.85, 0.24, 0.26], pos: [-0.3, 0.27, -0.4] },
      { kind: "box", size: [0.7, 0.34, 0.5], pos: [-0.85, 0.36, 0] }, // engine cover
      { kind: "box", size: [0.05, 0.42, 0.05], pos: [-0.36, 0.62, 0.2], color: "edge" }, // roll hoop
      { kind: "box", size: [0.05, 0.42, 0.05], pos: [-0.36, 0.62, -0.2], color: "edge" },
      { kind: "box", size: [0.05, 0.05, 0.45], pos: [-0.36, 0.83, 0], color: "edge" },
    ],
  },
  {
    id: "front-wing",
    color: "paper",
    explode: [0.5, 0, 0],
    shapes: [
      { kind: "box", size: [0.34, 0.03, 1.36], pos: [1.66, 0.09, 0] },
      { kind: "box", size: [0.36, 0.14, 0.02], pos: [1.66, 0.14, 0.68], color: "edge" },
      { kind: "box", size: [0.36, 0.14, 0.02], pos: [1.66, 0.14, -0.68], color: "edge" },
    ],
  },
  {
    id: "rear-wing",
    color: "paper",
    explode: [-0.55, 0.3, 0],
    shapes: [
      { kind: "box", size: [0.3, 0.03, 1.05], pos: [-1.42, 0.86, 0] },
      { kind: "box", size: [0.2, 0.03, 1.05], pos: [-1.3, 0.96, 0] },
      { kind: "box", size: [0.04, 0.5, 0.04], pos: [-1.32, 0.6, 0.28], color: "edge" },
      { kind: "box", size: [0.04, 0.5, 0.04], pos: [-1.32, 0.6, -0.28], color: "edge" },
      { kind: "box", size: [0.36, 0.26, 0.02], pos: [-1.38, 0.88, 0.53], color: "edge" },
      { kind: "box", size: [0.36, 0.26, 0.02], pos: [-1.38, 0.88, -0.53], color: "edge" },
    ],
  },
  wheel("wheel-fl", WHEEL.x, WHEEL.z),
  wheel("wheel-fr", WHEEL.x, -WHEEL.z),
  wheel("wheel-rl", -WHEEL.x, WHEEL.z),
  wheel("wheel-rr", -WHEEL.x, -WHEEL.z),

  // ---- the parts with callouts (the firmware side of the car) ----
  {
    id: "battery-tray",
    color: "paper",
    explode: [-0.3, 0.05, 0.5],
    shapes: [
      { kind: "box", size: [0.56, 0.18, 0.46], pos: [-0.85, 0.25, 0] },
      { kind: "box", size: [0.6, 0.03, 0.5], pos: [-0.85, 0.16, 0], color: "edge" },
    ],
    callout: { label: "Battery tray", note: "The tray whose temperatures the firmware monitors.", at: [-0.85, 0.06, 0.25] },
  },
  {
    id: "temp-sensors",
    color: "accent",
    explode: [-0.3, 0.55, 0.5],
    shapes: [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz): Shape => ({ kind: "cyl", r: 0.035, h: 0.05, pos: [-0.85 + sx * 0.19, 0.37, sz * 0.15], seg: 8 })),
    ),
    callout: {
      label: "4x DS18B20 temperature sensors",
      note: "OneWire sensors on the tray, with automatic shutdown on safety-threshold faults.",
      at: [-0.85, 0.52, 0],
    },
  },
  {
    id: "vcu",
    color: "paper",
    explode: [0.55, 0.35, 0.75],
    shapes: [
      { kind: "box", size: [0.2, 0.06, 0.16], pos: [0.85, 0.2, 0.08] },
      { kind: "box", size: [0.07, 0.025, 0.07], pos: [0.85, 0.24, 0.08], color: "fg" }, // the chip
    ],
    callout: { label: "STM32 VCU", note: "STM32 C/C++ firmware: sensor readings in, CAN reports out, plus the throttle map.", at: [0.85, 0.28, 0.08] },
  },
  {
    id: "can-bus",
    color: "accent",
    explode: [0, -0.18, 1.15],
    shapes: [
      {
        kind: "tube",
        r: 0.014,
        points: [
          [0.78, 0.18, 0.12],
          [0.4, 0.17, 0.2],
          [-0.2, 0.17, 0.22],
          [-0.6, 0.2, 0.18],
        ],
      },
    ],
    callout: { label: "CAN bus", note: "Protocol I redesigned for the new battery and chip architecture, now used for telemetry.", at: [0.1, 0.08, 0.22] },
  },
  {
    id: "throttle-pedal",
    color: "edge",
    explode: [0.75, 0.55, -0.2],
    shapes: [
      { kind: "box", size: [0.03, 0.16, 0.08], pos: [1.08, 0.24, -0.06], rot: [0, 0, 0.45] },
      { kind: "box", size: [0.12, 0.02, 0.1], pos: [1.04, 0.16, -0.06] },
    ],
    callout: { label: "Throttle pedal", note: "Pedal travel in, torque request out, through the throttle map.", at: [1.08, 0.32, -0.06] },
  },
];

export const CALLOUT_PARTS = PARTS.filter((p) => p.callout);
