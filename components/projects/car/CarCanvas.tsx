"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  Group,
  MeshStandardMaterial,
  PMREMGenerator,
  Shape as Outline,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CAR_NUMBER, COLORS, LIVERY, PARTS, type ColorRole, type Part, type Shape } from "./carParts";

/**
 * Small low-poly FSAE car built from primitives, exploded by `target` (0..1).
 * Parts, positions, colors and callouts live in carParts.ts.
 *
 * To use a real model instead: load it with drei's useGLTF("/models/car.glb"),
 * then render each named mesh in place of <PartMesh> below (match mesh names to
 * the ids in PARTS so the explode offsets and callouts still apply).
 */

// ---------------------------------------------------------------------------
// Tweakables
// ---------------------------------------------------------------------------
const CAMERA = { position: [4.4, 2.9, 5.6] as const, lookAt: [0.1, 0.6, 0.2] as const, fov: 28 };
/** How fast the shown explode amount follows the slider/drag (higher = snappier). */
const EASE = 9;
/** The car turns a little as it explodes, so the depth reads. Radians at full explode. */
const TURN = 0.18;
/** Callouts fade in between these explode amounts. */
const CALLOUT_FADE = [0.45, 0.8] as const;
/** Max device pixel ratio for this canvas. */
const MAX_DPR = 1.75;

/**
 * Shading. Paint is glossy and reflects a soft studio environment, so color shades
 * across every panel instead of sitting flat. Roughness/metalness per color role (0..1).
 */
