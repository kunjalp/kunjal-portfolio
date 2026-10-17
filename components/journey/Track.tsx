"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Car, { CAR } from "./Car";

const H = 96; // height of the road band in px
const Y0 = 70; // road level at the checkpoints
const FLAG_H = 50;
const N = 4;

type Pt = [number, number];

/**
 * The road, in real pixels so the car is never stretched. Checkpoints sit at
 * the centers of four equal columns (matching the buttons below). Between
 * checkpoints the road jogs down or up with short ramps, like a PCB trace.
 */
function makeTrack(W: number) {
  const gap = W / N;
  const xs = Array.from({ length: N }, (_, i) => gap * (i + 0.5));
  const jog = Math.min(12, gap * 0.06);
  const pts: Pt[] = [
    [xs[0] - gap * 0.32, Y0],
    [xs[0], Y0],
  ];
  const stopIdx = [1];
  for (let i = 0; i < N - 1; i++) {
    const a = xs[i];
    const b = xs[i + 1];
    const flat = gap * 0.22;
    const ramp = gap * 0.12;
    const dy = (i % 2 === 0 ? 1 : -1) * jog;
    pts.push([a + flat, Y0], [a + flat + ramp, Y0 + dy], [b - flat - ramp, Y0 + dy], [b - flat, Y0], [b, Y0]);
    stopIdx.push(pts.length - 1);
  }
  pts.push([xs[N - 1] + gap * 0.32, Y0]);

  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[cum.length - 1];

  const at = (s: number): Pt => {
    s = Math.max(0, Math.min(total, s));
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i++;
    const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
  };

  /** Path for the stretch of road between two distances. */
  const sub = (a: number, b: number) => {
    if (a > b) [a, b] = [b, a];
    a = Math.max(0, a);
    b = Math.min(total, b);
    const out: Pt[] = [at(a)];
    for (let i = 0; i < cum.length; i++) if (cum[i] > a && cum[i] < b) out.push(pts[i]);
    out.push(at(b));
    return "M " + out.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
  };

  return {
    xs,
    total,
    stops: stopIdx.map((i) => cum[i]),
    at,
    sub,
    d: sub(0, total),
    scale: Math.max(0.5, Math.min(1.15, gap / 215)),
  };
}

type Track = ReturnType<typeof makeTrack>;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SVGNS = "http://www.w3.org/2000/svg";

