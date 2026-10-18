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

export default function Corkboard() {
  const board = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, { x: i.x, y: i.y }])),
  );
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [held, setHeld] = useState<string | null>(null);
  const [flip, setFlip] = useState<{ id: string; n: number } | null>(null);
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; scale: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

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
  const onUp = (it: Item) => () => {
    const d = drag.current;
    drag.current = null;
    setHeld(null);
    // a plain click (no drag): flip the piece over and land it on top
    if (d && d.id === it.id && !d.moved) {
      front(it.id);
      setFlip((f) => ({ id: it.id, n: (f?.n ?? 0) + 1 }));
    }
  };
  const onKey = (it: Item) => (e: React.KeyboardEvent<HTMLDivElement>) => {
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
          {free ? "Drag anything around. Click a photo to bring it to the front." : "A few favorites."}
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
            const isFlip = flip?.id === it.id;
            const z = order.indexOf(it.id) + 1;
            const cls =
              it.kind === "photo" ? "cork-photo" : it.kind === "card" ? "cork-card" : "cork-sticky";
            const style: React.CSSProperties = free
              ? {
                  position: "absolute",
                  left: p.x * scale,
                  top: p.y * scale,
                  width: it.w * scale,
                  zIndex: isHeld || isFlip ? 999 : z,
                  ['--tilt' as string]: `${it.tilt}deg`,
                  transform: `rotate(${isHeld ? it.tilt * 0.3 : it.tilt}deg) scale(${isHeld ? 1.05 : 1})`,
                }
              : { transform: `rotate(${it.tilt * 0.5}deg)` };
            const label =
              it.kind === "photo" ? `${it.caption}. ${it.alt}` : it.kind === "card" ? it.title : it.body;
            return (
              <div
                key={it.id}
                className={`cork-item ${cls} ${isHeld ? "is-held" : ""} ${isFlip ? (flip!.n % 2 ? "cork-flip-a" : "cork-flip-b") : ""} ${free ? "cursor-grab" : ""}`}
                style={style}
                tabIndex={free ? 0 : undefined}
                aria-label={free ? `${label}. Use arrow keys to move.` : undefined}
                onPointerDown={onDown(it)}
                onPointerMove={onMove(it)}
                onPointerUp={onUp(it)}
                onPointerCancel={() => { drag.current = null; setHeld(null); }}
                onAnimationEnd={() => setFlip((f) => (f && f.id === it.id ? null : f))}
                onKeyDown={free ? onKey(it) : undefined}
              >
                {it.kind !== "sticky" && (it.pin === "pin" ? <PushPin color={it.pinColor} /> : <span aria-hidden className="cork-tape" />)}
                <Contents item={it} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
