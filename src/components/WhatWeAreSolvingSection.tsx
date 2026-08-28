import React from 'react';

export const WhatWeAreSolvingSection: React.FC = () => {
  const contentBlocks = [
    {
      number: '01',
      tag: 'GEOLOGY & RESERVES',
      title: 'IDENTIFY MANGANESE POTENTIAL',
      badgeColor: 'from-[#002452] to-[#1B3A6B]',
      pillBg: 'bg-[#002452]/5 text-[#002452]',
      borderColor: 'border-[#002452]/20',
      outcomeChip: 'Manganese Zone Mapping',
      text: (
        <>
          Analyse geological and spatial indicators to{' '}
          <strong className="font-semibold text-[#002452] bg-[#002452]/5 px-1 py-0.5 rounded">
            identify areas with potential manganese mineralization
          </strong>{' '}
          and support{' '}
          <strong className="font-semibold text-[#002452]">
            more informed reserve assessment
          </strong>.
        </>
      )
    },
    {
      number: '02',
      tag: 'PRODUCTION RISK',
      title: 'PREDICT PRODUCTION SHORTFALLS',
      badgeColor: 'from-[#1B3A6B] to-[#0088FF]',
      pillBg: 'bg-[#1B3A6B]/5 text-[#1B3A6B]',
      borderColor: 'border-[#1B3A6B]/20',
      outcomeChip: 'Shortfall Early Warning',
      text: (
        <>
          Analyse historical production and operational constraints such as{' '}
          <strong className="font-semibold text-[#002452]">
            equipment downtime, weather conditions and blasting delays
          </strong>{' '}
          to{' '}
          <strong className="font-semibold text-[#002452] bg-[#002452]/5 px-1 py-0.5 rounded">
            identify the risk of falling below planned production
          </strong>.
        </>
      )
    },
    {
      number: '03',
      tag: 'DECISION SUPPORT',
      title: 'RECOMMEND CORRECTIVE ACTIONS',
      badgeColor: 'from-[#855300] to-[#F59E0B]',
      pillBg: 'bg-[#F59E0B]/10 text-[#855300]',
      borderColor: 'border-[#F59E0B]/30',
      outcomeChip: 'Continuous Ore Availability',
      text: (
        <>
          Translate identified risks into actionable recommendations, such as{' '}
          <strong className="font-semibold text-[#002452]">
            adjusting mine schedules, optimizing blasting activities or reallocating equipment
          </strong>{' '}
          to help{' '}
          <strong className="font-semibold text-[#855300] bg-[#F59E0B]/10 px-1 py-0.5 rounded">
            maintain continuous ore availability
          </strong>.
        </>
      )
    }
  ];

  return (
    <section id="solving" className="relative py-28 md:py-36 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] px-6 md:px-12 border-t border-b border-[#C4C6D0]/30 overflow-hidden fade-in-section is-visible">
      
      {/* Background Decorative Mesh & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#002452_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.025] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#002452]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Section Label Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-8 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
          <p className="font-body text-xs font-bold text-[#002452] tracking-[0.2em] uppercase">
            WHAT WE’RE SOLVING
          </p>
        </div>

        {/* Main Heading & Supporting Paragraph Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-16 items-start">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-tight lg:leading-[60px] font-extrabold text-[#002452] tracking-tight uppercase">
              From uncertain reserves to{' '}
              <span className="bg-[#F59E0B] text-[#002452] px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md">
                predictable production.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 md:p-7 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#C4C6D0]/50 shadow-md relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#002452] via-[#1B3A6B] to-[#F59E0B]" />
              <p className="font-body text-base md:text-[17px] leading-relaxed text-[#44474F]">
                <strong className="font-bold text-[#002452]">MOIL Mine Intelligence</strong> combines{' '}
                <span className="font-semibold text-[#002452] bg-[#002452]/5 px-1 py-0.5 rounded">
                  geological, production, operational and environmental data
                </span>{' '}
                to address two critical mining challenges:{' '}
                <span className="font-semibold text-[#002452] underline decoration-[#002452]/30 decoration-2 underline-offset-4">
                  identifying potential manganese-bearing zones more accurately
                </span>{' '}
                and{' '}
                <span className="font-semibold text-[#855300] underline decoration-[#F59E0B]/50 decoration-2 underline-offset-4">
                  anticipating production shortfalls before they impact ore availability
                </span>.
              </p>
            </div>
          </div>
        </div>

        {/* Three Solution Cards (Enhanced Visual Appeal & Clear Text Highlights) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
          {contentBlocks.map((block, idx) => (
            <div 
              key={idx} 
              className="group relative flex flex-col justify-between p-7 md:p-8 rounded-2xl bg-white/95 backdrop-blur-md border border-[#C4C6D0]/50 shadow-md hover:shadow-2xl hover:border-[#002452]/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r ${block.badgeColor}`} />

              <div className="space-y-5">
                {/* Number & Category Pill */}
                <div className="flex items-center justify-between">
                  <span className={`font-headline text-xs font-extrabold tracking-[0.2em] px-3 py-1 rounded-full ${block.pillBg} border ${block.borderColor}`}>
                    {block.number} · {block.tag}
                  </span>
                  <span className="text-[11px] font-bold text-[#747780] uppercase tracking-wider bg-[#F6F3F2] px-2.5 py-0.5 rounded-md border border-[#C4C6D0]/30">
                    {block.outcomeChip}
                  </span>
                </div>

                {/* Block Title */}
                <h3 className="font-headline text-xl font-extrabold text-[#002452] tracking-wide uppercase leading-snug group-hover:text-[#1B3A6B] transition-colors">
                  {block.title}
                </h3>

                {/* Highlighted Body Content */}
                <p className="font-body text-sm text-[#5C5F6A] leading-relaxed">
                  {block.text}
                </p>
              </div>

              {/* Bottom Subtle Status Indicator */}
              <div className="mt-8 pt-4 border-t border-[#F0EDED] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#747780] tracking-wider uppercase">
                  Target Outcome
                </span>
                <span className="text-xs font-bold text-[#002452] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Core Solution <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
