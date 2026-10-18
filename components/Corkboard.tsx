"use client";

import { useEffect, useRef, useState } from "react";

const IMG = "/images/about/";
const REF_W = 1176; // layout below is authored for a board this wide
const BOARD_H = 820;
const FREE_MIN_W = 720; // narrower than this, the board becomes a simple grid

type Pin = "pin" | "tape";
type Item =
  | { id: string; kind: "photo"; src: string; alt: string; caption: string; ar: number; w: number; x: number; y: number; tilt: number; pin: Pin; pinColor?: string }
  | { id: string; kind: "card"; title: string; body: string; w: number; x: number; y: number; tilt: number; pin: Pin; pinColor?: string }
  | { id: string; kind: "sticky"; body: string; w: number; x: number; y: number; tilt: number };

const RED = "#c2463c", OLIVE = "#6f7f3a", MUSTARD = "#d0a234", BLUE = "#4f7894";

const ITEMS: Item[] = [
  { id: "card-sunsets", kind: "card", title: "I collect sunsets", body: "If the sky is doing something pretty, I have to stop and take a picture.", w: 210, x: 26, y: 34, tilt: -2.5, pin: "pin", pinColor: RED },
  { id: "beach", kind: "photo", src: "sunset-beach.jpg", alt: "Sun setting over ocean waves", caption: "beach sunset", ar: 4 / 5, w: 178, x: 262, y: 22, tilt: 3, pin: "tape" },
  { id: "reflection", kind: "photo", src: "sunset-reflection.jpg", alt: "Pink clouds reflected in still water", caption: "pink sky, still water", ar: 3 / 2, w: 262, x: 462, y: 58, tilt: -2, pin: "pin", pinColor: MUSTARD },
  { id: "boardwalk", kind: "photo", src: "sunset-boardwalk.jpg", alt: "Golden sky over a wooden boardwalk", caption: "the boardwalk", ar: 3 / 4, w: 162, x: 748, y: 18, tilt: 4, pin: "tape" },
  { id: "lake", kind: "photo", src: "sunset-lake.jpg", alt: "Sun dipping behind hills over a lake", caption: "last light", ar: 3 / 2, w: 232, x: 928, y: 52, tilt: -3.5, pin: "pin", pinColor: OLIVE },

  { id: "tam", kind: "photo", src: "mount-tam.jpg", alt: "Green hills and clouds from the Mount Tamalpais trail", caption: "Mt. Tam, my favorite hike", ar: 4 / 5, w: 196, x: 36, y: 318, tilt: -4, pin: "tape" },
  { id: "ski", kind: "photo", src: "ski.jpg", alt: "Skiers heading down a snowy run at sunset", caption: "skiing since I was 6", ar: 4 / 5, w: 176, x: 250, y: 372, tilt: 2.5, pin: "pin", pinColor: BLUE },
  { id: "meadow", kind: "photo", src: "sunset-meadow.jpg", alt: "Pink sky over a green meadow and distant hills", caption: "pink hour", ar: 4 / 3, w: 222, x: 458, y: 318, tilt: 1.5, pin: "pin", pinColor: RED },
  { id: "canada", kind: "photo", src: "banff.jpg", alt: "Mountain valley with a stone building and gardens in Canada", caption: "Canada, where nature meets cool buildings", ar: 4 / 5, w: 196, x: 968, y: 296, tilt: 3, pin: "tape" },

  { id: "card-breaks", kind: "card", title: "How I take breaks", body: "I grab my charcoal. Flowers and landscapes are my favorite to draw.", w: 214, x: 718, y: 340, tilt: -1.5, pin: "pin", pinColor: OLIVE },
  { id: "street", kind: "photo", src: "charcoal-street.jpg", alt: "Painting of a rainy café street at night", caption: "café at night", ar: 4 / 5, w: 168, x: 486, y: 566, tilt: -3, pin: "pin", pinColor: MUSTARD },
  { id: "kitten", kind: "photo", src: "pencil-kitten.jpg", alt: "Pencil drawing of a kitten mid-air", caption: "kitten study", ar: 4 / 5, w: 158, x: 676, y: 590, tilt: 2, pin: "tape" },
  { id: "buddha", kind: "photo", src: "charcoal-buddha.jpg", alt: "Charcoal drawing of a Buddha face", caption: "charcoal, my favorite", ar: 4 / 5, w: 168, x: 860, y: 572, tilt: -2, pin: "pin", pinColor: RED },
  { id: "sticky", kind: "sticky", body: "Up next: learning embroidery so I can customize my own clothes!", w: 176, x: 70, y: 652, tilt: -4 },
];

