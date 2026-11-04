import Window from "../Window";
import OccupancyGrid from "./OccupancyGrid";
import { Bullets, Metrics, ProjectTitle, Tags } from "./shared";

export default function Cosmos() {
  return (
    <Window section="projects" title="cosmos/perception-and-mapping">
      <div className="grid items-start gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.25fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle title="Scaled Autonomous Vehicle" meta={["UC San Diego COSMOS", "July – August 2024"]} />
          <Bullets
            items={[
              "On a 5-person team, I wrote Python drivers for a LiDAR and a GNSS receiver and fused both into one log time-aligned at 0.05 s on a Jetson Nano, enabling 3 fully autonomous laps of a 1/10-scale car.",
              "Built occupancy-grid mapping, localization, and real-time OpenCV lane tracking and obstacle detection.",
              "Validated at 3 levels: simulated ground truth from a bicycle-model generator, an indoor hallway, and an outdoor courtyard.",
            ]}
          />
          <p className="text-sm text-muted">Try the occupancy grid: a robot builds a map by clearing the space it has seen.</p>
          <Metrics
            cols="sm:grid-cols-2"
            items={[
              ["3", "autonomous laps"],
              ["5", "person team"],
              ["0.05 s", "time-aligned log"],
              ["1/10", "scale car"],
            ]}
          />
          <Tags items={["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"]} />
        </div>
        <OccupancyGrid />
      </div>
    </Window>
  );
}
