import Window from "../Window";
import VexWorkshop from "./VexWorkshop";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function VexRobotics() {
  return (
    <Window title="vex-vrc/leadership.txt">
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <ProjectTitle title="VEX VRC Robotics" meta="Fremont, CA · Jul 2021 – May 2025 · Club President" />
          <p className="text-[1.05rem] leading-relaxed">
            I was a mechanical builder: I figured out the components and built drivetrains, flywheels and
            intake systems, and sometimes helped with autonomous code. After three seasons on the technical
            team I was elected president. Every year meant a new game and a robot built from scratch.
          </p>
          <Bullets
            items={[
              "Structured the club into three competitive teams and coordinated build schedules, testing and competition readiness.",
              "Owned a $3,000+ annual budget from student fees and local sponsors, deciding which team's needs came first when money was tight.",
              "Created pathways for girls in the club to take on technical and leadership roles instead of support roles.",
              "Stayed hands-on with hardware and software the whole time.",
            ]}
          />
          <Tags
            items={[
              "Mechanical design",
              "Drivetrains",
              "Flywheels",
              "Intakes",
              "Autonomous code",
              "Budgeting",
              "Leadership",
            ]}
          />
        </div>
        <div className="space-y-5">
          <VexWorkshop />
          <Metrics
            items={[
              ["~30", "members led"],
              ["3", "competitive teams"],
              ["$3,000+", "annual budget"],
              ["2", "teams qualified for State"],
            ]}
          />
        </div>
      </div>
    </Window>
  );
}
