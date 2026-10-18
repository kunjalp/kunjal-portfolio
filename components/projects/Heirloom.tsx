import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function Heirloom() {
  return (
    <Window title="heirloom/README.md">
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <ProjectTitle title="Heirloom" meta={["AI multi-generational wealth platform", "October 2026"]} />
          <p className="inline-block rounded-md border-2 border-[rgb(var(--edge))] bg-[rgb(var(--accent)/0.15)] px-3 py-1 text-sm font-bold">
            1st place, Daytona track · SF Tech Week
          </p>
          <Bullets
            items={[
              "Won the Daytona track by iterating on live feedback from finance professionals.",
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
          <Tags
            items={["Next.js", "FastAPI", "PostgreSQL", "Neo4j", "Clerk", "Plaid", "Bright Data", "Daytona"]}
          />
        </div>
      </div>
    </Window>
  );
}
