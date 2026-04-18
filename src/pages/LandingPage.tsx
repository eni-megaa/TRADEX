import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { MarketsSection } from '../components/MarketsSection';
import { HeatmapSection } from '../components/HeatmapSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { WhatIsItSection } from '../components/WhatIsItSection';
import { TrustSection } from '../components/TrustSection';
import { CopyTradingSection } from '../components/CopyTradingSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { PlatformSection } from '../components/PlatformSection';
import { FAQSection } from '../components/FAQSection';
import { Footer } from '../components/Footer';
import { RoadmapSection } from '../components/RoadmapSection';

export const LandingPage = () => {
  return (
    <div className="bg-navy min-h-screen">
      <Navbar />
      <HeroSection />
      <MarketsSection />
      <HeatmapSection />
      <HowItWorksSection />
      <WhatIsItSection />
      <TrustSection />
      <PlatformSection />
      <CopyTradingSection />
      <RoadmapSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};
