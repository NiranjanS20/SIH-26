import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { TILE_PROVIDERS } from '../data/reserveMappingData';
import Silk from './ui/Silk';

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
  polygonD: string; // SVG path
  leafletCoords: [number, number][]; // Leaflet lat/lng
}

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
    polygonD: 'M 300 70 L 460 75 L 430 155 L 280 145 Z',
    leafletCoords: [
      [21.557, 79.704],
      [21.558, 79.709],
      [21.553, 79.708],
      [21.552, 79.703],
    ],
  },
  {
    id: 'PZ-DB-07',
    code: 'Zone 07',
    name: 'Zone 07 (North Hanging Wall)',
    prospectivityClass: 'HIGH',
    predictedMnO: 42.8,
    estTonnage: 3850,
    geologicalStructure: 'Faulted contact with quartz-muscovite schist',
    accessibilityPct: 82,
    recoverabilityPct: 89,
    evidence: 'Ground magnetic gradient confirmed strike continuity; trench assays 41.5% - 44.0% Mn',
    recommendedAction: 'Advance exploratory infill drilling 50m grid spacing',
    priority: 'Priority',
    polygonD: 'M 130 50 L 260 45 L 240 100 L 110 95 Z',
    leafletCoords: [
      [21.559, 79.699],
      [21.560, 79.704],
      [21.556, 79.703],
      [21.555, 79.698],
    ],
  },
  {
    id: 'PZ-DB-09',
    code: 'Zone 09',
    name: 'Zone 09 (Central Pit Footwall)',
    prospectivityClass: 'HIGH',
    predictedMnO: 41.5,
    estTonnage: 3100,
    geologicalStructure: 'Banded manganese-silicate quartzite (gondite) horizon',
    accessibilityPct: 94,
    recoverabilityPct: 86,
    evidence: 'High reflectance band at 2.2µm; historical bench exposure',
    recommendedAction: 'Incorporate into Q3 overburden stripping cycle',
    priority: 'Priority',
    polygonD: 'M 200 110 L 320 105 L 300 165 L 180 160 Z',
    leafletCoords: [
      [21.554, 79.701],
      [21.555, 79.706],
      [21.551, 79.705],
      [21.550, 79.700],
    ],
  },
  {
    id: 'PZ-DB-22',
    code: 'Zone 22',
    name: 'Zone 22 (South-West Exploration Block)',
    prospectivityClass: 'MEDIUM',
    predictedMnO: 38.2,
    estTonnage: 2900,
    geologicalStructure: 'Weathered braunite-rhodonite lens under 12m alluvium',
    accessibilityPct: 75,
    recoverabilityPct: 78,
    evidence: 'Moderate gravity anomaly (+180 mGal); aero-magnetic trend',
    recommendedAction: 'Schedule geophysical resistivity tomography prior to drilling',
    priority: 'Monitor',
    polygonD: 'M 60 120 L 170 115 L 150 175 L 40 170 Z',
    leafletCoords: [
      [21.551, 79.695],
      [21.552, 79.699],
      [21.548, 79.698],
      [21.547, 79.694],
    ],
  },
  {
    id: 'PZ-DB-05',
    code: 'Zone 05',
    name: 'Zone 05 (West Ridge Lateral Target)',
    prospectivityClass: 'MEDIUM',
    predictedMnO: 36.4,
    estTonnage: 2150,
    geologicalStructure: 'Quartzite contact zone dipping 55° W',
    accessibilityPct: 70,
    recoverabilityPct: 74,
    evidence: 'Surface float pyrolusite nodules; satellite NDVI anomaly',
    recommendedAction: 'Monitor environmental clearance for access track',
    priority: 'Monitor',
    polygonD: 'M 40 30 L 120 25 L 100 80 L 20 75 Z',
    leafletCoords: [
      [21.560, 79.693],
      [21.561, 79.697],
      [21.557, 79.696],
      [21.556, 79.692],
    ],
  },
  {
    id: 'PZ-DB-18',
    code: 'Zone 18',
    name: 'Zone 18 (Deep Footwall Limb)',
    prospectivityClass: 'LOW',
    predictedMnO: 31.4,
    estTonnage: 1800,
    geologicalStructure: 'Silicate-dominant gondite with minor oxide enrichment',
    accessibilityPct: 60,
    recoverabilityPct: 65,
    evidence: 'Low-grade surface outcrop assaying <32% Mn',
    recommendedAction: 'Low priority development; retain as long-term strategic reserve',
    priority: 'Low Priority',
    polygonD: 'M 350 150 L 480 155 L 450 195 L 330 190 Z',
    leafletCoords: [
      [21.550, 79.707],
      [21.551, 79.712],
      [21.547, 79.711],
      [21.546, 79.706],
    ],
  },
];

