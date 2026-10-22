import Window from "../Window";
import FormulaPanel from "./FormulaPanel";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function FormulaSlug() {
  return (
    <Window section="projects" title="formula-slug/vcu-firmware">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_1fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle
            title="Formula Slug: vehicle firmware"
            meta={["Embedded Software Engineer, FSAE", "Oct 2025 – Present"]}
          />
          <p className="text-base leading-relaxed">
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
            dense
            cols="grid-cols-1 sm:grid-cols-3"
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
