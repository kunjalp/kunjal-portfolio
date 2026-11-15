import AcmWebLead from "./projects/AcmWebLead";
import Cosmos from "./projects/Cosmos";
import Dowser from "./projects/Dowser";
import FormulaSlug from "./projects/FormulaSlug";
import Heirloom from "./projects/Heirloom";
import SammysPalate from "./projects/SammysPalate";
import VexRobotics from "./projects/VexRobotics";

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-[1100px]">
        <h2 className="on-sky text-[clamp(2.2rem,5vw,3.6rem)] font-extrabold leading-none tracking-[-0.02em] [font-stretch:80%]">
          Projects
        </h2>
        <p className="on-sky mt-3 max-w-xl text-[1.05rem]">
          Seven projects. Open any one with <span className="font-mono text-[0.95em]">cat details</span>, or drag a
          window by its title bar.
        </p>

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <Heirloom />
          <FormulaSlug />
          <Dowser />
          <SammysPalate />
          <Cosmos />
          <AcmWebLead />
          <VexRobotics />
        </div>
      </div>
    </section>
  );
}
