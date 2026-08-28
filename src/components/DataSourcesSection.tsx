import React from 'react';
import SkewCards, { moilDataSources } from './ui/gradient-card-showcase';

export const DataSourcesSection: React.FC = () => {
  return (
    <section id="intelligence" className="py-24 md:py-32 bg-gradient-to-b from-[#F6F3F2] via-[#FCF9F8] to-[#F6F3F2] px-6 md:px-12 border-t border-[#C4C6D0]/30 overflow-hidden fade-in-section is-visible">
      <div className="max-w-[1440px] mx-auto text-center">
        
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          <p className="font-body text-xs font-bold text-[#002452] tracking-[0.2em] uppercase">
            ONE PLATFORM. MULTIPLE DATA SOURCES.
          </p>
        </div>

        {/* 3D Skewed Gradient Cards Showcase */}
        <div className="mb-12">
          <SkewCards items={moilDataSources} />
        </div>

        {/* Flow Connector Pathway */}
        <div className="flex flex-col items-center max-w-2xl mx-auto pt-6">
          {/* Vertical Connecting Line */}
          <div className="w-[2px] h-16 bg-gradient-to-b from-[#002452] to-[#F59E0B] mb-6 relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-sm animate-ping" />
          </div>

          <h3 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#002452] mb-4 tracking-widest uppercase">
            MOIL MINE INTELLIGENCE
          </h3>

          {/* Core Workflow Steps */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-xs sm:text-sm font-body text-[#747780] font-bold tracking-[0.2em] uppercase bg-white px-8 py-4 rounded-full border border-[#C4C6D0]/60 shadow-md">
            <span className="text-[#002452]">UNDERSTAND</span>
            <span className="text-[#F59E0B]">→</span>
            <span className="text-[#002452]">PREDICT</span>
            <span className="text-[#F59E0B]">→</span>
            <span className="text-[#002452]">DECIDE</span>
          </div>
        </div>

      </div>
    </section>
  );
};
