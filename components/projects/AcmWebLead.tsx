import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function AcmWebLead() {
  return (
    <Window section="projects" title="acm-ucsc/web-lead.md">
      <div className="space-y-3 p-5 sm:p-6">
        <ProjectTitle title="ACM at UCSC: Web Redesign" meta={["Web Development Lead", "August 2026 – Present"]} />
        <p className="text-base leading-relaxed">
          I lead a 4-person team rebuilding the website of UCSC&apos;s largest CS club in Next.js, TypeScript and
          Tailwind.
        </p>
        <Bullets
          items={[
            "Built the shared UI baseline, laid the member-login foundation, and redesigned the Events page for 15+ events.",
            "Wrote a UI handoff guide so teammates can build in their own areas without inventing new styles.",
          ]}
        />
        <Metrics
          cols="sm:grid-cols-2"
          items={[
            ["4", "person team led"],
            ["15+", "events on the new Events page"],
          ]}
        />
        <Tags label="Skills" items={["Next.js", "TypeScript", "Tailwind CSS", "Team leadership"]} />
      </div>
    </Window>
  );
}
