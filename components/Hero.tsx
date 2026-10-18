import { ArrowDown, Leaf, Mail } from "lucide-react";
import Window from "./Window";

const facts: [string, string][] = [
  ["school", "UC Santa Cruz"],
  ["majors", "Computer Science + Computer Engineering"],
  ["gpa", "3.95 / 4.0"],
  ["graduating", "June 2028"],
];

export default function Hero() {
  return (
    <section id="top" className="relative px-4 pb-24 pt-28 sm:px-8 lg:pt-32">
      <div className="mx-auto w-full max-w-[1100px]">
        <h1 className="hero-name text-[clamp(3.4rem,10vw,8.5rem)] font-extrabold leading-[0.86]">
          Kunjal Purohit
        </h1>
        <p className="mt-4 max-w-xl text-[clamp(1.15rem,1.8vw,1.45rem)] font-medium leading-snug">
          I build where software meets hardware.
        </p>

        <div className="mt-10 max-w-[560px] xl:-mt-8 xl:ml-[40%]">
          <Window title="README.md">
            <div className="p-6 sm:p-7">
              <p className="text-[1.05rem] leading-relaxed">
                I write firmware for a Formula SAE race car, built perception and
                mapping for a scaled autonomous vehicle, and ship full-stack apps
                like a nutrition tracker for UCSC dining halls.
              </p>

              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t-2 border-dashed border-[rgb(var(--edge)/0.25)] pt-4 font-mono text-[0.82rem]">
                {facts.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#journey" className="glass-btn btn-primary">
                  See my work
                  <ArrowDown size={16} aria-hidden />
                </a>
                <a href="#contact" className="glass-btn">
                  <Mail size={16} aria-hidden />
                  Contact me
                </a>
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm text-muted">
                <Leaf size={15} className="text-accent2" aria-hidden />
                Click a falling pine or pinecone for something non-technical about me.
              </p>
            </div>
          </Window>
        </div>
      </div>
    </section>
  );
}
