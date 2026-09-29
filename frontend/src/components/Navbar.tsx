import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type PortalRoute = 'landing' | 'login' | 'mine-selection' | 'industry-viewer' | 'admin-control-center' | `workspace/${string}`;

interface NavbarProps {
  currentRoute?: PortalRoute;
  onNavigate?: (route: PortalRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const portalRoute: PortalRoute = 
    user?.role === 'admin' 
      ? 'admin-control-center' 
      : user?.role === 'industry_viewer' 
        ? 'industry-viewer' 
        : 'mine-selection';

  const isLanding = currentRoute === 'landing';
  const navBackground = isLanding
    ? (scrolled
        ? 'bg-[#002452]/95 backdrop-blur-md border-b border-white/10 shadow-lg py-1'
        : 'bg-transparent border-none shadow-none py-2')
    : (scrolled
        ? 'bg-[#002452] backdrop-blur-md border-b border-white/10 shadow-lg py-1'
        : 'bg-[#002452] border-b border-white/10 shadow-md py-2');

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBackground}`}>
      <div className="relative flex justify-between items-center max-w-[1440px] mx-auto px-4 md:px-12 h-20">
        
        {/* Left: Official MOIL Logo */}
        <a 
          href="#hero" 
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3.5 group cursor-pointer"
          title="MOIL Limited Home"
        >
          {/* Blue Circle MOIL Emblem */}
          <div className="w-12 h-12 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white px-1 shadow-md shrink-0 border border-white/30 group-hover:scale-105 transition-transform">
            <div className="w-6 h-3 bg-white rounded-t-full mb-0.5"></div>
            <span className="text-[7.5px] leading-tight font-bold tracking-tighter">मॉयल</span>
            <span className="text-[9px] leading-none font-black tracking-tighter">MOIL</span>
          </div>

          {/* MOIL Text Branding */}
          <div className="flex flex-col text-left">
            <span className="font-serif font-black text-lg md:text-xl text-white tracking-wider leading-none drop-shadow-md">
              MOIL LIMITED
            </span>
            <span className="text-[10px] md:text-[11px] text-white/80 font-semibold tracking-normal mt-1 drop-shadow-sm">
              (A Government of India Enterprise)
            </span>
          </div>
        </a>

        {/* Center: National Emblem of India (Ashoka Lion Capital with Satyameva Jayate) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center pointer-events-none hidden md:flex">
          <img 
            src="/assets/satyameva_jayate_white.png" 
            alt="Satyameva Jayate - State Emblem of India" 
            className="h-14 w-auto object-contain drop-shadow-md"
          />
        </div>

        {/* Right: Login / User Info */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            currentRoute === 'landing' ? (
              <button
                onClick={() => {
                  if (onNavigate) onNavigate(portalRoute);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-bold text-sm shadow-md hover:from-[#F59E0B] hover:to-[#D97706] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                Dashboard
              </button>
            ) : (
              // Logged in on protected page: show role badge + logout
              <div className="flex items-center gap-2">
                <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                  user.role === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : user.role === 'industry_viewer'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {user.role === 'admin' ? 'shield' : user.role === 'industry_viewer' ? 'visibility' : 'badge'}
                  </span>
                  {user.role === 'admin' ? 'Admin' : user.role === 'industry_viewer' ? 'Industry Viewer' : 'Site Manager'}
                </span>
                <button
                  onClick={() => {
                    logout();
                    if (onNavigate) onNavigate('landing');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )
          ) : null}
        </div>

      </div>
    </header>
  );
};

export default Navbar;

