"use client";

import { useEffect, useState } from "react";
import { Menu, Mountain, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import GravityToggle from "./GravityToggle";
import { ProjectIndexButton } from "./ProjectIndex";

const links = [
  { href: "#projects", label: "Projects" },
  { href: "#journey", label: "Journey" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

/** Desktop-style clock in Santa Cruz time. Rendered after mount only. */
function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Los_Angeles",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <span className="hidden font-mono text-xs tabular-nums lg:inline" title="Santa Cruz, CA">
      Santa Cruz {now}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="menubar fixed inset-x-0 top-0 z-50">
      <nav aria-label="Primary" className="mx-auto flex h-12 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <a
          href="#top"
          className="menu-link mr-2 flex items-center gap-2 !px-2 font-bold"
          onClick={() => setOpen(false)}
        >
          <Mountain size={18} strokeWidth={2.4} aria-hidden />
          Kunjal Purohit
        </a>

        <ul className="hidden items-center md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="menu-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-3">
          <Clock />
          <ProjectIndexButton />
          <GravityToggle />
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
        </ul>
      )}
    </header>
  );
}
