import Window from "./Window";
import FormulaPanel from "./projects/FormulaPanel";
import OccupancyGrid from "./projects/OccupancyGrid";
import VexWorkshop from "./projects/VexWorkshop";
import { Bullets, Metrics, Tags } from "./projects/shared";

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Projects
        </h2>
        <p className="mt-3 max-w-xl text-[1.05rem]">
          Drag any window by its title bar. All of them respond to you.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Heirloom */}
          <div className="lg:col-span-2">
            <Window title="heirloom/README.md">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
                <div className="space-y-4">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">Heirloom</h3>
                  <p className="font-mono text-xs text-muted">AI multi-generational wealth platform · October 2026</p>
                  <p className="inline-block rounded-md border-2 border-[rgb(var(--edge))] bg-[rgb(var(--accent)/0.15)] px-3 py-1 text-sm font-bold">
                    1st place, Daytona track · SF Tech Week
                  </p>
                  <Bullets
                    items={[
                      "Team of 3 won the Daytona track (20 teams, 12 hours), iterating on feedback from finance professionals.",
                      "Designed AI agents that flag family goal conflicts for wealth advisors.",
                      "Multi-tenant data isolation with row-level security.",
                    ]}
                  />
                </div>
                <div className="space-y-5">
                  <Metrics
                    cols="sm:grid-cols-2"
                    items={[
                      ["1st", "Daytona track"],
                      ["20", "teams competing"],
                      ["12 hrs", "to build it"],
                      ["3", "person team"],
                    ]}
                  />
                  <Tags items={["Next.js", "FastAPI", "PostgreSQL", "Neo4j", "Clerk", "Plaid", "Bright Data", "Daytona"]} />
                </div>
              </div>
            </Window>
          </div>

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
          </div>

          {/* COSMOS */}
          <Window title="cosmos/perception-and-mapping">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                Scaled Autonomous Vehicle
              </h3>
              <p className="font-mono text-xs text-muted">UC San Diego COSMOS · 2024</p>
              <p className="text-[1.05rem] leading-relaxed">
                Perception and mapping for a scaled autonomous vehicle. Try the occupancy grid
                below: the way a robot builds a map is by clearing the space it has seen.
              </p>
              <OccupancyGrid />
              <Metrics cols="sm:grid-cols-2" items={[["3", "autonomous laps"], ["5", "person team"]]} />
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
              <Metrics cols="sm:grid-cols-2" items={[["60+", "App Store users"], ["14", "dining menus scraped"]]} />
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

          {/* ACM */}
          <div className="lg:col-span-2">
          <Window title="acm-ucsc/web-lead.md">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                ACM at UCSC: Web Redesign
              </h3>
              <p className="font-mono text-xs text-muted">Web Development Lead · August 2026 – Present</p>
              <p className="text-[1.05rem] leading-relaxed">
                I lead a team of 4 developers through a full redesign of the club&apos;s website,
                splitting the work across content, navigation, responsive UI and backend
                authentication.
              </p>
              <Bullets
                items={[
                  "Directing 5 features: member login with sessions, a unified nav bar, a mobile-responsive layout, a redesigned events page, and a refreshed Meet the Board section.",
                  "Weekly meetings to assign tasks and keep releases on schedule, with progress reported to the executive board.",
                ]}
              />
              <Metrics cols="sm:grid-cols-2" items={[["4", "developers led"], ["5", "features directed"]]} />
              <Tags items={["Team leadership", "Authentication", "Responsive UI"]} />
            </div>
          </Window>
          </div>

          {/* VEX */}
          <div className="lg:col-span-2">
            <Window title="vex-vrc/leadership.txt">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-3">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                    VEX VRC Robotics
                  </h3>
                  <p className="font-mono text-xs text-muted">Fremont, CA · Jul 2021 – May 2025 · Club President</p>
                  <p className="text-[1.05rem] leading-relaxed">
                    I was a mechanical builder: I figured out the components and built
                    drivetrains, flywheels and intake systems, and sometimes helped with
                    autonomous code. After three seasons on the technical team I was elected
                    president. Every year meant a new game and a robot built from scratch.
                  </p>
                  <Bullets
                    items={[
                      "Structured the club into three competitive teams and coordinated build schedules, testing and competition readiness.",
                      "Owned a $3,000+ annual budget from student fees and local sponsors, deciding which team's needs came first when money was tight.",
                      "Created pathways for girls in the club to take on technical and leadership roles instead of support roles.",
                      "Stayed hands-on with hardware and software the whole time.",
                    ]}
                  />
                  <Tags items={["Mechanical design", "Drivetrains", "Flywheels", "Intakes", "Autonomous code", "Budgeting", "Leadership"]} />
                </div>
                <div className="space-y-5">
                  <VexWorkshop />
                  <Metrics
                    items={[
                      ["~30", "members led"],
                      ["3", "competitive teams"],
                      ["$3,000+", "annual budget"],
                      ["2", "teams qualified for State"],
                    ]}
                  />
                </div>
              </div>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}
