import React, { useState } from 'react';
import Silk from './ui/Silk';
import { Sparkles } from 'lucide-react';

interface ProspectivityViewProps {
  isDark?: boolean;
  onSendToForecast?: () => void;
  selectedMineName?: string;
}

export interface ZoneData {
  id: string;
  code: string;
  name: string;
  prospectivityClass: 'HIGH' | 'MEDIUM' | 'LOW';
  predictedMnO: number; // Continuous MnO% grade prediction from Model 1 Regressor
  estTonnage: number; // Tonnes
  geologicalStructure: string;
  accessibilityPct: number;
  recoverabilityPct: number;
  evidence: string;
  recommendedAction: string;
  priority: 'Priority' | 'Monitor' | 'Low Priority';
  svgCenter: { x: number; y: number };
  svgPolygon: string;
  labelPosition: 'top' | 'bottom' | 'center';
}

// ─────────────────────────────────────────────────────────────────────────────
// REALISTIC PROSPECTIVITY ZONES OVER DONGRI BUZURG PIT SATELLITE IMAGERY
// ─────────────────────────────────────────────────────────────────────────────
export const DONGRI_ZONES: ZoneData[] = [
  {
    id: 'PZ-DB-14',
    code: 'Zone 14',
    name: 'Zone 14 (East Extension Reef)',
    prospectivityClass: 'HIGH',
    predictedMnO: 44.8,
    estTonnage: 4200,
    geologicalStructure: 'Mansar Schist synclinal fold nose dipping 68° NW',
    accessibilityPct: 88,
    recoverabilityPct: 92,
    evidence: 'Drill core DH-DB-14 confirmed 14.8m continuous pyrolusite reef (+420 nT magnetic anomaly)',
    recommendedAction: 'Priority Phase 1 bench development & production ramp-up',
    priority: 'Priority',
    svgCenter: { x: 470, y: 135 },
    svgPolygon: 'M 425 110 L 525 105 L 510 165 L 415 155 Z',
    labelPosition: 'center',
  },
  {
    id: 'PZ-DB-07',
    code: 'Zone 07',
    name: 'Zone 07 (North Hanging Wall Bench)',
    prospectivityClass: 'HIGH',
    predictedMnO: 42.8,
    estTonnage: 3850,
    geologicalStructure: 'Faulted contact with quartz-muscovite schist',
    accessibilityPct: 82,
    recoverabilityPct: 89,
    evidence: 'Ground magnetic gradient confirmed strike continuity; trench assays 41.5% - 44.0% Mn',
    recommendedAction: 'Advance exploratory infill drilling 50m grid spacing',
    priority: 'Priority',
    svgCenter: { x: 330, y: 85 },
    svgPolygon: 'M 255 68 L 405 72 L 390 108 L 245 100 Z',
    labelPosition: 'top',
  },
  {
    id: 'PZ-DB-09',
    code: 'Zone 09',
    name: 'Zone 09 (Central Syncline Core)',
    prospectivityClass: 'HIGH',
    predictedMnO: 41.5,
    estTonnage: 3100,
    geologicalStructure: 'Banded manganese-silicate quartzite (gondite) horizon',
    accessibilityPct: 94,
    recoverabilityPct: 86,
    evidence: 'High reflectance band at 2.2µm; active bench high-grade exposure',
    recommendedAction: 'Incorporate into Q3 overburden stripping cycle',
    priority: 'Priority',
    svgCenter: { x: 320, y: 145 },
    svgPolygon: 'M 235 125 L 405 130 L 385 175 L 225 165 Z',
    labelPosition: 'center',
  },
  {
    id: 'PZ-DB-22',
    code: 'Zone 22',
    name: 'Zone 22 (West Ramp Extension)',
    prospectivityClass: 'MEDIUM',
    predictedMnO: 38.2,
    estTonnage: 2900,
    geologicalStructure: 'Weathered braunite-rhodonite lens under 12m alluvium',
    accessibilityPct: 75,
    recoverabilityPct: 78,
    evidence: 'Moderate gravity anomaly (+180 mGal); aero-magnetic trend',
    recommendedAction: 'Schedule geophysical resistivity tomography prior to drilling',
    priority: 'Monitor',
    svgCenter: { x: 165, y: 140 },
    svgPolygon: 'M 105 120 L 220 125 L 205 170 L 95 160 Z',
    labelPosition: 'center',
  },
  {
    id: 'PZ-DB-05',
    code: 'Zone 05',
    name: 'Zone 05 (North-West Ridge Prospect)',
    prospectivityClass: 'MEDIUM',
    predictedMnO: 36.4,
    estTonnage: 2150,
    geologicalStructure: 'Quartzite contact zone dipping 55° W',
    accessibilityPct: 70,
    recoverabilityPct: 74,
    evidence: 'Surface float pyrolusite nodules; satellite NDVI anomaly',
    recommendedAction: 'Monitor environmental clearance for access track',
    priority: 'Monitor',
    svgCenter: { x: 160, y: 75 },
    svgPolygon: 'M 100 58 L 215 64 L 200 102 L 90 92 Z',
    labelPosition: 'top',
  },
  {
    id: 'PZ-DB-18',
    code: 'Zone 18',
    name: 'Zone 18 (South Deep Limb Reserve)',
    prospectivityClass: 'LOW',
    predictedMnO: 31.4,
    estTonnage: 1800,
    geologicalStructure: 'Silicate-dominant gondite with minor oxide enrichment',
    accessibilityPct: 60,
    recoverabilityPct: 65,
    evidence: 'Low-grade surface outcrop assaying <32% Mn',
    recommendedAction: 'Low priority development; retain as long-term strategic reserve',
    priority: 'Low Priority',
    svgCenter: { x: 340, y: 215 },
    svgPolygon: 'M 260 195 L 420 200 L 400 240 L 250 230 Z',
    labelPosition: 'bottom',
  },
];

