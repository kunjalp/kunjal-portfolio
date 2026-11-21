import { ArrowDown, ArrowUpRight, FileText, Github, Leaf, Linkedin, Mail } from "lucide-react";
import Window from "./Window";
import FlipLink from "./FlipLink";

const facts: [string, string][] = [
  ["school", "UC Santa Cruz"],
  ["majors", "Computer Science + Computer Engineering"],
  ["gpa", "3.95 / 4.0"],
  ["graduating", "June 2028"],
  ["seeking", "SWE internship, summer 2027"],
];

export default function Hero() {
  return (
    <section id="top" className="relative px-4 pb-24 pt-28 sm:px-8 lg:pt-32">
      <div className="mx-auto w-full max-w-[1100px]">
        <h1 className="on-sky hero-name text-[clamp(3.4rem,10vw,8.5rem)] font-semibold lg:font-medium leading-[0.86]">
          Kunjal Purohit
        </h1>
        <p className="on-sky mt-4 max-w-xl text-[clamp(1.15rem,1.8vw,1.45rem)] font-medium leading-snug">
          Firmware for a Formula SAE electric race car. An iOS app on the App Store.
        </p>

        <div className="mt-10 max-w-[560px] xl:mt-0 xl:ml-[40%]">
          <Window section="home" title="README.md">
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
                <a href="#projects" className="glass-btn btn-primary">
                  See my work
                  <ArrowDown size={16} aria-hidden />
                </a>
                <FlipLink href="#contact">
                  <Mail size={16} aria-hidden />
                  Contact me
                </FlipLink>
                <span aria-hidden className="hidden basis-full sm:block" />
                <FlipLink
                  href="/Kunjal_Purohit_Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Resume for software engineering roles, PDF (opens in a new tab)"
                >
                  <FileText size={16} aria-hidden />
                  Resume: SWE
                </FlipLink>
                <FlipLink
                  href="/Kunjal_Purohit_Resume_Embedded.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Resume for embedded roles, PDF (opens in a new tab)"
                >
                  <FileText size={16} aria-hidden />
                  Resume: Embedded
                </FlipLink>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <FlipLink
                  href="https://github.com/kunjalp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kunjal on GitHub (opens in a new tab)"
                  className="!min-h-[36px] !px-3 !text-[0.8rem]"
                >
                  <Github size={14} aria-hidden />
                  GitHub
                  <ArrowUpRight size={14} aria-hidden />
                </FlipLink>
                <FlipLink
                  href="https://www.linkedin.com/in/kunjalpurohit"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kunjal on LinkedIn (opens in a new tab)"
                  className="!min-h-[36px] !px-3 !text-[0.8rem]"
                >
                  <Linkedin size={14} aria-hidden />
                  LinkedIn
                  <ArrowUpRight size={14} aria-hidden />
                </FlipLink>
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
