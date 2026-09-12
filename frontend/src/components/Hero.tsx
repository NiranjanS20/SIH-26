import React, { useState, useRef, useEffect } from 'react';

interface HeroProps {
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Hero video autoplay prevented or failed:", err);
      });
    }
  }, []);

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const minesSection = document.getElementById('mines');
      if (minesSection) {
        minesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="relative w-full min-h-screen h-screen flex items-center justify-center overflow-hidden bg-[#002452]">
      {/* Fallback & Poster Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center w-full h-full z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url('/assets/dongri-buzurg-mine.png')`
        }}
      />

      {/* Background Video - Plays once and stops at the end without looping */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source 
          src="/ff31-6f36-40d6-8de9-cbcd69e6527b.mp4" 
          type="video/mp4" 
        />
        <source 
          src="/assets/ff31-6f36-40d6-8de9-cbcd69e6527b.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* Dark Navy Overlay (Stitch #002452 / 40%-80% opacity) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#002452]/75 via-[#002452]/50 to-[#002452]/85 z-10 pointer-events-none" />



      {/* Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto pt-20 md:pt-24 fade-in-section is-visible">
        {/* Display Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight md:leading-[72px] font-bold text-white mb-6 tracking-tight drop-shadow-md">
          MOIL Digital Mine Portal
        </h1>

        {/* Subtitle */}
        <p className="font-headline text-xl sm:text-2xl md:text-[28px] leading-snug md:leading-9 font-normal text-white/90 mb-10 max-w-2xl mx-auto">
          Smarter Mining. Better Decisions.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleExplore}
            className="group inline-flex items-center gap-3 px-8 py-4 border border-white/50 bg-white/10 backdrop-blur-md text-white font-body text-xs md:text-sm font-semibold uppercase tracking-widest hover:bg-white hover:text-[#002452] transition-all duration-300 shadow-lg hover:shadow-xl rounded-sm"
          >
            <span>Explore Mine</span>
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div 
        onClick={handleExplore}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/70 hover:text-white flex flex-col items-center gap-1 cursor-pointer group transition-colors"
        title="Scroll to explore operations"
      >
        <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-white/80 group-hover:text-white">
          Scroll to Explore
        </span>
        <span className="material-symbols-outlined text-2xl animate-bounce text-[#F59E0B]">
          keyboard_arrow_down
        </span>
      </div>

      {/* Decorative Bottom Bar Accent */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent z-20 opacity-60"></div>
    </section>
  );
};

