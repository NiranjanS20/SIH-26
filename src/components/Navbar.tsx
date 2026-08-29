import React, { useEffect, useState } from 'react';

export type PortalRoute = 'landing' | 'mine-selection' | 'dongri-buzurg-workspace';

interface NavbarProps {
  currentRoute?: PortalRoute;
  onNavigate?: (route: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#002452]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-1' 
        : 'bg-transparent border-none shadow-none py-2'
    }`}>
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
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
          <svg 
            viewBox="0 0 100 120" 
            className="h-11 md:h-12 w-auto text-white drop-shadow-md"
            fill="currentColor"
            aria-label="National Emblem of India"
          >
            {/* Crown & Lion Heads */}
            <path d="M50 5 C44 5 40 9 38 15 C36 21 40 27 44 31 C42 35 40 39 36 43 C32 47 30 52 35 57 C38 60 44 61 50 61 C56 61 62 60 65 57 C70 52 68 47 64 43 C60 39 58 35 56 31 C60 27 64 21 62 15 C60 9 56 5 50 5 Z" opacity="0.95" />
            
            {/* Left Lion Profile */}
            <path d="M26 22 C22 22 18 26 18 32 C18 38 22 42 26 44 C30 42 32 38 32 32 C32 26 28 22 26 22 Z" opacity="0.9" />
            
            {/* Right Lion Profile */}
            <path d="M74 22 C70 22 68 26 68 32 C68 38 70 42 74 44 C78 42 82 38 82 32 C82 26 78 22 74 22 Z" opacity="0.9" />
            
            {/* Abacus & Ashoka Chakra Base */}
            <rect x="20" y="63" width="60" height="7" rx="1.5" />
            <circle cx="50" cy="66.5" r="2.8" fill="#002452" />
            <circle cx="50" cy="66.5" r="1" fill="#FFFFFF" />
            
            {/* Bell Capital / Lotus Base */}
            <path d="M26 72 L74 72 L68 83 L32 83 Z" opacity="0.95" />
            <line x1="36" y1="72" x2="38" y2="83" stroke="#002452" strokeWidth="1" />
            <line x1="50" y1="72" x2="50" y2="83" stroke="#002452" strokeWidth="1" />
            <line x1="64" y1="72" x2="62" y2="83" stroke="#002452" strokeWidth="1" />
            
            {/* Base Pedestal */}
            <rect x="28" y="85" width="44" height="4" rx="1" />
          </svg>
          <span className="text-[10px] md:text-[11px] font-bold text-white tracking-widest leading-tight mt-0.5 font-serif drop-shadow-sm">
            सत्यमेव जयते
          </span>
        </div>

        {/* Right side is intentionally empty per user request */}
        <div className="w-12 h-12 invisible"></div>

      </div>
    </header>
  );
};
