"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import Car, { CAR } from "./Car";

const H = 140; // height of the scene band in px
const Y0 = 112; // road level at the checkpoints
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

// Manual driving, in px/s and px/s².
const ACC = 420;
const BRAKE = 980;
const DRAG = 1.6; // coasting air drag, per second
const ROLL = 90; // rolling resistance, px/s², so it settles instead of creeping
const MAX_FWD = 270;
const MAX_REV = 130;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tiny landscape behind the road: a far ridge, pines, and a landmark at each stop. */
function Landscape({ W, xs }: { W: number; xs: number[] }) {
  const ridge = useMemo(() => {
    const pts: string[] = [`M 0 ${Y0 - 18}`];
    const n = Math.max(6, Math.round(W / 70));
    for (let i = 0; i <= n; i++) {
      const x = (W * i) / n;
      // deterministic bumps, no Math.random so server and client agree
      const y = Y0 - 34 - 18 * Math.abs(Math.sin(i * 1.7 + 0.6)) - 8 * Math.sin(i * 0.9);
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    pts.push(`L ${W} ${Y0 - 18}`, "Z");
    return pts.join(" ");
  }, [W]);

  const pines = useMemo(() => {
    const out: { x: number; h: number }[] = [];
    for (let x = 10, i = 0; x < W - 6; i++) {
      const near = xs.some((c) => x > c - 30 && x < c + 78);
      if (!near) out.push({ x, h: 11 + 9 * Math.abs(Math.sin(i * 2.3)) });
      x += 16 + 14 * Math.abs(Math.sin(i * 1.3));
    }
    return out;
  }, [W, xs]);

  const base = Y0 - 6;
  return (
    <g aria-hidden>
      <path className="mini-ridge" d={ridge} />
      {pines.map((p, i) => (
        <path
          key={i}
          className="mini-pine"
          d={`M ${p.x} ${base - p.h} L ${p.x + p.h * 0.32} ${base} L ${p.x - p.h * 0.32} ${base} Z`}
        />
      ))}
      {xs.map((x, i) => (
        <g key={i} className="mini-mark" transform={`translate(${x + 40} ${base})`}>
          {i === 0 && (
            // high school: gabled building with a gear on the front
            <g>
              <path d="M -16 0 V -16 L 0 -26 L 16 -16 V 0 Z" />
              <circle cx="0" cy="-12" r="4.2" className="mini-cut" />
              <path d="M 10 -20 V -33 L 16 -31 L 10 -29" />
            </g>
          )}
          {i === 1 && (
            // COSMOS: a LiDAR mast with a spinning sweep
            <g>
              <path d="M -2 0 L -1 -24 H 1 L 2 0 Z" />
              <rect x="-5" y="-29" width="10" height="5" rx="1.5" />
              <g className="mini-sweep">
                <path d="M 0 -26.5 L 22 -33 A 23 23 0 0 1 22 -20 Z" />
              </g>
            </g>
          )}
          {i === 2 && (
            // Formula Slug: pit garage with a checkered stripe
            <g>
              <path d="M -18 0 V -17 H 18 V 0 Z" />
              <rect x="-11" y="-11" width="22" height="11" className="mini-cut" />
              {Array.from({ length: 9 }, (_, c) => (
                <rect key={c} x={-18 + c * 4} y={-21 + (c % 2) * 2} width="4" height="2" />
              ))}
            </g>
          )}
          {i === 3 && (
            // UCSC: redwoods
            <g>
              <path d="M -10 0 L -6 -40 L -2 0 Z" />
              <path d="M 0 0 L 5 -50 L 10 0 Z" />
              <path d="M 12 0 L 15 -30 L 18 0 Z" />
            </g>
          )}
        </g>
      ))}
    </g>
  );
}

export type TrackHandle = {
  /** -1 reverse, 0 off, 1 forward: hold-to-drive input (pedals, keys) */
  press: (dir: number) => void;
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const SVGNS = "http://www.w3.org/2000/svg";

type Props = {
  active: number;
  labels: string[];
  /** called when the car drives itself onto a checkpoint */
  onArrive: (i: number) => void;
  onEngage?: (on: boolean) => void;
};

const Track = forwardRef<TrackHandle, Props>(function Track({ active, labels, onArrive, onEngage }, handle) {
  const wrap = useRef<HTMLDivElement>(null);
  const hudRef = useRef<SVGTextElement>(null);
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
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
    hud();
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

  // ---- manual driving ------------------------------------------------------

  type Mark = { from: number; offset: number; el: SVGGElement | null };
  const man = useRef({ input: 0, v: 0, raf: 0, last: 0, brake: null as Mark[] | null, hud: "" });

  const hud = () => {
    const T = trackRef.current;
    const el = hudRef.current;
    if (!T || !el) return;
    const S = st.current;
    const m = man.current;
    const dir = m.v < -1 ? -1 : 1;
    const ahead =
      dir > 0
        ? T.stops.findIndex((cp) => cp > S.s + 3)
        : T.stops.map((cp, i) => (cp < S.s - 3 ? i : -1)).filter((i) => i >= 0).pop() ?? -1;
    const spd = `${String(Math.round(Math.abs(m.v) * 0.18)).padStart(2, " ")} km/h`;
    const next =
      ahead >= 0
        ? `${dir > 0 ? "next" : "back to"} ${labelsRef.current[ahead]} · ${Math.round(Math.abs(T.stops[ahead] - S.s) / 3)} m`
        : dir > 0
          ? "end of the road"
          : "start of the road";
    const text = `${spd}   ${next}`;
    if (text !== m.hud) {
      m.hud = text;
      el.textContent = text;
    }
  };

  const endBrake = () => {
    const m = man.current;
    m.brake?.forEach((b) => fade(b.el));
    m.brake = null;
  };

  const stopManual = () => {
    const m = man.current;
    cancelAnimationFrame(m.raf);
    m.raf = 0;
    m.v = 0;
    m.input = 0;
    endBrake();
    carRef.current?.classList.remove("is-driving", "is-braking", "is-reversing");
  };

  const tick = (now: number) => {
    const m = man.current;
    const S = st.current;
    const T = trackRef.current;
    const car = carRef.current;
    if (!T || !car) {
      m.raf = 0;
      return;
    }
    const dt = Math.min(0.033, (now - m.last) / 1000) || 0.016;
    m.last = now;
    const half = (CAR.wheelbase / 2) * T.scale;

    const opposing = m.input !== 0 && Math.abs(m.v) > 1 && Math.sign(m.input) !== Math.sign(m.v);
    if (opposing) m.v -= Math.sign(m.v) * Math.min(Math.abs(m.v), BRAKE * dt);
    else if (m.input) m.v += m.input * ACC * dt;
    else {
      m.v -= m.v * Math.min(1, DRAG * dt);
      m.v -= Math.sign(m.v) * Math.min(Math.abs(m.v), ROLL * dt);
    }
    m.v = clamp(m.v, -MAX_REV, MAX_FWD);

    const prev = S.s;
    let s = prev + m.v * dt;
    if (s <= half || s >= T.total - half) {
      s = clamp(s, half, T.total - half);
      m.v = 0;
    }
    S.odo += (s - prev) * S.face;
    S.s = s;

    // crossing a checkpoint opens it
    T.stops.forEach((cp, i) => {
      const crossed = (prev < cp && s >= cp) || (prev > cp && s <= cp);
      if (crossed && S.idx !== i) {
        S.idx = i;
        arriveRef.current(i);
      }
    });

    // hard braking lays rubber behind both tires
    if (opposing && Math.abs(m.v) > 90 && !m.brake && !reducedMotion()) {
      m.brake = [-half, half].map((offset) => ({ from: s + offset, offset, el: addMark(s + offset, s + offset, 0.7) }));
    }
    if (m.brake) {
      if (!opposing) endBrake();
      else
        m.brake.forEach((b) => {
          const d = T.sub(b.from, s + b.offset);
          b.el?.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
        });
    }

    car.classList.toggle("is-braking", opposing);
    car.classList.toggle("is-reversing", m.v < -1);
    draw();
    if (!reducedMotion()) exhaust(m.input > 0 && !opposing);
    hud();

    if (m.input === 0 && Math.abs(m.v) < 2) {
      m.v = 0;
      m.raf = 0;
      endBrake();
      car.classList.remove("is-driving", "is-braking", "is-reversing");
      hud();
      return;
    }
    m.raf = requestAnimationFrame(tick);
  };

  const startManual = () => {
    const m = man.current;
    const S = st.current;
    if (m.raf || !trackRef.current) return;
    // take the wheel from the autopilot
    S.token++;
    cancelAnimationFrame(S.raf);
    if (S.face < 0 || Math.abs(S.flip) < 1) {
      S.face = S.flip = 1;
    }
    carRef.current?.classList.add("is-driving");
    m.last = performance.now();
    m.raf = requestAnimationFrame(tick);
  };

  const press = (dir: number) => {
    man.current.input = dir;
    if (dir) startManual();
  };
  useImperativeHandle(handle, () => ({ press }));

  // keys: hold → / ← (or D / A) while the scene has focus
  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const dir = k === "arrowright" || k === "d" ? 1 : k === "arrowleft" || k === "a" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat || man.current.input !== dir) press(dir);
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const dir = k === "arrowright" || k === "d" ? 1 : k === "arrowleft" || k === "a" ? -1 : 0;
    if (dir && man.current.input === dir) press(0);
  };

  // scroll over the road drives, but only once you've taken the wheel (focused the scene),
  // so passing through the page never gets stuck here
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el) return;
      const T = trackRef.current;
      if (!T) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const half = (CAR.wheelbase / 2) * T.scale;
      const S = st.current;
      const atEnd = (delta > 0 && S.s >= T.total - half - 1) || (delta < 0 && S.s <= half + 1);
      if (atEnd) return; // let the page scroll on
      e.preventDefault();
      const m = man.current;
      m.v = clamp(m.v + clamp(delta * 1.4, -110, 110), -MAX_REV, MAX_FWD);
      startManual();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- placement and planning -------------------------------------------------

  useLayoutEffect(() => {
    trackRef.current = track;
    if (!track) return;
    const S = st.current;
    S.token++;
    cancelAnimationFrame(S.raf);
    S.s = track.stops[S.idx];
    S.face = S.flip = 1;
    stopManual();
    draw();
    hud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    const S = st.current;
    const fromIdx = S.idx;
    S.idx = active;
    const T = trackRef.current;
    if (!T || fromIdx === active) return;

    cancelAnimationFrame(S.raf);
    stopManual();
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
    const m = man.current;
    return () => {
      S.token++;
      cancelAnimationFrame(S.raf);
      cancelAnimationFrame(m.raf);
    };
  }, []);

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="group"
      aria-label="Drive the car: hold the right or left arrow key. Each checkpoint opens as you reach it."
      aria-roledescription="driving scene"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={() => {
        press(0);
        onEngage?.(false);
      }}
      onFocus={() => onEngage?.(true)}
      onPointerDown={(e) => e.currentTarget.focus({ preventScroll: true })}
      className="drive-scene relative cursor-pointer touch-pan-y outline-none"
      style={{ height: H }}
    >
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

          <Landscape W={W} xs={track.xs} />

          <text ref={hudRef} className="drive-hud" x="2" y="12" />

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
            {/* LiDAR sweep off the nose while you drive */}
            <g className="lidar" aria-hidden>
              <path d="M 42 -13 L 112 -34 A 74 74 0 0 1 112 4 Z" />
              <line className="lidar-ray" x1="42" y1="-13" x2="114" y2="-15" />
            </g>
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
});

export default Track;
