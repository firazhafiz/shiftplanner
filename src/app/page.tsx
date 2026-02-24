import LandingGate from "@/components/landing/LandingGate";
import LandingNavbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <LandingGate>
      <main>
        <LandingNavbar />
        <Hero />
        <Features />
        <HowItWorks />
        <CTASection />

        <Footer />
      </main>
    </LandingGate>
  );
}