type Zoom = { id: string; cx: number; cy: number; w: number; h: number; tilt: number; phase: "start" | "open" | "out" };

const DEFAULT_ORDER = ITEMS.map((i) => i.id);

function PushPin({ color = RED }: { color?: string }) {
  return (
    <span aria-hidden className="cork-pin" style={{ background: `radial-gradient(circle at 35% 30%, #fff8 0 18%, ${color} 22%)` }} />
  );
}

function Contents({ item }: { item: Item }) {
  if (item.kind === "photo")
    return (
      <>
        <div className="cork-print" style={{ aspectRatio: String(item.ar) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG + item.src} alt={item.alt} draggable={false} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <p className="cork-caption">{item.caption}</p>
      </>
    );
  if (item.kind === "card")
    return (
      <>
        <p className="cork-card-title">{item.title}</p>
        <p className="cork-card-body">{item.body}</p>
      </>
    );
  return <p className="cork-sticky-body">{item.body}</p>;
}


function ZoomCard({ zoom, item, onClose, onDone }: { zoom: Zoom; item: Item; onClose: () => void; onDone: () => void }) {
  const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const k = Math.max(1, Math.min((vh * 0.78) / zoom.h, (vw * 0.9) / zoom.w, 2.8));
  const open = zoom.phase === "open";
  const transform = open
    ? `perspective(1400px) translate(${vw / 2 - zoom.cx}px, ${vh / 2 - zoom.cy}px) rotate(0deg) rotateY(360deg) scale(${k})`
    : `perspective(1400px) translate(0px, 0px) rotate(${zoom.tilt}deg) rotateY(0deg) scale(1)`;
  const cls = item.kind === "photo" ? "cork-photo" : item.kind === "card" ? "cork-card" : "cork-sticky";
  return (
    <>
      <div className={`cork-zoom-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Enlarged item. Click to put it back."
        className={`cork-item cork-zoom ${cls} is-held`}
        style={{ position: "fixed", left: zoom.cx - zoom.w / 2, top: zoom.cy - zoom.h / 2, width: zoom.w, zIndex: 3000, transform, cursor: "pointer" }}
        onClick={onClose}
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform" && zoom.phase === "out") onDone();
        }}
      >
        {item.kind !== "sticky" && (item.pin === "pin" ? <PushPin color={item.pinColor} /> : <span aria-hidden className="cork-tape" />)}
        <Contents item={item} />
      </div>
    </>
  );
}

export default function Corkboard() {
  const board = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, { x: i.x, y: i.y }])),
  );
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [held, setHeld] = useState<string | null>(null);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; scale: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && closeZoom();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [zoom]);

  const free = width >= FREE_MIN_W;
  // Positions are stored in the reference layout's coordinates and scaled to the live board width.
  const scale = width ? width / REF_W : 1;
  const clamp = (it: Item, x: number, y: number) => ({
    x: Math.min(Math.max(x, -it.w * 0.25), REF_W - it.w * 0.75),
    y: Math.min(Math.max(y, -20), BOARD_H - 90),
  });

  const front = (id: string) => setOrder((o) => [...o.filter((k) => k !== id), id]);

  const onDown = (it: Item) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!free) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    front(it.id);
    const p = pos[it.id];
    drag.current = { id: it.id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, scale, moved: false };
    setHeld(it.id);
  };
  const onMove = (it: Item) => (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== it.id) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 5) d.moved = true;
    const nx = d.ox + (e.clientX - d.sx) / d.scale;
    const ny = d.oy + (e.clientY - d.sy) / d.scale;
    setPos((ps) => ({ ...ps, [it.id]: clamp(it, nx, ny) }));
  };
  const openZoom = (it: Item, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    front(it.id);
    setZoom({ id: it.id, cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: el.offsetWidth, h: el.offsetHeight, tilt: it.tilt, phase: "start" });
    requestAnimationFrame(() => requestAnimationFrame(() => setZoom((z) => (z ? { ...z, phase: "open" } : z))));
  };
  const closeZoom = () => setZoom((z) => (z && z.phase !== "out" ? { ...z, phase: "out" } : z));

  const onUp = (it: Item) => (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setHeld(null);
    // a plain click (no drag): flip it up to the middle of the screen
    if (d && d.id === it.id && !d.moved) openZoom(it, e.currentTarget);
  };
  const onKey = (it: Item) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openZoom(it, e.currentTarget);
      return;
    }
    const step = e.shiftKey ? 48 : 16;
    const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = m[e.key];
    if (!d) return;
    e.preventDefault();
    front(it.id);
    setPos((ps) => ({ ...ps, [it.id]: clamp(it, ps[it.id].x + d[0], ps[it.id].y + d[1]) }));
  };
  const tidy = () => {
    setPos(Object.fromEntries(ITEMS.map((i) => [i.id, { x: i.x, y: i.y }])));
    setOrder(DEFAULT_ORDER);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="cork-hint">
          {free ? "Drag anything around. Click one to take a closer look." : "A few favorites."}
        </p>
        {free && (
          <button type="button" className="glass-btn !min-h-[34px] !px-3 !text-[0.8rem]" onClick={tidy}>
            Tidy up
          </button>
        )}
      </div>

      <div className="cork-frame">
        <div
          ref={board}
          className={`cork-board ${free ? "relative" : "grid grid-cols-2 items-start gap-5 p-5"}`}
          style={free ? { height: BOARD_H * scale } : undefined}
          role="group"
          aria-label="Corkboard of photos and drawings"
        >
          {ITEMS.map((it) => {
            const p = pos[it.id];
            const isHeld = held === it.id;
            const hidden = zoom?.id === it.id;
            const z = order.indexOf(it.id) + 1;
            const cls =
              it.kind === "photo" ? "cork-photo" : it.kind === "card" ? "cork-card" : "cork-sticky";
            const style: React.CSSProperties = free
              ? {
                  position: "absolute",
                  left: p.x * scale,
                  top: p.y * scale,
                  width: it.w * scale,
                  zIndex: isHeld ? 999 : z,
                  transform: `rotate(${isHeld ? it.tilt * 0.3 : it.tilt}deg) scale(${isHeld ? 1.05 : 1})`,
                }
              : { transform: `rotate(${it.tilt * 0.5}deg)` };
            if (hidden) style.visibility = "hidden";
            const label =
              it.kind === "photo" ? `${it.caption}. ${it.alt}` : it.kind === "card" ? it.title : it.body;
            return (
              <div
                key={it.id}
                className={`cork-item ${cls} ${isHeld ? "is-held" : ""} ${free ? "cursor-grab" : ""}`}
                style={style}
                tabIndex={free ? 0 : undefined}
                aria-label={free ? `${label}. Use arrow keys to move.` : undefined}
                onPointerDown={onDown(it)}
                onPointerMove={onMove(it)}
                onPointerUp={onUp(it)}
                onPointerCancel={() => { drag.current = null; setHeld(null); }}
                onClick={free ? undefined : (e) => openZoom(it, e.currentTarget)}
                onKeyDown={free ? onKey(it) : undefined}
              >
                {it.kind !== "sticky" && (it.pin === "pin" ? <PushPin color={it.pinColor} /> : <span aria-hidden className="cork-tape" />)}
                <Contents item={it} />
              </div>
            );
          })}
        </div>
      </div>

      {zoom && <ZoomCard zoom={zoom} item={ITEMS.find((i) => i.id === zoom.id)!} onClose={closeZoom} onDone={() => setZoom(null)} />}
    </div>
  );
}
