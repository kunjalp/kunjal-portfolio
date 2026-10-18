import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function SammysPalate() {
  return (
    <Window title="sammys-palate/README.md">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle title="Sammy's Palate" meta={["UCSC dining tracker", "June 2026 – Present"]} />
          <Bullets
            items={[
              "Live on the App Store, plus a web demo.",
              "A scheduled Python/Playwright scraper parses every campus dining menu, with a name-based fallback.",
              "Row-level security (RLS) in the database keeps each person's data private.",
              "A Codemagic CI/CD pipeline builds, code-signs and ships each iOS update.",
            ]}
          />
        </div>
        <div className="space-y-4">
          <Metrics
            cols="sm:grid-cols-2"
            items={[
              ["60+", "App Store users"],
              ["14", "dining menus scraped"],
            ]}
          />
          <Tags
            items={["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Python", "Playwright", "Capacitor (iOS)"]}
          />
        </div>
      </div>
    </Window>
  );
}
