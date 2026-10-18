import Window from "../Window";
import OccupancyGrid from "./OccupancyGrid";
import { Metrics, ProjectTitle, Tags } from "./shared";

export default function Cosmos() {
  return (
    <Window title="cosmos/perception-and-mapping">
      <div className="space-y-4 p-6 sm:p-7">
        <ProjectTitle title="Scaled Autonomous Vehicle" meta="UC San Diego COSMOS · 2024" />
        <p className="text-[1.05rem] leading-relaxed">
          Perception and mapping for a scaled autonomous vehicle. Try the occupancy grid below: the way a
          robot builds a map is by clearing the space it has seen.
        </p>
        <OccupancyGrid />
        <Metrics
          cols="sm:grid-cols-2"
          items={[
            ["3", "autonomous laps"],
            ["5", "person team"],
          ]}
        />
        <Tags items={["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"]} />
      </div>
    </Window>
  );
}
