import Window from "../Window";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function Heirloom() {
  return (
    <Window section="projects" title="heirloom/README.md">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          <ProjectTitle title="Heirloom" meta={["AI multi-generational wealth platform", "October 2026"]} />
          <p className="inline-block rounded-md border-2 border-[rgb(var(--edge))] bg-[rgb(var(--accent)/0.15)] px-3 py-1 text-sm font-bold">
            1st place, Daytona track · SF Tech Week
          </p>
          <Bullets
            items={[
              "Won 1st place in the Daytona track (20 teams, $250 prize) at SF Tech Week, building a multi-generational AI wealth platform in 12 hours with 3 AI agents, a Neo4j knowledge graph and Plaid.",
              "Designed a pipeline of 3 AI agents (intake, analyst, advisor) over 8 deterministic checks that flags conflicts between parents' finances and heirs' goals and routes urgent cases to the wealth manager.",
              "Built two-layer data isolation so advisors see only their own firm's clients (row-level security plus org scoping on 16 tables).",
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
