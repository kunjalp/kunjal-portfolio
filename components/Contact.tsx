"use client";

import { useEffect, useRef, useState } from "react";
import Window from "./Window";

const EMAIL = "kunjalp126@gmail.com";
const LINKS = {
  linkedin: "https://www.linkedin.com/in/kunjalpurohit",
  github: "https://github.com/kunjalp",
  resume: "/Kunjal_Purohit_Resume.pdf",
};

type Line = { kind: "cmd" | "out" | "link" | "err"; text: string; href?: string };
type Mode = "cmd" | "name" | "email" | "msg";

const WHOAMI =
  "Kunjal Purohit. CS + CE double major at UC Santa Cruz (GPA 3.95). I build embedded firmware and full-stack software. Looking for SWE internships, summer 2027.";

const INITIAL: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: WHOAMI },
  { kind: "cmd", text: "ls links" },
  { kind: "link", text: "linkedin  → linkedin.com/in/kunjalpurohit", href: LINKS.linkedin },
  { kind: "link", text: "github    → github.com/kunjalp", href: LINKS.github },
  { kind: "link", text: `email     → ${EMAIL}`, href: `mailto:${EMAIL}` },
  { kind: "link", text: "resume    → Kunjal_Purohit_Resume.pdf", href: LINKS.resume },
  { kind: "out", text: "Type `contact` to write me a message, or `help` for all commands." },
];

const PROMPT: Record<Mode, string> = {
  cmd: "$",
  name: "name:",
  email: "your email:",
  msg: "message:",
};

export default function Contact() {
  const [lines, setLines] = useState<Line[]>(INITIAL);
  const [mode, setMode] = useState<Mode>("cmd");
  const [value, setValue] = useState("");
  const draft = useRef({ name: "", email: "", msg: "" });
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const add = (...l: Line[]) => setLines((p) => [...p, ...l]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    add({ kind: "cmd", text: raw });
    switch (cmd) {
      case "":
        break;
      case "help":
        add(
          { kind: "out", text: "whoami    short intro" },
          { kind: "out", text: "linkedin  github  email  resume" },
          { kind: "out", text: "contact   write me a message" },
          { kind: "out", text: "clear     clear the screen" },
        );
        break;
      case "whoami":
        add({ kind: "out", text: WHOAMI });
        break;
      case "linkedin":
        add({ kind: "link", text: "linkedin.com/in/kunjalpurohit", href: LINKS.linkedin });
        break;
      case "github":
        add({ kind: "link", text: "github.com/kunjalp", href: LINKS.github });
        break;
      case "email":
        add({ kind: "link", text: EMAIL, href: `mailto:${EMAIL}` });
        break;
      case "resume":
        add({ kind: "link", text: "Kunjal_Purohit_Resume.pdf (download)", href: LINKS.resume });
        break;
      case "contact":
        add({ kind: "out", text: "Starting message. Press Enter after each answer." });
        setMode("name");
        break;
      case "clear":
        setLines([]);
        break;
      default:
        add({ kind: "err", text: `command not found: ${raw.trim()}. Try \`help\`.` });
    }
  };

  const submit = () => {
    const v = value.trim();
    if (mode === "cmd") {
      run(value);
    } else if (mode === "name") {
      if (!v) return;
      draft.current.name = v;
      add({ kind: "cmd", text: `name: ${v}` });
      setMode("email");
    } else if (mode === "email") {
      if (!/^\S+@\S+\.\S+$/.test(v)) {
        add({ kind: "err", text: "That doesn't look like an email address. Try again." });
        return;
      }
      draft.current.email = v;
      add({ kind: "cmd", text: `your email: ${v}` });
      setMode("msg");
    } else {
      if (!v) return;
      const { name, email } = draft.current;
      add({ kind: "cmd", text: `message: ${v}` });
      const subject = `Portfolio message from ${name}`;
      const body = `${v}\n\n${name}\n${email}`;
      add({
        kind: "out",
        text: "Opening your email app with the message ready. Hit send there to deliver it.",
      });
      add({
        kind: "link",
        text: "Didn't open? Click here.",
        href: `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      });
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setMode("cmd");
    }
    setValue("");
  };

  const cls: Record<Line["kind"], string> = {
    cmd: "text-[rgb(var(--term-fg))]",
    out: "text-[rgb(var(--term-fg)/0.75)]",
    link: "text-[rgb(var(--g1))] underline underline-offset-2 hover:text-[rgb(var(--term-fg))]",
    err: "text-[rgb(var(--accent))]",
  };

  return (
    <section id="contact" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[860px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Contact
        </h2>
        <p className="mt-3 text-[1.05rem]">Click the terminal and type, or use the buttons.</p>

        <div className="mt-8">
          <Window title="kunjal@portfolio: ~/contact">
            <div
              className="bg-[rgb(var(--tire))] p-4 font-mono text-[0.85rem] leading-7 sm:p-5"
              onClick={() => input.current?.focus()}
            >
              <div ref={box} className="max-h-[420px] overflow-y-auto" role="log" aria-live="polite">
                {lines.map((l, i) => (
                  <p key={i} className={`whitespace-pre-wrap break-words ${cls[l.kind]}`}>
                    {l.kind === "cmd" && !/^(name|your email|message):/.test(l.text) && (
                      <span className="text-[rgb(var(--g1))]">$ </span>
                    )}
                    {l.kind === "link" && l.href ? (
                      <a
                        href={l.href}
                        {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        {...(l.href === LINKS.resume ? { download: true } : {})}
                      >
                        {l.text}
                      </a>
                    ) : (
                      l.text
                    )}
                  </p>
                ))}
              </div>

              <form
                noValidate
                className="mt-1 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <label htmlFor="term-input" className="shrink-0 text-[rgb(var(--g1))]">
                  {PROMPT[mode]}
                </label>
                <input
                  id="term-input"
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  type={mode === "email" ? "email" : "text"}
                  className="min-w-0 flex-1 bg-transparent text-[rgb(var(--term-fg))] caret-[rgb(var(--accent))] outline-none"
                  aria-label="Terminal input"
                />
              </form>

              <div className="mt-3 flex flex-wrap gap-2">
                {["whoami", "contact", "linkedin", "github", "resume", "clear"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (mode !== "cmd") setMode("cmd");
                      run(c);
                      input.current?.focus();
                    }}
                    className="rounded border border-[rgb(var(--term-fg)/0.35)] px-2 py-0.5 text-xs text-[rgb(var(--term-fg)/0.85)] hover:border-[rgb(var(--g1))] hover:text-[rgb(var(--g1))]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Window>
        </div>
      </div>
    </section>
  );
}