const FINISH: Record<ColorRole, { rough: number; metal: number }> = {
  yellow: { rough: 0.32, metal: 0.05 },
  blue: { rough: 0.32, metal: 0.05 },
  black: { rough: 0.6, metal: 0 },
  accent: { rough: 0.45, metal: 0.1 },
  paper: { rough: 0.7, metal: 0 },
  fg: { rough: 0.5, metal: 0.2 },
  edge: { rough: 0.75, metal: 0 },
  rim: { rough: 0.3, metal: 0.7 },
};
/** Strength of the studio reflections. */
const ENV_INTENSITY = 0.55;
/** Lights: warm sky above, dark ground bounce below, a key from the front, a cool rim from behind. */
const LIGHTS = {
  hemi: { sky: "#fff3df", ground: "#2a2230", intensity: 1.1 },
  key: { position: [3, 5, 4] as const, intensity: 1.9 },
  rim: { position: [-4, 2.5, -3] as const, intensity: 0.9, color: "#cfe0ff" },
};
/** Every surface darkens toward the ground: brightness at the floor vs. full brightness at `top` (world y). */
const GRADIENT = { floor: 0.5, top: 0.8 };

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/** Darken each fragment toward the ground (world y), so surfaces get a soft vertical gradient. */
function addHeightGradient(m: MeshStandardMaterial) {
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vGradY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGradY = (modelMatrix * vec4(transformed, 1.0)).y;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vGradY;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
gl_FragColor.rgb *= mix(${GRADIENT.floor.toFixed(3)}, 1.0, smoothstep(0.0, ${GRADIENT.top.toFixed(3)}, vGradY));`,
      );
  };
}

type CarMats = { flat: Record<ColorRole, MeshStandardMaterial>; smooth: Record<ColorRole, MeshStandardMaterial> };

/**
 * Materials per color role, in two flavors: faceted (boxes, plates) and smooth
 * (tires, nose, helmet, wiring). Livery colors are fixed; site colors are re-read
 * from the CSS variables whenever the theme changes.
 */
function useCarMaterials(): CarMats {
  const invalidate = useThree((s) => s.invalidate);
  const mats = useMemo(() => {
    const make = (flatShading: boolean) =>
      Object.fromEntries(
        (Object.keys(COLORS) as ColorRole[]).map((role) => {
          const c = COLORS[role];
          const m = new MeshStandardMaterial({
            flatShading,
            side: DoubleSide,
            roughness: FINISH[role].rough,
            metalness: FINISH[role].metal,
            envMapIntensity: ENV_INTENSITY,
          });
          if ("hex" in c) m.color.setStyle(c.hex);
          addHeightGradient(m);
          return [role, m];
        }),
      ) as Record<ColorRole, MeshStandardMaterial>;
    return { flat: make(true), smooth: make(false) };
  }, []);
  useEffect(() => {
    const apply = () => {
      const cs = getComputedStyle(document.documentElement);
      for (const role of Object.keys(COLORS) as ColorRole[]) {
        const c = COLORS[role];
        if (!("cssVar" in c)) continue;
        const rgb = cs.getPropertyValue(c.cssVar).trim().split(/\s+/).join(", ");
        mats.flat[role].color.setStyle(`rgb(${rgb})`);
        mats.smooth[role].color.setStyle(`rgb(${rgb})`);
      }
      invalidate();
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      mo.disconnect();
      [...Object.values(mats.flat), ...Object.values(mats.smooth)].forEach((m) => m.dispose());
    };
  }, [mats, invalidate]);
  return mats;
}

/** The racing number as a texture: plain bold digits, black on transparent, drawn once. */
function useNumberTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 160;
    const g = c.getContext("2d")!;
    g.fillStyle = LIVERY.black;
    g.font = "800 128px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(CAR_NUMBER, 128, 86);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function NumberDecal({ s }: { s: Extract<Shape, { kind: "decal" }> }) {
  const tex = useNumberTexture();
  return (
    <mesh position={s.pos} rotation={s.rot ?? [0, 0, 0]}>
      <planeGeometry args={s.size} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/** Flat plate from a smooth 2D outline (the rear wing endplates). */
function Plate({ s, mat }: { s: Extract<Shape, { kind: "plate" }>; mat: MeshStandardMaterial }) {
  const outline = useMemo(() => {
    const o = new Outline();
    const pts = s.outline.map(([x, y]) => new Vector2(x, y));
    o.moveTo(pts[0].x, pts[0].y);
    o.splineThru(pts.slice(1));
    o.closePath();
    return o;
  }, [s.outline]);
  return (
    <mesh position={s.pos} rotation={s.rot ?? [0, 0, 0]} material={mat}>
      <extrudeGeometry args={[outline, { depth: s.depth, bevelEnabled: false, curveSegments: 6 }]} />
    </mesh>
  );
}

/** Curved shapes get smooth shading so highlights roll across them; boxes stay faceted. */
const SMOOTH_KINDS = new Set<Shape["kind"]>(["cyl", "cone", "sphere", "tube"]);

function ShapeMesh({ s, mat }: { s: Shape; mat: MeshStandardMaterial }) {
  if (s.kind === "decal") return <NumberDecal s={s} />;
  if (s.kind === "plate") return <Plate s={s} mat={mat} />;
  if (s.kind === "sphere") {
    return (
      <mesh position={s.pos} material={mat}>
        <icosahedronGeometry args={[s.r, 1]} />
      </mesh>
    );
  }
  if (s.kind === "tube") {
    const curve = new CatmullRomCurve3(s.points.map((p) => new Vector3(...p)));
    return (
      <mesh material={mat}>
        <tubeGeometry args={[curve, 24, s.r, 6, false]} />
      </mesh>
    );
  }
  return (
    <mesh position={s.pos} rotation={s.rot ?? [0, 0, 0]} material={mat}>
      {s.kind === "box" && <boxGeometry args={s.size} />}
      {s.kind === "cyl" && <cylinderGeometry args={[s.r, s.r2 ?? s.r, s.h, s.seg ?? 12]} />}
      {s.kind === "cone" && <coneGeometry args={[s.r, s.h, 8]} />}
    </mesh>
  );
}

function PartMesh({
  part,
  mats,
  setRef,
  labelRef,
  onFocusLabel,
}: {
  part: Part;
  mats: CarMats;
  setRef: (g: Group | null) => void;
  labelRef: (el: HTMLButtonElement | null) => void;
  onFocusLabel: (note: string | null) => void;
}) {
  return (
    <group ref={setRef}>
      {part.shapes.map((s, i) => (
        <ShapeMesh
          key={i}
          s={s}
          mat={(SMOOTH_KINDS.has(s.kind) ? mats.smooth : mats.flat)[("color" in s && s.color) || part.color]}
        />
      ))}
      {part.callout && (
        <Html position={part.callout.at} center zIndexRange={[20, 0]}>
          <button
            ref={labelRef}
            type="button"
            className="car-callout"
            style={{ opacity: 0 }}
            onPointerEnter={() => onFocusLabel(part.callout!.note)}
            onPointerLeave={() => onFocusLabel(null)}
            onFocus={() => onFocusLabel(part.callout!.note)}
            onBlur={() => onFocusLabel(null)}
          >
            <span aria-hidden className="car-callout-dot" />
            {part.callout.label}
          </button>
        </Html>
      )}
    </group>
  );
}

function Car({ target, onNote }: { target: number; onNote: (n: string | null) => void }) {
  const mats = useCarMaterials();
  const root = useRef<Group>(null);
  const groups = useRef<(Group | null)[]>([]);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = useRef(-1); // forces the first frame to lay everything out
  // Labels (drei Html) read part positions before this frame moves them, so after the
  // motion settles we render a couple more frames to let them catch up.
  const settleFrames = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  // A new target only needs one frame to start; useFrame keeps going until it settles.
  useEffect(() => {
    settleFrames.current = 0;
    invalidate();
  }, [target, invalidate]);

  useFrame((state, dt) => {
    const prev = shown.current;
    const next = prev < 0 ? target : prev + (target - prev) * Math.min(1, dt * EASE);
    shown.current = Math.abs(target - next) < 0.001 ? target : next;
    const t = ease(shown.current);

    PARTS.forEach((p, i) => {
      groups.current[i]?.position.set(p.explode[0] * t, p.explode[1] * t, p.explode[2] * t);
    });
    if (root.current) root.current.rotation.y = TURN * t;
    const op = clamp01((shown.current - CALLOUT_FADE[0]) / (CALLOUT_FADE[1] - CALLOUT_FADE[0]));
    labels.current.forEach((el) => {
      if (!el) return;
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = op > 0.5 ? "auto" : "none";
      el.tabIndex = op > 0.5 ? 0 : -1;
    });

    if (shown.current !== target) state.invalidate();
    else if (settleFrames.current < 2) {
      settleFrames.current++;
      state.invalidate();
    }
  });

  let li = 0;
  return (
    <group ref={root}>
      {PARTS.map((p, i) => {
        const labelIndex = p.callout ? li++ : -1;
        return (
          <PartMesh
            key={p.id}
            part={p}
            mats={mats}
            setRef={(g) => (groups.current[i] = g)}
            labelRef={(el) => {
              if (labelIndex >= 0) labels.current[labelIndex] = el;
            }}
            onFocusLabel={onNote}
          />
        );
      })}
      {/* soft footprint so the car sits on something */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.9, 40]} />
        <meshBasicMaterial color="#000" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

/** Stops rendering while the canvas is off screen or the browser tab is hidden. */
function PauseWhenHidden({ el }: { el: React.RefObject<HTMLElement> }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let onScreen = true;
    const update = () => {
      const visible = onScreen && document.visibilityState === "visible";
      setFrameloop(visible ? "demand" : "never");
      if (visible) invalidate();
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    if (el.current) io.observe(el.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [el, setFrameloop, invalidate]);
  return null;
}

/** Soft studio reflections, generated in the browser (no HDR download). */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Aim() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(...CAMERA.lookAt);
  }, [camera]);
  return null;
}

/**
 * The canvas. Renders only on demand (when the explode amount changes, or the
 * theme does), so it costs nothing while idle. Drag across it to explode.
 */
export default function CarCanvas({
  target,
  onChange,
  onNote,
}: {
  target: number;
  onChange: (t: number) => void;
  onNote: (n: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; t: number } | null>(null);

  return (
    <div
      ref={wrap}
      className="car-stage relative h-full w-full cursor-ew-resize touch-pan-y"
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest(".car-callout")) return;
        drag.current = { x: e.clientX, t: target };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const w = e.currentTarget.clientWidth || 1;
        onChange(clamp01(drag.current.t + ((e.clientX - drag.current.x) / w) * 1.6));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <Canvas
        frameloop="demand"
        flat
        dpr={[1, MAX_DPR]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [...CAMERA.position], fov: CAMERA.fov, near: 0.1, far: 40 }}
      >
        <Aim />
        <PauseWhenHidden el={wrap} />
        <StudioEnvironment />
        <hemisphereLight args={[LIGHTS.hemi.sky, LIGHTS.hemi.ground, LIGHTS.hemi.intensity]} />
        <directionalLight position={[...LIGHTS.key.position]} intensity={LIGHTS.key.intensity} />
        <directionalLight position={[...LIGHTS.rim.position]} intensity={LIGHTS.rim.intensity} color={LIGHTS.rim.color} />
        <Car target={target} onNote={onNote} />
      </Canvas>
    </div>
  );
}
