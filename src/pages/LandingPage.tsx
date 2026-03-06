import LandingNavbar from "@/components/LandingNavbar";
import LandingHero from "@/components/LandingHero";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import MirrorLiveSection from "@/components/MirrorLiveSection";
import FinalCTA from "@/components/FinalCTA";
import TrustBar from "@/components/TrustBar";
import LandingFooter from "@/components/LandingFooter";

interface Props {
  session: any;
}

export default function LandingPage({ session }: Props) {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <TrustBar />
      <FeaturesSection />
      <HowItWorksSection />
      <MirrorLiveSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
