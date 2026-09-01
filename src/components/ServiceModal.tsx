import React, { useState } from 'react';
import { type ServiceItem } from './ServicesSection';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inputs' | 'engine' | 'outputs'>('overview');

  if (!service) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#C4C6D0] rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002452] text-white p-6 sm:p-7 flex justify-between items-start border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-3xl">{service.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#F59E0B] bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
                  Tool #{service.number}
                </span>
                <span className="text-xs text-white/80 font-bold uppercase tracking-wider">{service.category}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {service.statusBadge}
                </span>
              </div>
              <h3 className="font-headline text-2xl sm:text-3xl font-extrabold mt-1 uppercase tracking-tight text-white">
                {service.title}
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Technical & Functional System Description
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Specification"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E5E2E1] bg-[#F6F3F2] px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            1. System Description
          </button>
          <button
            onClick={() => setActiveTab('inputs')}
            className={`py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'inputs'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            2. Data Ingestion
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'engine'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            3. Analytical Engine
          </button>
          <button
            onClick={() => setActiveTab('outputs')}
            className={`py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors shrink-0 cursor-pointer ${
              activeTab === 'outputs'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            4. Actionable Deliverables
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Tagline */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest block mb-1">
                  Functional Scope
                </span>
                <p className="text-sm font-bold text-[#002452]">
                  {service.tagline}
                </p>
              </div>

              {/* What This Tool Is */}
              <div className="space-y-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#002452] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0E7C7B] text-lg">info</span>
                  What This Tool Is
                </h4>
                <p className="font-body text-sm text-[#333842] leading-relaxed">
                  {service.summary}
                </p>
              </div>

              {/* Operational Purpose */}
              <div className="space-y-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#002452] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F59E0B] text-lg">target</span>
                  Operational Purpose & Mining Impact
                </h4>
                <p className="font-body text-sm text-[#333842] leading-relaxed">
                  {service.operationalPurpose}
                </p>
              </div>

              {/* Key Capabilities */}
              <div className="space-y-3">
                <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#002452]">
                  Core Capabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="material-symbols-outlined text-[#F59E0B] text-lg">check_circle</span>
                      <span className="text-xs font-bold text-[#1B1B1C]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA INPUTS */}
          {activeTab === 'inputs' && (
            <div className="space-y-5">
              <div className="bg-[#002452] text-white p-4 rounded-xl flex justify-between items-center shadow-md">
                <div>
                  <span className="text-[10px] text-blue-200 uppercase tracking-widest block font-bold">Data Ingestion Protocol</span>
                  <span className="text-sm font-bold flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Multi-Source Ingestion Pipeline
                  </span>
                </div>
                <span className="text-xs bg-white/10 px-3 py-1 rounded-lg font-mono font-bold text-white border border-white/15">
                  Format: Multi-Stream
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#002452]">
                  Input Data Streams & Parameters
                </h4>
                <div className="space-y-2.5">
                  {service.inputs.map((input, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#002452] block">{input}</span>
                        <span className="text-[11px] text-slate-500 font-medium">Validated against MOIL database schema & field sensors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICAL ENGINE */}
          {activeTab === 'engine' && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#002452]">memory</span>
                  <div>
                    <h4 className="font-headline font-black text-sm uppercase tracking-wider text-[#002452]">
                      Analytical Engine Architecture
                    </h4>
                    <p className="text-xs font-mono font-bold text-[#0E7C7B]">
                      {service.analyticalEngine}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#44474F] leading-relaxed">
                  Processes raw operational signals, spatial coordinate arrays, and historical time-series logs through validated algorithmic pipelines tailored specifically for manganese mining environments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-xl text-center border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Target Operation</span>
                  <span className="font-headline text-base font-bold text-[#002452] mt-1 block">Dongri Buzurg & MOIL</span>
                </div>
                <div className="p-4 bg-white rounded-xl text-center border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Computation Cycle</span>
                  <span className="font-headline text-base font-bold text-[#F59E0B] mt-1 block">Real-time / Shiftwise</span>
                </div>
                <div className="p-4 bg-white rounded-xl text-center border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Integration Status</span>
                  <span className="font-headline text-base font-bold text-emerald-600 mt-1 block">Operational Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERABLES */}
          {activeTab === 'outputs' && (
            <div className="space-y-4">
              <h4 className="font-headline font-black text-xs uppercase tracking-wider text-[#002452]">
                Actionable Outputs Generated
              </h4>
              <div className="space-y-2.5">
                {service.outputs.map((output, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="material-symbols-outlined text-emerald-600 text-xl shrink-0 mt-0.5">task_alt</span>
                    <div>
                      <span className="text-xs font-bold text-[#002452] block">{output}</span>
                      <span className="text-[11px] text-slate-500 font-medium">Exportable via JSON / CSV / PDF and visualized in the operational workspace</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F6F3F2] border-t border-[#E5E2E1] flex justify-between items-center">
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Digital Mine Specification • MOIL Operational Platform
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#002452] hover:bg-[#1B3A6B] text-white transition-colors shadow-md cursor-pointer ml-auto"
          >
            Close Description
          </button>
        </div>
      </div>
    </div>
  );
};
