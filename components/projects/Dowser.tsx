import { ArrowUpRight } from "lucide-react";
import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

const LINKS: { label: string; href: string; aria: string }[] = [
  { label: "Live app", href: "https://dowser-ten.vercel.app", aria: "Dowser live app (opens in a new tab)" },
  { label: "GitHub", href: "https://github.com/kunjalp/Dowser", aria: "Dowser on GitHub (opens in a new tab)" },
  {
    label: "Demo video",
    href: "https://youtu.be/-rn5mCfViPI",
    aria: "Dowser demo video on YouTube, with simulated sensor input (opens in a new tab)",
  },
];

export default function Dowser() {
  return (
    <Window section="projects" title="dowser/README.md">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_1fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle title="Dowser" meta={["Finding possible unrecorded oil wells", "October 2026"]} />
          <p className="inline-block rounded-md border-2 border-[rgb(var(--edge))] bg-[rgb(var(--accent)/0.15)] px-3 py-1 text-sm font-bold">
            Cal Hacks 13.0 · Climate track
          </p>
          <p className="text-base leading-relaxed">
            In 1954, a surveyor drew a small circle on a map to mark an oil well. Hundreds of thousands of old wells
            were never recorded. Dowser finds possible unrecorded ones on old USGS topo maps and helps field crews
            check them.
          </p>
          <Bullets
            items={[
              "A YOLO detector reads old USGS topo maps for those circles and converts them to coordinates.",
              "Each one is checked against 158,000 California state well records. Wells with no nearby record become candidates, ranked by how close they are to homes, schools and water.",
              "A person reviews every flag, and rejected detections stay visible.",
              "In the field, an ESP32 handheld streams readings live to a phone app. Simulated sensor input: a potentiometer stands in for the gas sensor.",
            ]}
          />
          <div className="flex flex-wrap gap-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.aria}
                className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
              >
                {l.label}
                <ArrowUpRight size={14} aria-hidden />
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Metrics
            cols="sm:grid-cols-3"
            items={[
              ["42 hrs", "to build it"],
              ["4", "person team"],
              ["158,000", "CA well records checked"],
            ]}
          />
          <p className="text-[0.95rem] leading-snug">
            <span className="font-bold">My part:</span> the Field View iOS app, the backend on Convex, the pitch, and
            the initial ESP32 setup.
          </p>
          <Tags items={["Next.js", "TypeScript", "Convex", "Capacitor (iOS)", "ESP32", "YOLO", "Python", "Vercel"]} />
          <Tags
            label="Team"
            items={["Ryann: data and pipeline", "Murad: ESP32 firmware", "Emir: YOLO/ML", "Kunjal: Field View app, backend, pitch"]}
          />
        </div>
      </div>
    </Window>
  );
}
