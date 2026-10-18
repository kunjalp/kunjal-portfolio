"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { toggleGravity, useGravity } from "./gravity";

/** Navbar switch for gravity mode: a down arrow plus the word, so it explains itself. */
export default function GravityToggle() {
  const on = useGravity();
  const [hint, setHint] = useState(false);
  const first = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    clearTimeout(timer.current);
    setHint(true);
    timer.current = setTimeout(() => setHint(false), 3800);
    return () => clearTimeout(timer.current);
  }, [on]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggleGravity()}
        aria-pressed={on}
        aria-label={on ? "Turn gravity mode off" : "Turn gravity mode on: windows hang and swing"}
        title={on ? "Gravity: on" : "Gravity mode"}
        className={`menu-link flex h-9 items-center gap-1.5 !px-2.5 ${on ? "gravity-on" : ""}`}
      >
        <ArrowDownToLine size={16} strokeWidth={2.2} aria-hidden />
        <span className="hidden text-sm font-semibold lg:inline">Gravity</span>
      </button>
      {hint && (
        <p role="status" className="gravity-hint">
          {on ? "Gravity on. Drag a window sideways or scroll fast." : "Gravity off."}
        </p>
      )}
    </div>
  );
}
