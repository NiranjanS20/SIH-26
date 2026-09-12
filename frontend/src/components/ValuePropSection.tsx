import React from 'react';
import { GradientCard } from './ui/gradient-card';

export const ValuePropSection: React.FC = () => {
  const capabilities = [
    {
      tag: 'Reserve Assessment',
      title: 'Geological Intelligence',
      desc: 'Identify and understand manganese-bearing zones',
      action: 'Explore geology',
      icon: 'layers',
      gradient: 'from-[#1F2733] via-[#263140] to-[#2C3645]',
      textColor: 'text-white',
      descColor: 'text-white/85',
      badgeBg: 'bg-white/15 text-white border-white/20',
      dotColor: 'bg-[#F59E0B]',
      watermarkBg: 'bg-white/10 border-white/20 text-white',
      arrowColor: 'text-[#F59E0B]'
    },
    {
      tag: 'Output Trends',
      title: 'Production Forecasting',
      desc: 'Predict production trends and potential shortfalls',
      action: 'View trends',
      icon: 'analytics',
      gradient: 'from-[#374252] via-[#3F4B5C] to-[#485364]',
      textColor: 'text-white',
      descColor: 'text-white/85',
      badgeBg: 'bg-white/15 text-white border-white/20',
      dotColor: 'bg-[#F59E0B]',
      watermarkBg: 'bg-white/10 border-white/20 text-white',
      arrowColor: 'text-[#F59E0B]'
    },
    {
      tag: 'Risk Analysis',
      title: 'Operational Risk Analysis',
      desc: 'Analyse equipment, weather and operational constraints',
      action: 'Analyse risks',
      icon: 'shield',
      gradient: 'from-[#7C7265] via-[#8F8578] to-[#9E9487]',
      textColor: 'text-white',
      descColor: 'text-white/90',
      badgeBg: 'bg-black/20 text-white border-white/20',
      dotColor: 'bg-[#F59E0B]',
      watermarkBg: 'bg-white/15 border-white/25 text-white',
      arrowColor: 'text-[#F59E0B]'
    },
    {
      tag: 'Decision Engine',
      title: 'Decision Support',
      desc: 'Recommend corrective actions for production continuity',
      action: 'View recommendations',
      icon: 'tune',
      gradient: 'from-[#E8DCC8] via-[#EFE4D2] to-[#F5EAD9]',
      textColor: 'text-[#002452]',
      descColor: 'text-[#002452]/85 font-semibold',
      badgeBg: 'bg-[#002452]/10 text-[#002452] border-[#002452]/20',
      dotColor: 'bg-[#855300]',
      watermarkBg: 'bg-[#002452]/10 border-[#002452]/20 text-[#002452]',
      arrowColor: 'text-[#002452]'
    }
  ];

  return (
    <section id="value-prop" className="relative py-28 md:py-36 px-6 md:px-12 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] border-b border-[#C4C6D0]/40 overflow-hidden fade-in-section is-visible">

      {/* Decorative Background Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#002452_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#002452]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
          <p className="font-body text-xs font-bold text-[#002452] tracking-[0.2em] uppercase">
            BUILT FOR SMARTER MINE OPERATIONS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (7 cols): Main Headline & 4 Swatch Palette Feature Cards */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[56px] leading-tight lg:leading-[64px] font-extrabold text-[#002452] tracking-tight uppercase">
              Turning mine data into{' '}
              <span className="bg-[#002452] text-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-block shadow-md border border-[#002452]/20">
                better decisions.
              </span>
            </h2>

            {/* 4 Feature Cards (Exact Swatch Colors: Dark Charcoal, Medium Slate, Earth Taupe, Sand Cream) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {capabilities.map((cap, idx) => (
                <div 
                  key={idx}
                  className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${cap.gradient} border border-white/20 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden min-h-[165px] cursor-pointer`}
                >
                  {/* Top Status Pill */}
                  <div className="relative z-10 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${cap.badgeBg} border backdrop-blur-sm self-start uppercase tracking-wider`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cap.dotColor}`} />
                      {cap.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 mb-4">
                    <h3 className={`font-headline font-bold text-base sm:text-lg ${cap.textColor} transition-colors leading-tight`}>
                      {cap.title}
                    </h3>
                    <p className={`font-body text-xs ${cap.descColor} mt-1 leading-relaxed max-w-[84%]`}>
                      {cap.desc}
                    </p>
                  </div>

                  {/* Bottom Action Link */}
                  <div className={`relative z-10 flex items-center gap-1.5 text-xs font-bold ${cap.textColor} uppercase tracking-wider group-hover:translate-x-1 transition-transform`}>
                    <span>{cap.action}</span>
                    <span className={`material-symbols-outlined text-sm ${cap.arrowColor}`}>arrow_forward</span>
                  </div>

                  {/* Right Background Graphic / Watermark */}
                  <div className="absolute -bottom-3 -right-3 text-white/10 group-hover:text-white/25 transition-all duration-300 pointer-events-none transform -rotate-12 group-hover:scale-110">
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${cap.watermarkBg} flex items-center justify-center backdrop-blur-xs shadow-2xs`}>
                      <span className="material-symbols-outlined text-5xl sm:text-6xl">{cap.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (5 cols): Gradient Card & Enhanced KPI Stats */}
          <div className="lg:col-span-5 space-y-6">
            <GradientCard className="p-8">
              <div className="space-y-4 text-left">
                <p className="font-body text-base md:text-lg leading-relaxed text-[#44474F]">
                  <strong className="font-bold text-[#002452]">MOIL Mine Intelligence</strong> brings together geological information, historical production and operational data with relevant environmental and spatial indicators to provide a clearer view of mine conditions. The platform is designed to help teams understand manganese-bearing areas, anticipate potential production constraints and support better-informed operational decisions.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-[#F0EDED]">
                <div className="p-3 bg-[#1F2733] rounded-xl border border-white/20 text-center hover:bg-[#2C3645] transition-colors shadow-2xs">
                  <span className="material-symbols-outlined text-[#F59E0B] text-xl block mb-1">domain</span>
                  <span className="font-headline text-sm md:text-base font-extrabold text-white block leading-tight">Dongri Buzurg</span>
                  <span className="font-body text-[10px] font-bold text-white/70 uppercase tracking-wider block mt-1">MINE</span>
                </div>

                <div className="p-3 bg-[#374252] rounded-xl border border-white/20 text-center hover:bg-[#485364] transition-colors shadow-2xs">
                  <span className="material-symbols-outlined text-white text-xl block mb-1">dataset</span>
                  <span className="font-headline text-[11px] md:text-xs font-bold text-white block leading-tight">Geological · Production · Operational · Environmental</span>
                  <span className="font-body text-[10px] font-bold text-white/70 uppercase tracking-wider block mt-1">DATA LAYERS</span>
                </div>

                <div className="p-3 bg-[#E8DCC8] rounded-xl border border-[#855300]/30 text-center hover:bg-[#F5EAD9] transition-colors shadow-2xs">
                  <span className="material-symbols-outlined text-[#855300] text-xl block mb-1">sensors</span>
                  <span className="font-headline text-xs md:text-sm font-bold text-[#855300] block leading-tight">Understand · Predict · Decide</span>
                  <span className="font-body text-[10px] font-bold text-[#855300]/80 uppercase tracking-wider block mt-1">INTELLIGENCE</span>
                </div>
              </div>
            </GradientCard>
          </div>

        </div>

      </div>
    </section>
  );
};
