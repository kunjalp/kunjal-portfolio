"use client";

/** The small pill tabs used by the VEX workshop (views, seasons, mechanisms). */
export default function TabBar<T extends string | number>({
  label,
  tabs,
  value,
  onChange,
  size = "sm",
  nowrap = false,
}: {
  label: string;
  tabs: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  size?: "sm" | "md";
  /** Keep the tabs on one line and draw a rule under them (top-level view switcher). */
  nowrap?: boolean;
}) {
  const sizing = size === "md" ? "!min-h-[36px] !px-3 !text-[0.8rem]" : "!min-h-[34px] !px-3 !text-[0.78rem]";
  return (
    <div role="tablist" aria-label={label} className={nowrap ? "flex gap-2 border-b-2 border-[rgb(var(--edge)/0.3)] pb-3" : "flex flex-wrap gap-2"}>
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className={`glass-btn ${sizing} ${t.id === value ? "btn-primary" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
