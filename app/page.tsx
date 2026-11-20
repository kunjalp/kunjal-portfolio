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
      <footer className="relative z-10 border-t border-[rgb(var(--edge)/0.25)] bg-bg px-4 py-6 sm:px-6">
        <p className="mx-auto max-w-5xl font-mono text-[0.85rem] text-muted">
          &copy; 2026 Kunjal Purohit
        </p>
      </footer>
    </>
  );
}