export default function Track({ active }: { active: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const track = useMemo(() => (W > 0 ? makeTrack(W) : null), [W]);
  const trackRef = useRef<Track | null>(null);

  const carRef = useRef<SVGGElement>(null);
  const walkedRef = useRef<SVGPathElement>(null);
  const marksRef = useRef<SVGGElement>(null);
  const flagRefs = useRef<(SVGGElement | null)[]>([]);
  const wheelRefs = useRef<(SVGGElement | null)[]>([]);

  // Mutable animation state. face = which way the car points (1 = right);
  // flip = its current horizontal scale, which passes through 0 in a turn.
  const st = useRef({
    s: 0,
    face: 1,
    flip: 1,
    odo: 0,
    idx: active,
    token: 0,
    raf: 0,
    pose: { x: 0, y: 0, ang: 0, k: 1 },
    lastPuff: 0,
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- drawing ------------------------------------------------------------

  const draw = (extraRot = 0) => {
    const T = trackRef.current;
    const car = carRef.current;
    if (!T || !car) return;
    const S = st.current;
    const k = T.scale;
    const half = (CAR.wheelbase / 2) * k;
    const s = Math.max(half, Math.min(T.total - half, S.s));
    const L = T.at(s - half);
    const R = T.at(s + half);
    const ang = (Math.atan2(R[1] - L[1], R[0] - L[0]) * 180) / Math.PI + extraRot;
    const mx = (L[0] + R[0]) / 2;
    const my = (L[1] + R[1]) / 2;
    S.pose = { x: mx, y: my, ang, k };
    // lift by half the road stroke so the tires sit on top of the line
    car.setAttribute(
      "transform",
      `translate(${mx.toFixed(2)} ${my.toFixed(2)}) rotate(${ang.toFixed(2)}) translate(0 -2) scale(${(S.flip * k).toFixed(3)} ${k})`,
    );
    const spin = ((S.odo / (CAR.wheelR * k)) * 180) / Math.PI;
    wheelRefs.current.forEach((w, i) =>
      w?.setAttribute("transform", `rotate(${spin.toFixed(1)} ${CAR.wheelX[i]} ${CAR.wheelY})`),
    );
    walkedRef.current?.setAttribute("d", T.sub(0, S.s));
    flagRefs.current.forEach((f, i) => f?.classList.toggle("reached", S.s >= T.stops[i] - 1));
  };

  const addMark = (from: number, to: number, strength: number) => {
    const T = trackRef.current;
    const g = marksRef.current;
    if (!T || !g) return null;
    // A group of two thin, scuffed streaks: near tire and far tire.
    const grp = document.createElementNS(SVGNS, "g");
    grp.setAttribute("class", "skid");
    grp.style.setProperty("--a", String(strength));
    [2.2, 4.4].forEach((dy, i) => {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", T.sub(from, to));
      p.setAttribute("transform", `translate(0 ${dy})`);
      p.setAttribute("class", i ? "skid-far" : "skid-near");
      grp.appendChild(p);
    });
    g.appendChild(grp);
    return grp;
  };

  const fade = (el: Element | null) => {
    if (!el) return;
    el.classList.add("fade");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  };

  const puff = (s: number) => {
    const T = trackRef.current;
    const g = marksRef.current;
    if (!T || !g) return;
    const [x, y] = T.at(s);
    [0, 1, 2].forEach((i) => {
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("class", "puff");
      c.setAttribute("cx", (x + (i - 1) * 5).toFixed(1));
      c.setAttribute("cy", (y - 3 - i * 1.5).toFixed(1));
      c.setAttribute("r", String(3 + i));
      c.style.animationDelay = `${i * 70}ms`;
      g.appendChild(c);
      c.addEventListener("animationend", () => c.remove(), { once: true });
    });
  };

  /** A small puff from the tailpipe, drifting back and up behind the car. */
  const exhaust = (throttle: boolean) => {
    const g = marksRef.current;
    if (!g) return;
    const S = st.current;
    const now = performance.now();
    if (now - S.lastPuff < (throttle ? 35 : 140)) return;
    S.lastPuff = now;
    // tailpipe in car-local units -> page pixels (same steps as draw())
    const { x, y, ang, k } = S.pose;
    const lx = CAR.exhaust[0] * S.flip * k;
    const ly = CAR.exhaust[1] * k - 2;
    const a = (ang * Math.PI) / 180;
    const px = x + lx * Math.cos(a) - ly * Math.sin(a);
    const py = y + lx * Math.sin(a) + ly * Math.cos(a);
    const c = document.createElementNS(SVGNS, "circle");
    c.setAttribute("class", "exhaust");
    c.setAttribute("cx", px.toFixed(1));
    c.setAttribute("cy", py.toFixed(1));
    c.setAttribute("r", (1.4 + Math.random() * 0.8).toFixed(2));
    // drift away from the car's nose, with a little lift and wobble
    c.style.setProperty("--dx", `${(-S.face * (3 + Math.random() * 4)).toFixed(1)}px`);
    c.style.setProperty("--dy", `${(-1.5 - Math.random() * 2.5).toFixed(1)}px`);
    g.appendChild(c);
    c.addEventListener("animationend", () => c.remove(), { once: true });
  };

  // ---- motion primitives ----------------------------------------------------

  const animate = (dur: number, step: (t: number) => void, token: number) =>
    new Promise<boolean>((resolve) => {
      const t0 = performance.now();
      const frame = (now: number) => {
        if (st.current.token !== token) return resolve(false);
        const t = Math.min(1, (now - t0) / dur);
        step(t);
        if (t < 1) st.current.raf = requestAnimationFrame(frame);
        else resolve(true);
      };
      st.current.raf = requestAnimationFrame(frame);
    });

  /** Drive to a distance along the road, forward or in reverse, stopping cleanly. */
  const drive = async (to: number, reverse: boolean, token: number) => {
    const T = trackRef.current;
    const car = carRef.current;
    if (!T || !car) return false;
    const S = st.current;
    const from = S.s;
    const dist = Math.abs(to - from);
    if (dist < 0.5) return true;
    const half = (CAR.wheelbase / 2) * T.scale;
    const dir = Math.sign(to - from);
    const dur = (450 + dist * 2.1) * (reverse ? 1.3 : 1);
    const passed = new Set<number>();
    let brake: { from: number; offset: number; el: SVGGElement | null }[] | null = null;

    car.classList.toggle("is-reversing", reverse);
    const ok = await animate(
      dur,
      (t) => {
        const s = from + (to - from) * ease(t);
        S.odo += (s - S.s) * S.face;
        S.s = s;

        // a light scuff at each checkpoint driven through
        T.stops.forEach((cp, i) => {
          if (passed.has(i) || Math.abs(cp - to) < 1 || Math.abs(cp - from) < 1) return;
          if ((dir > 0 && s + half >= cp) || (dir < 0 && s - half <= cp)) {
            passed.add(i);
            fade(addMark(cp - 16, cp + 16, reverse ? 0.2 : 0.4));
          }
        });

        // braking: tail light on, and rubber laid behind both tires
        const braking = t > 0.6;
        const laying = t > 0.7;
        car.classList.toggle("is-braking", braking);
        if (laying && !brake) {
          brake = [-half, half].map((offset) => ({
            from: s + offset,
            offset,
            el: addMark(s + offset, s + offset, reverse ? 0.28 : 0.75),
          }));
        }
        brake?.forEach((m) => {
          const d = T.sub(m.from, s + m.offset);
          m.el?.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
        });
        draw();
        exhaust(t < 0.55);
      },
      token,
    );
    car.classList.remove("is-braking", "is-reversing");
    (brake as { el: SVGGElement | null }[] | null)?.forEach((m) => fade(m.el));
    return ok;
  };

  /** Drift turn in place: the car swings round to face the other way. */
  const turn = async (toFace: 1 | -1, token: number) => {
    const T = trackRef.current;
    if (!T) return false;
    const S = st.current;
    const half = (CAR.wheelbase / 2) * T.scale;
    const from = S.flip;
    fade(addMark(S.s - half - 14, S.s + half + 14, 0.95));
    puff(S.s - half);
    puff(S.s + half);
    const ok = await animate(
      520,
      (t) => {
        S.flip = from + (toFace - from) * ease(t);
        S.odo += 4 * S.face; // wheels spin while the tail slides
        draw(Math.sin(Math.PI * t) * -6 * toFace);
      },
      token,
    );
    S.flip = toFace;
    S.face = toFace;
    draw();
    return ok;
  };

  // ---- placement and planning -------------------------------------------------

  useLayoutEffect(() => {
    trackRef.current = track;
    if (!track) return;
    const S = st.current;
    S.token++;
    cancelAnimationFrame(S.raf);
    S.s = track.stops[S.idx];
    S.face = S.flip = 1;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    const S = st.current;
    const fromIdx = S.idx;
    S.idx = active;
    const T = trackRef.current;
    if (!T || fromIdx === active) return;

    cancelAnimationFrame(S.raf);
    const token = ++S.token;
    if (Math.abs(S.flip) < 1) {
      S.flip = S.face = S.flip >= 0 ? 1 : -1;
    }
    const target = T.stops[active];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      S.s = target;
      S.face = S.flip = 1;
      draw();
      return;
    }

    (async () => {
      if (target > S.s) {
        if (S.face < 0 && !(await turn(1, token))) return;
        await drive(target, false, token);
      } else if (S.face > 0 && fromIdx - active <= 1) {
        // one stop back: reverse, still facing forward
        await drive(target, true, token);
      } else {
        // two or more stops back: swing round, drive, swing back
        if (S.face > 0 && !(await turn(-1, token))) return;
        if (!(await drive(target, false, token))) return;
        await turn(1, token);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const S = st.current;
    return () => {
      S.token++;
      cancelAnimationFrame(S.raf);
    };
  }, []);

  return (
    <div ref={wrap} className="relative" style={{ height: H }}>
      {track && (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 overflow-visible"
          aria-hidden
        >
          <defs>
            <linearGradient id="trace-grad" gradientUnits="userSpaceOnUse" x1={track.xs[0]} x2={track.xs[N - 1]} y1="0" y2="0">
              <stop offset="0" style={{ stopColor: "rgb(var(--g1))" }} />
              <stop offset="0.55" style={{ stopColor: "rgb(var(--g2))" }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--g3))" }} />
            </linearGradient>
          </defs>

          {/* links down to the checkpoint buttons */}
          {track.xs.map((x) => (
            <line key={`v${x}`} className="cp-via" x1={x} y1={Y0 + 4} x2={x} y2={H + 4} />
          ))}

          {/* checkpoint flags */}
          {track.xs.map((x, i) => (
            <g
              key={`f${x}`}
              className="cp-flag"
              ref={(el) => {
                flagRefs.current[i] = el;
              }}
            >
              <line className="cp-pole" x1={x} y1={Y0} x2={x} y2={Y0 - FLAG_H} />
              <g transform={`translate(${x + 1} ${Y0 - FLAG_H})`}>
                <rect className="cp-cloth" width="16" height="11" />
                {Array.from({ length: 12 }, (_, c) => {
                  const col = c % 4;
                  const row = Math.floor(c / 4);
                  return (col + row) % 2 === 0 ? (
                    <rect key={c} className="cp-check" x={col * 4} y={row * 3.667} width="4" height="3.667" />
                  ) : null;
                })}
              </g>
            </g>
          ))}

          <path className="road-base" d={track.d} />
          <path ref={walkedRef} className="road-walked" stroke="url(#trace-grad)" />

          {/* checkered strip on the road at each checkpoint */}
          {track.xs.map((x) => (
            <g key={`s${x}`} transform={`translate(${x - 4} ${Y0 - 3})`}>
              <rect className="cp-cloth" width="8" height="6" />
              <rect className="cp-check" width="4" height="3" />
              <rect className="cp-check" x="4" y="3" width="4" height="3" />
            </g>
          ))}

          <g ref={marksRef} />

          <g ref={carRef} className="car">
            <Car
              setWheelRef={(i, el) => {
                wheelRefs.current[i] = el;
              }}
            />
          </g>
        </svg>
      )}
    </div>
  );
}
