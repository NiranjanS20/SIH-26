import React, { useState, useRef } from 'react';

export interface MineData {
  id: string;
  name: string;
  leaseId: string;
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
    leaseId: 'MOIL-DG-01',
    location: 'Bhandara District, Maharashtra',
    status: 'Operational',
    type: 'Open Cast Mine',
    mineral: 'High-Grade Manganese Dioxide',
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
  },
  {
    id: 'chikla',
    name: 'CHIKLA',
    leaseId: 'MOIL-CK-02',
    location: 'Bhandara District, Maharashtra',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'High-Grade Braunite Ore',
    annualOutput: '250,000 Tonnes',
    depth: '210 Meters',
    image: '/assets/filter_bar_mining_bg.jpg',
    description: 'Chikla is a premier underground operation in the Dongri-Chikla suture belt, featuring sub-level stoping, heavy electric hoists, and continuous stope monitoring.',
    kpis: [
      { label: 'Daily Output', value: '820 TPD' },
      { label: 'Ore Grade (Mn)', value: '42.0%' },
      { label: 'Winder Shafts', value: '2 Active' },
      { label: 'Safety Record', value: '980 Days LTI Free' }
    ]
  },
  {
    id: 'kandri',
    name: 'KANDRI',
    leaseId: 'MOIL-KD-03',
    location: 'Nagpur District, Maharashtra',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'Metallurgical Manganese Ore',
    annualOutput: '290,000 Tonnes',
    depth: '240 Meters',
    image: '/assets/site_profile_mine_bg.jpg',
    description: 'Kandri is renowned for producing exceptionally high-grade manganese ore with deep shaft winders, geological structural mapping, and automated ventilation fans.',
    kpis: [
      { label: 'Daily Output', value: '950 TPD' },
      { label: 'Ore Grade (Mn)', value: '45.8%' },
      { label: 'Shaft Depth', value: '240m Active' },
      { label: 'Safety Record', value: '1,120 Days LTI Free' }
    ]
  },
  {
    id: 'mansar',
    name: 'MANSAR',
    leaseId: 'MOIL-MS-04',
    location: 'Nagpur District, Maharashtra',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'Siliceous Manganese Ore',
    annualOutput: '165,000 Tonnes',
    depth: '180 Meters',
    image: '/assets/mine_environment_landscape.jpg',
    description: 'Mansar mine harnesses underground decline haulage and dense sensory grids to extract high-purity metallurgical grade ore along the Ramtek-Mansar shear zone.',
    kpis: [
      { label: 'Daily Output', value: '550 TPD' },
      { label: 'Ore Grade (Mn)', value: '39.5%' },
      { label: 'Haul Decline', value: '1:7 Incline' },
      { label: 'Safety Record', value: '890 Days LTI Free' }
    ]
  },
  {
    id: 'gumgaon',
    name: 'GUMGAON',
    leaseId: 'MOIL-GG-05',
    location: 'Nagpur District, Maharashtra',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'High-Grade Braunite Ore',
    annualOutput: '185,000 Tonnes',
    depth: '225 Meters',
    image: '/assets/filter_bar_mining_bg.jpg',
    description: 'Located near Khapa in Nagpur district, Gumgaon operates vertical shaft production systems accessing steeply dipping, high-grade braunite manganese horizons.',
    kpis: [
      { label: 'Daily Output', value: '620 TPD' },
      { label: 'Ore Grade (Mn)', value: '41.2%' },
      { label: 'Main Shaft', value: '225m Vertical' },
      { label: 'Safety Record', value: '740 Days LTI Free' }
    ]
  },
  {
    id: 'beldongri',
    name: 'BELDONGRI',
    leaseId: 'MOIL-BD-06',
    location: 'Nagpur District, Maharashtra',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'Ferromanganese Grade Ore',
    annualOutput: '120,000 Tonnes',
    depth: '160 Meters',
    image: '/assets/site_profile_mine_bg.jpg',
    description: 'Beldongri executes precision room-and-pillar stoping with geotechnical roof-bolt telemetry to mine specialized ferromanganese-grade ore deposits.',
    kpis: [
      { label: 'Daily Output', value: '410 TPD' },
      { label: 'Ore Grade (Mn)', value: '38.0%' },
      { label: 'Stopes Active', value: '4 Levels' },
      { label: 'Safety Record', value: '1,050 Days LTI Free' }
    ]
  },
  {
    id: 'balaghat',
    name: 'BALAGHAT (BHARWELI)',
    leaseId: 'MOIL-BG-07',
    location: 'Balaghat District, Madhya Pradesh',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'Super High-Grade Manganese',
    annualOutput: '580,000 Tonnes',
    depth: '385 Meters',
    image: '/assets/mine_environment_landscape.jpg',
    description: 'Asia’s deepest underground manganese mine, Balaghat (Bharweli) produces world-class high-grade ore with advanced multi-level vertical hoisting shafts and telemetry.',
    kpis: [
      { label: 'Daily Output', value: '1,950 TPD' },
      { label: 'Ore Grade (Mn)', value: '48.5%' },
      { label: 'Depth Record', value: '385m Asia Max' },
      { label: 'Safety Record', value: '1,450 Days LTI Free' }
    ]
  },
  {
    id: 'ukwa',
    name: 'UKWA',
    leaseId: 'MOIL-UK-08',
    location: 'Balaghat District, Madhya Pradesh',
    status: 'Operational',
    type: 'Underground Mine',
    mineral: 'Tabular Manganese Seams',
    annualOutput: '210,000 Tonnes',
    depth: '195 Meters',
    image: '/assets/filter_bar_mining_bg.jpg',
    description: 'Ukwa is situated in the scenic Baihar plateau, mining continuous tabular manganese strata through an extensive network of winches and electric locomotive haulage.',
    kpis: [
      { label: 'Daily Output', value: '700 TPD' },
      { label: 'Ore Grade (Mn)', value: '42.5%' },
      { label: 'Haulage Rail', value: '3.2 km Track' },
      { label: 'Safety Record', value: '920 Days LTI Free' }
    ]
  },
  {
    id: 'tirodi',
    name: 'TIRODI',
    leaseId: 'MOIL-TR-09',
    location: 'Balaghat District, Madhya Pradesh',
    status: 'Operational',
    type: 'Open Cast Mine',
    mineral: 'High-Purity Pyrolusite',
    annualOutput: '310,000 Tonnes',
    depth: '90 Meters',
    image: '/assets/dongri-buzurg-mine.png',
    description: 'Tirodi is a major open-cast operation in Madhya Pradesh with expansive multi-bench terraces, heavy excavation shovels, and automated optical grade sorters.',
    kpis: [
      { label: 'Daily Output', value: '1,050 TPD' },
      { label: 'Ore Grade (Mn)', value: '43.0%' },
      { label: 'Bench Levels', value: '8 Active' },
      { label: 'Safety Record', value: '1,310 Days LTI Free' }
    ]
  },
  {
    id: 'sitapatore',
    name: 'SITAPATORE',
    leaseId: 'MOIL-SP-10',
    location: 'Balaghat District, Madhya Pradesh',
    status: 'Operational',
    type: 'Open Cast Mine',
    mineral: 'Manganese Dioxide Ore',
    annualOutput: '140,000 Tonnes',
    depth: '70 Meters',
    image: '/assets/site_profile_mine_bg.jpg',
    description: 'Sitapatore conducts mechanized open-pit mining of manganese dioxide ore with digital pit surveying, in-pit crushing units, and dedicated water reclamation systems.',
    kpis: [
      { label: 'Daily Output', value: '480 TPD' },
      { label: 'Ore Grade (Mn)', value: '37.5%' },
      { label: 'Crusher Unit', value: '250 TPH' },
      { label: 'Safety Record', value: '880 Days LTI Free' }
    ]
  },

];

