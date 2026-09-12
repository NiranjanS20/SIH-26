
export interface GradientCardItem {
  id: string;
  number: string;
  title: string;
  icon: string;
  description: string;
  metrics: string[];
  gradientFrom: string;
  gradientTo: string;
}

export const moilDataSources: GradientCardItem[] = [
  {
    id: 'geological',
    number: '01',
    title: 'Geological Data',
    icon: 'layers',
    description: 'Geology, exploration records, borehole information and ore-grade data used to understand manganese-bearing zones.',
    metrics: ['Geology', 'Borehole Data', 'Ore Grade'],
    gradientFrom: '#001636',
    gradientTo: '#002B66',
  },
  {
    id: 'production',
    number: '02',
    title: 'Production Data',
    icon: 'analytics',
    description: 'Historical production, production targets and production trends used to understand output and identify potential shortfalls.',
    metrics: ['Production History', 'Targets', 'Production Trends'],
    gradientFrom: '#003366',
    gradientTo: '#0F5298',
  },
  {
    id: 'operational',
    number: '03',
    title: 'Operational Data',
    icon: 'precision_manufacturing',
    description: 'Equipment availability, downtime, blasting delays and other operational constraints that can affect production.',
    metrics: ['Equipment', 'Downtime', 'Blasting'],
    gradientFrom: '#0D6EFD',
    gradientTo: '#00A3E0',
  },
  {
    id: 'space-environment',
    number: '04',
    title: 'Space & Environment',
    icon: 'satellite_alt',
    description: 'Rainfall, soil moisture, vegetation and land-temperature indicators that can provide additional environmental and spatial context.',
    metrics: ['Rainfall', 'Soil Moisture', 'Satellite Indicators'],
    gradientFrom: '#00A8E8',
    gradientTo: '#38BDF8',
  },
];

export default function SkewCards({
  items = moilDataSources,
  onSelectCard,
}: {
  items?: GradientCardItem[];
  onSelectCard?: (item: GradientCardItem) => void;
}) {
  return (
    <>
      <div className="flex justify-center items-center flex-wrap py-10 gap-y-12">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectCard && onSelectCard(item)}
            className="group relative w-[280px] sm:w-[300px] md:w-[310px] min-h-[380px] m-[20px_15px] sm:m-[30px_20px] transition-all duration-500 cursor-pointer"
          >
            {/* Skewed gradient panels */}
            <span
              className="absolute top-0 left-[40px] w-1/2 h-full rounded-2xl transform skew-x-[12deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-[15px] group-hover:w-[calc(100%-30px)]"
              style={{
                background: `linear-gradient(315deg, ${item.gradientFrom}, ${item.gradientTo})`,
              }}
            />
            <span
              className="absolute top-0 left-[40px] w-1/2 h-full rounded-2xl transform skew-x-[12deg] blur-[25px] opacity-70 transition-all duration-500 group-hover:skew-x-0 group-hover:left-[15px] group-hover:w-[calc(100%-30px)] group-hover:opacity-100"
              style={{
                background: `linear-gradient(315deg, ${item.gradientFrom}, ${item.gradientTo})`,
              }}
            />

            {/* Animated glassmorphism blurs */}
            <span className="pointer-events-none absolute inset-0 z-10">
              <span className="absolute top-0 left-0 w-0 h-0 rounded-full opacity-0 bg-[rgba(255,255,255,0.2)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 animate-blob group-hover:-top-[30px] group-hover:left-[30px] group-hover:w-[80px] group-hover:h-[80px] group-hover:opacity-100" />
              <span className="absolute bottom-0 right-0 w-0 h-0 rounded-full opacity-0 bg-[rgba(255,255,255,0.2)] backdrop-blur-[10px] shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-500 animate-blob animation-delay-1000 group-hover:-bottom-[30px] group-hover:right-[30px] group-hover:w-[80px] group-hover:h-[80px] group-hover:opacity-100" />
            </span>

            {/* Content Container */}
            <div className="relative z-20 left-0 p-[24px_28px] bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl text-[#1B1B1C] transition-all duration-500 group-hover:left-[-15px] group-hover:bg-white group-hover:shadow-2xl">
              {/* Header: Number & Icon */}
              <div className="flex justify-between items-center mb-4">
                <span className="font-body text-xs font-bold text-[#002452] uppercase tracking-widest bg-[#002452]/5 px-2.5 py-1 rounded-full border border-[#002452]/10">
                  {item.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#002452]/5 flex items-center justify-center text-[#002452] group-hover:bg-[#002452] group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-headline text-xl font-extrabold text-[#002452] uppercase tracking-wide mb-2">
                {item.title}
              </h3>
              <p className="font-body text-xs text-[#44474F] leading-relaxed mb-6">
                {item.description}
              </p>

              {/* Metrics Pills */}
              <div className="pt-4 border-t border-[#F0EDED] flex flex-wrap gap-1.5">
                {item.metrics.map((m, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-[#F6F3F2] text-[#002452] px-2.5 py-1 rounded-md border border-[#C4C6D0]/40 group-hover:bg-[#002452]/5 transition-colors"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tailwind custom animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translateY(8px); }
          50% { transform: translate(-8px); }
        }
        .animate-blob { animation: blob 2.5s ease-in-out infinite; }
        .animation-delay-1000 { animation-delay: -1.2s; }
      `}</style>
    </>
  );
}
