import React, { useState, useRef, useEffect } from 'react';

interface HeroProps {
  onExploreClick?: () => void;
  onReserveMapClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
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

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsVideoEnded(false);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setIsVideoEnded(false);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
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

      {/* Background Video - Plays once and pauses at the end (no loop) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onCanPlay={() => setVideoLoaded(true)}
        onEnded={() => {
          setIsVideoEnded(true);
          setIsPlaying(false);
        }}
        className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source 
          src="/assets/hero-bg.mp4" 
          type="video/mp4" 
        />
      </video>

      {/* Dark Navy Overlay (Stitch #002452 / 40%-80% opacity) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#002452]/75 via-[#002452]/50 to-[#002452]/85 z-10 pointer-events-none" />

      {/* Video Control Button (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {isVideoEnded ? (
          <button
            onClick={handleReplay}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/90 hover:text-white text-xs font-body rounded-full transition-all border border-white/20"
            title="Replay Hero Video"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
            <span>Replay Video</span>
          </button>
        ) : (
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/80 hover:text-white rounded-full transition-all border border-white/20"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            <span className="material-symbols-outlined text-sm">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto pt-20 md:pt-24 fade-in-section is-visible">
        {/* Display Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight md:leading-[72px] font-bold text-white mb-6 tracking-tight drop-shadow-md">
          MOIL Digital Mine Portal
        </h1>

        {/* Subtitle */}
        <p className="font-headline text-xl sm:text-2xl md:text-[28px] leading-snug md:leading-9 font-normal text-white/90 mb-10 max-w-2xl mx-auto">
          AI & Space Technology for Reserve Identification & Production Assurance
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleExplore}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-body text-xs md:text-sm font-extrabold uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl rounded-sm cursor-pointer"
          >
            <span>🗺️ Explore Mines & Operational Footprint</span>
            <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
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

