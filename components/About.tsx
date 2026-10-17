"use client";

import { useState } from "react";
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
      <img src={IMG + src} alt={alt} loading="lazy" className={`w-full object-cover ${imgClass}`} />
      {caption && <figcaption className="mt-2 text-center font-mono text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

const SUNSETS = [
  { src: "sunset-beach.jpg", alt: "Sun setting over ocean waves on a beach", cap: "beach" },
  { src: "sunset-reflection.jpg", alt: "Pink and orange clouds reflected in still water", cap: "reflection" },
  { src: "sunset-boardwalk.jpg", alt: "Golden sky over a wooden boardwalk", cap: "boardwalk" },
  { src: "sunset-lake.jpg", alt: "Sun dipping behind hills over a lake", cap: "lake" },
  { src: "sunset-meadow.jpg", alt: "Pink sky over a green meadow and distant hills", cap: "meadow" },
];

function Sunsets() {
  const [i, setI] = useState(0);
  const cur = SUNSETS[i];
  return (
    <div className="p-6 sm:p-7">
      <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">I collect sunsets</h3>
      <p className="mt-2 text-[1.05rem] leading-relaxed">
        If the sky is doing something pretty, I stop and take a picture. A few favorites. Click one.
      </p>
      <div className="mt-4 overflow-hidden border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={cur.src}
          src={IMG + cur.src}
          alt={cur.alt}
          className="fade-up mx-auto h-[340px] w-full object-contain sm:h-[420px]"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a sunset">
        {SUNSETS.map((s, n) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setI(n)}
            aria-pressed={n === i}
            className={`glass-btn !min-h-[34px] !px-3 !text-[0.8rem] ${n === i ? "btn-primary" : ""}`}
          >
            {s.cap}
          </button>
        ))}
      </div>
    </div>
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
    <section id="about" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          About me
        </h2>
        <p className="mt-3 max-w-xl text-[1.05rem]">
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
                    <span className="font-mono text-xs text-muted">THE DREAM JOB</span>
                    <br />
                    Working on autonomous vehicles and building tech that actually solves real
                    problems.
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

          {/* charcoal */}
          <Window title="studio/charcoal.png">
            <div className="p-6 sm:p-7">
              <h3 className="text-[1.6rem] font-bold leading-tight tracking-[-0.01em]">How I take breaks</h3>
              <p className="mt-2 text-[1.05rem] leading-relaxed">
                Sometimes I need a break from the tech, so I grab my charcoal. Flowers and
                landscapes are my favorite to draw, and it&apos;s honestly so peaceful.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Polaroid src="charcoal-street.jpg" alt="Painting of a rainy cafe street at night" tilt={-2} imgClass="aspect-[3/4]" />
                <Polaroid src="pencil-kitten.jpg" alt="Pencil drawing of a kitten mid-air" tilt={1.5} imgClass="aspect-[3/4]" />
                <Polaroid src="charcoal-buddha.jpg" alt="Charcoal drawing of a Buddha face" tilt={-1} imgClass="aspect-[3/4]" />
              </div>
              <p className="mt-4 font-mono text-xs text-muted">Up next: learning embroidery to customize my own clothes.</p>
            </div>
          </Window>

          <Window title="photos/sunsets">
            <Sunsets />
          </Window>

          {/* outdoors */}
          <div className="lg:col-span-2">
            <Window title="places/with-a-view.txt">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_1fr_1fr]">
                <div>
                  <Polaroid src="mount-tam.jpg" alt="Green hills and clouds from the Mount Tamalpais trail" caption="Mt. Tam" tilt={-1.5} imgClass="aspect-[4/5]" />
                  <p className="mt-3 font-bold">Mount Tam</p>
                  <p className="text-[0.95rem] leading-relaxed">
                    My favorite hike. I&apos;m a mountain person and the views are worth it.
                  </p>
                </div>
                <div>
                  <Polaroid src="ski.jpg" alt="Two skiers heading down a snowy run at sunset" caption="skiing" tilt={1} imgClass="aspect-[4/5]" />
                  <p className="mt-3 font-bold">Skiing since I was 6</p>
                  <p className="text-[0.95rem] leading-relaxed">A family thing since I was little, and I still love it.</p>
                </div>
                <div>
                  <Polaroid src="banff.jpg" alt="Mountain valley with a lodge and gardens in Banff" caption="Banff" tilt={-0.5} imgClass="aspect-[4/5]" />
                  <p className="mt-3 font-bold">Favorite places</p>
                  <p className="text-[0.95rem] leading-relaxed">
                    Canada and both coasts. I love when nature and cool infrastructure meet.
                  </p>
                </div>
              </div>
            </Window>
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
