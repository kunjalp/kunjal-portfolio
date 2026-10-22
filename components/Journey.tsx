"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Car, ChevronLeft, ChevronRight, Code, Cpu, Radar, type LucideIcon } from "lucide-react";
import Window from "./Window";
import Track, { type TrackHandle } from "./journey/Track";
import { jumpTo } from "./ProjectIndex";
import Patch, { type PatchKind } from "./journey/Patch";
import { Tags } from "./projects/shared";

type Milestone = {
  id: string;
  short: string;
  period: string;
  title: string;
  blurb: string;
  tags: string[];
  icon: LucideIcon;
  patches: PatchKind[];
  /** project windows this stop opens onto: [label, element id] */
  projects: [string, string][];
};

const milestones: Milestone[] = [
  {
    id: "high-school",
    short: "High school",
    period: "2021 – 2025",
    title: "VEX Robotics and autonomous vehicles",
    blurb: "Got hooked on autonomous vehicles, and spent four years in VEX robotics, ending as president of a 30-member club.",
    tags: ["VEX VRC", "Autonomous vehicles", "Leadership"],
    icon: Car,
    patches: ["vex"],
    projects: [["VEX VRC Robotics", "project-vex"]],
  },
  {
    id: "cosmos",
    short: "COSMOS",
    period: "Jul – Aug 2024",
    title: "UC San Diego COSMOS",
    blurb: "Autonomous perception and mapping on a scaled autonomous vehicle.",
    tags: ["Python", "OpenCV", "ROS", "LiDAR", "GNSS", "Jetson Nano"],
    icon: Radar,
    patches: ["cosmos"],
    projects: [["Scaled Autonomous Vehicle", "project-cosmos"]],
  },
  {
    id: "formula-slug",
    short: "Formula Slug",
    period: "Oct 2025 – Present",
    title: "Formula Slug (FSAE)",
    blurb: "STM32 firmware for accumulator temperatures, CAN telemetry and the throttle map.",
    tags: ["STM32", "C/C++", "CAN Bus", "OneWire", "DS18B20"],
    icon: Cpu,
    patches: ["fsae"],
    projects: [["Formula Slug firmware", "project-formula-slug"]],
  },
  {
    id: "ucsc",
    short: "UCSC",
    period: "2026 – Present",
    title: "UCSC Leadership & Tech",
    blurb: "ACM Web Dev Lead, Sammy's Palate on the App Store, and 1st place in the Daytona track at SF Tech Week with Heirloom.",
    tags: ["Next.js", "TypeScript", "Supabase", "Capacitor"],
    icon: Code,
    patches: ["acm", "daytona"],
    projects: [
      ["Heirloom", "project-heirloom"],
      ["Sammy's Palate", "project-sammys"],
      ["ACM Web Redesign", "project-acm"],
    ],
  },
];

export default function Journey() {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const track = useRef<TrackHandle>(null);
  const last = milestones.length - 1;
  const current = milestones[active];

  const go = (i: number) => setActive(Math.min(Math.max(i, 0), last));

  return (
    <section id="journey" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[940px]">
        <Window section="journey" title="journey.map">
          <div className="px-5 pb-6 pt-7 sm:px-9 sm:pb-8 sm:pt-9">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:85%]">
              How I got here
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Four stops that shaped how I build. Take the wheel and drive: each checkpoint pops open as you
              reach it. Or just pick one and the car drives itself.
            </p>

            {/* Road with the car, then the checkpoint buttons */}
            <div className="mt-6">
              <Track
                ref={track}
                active={active}
                labels={milestones.map((m) => m.short)}
                onArrive={setActive}
                onEngage={setEngaged}
              />

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

              {/* hold-to-drive pedals; the hint changes once the scene has focus */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <Pedal dir={-1} track={track} label="Reverse">
                  <ChevronLeft size={18} aria-hidden />
                </Pedal>
                <p className="text-center font-mono text-[0.72rem] leading-snug text-muted" aria-live="polite">
                  {engaged ? (
                    <>
                      Driving. Hold <kbd className="pidx-kbd">→</kbd> / <kbd className="pidx-kbd">←</kbd> or scroll over the road.
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Click the road to take the wheel, or hold a pedal.</span>
                      <span className="sm:hidden">Hold a pedal to drive.</span>
                    </>
                  )}
                </p>
                <Pedal dir={1} track={track} label="Gas">
                  <ChevronRight size={18} aria-hidden />
                </Pedal>
              </div>
            </div>

            {/* Detail for the selected stop */}
            <div
              key={current.id}
              aria-live="polite"
              className="stop-win mt-6 overflow-hidden rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.45)] shadow-[4px_4px_0_rgb(var(--shadow)/0.85)]"
              style={{ ["--from" as string]: `${((active + 0.5) / milestones.length) * 100}%` }}
            >
              <div className="win-bar !cursor-default">
                <span aria-hidden className="win-dot win-dot-close !cursor-default" />
                <span aria-hidden className="win-dot win-dot-min !cursor-default" />
                <span aria-hidden className="win-dot win-dot-reset !cursor-default" />
                <span className="win-title-wrap">
                  <span className="win-title">{`stop-${active + 1}/${current.id}.md`}</span>
                </span>
                <span aria-hidden className="w-[3.1rem] flex-none" />
              </div>
              <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 pt-1">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">{current.title}</h3>
                  <p className="font-mono text-xs text-muted">{current.period}</p>
                </div>
                {/* earned patches, pressed on like iron-ons */}
                <div className="-mr-1 -mt-2 flex shrink-0 sm:-mr-2 sm:-mt-4">
                  {current.patches.map((k, i) => (
                    <Patch
                      key={k}
                      kind={k}
                      tilt={i % 2 ? 7 : -6}
                      className={`h-[68px] w-[68px] sm:h-[92px] sm:w-[92px] ${i ? "-ml-3" : ""}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-4 text-[1.05rem] leading-relaxed">{current.blurb}</p>

              <div className="mt-5">
                <Tags items={current.tags} label={current.id === "high-school" ? "Focus" : "Stack"} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {current.projects.map(([label, id]) => (
                  <button key={id} type="button" onClick={() => jumpTo(id)} className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]">
                    Open {label}
                    <ArrowUpRight size={14} aria-hidden />
                  </button>
                ))}
              </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => go(active - 1)}
                disabled={active === 0}
                className="glass-btn disabled:pointer-events-none disabled:opacity-40"
              >
                <ArrowLeft size={16} aria-hidden />
                <span>
                  Prev<span className="hidden sm:inline">ious stop</span>
                </span>
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
                <span>
                  Next<span className="hidden sm:inline"> stop</span>
                </span>
                <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        </Window>
      </div>
    </section>
  );
}

/** Hold to drive. Pointer events so it works the same with a mouse, a pen or a thumb. */
function Pedal({
  dir,
  track,
  label,
  children,
}: {
  dir: number;
  track: React.RefObject<TrackHandle>;
  label: string;
  children: React.ReactNode;
}) {
  const off = () => track.current?.press(0);
  return (
    <button
      type="button"
      aria-label={`${label} (hold)`}
      title={`${label} (hold)`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        track.current?.press(dir);
      }}
      onPointerUp={off}
      onPointerCancel={off}
      onLostPointerCapture={off}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          track.current?.press(dir);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") off();
      }}
      onContextMenu={(e) => e.preventDefault()}
      className="pedal glass-btn !min-h-[40px] shrink-0 !px-3 select-none"
    >
      {dir < 0 && children}
      <span className="text-[0.8rem]">{label}</span>
      {dir > 0 && children}
    </button>
  );
}
