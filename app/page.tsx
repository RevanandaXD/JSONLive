import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Stats } from "@/components/marketing/Stats";
import { Footer } from "@/components/layout/Footer";
import { FAQ } from "@/components/marketing/FAQ";

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
