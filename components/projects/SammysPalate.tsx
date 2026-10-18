import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function SammysPalate() {
  return (
    <Window title="sammys-palate/README.md">
      <div className="space-y-4 p-6 sm:p-7">
        <ProjectTitle title="Sammy's Palate" meta={["UCSC dining tracker", "June 2026 – Present"]} />
        <Metrics
          cols="sm:grid-cols-2"
          items={[
            ["60+", "App Store users"],
            ["14", "dining menus scraped"],
          ]}
        />
        <Bullets
          items={[
            "Live on the App Store, plus a web demo.",
            "A scheduled Python/Playwright scraper parses every campus dining menu, with a name-based fallback.",
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
  );
}
