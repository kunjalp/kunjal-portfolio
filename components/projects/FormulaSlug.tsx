import Window from "../Window";
import FormulaPanel from "./FormulaPanel";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function FormulaSlug() {
  return (
    <Window title="formula-slug/vcu-firmware">
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <ProjectTitle
            title="Formula Slug: vehicle firmware"
            meta="FSAE · Embedded Software Engineer · Oct 2025 – Present"
          />
          <p className="text-[1.05rem] leading-relaxed">
            I own the STM32 C/C++ firmware that takes sensor readings and reports them over the CAN bus, plus
            work on the throttle map in the vehicle control unit.
          </p>
          <Bullets
            items={[
              "Built tray-temperature monitoring across 4 DS18B20 OneWire sensors, with automatic shutdown on safety-threshold faults.",
              "Redesigned the CAN protocol for a new battery and chip architecture. The electrical team now uses it for on-car telemetry.",
              "Replaced a discontinuous piecewise torque map with a smooth cubic-polynomial curve, now the default accelerator mapping. The chart shows the first revision, a 17-point lookup table.",
            ]}
          />
          <Metrics
            cols="sm:grid-cols-3"
            items={[
              ["4", "temperature sensors"],
              ["Cubic", "default throttle curve"],
              ["CAN", "protocol redesigned"],
            ]}
          />
          <Tags items={["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"]} />
        </div>
        <FormulaPanel />
      </div>
    </Window>
  );
}
