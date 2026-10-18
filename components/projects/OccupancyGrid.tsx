"use client";

import { useCallback, useEffect, useRef } from "react";

const COLS = 36;
const ROWS = 18;
const CELL = 14;
const REVEAL = 3; // radius in cells

// Hidden obstacles (the "walls" a LiDAR would bounce off).
const OBSTACLES = new Set<string>();
const rect = (c0: number, r0: number, c1: number, r1: number) => {
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) OBSTACLES.add(`${c},${r}`);
};
for (let c = 0; c < COLS; c++) {
  OBSTACLES.add(`${c},0`);
  OBSTACLES.add(`${c},${ROWS - 1}`);
}
for (let r = 0; r < ROWS; r++) {
  OBSTACLES.add(`0,${r}`);
  OBSTACLES.add(`${COLS - 1},${r}`);
}
rect(6, 4, 9, 6);
rect(14, 9, 15, 15);
rect(20, 3, 27, 4);
rect(24, 10, 30, 13);
rect(10, 12, 12, 13);

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).join(" ");

export default function OccupancyGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  // 0 unknown, 1 free, 2 occupied
  const grid = useRef<Uint8Array>(new Uint8Array(COLS * ROWS));
  const cursor = useRef<[number, number] | null>(null);

  const draw = useCallback(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const unknown = `rgb(${token("--fg")} / 0.07)`;
    const free = `rgb(${token("--accent2")} / 0.38)`;
    const wall = `rgb(${token("--accent")})`;
    const line = `rgb(${token("--edge")} / 0.18)`;
    const accent = `rgb(${token("--accent")})`;
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = grid.current[r * COLS + c];
        ctx.fillStyle = v === 2 ? wall : v === 1 ? free : unknown;
        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        ctx.strokeStyle = line;
        ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
      }
    }
    if (cursor.current) {
      const [px, py] = cursor.current;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, REVEAL * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1;
    }
  }, []);

  useEffect(() => {
    draw();
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [draw]);

  const scan = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cv = ref.current;
    if (!cv) return;
    const b = cv.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * cv.width;
    const py = ((e.clientY - b.top) / b.height) * cv.height;
    cursor.current = [px, py];
    const cc = Math.floor(px / CELL);
    const cr = Math.floor(py / CELL);
    for (let dr = -REVEAL; dr <= REVEAL; dr++) {
      for (let dc = -REVEAL; dc <= REVEAL; dc++) {
        if (dr * dr + dc * dc > REVEAL * REVEAL) continue;
        const c = cc + dc;
        const r = cr + dr;
        if (c < 0 || r < 0 || c >= COLS || r >= ROWS) continue;
        grid.current[r * COLS + c] = OBSTACLES.has(`${c},${r}`) ? 2 : 1;
      }
    }
    draw();
  };

  return (
    <div>
      <canvas
        ref={ref}
        width={COLS * CELL}
        height={ROWS * CELL}
        onPointerMove={scan}
        onPointerDown={scan}
        onPointerLeave={() => {
          cursor.current = null;
          draw();
        }}
        role="img"
        aria-label="Interactive occupancy grid. Move the pointer over it to map free space and obstacles."
        className="w-full cursor-crosshair touch-pan-y rounded-lg border-2 border-[rgb(var(--edge))]"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">Move across the grid to scan free space.</p>
        <button
          type="button"
          onClick={() => {
            grid.current.fill(0);
            draw();
          }}
          className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
        >
          Clear map
        </button>
      </div>
    </div>
  );
}
