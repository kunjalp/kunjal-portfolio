// An original side-profile coupe: low long-hood fastback with a ducktail,
// a clean flat-sided body, and thin light bars front and rear. Drawn facing
// right in local units; the origin is on the ground midway between the wheels.

export const CAR = {
  wheelbase: 50,
  wheelR: 7.4,
  wheelX: [-25, 25] as const,
  wheelY: -7.4,
  exhaust: [-44.2, -6.9] as const,
};

const BODY = [
  "M -41 -6",
  "L -35 -6",
  "A 10 10 0 0 1 -15 -6", // rear arch
  "L 15 -6",
  "A 10 10 0 0 1 35 -6", // front arch
  "L 43.5 -6.2",
  "C 46.2 -6.4 47 -7.6 46.8 -9.6", // lower front bumper
  "L 46.4 -11.8",
  "C 46 -13.4 44.6 -14.2 42 -14.6", // nose
  "L 24 -16.3", // long hood
  "L 9.5 -17.4", // cowl
  "C 4 -21.6 0 -24.6 -5 -25.6", // windshield
  "C -9 -26.3 -14 -26.2 -18 -25.4", // roof
  "C -24 -24 -30 -21.4 -35.5 -19.6", // fastback
  "L -38.6 -19.4", // rear deck
  "L -40.2 -21.2", // ducktail lip
  "L -42.4 -20.4",
  "C -43 -16 -43 -11 -42.2 -7.6", // tail
  "Z",
].join(" ");

const GLASS =
  "M 7.4 -17.9 C 3 -21.3 -0.6 -23.7 -5 -24.5 C -9 -25 -13.5 -24.9 -17 -24.3 C -22 -23.1 -26.5 -21.2 -30.4 -19.6 C -22 -18.9 -8 -18.3 7.4 -17.9 Z";

function Wheel({ x, setRef }: { x: number; setRef: (el: SVGGElement | null) => void }) {
  const y = CAR.wheelY;
  return (
    <g>
      <circle className="car-tire" cx={x} cy={y} r={CAR.wheelR} />
      <circle className="car-rim" cx={x} cy={y} r={5.1} />
      {/* caliper stays put; the spokes spin over it */}
      <path className="car-caliper" d={`M ${x + 1.2} ${y - 4.1} A 4.3 4.3 0 0 1 ${x + 4.1} ${y - 1.2}`} />
      <g ref={setRef}>
        {[0, 72, 144, 216, 288].map((a) => (
          <line
            key={a}
            className="car-spoke"
            x1={x}
            y1={y}
            x2={x + Math.cos((a * Math.PI) / 180) * 4.8}
            y2={y + Math.sin((a * Math.PI) / 180) * 4.8}
          />
        ))}
        <circle className="car-hub" cx={x} cy={y} r={1.3} />
      </g>
    </g>
  );
}

export default function Car({ setWheelRef }: { setWheelRef: (i: number, el: SVGGElement | null) => void }) {
  return (
    <g>
      <defs>
        <linearGradient id="car-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--car))" }} />
          <stop offset="0.55" style={{ stopColor: "rgb(var(--car))" }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--car-shade))" }} />
        </linearGradient>
        <linearGradient id="car-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--drl))", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--drl))", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="0" cy="-0.2" rx="44" ry="2" className="car-shadow" />

      {/* headlight beam */}
      <path className="car-beam" d="M 46.6 -12.6 L 92 -19 L 92 -3 Z" fill="url(#car-beam)" />

      {/* dark wheel wells inside the arches */}
      {CAR.wheelX.map((x) => (
        <path key={`well${x}`} className="car-well" d={`M ${x - 10} -6 A 10 10 0 0 1 ${x + 10} -6 Z`} />
      ))}
      <path d={BODY} fill="url(#car-paint)" className="car-body" />
      <path d={GLASS} className="car-glass" />
      <path d={GLASS} className="car-glass-trim" />
      {/* B-pillar and glass highlight */}
      <path d="M -10.6 -18.4 L -12 -24.8" className="car-pillar" />
      <path d="M 2 -19.5 L -2.5 -23.2" className="car-glint" />

      {/* shoulder line, door cut, handle, skirt, vent, mirror */}
      <path d="M 44 -12.7 C 20 -14.3 -10 -15.3 -40.5 -16.8" className="car-crease" />
      <path d="M 13.4 -6.4 C 12.2 -10 11.2 -14 10.2 -17.3 M -13.4 -6.4 C -13 -10 -12.4 -14.2 -11.2 -18.3" className="car-seam" />
      <path d="M -7.6 -13.9 L -3.2 -13.9" className="car-handle" />
      <path d="M -15 -6.3 L 15 -6.3 M 37 -6.1 L 47 -6.4 M -42.6 -7.2 L -35.5 -6.3" className="car-trim" />
      <path d="M 12.6 -9.4 L 9.4 -8.9 L 9.9 -11.3 Z" className="car-trim-fill" />
      <path d="M 6.8 -17.8 L 4.4 -18.2 L 3.9 -19.9 L 6.4 -19.7 Z" className="car-trim-fill" />

      {/* tailpipe */}
      <rect x="-44.6" y="-7.7" width="3" height="1.6" rx="0.8" className="car-pipe" />

      {/* lights: thin front bar, rear bar, reverse lamp */}
      <rect x="41.4" y="-13.4" width="5.2" height="1.3" rx="0.65" className="car-drl" />
      <rect x="-43.1" y="-18.6" width="3.2" height="1.6" rx="0.7" className="car-tail" />
      <rect x="-43" y="-14.8" width="1.7" height="1.3" rx="0.5" className="car-rev" />

      {CAR.wheelX.map((x, i) => (
        <Wheel key={x} x={x} setRef={(el) => setWheelRef(i, el)} />
      ))}
    </g>
  );
}
