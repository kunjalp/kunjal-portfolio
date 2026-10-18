import Window from "./Window";

const GROUPS: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "TypeScript", "JavaScript", "C/C++", "Java", "Swift", "SQL (PostgreSQL)", "HTML/CSS", "Assembly"] },
  { label: "Embedded & hardware", items: ["STM32", "CAN Bus", "OneWire", "DS18B20 sensors", "Sensor integration", "Signal filtering", "Real-time data acquisition"] },
  { label: "Autonomous systems", items: ["LiDAR", "GNSS / NMEA parsing", "Jetson Nano", "Occupancy-grid mapping", "Localization", "Sensor fusion", "OpenCV", "ROS"] },
  { label: "Frameworks & libraries", items: ["Next.js", "React", "Node.js", "FastAPI", "Capacitor", "Playwright", "Tailwind CSS"] },
  { label: "Tools & platforms", items: ["Supabase", "Neo4j", "Clerk", "Plaid", "Vercel", "Codemagic", "GitHub Actions", "Unix/Linux"] },
  { label: "Software engineering", items: ["Object-oriented programming", "System design", "Testing", "Data pipelines", "CI/CD"] },
];

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
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

export default function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Technical Index
        </h2>
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Window title="skills/index.md">
            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
              {GROUPS.map((g) => (
                <div key={g.label}>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{g.label}</h3>
                  <Tags items={g.items} />
                </div>
              ))}
            </div>
          </Window>

          <div className="space-y-8">
            <Window title="school/coursework.txt">
              <div className="space-y-4 p-6 sm:p-7">
                <p className="text-sm text-muted">UC Santa Cruz · CS + CE double major · GPA 3.95 / 4.0</p>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Completed</h3>
                  <Tags items={["Computer Systems & C", "Assembly Language", "Discrete Mathematics", "Linear Algebra", "Differential Equations"]} />
                </div>
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted">Upcoming</h3>
                  <Tags items={["Data Structures & Algorithms", "Probability & Statistics"]} />
                </div>
              </div>
            </Window>

            <Window title="school/certification.txt">
              <div className="p-6 sm:p-7">
                <p className="font-bold">Algorithmic Toolbox</p>
                <p className="mt-1 text-[0.95rem] text-muted">UC San Diego on Coursera · August 2026</p>
              </div>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}
