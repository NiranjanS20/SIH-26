import React, { useState } from 'react';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: string;
  icon: string;
  tagline: string;
  summary: string;
  operationalPurpose: string;
  inputs: string[];
  outputs: string[];
  analyticalEngine: string;
  features: string[];
  statusBadge: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: 'mine-overview',
    number: '01',
    title: 'Mine Overview',
    category: 'Spatial & Lease Mapping',
    icon: 'map',
    tagline: 'High-resolution geospatial lease boundary mapping, GIS zoning, and surface infrastructure explorer.',
    summary: 'A unified GIS spatial intelligence system that overlays georeferenced satellite imagery, cadastral lease boundaries, environmental clearance zones, and surface elevation contours across Dongri Buzurg and MOIL active mining concessions.',
    operationalPurpose: 'Ensures strict statutory lease compliance, visualizes active pit extraction perimeters against buffer boundaries, and provides geospatial orientation for heavy haulage routing.',
    inputs: [
      'Cadastral shapefiles (KML / GeoJSON / Shapefile)',
      'High-res multispectral satellite imagery (Sentinel/Planet)',
      'Forest & revenue land clearance boundary limits',
      'Surface elevation contours & haul road gradients'
    ],
    outputs: [
      'Interactive multi-layer GIS spatial maps',
      'Lease buffer encroachment alerts & clearance logs',
      'Haul road elevation & slope analysis profiles',
      'Spatial audit summaries for regulatory reporting'
    ],
    analyticalEngine: 'Geospatial Coordinate Projection & GIS Layer Fusion',
    features: ['Lease Boundary Shapefiles', 'Forest & Revenue Layers', 'Satellite Pit Overlay', 'Elevation & Slope Profiling', 'Spatial Haulage Routing', 'Encroachment Warning Zones'],
    statusBadge: 'ACTIVE • GIS LAYER 1'
  },
  {
    id: 'production-intelligence',
    number: '02',
    title: 'Production Intelligence',
    category: 'Production & Output Trends',
    icon: 'analytics',
    tagline: 'Time-series production analytics, shift-wise extraction tracking, and predictive shortfall anticipation.',
    summary: 'A predictive production intelligence module that tracks historical and real-time ore extraction, ROM (Run-of-Mine) output, and manganese grade yields against monthly targets to anticipate supply deficits before they impact dispatches.',
    operationalPurpose: 'Detects extraction bottlenecks early, evaluates shift efficiency, and provides multi-month forward projections so mine managers can proactively rebalance excavator and haulage rosters.',
    inputs: [
      'Daily shift extraction & loading tallies',
      'Weighbridge load-cell gross & tare telemetry',
      'ROM manganese grade laboratory assays (Mn%, Fe%)',
      'Monthly corporate production quota benchmarks'
    ],
    outputs: [
      'Multi-month forward production forecasts',
      'Target vs. Actual variance tracking curves',
      'Shift-wise tonnage & equipment efficiency breakdowns',
      'Early shortfall probability alerts with tonnage gap estimates'
    ],
    analyticalEngine: 'Time-Series Decomposition & Production Variance ML',
    features: ['Shift-Wise Extraction Analytics', 'Target vs Actual Variance', 'Time-Series Forecast Engine', 'Weighbridge & Dispatch Audit', 'Grade Yield Monitoring', 'Bottleneck Early Warnings'],
    statusBadge: 'ACTIVE • MODEL 2 ENGINE'
  },
  {
    id: 'mine-intelligence',
    number: '03',
    title: 'Mine Intelligence',
    category: 'Geological & Reserve Analysis',
    icon: 'psychology',
    tagline: 'Subsurface 3D geological modeling, borehole core synthesis, and UNFC reserve estimation.',
    summary: 'An advanced geological intelligence system that processes diamond core drill logs, lithological cross-sections, and chemical assays to construct high-confidence 3D manganese vein block models and UNFC reserve classifications.',
    operationalPurpose: 'Empowers exploration geologists and mine planning engineers to identify rich manganese-bearing zones, optimize cut-off grades, and delineate future pit expansions with minimal exploration risk.',
    inputs: [
      'Diamond core borehole lithology & stratigraphy logs',
      'Multi-element chemical assays (Mn, Fe, SiO2, P)',
      'Geophysical resistivity & magnetic survey profiles',
      'Structural fault line & seam dip/strike vectors'
    ],
    outputs: [
      '3D manganese seam block model & grade distribution',
      'UNFC Category (111/121/122) reserve classifications',
      'Cut-off grade optimization curves for economic viability',
      'Exploration prospectivity heatmaps & next-hole recommendations'
    ],
    analyticalEngine: '3D Spatial Kriging & Geostatistical Reserve Estimation',
    features: ['Borehole Core Log Analysis', '3D Seam & Lithology Modeling', 'UNFC Reserve Categorization', 'Multi-Element Chemical Assays', 'Cut-Off Grade Optimization', 'Exploration Prospectivity Scoring'],
    statusBadge: 'ACTIVE • MODEL 1 PROSPECTIVITY'
  },
  {
    id: 'decision-support',
    number: '04',
    title: 'Decision Support',
    category: 'Operations & Risk Management',
    icon: 'tune',
    tagline: 'AI-driven operational bottleneck diagnosis, SHAP root-cause attribution, and prescriptive corrective action.',
    summary: 'A machine-learning decision support engine that evaluates heavy machinery breakdowns, monsoon rainfall delays, and blasting halts, using XGBoost and SHAP factor attribution to prescribe actionable operational recovery plans.',
    operationalPurpose: 'Identifies the root causes of production deficits in real time and calculates the exact recoverable tonnage achievable through specific interventions like deploying standby excavators or sump dewatering.',
    inputs: [
      'Heavy Earth Moving Machinery (HEMM) availability telematics',
      'IoT rainfall precipitation & pit water level sensors',
      'Blasting schedule, vibration logs & misfire records',
      'Haulage cycle turnaround times and shovel wait latencies'
    ],
    outputs: [
      'SHAP root-cause factor contribution breakdown',
      'Prioritized operational risk severity ranking (High/Med/Low)',
      'Prescriptive corrective action protocols with step-by-step guidance',
      'Modeled tonnage recovery potential calculations'
    ],
    analyticalEngine: 'XGBoost Risk Classifier & SHAP Factor Attribution',
    features: ['SHAP Root-Cause Attribution', 'HEMM Equipment Telematics', 'Monsoon & Weather Risk Models', 'Blasting Delay Assessment', 'Prescriptive Recovery Protocols', 'Tonnage Recovery Calculations'],
    statusBadge: 'ACTIVE • MODELS 3-5 ENGINE'
  },
  {
    id: 'reports',
    number: '05',
    title: 'Reports',
    category: 'Operational & Executive Summaries',
    icon: 'description',
    tagline: 'Automated executive reporting, statutory compliance document generation, and structured data exports.',
    summary: 'A centralized operational documentation engine that compiles production records, environmental clearances, safety logs, and predictive risk indicators into publication-ready executive scorecards and Indian Bureau of Mines (IBM) compliance packets.',
    operationalPurpose: 'Eliminates manual reporting overhead, maintains statutory regulatory compliance, and provides MOIL leadership with instant, auditable operational briefs for board and ministry meetings.',
    inputs: [
      'Centralized operational database & shift log feeds',
      'Environmental monitoring station telemetry',
      'Safety incident records & statutory audit checkpoints',
      'Monthly production, dispatch, and grade reconciliations'
    ],
    outputs: [
      'Automated IBM Form F1/F2 statutory compliance packets',
      'Executive board-ready production & risk summaries',
      'One-click multi-format data exports (PDF, CSV, JSON)',
      'Automated shift briefing digests and management alerts'
    ],
    analyticalEngine: 'Automated Report Synthesis & Regulatory Schema Generator',
    features: ['IBM Statutory Form Generation', 'Executive Performance Scorecards', 'Environmental Compliance Logs', 'One-Click CSV / PDF Exports', 'Shift Supervisor Briefings', 'Automated Email Digest Engine'],
    statusBadge: 'ACTIVE • COMPLIANCE SUITE'
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
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002452] animate-pulse" />
            <p className="font-body text-xs font-bold text-[#747780] tracking-[0.2em] uppercase">
              DIGITAL MINE SERVICES & ARCHITECTURE
            </p>
          </div>
          <h3 className="font-headline text-3xl md:text-4xl lg:text-[42px] font-extrabold text-[#002452] tracking-tight uppercase">
            Explore the tools available across your{' '}
            <span className="bg-[#002452] text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md border border-[#002452]/20">
              mine operations.
            </span>
          </h3>
          <p className="mt-3 text-sm text-[#44474F] font-medium max-w-2xl">
            Select any tool below to view its functional description, operational purpose, key inputs, and analytical deliverables.
          </p>
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

                  {/* Right Controls: High-Contrast View Description Action + Chevron */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* View Description Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAccordion(service.id);
                      }}
                      className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#002452] hover:bg-[#002452] hover:text-white font-body text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg border border-[#002452]/25 group/btn cursor-pointer"
                    >
                      <span>{isOpen ? 'HIDE DETAILS' : 'VIEW DESCRIPTION'}</span>
                      <span className="material-symbols-outlined text-base text-[#F59E0B] transition-transform duration-300 group-hover/btn:translate-x-0.5">
                        {isOpen ? 'expand_less' : 'description'}
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
                  <div className="px-6 pb-7 sm:px-7 sm:pb-8 pt-5 border-t border-[#002452]/20 bg-gradient-to-b from-[#7B9FE8]/25 via-[#DFE7F9] to-[#E6EEFA] animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                    
                    {/* Tagline & System Scope */}
                    <div className="p-4 rounded-xl bg-white/80 border border-[#002452]/15 shadow-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#002452] text-white">
                          {service.statusBadge}
                        </span>
                        <span className="text-[11px] font-bold text-[#002452]/70 uppercase tracking-wider">
                          Module Functional Overview
                        </span>
                      </div>
                      <p className="font-body text-sm sm:text-base text-[#002452] font-bold leading-snug">
                        {service.tagline}
                      </p>
                    </div>

                    {/* What This Tool Is & Operational Purpose Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* What It Is */}
                      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#002452]/15 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-[#002452]">
                          <span className="material-symbols-outlined text-xl text-[#0E7C7B]">info</span>
                          <span className="font-headline text-xs font-black uppercase tracking-wider">
                            What This Tool Is
                          </span>
                        </div>
                        <p className="text-xs text-[#333842] leading-relaxed font-medium">
                          {service.summary}
                        </p>
                      </div>

                      {/* Operational Purpose */}
                      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#002452]/15 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-[#002452]">
                          <span className="material-symbols-outlined text-xl text-[#F59E0B]">target</span>
                          <span className="font-headline text-xs font-black uppercase tracking-wider">
                            Operational Purpose
                          </span>
                        </div>
                        <p className="text-xs text-[#333842] leading-relaxed font-medium">
                          {service.operationalPurpose}
                        </p>
                      </div>
                    </div>

                    {/* Inputs & Outputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Key Inputs */}
                      <div className="p-4 rounded-xl bg-white/90 border border-[#002452]/15 space-y-2.5">
                        <span className="font-headline text-[11px] font-black uppercase tracking-widest text-[#002452] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-blue-600">input</span>
                          Data Inputs & Telemetry Streams
                        </span>
                        <ul className="space-y-1.5">
                          {service.inputs.map((input, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#2A303C] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#002452] mt-1.5 shrink-0" />
                              <span>{input}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable Deliverables */}
                      <div className="p-4 rounded-xl bg-white/90 border border-[#002452]/15 space-y-2.5">
                        <span className="font-headline text-[11px] font-black uppercase tracking-widest text-[#002452] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-emerald-600">output</span>
                          Analytical Deliverables & Outputs
                        </span>
                        <ul className="space-y-1.5">
                          {service.outputs.map((output, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[#2A303C] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                              <span>{output}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Module Capabilities Chips */}
                    <div>
                      <span className="font-headline text-[11px] font-extrabold uppercase tracking-widest text-[#002452]/80 block mb-3">
                        Key Module Capabilities
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {service.features.map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#002452]/15 shadow-2xs hover:bg-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[#F59E0B] text-base">check_circle</span>
                            <span className="font-body text-xs font-bold text-[#002452]">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar inside Drawer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#002452]/20">
                      <div className="text-[11px] text-[#002452]/80 font-mono font-medium">
                        Engine: <span className="font-bold text-[#002452]">{service.analyticalEngine}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectService && (
                          <button
                            type="button"
                            onClick={() => onSelectService(service)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#002452] text-white font-body text-xs font-bold uppercase tracking-wider hover:bg-[#1B3A6B] transition-colors shadow-md cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm text-[#F59E0B]">menu_book</span>
                            <span>View Full Specification</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleAccordion(service.id)}
                          className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-[#002452] font-body text-xs font-bold uppercase tracking-wider transition-colors border border-[#002452]/20 cursor-pointer"
                        >
                          Close Details
                        </button>
                      </div>
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
