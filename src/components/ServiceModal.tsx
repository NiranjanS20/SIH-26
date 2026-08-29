import React, { useState } from 'react';
import { type ServiceItem } from './ServicesSection';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'export'>('overview');

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#C4C6D0] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002452] text-white p-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-3xl">{service.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#F59E0B] bg-white/10 px-2 py-0.5 rounded">
                  Tool #{service.number}
                </span>
                <span className="text-xs text-white/70">{service.category}</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mt-1">{service.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E5E2E1] bg-[#F6F3F2] px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            System Specification
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            Data Indicators
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-[#002452] text-[#002452] bg-white'
                : 'border-transparent text-[#747780] hover:text-[#002452]'
            }`}
          >
            Reports & Export
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div>
              <p className="font-body text-sm text-[#44474F] leading-relaxed mb-6">
                {service.summary}
              </p>
              
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#002452] mb-3">
                Key Module Capabilities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#FCF9F8] border border-[#C4C6D0]/40">
                    <span className="material-symbols-outlined text-[#F59E0B] text-xl">check_circle</span>
                    <span className="text-xs font-semibold text-[#1B1B1C]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="bg-[#002452] text-white p-4 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-[#89A5DD] uppercase tracking-widest block">Primary Focus</span>
                  <span className="text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                    Dongri Buzurg Mine Dataset & Spatial Indicators
                  </span>
                </div>
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded font-mono">Status: Ready</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-[#F6F3F2] rounded-lg text-center border border-[#C4C6D0]/40">
                  <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Target Mine</span>
                  <span className="font-headline text-lg font-bold text-[#002452]">Dongri Buzurg</span>
                </div>
                <div className="p-4 bg-[#F6F3F2] rounded-lg text-center border border-[#C4C6D0]/40">
                  <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Data Scope</span>
                  <span className="font-headline text-lg font-bold text-[#F59E0B]">Geological & Production</span>
                </div>
                <div className="p-4 bg-[#F6F3F2] rounded-lg text-center border border-[#C4C6D0]/40">
                  <span className="text-[10px] text-[#747780] uppercase tracking-wider block">Analysis Engine</span>
                  <span className="font-headline text-lg font-bold text-emerald-600">Decision Support</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-[#44474F]">
                Export spatial summaries, production trends, and operational risk reports for executive review and operational planning.
              </p>
              <div className="p-4 bg-[#FCF9F8] rounded-lg border border-[#C4C6D0] font-mono text-xs text-[#002452] space-y-1">
                <p className="text-gray-500">// Sample Report Dataset Schema</p>
                <p>{`{ "mine_name": "Dongri Buzurg", "analysis_type": "Reserve & Production Risk", "status": "COMPLETE" }`}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F6F3F2] border-t border-[#E5E2E1] flex justify-end gap-3">
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
            Launch Full Service
          </button>
        </div>
      </div>
    </div>
  );
};
