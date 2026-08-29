import React from 'react';

interface CTASectionProps {
  onCTAClick?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onCTAClick }) => {
  const handleClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[450px] md:h-[520px] flex items-center justify-center overflow-hidden bg-[#001636] fade-in-section is-visible">
      
      {/* High-Resolution Dongri Buzurg Night Mine Background Image (Brighter & Vivid) */}
      <div 
        className="absolute inset-0 bg-cover bg-center w-full h-full z-0 transform scale-105 transition-all duration-1000 brightness-115 contrast-110 opacity-95"
        style={{
          backgroundImage: `url('/assets/dongri-buzurg-night.png'), url('/assets/dongri-buzurg-mine.png')`
        }}
      />

      {/* Balanced Blue Tint Overlay (Allows the night mine lights & pit landscape to shine through) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#001636]/65 via-[#002452]/45 to-[#001636]/65 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#001636]/40 via-transparent to-[#001636]/60 z-10" />

      {/* Content Container */}
      <div className="relative z-20 text-center px-6 max-w-3xl mx-auto space-y-5">
        
        {/* Enterprise Portal Badge Pill */}
        <div>
          <span className="inline-block px-4 py-1.5 bg-[#F59E0B]/25 text-[#F59E0B] text-xs font-bold uppercase tracking-[0.2em] rounded-full border border-[#F59E0B]/50 backdrop-blur-md shadow-lg">
            ENTERPRISE PORTAL
          </span>
        </div>

        {/* Title with Text Shadow for High Legibility */}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[48px] leading-tight font-extrabold text-white tracking-tight uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          MOIL DIGITAL MINE PORTAL
        </h2>

        {/* Subtitle */}
        <p className="font-headline text-base sm:text-lg md:text-[22px] leading-relaxed font-semibold text-white max-w-xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Your workspace for smarter mine operations.
        </p>

        {/* Explore Button */}
        <div className="pt-3">
          <button
            onClick={handleClick}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#002452] font-body text-xs md:text-sm font-extrabold uppercase tracking-wider hover:bg-[#F59E0B] hover:text-[#002452] transition-all duration-300 shadow-2xl rounded-xl cursor-pointer"
          >
            <span>Explore the Digital Mine</span>
            <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};
