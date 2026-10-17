"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Car, Code, Cpu, Radar, type LucideIcon } from "lucide-react";

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
    id: "hs",
    short: "High school",
    period: "High School",
    title: "Autonomous Vehicles",
    blurb: "Where I got hooked on building real things.",
    tags: ["Autonomous vehicles"],
    icon: Car,
  },
  {
    id: "cosmos",
    short: "COSMOS",
    period: "2024",
    title: "UC San Diego COSMOS",
    blurb: "Autonomous perception and mapping on a scaled autonomous vehicle.",
    tags: ["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"],
    icon: Radar,
  },
  {
    id: "fslug",
    short: "Formula Slug",
    period: "2025 – Present",
    title: "Formula Slug (FSAE)",
    blurb: "Embedded firmware and thermal safety for the accumulator.",
    tags: ["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"],
    icon: Cpu,
  },
  {
    id: "ucsc",
    short: "UCSC",
    period: "2026 – Present",
    title: "UCSC Leadership & Tech",
    blurb: "ACM Web Dev Lead, Sammy's Palate, and hackathons.",
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
    <section id="journey" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted">
          The journey
        </p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          How I got <span className="text-sunset">here</span>.
        </h2>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Four stops that shaped how I build. Tap any stop to open it.
        </p>

        {/* Track */}
        <ol
          className="relative mt-12 grid grid-cols-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(active + 1);
            if (e.key === "ArrowLeft") go(active - 1);
          }}
        >
          <div
            aria-hidden
            className="absolute inset-x-[12.5%] top-[21px] h-0.5 rounded-full bg-fg/15"
          >
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${(active / last) * 100}%`,
                backgroundImage:
                  "linear-gradient(90deg, rgb(var(--g1)), rgb(var(--g2)) 60%, rgb(var(--g3)))",
              }}
            />
          </div>

          {milestones.map((m, i) => {
            const NodeIcon = m.icon;
            const isActive = i === active;
            const isPast = i < active;
            return (
              <li key={m.id} className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${m.title}, ${m.period}`}
                  className="group flex w-full min-h-[88px] flex-col items-center gap-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full border transition duration-200 ${
                      isActive
                        ? "scale-110 border-transparent bg-accent text-bg shadow-lg"
                        : isPast
                          ? "border-accent/30 bg-accent/15 text-accent"
                          : "glass text-muted group-hover:text-fg"
                    }`}
                  >
                    <NodeIcon size={18} aria-hidden />
                  </span>
                  <span
                    className={`px-1 text-center text-[0.7rem] leading-tight transition sm:text-xs ${
                      isActive ? "font-semibold text-fg" : "text-muted"
                    }`}
                  >
                    {m.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Detail */}
        <div
          key={current.id}
          aria-live="polite"
          className="glass fade-up mt-6 rounded-3xl p-5 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
              <Icon size={22} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
                {current.period}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-3xl">
                {current.title}
              </h3>
            </div>
          </div>

          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {current.blurb}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {current.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-fg/10 bg-fg/5 px-3 py-1 font-mono text-xs"
              >
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="glass-btn disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft size={16} aria-hidden />
              Prev
            </button>
            <span className="text-sm tabular-nums text-muted">
              {active + 1} / {milestones.length}
            </span>
            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === last}
              className="glass-btn disabled:pointer-events-none disabled:opacity-40"
            >
              Next
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