export const ProspectivityView: React.FC<ProspectivityViewProps> = ({
  isDark = true,
  onSendToForecast,
  selectedMineName = 'Dongri Buzurg',
}) => {
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [selectedZone, setSelectedZone] = useState<ZoneData>(DONGRI_ZONES[0]);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'prospectivity' | 'mno' | 'tonnage'>('prospectivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Colors based on MOIL Design Tokens
  const cardBg = isDark ? 'bg-[#181B20] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const nestedBg = isDark ? 'bg-[#242830] border-white/10' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200';

  // Total summary calculations
  const highZonesCount = DONGRI_ZONES.filter((z) => z.prospectivityClass === 'HIGH').length;
  const maxPredictedMnO = Math.max(...DONGRI_ZONES.map((z) => z.predictedMnO)).toFixed(1);
  const totalEstTonnage = DONGRI_ZONES.reduce((acc, z) => acc + z.estTonnage, 0).toLocaleString();

  // Helper for prospectivity colors
  const getProspectivityColor = (pClass: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (pClass) {
      case 'HIGH':
        return {
          badge: 'bg-[#B03A2E]/20 text-[#B03A2E] border-[#B03A2E]/40 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800/60',
          dot: 'bg-[#B03A2E] dark:bg-red-500',
          hex: '#B03A2E',
          text: 'text-[#B03A2E] dark:text-red-400',
        };
      case 'MEDIUM':
        return {
          badge: 'bg-[#B8860B]/20 text-[#B8860B] border-[#B8860B]/40 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-700/60',
          dot: 'bg-[#B8860B] dark:bg-amber-400',
          hex: '#B8860B',
          text: 'text-[#B8860B] dark:text-amber-400',
        };
      case 'LOW':
        return {
          badge: 'bg-[#2E7D32]/20 text-[#2E7D32] border-[#2E7D32]/40 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/60',
          dot: 'bg-[#2E7D32] dark:bg-emerald-400',
          hex: '#2E7D32',
          text: 'text-[#2E7D32] dark:text-emerald-400',
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
    // Default Prospectivity sort
    const weight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return sortOrder === 'desc'
      ? weight[b.prospectivityClass] - weight[a.prospectivityClass]
      : weight[a.prospectivityClass] - weight[b.prospectivityClass];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 3. PAGE HEADER WITH REACT BITS SILK SHADER BACKGROUND */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        {/* React Bits Interactive WebGL Silk Shader Background */}
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
            PROSPECTIVITY
          </h1>
          <p className={`text-xs sm:text-sm font-medium ${textSecondary}`}>
            “Explore potential manganese-bearing zones and estimated grade.”
          </p>
        </div>

        {/* Header Controls (Mine selector & View Toggle) */}
        <div className="relative z-10 flex items-center gap-3 shrink-0 flex-wrap">
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${nestedBg}`}>
            <span className={textMuted}>Mine:</span>
            <select
              value={selectedMineName}
              disabled
              className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
            >
              <option value="Dongri Buzurg">{selectedMineName} ▼</option>
            </select>
          </div>

          <div className={`flex items-center p-1 rounded-xl border ${nestedBg}`}>
            <button
              onClick={() => setViewMode('MAP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-[#0E7C7B] text-white shadow-md'
                  : textMuted + ' hover:text-white'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-[#0E7C7B] text-white shadow-md'
                  : textMuted + ' hover:text-white'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODEL OUTPUT SUMMARY (MODEL 1 SUMMARY) */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 shadow-md`}>
        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
          <h2 className={`font-headline font-black text-xs uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
            <span className="material-symbols-outlined text-[#0E7C7B] text-base">analytics</span>
            PROSPECTIVITY SUMMARY
          </h2>
          <span className="text-[10px] font-mono text-[#0E7C7B] font-extrabold uppercase">
            MODEL 1 (RANDOM FOREST CLASSIFIER + REGRESSOR)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Output 1: High Prospectivity Zones */}
          <div className={`p-5 rounded-xl border ${nestedBg} space-y-2 relative overflow-hidden`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
              HIGH PROSPECTIVITY ZONES
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#B03A2E] dark:text-red-400 block">
              {highZonesCount}
            </span>
            <span className={`text-xs font-medium block ${textSecondary}`}>Identified targets for exploration</span>
          </div>

          {/* Output 2: Predicted MnO% Grade */}
          <div className={`p-5 rounded-xl border ${nestedBg} space-y-2 relative overflow-hidden`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
              PREDICTED MnO%
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#0E7C7B] dark:text-teal-400 block">
              {maxPredictedMnO}%
            </span>
            <span className="text-xs font-semibold text-emerald-400 block">Peak grade potential (Zone 14)</span>
          </div>

          {/* Output 3: Est. Resource Potential */}
          <div className={`p-5 rounded-xl border ${nestedBg} space-y-2 relative overflow-hidden`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
              EST. RESOURCE POTENTIAL
            </span>
            <span className="font-headline font-black text-3xl sm:text-4xl text-[#C77B00] dark:text-amber-400 block">
              {totalEstTonnage} t
            </span>
            <span className={`text-xs font-medium block ${textSecondary}`}>Cumulative estimated tonnage</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN PROSPECTIVITY CONTENT (MAP VIEW OR LIST VIEW + ZONE DETAIL PANEL) */}
      {/* ========================================================================= */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* MAP CANVAS (7 COLS) */}
          <div className={`lg:col-span-7 p-6 rounded-2xl border ${cardBg} space-y-4 flex flex-col justify-between shadow-xl`}>
            <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0E7C7B] text-lg">layers</span>
                <h2 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
                  PROSPECTIVITY MAP
                </h2>
              </div>

              {/* Classification Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03A2E]" /> High
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" /> Medium
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" /> Low
                </span>
              </div>
            </div>

            {/* Interactive SVG / GIS Map Container */}
            <div className="relative w-full h-[400px] sm:h-[440px] rounded-xl overflow-hidden border border-white/10 bg-[#090D14] flex items-center justify-center">
              {/* Leaflet Map Layer */}
              <MapContainer
                center={[21.555, 79.702]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
              >
                <TileLayer url={TILE_PROVIDERS.dark.url} attribution={TILE_PROVIDERS.dark.attribution} />
                {DONGRI_ZONES.map((zone) => {
                  const style = getProspectivityColor(zone.prospectivityClass);
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <Polygon
                      key={zone.id}
                      positions={zone.leafletCoords}
                      pathOptions={{
                        color: style.hex,
                        fillColor: style.hex,
                        fillOpacity: isSelected ? 0.65 : 0.35,
                        weight: isSelected ? 3 : 1.5,
                      }}
                      eventHandlers={{
                        click: () => setSelectedZone(zone),
                      }}
                    >
                      <Popup>
                        <div className="text-slate-900 font-sans p-1 text-xs">
                          <strong className="block text-sm uppercase font-black">{zone.code}</strong>
                          <span className="block mt-1">Prospectivity: <strong>{zone.prospectivityClass}</strong></span>
                          <span>Predicted MnO%: <strong>{zone.predictedMnO}%</strong></span>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                })}
              </MapContainer>

              {/* Overlay Interactive SVG Grid Selector for Instant Touch Responsiveness */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <svg className="w-full h-full" viewBox="0 0 540 220" preserveAspectRatio="none">
                  {DONGRI_ZONES.map((zone) => {
                    const isSelected = selectedZone.id === zone.id;
                    const style = getProspectivityColor(zone.prospectivityClass);
                    return (
                      <g key={zone.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedZone(zone)}>
                        <path
                          d={zone.polygonD}
                          fill={style.hex}
                          fillOpacity={isSelected ? 0.6 : 0.25}
                          stroke={isSelected ? '#FFFFFF' : style.hex}
                          strokeWidth={isSelected ? 3 : 1.5}
                          strokeDasharray={isSelected ? 'none' : '4 2'}
                          className="transition-all duration-200 hover:fill-opacity-50"
                        />
                        <text
                          x={zone.id === 'PZ-DB-14' ? 360 : zone.id === 'PZ-DB-07' ? 180 : zone.id === 'PZ-DB-09' ? 240 : zone.id === 'PZ-DB-22' ? 90 : zone.id === 'PZ-DB-05' ? 60 : 390}
                          y={zone.id === 'PZ-DB-14' ? 115 : zone.id === 'PZ-DB-07' ? 75 : zone.id === 'PZ-DB-09' ? 140 : zone.id === 'PZ-DB-22' ? 148 : zone.id === 'PZ-DB-05' ? 55 : 175}
                          fill="#FFFFFF"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="drop-shadow-md select-none pointer-events-none"
                        >
                          {zone.code} ({zone.predictedMnO}%)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Map Subtitle Prompt */}
              <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-[#001433]/90 border border-white/20 text-[11px] font-bold text-white backdrop-blur-md">
                Click any zone polygon to inspect Model 1 outputs
              </div>
            </div>
          </div>

          {/* 6. ZONE DETAIL PANEL (MOST IMPORTANT ENHANCEMENT - 5 COLS) */}
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
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getProspectivityColor(selectedZone.prospectivityClass).badge}`}>
                  ● {selectedZone.prospectivityClass} PROSPECTIVITY
                </span>
              </div>

              {/* Key Output 1: PROSPECTIVITY CLASS */}
              <div className={`p-4 rounded-xl border ${nestedBg} flex items-center justify-between`}>
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>
                    PROSPECTIVITY CLASS
                  </span>
                  <span className={`font-headline text-2xl font-black block mt-0.5 ${getProspectivityColor(selectedZone.prospectivityClass).text}`}>
                    {selectedZone.prospectivityClass}
                  </span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full animate-pulse ${getProspectivityColor(selectedZone.prospectivityClass).dot}`} />
              </div>

              {/* Key Output 2: PREDICTED MnO% (LARGEST TYPOGRAPHY) */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#002452] via-[#0E7C7B]/30 to-[#001433] border border-[#0E7C7B]/50 space-y-2 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                    PREDICTED MnO%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    {selectedZone.predictedMnO >= 40 ? 'HIGH-GRADE POTENTIAL' : 'MEDIUM GRADE'}
                  </span>
                </div>
                <span className="font-headline font-black text-4xl sm:text-5xl text-white block drop-shadow-md">
                  {selectedZone.predictedMnO}%
                </span>
                <span className="text-xs font-semibold text-slate-300 block">
                  Continuous predicted manganese grade (Model 1 Regressor)
                </span>
              </div>

              {/* Key Output 3: EST. TONNAGE */}
              <div className={`p-4 rounded-xl border ${nestedBg} flex items-center justify-between`}>
                <div>
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>
                    EST. TONNAGE
                  </span>
                  <span className={`font-headline text-2xl font-black block mt-0.5 ${textPrimary}`}>
                    {selectedZone.estTonnage.toLocaleString()} t
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#C77B00] text-2xl">view_in_ar</span>
              </div>

              {/* Zone Attributes */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                    GEOLOGICAL STRUCTURE
                  </span>
                  <p className={`text-xs font-semibold leading-relaxed ${textSecondary}`}>
                    {selectedZone.geologicalStructure}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg border ${nestedBg} space-y-1`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>ACCESSIBLE</span>
                    <span className="font-bold text-xs text-emerald-400">{selectedZone.accessibilityPct}% Index</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${nestedBg} space-y-1`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>RECOVERABLE</span>
                    <span className="font-bold text-xs text-teal-400">{selectedZone.recoverabilityPct}% Ratio</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>EVIDENCE / DRILL CORE</span>
                  <p className={`text-[11px] font-mono leading-relaxed ${textSecondary}`}>
                    {selectedZone.evidence}
                  </p>
                </div>
              </div>
            </div>

            {/* 12. SEND TO FORECAST CTA BUTTON */}
            <button
              onClick={() => {
                if (onSendToForecast) onSendToForecast();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <span>SEND TO FORECAST</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      ) : (
        /* 10. ZONE LIST VIEW */
        <div className={`p-6 rounded-2xl border ${cardBg} space-y-4 shadow-xl`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3 ${borderDivider}`}>
            <div>
              <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-[#0E7C7B] text-base">format_list_bulleted</span>
                PROSPECTIVITY ZONES INVENTORY
              </h2>
              <p className={`text-xs ${textMuted} mt-0.5`}>
                Sort and inspect all potential manganese zones identified by Model 1.
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={textMuted}>Sort by:</span>
              <button
                onClick={() => {
                  setSortField('prospectivity');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  sortField === 'prospectivity' ? 'bg-[#0E7C7B] text-white border-[#0E7C7B]' : nestedBg + ' ' + textSecondary
                }`}
              >
                Prospectivity {sortField === 'prospectivity' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>

              <button
                onClick={() => {
                  setSortField('mno');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  sortField === 'mno' ? 'bg-[#0E7C7B] text-white border-[#0E7C7B]' : nestedBg + ' ' + textSecondary
                }`}
              >
                Predicted MnO% {sortField === 'mno' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>

              <button
                onClick={() => {
                  setSortField('tonnage');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  sortField === 'tonnage' ? 'bg-[#0E7C7B] text-white border-[#0E7C7B]' : nestedBg + ' ' + textSecondary
                }`}
              >
                Tonnage {sortField === 'tonnage' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${borderDivider} ${textMuted}`}>
                  <th className="py-3 px-4">ZONE</th>
                  <th className="py-3 px-4">PROSPECTIVITY</th>
                  <th className="py-3 px-4">PREDICTED MnO%</th>
                  <th className="py-3 px-4">EST. TONNAGE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs font-semibold ${borderDivider}`}>
                {sortedZones.map((zone) => {
                  const style = getProspectivityColor(zone.prospectivityClass);
                  const isSelected = selectedZone.id === zone.id;
                  return (
                    <tr
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? isDark ? 'bg-white/10' : 'bg-slate-100'
                          : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-headline font-black text-white">
                        {zone.code}
                        <span className="block text-[11px] font-normal text-slate-400">{zone.name}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${style.badge}`}>
                          ● {zone.prospectivityClass}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-headline font-black text-base text-teal-400">
                        {zone.predictedMnO}%
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {zone.estTonnage.toLocaleString()} t
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold ${zone.priority === 'Priority' ? 'text-red-400' : zone.priority === 'Monitor' ? 'text-amber-400' : 'text-slate-400'}`}>
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
                          className="px-3 py-1 rounded bg-[#0E7C7B]/20 hover:bg-[#0E7C7B]/30 border border-[#0E7C7B]/40 text-teal-300 text-[11px] font-bold uppercase transition-all cursor-pointer mr-2"
                        >
                          Map Focus →
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSendToForecast) onSendToForecast();
                          }}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black uppercase transition-all cursor-pointer"
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
      {/* 13. MODEL 1 INFORMATION (COLLAPSIBLE EXPLAINABILITY SECTION) */}
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
            <span className="text-[10px] font-mono text-slate-400">
              (Random Forest Classifier & Regressor Details)
            </span>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">
            {showModelInfo ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showModelInfo && (
          <div className={`pt-3 border-t space-y-4 text-xs font-medium ${borderDivider} ${textSecondary} animate-in fade-in duration-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${nestedBg} space-y-2`}>
                <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider block">
                  MODEL ARCHITECTURE & DUAL-STAGE PROCESS
                </span>
                <p className="leading-relaxed">
                  <strong>Stage 1 (Classification):</strong> Random Forest Classifier assigns prospectivity zones to spatial grid cells (High, Medium, Low) based on multispectral satellite indices and structural faults.
                </p>
                <p className="leading-relaxed">
                  <strong>Stage 2 (Regression):</strong> Random Forest Regressor predicts continuous manganese grade (MnO%) for each identified target zone.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${nestedBg} space-y-2`}>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                  GEOSPATIAL INPUT FEATURES
                </span>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
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
