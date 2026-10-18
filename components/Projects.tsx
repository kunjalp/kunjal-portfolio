import AcmWebLead from "./projects/AcmWebLead";
import Cosmos from "./projects/Cosmos";
import FormulaSlug from "./projects/FormulaSlug";
import Heirloom from "./projects/Heirloom";
import SammysPalate from "./projects/SammysPalate";
import VexRobotics from "./projects/VexRobotics";

/** Spans both columns on large screens. */
function Wide({ children }: { children: React.ReactNode }) {
  return <div className="lg:col-span-2">{children}</div>;
}

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Projects
        </h2>
        <p className="mt-3 max-w-xl text-[1.05rem]">
          Drag any window by its title bar. All of them respond to you.
        </p>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <Wide>
            <Heirloom />
          </Wide>
          <Wide>
            <FormulaSlug />
          </Wide>
          <Cosmos />
          <SammysPalate />
          <Wide>
            <AcmWebLead />
          </Wide>
          <Wide>
            <VexRobotics />
          </Wide>
        </div>
      </div>
    </section>
  );
}
