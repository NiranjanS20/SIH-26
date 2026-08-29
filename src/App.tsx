import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValuePropSection } from './components/ValuePropSection';
import { DataSourcesSection } from './components/DataSourcesSection';
import { WhatWeAreSolvingSection } from './components/WhatWeAreSolvingSection';
import { MineCardSection } from './components/MineCardSection';
import { ServicesSection, type ServiceItem } from './components/ServicesSection';
import { UpdatesSection } from './components/UpdatesSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { ServiceModal } from './components/ServiceModal';
import { MineDetailModal } from './components/MineDetailModal';

export function App() {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedMine, setSelectedMine] = useState<any | null>(null);

  // Setup Intersection Observer for smooth section fade-in animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((sec) => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (sectionId: string) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8] text-[#1B1B1C] font-body selection:bg-[#FEA619] selection:text-[#1B1B1C]">
      {/* 1. Header / Top Navigation */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main>
        {/* 2. Hero Section */}
        <Hero onExploreClick={() => handleNavigate('mines')} />

        {/* 3. Value Proposition Section ("Built for Smarter Mine Operations") */}
        <ValuePropSection />

        {/* 4. Data Sources Section ("One Platform. Multiple Data Sources.") */}
        <DataSourcesSection />

        {/* 5. What We're Solving Section ("What We're Solving") */}
        <WhatWeAreSolvingSection />

        {/* 6. Mine Launcher & Selection Section ("Your Mine") */}
        <MineCardSection onOpenMineModal={(mine) => setSelectedMine(mine)} />

        {/* 6. Digital Mine Services Section */}
        <ServicesSection onSelectService={(service) => setSelectedService(service)} />

        {/* 7. Latest Updates Timeline Section */}
        <UpdatesSection />

        {/* 8. Final Sub-Footer CTA Section */}
        <CTASection onCTAClick={() => handleNavigate('hero')} />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* Interactive Modals */}
      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />

      <MineDetailModal
        mine={selectedMine}
        onClose={() => setSelectedMine(null)}
      />
    </div>
  );
}

export default App;
