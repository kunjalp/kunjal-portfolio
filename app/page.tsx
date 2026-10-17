import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Projects from "@/components/Projects";
import About from "@/components/About";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Journey />
        <About />
      </main>
    </>
  );
}
