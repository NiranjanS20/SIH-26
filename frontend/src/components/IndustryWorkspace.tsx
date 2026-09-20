import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMineProductionProfile } from '../data/mineProductionData';

interface IndustryWorkspaceProps {
  mineId: string;
  onNavigate: (route: string) => void;
}

export const IndustryWorkspace: React.FC<IndustryWorkspaceProps> = ({ mineId, onNavigate }) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mineProfile = getMineProductionProfile(mineId);

  // Base background and text colors using MOIL light theme
  const bgMain = 'bg-[#FCF9F8]';
  const textPrimary = 'text-[#1B1B1C]';
  const textSecondary = 'text-slate-600';
  const borderSubtle = 'border-slate-200';
  const nestedBg = 'bg-white';
  const headerBg = 'bg-[#002452]';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} flex flex-col font-body`}>
      {/* Top Header Navigation */}
      <header className={`${headerBg} text-white flex items-center justify-between px-4 h-14 shrink-0 shadow-md z-20`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('mine-selection')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm font-bold">Mine Selection</span>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-white flex flex-col items-center justify-center text-[#002452] text-[6px] font-black leading-none shrink-0 shadow-md">
            <span>मॉयल</span>
            <span>MOIL</span>
          </div>
          <div>
            <span className="font-serif font-black text-lg tracking-wider block leading-none">
              MOIL INDUSTRY PORTAL
            </span>
            <span className="text-[9px] font-semibold text-white/80 uppercase tracking-widest">
              Supply Intelligence & Forecasting
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Industry Viewer
          </span>
          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#002452] flex items-center gap-3">
                {mineProfile.mineName}
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md uppercase border border-emerald-200">
                  Active Supplier
                </span>
              </h1>
              <p className={`mt-1 ${textSecondary} font-medium flex items-center gap-2`}>
                <span className="material-symbols-outlined text-sm">location_on</span>
                {mineProfile.district}, {mineProfile.state}
              </p>
            </div>
            <button className="px-5 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined">mail</span>
              Request Supply Info
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Supply Intelligence Overview */}
            <div className={`col-span-1 lg:col-span-2 ${nestedBg} p-6 rounded-xl border ${borderSubtle} shadow-sm`}>
              <h2 className="text-lg font-bold text-[#002452] flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#D97706]">analytics</span>
                Supply Intelligence Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border ${borderSubtle} bg-slate-50`}>
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Annual Output</div>
                  <div className="text-2xl font-black text-[#002452]">{(mineProfile.currentOutputTons / 1000).toFixed(1)}K t</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">+4.2% YoY</div>
                </div>
                <div className={`p-4 rounded-lg border ${borderSubtle} bg-slate-50`}>
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Target Output</div>
                  <div className="text-2xl font-black text-[#002452]">{(mineProfile.plannedTargetTons / 1000).toFixed(1)}K t</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Annual Target</div>
                </div>
                <div className={`p-4 rounded-lg border ${borderSubtle} bg-slate-50`}>
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Mine Type</div>
                  <div className="text-xl font-black text-[#002452]">{mineProfile.type}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Metallurgical Grade</div>
                </div>
                <div className={`p-4 rounded-lg border ${borderSubtle} bg-slate-50`}>
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Forecast Supply</div>
                  <div className="text-2xl font-black text-[#0E7C7B]">Stable</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Next 3 Months</div>
                </div>
              </div>
            </div>

            {/* Quality & Specifications */}
            <div className={`${nestedBg} p-6 rounded-xl border ${borderSubtle} shadow-sm`}>
              <h2 className="text-lg font-bold text-[#002452] flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#D97706]">science</span>
                Quality & Specification
              </h2>
              <ul className="space-y-3">
                <li className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Manganese (Mn)</span>
                  <span className="text-sm font-black text-[#002452]">44% Min</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Phosphorus (P)</span>
                  <span className="text-sm font-black text-[#002452]">0.15% Max</span>
                </li>
                <li className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Silica (SiO2)</span>
                  <span className="text-sm font-black text-[#002452]">12.0% Max</span>
                </li>
                <li className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-600">Iron (Fe)</span>
                  <span className="text-sm font-black text-[#002452]">8.0% Max</span>
                </li>
              </ul>
            </div>
            
            {/* Logistics & Compliance */}
            <div className={`col-span-1 lg:col-span-3 ${nestedBg} p-6 rounded-xl border ${borderSubtle} shadow-sm`}>
               <h2 className="text-lg font-bold text-[#002452] flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#D97706]">local_shipping</span>
                Logistics Context & Public Compliance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider border-b pb-2">Logistics Profile</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-slate-400 mt-0.5">train</span>
                      <div>
                        <div className="text-sm font-bold text-[#002452]">Rail Head Proximity</div>
                        <div className="text-xs text-slate-600 mt-0.5">Connected to primary freight corridors. Average loading time: 4-6 hours.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-slate-400 mt-0.5">directions_car</span>
                      <div>
                        <div className="text-sm font-bold text-[#002452]">Road Transport</div>
                        <div className="text-xs text-slate-600 mt-0.5">Direct highway access available for bulk carrier trucks. Weighbridge on site.</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider border-b pb-2">Sustainability & Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 mt-0.5">verified</span>
                      <div>
                        <div className="text-sm font-bold text-[#002452]">Environmental Clearance (EC)</div>
                        <div className="text-xs text-slate-600 mt-0.5">Valid and active under MoEFCC regulations. Routine monitoring conducted.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-500 mt-0.5">forest</span>
                      <div>
                        <div className="text-sm font-bold text-[#002452]">Responsible Mining Framework</div>
                        <div className="text-xs text-slate-600 mt-0.5">100% adherence to national sustainability goals. Afforestation programs active.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
