"use client";

import { useState } from "react";
import GameField from "./vex/GameField";
import Mechanisms from "./vex/Mechanisms";
import TabBar from "./vex/TabBar";

const VIEWS = [
  { id: "field", label: "Game field" },
  { id: "mech", label: "What I built" },
] as const;

export default function VexWorkshop() {
  const [tab, setTab] = useState<(typeof VIEWS)[number]["id"]>("field");
  return (
    <div>
      <TabBar
        label="VEX views"
        tabs={VIEWS}
        value={tab}
        onChange={setTab}
        size="md"
        nowrap
      />
      <div className="mt-4">{tab === "field" ? <GameField /> : <Mechanisms />}</div>
      <p className="mt-3 font-mono text-xs text-muted">Simplified drawings, not my actual robots.</p>
    </div>
  );
}
