"use client";

import { useEffect, useRef, useState } from "react";
import { Apple } from "lucide-react";
import { toggleGravity, useGravity } from "./gravity";

/** Navbar switch for gravity mode. A nod to Newton: the apple. */
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
        className={`menu-link grid h-9 w-9 place-items-center !p-0 ${on ? "gravity-on" : ""}`}
      >
        <Apple size={17} />
      </button>
      {hint && (
        <p role="status" className="gravity-hint">
          {on ? "Gravity on. Drag a window sideways or scroll fast." : "Gravity off."}
        </p>
      )}
    </div>
  );
}
