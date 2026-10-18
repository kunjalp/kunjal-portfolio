import Window from "./Window";

const GROUPS: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "TypeScript", "JavaScript", "C/C++", "Java", "Swift", "SQL (PostgreSQL)", "HTML/CSS", "Assembly"] },
  { label: "Embedded & hardware", items: ["STM32", "CAN Bus", "OneWire", "DS18B20 sensors", "Sensor integration", "Signal filtering", "Real-time data acquisition"] },
  { label: "Autonomous systems", items: ["LiDAR", "GNSS / NMEA parsing", "Jetson Nano", "Occupancy-grid mapping", "Localization", "Sensor fusion", "OpenCV", "ROS"] },
  { label: "Frameworks & libraries", items: ["Next.js", "React", "Node.js", "FastAPI", "Capacitor", "Playwright", "Tailwind CSS"] },
  { label: "Tools & platforms", items: ["Supabase", "Neo4j", "Clerk", "Plaid", "Vercel", "Codemagic", "GitHub Actions", "Unix/Linux"] },
  { label: "Software engineering", items: ["Object-oriented programming", "System design", "Testing", "Data pipelines", "CI/CD"] },
];

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/&/g, "")
    .trim()
    .replace(/\s+/g, "-");

/** One group, written the way a terminal would print it: `$ ls languages/` then the entries. */
function Listing({ dir, items }: { dir: string; items: string[] }) {
  return (
    <div className="font-mono text-[0.82rem] leading-relaxed">
      <p className="font-bold">
        <span aria-hidden className="mr-2 text-accent">
          $
        </span>
        ls {dir}/
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 pl-4">
        {items.map((t) => (
          <li key={t}>{/\s/.test(t) ? `'${t}'` : t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1100px]">
        <h2 className="on-sky text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Technical Index
        </h2>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Window title="skills/index.md">
            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
              {GROUPS.map((g) => (
                <div key={g.label}>
                  <Listing dir={slug(g.label)} items={g.items} />
                </div>
              ))}
            </div>
          </Window>

          <div className="space-y-8">
            <Window title="school/coursework.txt">
              <div className="space-y-4 p-6 sm:p-7">
                <p className="text-sm text-muted">UC Santa Cruz, CS + CE double major, GPA 3.95 / 4.0</p>
                <div>
                  <Listing dir="completed" items={["Computer Systems & C", "Assembly Language", "Discrete Mathematics", "Linear Algebra", "Differential Equations"]} />
                </div>
                <div>
                  <Listing dir="upcoming" items={["Data Structures & Algorithms", "Probability & Statistics"]} />
                </div>
              </div>
            </Window>

            <Window title="school/certification.txt">
              <div className="p-6 sm:p-7">
                <p className="font-bold">Algorithmic Toolbox</p>
                <p className="mt-1 text-[0.95rem] text-muted">UC San Diego on Coursera, August 2026</p>
              </div>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}
