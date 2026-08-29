import React, { useState } from 'react';

interface MineDetailModalProps {
  mine: any;
  onClose: () => void;
}

export const MineDetailModal: React.FC<MineDetailModalProps> = ({ mine, onClose }) => {
  const [activeSection, setActiveSection] = useState<'kpis' | 'telemetry' | 'reports'>('kpis');

  if (!mine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#C4C6D0] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative h-48 sm:h-56 bg-[#002452] overflow-hidden flex items-end p-6">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url('${mine.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002452] via-[#002452]/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/40 backdrop-blur-md transition-colors z-20"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Title & Location Info */}
          <div className="relative z-10 text-white w-full flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {mine.status}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">{mine.name}</h2>
              <p className="font-body text-xs text-white/80 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {mine.location}
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-white/60 uppercase tracking-widest block">Annual Output</span>
              <span className="font-headline text-lg font-bold text-[#F59E0B]">{mine.annualOutput}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#E5E2E1] bg-[#F6F3F2] px-6">
          <button
            onClick={() => setActiveSection('kpis')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'kpis'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            Operational Metrics
          </button>
          <button
            onClick={() => setActiveSection('telemetry')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'telemetry'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            3D Seam & Pit Status
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`py-3 px-5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === 'reports'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            Compliance & Returns
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {activeSection === 'kpis' && (
            <div className="space-y-6">
              <p className="font-body text-sm text-[#44474F] leading-relaxed">
                {mine.description}
              </p>

              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#002452]">
                Key Performance Indicators (KPIs)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mine.kpis?.map((kpi: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#FCF9F8] rounded-lg border border-[#C4C6D0]/40 text-center">
                    <span className="text-[10px] text-[#747780] font-bold uppercase tracking-wider block mb-1">
                      {kpi.label}
                    </span>
                    <span className="font-headline text-lg font-bold text-[#002452]">
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#002452] text-white rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#89A5DD] uppercase tracking-widest block">Geological Model Status</span>
                  <span className="text-sm font-bold text-white">Manganese Block Seam Layer 4 Connected</span>
                </div>
                <span className="px-3 py-1 bg-[#F59E0B] text-[#002452] font-bold text-xs rounded uppercase">
                  99.4% Precision
                </span>
              </div>
              <div className="h-48 bg-[#F0EDED] rounded-lg border border-[#C4C6D0] flex items-center justify-center text-[#747780] font-body text-xs text-center p-4">
                <div className="space-y-2">
                  <span className="material-symbols-outlined text-4xl text-[#002452]">view_in_ar</span>
                  <p className="font-semibold text-[#002452]">3D Manganese Deposit Visualizer Rendered</p>
                  <p className="text-[11px]">Real-time borehole lithology & structural fault lines synchronized.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#FCF9F8] rounded border border-[#C4C6D0]/40 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-[#002452] block">IBM Monthly Production Return (Form F1)</span>
                  <span className="text-[11px] text-[#747780]">Submitted & Validated for August 2026</span>
                </div>
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Approved
                </span>
              </div>
              <div className="p-3 bg-[#FCF9F8] rounded border border-[#C4C6D0]/40 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-[#002452] block">DGMS Safety Audit & Ventilation Report</span>
                  <span className="text-[11px] text-[#747780]">Air velocity & methane sensor log clean</span>
                </div>
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span> Approved
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F6F3F2] border-t border-[#E5E2E1] flex justify-between items-center">
          <span className="text-xs text-[#747780] font-medium hidden sm:inline">MOIL Mine ID: {mine.id}</span>
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-[#44474F] hover:bg-[#E5E2E1] transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider bg-[#002452] text-white hover:bg-[#1B3A6B] transition-colors shadow-sm"
            >
              Enter Mine Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
