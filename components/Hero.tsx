import { ArrowDown, GraduationCap, Leaf, Mail } from "lucide-react";

const stats = [
  { value: "3.95 / 4.0", label: "Cumulative GPA" },
  { value: "June 2028", label: "Expected graduation" },
  { value: "CS + CE", label: "Double major" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center px-4 pb-16 pt-28 sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm">
          <GraduationCap size={16} className="text-accent" aria-hidden />
          <span className="text-muted">CS & CE Double Major · UC Santa Cruz</span>
        </div>

        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-muted">
          Kunjal Purohit
        </p>

        <h1 className="max-w-3xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
          Bridging <span className="text-sunset">hardware</span> and{" "}
          <span className="text-sunset">software</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          I&apos;m a Computer Science and Computer Engineering double major,
          building across embedded firmware, autonomous systems, and full-stack
          software.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#journey" className="glass-btn">
            View my journey
            <ArrowDown size={16} aria-hidden />
          </a>
          <a href="#contact" className="glass-btn">
            <Mail size={16} aria-hidden />
            Get in touch
          </a>
        </div>

        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
          {stats.map((s) => (
            <div key={s.label} className="glass flex flex-col rounded-2xl p-3 sm:p-4">
              <dt className="order-2 text-[0.65rem] leading-tight text-muted sm:text-xs">
                {s.label}
              </dt>
              <dd className="mb-1 text-sm font-semibold tracking-tight sm:text-xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <Leaf size={16} className="text-accent" aria-hidden />
          Tap a drifting leaf to learn something about me.
        </p>
      </div>
    </section>
  );
}
