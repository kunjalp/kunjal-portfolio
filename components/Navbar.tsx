"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, FileText, Menu, Mountain, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import GravityToggle from "./GravityToggle";
import { toggleGravity, useGravity } from "./gravity";
import MotionToggle from "./MotionToggle";
import { ProjectIndexButton } from "./ProjectIndex";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#journey", label: "Journey" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const RESUME = "/Kunjal_Purohit_Resume.pdf";

/** Link text whose letters roll up on hover, each a beat after the last. Screen readers get the plain label. */
function Roll({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="roll">
        {Array.from(text).map((c, i) => (
          <span key={i} className="roll-c" data-c={c === " " ? "\u00a0" : c} style={{ "--i": i } as React.CSSProperties}>
            {c === " " ? "\u00a0" : c}
          </span>
        ))}
      </span>
    </>
  );
}

/** Desktop-style clock, always Pacific time (mine, not the visitor's), labelled PST/PDT. Rendered after mount only. */
function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: "America/Los_Angeles",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <span className="hidden font-mono text-xs tabular-nums lg:inline" title="Pacific time">
      {now}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const gravityOn = useGravity();

  return (
    <header className="menubar fixed inset-x-0 top-0 z-50">
      <nav aria-label="Primary" className="mx-auto flex h-12 max-w-[1400px] items-center gap-1 px-3 sm:gap-2 sm:px-6">
        <a
          href="#top"
          className="menu-link flex items-center gap-2 !px-1.5 font-bold sm:mr-2 sm:!px-2"
          onClick={() => setOpen(false)}
        >
          <Mountain size={18} strokeWidth={2.4} aria-hidden />
          <Roll text="Kunjal Purohit" />
        </a>

        <ul className="hidden items-center md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="menu-link">
                <Roll text={l.label} />
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-3">
          <Clock />
          <a
            href={RESUME}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume, PDF (opens in a new tab)"
            className="nav-resume mr-1 flex sm:mr-0"
          >
            <FileText size={15} strokeWidth={2.2} aria-hidden className="hidden sm:block" />
            Resume
          </a>
          <ProjectIndexButton />
          <MotionToggle />
          {/* on phones the gravity switch lives in the menu, so Resume gets the room up here */}
          <div className="hidden md:block">
            <GravityToggle />
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="glass-btn !min-h-[36px] !w-9 !px-0 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="grid gap-1 border-t-2 border-[rgb(var(--edge))] p-2 md:hidden">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="menu-link flex min-h-[44px] items-center"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={RESUME}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="menu-link flex min-h-[44px] items-center gap-2 font-bold"
            >
              <FileText size={16} strokeWidth={2.2} aria-hidden />
              Resume (PDF)
            </a>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                toggleGravity();
                setOpen(false);
              }}
              aria-pressed={gravityOn}
              className="menu-link flex min-h-[44px] w-full items-center gap-2 text-left"
            >
              <ArrowDownToLine size={16} strokeWidth={2.2} aria-hidden />
              Gravity mode: {gravityOn ? "on" : "off"}
            </button>
          </li>
        </ul>
      )}
    </header>
  );
}
