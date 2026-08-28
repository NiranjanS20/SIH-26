import React from 'react';
import Aurora from './ui/Aurora';
import SpotlightCard from './ui/SpotlightCard';
import SpecularButton from './ui/SpecularButton';

interface MineData {
  id: string;
  name: string;
  location: string;
  status: 'Operational' | 'Maintenance' | 'Expanding';
  type: string;
  mineral: string;
  annualOutput: string;
  depth: string;
  image: string;
  description: string;
  kpis: { label: string; value: string }[];
}

interface MineCardSectionProps {
  onOpenMineModal?: (mine: MineData) => void;
}

export const minesList: MineData[] = [
  {
    id: 'dongri-buzurg',
    name: 'DONGRI BUZURG',
    location: 'Bhandara District, Maharashtra',
    status: 'Operational',
    type: 'Open Cast Mine',
    mineral: 'High-Grade Manganese Ore',
    annualOutput: '550,000 Tonnes',
    depth: '140 Meters',
    image: '/assets/dongri-buzurg-mine.png',
    description: 'Dongri Buzurg is MOIL’s flagship open-cast manganese ore mine in Bhandara district. Integrated with 3D seam telemetry, automated crushing circuits, and haul fleet tracking.',
    kpis: [
      { label: 'Daily Output', value: '1,850 TPD' },
      { label: 'Ore Grade (Mn)', value: '46.5%' },
      { label: 'Heavy Fleet', value: '42 Active Units' },
      { label: 'Safety Record', value: '1,240 Days LTI Free' }
    ]
  }
];

export const MineCardSection: React.FC<MineCardSectionProps> = ({ onOpenMineModal }) => {
  const currentMine = minesList[0];

  return (
    <section id="mines" className="relative py-16 md:py-24 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] px-6 md:px-12 border-t border-[#C4C6D0]/40 overflow-hidden fade-in-section is-visible">
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#002452_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
              <p className="font-body text-[11px] font-bold text-[#002452] tracking-[0.2em] uppercase">
                FLAGSHIP OPERATION WORKSPACE
              </p>
            </div>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold text-[#002452] tracking-tight uppercase">
              Digital Mine{' '}
              <span className="bg-[#F59E0B] text-[#002452] px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md">
                Command Center
              </span>
            </h3>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-body uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% Pit Telemetry Online</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#002452] text-white text-xs font-bold font-body uppercase tracking-wider shadow-xs">
              <span className="material-symbols-outlined text-base text-[#F59E0B]">verified</span>
              <span>DGMS Approved</span>
            </div>
          </div>
        </div>

        {/* Enhanced High-Tech Executive Mine Card */}
        <div className="bg-white border border-[#C4C6D0]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group flex flex-col lg:flex-row relative">
          
          {/* Top Multi-Color Accent Gradient Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#002452] via-[#1B3A6B] to-[#F59E0B] z-30" />

          {/* Left Column (52% width on desktop): Clean Aerial Mine Image */}
          <div 
            onClick={() => onOpenMineModal && onOpenMineModal(currentMine)}
            className="lg:w-[52%] relative h-[320px] sm:h-[380px] lg:h-auto min-h-[420px] overflow-hidden bg-[#002452] shrink-0 cursor-pointer"
          >
            {/* Clean Aerial Mine Photograph */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${currentMine.image}')` }}
            />
          </div>

          {/* Right Column (48% width on desktop): Detailed Specifications & Action Launcher with Aurora Effect */}
          <div className="lg:w-[48%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative overflow-hidden">
            {/* WebGL Aurora Background Effect */}
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
              <Aurora 
                colorStops={["#002452", "#F59E0B", "#00D0FF"]} 
                blend={0.6} 
                amplitude={1.3} 
                speed={0.4} 
              />
            </div>

            <div className="relative z-10">
              {/* Header Status Row */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-body text-xs font-bold uppercase tracking-widest">
                    ACTIVE OPERATIONAL LEASE
                  </span>
                </div>
                <span className="font-body text-xs font-semibold text-[#747780] tracking-widest uppercase">
                  LEASE ID: MOIL-DG-01
                </span>
              </div>

              {/* Title & Location */}
              <h4 className="font-display text-3xl sm:text-4xl lg:text-[40px] leading-tight font-extrabold text-[#002452] uppercase tracking-tight mb-2">
                {currentMine.name}
              </h4>
              <p className="font-body text-sm text-[#44474F] flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-[#F59E0B] text-lg">location_on</span>
                <span className="font-medium">{currentMine.location}</span>
              </p>

              {/* Description */}
              <p className="font-body text-xs sm:text-sm text-[#44474F] leading-relaxed mb-6 border-b border-[#F0EDED] pb-5">
                {currentMine.description}
              </p>

              {/* Visual Telemetry Mini Cards Grid with Spotlight Effect */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <SpotlightCard 
                  spotlightColor="rgba(0, 36, 82, 0.18)"
                  className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/40 hover:border-[#002452]/50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-[#002452] mb-1">
                    <span className="material-symbols-outlined text-base">terrain</span>
                    <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">MINE TYPE</span>
                  </div>
                  <p className="font-headline text-sm font-bold text-[#002452] pl-6">{currentMine.type}</p>
                </SpotlightCard>

                <SpotlightCard 
                  spotlightColor="rgba(245, 158, 11, 0.25)"
                  className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/40 hover:border-[#F59E0B]/50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-[#F59E0B] mb-1">
                    <span className="material-symbols-outlined text-base">diamond</span>
                    <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">PRIMARY MINERAL</span>
                  </div>
                  <p className="font-headline text-sm font-bold text-[#002452] pl-6">{currentMine.mineral}</p>
                </SpotlightCard>

                <SpotlightCard 
                  spotlightColor="rgba(0, 36, 82, 0.18)"
                  className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/40 hover:border-[#002452]/50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-[#002452] mb-1">
                    <span className="material-symbols-outlined text-base">factory</span>
                    <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">ANNUAL PRODUCTION</span>
                  </div>
                  <p className="font-headline text-sm font-bold text-[#002452] pl-6">{currentMine.annualOutput}</p>
                </SpotlightCard>

                <SpotlightCard 
                  spotlightColor="rgba(0, 36, 82, 0.18)"
                  className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/40 hover:border-[#002452]/50 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-[#002452] mb-1">
                    <span className="material-symbols-outlined text-base">straighten</span>
                    <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">SEAM DEPTH</span>
                  </div>
                  <p className="font-headline text-sm font-bold text-[#002452] pl-6">{currentMine.depth}</p>
                </SpotlightCard>
              </div>
            </div>

            {/* High-Impact Specular Button Action Launcher */}
            <div className="pt-4 border-t border-[#F0EDED] flex items-center justify-between">
              <span className="font-body text-xs text-[#747780] font-semibold hidden sm:inline-block">
                ⚡ Real-time 3D & IBM Returns Sync
              </span>
              <SpecularButton
                size="md"
                radius={12}
                tint="#002452"
                tintOpacity={1}
                textColor="#ffffff"
                lineColor="#F59E0B"
                baseColor="#1B3A6B"
                intensity={1.2}
                speed={0.4}
                followMouse
                autoAnimate
                onClick={() => onOpenMineModal && onOpenMineModal(currentMine)}
                className="w-full sm:w-auto font-body text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg"
              >
                <span>OPEN DIGITAL WORKSPACE</span>
                <span className="material-symbols-outlined text-base text-[#F59E0B]">
                  arrow_forward
                </span>
              </SpecularButton>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
