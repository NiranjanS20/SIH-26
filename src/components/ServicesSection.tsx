import React, { useState } from 'react';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  features: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: 'mine-overview',
    number: '01',
    title: 'Mine Overview',
    category: 'Spatial & Lease Mapping',
    icon: 'map',
    summary: 'View spatial data, lease boundaries, exploration records and environmental layers across Dongri Buzurg and target mining areas.',
    features: ['Lease Boundaries', 'Exploration Records', 'Environmental Indicators', 'Spatial Layer Mapping']
  },
  {
    id: 'production-intelligence',
    number: '02',
    title: 'Production Intelligence',
    category: 'Production & Output Trends',
    icon: 'analytics',
    summary: 'Analyse historical production records, target benchmarks, and production trends to evaluate output performance and identify potential shortfalls.',
    features: ['Historical Production Trends', 'Target vs Actual Analysis', 'Shortfall Identification', 'Monthly Tonnage Benchmarks']
  },
  {
    id: 'mine-intelligence',
    number: '03',
    title: 'Mine Intelligence',
    category: 'Geological & Reserve Analysis',
    icon: 'psychology',
    summary: 'Combine borehole information, geological records, and spatial indicators to identify potential manganese-bearing zones and support reserve assessment.',
    features: ['Borehole Data Analysis', 'Manganese Zone Identification', 'Ore Grade Records', 'Reserve Assessment Support']
  },
  {
    id: 'decision-support',
    number: '04',
    title: 'Decision Support',
    category: 'Operations & Risk Management',
    icon: 'tune',
    summary: 'Evaluate operational constraints including equipment downtime, weather conditions and blasting delays to recommend corrective actions for production continuity.',
    features: ['Equipment Downtime Tracking', 'Weather Impact Analysis', 'Blasting Delay Assessment', 'Schedule Adjustment Recommendations']
  },
  {
    id: 'reports',
    number: '05',
    title: 'Reports',
    category: 'Operational & Executive Summaries',
    icon: 'description',
    summary: 'Generate comprehensive summaries, operational reports, and data exports to support decision-making and executive review.',
    features: ['Operational Summary Reports', 'Executive Insights Export', 'Production Performance Summaries', 'Data & Analytics Export']
  }
];

interface ServicesSectionProps {
  onSelectService?: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  // Accordion state - default item 1 open
  const [expandedId, setExpandedId] = useState<string | null>('mine-overview');

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <section id="services" className="py-20 md:py-28 bg-[#F6F3F2] px-6 md:px-12 border-t border-[#C4C6D0]/30 fade-in-section is-visible">
      <div className="max-w-[1100px] mx-auto">
        
        {/* Header Area */}
        <div className="mb-12">
          <p className="font-body text-xs font-bold text-[#747780] mb-2 tracking-[0.2em] uppercase">
            DIGITAL MINE SERVICES
          </p>
          <h3 className="font-headline text-3xl md:text-4xl lg:text-[42px] font-extrabold text-[#002452] tracking-tight uppercase">
            Explore the tools available across your{' '}
            <span className="bg-[#002452] text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md border border-[#002452]/20">
              mine operations.
            </span>
          </h3>
        </div>

        {/* Interactive Blue Accordion Cards List */}
        <div className="space-y-4">
          {servicesData.map((service) => {
            const isOpen = expandedId === service.id;

            return (
              <div
                key={service.id}
                className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#88AAEE] border-2 border-[#002452]/40 shadow-xl ring-2 ring-[#002452]/20'
                    : 'bg-[#88AAEE]/90 hover:bg-[#88AAEE] border border-[#002452]/20 hover:border-[#002452]/40 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Accordion Trigger Header */}
                <div
                  onClick={() => toggleAccordion(service.id)}
                  className="p-6 sm:p-7 cursor-pointer flex items-center justify-between gap-4 select-none transition-colors"
                >
                  <div className="flex items-center gap-5 sm:gap-7">
                    {/* Number & Icon Badge */}
                    <div className="flex items-center gap-3.5">
                      <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#002452]">
                        {service.number}
                      </span>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-2xs bg-[#002452] text-white">
                        <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                      </div>
                    </div>

                    {/* Title & Category */}
                    <div className="flex flex-col">
                      <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[#002452]/80 mb-0.5">
                        {service.category}
                      </span>
                      <h4 className="font-headline text-xl sm:text-2xl text-[#002452] font-extrabold uppercase tracking-wide">
                        {service.title}
                      </h4>
                    </div>
                  </div>

                  {/* Right Controls: Specular Action + Accordion Chevron */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* High-Contrast Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectService) {
                          onSelectService(service);
                        } else {
                          toggleAccordion(service.id);
                        }
                      }}
                      className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#002452] hover:bg-[#002452] hover:text-white font-body text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg border border-[#002452]/25 group/btn cursor-pointer"
                    >
                      <span>OPEN TOOL</span>
                      <span className="material-symbols-outlined text-base text-[#F59E0B] transition-transform duration-300 group-hover/btn:translate-x-1">
                        arrow_forward
                      </span>
                    </button>

                    {/* Chevron Indicator */}
                    <button
                      type="button"
                      aria-label={isOpen ? "Collapse item" : "Expand item"}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isOpen
                          ? 'bg-[#002452] text-white rotate-180 shadow-sm'
                          : 'bg-[#002452]/10 text-[#002452] hover:bg-[#002452] hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl transition-transform duration-300">
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Accordion Expandable Content Drawer */}
                {isOpen && (
                  <div className="px-6 pb-7 sm:px-7 sm:pb-8 pt-5 border-t border-[#002452]/20 bg-gradient-to-b from-[#7B9FE8]/25 via-[#DFE7F9] to-[#E6EEFA] animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Summary Description */}
                    <p className="font-body text-sm sm:text-base text-[#002452] leading-relaxed mb-6 font-semibold">
                      {service.summary}
                    </p>

                    {/* Module Capabilities Chips */}
                    <div className="mb-6">
                      <span className="font-headline text-[11px] font-extrabold uppercase tracking-widest text-[#002452]/80 block mb-3">
                        Key Module Capabilities
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {service.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 border border-[#002452]/15 shadow-2xs hover:bg-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[#F59E0B] text-lg">check_circle</span>
                            <span className="font-body text-xs font-semibold text-[#002452]">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar inside Drawer */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => onSelectService && onSelectService(service)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#002452] text-white font-body text-xs font-bold uppercase tracking-wider hover:bg-[#1B3A6B] transition-colors shadow-md cursor-pointer"
                      >
                        <span>Launch Full Module</span>
                        <span className="material-symbols-outlined text-sm text-[#F59E0B]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
