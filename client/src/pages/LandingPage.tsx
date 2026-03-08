import type { Session } from "@supabase/supabase-js";
import LandingNavbar from "@/components/LandingNavbar";
import LandingHero from "@/components/LandingHero";
import FeaturesSection from "@/components/FeaturesSection";
import MirrorLiveSection from "@/components/MirrorLiveSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import FinalCTA from "@/components/FinalCTA";
import LandingFooter from "@/components/LandingFooter";
import TrustBar from "@/components/TrustBar";
import { InstallPrompt } from "@/components/InstallPrompt";

interface Props {
  session: Session | null;
}

export default function LandingPage({ session }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <LandingHero />
      <TrustBar />
      <FeaturesSection />
      <MirrorLiveSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FinalCTA />
      <LandingFooter />
      <InstallPrompt />
    </div>
  );
}
