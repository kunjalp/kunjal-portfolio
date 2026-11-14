"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import Window from "../Window";

/** Fired by the project index and the Journey buttons: open this project's details before scrolling to it. */
export const OPEN_PROJECT = "open-project-details";
export const openProjectDetails = (id: string) => window.dispatchEvent(new CustomEvent(OPEN_PROJECT, { detail: id }));

export type ProjectLink = { label: string; href: string; aria: string };

type Props = {
  /** Jump target for the project index, e.g. "project-heirloom". */
  id: string;
  /** Window title, written like a file path. */
  file: string;
  name: string;
  /** Role or kind of project. */
  what: string;
  when: string;
  /** One line a recruiter can read in a glance. */
  line: string;
  /** Two or three headline numbers. Every value must come from the resume or the full write-up. */
  metrics: [string, string][];
  links?: ProjectLink[];
  /** The full write-up, shown inside the same window once opened. */
  children: React.ReactNode;
};

/**
 * A project as a short card: title, one line, a few numbers and the proof links.
 * "cat details" swaps the summary for the full write-up inside the same window,
 * and the card then takes the full row so the write-up has room.
 */
export default function ProjectCard({ id, file, name, what, when, line, metrics, links = [], children }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const bodyId = useId();
  // set when the visitor used the toggle, so the card is kept in view after it changes size
  const settle = useRef(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) setOpen(true);
    };
    window.addEventListener(OPEN_PROJECT, onOpen);
    return () => window.removeEventListener(OPEN_PROJECT, onOpen);
  }, [id]);

  useEffect(() => {
    if (!settle.current) return;
    settle.current = false;
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // the card moved (it changed row or shrank above the fold): bring its top back under the menu bar
    if (r.top < 64 || r.top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + r.top - 80, behavior: "instant" });
    }
  }, [open]);

  const toggle = () => {
    settle.current = true;
    setOpen((o) => !o);
  };

  return (
    <div ref={wrap} id={id} className={`scroll-mt-24 ${open ? "lg:col-span-2" : ""}`}>
      <Window section="projects" title={file} onExpandedChange={(full) => full && setOpen(true)}>
        {open ? (
          <div id={bodyId}>{children}</div>
        ) : (
          <div id={bodyId} className="space-y-2.5 p-4 sm:p-5">
            <h3 className="text-[1.3rem] font-bold leading-tight tracking-[-0.01em]">{name}</h3>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-[0.9rem] font-semibold">{what}</span>
              <span className="font-mono text-xs text-muted">{when}</span>
            </p>
            <p className="text-[0.95rem] leading-snug">{line}</p>
            <dl className="grid grid-cols-3 gap-2">
              {metrics.map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.5)] px-2.5 py-1.5"
                >
                  <dd className="text-[1.05rem] font-extrabold leading-none">{v}</dd>
                  <dt className="mt-1 text-[0.72rem] leading-tight text-muted">{l}</dt>
                </div>
              ))}
            </dl>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={l.aria}
                    className="glass-btn !min-h-[36px] !px-2.5 !text-[0.78rem]"
                  >
                    {l.label}
                    <ArrowUpRight size={13} aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={`${open ? "Hide" : "Show"} details for ${name}`}
          className="card-toggle"
        >
          <span>
            <span aria-hidden className="mr-2 text-accent">
              $
            </span>
            {open ? "close details" : "cat details"}
          </span>
          <ChevronDown size={18} aria-hidden className={open ? "rotate-180" : ""} />
        </button>
      </Window>
    </div>
  );
}
