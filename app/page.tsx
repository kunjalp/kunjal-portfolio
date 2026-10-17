import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Journey />
      </main>
    </>
  );
}
