"use client";

import { useId } from "react";

/**
 * Embroidered patches for the Journey stops. Original drawings, no real logos:
 * twill fabric, a thick merrowed edge, a dashed running-stitch border and
 * satin-stitch lettering (text drawn with a darker outline under the fill).
 */

export type PatchKind = "vex" | "cosmos" | "fsae" | "acm" | "daytona";

type Spec = {
  label: string; // for screen readers
  shape: string; // SVG path in a 120x120 box
  cloth: string;
  thread: string;
  edge: string;
};

const HEX = "M60 5 L108 32 L108 88 L60 115 L12 88 L12 32 Z";
const CIRCLE = "M60 6 A54 54 0 1 1 59.9 6 Z";
const SHIELD = "M60 5 L107 18 L107 58 C107 88 86 106 60 115 C34 106 13 88 13 58 L13 18 Z";
const ROUNDED = "M26 18 H94 A18 18 0 0 1 112 36 V84 A18 18 0 0 1 94 102 H26 A18 18 0 0 1 8 84 V36 A18 18 0 0 1 26 18 Z";
// scalloped rosette, like a prize ribbon
const ROSETTE = (() => {
  const pts: string[] = [];
  const n = 28;
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const r = i % 2 ? 50 : 55;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)} ${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
})();

const SPECS: Record<PatchKind, Spec> = {
  vex: { label: "VEX Robotics patch, 2021 to 2025", shape: HEX, cloth: "#8e2f3c", thread: "#f4dca8", edge: "#4a1820" },
  cosmos: { label: "UC San Diego COSMOS patch, 2024", shape: CIRCLE, cloth: "#2d4262", thread: "#ece4c8", edge: "#16233a" },
  fsae: { label: "Formula Slug FSAE patch", shape: SHIELD, cloth: "#2a2824", thread: "#f0c64a", edge: "#0f0e0c" },
  acm: { label: "ACM web lead patch", shape: ROUNDED, cloth: "#5c6c30", thread: "#f3ead0", edge: "#2f3916" },
  daytona: { label: "First place, Daytona track patch", shape: ROSETTE, cloth: "#d9a53b", thread: "#4a2a10", edge: "#7a5216" },
};

/** Satin-stitch text: a darker outline under the thread colour. */
function Stitch({
  x,
  y,
  size,
  fill,
  weight = 800,
  spacing = 0.5,
  children,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  weight?: number;
  spacing?: number;
  children: React.ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={size}
      fontWeight={weight}
      letterSpacing={spacing}
      fill={fill}
      stroke="rgb(0 0 0 / 0.35)"
      strokeWidth={size > 16 ? 1.4 : 0.8}
      paintOrder="stroke"
      style={{ fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif', fontStretch: "75%" }}
    >
      {children}
    </text>
  );
}

function Art({ kind, t }: { kind: PatchKind; t: string }) {
  switch (kind) {
    case "vex":
      return (
        <g>
          {/* gear: thick dashed ring reads as teeth */}
          <circle cx="60" cy="40" r="13" fill="none" stroke={t} strokeWidth="7" strokeDasharray="4.2 2.6" />
          <circle cx="60" cy="40" r="8.5" fill="none" stroke={t} strokeWidth="3" />
          <circle cx="60" cy="40" r="3" fill={t} />
          <Stitch x={60} y={78} size={26} fill={t}>VRC</Stitch>
          <Stitch x={60} y={93} size={9} fill={t} weight={700} spacing={1}>2021–25</Stitch>
        </g>
      );
    case "cosmos":
      return (
        <g>
          {/* lidar sweep */}
          <g fill="none" stroke={t} strokeLinecap="round">
            <path d="M38 52 A26 26 0 0 1 82 52" strokeWidth="2.6" opacity="0.55" />
            <path d="M45 52 A17 17 0 0 1 75 52" strokeWidth="2.6" opacity="0.8" />
            <path d="M60 54 L75 33" strokeWidth="3" />
          </g>
          <circle cx="60" cy="54" r="3.6" fill={t} />
          <circle cx="72" cy="40" r="2" fill="#f0c64a" />
          <circle cx="47" cy="41" r="1.6" fill="#f0c64a" />
          <Stitch x={60} y={80} size={17} fill={t} spacing={1}>COSMOS</Stitch>
          <Stitch x={60} y={93} size={8.5} fill={t} weight={700} spacing={1.2}>UCSD 2024</Stitch>
        </g>
      );
    case "fsae":
      return (
        <g>
          {/* checkered flag band */}
          <g transform="translate(36 24)">
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={(i % 6) * 8} y={Math.floor(i / 6) * 8} width="8" height="8" fill={(i + Math.floor(i / 6)) % 2 ? "#f4efe0" : "#1c1b18"} />
            ))}
            <rect width="48" height="16" fill="none" stroke={t} strokeWidth="1.5" />
          </g>
          <Stitch x={60} y={70} size={27} fill={t}>FSAE</Stitch>
          <Stitch x={60} y={85} size={8.5} fill={t} weight={700} spacing={1.2}>FORMULA SLUG</Stitch>
        </g>
      );
    case "acm":
      return (
        <g>
          <Stitch x={60} y={60} size={30} fill={t} weight={800} spacing={-1}>{"</>"}</Stitch>
          <Stitch x={60} y={80} size={11} fill={t} spacing={1.4}>ACM WEB</Stitch>
          <Stitch x={60} y={91} size={7.5} fill={t} weight={700} spacing={1.4}>LEAD · UCSC</Stitch>
        </g>
      );
    case "daytona":
      return (
        <g>
          <circle cx="60" cy="60" r="38" fill="#f6e2a8" stroke={t} strokeWidth="1.5" strokeDasharray="2.5 2" />
          <Stitch x={60} y={66} size={28} fill={t}>1ST</Stitch>
          <Stitch x={60} y={44} size={8} fill={t} weight={700} spacing={1.2}>DAYTONA</Stitch>
          <Stitch x={60} y={80} size={7.5} fill={t} weight={700} spacing={1}>SF TECH WEEK</Stitch>
        </g>
      );
  }
}

export default function Patch({
  kind,
  size = 84,
  tilt = 0,
  className = "",
}: {
  kind: PatchKind;
  size?: number;
  tilt?: number;
  className?: string;
}) {
  const s = SPECS[kind];
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={s.label}
      className={`patch ${className}`}
      style={{ ["--tilt" as string]: `${tilt}deg` }}
    >
      <defs>
        {/* twill weave */}
        <pattern id={`tw${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill={s.cloth} />
          <rect width="1.4" height="4" fill="rgb(255 255 255 / 0.07)" />
        </pattern>
        <clipPath id={`cl${id}`}>
          <path d={s.shape} />
        </clipPath>
      </defs>
      {/* merrowed edge: thick dark border with a lighter thread line on it */}
      <path d={s.shape} fill={`url(#tw${id})`} stroke={s.edge} strokeWidth="6" strokeLinejoin="round" />
      <path d={s.shape} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="1.2" strokeDasharray="1.4 1.6" strokeLinejoin="round" />
      <g clipPath={`url(#cl${id})`}>
        {/* soft padding highlight, as if the patch is slightly domed */}
        <ellipse cx="46" cy="36" rx="46" ry="32" fill="rgb(255 255 255 / 0.08)" />
        {/* running-stitch border inset from the edge */}
        <path
          d={s.shape}
          transform="translate(60 60) scale(0.84) translate(-60 -60)"
          fill="none"
          stroke={s.thread}
          strokeWidth="1.8"
          strokeDasharray="3.4 2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <Art kind={kind} t={s.thread} />
      </g>
    </svg>
  );
}
