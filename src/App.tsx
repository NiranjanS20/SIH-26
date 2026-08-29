import { useEffect, useState } from 'react';
import { Navbar, type PortalRoute } from './components/Navbar';
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
import { MineSelectionPage } from './components/MineSelectionPage';
import { DongriBuzurgWorkspace } from './components/DongriBuzurgWorkspace';
import { ReserveMappingPage } from './components/ReserveMappingPage';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('landing');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark'); // Default theme is Dark Mode per request
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
  }, [currentRoute, themeMode]);

  const handleNavigate = (route: PortalRoute) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isFullScreenWorkspace =
    currentRoute === 'dongri-buzurg-workspace' || currentRoute === 'reserve-mapping';

  return (
    <div
      className={`min-h-screen font-body transition-colors duration-300 ${
        themeMode === 'dark'
          ? 'bg-[#181B20] text-white selection:bg-[#F59E0B] selection:text-[#181B20]'
          : 'bg-[#FCF9F8] text-[#1B1B1C] selection:bg-[#FEA619] selection:text-[#1B1B1C]'
      }`}
    >
      {/* 1. Header / Top Portal Navigation (Landing & Mine Selection only) */}
      {!isFullScreenWorkspace && (
        <Navbar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Content Area based on current route */}
      <main>
        {currentRoute === 'landing' && (
          <>
            {/* 2. Hero Section */}
            <Hero
              onExploreClick={() => handleNavigate('mine-selection')}
              onReserveMapClick={() => handleNavigate('reserve-mapping')}
            />

            {/* 3. Value Proposition Section */}
            <ValuePropSection />

            {/* 4. Data Sources Section */}
            <DataSourcesSection />

            {/* 5. What We're Solving Section */}
            <WhatWeAreSolvingSection />

            {/* 6. Mine Launcher & Selection Section */}
            <MineCardSection
              onOpenMineModal={(mine) => {
                if (mine.id === 'dongri-buzurg') {
                  handleNavigate('dongri-buzurg-workspace');
                } else {
                  setSelectedMine(mine);
                }
              }}
            />

            {/* 7. Digital Mine Services Section */}
            <ServicesSection onSelectService={(service) => setSelectedService(service)} />

            {/* 8. Latest Updates Timeline Section */}
            <UpdatesSection />

            {/* 9. Final Sub-Footer CTA Section */}
            <CTASection onCTAClick={() => handleNavigate('mine-selection')} />
          </>
        )}

        {currentRoute === 'mine-selection' && (
          <MineSelectionPage
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {currentRoute === 'dongri-buzurg-workspace' && (
          <DongriBuzurgWorkspace
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {currentRoute === 'reserve-mapping' && (
          <ReserveMappingPage
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}
      </main>

      {/* Footer (Landing & Mine Selection only) */}
      {!isFullScreenWorkspace && (
        <Footer themeMode={themeMode} />
      )}

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

