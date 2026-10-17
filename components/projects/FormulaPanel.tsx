"use client";

import { useState } from "react";
import CanTicker from "./CanTicker";
import ThrottleMap from "./ThrottleMap";

// From vcu/etc/etc_controller.cpp, PR #26 (first version of the change).
const CODE = `float ETCController::accelerator_mapping(float pedal_travel) {
    // Clamp input pedal position between 0.0 (0%) and 1.0 (100%)
    pedal_travel = clamp(pedal_travel, 0.0f, 1.0f);

    // Pre-computed 17-Point Power Law (k=1.4) LUT
    static constexpr float TORQUE_LUT[17] = {
        0.000000f, 0.020785f, 0.054854f, 0.098863f,
        0.151214f, 0.210744f, 0.276632f, 0.348250f,
        0.425114f, 0.506822f, 0.593026f, 0.683424f,
        0.777748f, 0.875758f, 0.977239f, 1.000000f,
        1.000000f
    };

    float scaled_index = pedal_travel * 16.0f;
    int index = static_cast<int>(scaled_index);
    if (index >= 16) {
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
        {tab === "code" && (
          <div>
            <p className="font-mono text-xs text-muted">vcu/etc/etc_controller.cpp</p>
            <pre
              tabIndex={0}
              className="fade-up mt-2 overflow-x-auto rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))] p-4 font-mono text-[0.76rem] leading-relaxed text-[rgb(var(--paper))]"
            >
              <code>{CODE}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