export const MineCardSection: React.FC<MineCardSectionProps> = ({ onOpenMineModal }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetChild = container.children[index] as HTMLElement;
      if (targetChild) {
        targetChild.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
      setCurrentIndex(index);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    } else {
      scrollToIndex(minesList.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < minesList.length - 1) {
      scrollToIndex(currentIndex + 1);
    } else {
      scrollToIndex(0);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      if (cardWidth > 0) {
        const calculatedIndex = Math.round(scrollLeft / cardWidth);
        if (calculatedIndex >= 0 && calculatedIndex < minesList.length && calculatedIndex !== currentIndex) {
          setCurrentIndex(calculatedIndex);
        }
      }
    }
  };

  return (
    <section id="mines" className="relative py-16 md:py-24 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] px-4 sm:px-6 md:px-12 border-t border-[#C4C6D0]/40 overflow-hidden fade-in-section is-visible">
      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Title Header & Carousel Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
              <p className="font-body text-[11px] font-bold text-[#002452] tracking-[0.2em] uppercase">
                MOIL OPERATIONAL ASSETS • {minesList.length} MINES
              </p>
            </div>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold text-[#002452] tracking-tight uppercase">
              Digital Mine{' '}
              <span className="bg-[#F59E0B] text-[#002452] px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md">
                Command Center
              </span>
            </h3>
          </div>

          {/* Carousel Navigation Arrows & Mine Index Counter */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#002452]/5 border border-[#002452]/10 text-[#002452] font-mono text-xs font-bold tracking-wider">
              <span className="text-[#D97706]">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="text-[#747780] mx-1">/</span>
              <span>{String(minesList.length).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Mine"
                className="w-10 h-10 rounded-xl bg-white border border-[#C4C6D0]/60 hover:border-[#002452] hover:bg-[#002452] text-[#002452] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-0.5">
                  chevron_left
                </span>
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Mine"
                className="w-10 h-10 rounded-xl bg-white border border-[#C4C6D0]/60 hover:border-[#002452] hover:bg-[#002452] text-[#002452] hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer group"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-0.5">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-6 pb-6 pt-1 -mx-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {minesList.map((mine) => (
            <div
              key={mine.id}
              className="w-full shrink-0 snap-center"
            >
              {/* Executive Mine Card with Dark Blue Boundary */}
              <div className="bg-white border-2 sm:border-[2.5px] border-[#002452] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row relative">
                
                {/* Left Column (52% width on desktop): Clean Aerial Mine Image with Mine Identification Badge */}
                <div 
                  onClick={() => onOpenMineModal && onOpenMineModal(mine)}
                  className="lg:w-[52%] relative h-[320px] sm:h-[380px] lg:h-auto min-h-[420px] overflow-hidden bg-[#002452] shrink-0 cursor-pointer group"
                >
                  {/* Mine Photograph */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${mine.image}')` }}
                  />

                  {/* Gradient Shading on photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                  {/* Sleek Mine Identification Overlay Tag */}
                  <div className="absolute bottom-5 left-5 z-20 px-3.5 py-2 rounded-xl bg-[#002452]/90 backdrop-blur-md border border-white/20 text-white shadow-xl">
                    <div className="font-headline font-extrabold text-sm sm:text-base tracking-wider uppercase">
                      {mine.name} MINE
                    </div>
                    <div className="font-body text-[10px] font-bold text-[#F59E0B] tracking-widest uppercase mt-0.5">
                      {mine.type}
                    </div>
                  </div>
                </div>

                {/* Right Column (48% width on desktop): Detailed Specifications & Action Launcher */}
                <div className="lg:w-[48%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative">
                  <div>
                    {/* Header Status Row */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="font-body text-[11px] font-bold text-[#D97706] tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-[#FEA619]/10 border border-[#FEA619]/30">
                        {mine.status}
                      </span>
                      <span className="font-body text-xs font-semibold text-[#747780] tracking-widest uppercase font-mono">
                        LEASE ID: {mine.leaseId}
                      </span>
                    </div>

                    {/* Title & Location */}
                    <h4 className="font-display text-3xl sm:text-4xl lg:text-[40px] leading-tight font-extrabold text-[#002452] uppercase tracking-tight mb-2">
                      {mine.name}
                    </h4>
                    <p className="font-body text-sm text-[#44474F] flex items-center gap-2 mb-5">
                      <span className="material-symbols-outlined text-[#F59E0B] text-lg">location_on</span>
                      <span className="font-medium">{mine.location}</span>
                    </p>

                    {/* Description */}
                    <p className="font-body text-xs sm:text-sm text-[#44474F] leading-relaxed mb-6 border-b border-[#F0EDED] pb-5">
                      {mine.description}
                    </p>

                    {/* Telemetry Metrics Grid (Pure Lightweight CSS, Zero JS Overhead) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/50 hover:border-[#002452]/40 transition-colors shadow-2xs">
                        <div className="flex items-center gap-2 text-[#002452] mb-1">
                          <span className="material-symbols-outlined text-base">terrain</span>
                          <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">MINE TYPE</span>
                        </div>
                        <p className="font-headline text-sm font-bold text-[#002452] pl-6">{mine.type}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/50 hover:border-[#002452]/40 transition-colors shadow-2xs">
                        <div className="flex items-center gap-2 text-[#002452] mb-1">
                          <span className="material-symbols-outlined text-base">factory</span>
                          <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">ANNUAL OUTPUT</span>
                        </div>
                        <p className="font-headline text-sm font-bold text-[#002452] pl-6">{mine.annualOutput}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FCF9F8] border border-[#C4C6D0]/50 hover:border-[#002452]/40 transition-colors shadow-2xs">
                        <div className="flex items-center gap-2 text-[#002452] mb-1">
                          <span className="material-symbols-outlined text-base">straighten</span>
                          <span className="font-body text-[10px] font-bold text-[#747780] uppercase tracking-wider">SEAM DEPTH</span>
                        </div>
                        <p className="font-headline text-sm font-bold text-[#002452] pl-6">{mine.depth}</p>
                      </div>
                    </div>
                  </div>

                  {/* Solid Yellow Explore Button Action Launcher */}
                  <div className="pt-4 border-t border-[#F0EDED] flex items-center justify-end">
                    <button
                      onClick={() => onOpenMineModal && onOpenMineModal(mine)}
                      className="px-6 py-3.5 rounded-xl bg-[#FEA619] hover:bg-[#D97706] text-[#002452] hover:text-white font-body text-xs font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-[#FEA619] active:scale-[0.98]"
                    >
                      <span>EXPLORE WORKSPACE</span>
                      <span className="material-symbols-outlined text-base font-bold">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {minesList.map((mine, idx) => (
            <button
              key={mine.id}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to ${mine.name}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-[#002452] shadow-xs'
                  : 'w-2.5 bg-[#C4C6D0] hover:bg-[#747780]'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
