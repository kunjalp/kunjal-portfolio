import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function AcmWebLead() {
  return (
    <Window title="acm-ucsc/web-lead.md">
      <div className="space-y-4 p-6 sm:p-7">
        <ProjectTitle title="ACM at UCSC: Web Redesign" meta={["Web Development Lead", "August 2026 – Present"]} />
        <p className="text-[1.05rem] leading-relaxed">
          I lead a team of 4 developers through a full redesign of the club&apos;s website, splitting the work
          across content, navigation, responsive UI and backend authentication.
        </p>
        <Bullets
          items={[
            "Directing the redesign's features: member login with sessions, a unified nav bar, a mobile-responsive layout, a redesigned events page, and a refreshed Meet the Board section.",
            "Weekly meetings to assign tasks and keep releases on schedule, with progress reported to the executive board.",
          ]}
        />
        <Metrics
          cols="sm:grid-cols-2"
          items={[
            ["4", "developers led"],
            ["5", "features directed"],
          ]}
        />
        <Tags label="Skills" items={["Team leadership", "Authentication", "Responsive UI"]} />
      </div>
    </Window>
  );
}
