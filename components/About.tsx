"use client";

import Corkboard from "./Corkboard";
import Window from "./Window";

const IMG = "/images/about/";

function Polaroid({
  src,
  alt,
  caption,
  tilt = 0,
  className = "",
  imgClass = "aspect-[4/5]",
}: {
  src: string;
  alt: string;
  caption?: string;
  tilt?: number;
  className?: string;
  imgClass?: string;
}) {
  return (
    <figure
      className={`border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper))] p-2 pb-3 shadow-[3px_3px_0_rgb(var(--edge)/0.9)] ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG + src} alt={alt} loading="lazy" decoding="async" className={`w-full object-cover ${imgClass}`} />
      {caption && <figcaption className="mt-2 text-center font-mono text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function Facts({ items }: { items: { n: string; t: string; d: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {items.map((f) => (
        <li
          key={f.n}
          className="rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--paper2)/0.5)] p-4"
        >
          <p className="font-mono text-xs text-muted">{f.n}</p>
          <p className="mt-1 font-bold">{f.t}</p>
          <p className="mt-1 text-[0.95rem] leading-relaxed">{f.d}</p>
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1100px]">
        <h2 className="on-sky text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          About me
        </h2>
        <p className="on-sky mt-3 max-w-xl text-[1.05rem]">
          When I&apos;m not coding, I&apos;m probably chasing a sunset, drawing, or making chai.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* intro */}
          <div className="lg:col-span-2">
            <Window title="about/why-i-build.md">
              <div className="grid gap-8 p-6 sm:p-7 lg:grid-cols-[320px_1fr]">
                <Polaroid
                  src="portrait.jpg"
                  alt="Kunjal smiling by the coast with cypress trees behind her"
                  caption="golden hour, always"
                  tilt={-2}
                  imgClass="aspect-[4/3] lg:aspect-[4/5]"
                />
                <div className="space-y-4">
                  <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">
                    So, why do I build things?
                  </h3>
                  <p className="text-[1.05rem] leading-relaxed">
                    It started in high school, when I first got into autonomous vehicles. I was
                    hooked once I realized you can take an idea from your head and turn it into
                    something real.
                  </p>
                  <p className="text-[1.05rem] leading-relaxed">
                    Give me something hard and I&apos;m all in. I want to do it as well as I can,
                    if not better.
                  </p>
                  <p className="border-l-4 border-[rgb(var(--accent))] pl-4 text-[1.05rem]">
                    <span className="font-mono text-xs text-muted">WHAT I&apos;M AFTER</span>
                    <br />
                    Building technology that actually solves real problems, across software and
                    hardware. Autonomous vehicles are what first hooked me, but I&apos;m excited by any
                    team working on hard, real-world problems.
                  </p>
                  <p className="text-[1.05rem] leading-relaxed">
                    Sammy&apos;s Palate is the one I&apos;m proudest of. I made it because I wanted an
                    easier way to see the nutrition of what I was eating on campus. If something
                    bugs me, I add a feature.
                  </p>
                </div>
              </div>
            </Window>
          </div>

          <div className="lg:col-span-2">
            <Corkboard />
          </div>

          <Window title="on-repeat.txt">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">What&apos;s on repeat</h3>
              <p className="text-[1.05rem] leading-relaxed">
                I&apos;m all about R&amp;B: Jhené Aiko, Joji, Brent Faiyaz.
              </p>
              <p className="font-mono text-xs text-muted">FOOD I&apos;LL NEVER SAY NO TO</p>
              <p className="text-[1.05rem] leading-relaxed">
                Thai, Indian, or anything homemade. And chai. Making it is honestly just as fun as
                drinking it.
              </p>
            </div>
          </Window>

          <Window title="next.todo">
            <div className="space-y-4 p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">What&apos;s next</h3>
              <ul className="space-y-2 text-[1.02rem] leading-relaxed">
                {[
                  "Build more stuff I'm excited about",
                  "Keep pushing to see how far I can go",
                  "Travel more and see new places",
                  "Make tons of memories with friends and family",
                  "Make the most of college",
                  "Get better at what I do, without losing the rest of me",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Window>

          <div className="lg:col-span-2">
            <Window title="fun-facts.txt">
              <div className="p-6 sm:p-7">
                <Facts
                  items={[
                    {
                      n: "01",
                      t: "I wanted to be a barber",
                      d: "My parents used to joke about it, and now I actually cut and style hair for my family and friends. I've even given myself bangs.",
                    },
                    {
                      n: "02",
                      t: "Pet peeve? Slow walkers",
                      d: "Sorry, but there's always somewhere to be and something to do.",
                    },
                    {
                      n: "03",
                      t: "Not much of a movie person",
                      d: "I'd way rather have a packed day where I get to do a bunch of different things.",
                    },
                  ]}
                />
              </div>
            </Window>
          </div>
        </div>
      </div>
    </section>
  );
}
