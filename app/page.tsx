import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Projects from "@/components/Projects";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Projects />
        <Journey />
      </main>
    </>
  );
}
