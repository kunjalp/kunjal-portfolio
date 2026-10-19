"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "../../motion";
import { CALLOUT_PARTS } from "./carParts";

// three.js loads only here, the first time the canvas is shown (client only: it renders after an effect).
const CarCanvas = lazy(() => import("./CarCanvas"));

/** Canvas height; the tab must stay within the Throttle map tab's height so the window fits a laptop screen. */
const STAGE_H = 300;

/** Touch-first or small screens get the flat parts list instead of the 3D canvas. */
function useCanvasAllowed() {
  const reduced = useReducedMotion();
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = matchMedia("(pointer: fine) and (min-width: 768px)");
    const check = () => setOk(mq.matches && "WebGL2RenderingContext" in window);
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);
  return ok === null ? null : ok && !reduced;
}

function PartsList() {
  return (
    <div>
      <p className="text-sm text-muted">The parts my firmware touches, from the tray sensors to the pedal.</p>
      <ol className="mt-3 space-y-2">
        {CALLOUT_PARTS.map((p, i) => (
          <li
            key={p.id}
            className="flex gap-3 rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)] px-3 py-2"
          >
            <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block text-[0.92rem] font-bold leading-tight">{p.callout!.label}</span>
              <span className="block text-[0.82rem] leading-snug text-muted">{p.callout!.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ExplodedView() {
  const allowed = useCanvasAllowed();
  const [t, setT] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  if (allowed === null) return <div style={{ height: STAGE_H }} />;
  if (!allowed) return <PartsList />;

  return (
    <div>
      <p className="min-h-[2.5em] text-sm leading-snug text-muted" aria-live="polite">
        {note ?? "Drag across the car or use the slider to pull it apart. Hover a label for what it does."}
      </p>
      <div
        className="mt-1 overflow-hidden rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.35)]"
        style={{ height: STAGE_H }}
      >
        <Suspense fallback={<p className="grid h-full place-items-center font-mono text-xs text-muted">Loading the car…</p>}>
          <CarCanvas target={t} onChange={setT} onNote={setNote} />
        </Suspense>
      </div>
      <label className="mt-3 flex items-center gap-3 font-mono text-xs text-muted">
        <span>Assembled</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-label="Explode the car into parts"
          className="flex-1 accent-[rgb(var(--accent))]"
        />
        <span>Exploded</span>
      </label>
      {/* the same parts, for screen readers */}
      <ul className="sr-only">
        {CALLOUT_PARTS.map((p) => (
          <li key={p.id}>
            {p.callout!.label}: {p.callout!.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
