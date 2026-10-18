/**
 * Datasheet-style "Stack" row: a ruled line, a small label, then the technologies
 * separated by thin vertical dividers. The negative margin and clip hide the divider
 * that would otherwise dangle at the start of each wrapped line.
 */
export function Tags({ items, label = "Stack" }: { items: string[]; label?: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 border-t-[1.5px] border-[rgb(var(--edge)/0.45)] pt-3">
      <span className="font-mono text-xs text-muted">{label}</span>
      <div className="overflow-hidden">
        <ul className="-ml-3 flex flex-wrap gap-y-1 font-mono text-[0.78rem] leading-5">
          {items.map((t) => (
            <li key={t} className="border-l border-[rgb(var(--edge)/0.4)] px-3">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-[1rem] leading-relaxed">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/** Row of headline numbers. Every value must come from the resume or portfolio. */
export function Metrics({ items, cols = "sm:grid-cols-4" }: { items: [string, string][]; cols?: string }) {
  return (
    <dl className={`grid grid-cols-2 content-start gap-3 ${cols}`}>
      {items.map(([v, l]) => (
        <div
          key={l}
          className="rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.5)] px-3 py-2.5 sm:py-3"
        >
          <dd className="text-[1.3rem] font-extrabold leading-none">{v}</dd>
          <dt className="mt-1.5 text-sm text-muted">{l}</dt>
        </div>
      ))}
    </dl>
  );
}

/**
 * Heading plus the line under it. The first entry is the role or kind of project;
 * the rest are dates and places, set apart in the mono face instead of strung together with dots.
 */
export function ProjectTitle({ title, meta }: { title: string; meta: string[] }) {
  const [what, ...rest] = meta;
  return (
    <>
      <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">{title}</h3>
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="text-[0.95rem] font-semibold">{what}</span>
        {rest.map((r) => (
          <span key={r} className="font-mono text-xs text-muted">
            {r}
          </span>
        ))}
      </p>
    </>
  );
}
