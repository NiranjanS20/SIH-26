import React, { useState } from 'react';

export const UpdatesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Mine Operations', 'Executive Reports', 'Compliance & Safety'];

  const updates = [
    {
      id: 'up-1',
      time: 'Today · 10:45 AM',
      title: 'Information updated for Dongri Buzurg Mine.',
      detail: 'Geological borehole logs, production tallies, and haulage summaries re-calibrated and synchronized for Dongri Buzurg flagship open-pit operation.',
      category: 'Mine Operations',
      isLatest: true,
      icon: 'domain',
      tagColor: 'bg-[#002452]/10 text-[#002452] border-[#002452]/20',
      nodeBg: 'bg-[#002452]',
      nodeRing: 'ring-[#002452]/20',
      actionText: 'View Mine Telemetry'
    },
    {
      id: 'up-2',
      time: 'Yesterday · 04:15 PM',
      title: 'Production Intelligence report available for review.',
      detail: 'Monthly manganese extraction targets achieved at 104% capacity for Q3 period across active mining blocks.',
      category: 'Executive Reports',
      isLatest: false,
      icon: 'assessment',
      tagColor: 'bg-[#855300]/15 text-[#855300] border-[#F59E0B]/30',
      nodeBg: 'bg-[#F59E0B]',
      nodeRing: 'ring-[#F59E0B]/20',
      actionText: 'Open Q3 Summary'
    },
    {
      id: 'up-3',
      time: '2 Days Ago',
      title: 'System documentation & safety protocols updated.',
      detail: 'Updated DGMS safety compliance protocols, blasting distance zones, and environmental monitoring telemetry schemas integrated.',
      category: 'Compliance & Safety',
      isLatest: false,
      icon: 'verified_user',
      tagColor: 'bg-emerald-100/70 text-emerald-900 border-emerald-300',
      nodeBg: 'bg-emerald-600',
      nodeRing: 'ring-emerald-600/20',
      actionText: 'Review Compliance Schema'
    },
    {
      id: 'up-4',
      time: '4 Days Ago',
      title: 'Geological core sample assays registered.',
      detail: '14 exploratory core drilling sample assays from the eastern manganese seam compiled and cataloged into spatial data layer 01.',
      category: 'Mine Operations',
      isLatest: false,
      icon: 'layers',
      tagColor: 'bg-[#002452]/10 text-[#002452] border-[#002452]/20',
      nodeBg: 'bg-[#374252]',
      nodeRing: 'ring-[#374252]/20',
      actionText: 'Inspect Borehole Records'
    }
  ];

  const filteredUpdates = activeCategory === 'All' 
    ? updates 
    : updates.filter(u => u.category === activeCategory);

  return (
    <section id="updates" className="relative py-28 md:py-36 bg-gradient-to-b from-[#FCF9F8] via-white to-[#F6F3F2] px-6 md:px-12 border-t border-[#C4C6D0]/40 overflow-hidden fade-in-section is-visible">
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#002452_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#002452]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        
        {/* Top Header Badge & Section Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#002452]/5 border border-[#002452]/10 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
              <p className="font-body text-xs font-bold text-[#002452] tracking-[0.2em] uppercase">
                PLATFORM ACTIVITY
              </p>
            </div>
            
            <h3 className="font-headline text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#002452] tracking-tight uppercase leading-tight">
              Latest Updates &{' '}
              <span className="bg-[#F59E0B] text-[#002452] px-3 sm:px-4 py-0.5 rounded-xl inline-block shadow-md">
                Live Feed.
              </span>
            </h3>
          </div>

          {/* Live Sync Status Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-[#C4C6D0]/50 shadow-sm self-start md:self-auto">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-body text-xs font-bold text-[#002452] uppercase tracking-wider">
              Live Feed Active
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none border-b border-[#C4C6D0]/30">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold font-headline uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#002452] text-white shadow-md border border-[#002452]'
                  : 'bg-white text-[#5C5F6A] border border-[#C4C6D0]/50 hover:bg-[#002452]/5 hover:text-[#002452]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline Container */}
        <div className="relative pl-6 sm:pl-10 ml-2 sm:ml-4 border-l-2 border-[#002452]/15 space-y-8">
          {filteredUpdates.map((item) => (
            <div key={item.id} className="relative group">
              
              {/* Glowing Timeline Node */}
              <div 
                className={`absolute -left-[31px] sm:-left-[47px] top-4 w-5 h-5 rounded-full border-2 border-white ${item.nodeBg} ring-4 ${item.nodeRing} shadow-md transition-all duration-300 group-hover:scale-125 flex items-center justify-center`}
              >
                {item.isLatest && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </div>

              {/* Activity Item Card */}
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-[#C4C6D0]/50 shadow-xs hover:shadow-xl hover:border-[#002452]/30 transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col sm:flex-row justify-between gap-6">
                
                <div className="space-y-3 flex-1">
                  {/* Top Meta: Time & Category Pill */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-body text-xs font-bold text-[#747780] tracking-wider uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#002452]">schedule</span>
                      {item.time}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${item.tagColor}`}>
                      {item.category}
                    </span>
                    {item.isLatest && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-[#002452] shadow-2xs animate-pulse">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h4 className="font-headline text-lg sm:text-xl font-extrabold text-[#002452] group-hover:text-[#1B3A6B] transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="font-body text-xs sm:text-sm text-[#5C5F6A] leading-relaxed font-normal">
                      {item.detail}
                    </p>
                  </div>
                </div>

                {/* Right Action Button & Icon */}
                <div className="sm:self-center flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0EDED]">
                  <div className="w-10 h-10 rounded-xl bg-[#002452]/5 border border-[#002452]/10 flex items-center justify-center text-[#002452] group-hover:bg-[#002452] group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>

                  <button className="inline-flex items-center gap-1 text-xs font-extrabold text-[#002452] uppercase tracking-wider group-hover:text-[#F59E0B] transition-colors cursor-pointer">
                    <span>{item.actionText}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
