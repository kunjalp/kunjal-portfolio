"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Car, Code, Cpu, Radar, type LucideIcon } from "lucide-react";
import Window from "./Window";
import Track from "./journey/Track";

type Milestone = {
  id: string;
  short: string;
  period: string;
  title: string;
  blurb: string;
  tags: string[];
  icon: LucideIcon;
};

const milestones: Milestone[] = [
  {
    id: "high-school",
    short: "VEX",
    period: "2021 – 2025",
    title: "VEX Robotics, club president",
    blurb: "Three seasons designing and programming robots, then ran a 30-member club with three teams.",
    tags: ["Robot design", "Autonomous routines", "Leadership"],
    icon: Car,
  },
  {
    id: "cosmos",
    short: "COSMOS",
    period: "Jul – Aug 2024",
    title: "UC San Diego COSMOS",
    blurb: "Autonomous perception and mapping on a scaled autonomous vehicle.",
    tags: ["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"],
    icon: Radar,
  },
  {
    id: "formula-slug",
    short: "Formula Slug",
    period: "Oct 2025 – Present",
    title: "Formula Slug (FSAE)",
    blurb: "STM32 firmware for accumulator temperatures, CAN telemetry and the throttle map.",
    tags: ["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"],
    icon: Cpu,
  },
  {
    id: "ucsc",
    short: "UCSC",
    period: "2026 – Present",
    title: "UCSC Leadership & Tech",
    blurb: "ACM Web Dev Lead, Sammy's Palate on the App Store, and 1st place in the Daytona track at SF Tech Week with Heirloom.",
    tags: ["Next.js", "TypeScript", "Supabase", "Capacitor"],
    icon: Code,
  },
];

export default function Journey() {
  const [active, setActive] = useState(0);
  const last = milestones.length - 1;
  const current = milestones[active];
  const Icon = current.icon;

  const go = (i: number) => setActive(Math.min(Math.max(i, 0), last));

  return (
    <section id="journey" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1040px]">
        <Window title="journey.map">
          <div className="px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:85%]">
              How I got here
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Four stops that shaped how I build. Pick a checkpoint and the car drives you there.
            </p>

            {/* Road with the car, then the checkpoint buttons */}
            <div className="mt-6">
              <Track active={active} />

              <ol
                className="relative grid grid-cols-4"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") go(active + 1);
                  if (e.key === "ArrowLeft") go(active - 1);
                }}
              >
                {milestones.map((m, i) => {
                  const NodeIcon = m.icon;
                  const isActive = i === active;
                  const isPast = i < active;
                  return (
                    <li key={m.id} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`${m.title}, ${m.period}`}
                        className="group flex min-h-[86px] w-full flex-col items-center gap-1.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <span
                          className={`relative grid h-11 w-11 place-items-center rounded-full border-2 border-[rgb(var(--edge))] transition duration-200 ${
                            isActive
                              ? "scale-110 bg-accent text-[rgb(var(--paper))] shadow-[3px_3px_0_rgb(var(--shadow))]"
                              : isPast
                                ? "bg-[rgb(var(--paper2))] text-accent"
                                : "bg-[rgb(var(--paper))] text-muted group-hover:text-fg"
                          }`}
                        >
                          <NodeIcon size={18} aria-hidden />
                        </span>
                        <span
                          className={`px-1 text-center text-[0.8rem] leading-tight ${
                            isActive ? "font-bold text-fg" : "text-muted"
                          }`}
                        >
                          {m.short}
                        </span>
                        <span className="font-mono text-[0.65rem] text-muted">{m.period}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Detail for the selected stop */}
            <div
              key={current.id}
              aria-live="polite"
              className="fade-up mt-6 rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)] p-5 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper))] text-accent">
                  <Icon size={22} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">{current.title}</h3>
                  <p className="font-mono text-xs text-muted">{current.period}</p>
                </div>
              </div>

              <p className="mt-4 text-[1.05rem] leading-relaxed">{current.blurb}</p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {current.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border-[1.5px] border-[rgb(var(--edge)/0.5)] bg-[rgb(var(--paper))] px-2.5 py-0.5 font-mono text-xs"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => go(active - 1)}
                disabled={active === 0}
                className="glass-btn disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowLeft size={16} aria-hidden />
                Previous stop
              </button>
              <span className="font-mono text-sm tabular-nums text-muted">
                {active + 1} of {milestones.length}
              </span>
              <button
                type="button"
                onClick={() => go(active + 1)}
                disabled={active === last}
                className="glass-btn disabled:pointer-events-none disabled:opacity-40"
              >
                Next stop
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        </Window>
      </div>
    </section>
  );
}
