import Window from "../Window";
import OccupancyGrid from "./OccupancyGrid";
import { Metrics, ProjectTitle, Tags } from "./shared";

export default function Cosmos() {
  return (
    <Window title="cosmos/perception-and-mapping">
      <div className="grid items-start gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.25fr] lg:gap-7">
        <div className="space-y-3">
          <ProjectTitle title="Scaled Autonomous Vehicle" meta={["UC San Diego COSMOS", "July – August 2024"]} />
          <p className="text-base leading-relaxed">
            Perception and mapping for a scaled autonomous vehicle. Try the occupancy grid: the way a
            robot builds a map is by clearing the space it has seen.
          </p>
          <Metrics
            cols="sm:grid-cols-2"
            items={[
              ["3", "autonomous laps"],
              ["5", "person team"],
            ]}
          />
          <Tags items={["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"]} />
        </div>
        <OccupancyGrid />
      </div>
    </Window>
  );
}
