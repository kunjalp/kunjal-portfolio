"use client";

import { useRef, useState } from "react";

/**
 * A glass button that flips over once (half a turn about its vertical axis, like a coin) when
 * the pointer arrives, landing on an inverted face. Leaving just returns it to normal, no second flip. Pointer devices only;
 * with reduced motion the face just swaps. The flip is a keyframe animation on transform,
 * so the button's box never changes size.
 */
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function FlipLink({ className = "", onPointerEnter, onPointerLeave, ...rest }: Props) {
  const [face, setFace] = useState<"" | "on">("");
  const hot = useRef(false);

  const enter = (e: React.PointerEvent<HTMLSpanElement>) => {
    onPointerEnter?.(e as unknown as React.PointerEvent<HTMLAnchorElement>);
    if (e.pointerType === "touch" || hot.current) return;
    hot.current = true;
    setFace("on");
  };
  const leave = (e: React.PointerEvent<HTMLSpanElement>) => {
    onPointerLeave?.(e as unknown as React.PointerEvent<HTMLAnchorElement>);
    if (!hot.current) return;
    hot.current = false;
    setFace(""); // no flip back: the button just returns to its normal face
  };

  // The pointer is tracked on a still wrapper: while the button itself is turned edge-on it is
  // briefly not under the pointer, and listening on it would end the hover mid-flip.
  return (
    <span className="inline-flex" onPointerEnter={enter} onPointerLeave={leave}>
      <a
        {...rest}
        className={`glass-btn flip-btn ${face === "on" ? "flip-on" : ""} ${className}`.trim()}
      />
    </span>
  );
}
