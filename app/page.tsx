import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Journey />
        <About />
        <Skills />
        <Contact />
      </main>
      <footer className="relative z-10 bg-[rgb(var(--foot-bg))] px-4 pb-6 pt-2 text-left sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-gradient-to-b from-transparent to-[rgb(var(--foot-bg))]"
        />
        <p className="font-mono text-[0.85rem] text-[rgb(var(--foot-fg))]">&copy; 2026 Kunjal Purohit</p>
      </footer>
    </>
  );
}
