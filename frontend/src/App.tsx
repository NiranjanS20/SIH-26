import { useEffect, useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getStoredUser } from './services/authService';
import { Navbar, type PortalRoute } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValuePropSection } from './components/ValuePropSection';
import { WhatWeAreSolvingSection } from './components/WhatWeAreSolvingSection';
import { MineCardSection } from './components/MineCardSection';
import { ServicesSection, type ServiceItem } from './components/ServicesSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { ServiceModal } from './components/ServiceModal';
import { MineDetailModal } from './components/MineDetailModal';



// Lazy load large components for code splitting
const MineSelectionPage = lazy(() => import('./components/MineSelectionPage').then(module => ({ default: module.MineSelectionPage })));
const MineWorkspace = lazy(() => import('./components/MineWorkspace').then(module => ({ default: module.MineWorkspace })));
const LoginPage = lazy(() => import('./components/LoginPage').then(module => ({ default: module.LoginPage })));
const IndustryViewerDashboard = lazy(() => import('./components/IndustryViewerDashboard').then(module => ({ default: module.IndustryViewerDashboard })));
const AdminControlCenter = lazy(() => import('./components/AdminControlCenter').then(module => ({ default: module.AdminControlCenter })));

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
  </div>
);

// Inner app that has access to AuthContext
function AppInner() {
  const [currentRoute, setCurrentRoute] = useState<PortalRoute>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('route');
      if (r) return r as PortalRoute;
    }
    return 'landing';
  });
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

  // Sync HTML document root class with themeMode for Tailwind class-based dark mode
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const handleNavigate = (route: PortalRoute) => {
    // Guard: any route that's not landing or login requires authentication
    const publicRoutes: PortalRoute[] = ['landing', 'login'];
    const hasAuth = isAuthenticated || !!getStoredUser();
    if (!publicRoutes.includes(route) && !hasAuth) {
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

  const getRoleLandingRoute = (): PortalRoute => {
    const activeUser = user || getStoredUser();
    if (!activeUser) return 'login';
    if (activeUser.role === 'admin') return 'admin-control-center';
    if (activeUser.role === 'industry_viewer') return 'industry-viewer';
    return 'mine-selection';
  };

  // Auto-redirect if authenticated user is on login page
  useEffect(() => {
    if (currentRoute === 'login') {
      const activeUser = user || getStoredUser();
      if (activeUser) {
        const target =
          activeUser.role === 'admin'
            ? 'admin-control-center'
            : activeUser.role === 'industry_viewer'
            ? 'industry-viewer'
            : 'mine-selection';
        setCurrentRoute(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentRoute, user]);

  const isFullScreenWorkspace =
    currentRoute.startsWith('workspace/') ||
    currentRoute === 'industry-viewer' ||
    currentRoute === 'admin-control-center' ||
    currentRoute === 'login';

  return (
    <div
      className={`min-h-screen font-body transition-colors duration-300 ${
        themeMode === 'dark' ? 'dark' : ''
      } ${
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
          <Suspense fallback={<PageLoader />}>
            <LoginPage onNavigate={handleNavigate} />
          </Suspense>
        )}

        {/* LANDING PAGE */}
        {currentRoute === 'landing' && (
          <>
            <Hero
              onExploreClick={() => handleNavigate(getRoleLandingRoute())}
            />
            <ValuePropSection />
            <WhatWeAreSolvingSection />
            <MineCardSection
              onOpenMineModal={(mine) => {
                if (mine && mine.id) {
                  const targetId = mine.id === 'mansar' ? 'munsar' : mine.id;
                  handleNavigate(`workspace/${targetId}` as PortalRoute);
                } else {
                  handleNavigate(getRoleLandingRoute());
                }
              }}
            />
            <ServicesSection onSelectService={(service) => setSelectedService(service)} />
            <CTASection onCTAClick={() => handleNavigate(getRoleLandingRoute())} />
          </>
        )}

        {/* MINE SELECTION PAGE */}
        {currentRoute === 'mine-selection' && (
          <Suspense fallback={<PageLoader />}>
            <MineSelectionPage
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          </Suspense>
        )}

        {/* WORKSPACE PAGES */}
        {currentRoute.startsWith('workspace/') && (
          <Suspense fallback={<PageLoader />}>
            <MineWorkspace
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
              initialMineId={currentRoute.replace('workspace/', '')}
              userRole={user?.role ?? 'site_manager'}
            />
          </Suspense>
        )}

        {/* INDUSTRY VIEWER DASHBOARD */}
        {currentRoute === 'industry-viewer' && (
          <Suspense fallback={<PageLoader />}>
            <IndustryViewerDashboard
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          </Suspense>
        )}

        {/* ADMIN CONTROL CENTER */}
        {currentRoute === 'admin-control-center' && (
          <Suspense fallback={<PageLoader />}>
            <AdminControlCenter
              onNavigate={handleNavigate}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          </Suspense>
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
