"use client";

import { useEffect, useState } from "react";

/** One small toast at a time, bottom center. Call toast("...") from anywhere. */

const EVT = "kp-toast";
export const toast = (text: string) => window.dispatchEvent(new CustomEvent(EVT, { detail: text }));

/** Copy text to the clipboard, with a fallback for browsers that block the async API. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function Toaster() {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      clearTimeout(t);
      setMsg((m) => ({ text: (e as CustomEvent<string>).detail, n: (m?.n ?? 0) + 1 }));
      t = setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener(EVT, on);
    return () => {
      window.removeEventListener(EVT, on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[4000] flex justify-center px-4">
      {msg && (
        <p key={msg.n} role="status" className="kp-toast">
          {msg.text}
        </p>
      )}
    </div>
  );
}

/** ↑ ↑ ↓ ↓ ← → ← → B A: every window does a barrel roll. */
export function Konami() {
  useEffect(() => {
    const code = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let i = 0;
    const on = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      i = k === code[i] ? i + 1 : k === code[0] ? 1 : 0;
      if (i < code.length) return;
      i = 0;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        document.body.classList.remove("konami");
        void document.body.offsetWidth;
        document.body.classList.add("konami");
        setTimeout(() => document.body.classList.remove("konami"), 1400);
      }
      toast("Cheat code accepted. +30 lives, and every window does a barrel roll.");
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  return null;
}
