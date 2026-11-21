"use client";

import { useRef, useState } from "react";

/**
 * A glass button that flips over (half a turn about its horizontal axis) when the pointer
 * arrives, showing an inverted face, and flips back when it leaves. Pointer devices only;
 * with reduced motion the face just swaps. The flip is a keyframe animation on transform,
 * so the button's box never changes size.
 */
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function FlipLink({ className = "", onPointerEnter, onPointerLeave, ...rest }: Props) {
  const [face, setFace] = useState<"" | "on" | "off">("");
  const hot = useRef(false);

  const enter = (e: React.PointerEvent<HTMLAnchorElement>) => {
    onPointerEnter?.(e);
    if (e.pointerType === "touch" || hot.current) return;
    hot.current = true;
    setFace("on");
  };
  const leave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    onPointerLeave?.(e);
    if (!hot.current) return;
    hot.current = false;
    setFace("off");
  };

  return (
    <a
      {...rest}
      className={`glass-btn flip-btn ${face === "on" ? "flip-on" : face === "off" ? "flip-off" : ""} ${className}`.trim()}
      onPointerEnter={enter}
      onPointerLeave={leave}
    />
  );
}
