"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "#journey", label: "Journey" },
  { href: "#projects", label: "Projects" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav
        aria-label="Primary"
        className="glass mx-auto max-w-5xl rounded-2xl"
      >
        <div className="flex h-14 items-center justify-between px-3">
          <a
            href="#top"
            className="flex min-h-[44px] items-center gap-2.5 font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgb(var(--g1)), rgb(var(--g2)) 55%, rgb(var(--g3)))",
              }}
            >
              KP
            </span>
            <span className="hidden sm:inline">Kunjal Purohit</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-fg/5 hover:text-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="glass-btn !min-h-[44px] !w-11 !px-0 md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <ul
            id="mobile-menu"
            className="grid gap-1 border-t border-fg/10 p-2 md:hidden"
          >
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center rounded-xl px-4 text-base transition hover:bg-fg/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
