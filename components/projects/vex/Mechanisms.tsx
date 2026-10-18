"use client";

import { useState } from "react";
import TabBar from "./TabBar";
import Drivetrain from "./Drivetrain";
import Flywheel from "./Flywheel";
import Intake from "./Intake";

const MECH = [
  { id: "drive", label: "Drivetrain", El: Drivetrain },
  { id: "fly", label: "Flywheel", El: Flywheel },
  { id: "intake", label: "Intake", El: Intake },
] as const;

export default function Mechanisms() {
  const [m, setM] = useState(0);
  const El = MECH[m].El;
  return (
    <div>
      <TabBar label="Mechanism" tabs={MECH.map((x, i) => ({ id: i, label: x.label }))} value={m} onChange={setM} />
      <div className="mt-3">
        <El />
      </div>
    </div>
  );
}