export const ProspectivityView: React.FC<ProspectivityViewProps> = ({
  isDark = true,
  onSendToForecast,
  selectedMineName = 'Dongri Buzurg Mine',
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneData>(DONGRI_ZONES[0]);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [showOreReef, setShowOreReef] = useState<boolean>(true);
  const [showPitPerimeter, setShowPitPerimeter] = useState<boolean>(true);
  const [showThermalOverlay, setShowThermalOverlay] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'prospectivity' | 'mno' | 'tonnage'>('prospectivity');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);

  // Styling helpers (Rich contrast & colors in Light Mode, 100% untouched in Dark Mode)
  const cardBg = isDark
    ? 'bg-[#181B20] border-white/10'
    : 'bg-gradient-to-br from-white via-slate-50/50 to-white border-slate-200/90 shadow-md hover:shadow-lg transition-all';
  const nestedBg = isDark
    ? 'bg-[#242830] border-white/10'
    : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-700 font-medium';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200/80';

  // Total summary calculations
  const highZonesCount = DONGRI_ZONES.filter((z) => z.prospectivityClass === 'HIGH').length;
  const maxPredictedMnO = Math.max(...DONGRI_ZONES.map((z) => z.predictedMnO)).toFixed(1);
  const totalEstTonnage = DONGRI_ZONES.reduce((acc, z) => acc + z.estTonnage, 0).toLocaleString();

  // Helper for prospectivity colors
  const getProspectivityColor = (pClass: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (pClass) {
      case 'HIGH':
        return {
          badge: isDark
            ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
            : 'bg-rose-100 text-rose-800 border-rose-300 font-black shadow-xs',
          dot: 'bg-rose-500',
          hex: '#F43F5E',
          fill: '#F43F5E',
          text: isDark ? 'text-rose-400' : 'text-rose-700 font-bold',
        };
      case 'MEDIUM':
        return {
          badge: isDark
            ? 'bg-amber-950/40 text-amber-300 border-amber-700/60'
            : 'bg-amber-100 text-amber-800 border-amber-300 font-black shadow-xs',
          dot: 'bg-amber-400',
          hex: '#F59E0B',
          fill: '#F59E0B',
          text: isDark ? 'text-amber-400' : 'text-amber-700 font-bold',
        };
      case 'LOW':
        return {
          badge: isDark
            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black shadow-xs',
          dot: 'bg-emerald-400',
          hex: '#10B981',
          fill: '#10B981',
          text: isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold',
        };
    }
  };

  // Sorting logic for List View
  const sortedZones = [...DONGRI_ZONES].sort((a, b) => {
    if (sortField === 'mno') {
      return sortOrder === 'desc' ? b.predictedMnO - a.predictedMnO : a.predictedMnO - b.predictedMnO;
    }
    if (sortField === 'tonnage') {
      return sortOrder === 'desc' ? b.estTonnage - a.estTonnage : a.estTonnage - b.estTonnage;
    }
    const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return sortOrder === 'desc'
      ? weight[b.prospectivityClass] - weight[a.prospectivityClass]
      : weight[a.prospectivityClass] - weight[b.prospectivityClass];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER WITH REACT BITS SILK SHADER BACKGROUND */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
          <Silk
            speed={5}
            scale={1.2}
            color={isDark ? "#0E7C7B" : "#002452"}
            noiseIntensity={1.5}
            rotation={0.2}
            lightMode={!isDark}
          />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C7B] animate-pulse" />
            <span className="text-[11px] font-black tracking-[0.2em] text-[#0E7C7B] uppercase">
              MODEL 1 • RESOURCE PROSPECTIVITY ANALYSIS
            </span>
          </div>
          <h1 className={`font-headline font-black text-3xl sm:text-4xl uppercase tracking-tight ${textPrimary}`}>
            PROSPECTIVITY & SATELLITE PIT GIS
          </h1>
          <p className={`text-sm max-w-2xl font-medium ${textSecondary}`}>
            High-resolution satellite view with continuous manganese grade prediction (MnO%) across {selectedMineName} pit benches and ore reef extents.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className={`relative z-10 flex items-center p-1.5 rounded-xl border shrink-0 self-start md:self-center backdrop-blur-md ${
          isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100/90 border-slate-300 shadow-sm'
        }`}>
          <button
            onClick={() => setViewMode('MAP')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'MAP'
                ? 'bg-[#0E7C7B] text-white shadow-lg shadow-[#0E7C7B]/30'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map View
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewMode === 'LIST'
                ? 'bg-[#0E7C7B] text-white shadow-lg shadow-[#0E7C7B]/30'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            List View
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROSPECTIVITY OVERVIEW (SUMMARY METRICS) */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 shadow-md`}>
        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0E7C7B] text-lg">insights</span>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
              PROSPECTIVITY OVERVIEW & MODEL OUTPUTS
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#0E7C7B] font-bold">
            6 ACTIVE SECTOR TARGETS IDENTIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Output 1: High Prospectivity Zones */}
          <div className={`p-5 rounded-xl border space-y-2 relative overflow-hidden transition-all ${
            isDark 
              ? nestedBg 
              : 'bg-gradient-to-br from-rose-500/10 via-white to-rose-500/5 border-rose-200 shadow-sm hover:shadow-md'
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              isDark ? textMuted : 'text-rose-800'
            }`}>
              HIGH PROSPECTIVITY ZONES
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-rose-500 block">
              {highZonesCount} / 6
            </span>
            <span className={`text-xs font-medium block ${textSecondary}`}>
              Immediate excavation & ramp-up targets
            </span>
          </div>

          {/* Output 2: Predicted MnO% Grade */}
          <div className={`p-5 rounded-xl border space-y-2 relative overflow-hidden transition-all ${
            isDark 
              ? nestedBg 
              : 'bg-gradient-to-br from-teal-500/10 via-white to-teal-500/5 border-teal-200 shadow-sm hover:shadow-md'
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              isDark ? textMuted : 'text-teal-800'
            }`}>
              PREDICTED MnO% (PEAK)
            </span>
            <span className={`font-headline font-black text-3xl sm:text-4xl block ${
              isDark ? 'text-teal-400' : 'text-teal-700'
            }`}>
              {maxPredictedMnO}%
            </span>
            <span className={`text-xs font-semibold block ${
              isDark ? 'text-emerald-400' : 'text-emerald-700'
            }`}>High-Grade Pyrolusite (Zone 14)</span>
          </div>

          {/* Output 3: Est. Resource Potential */}
          <div className={`p-5 rounded-xl border space-y-2 relative overflow-hidden transition-all ${
            isDark 
              ? nestedBg 
              : 'bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-200 shadow-sm hover:shadow-md'
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              isDark ? textMuted : 'text-amber-800'
            }`}>
              EST. RESOURCE POTENTIAL
            </span>
            <span className={`font-headline font-black text-3xl sm:text-4xl block ${
              isDark ? 'text-amber-400' : 'text-amber-600'
            }`}>
              {totalEstTonnage} t
            </span>
            <span className={`text-xs font-medium block ${textSecondary}`}>Cumulative estimated tonnage</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN PROSPECTIVITY CONTENT (SATELLITE MAP OVERLAY + ZONE DETAIL PANEL) */}
      {/* ========================================================================= */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* SATELLITE MAP CANVAS (7 COLS) */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border ${cardBg} space-y-4 flex flex-col justify-between shadow-xl`}>
            <div className={`flex flex-wrap items-center justify-between border-b pb-3 gap-3 ${borderDivider}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0E7C7B] text-lg">satellite_alt</span>
                <h2 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
                  DONGRI BUZURG SATELLITE PIT MAP
                </h2>
              </div>

              {/* Minimal Clean Layer Toggles */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setShowOreReef(!showOreReef)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 border text-[11px] ${
                    showOreReef
                      ? isDark
                        ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                        : 'bg-rose-50 border-rose-300 text-rose-800 font-black shadow-xs'
                      : isDark
                      ? 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showOreReef ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'}`} />
                  Ore Reef (Pink)
                </button>

                <button
                  onClick={() => setShowPitPerimeter(!showPitPerimeter)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 border text-[11px] ${
                    showPitPerimeter
                      ? isDark
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                        : 'bg-amber-50 border-amber-300 text-amber-800 font-black shadow-xs'
                      : isDark
                      ? 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${showPitPerimeter ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  Pit Shell (Yellow)
                </button>

                <button
                  onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 border text-[11px] ${
                    showThermalOverlay
                      ? isDark
                        ? 'bg-teal-950/80 border-teal-500/60 text-teal-300'
                        : 'bg-teal-50 border-teal-300 text-teal-800 font-black shadow-xs'
                      : isDark
                      ? 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  SWIR
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* CLEAN INTERACTIVE SATELLITE PIT DISPLAY CONTAINER */}
            {/* ================================================================= */}
            <div className="relative w-full h-[440px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl flex items-center justify-center group select-none">
              {/* Actual High-Res Top-Down Satellite Photo of Dongri Buzurg Open Cast Mine */}
              <img
                src="/assets/dongri-buzurg-satellite-pit.png"
                alt="Dongri Buzurg Open Pit Satellite Imagery"
                className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-110"
              />

              {/* Subtle Dark Vignette for Premium Depth */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

              {/* SVG Vector Zone Overlay mapped across the real pit */}
              <svg viewBox="0 0 640 280" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <linearGradient id="oreReefGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FB7185" />
                    <stop offset="50%" stopColor="#F43F5E" />
                    <stop offset="100%" stopColor="#E11D48" />
                  </linearGradient>
                </defs>

                {/* SWIR Thermal Multi-Spectral Heatmap Simulation */}
                {showThermalOverlay && (
                  <circle cx="330" cy="140" r="130" fill="#F43F5E" fillOpacity="0.22" filter="url(#glowEffect)" />
                )}

                {/* Main Open Pit Shell (Yellow Perimeter) */}
                {showPitPerimeter && (
                  <g>
                    <path
                      d="M 100 140 C 130 55 240 60 350 65 C 450 70 540 85 545 130 C 540 175 430 190 340 195 C 230 190 120 185 100 140 Z"
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                  </g>
                )}

                {/* Manganese Ore Body Strike Line (Pink / Magenta Reef Line) */}
                {showOreReef && (
                  <g filter="url(#glowEffect)">
                    <path
                      d="M 120 150 Q 270 145 380 135 T 510 120"
                      fill="none"
                      stroke="url(#oreReefGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <text x="290" y="125" fill="#FFE4E6" fontSize="9.5" fontWeight="900" textAnchor="middle" className="drop-shadow-md">
                      Manganese Ore Body Reef
                    </text>
                  </g>
                )}

                {/* Model 1 Prospectivity Zones (Distributed Naturally Across Pit Sectors) */}
                {DONGRI_ZONES.map((zone) => {
                  const isSelected = selectedZone.id === zone.id;
                  const style = getProspectivityColor(zone.prospectivityClass);

                  return (
                    <g
                      key={zone.id}
                      className="cursor-pointer group/zone transition-all duration-200"
                      onClick={() => setSelectedZone(zone)}
                    >
                      {/* Translucent Zone Polygon */}
                      <path
                        d={zone.svgPolygon}
                        fill={style.fill}
                        fillOpacity={isSelected ? 0.6 : 0.28}
                        stroke={isSelected ? '#FFFFFF' : style.hex}
                        strokeWidth={isSelected ? 3.5 : 1.8}
                        strokeDasharray={isSelected ? undefined : '4 2'}
                        className="transition-all duration-200 group-hover/zone:fill-opacity-50"
                      />

                      {/* Zone Center Label Pill */}
                      <g transform={`translate(${zone.svgCenter.x}, ${zone.svgCenter.y})`}>
                        <rect
                          x="-42"
                          y="-11"
                          width="84"
                          height="22"
                          rx="6"
                          fill={isSelected ? '#0F172A' : '#020617'}
                          fillOpacity="0.88"
                          stroke={isSelected ? '#FFFFFF' : style.hex}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <text
                          x="0"
                          y="4"
                          fill="#FFFFFF"
                          fontSize="9.5"
                          fontWeight="900"
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          {zone.code} ({zone.predictedMnO}%)
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Bottom HUD Overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/85 border border-white/15 text-[11px] font-mono text-white backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-teal-300">
                    Dongri Buzurg Pit Floor • Lat 21.5545°N, Long 79.7020°E
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:inline text-[10.5px]">
                  Click any zone to inspect Model 1 parameters
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. ZONE DETAIL PANEL (RIGHT 5 COLS) */}
          {/* ========================================================================= */}
          <div className={`lg:col-span-5 p-6 rounded-2xl border ${cardBg} space-y-5 flex flex-col justify-between shadow-2xl`}>
            <div className="space-y-4">
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                <div>
                  <span className="text-[10px] font-black text-[#0E7C7B] uppercase tracking-widest block">
                    MODEL 1 SELECTED ZONE
                  </span>
                  <h2 className={`font-headline font-black text-xl uppercase tracking-wider ${textPrimary}`}>
                    {selectedZone.code.toUpperCase()} — DETAIL
                  </h2>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${getProspectivityColor(selectedZone.prospectivityClass).badge}`}>
                  ● {selectedZone.prospectivityClass} PROSPECTIVITY
                </span>
              </div>

              {/* Zone Name & Overview */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${
                isDark ? nestedBg : 'bg-gradient-to-br from-slate-50/90 to-white border-slate-200/90 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                  TARGET ZONE NAME
                </span>
                <p className={`text-base font-black ${textPrimary}`}>
                  {selectedZone.name}
                </p>
                <p className={`text-xs font-medium ${textSecondary}`}>
                  {selectedZone.geologicalStructure}
                </p>
              </div>

              {/* Prediction Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Predicted Grade */}
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? nestedBg : 'bg-gradient-to-br from-teal-50/70 via-white to-white border-teal-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isDark ? textMuted : 'text-teal-800'
                    }`}>
                      PREDICTED MnO%
                    </span>
                    <span className={`material-symbols-outlined text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>science</span>
                  </div>
                  <span className={`font-headline font-black text-2xl sm:text-3xl block ${
                    isDark ? 'text-teal-400' : 'text-teal-700'
                  }`}>
                    {selectedZone.predictedMnO}%
                  </span>
                  <span className={`text-[10.5px] font-semibold block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Model 1 Regression Score
                  </span>
                </div>

                {/* Estimated Tonnage */}
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDark ? nestedBg : 'bg-gradient-to-br from-amber-50/70 via-white to-white border-amber-200 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isDark ? textMuted : 'text-amber-800'
                    }`}>
                      EST. TONNAGE
                    </span>
                    <span className={`material-symbols-outlined text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>inventory_2</span>
                  </div>
                  <span className={`font-headline font-black text-2xl sm:text-3xl block ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    {selectedZone.estTonnage.toLocaleString()} t
                  </span>
                  <span className={`text-[10.5px] font-semibold block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Recoverable ore volume
                  </span>
                </div>
              </div>

              {/* Key Indicators (Accessibility & Recoverability) */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={isDark ? textSecondary : 'text-slate-800'}>Accessibility Index</span>
                    <span className={`font-mono ${isDark ? 'text-teal-400' : 'text-teal-700 font-black'}`}>{selectedZone.accessibilityPct}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all duration-500 shadow-sm"
                      style={{ width: `${selectedZone.accessibilityPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className={isDark ? textSecondary : 'text-slate-800'}>Recoverability Ratio</span>
                    <span className={`font-mono ${isDark ? 'text-amber-400' : 'text-amber-700 font-black'}`}>{selectedZone.recoverabilityPct}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500 shadow-sm"
                      style={{ width: `${selectedZone.recoverabilityPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Drill Core & Geological Evidence */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${
                isDark ? nestedBg : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-xs'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isDark ? 'text-teal-400' : 'text-teal-800 font-black'
                }`}>
                  DRILL CORE & GEOLOGICAL EVIDENCE
                </span>
                <p className={`text-xs font-mono leading-relaxed ${
                  isDark ? textSecondary : 'text-slate-800 font-semibold'
                }`}>
                  {selectedZone.evidence}
                </p>
              </div>

              {/* Recommended Action */}
              <div className={`p-4 rounded-xl space-y-1 border ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-500/10 border-amber-300 shadow-sm'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  isDark ? 'text-amber-400' : 'text-amber-900 font-extrabold'
                }`}>
                  RECOMMENDED OPERATIONAL ACTION
                </span>
                <p className={`text-xs font-bold leading-relaxed ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}>
                  {selectedZone.recommendedAction}
                </p>
              </div>
            </div>

            {/* Send to Forecast Action Button */}
            <button
              onClick={onSendToForecast}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#C77B00] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-headline font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer mt-4"
            >
              <span>SEND ZONE TO PRODUCTION FORECAST</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : (
        /* LIST VIEW TABLE */
        <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 shadow-xl`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
              ALL DONGRI BUZURG PROSPECTIVITY ZONES
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className={textMuted}>Sort By:</span>
              <button
                onClick={() => {
                  if (sortField === 'prospectivity') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortField('prospectivity'); setSortOrder('desc'); }
                }}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  sortField === 'prospectivity'
                    ? 'bg-[#0E7C7B] text-white'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Class {sortField === 'prospectivity' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortField === 'mno') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortField('mno'); setSortOrder('desc'); }
                }}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  sortField === 'mno'
                    ? 'bg-[#0E7C7B] text-white'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                MnO% {sortField === 'mno' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  if (sortField === 'tonnage') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  else { setSortField('tonnage'); setSortOrder('desc'); }
                }}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  sortField === 'tonnage'
                    ? 'bg-[#0E7C7B] text-white'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Tonnage {sortField === 'tonnage' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${borderDivider} ${
                  isDark ? textMuted : 'bg-slate-100 text-slate-700'
                }`}>
                  <th className="py-3 px-4">Zone Code</th>
                  <th className="py-3 px-4">Target Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Predicted MnO%</th>
                  <th className="py-3 px-4">Est. Tonnage</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                {sortedZones.map((zone) => {
                  const style = getProspectivityColor(zone.prospectivityClass);
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <tr
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? isDark ? 'bg-[#0E7C7B]/15' : 'bg-teal-50/70 border-l-4 border-l-teal-600' 
                          : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={`py-3.5 px-4 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {zone.code}
                      </td>
                      <td className={`py-3.5 px-4 ${isDark ? 'text-slate-200' : 'text-slate-800 font-semibold'}`}>
                        {zone.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${style.badge}`}>
                          {zone.prospectivityClass}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 font-headline font-black text-base ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                        {zone.predictedMnO}%
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {zone.estTonnage.toLocaleString()} t
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold ${
                          zone.priority === 'Priority'
                            ? isDark ? 'text-red-400' : 'text-rose-700 font-black'
                            : zone.priority === 'Monitor'
                            ? isDark ? 'text-amber-400' : 'text-amber-700 font-black'
                            : isDark ? 'text-slate-400' : 'text-slate-600 font-semibold'
                        }`}>
                          {zone.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedZone(zone);
                            setViewMode('MAP');
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer mr-2 ${
                            isDark
                              ? 'bg-[#0E7C7B]/20 hover:bg-[#0E7C7B]/30 border border-[#0E7C7B]/40 text-teal-300'
                              : 'bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800'
                          }`}
                        >
                          Map Focus →
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSendToForecast) onSendToForecast();
                          }}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black uppercase transition-all cursor-pointer shadow-xs"
                        >
                          Send to Forecast
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODEL 1 INFORMATION (COLLAPSIBLE EXPLAINABILITY SECTION) */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-3 shadow-md`}>
        <button
          onClick={() => setShowModelInfo(!showModelInfo)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0E7C7B] text-lg">memory</span>
            <h3 className={`font-headline font-black text-xs uppercase tracking-wider ${textPrimary}`}>
              MODEL 1 INFORMATION
            </h3>
            <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500 font-bold'}`}>
              (Random Forest Classifier & Regressor Details)
            </span>
          </div>
          <span className={`material-symbols-outlined transition-colors ${
            isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-950'
          }`}>
            {showModelInfo ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showModelInfo && (
          <div className={`pt-3 border-t space-y-4 text-xs font-medium ${borderDivider} ${textSecondary} animate-in fade-in duration-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? nestedBg : 'bg-slate-50/80 border-slate-200/90 shadow-xs'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  isDark ? 'text-teal-400' : 'text-teal-800'
                }`}>
                  MODEL ARCHITECTURE & DUAL-STAGE PROCESS
                </span>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  <strong>Stage 1 (Classification):</strong> Random Forest Classifier assigns prospectivity zones to spatial grid cells (High, Medium, Low) based on multispectral satellite indices and structural faults.
                </p>
                <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  <strong>Stage 2 (Regression):</strong> Random Forest Regressor predicts continuous manganese grade (MnO%) for each identified target zone.
                </p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isDark ? nestedBg : 'bg-slate-50/80 border-slate-200/90 shadow-xs'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  isDark ? 'text-amber-400' : 'text-amber-800'
                }`}>
                  GEOSPATIAL INPUT FEATURES
                </span>
                <ul className={`list-disc list-inside space-y-1 font-mono text-[11px] ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  <li>Sentinel-2 MSI Multispectral Bands (Band 11 SWIR & Band 8 NIR)</li>
                  <li>Topographic Aspect, Elevation DEM & Slope Gradient</li>
                  <li>Structural Lineaments & Fault Proximity Distances</li>
                  <li>Historical Borehole Assays (Pyrolusite & Psilomelane Intercepts)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProspectivityView;
