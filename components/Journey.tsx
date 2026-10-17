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
    id: "high-school",
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
    id: "formula-slug",
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

// Trace geometry in a 800x44 box. Pads sit at x = 100, 300, 500, 700 (y = 22),
// matching the centers of the four equal columns. Between pads the trace
// jogs up or down with 45-degree chamfers, like a PCB route.
const TRACE =
  "M100 22 H122 L136 36 H264 L278 22 H322 L336 8 H464 L478 22 H522 L536 36 H664 L678 22 H700";

export default function Journey() {
  const [active, setActive] = useState(0);
  const last = milestones.length - 1;
  const current = milestones[active];
  const Icon = current.icon;

  const go = (i: number) => setActive(Math.min(Math.max(i, 0), last));
  const clipWidth = 100 + (active / last) * 600;

  return (
    <section id="journey" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-3 font-mono text-sm text-muted sm:text-base">
          <span className="text-accent">//</span> the trail
        </p>
        <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          How I got <span className="text-sunset">here</span>.
        </h2>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Four stops that shaped how I build. Tap any waypoint to open it.
        </p>

        {/* Trail / circuit trace */}
        <div className="relative mt-12">
          <svg
            aria-hidden
            viewBox="0 0 800 44"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-0 h-11 w-full"
          >
            <defs>
              <linearGradient
                id="trace-grad"
                gradientUnits="userSpaceOnUse"
                x1="100"
                x2="700"
                y1="0"
                y2="0"
              >
                <stop offset="0" style={{ stopColor: "rgb(var(--g1))" }} />
                <stop offset="0.55" style={{ stopColor: "rgb(var(--g2))" }} />
                <stop offset="1" style={{ stopColor: "rgb(var(--g3))" }} />
              </linearGradient>
              <clipPath id="trace-clip">
                <rect
                  x="0"
                  y="0"
                  height="44"
                  style={{ width: clipWidth, transition: "width 0.3s ease-out" }}
                />
              </clipPath>
            </defs>
            {/* unwalked trail: dotted */}
            <path
              d={TRACE}
              fill="none"
              stroke="rgb(var(--fg) / 0.35)"
              strokeWidth="3"
              strokeDasharray="1 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* walked trail: solid trace */}
            <path
              d={TRACE}
              fill="none"
              stroke="url(#trace-grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              clipPath="url(#trace-clip)"
            />
          </svg>

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
                    className="group flex min-h-[96px] w-full flex-col items-center gap-1.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span
                      className={`relative grid h-11 w-11 place-items-center rounded-full border-2 transition duration-200 ${
                        isActive
                          ? "scale-110 border-accent bg-accent text-bg shadow-lg"
                          : isPast
                            ? "border-accent bg-accent/20 text-accent"
                            : "glass text-muted group-hover:text-fg"
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full border-2 border-accent/60 motion-safe:animate-ping"
                        />
                      )}
                      <NodeIcon size={18} aria-hidden />
                    </span>
                    <span
                      className={`px-1 text-center text-[0.7rem] leading-tight sm:text-xs ${
                        isActive ? "font-semibold text-fg" : "text-muted"
                      }`}
                    >
                      {m.short}
                    </span>
                    <span className="font-mono text-[0.6rem] text-muted/80">
                      WP {String(i + 1).padStart(2, "0")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Detail, styled as a window */}
        <div
          key={current.id}
          aria-live="polite"
          className="glass fade-up mt-4 overflow-hidden rounded-3xl"
        >
          <div className="flex items-center gap-2 border-b border-fg/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[rgb(var(--g3))]" />
            <span className="h-3 w-3 rounded-full bg-[rgb(var(--g2))]" />
            <span className="h-3 w-3 rounded-full bg-[rgb(var(--g1))]" />
            <span className="ml-2 truncate font-mono text-xs text-muted">
              ~/trail/{current.id}.log
            </span>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent">
                <Icon size={22} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent sm:text-sm">
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
              <span className="font-mono text-sm tabular-nums text-muted">
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
      </div>
    </section>
  );
}
