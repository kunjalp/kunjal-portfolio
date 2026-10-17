import Window from "./Window";
import FormulaPanel from "./projects/FormulaPanel";
import OccupancyGrid from "./projects/OccupancyGrid";

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-md border-[1.5px] border-[rgb(var(--edge)/0.5)] bg-[rgb(var(--paper2)/0.5)] px-2.5 py-0.5 font-mono text-xs"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[1rem] leading-relaxed">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Projects
        </h2>
        <p className="mt-3 max-w-xl text-[1.05rem]">
          Drag any window by its title bar. Some of them respond to you.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Formula Slug */}
          <div className="lg:col-span-2">
            <Window title="formula-slug/vcu-firmware">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
                <div className="space-y-4">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                    Formula Slug: vehicle firmware
                  </h3>
                  <p className="font-mono text-xs text-muted">FSAE · Embedded Software Engineer · Oct 2025 – Present</p>
                  <p className="text-[1.05rem] leading-relaxed">
                    I own the STM32 C/C++ firmware that takes sensor readings and reports them
                    over the CAN bus, plus work on the throttle map in the vehicle control unit.
                  </p>
                  <Bullets
                    items={[
                      "Built tray-temperature monitoring across 4 DS18B20 OneWire sensors, with automatic shutdown on safety-threshold faults.",
                      "Redesigned the CAN protocol for a new battery and chip architecture. The electrical team now uses it for on-car telemetry.",
                      "Replaced a discontinuous piecewise torque map with a smooth cubic-polynomial curve, now the default accelerator mapping. The chart shows the first revision, a 17-point lookup table.",
                    ]}
                  />
                  <Tags items={["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"]} />
                </div>
                <FormulaPanel />
              </div>
            </Window>
          </div>

          {/* COSMOS */}
          <Window title="cosmos/perception-and-mapping">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                Scaled autonomous vehicle
              </h3>
              <p className="font-mono text-xs text-muted">UC San Diego COSMOS · 2024</p>
              <p className="text-[1.05rem] leading-relaxed">
                Perception and mapping for a scaled autonomous vehicle. Try the occupancy grid
                below: the way a robot builds a map is by clearing the space it has seen.
              </p>
              <OccupancyGrid />
              <Tags items={["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"]} />
            </div>
          </Window>

          {/* Sammy's Palate */}
          <Window title="sammys-palate/README.md">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                Sammy&apos;s Palate
              </h3>
              <p className="font-mono text-xs text-muted">UCSC dining tracker · June 2026 – Present</p>
              <Bullets
                items={[
                  "Live on the App Store with 60+ users, plus a web demo.",
                  "A scheduled Python/Playwright scraper parses 14 campus dining menus, with a name-based fallback.",
                  "Row-level security (RLS) in the database keeps each person's data private.",
                  "A Codemagic CI/CD pipeline builds, code-signs and ships each iOS update.",
                ]}
              />
              <Tags
                items={[
                  "Next.js",
                  "TypeScript",
                  "Supabase",
                  "PostgreSQL",
                  "Python",
                  "Playwright",
                  "Capacitor (iOS)",
                ]}
              />
            </div>
          </Window>

          {/* VEX */}
          <div className="lg:col-span-2">
            <Window title="vex-vrc/leadership.txt">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-3">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                    VEX VRC Robotics
                  </h3>
                  <p className="font-mono text-xs text-muted">Club President · leadership and systems engineering</p>
                  <p className="text-[1.05rem] leading-relaxed">
                    I ran the club: coordinating teams, managing the budget and getting robots
                    ready to compete.
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["~30", "members"],
                    ["3", "teams"],
                    ["$3,000+", "budget managed"],
                    ["2", "teams qualified for State"],
                  ].map(([v, l]) => (
                    <div
                      key={l}
                      className="rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.5)] p-4"
                    >
                      <dd className="text-[1.7rem] font-extrabold leading-none">{v}</dd>
                      <dt className="mt-1.5 text-sm text-muted">{l}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}
