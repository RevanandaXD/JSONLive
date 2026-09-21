import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/ui/Hero";
import { Features } from "@/components/ui/Features";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { Stats } from "@/components/ui/Stats";
import { Footer } from "@/components/ui/Footer";
import { FAQ } from "@/components/ui/FAQ";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
