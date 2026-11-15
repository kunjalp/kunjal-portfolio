import { ArrowUpRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import FormulaPanel from "./FormulaPanel";
import ThrottleThumb from "./ThrottleThumb";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function FormulaSlug() {
  return (
    <ProjectCard
      id="project-formula-slug"
      file="formula-slug/vcu-firmware"
      name="Formula Slug"
      what="Embedded Software Engineer Intern, FSAE"
      when="Oct 2025 – Present"
      line="STM32 firmware, CAN telemetry and the throttle map."
      metrics={[
        ["126 V", "pack"],
        ["30/60", "cells/temps"],
        ["41-pt", "throttle LUT"],
      ]}
      links={[
        {
          label: "APPS checker · GitHub",
          href: "https://github.com/kunjalp/ETC-project",
          aria: "Accelerator pedal (APPS) plausibility checker for Formula Slug on GitHub (opens in a new tab)",
        },
      ]}
      visual={<ThrottleThumb />}
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_1fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle
            title="Formula Slug: vehicle firmware"
            meta={["Embedded Software Engineer Intern, FSAE", "Oct 2025 – Present"]}
          />
          <p className="text-base leading-relaxed">
            I contribute to the firmware that monitors and protects the 126 V battery pack of our student-built
            electric race car, and I work on the throttle map in the vehicle control unit.
          </p>
          <Bullets
            items={[
              "Built STM32 C/C++ firmware that turns the pack's 30 cell voltages and 60 temperatures into CAN telemetry, including tray-temperature monitoring on 4 DS18B20 sensors that triggers automatic shutdown on faults.",
              "Replaced a piecewise pedal-to-torque map with a smooth cubic-polynomial curve (41-point LUT) for a smoother throttle response, now the default accelerator mapping in VCU firmware.",
              "Redesigned the CAN protocol for a new battery and chip architecture, adopted team-wide, and documented the pack's telemetry data (units, ranges, resolution) so teammates can decode it without reading the firmware.",
            ]}
          />
          <Metrics
            dense
            cols="grid-cols-1 sm:grid-cols-3"
            items={[
              ["126 V", "pack"],
              ["30/60", "cells/temps"],
              ["41-pt", "throttle LUT"],
            ]}
          />
          <Tags items={["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"]} />
          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/kunjalp/ETC-project"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Accelerator pedal (APPS) plausibility checker for Formula Slug on GitHub (opens in a new tab)"
              className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
            >
              APPS plausibility checker · GitHub
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
        </div>
        <FormulaPanel />
      </div>
    </ProjectCard>
  );
}
