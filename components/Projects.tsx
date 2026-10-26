import AcmWebLead from "./projects/AcmWebLead";
import Cosmos from "./projects/Cosmos";
import Dowser from "./projects/Dowser";
import FormulaSlug from "./projects/FormulaSlug";
import Heirloom from "./projects/Heirloom";
import SammysPalate from "./projects/SammysPalate";
import VexRobotics from "./projects/VexRobotics";

/** Spans both columns on large screens. The id is the jump target for the project index. */
function Wide({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 lg:col-span-2">
      {children}
    </div>
  );
}
export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1100px]">
        <h2 className="on-sky text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Projects
        </h2>
        <p className="on-sky mt-3 max-w-xl text-[1.05rem]">
          Drag any window by its title bar. All of them respond to you.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <Wide id="project-dowser">
            <Dowser />
          </Wide>
          <Wide id="project-heirloom">
            <Heirloom />
          </Wide>
          <Wide id="project-formula-slug">
            <FormulaSlug />
          </Wide>
          <Wide id="project-cosmos">
            <Cosmos />
          </Wide>
          <Wide id="project-sammys">
            <SammysPalate />
          </Wide>
          <Wide id="project-acm">
            <AcmWebLead />
          </Wide>
          <Wide id="project-vex">
            <VexRobotics />
          </Wide>
        </div>
      </div>
    </section>
  );
}
