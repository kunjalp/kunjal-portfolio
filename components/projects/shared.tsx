export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-md border-[1.5px] border-[rgb(var(--edge)/0.5)] bg-[rgb(var(--paper2)/0.5)] px-2.5 py-0.5 font-mono text-xs"
        >
          {t}
        </li>
      ))}
    </ul>
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
          className="rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.5)] px-4 py-3"
        >
          <dd className="text-[1.5rem] font-extrabold leading-none">{v}</dd>
          <dt className="mt-1.5 text-sm text-muted">{l}</dt>
        </div>
      ))}
    </dl>
  );
}
