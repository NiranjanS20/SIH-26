import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { MineWorkspace } from './components/MineWorkspace';
import { ReserveMappingPage } from './components/ReserveMappingPage';
import { LoginPage } from './components/LoginPage';
import { IndustryViewerDashboard } from './components/IndustryViewerDashboard';

// Inner app that has access to AuthContext
function AppInner() {
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('landing');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedMine, setSelectedMine] = useState<any | null>(null);

  const { isAuthenticated, user, logout } = useAuth();

  // Handle unauthorized event globally
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

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
    // Guard: any route that's not landing or login requires authentication
    const publicRoutes: PortalRoute[] = ['landing', 'login'];
    if (!publicRoutes.includes(route) && !isAuthenticated) {
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isFullScreenWorkspace =
    currentRoute.startsWith('workspace/') ||
    currentRoute === 'reserve-mapping' ||
    currentRoute === 'industry-viewer' ||
    currentRoute === 'login';

  return (
    <div
      className={`min-h-screen font-body transition-colors duration-300 ${
        themeMode === 'dark'
          ? 'bg-[#181B20] text-white selection:bg-[#F59E0B] selection:text-[#181B20]'
          : 'bg-[#FCF9F8] text-[#1B1B1C] selection:bg-[#FEA619] selection:text-[#1B1B1C]'
      }`}
    >
      {/* Header — not shown in full-screen modes */}
      {!isFullScreenWorkspace && (
        <Navbar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Content */}
      <main>
        {/* LOGIN PAGE */}
        {currentRoute === 'login' && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {/* LANDING PAGE */}
        {currentRoute === 'landing' && (
          <>
            <Hero
              onExploreClick={() => handleNavigate(isAuthenticated ? 'mine-selection' : 'login')}
            />
            <ValuePropSection />
            <DataSourcesSection />
            <WhatWeAreSolvingSection />
            <MineCardSection
              onOpenMineModal={() => {
                // Any mine click → login if not authenticated, mine-selection if authenticated
                handleNavigate(isAuthenticated ? 'mine-selection' : 'login');
              }}
            />
            <ServicesSection onSelectService={(service) => setSelectedService(service)} />
            <UpdatesSection />
            <CTASection onCTAClick={() => handleNavigate(isAuthenticated ? 'mine-selection' : 'login')} />
          </>
        )}

        {/* MINE SELECTION PAGE */}
        {currentRoute === 'mine-selection' && (
          <MineSelectionPage
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {/* WORKSPACE PAGES */}
        {currentRoute.startsWith('workspace/') && (
          user?.role === 'industry_viewer' ? (
            <IndustryViewerDashboard
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          ) : (
            <MineWorkspace
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
              initialMineId={currentRoute.replace('workspace/', '')}
              userRole={user?.role ?? 'site_manager'}
            />
          )
        )}

        {/* INDUSTRY VIEWER DASHBOARD */}
        {currentRoute === 'industry-viewer' && (
          <IndustryViewerDashboard
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {/* RESERVE MAPPING */}
        {currentRoute === 'reserve-mapping' && (
          <ReserveMappingPage
            onNavigate={handleNavigate}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        )}
      </main>

      {/* Footer */}
      {!isFullScreenWorkspace && currentRoute !== 'mine-selection' && (
        <Footer themeMode={themeMode} />
      )}

      {/* Modals */}
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

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
