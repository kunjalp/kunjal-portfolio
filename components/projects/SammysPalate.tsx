import { ArrowUpRight } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function SammysPalate() {
  return (
    <ProjectCard
      id="project-sammys"
      file="sammys-palate/README.md"
      name="Sammy's Palate"
      what="UCSC dining tracker"
      when="June 2026 – Present"
      line="A web and iOS macro tracker, live on the App Store."
      metrics={[
        ["80+", "downloads"],
        ["233K+", "menu records"],
        ["14", "dining halls"],
      ]}
      links={[
        {
          label: "App Store",
          href: "https://apps.apple.com/app/sammys-palate/id6806954658",
          aria: "Sammy's Palate on the App Store (opens in a new tab)",
        },
        {
          label: "Live Web Demo",
          href: "https://ucsc-dining-tracker.vercel.app/",
          aria: "Sammy's Palate live web demo (opens in a new tab)",
        },
        {
          label: "GitHub",
          href: "https://github.com/kunjalp/ucsc_dining_tracker",
          aria: "Sammy's Palate source on GitHub (opens in a new tab)",
        },
      ]}
      image={{
        src: "/images/sammys/menu.jpg",
        alt: "Sammy’s Palate on a phone: calorie and macro totals for the day above a dining hall’s menu.",
        width: 448,
        height: 915,
        strip: "50% 8%",
        side: "50% 6%",
      }}
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle title="Sammy's Palate" meta={["UCSC dining tracker", "June 2026 – Present"]} />
          <Bullets
            items={[
              "Live on the App Store, plus a web demo.",
              "Shipped a web and iOS macro tracker that makes UCSC dining nutrition easy to find, reaching 80+ downloads.",
              "Indexed 233K+ menu records across 14 dining halls with daily Python/Playwright scrapers on GitHub Actions (100% success over 470+ runs).",
              "Stored with 90+ days of history in Supabase PostgreSQL with per-user row-level security (RLS).",
              "A Codemagic CI/CD pipeline runs on every merge, producing 64 builds and 4 App Store releases (v1.0–v1.3), with iOS builds and code-signing automated.",
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <a
              href="https://apps.apple.com/app/sammys-palate/id6806954658"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sammy's Palate on the App Store (opens in a new tab)"
              className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
            >
              App Store
              <ArrowUpRight size={14} aria-hidden />
            </a>
            <a
              href="https://ucsc-dining-tracker.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sammy's Palate live web demo (opens in a new tab)"
              className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
            >
              Live Web Demo
              <ArrowUpRight size={14} aria-hidden />
            </a>
            <a
              href="https://github.com/kunjalp/ucsc_dining_tracker"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sammy's Palate source on GitHub (opens in a new tab)"
              className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
            >
              GitHub
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <Metrics
            cols="sm:grid-cols-2"
            items={[
              ["80+", "downloads"],
              ["233K+", "menu records"],
              ["14", "dining halls"],
              ["4", "App Store releases"],
            ]}
          />
          <Tags
            items={["Next.js", "React", "TypeScript", "Supabase", "PostgreSQL", "Python", "Playwright", "Swift", "Capacitor (iOS)"]}
          />
        </div>
      </div>
    </ProjectCard>
  );
}
