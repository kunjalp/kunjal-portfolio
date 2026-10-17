"use client";

import { useEffect, useState } from "react";

type Frame = { n: number; temp: number };

export default function CanTicker() {
  const [frames, setFrames] = useState<Frame[]>([]);

  useEffect(() => {
    let n = 0;
    let temp = 42.3;
    const push = () => {
      temp = Math.min(46, Math.max(39, temp + (Math.random() - 0.5) * 0.8));
      n += 1;
      setFrames((f) => [...f.slice(-5), { n, temp }]);
    };
    push();
    const id = setInterval(push, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p className="flex items-center gap-2 font-mono text-xs text-muted">
        <span className="live-dot" aria-hidden />
        Simulated CAN bus feed (not live car data)
      </p>
      <div
        role="log"
        aria-label="Simulated CAN telemetry"
        className="mt-3 rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))] p-4 font-mono text-[0.82rem] leading-7 text-[rgb(var(--paper))]"
      >
        {frames.map((f, i) => (
          <p key={f.n} style={{ opacity: i === frames.length - 1 ? 1 : 0.3 + (i / frames.length) * 0.4 }}>
            <span className="text-[rgb(var(--g1))]">ID: 0x401</span> | Temp: {f.temp.toFixed(1)}°C | Status:{" "}
            <span className="text-[rgb(var(--g1))]">OK</span>
          </p>
        ))}
      </div>
    </div>
  );
}
