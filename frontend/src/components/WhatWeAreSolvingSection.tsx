import React from 'react';

export const WhatWeAreSolvingSection: React.FC = () => {
  const contentBlocks = [
    {
      number: '01',
      tag: 'GEOLOGY & RESERVES',
      title: 'IDENTIFY MANGANESE POTENTIAL',
      outcomeChip: 'MANGANESE ZONE MAPPING',
      text: (
        <>
          Analyse geological and spatial indicators to{' '}
          <strong className="font-semibold text-[#002452] bg-[#EBF2FA] px-1.5 py-0.5 rounded">
            identify areas with potential manganese mineralization
          </strong>{' '}
          and support{' '}
          <strong className="font-semibold text-[#002452]">
            more informed reserve assessment
          </strong>.
        </>
      ),
    },
    {
      number: '02',
      tag: 'PRODUCTION RISK',
      title: 'PREDICT PRODUCTION SHORTFALLS',
      outcomeChip: 'SHORTFALL EARLY WARNING',
      text: (
        <>
          Analyse historical production and operational constraints such as{' '}
          <strong className="font-semibold text-[#002452]">
            equipment downtime, weather conditions and blasting delays
          </strong>{' '}
          to{' '}
          <strong className="font-semibold text-[#002452] bg-[#EBF2FA] px-1.5 py-0.5 rounded">
            identify the risk of falling below planned production
          </strong>.
        </>
      ),
    },
    {
      number: '03',
      tag: 'DECISION SUPPORT',
      title: 'RECOMMEND CORRECTIVE ACTIONS',
      outcomeChip: 'CONTINUOUS ORE AVAILABILITY',
      text: (
        <>
          Translate identified risks into actionable recommendations, such as{' '}
          <strong className="font-semibold text-[#002452]">
            adjusting mine schedules, optimizing blasting activities or reallocating equipment
          </strong>{' '}
          to help{' '}
          <strong className="font-semibold text-[#855300] bg-[#FEF3C7] px-1.5 py-0.5 rounded">
            maintain continuous ore availability
          </strong>.
        </>
      ),
    },
  ];

  return (
    <section id="solving" className="relative py-24 md:py-32 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] px-6 md:px-12 border-t border-b border-[#C4C6D0]/30 overflow-hidden fade-in-section is-visible">
      
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-14 items-start">
          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[50px] leading-tight lg:leading-[58px] font-extrabold text-[#002452] tracking-tight uppercase">
              From uncertain reserves to{' '}
              <span className="bg-[#F59E0B] text-[#002452] px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md">
                predictable production.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <div className="p-6 md:p-7 rounded-2xl bg-white/95 backdrop-blur-sm border border-[#C4C6D0]/50 shadow-md relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#002452] via-[#1B3A6B] to-[#F59E0B]" />
              <p className="font-body text-base md:text-[16px] leading-relaxed text-[#44474F]">
                <strong className="font-bold text-[#002452]">MOIL Mine Intelligence</strong> combines{' '}
                <span className="font-semibold text-[#002452] bg-[#002452]/5 px-1.5 py-0.5 rounded">
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

        {/* Three Solution Cards (Polished, High-Precision Executive Styling) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {contentBlocks.map((block, idx) => (
            <div 
              key={idx} 
              className="group relative flex flex-col justify-between rounded-none bg-white border-2 border-[#002452] shadow-[0_4px_20px_-4px_rgba(0,36,82,0.08)] hover:shadow-[0_12px_32px_-6px_rgba(0,36,82,0.16)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Darker Blue Tinted Card Header */}
              <div className="px-6 sm:px-8 pt-6 pb-5 bg-[#D4E5F8] border-b-2 border-[#002452] space-y-3.5">
                <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
                  <div className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-[#002452]/20 bg-white shadow-2xs whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-[#002452] tracking-wider uppercase">
                      {block.number} · {block.tag}
                    </span>
                  </div>

                  <div className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white border border-[#002452]/15 shadow-2xs whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold text-slate-700 tracking-wider uppercase">
                      {block.outcomeChip}
                    </span>
                  </div>
                </div>

                {/* Card Headline inside Header */}
                <h3 className="font-headline font-black text-lg sm:text-[21px] text-[#002452] tracking-tight uppercase leading-snug">
                  {block.title}
                </h3>
              </div>

              {/* Card Content Body */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Body Content with Subtly Highlighted Insights */}
                  <p className="font-body text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-normal">
                    {block.text}
                  </p>
                </div>

                {/* Card Footer: Target Outcome Label */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-mono text-[10.5px] font-extrabold text-slate-400 tracking-[0.15em] uppercase">
                    TARGET OUTCOME
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>ACTIVE</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
