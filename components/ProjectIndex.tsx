"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Search } from "lucide-react";

/**
 * Project index: Cmd/Ctrl+K (or the nav button, or `projects` in the terminal) opens
 * a searchable grid of every project. Pick one and the page scrolls to its window,
 * which flashes so you can see where you landed.
 */

export const OPEN_INDEX = "open-project-index";
export const openProjectIndex = () => window.dispatchEvent(new Event(OPEN_INDEX));

type Entry = { id: string; name: string; what: string; when: string; line: string; keys: string };

export const PROJECTS: Entry[] = [
  { id: "project-heirloom", name: "Heirloom", what: "AI wealth platform", when: "Oct 2026", line: "1st place, Daytona track at SF Tech Week.", keys: "nextjs fastapi neo4j ai agents hackathon" },
  { id: "project-formula-slug", name: "Formula Slug", what: "Vehicle firmware, FSAE", when: "Oct 2025 – Present", line: "STM32 firmware, CAN telemetry and the throttle map.", keys: "stm32 c++ can embedded race car" },
  { id: "project-cosmos", name: "Scaled Autonomous Vehicle", what: "UC San Diego COSMOS", when: "Jul – Aug 2024", line: "LiDAR and GNSS drivers, occupancy-grid mapping.", keys: "python ros lidar opencv mapping" },
  { id: "project-sammys", name: "Sammy's Palate", what: "UCSC dining tracker", when: "Jun 2026 – Present", line: "On the App Store, 60+ users, 14 menus scraped.", keys: "ios supabase postgres playwright app" },
  { id: "project-acm", name: "ACM Web Redesign", what: "Web Development Lead", when: "Aug 2026 – Present", line: "Leading 4 developers through 5 features.", keys: "web team auth leadership" },
  { id: "project-vex", name: "VEX VRC Robotics", what: "Club President, mechanical builder", when: "2021 – 2025", line: "Drivetrains, flywheels and intakes, 3 teams.", keys: "robotics mechanical vex" },
];

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const win = el.querySelector<HTMLElement>(".win");
  if (win) {
    win.classList.remove("win-flash");
    void win.offsetWidth; // restart the animation
    win.classList.add("win-flash");
    setTimeout(() => win.classList.remove("win-flash"), 1600);
    win.querySelector<HTMLElement>(".win-bar")?.focus({ preventScroll: true });
  }
}

export default function ProjectIndex() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setQ("");
    setSel(0);
    setOpen(true);
  }, []);
  const hide = useCallback((restore = true) => {
    setOpen(false);
    if (restore) opener.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (o) return false;
          opener.current = document.activeElement as HTMLElement | null;
          setQ("");
          setSel(0);
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_INDEX, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_INDEX, show);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PROJECTS;
    return PROJECTS.filter((p) => `${p.name} ${p.what} ${p.line} ${p.keys}`.toLowerCase().includes(t));
  }, [q]);

  const pick = (p: Entry) => {
    hide(false);
    // wait a frame so the overlay is gone before scrolling
    requestAnimationFrame(() => jumpTo(p.id));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cols = window.innerWidth >= 640 ? 2 : 1;
    const move: Record<string, number> = { ArrowDown: cols, ArrowUp: -cols, ArrowRight: 1, ArrowLeft: -1 };
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "Enter" && list[sel]) {
      e.preventDefault();
      pick(list[sel]);
    } else if (move[e.key] !== undefined && list.length) {
      // left/right only move the selection when the search box is empty, so the caret still works
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && q) return;
      e.preventDefault();
      setSel((s) => (s + move[e.key] + list.length) % list.length);
    }
  };

  if (!open) return null;
  return (
    <div className="pidx-backdrop" onMouseDown={() => hide()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Project index"
        className="pidx win"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="win-bar !cursor-default">
          <span aria-hidden className="win-dot win-dot-close !cursor-default" />
          <span aria-hidden className="win-dot win-dot-min !cursor-default" />
          <span aria-hidden className="win-dot win-dot-reset !cursor-default" />
          <span className="win-title-wrap">
            <span className="win-title">projects/index</span>
          </span>
          <span aria-hidden className="w-[3.1rem] flex-none" />
        </div>
        <label className="flex items-center gap-3 border-b-2 border-[rgb(var(--edge)/0.25)] px-5 py-3">
          <Search size={18} aria-hidden className="text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            placeholder="Search projects, or try “lidar”, “ios”, “c++”"
            aria-label="Search projects"
            aria-controls="pidx-list"
            aria-activedescendant={list[sel] ? `pidx-${list[sel].id}` : undefined}
            className="w-full bg-transparent text-[1.05rem] outline-none placeholder:text-muted"
          />
          <kbd className="pidx-kbd">esc</kbd>
        </label>
        <ul id="pidx-list" role="listbox" aria-label="Projects" className="grid max-h-[60vh] gap-3 overflow-auto p-4 sm:grid-cols-2">
          {list.map((p, i) => (
            <li
              key={p.id}
              id={`pidx-${p.id}`}
              role="option"
              aria-selected={i === sel}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(p)}
              className={`pidx-item ${i === sel ? "is-sel" : ""}`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[1.05rem] font-bold leading-tight">{p.name}</span>
                {i === sel && <CornerDownLeft size={15} aria-hidden className="shrink-0 text-accent" />}
              </span>
              <span className="mt-0.5 block text-sm font-semibold">{p.what}</span>
              <span className="block font-mono text-xs text-muted">{p.when}</span>
              <span className="mt-1.5 block text-sm leading-snug">{p.line}</span>
            </li>
          ))}
          {!list.length && (
            <li className="col-span-full px-2 py-6 text-center text-muted">
              No project matches “{q}”. Try a language or tool name.
            </li>
          )}
        </ul>
        <p className="hidden flex-wrap gap-x-4 gap-y-1 border-t-2 sm:flex border-[rgb(var(--edge)/0.25)] px-5 py-2.5 font-mono text-xs text-muted">
          <span>
            <kbd className="pidx-kbd">↑</kbd> <kbd className="pidx-kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="pidx-kbd">enter</kbd> open
          </span>
          <span>
            <kbd className="pidx-kbd">⌘K</kbd> / <kbd className="pidx-kbd">ctrl K</kbd> toggle
          </span>
        </p>
      </div>
    </div>
  );
}

/** Nav button that opens the index; shows the shortcut on wide screens. */
export function ProjectIndexButton() {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return (
    <button
      type="button"
      onClick={openProjectIndex}
      aria-label="Open project index"
      title={`Project index (${mac ? "⌘" : "Ctrl+"}K)`}
      className="menu-link hidden h-9 items-center gap-1.5 !px-2.5 sm:flex"
    >
      <Search size={16} strokeWidth={2.2} aria-hidden />
      <span className="hidden lg:inline">
        <kbd className="pidx-kbd">{mac ? "⌘K" : "Ctrl K"}</kbd>
      </span>
    </button>
  );
}
