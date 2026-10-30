"use client";

import { lazy, Suspense, useState } from "react";
import CanTicker from "./CanTicker";
import ThrottleMap, { LUT } from "./ThrottleMap";

// Loaded only when the tab is first opened (React.lazy adds nothing to the page bundle, unlike next/dynamic).
// The tab only renders after a click, so this never runs on the server. The 3D code inside loads later still.
const ExplodedView = lazy(() => import("./car/ExplodedView"));

// Accelerator map: the cubic y = -0.2x^3 + 0.9x^2 + 0.3x as a 41-entry LUT. The table is printed from the same
// LUT the chart draws, so the two cannot drift apart. Interpolation is standard linear interpolation.
const N = LUT.length - 1;
const rows = Array.from({ length: Math.ceil(LUT.length / 4) }, (_, r) =>
  "        " + LUT.slice(r * 4, r * 4 + 4).map((v) => `${v.toFixed(9)}f`).join(", ") + (r * 4 + 4 < LUT.length ? "," : ""),
).join("\n");
const CODE = `float ETCController::accelerator_mapping(float pedal_travel) {
    // Clamp input pedal position between 0.0 (0%) and 1.0 (100%)
    pedal_travel = clamp(pedal_travel, 0.0f, 1.0f);

    // Pre-computed 41-point LUT of y = -0.2x^3 + 0.9x^2 + 0.3x, 2.5% pedal steps
    static constexpr float TORQUE_LUT[${LUT.length}] = {
${rows}
    };

    float scaled_index = pedal_travel * ${N}.0f;
    int index = static_cast<int>(scaled_index);
    if (index >= ${N}) {
        return 1.0f;
    }

    float fraction = scaled_index - static_cast<float>(index);

    // Linear interpolation between table points
    return TORQUE_LUT[index] + fraction * (TORQUE_LUT[index + 1] - TORQUE_LUT[index]);
}`;

const TABS = [
  { id: "map", label: "Throttle map" },
  { id: "code", label: "C++" },
  { id: "can", label: "CAN telemetry" },
  { id: "car", label: "Exploded view" },
] as const;

export default function FormulaPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("map");

  return (
    <div>
      <div role="tablist" aria-label="Formula Slug views" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`glass-btn !min-h-[36px] !px-3 !text-[0.8rem] ${tab === t.id ? "btn-primary" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-4">
        {tab === "map" && <ThrottleMap />}
        {tab === "can" && <CanTicker />}
        {tab === "car" && (
          <Suspense fallback={<p className="font-mono text-xs text-muted">Loading…</p>}>
            <ExplodedView />
          </Suspense>
        )}
        {tab === "code" && (
          <div>
            <p className="font-mono text-xs text-muted">vcu/etc/etc_controller.cpp</p>
            <pre
              tabIndex={0}
              className="fade-up mt-2 overflow-x-auto rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))] p-4 font-mono text-[0.76rem] leading-relaxed text-[rgb(var(--term-fg))]"
            >
              <code>{CODE}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
