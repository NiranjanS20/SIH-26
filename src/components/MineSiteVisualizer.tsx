// ==============================================================================
// MOIL Mine Intelligence View Component (TERRAIN & SATELLITE MODES)
// Provides mine-specific 2.5D Terraced DEM and Satellite GIS with Full-Screen Zoom.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { TILE_PROVIDERS } from '../data/reserveMappingData';
import {
  getMineIntelligenceProfile,
  type EquipmentAsset,
} from '../data/mineIntelligenceData';
import {
  Mountain,
  Satellite,
  ShieldCheck,
  Fuel,
  Gauge,
  User,
  Activity,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type IntelligenceMode = 'TERRAIN' | 'SATELLITE';

interface MineSiteVisualizerProps {
  mineId: string;
  themeMode?: 'dark' | 'light';
}

export const MineSiteVisualizer: React.FC<MineSiteVisualizerProps> = ({
  mineId,
  themeMode = 'dark',
}) => {
  const [activeMode, setActiveMode] = useState<IntelligenceMode>('TERRAIN');
  const [selectedSatelliteLayerId, setSelectedSatelliteLayerId] = useState<string>('TRUE_COLOR');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentAsset | null>(null);
  const [highlightedElevation, setHighlightedElevation] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isDark = themeMode === 'dark';
  const profile = getMineIntelligenceProfile(mineId);
  const isOpenCast = profile.type === 'Open Cast';

  // Listen for Escape key to cleanly exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const coords: [number, number] = [profile.latitude, profile.longitude];

  // Mine center custom leaflet pin
  const minePinIcon = L.divIcon({
    className: 'mine-center-pin',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 14px;
        cursor: pointer;
      ">
        ⛏
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

  // Render the core visualizer canvas & overlays
  const renderVisualizerContent = (inFullscreen: boolean) => (
    <div className={`space-y-3 ${inFullscreen ? 'flex-1 flex flex-col justify-between' : ''}`}>
      {/* Header with Title, 2 Modes (Terrain & Satellite), and Fullscreen Zoom Button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className={`font-black uppercase tracking-wider ${
            inFullscreen ? 'text-base sm:text-lg text-white' : 'text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-800')
          }`}>
            MINE INTELLIGENCE VIEW {inFullscreen && <span className="text-amber-400 ml-1">· EXPANDED FULLSCREEN</span>}
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
            isDark ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-slate-100 border-slate-300 text-[#002452]'
          }`}>
            {profile.shortCode} • {profile.type.toUpperCase()}
          </span>
        </div>

        {/* Right Controls: 2 Modes (TERRAIN, SATELLITE) & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 p-1 rounded-lg border shadow-sm ${
            isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveMode('TERRAIN')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'TERRAIN'
                  ? 'bg-[#0E7C7B] text-white shadow-md font-black'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Terrain DEM</span>
            </button>

            <button
              onClick={() => setActiveMode('SATELLITE')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'SATELLITE'
                  ? 'bg-blue-600 text-white shadow-md font-black'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite GIS</span>
            </button>
          </div>

          {/* Fullscreen Expand / Shrink Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer shadow-md ${
              inFullscreen
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={inFullscreen ? "Exit Full Screen (Esc)" : "Expand to Full Screen"}
          >
            {inFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Screen (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen ⛶</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Visual Display Container */}
      <div
        className={`w-full rounded-xl border relative overflow-hidden shadow-2xl transition-all ${
          isDark ? 'bg-[#0b0e14] border-white/15' : 'bg-slate-900 border-slate-700'
        } ${inFullscreen ? 'flex-1 min-h-[480px]' : ''}`}
        style={{ height: inFullscreen ? 'calc(100vh - 240px)' : '300px' }}
      >
        {/* ========================================================================= */}
        {/* 1. TERRAIN MODE (Rich 2.5D Terraced DEM Open-Cast Pit or Underground)      */}
        {/* ========================================================================= */}
        {activeMode === 'TERRAIN' && (
          <div className="w-full h-full relative p-3 flex flex-col justify-between select-none">
            {/* Top Interactive Bench Quick Filter Selector */}
            <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1 p-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 shadow-lg">
              <span className="text-[9px] font-mono text-slate-400 uppercase px-1 hidden sm:inline">
                Highlight Bench:
              </span>
              <button
                onClick={() => setHighlightedElevation(null)}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                  highlightedElevation === null
                    ? 'bg-[#0E7C7B] text-white font-black'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {profile.terrainData.contours.map((c) => (
                <button
                  key={c.elevationM}
                  onClick={() => setHighlightedElevation(c.elevationM)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                    highlightedElevation === c.elevationM
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  +{c.elevationM}m
                </button>
              ))}
            </div>

            {/* SVG 3D Terraced DEM Canvas */}
            <svg viewBox="0 0 540 220" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="crestTerrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="romBenchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#047857" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="oreReefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="sumpBasinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="undergroundShaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                <filter id="oreGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <pattern id="meshGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Background Digital Grid */}
              <rect width="540" height="220" fill="url(#meshGrid)" />

              {/* ============================================================ */}
              {/* CASE A: OPEN CAST TERRAIN (Dongri Buzurg, Kandri, Tirodi)    */}
              {/* ============================================================ */}
              {isOpenCast && (
                <g className="transition-all duration-300">
                  {/* Outer Rim / Top Crest Polygon */}
                  <polygon
                    points="30,35 510,35 480,85 60,85"
                    fill="url(#crestTerrainGrad)"
                    stroke="#475569"
                    strokeWidth="1.2"
                    opacity={highlightedElevation === null || highlightedElevation === 340 || highlightedElevation === 300 || highlightedElevation === 310 ? 1 : 0.25}
                  />

                  {/* Terraced Bench Tier 2 (ROM Extraction) */}
                  <polygon
                    points="60,80 480,80 440,125 100,125"
                    fill="url(#romBenchGrad)"
                    stroke="#059669"
                    strokeWidth="1.5"
                    opacity={highlightedElevation === null || highlightedElevation === 310 || highlightedElevation === 265 || highlightedElevation === 260 ? 1 : 0.25}
                  />

                  {/* Active Manganese Ore Reef Face (HERO MINERAL TIER) */}
                  <polygon
                    points="100,120 440,120 390,165 150,165"
                    fill="url(#oreReefGrad)"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    filter="url(#oreGlow)"
                    opacity={highlightedElevation === null || highlightedElevation === 280 || highlightedElevation === 265 || highlightedElevation === 260 ? 1 : 0.25}
                  />

                  {/* Bottom Sump Basin Pool */}
                  <polygon
                    points="150,160 390,160 350,195 190,195"
                    fill="url(#sumpBasinGrad)"
                    stroke="#38BDF8"
                    strokeWidth="1.8"
                    strokeDasharray="4 2"
                    opacity={highlightedElevation === null || highlightedElevation === 240 || highlightedElevation === 230 || highlightedElevation === 210 ? 1 : 0.25}
                  />

                  {/* Water Ripple in Sump */}
                  <ellipse cx="270" cy="178" rx="60" ry="10" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />
                  <ellipse cx="270" cy="178" rx="35" ry="6" fill="none" stroke="#7DD3FC" strokeWidth="0.8" opacity="0.8" />
                  <text x="270" y="181" fill="#BAE6FD" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    SUMP BASIN WATER LEVEL (-3.2m)
                  </text>

                  {/* Haul Ramp Roads with Lane Markings */}
                  {profile.terrainData.haulRoads.map((road, idx) => (
                    <g key={idx}>
                      <path
                        d={road.pathD}
                        fill="none"
                        stroke="#1E293B"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      <path
                        d={road.pathD}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="1.5"
                        strokeDasharray="5 3"
                      />
                      <text
                        x={idx === 0 ? "115" : "400"}
                        y={idx === 0 ? "55" : "60"}
                        fill="#FBBF24"
                        fontSize="7"
                        fontWeight="extrabold"
                        fontFamily="monospace"
                      >
                        ▲ {road.name} ({road.gradePct}%)
                      </text>
                    </g>
                  ))}

                  {/* Contour Level Labels on Left */}
                  {profile.terrainData.contours.map((c, i) => (
                    <g key={c.elevationM}>
                      <circle cx="45" cy={48 + i * 40} r="3" fill={c.color} />
                      <text
                        x="53"
                        y={51 + i * 40}
                        fill={c.color}
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {c.label}
                      </text>
                    </g>
                  ))}

                  {/* Blasting Safety Exclusion Zone Warning Polygon */}
                  <polygon
                    points="310,95 435,95 405,150 280,150"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text x="355" y="108" fill="#FCA5A5" fontSize="7" fontWeight="black" textAnchor="middle">
                    ⚠ BLAST HAZARD PERIMETER
                  </text>
                </g>
              )}

              {/* ============================================================ */}
              {/* CASE B: UNDERGROUND SUB-SURFACE (Balaghat & Chikla)          */}
              {/* ============================================================ */}
              {!isOpenCast && (
                <g className="transition-all duration-300">
                  {/* Ground Surface Line */}
                  <rect x="20" y="30" width="500" height="8" fill="#334155" rx="2" />
                  <text x="25" y="24" fill="#94A3B8" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                    GROUND SURFACE (+315m MSL)
                  </text>

                  {/* Surface Steel Lattice Headframe Tower */}
                  <polygon points="120,30 140,5 160,5 180,30" fill="none" stroke="#F59E0B" strokeWidth="2" />
                  <line x1="130" y1="18" x2="170" y2="18" stroke="#F59E0B" strokeWidth="1.5" />
                  <circle cx="150" cy="8" r="6" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                  <circle cx="150" cy="8" r="2" fill="#F59E0B" />
                  <text x="190" y="16" fill="#FBBF24" fontSize="8" fontWeight="bold">
                    Headframe Hoist Winder (1200kW)
                  </text>

                  {/* Vertical Hoisting Shaft (420m Deep) */}
                  <rect x="142" y="30" width="16" height="175" fill="url(#undergroundShaftGrad)" stroke="#64748B" strokeWidth="1.5" />
                  <rect x="144" y="105" width="12" height="20" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
                  <line x1="150" y1="8" x2="150" y2="105" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 1" />

                  {/* Subsurface Level 1: Haulage Drift */}
                  <rect x="158" y="70" width="340" height="20" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" rx="2" />
                  <text x="170" y="83" fill="#60A5FA" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    LEVEL 4 MAIN HAULAGE DRIFT (+180m MSL) · RAIL TRACK
                  </text>

                  {/* Subsurface Level 2: High Grade Bharweli Ore Stope (HERO ORE ZONE) */}
                  <rect x="158" y="115" width="340" height="28" fill="url(#oreReefGrad)" stroke="#F59E0B" strokeWidth="2" rx="3" filter="url(#oreGlow)" />
                  <text x="170" y="132" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace">
                    ★ LEVEL 8 EXTRACTION STOPE (+60m MSL) · 48.8% Mn MASSIVE BRAUNSITE
                  </text>

                  {/* Subsurface Level 3: Deep Extraction Level */}
                  <rect x="158" y="165" width="340" height="22" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.5" rx="2" />
                  <text x="170" y="179" fill="#C084FC" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    LEVEL 12 DEEP DEVELOPMENT (-60m MSL) · DECLINE ACCESS
                  </text>

                  {/* Depth Markers on Left */}
                  <text x="90" y="83" fill="#94A3B8" fontSize="8" fontFamily="monospace">-135m</text>
                  <text x="90" y="132" fill="#F59E0B" fontSize="8" fontWeight="bold" fontFamily="monospace">-255m</text>
                  <text x="90" y="179" fill="#A855F7" fontSize="8" fontFamily="monospace">-375m</text>
                </g>
              )}

              {/* Equipment Assets / Fleet Pins (Interactive) */}
              {profile.terrainData.equipmentAssets.map((eq) => {
                const isSelected = selectedEquipment?.id === eq.id;
                return (
                  <g
                    key={eq.id}
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => setSelectedEquipment(eq)}
                  >
                    {/* Flashing Status Beacon Halo */}
                    <circle
                      cx={eq.x}
                      cy={eq.y}
                      r={isSelected ? 14 : 9}
                      fill={eq.status === 'ACTIVE' ? '#10B981' : '#F59E0B'}
                      fillOpacity="0.25"
                      className="animate-ping"
                    />

                    {/* Machine Pin */}
                    <circle
                      cx={eq.x}
                      cy={eq.y}
                      r={isSelected ? 7 : 5.5}
                      fill={eq.status === 'ACTIVE' ? '#10B981' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    {/* Name Pill Badge */}
                    <rect
                      x={eq.x + 8}
                      y={eq.y - 12}
                      width={eq.name.length * 6 + 18}
                      height="20"
                      rx="4"
                      fill="rgba(15,23,42,0.92)"
                      stroke={isSelected ? '#F59E0B' : 'rgba(255,255,255,0.25)'}
                      strokeWidth={isSelected ? 1.8 : 1}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                    />
                    <text
                      x={eq.x + 14}
                      y={eq.y + 2}
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {eq.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Status & Geotechnical Stability Telemetry HUD */}
            <div className="relative z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              <span className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">SLOPE STABILITY: FoS 1.42 (STABLE)</span>
                <span className="text-slate-500 hidden md:inline">|</span>
                <span className="text-slate-300 hidden md:inline">
                  {profile.terrainData.equipmentAssets.length} Active Fleet Machines
                </span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-400">
                  ELEVATION: <strong className="text-amber-400">+{profile.elevationMsl}m MSL</strong>
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  LEASE: <strong className="text-white">{profile.leaseAreaHa} Ha</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SATELLITE MODE                                                         */}
        {/* ========================================================================= */}
        {activeMode === 'SATELLITE' && (
          <div className="w-full h-full relative">
            {/* Top Layer Switcher Overlay */}
            <div className="absolute top-2 left-2 right-2 z-400 flex items-center justify-between pointer-events-none gap-2">
              <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 shadow-lg overflow-x-auto max-w-[90%]">
                {profile.satelliteConfig.availableLayers.map((layer) => {
                  const isSelected = selectedSatelliteLayerId === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedSatelliteLayerId(layer.id)}
                      className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white font-extrabold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{layer.icon}</span>
                      <span>{layer.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pointer-events-auto px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-[9px] font-mono text-emerald-400 font-bold hidden sm:block">
                HIGH-RES SATELLITE TILE
              </div>
            </div>

            {/* Leaflet Satellite Map centered on selected mine */}
            <MapContainer
              center={coords}
              zoom={14}
              minZoom={12}
              maxZoom={18}
              scrollWheelZoom={true}
              zoomControl={false}
              className="w-full h-full"
            >
              {/* Esri World Imagery (Satellite) */}
              <TileLayer
                url={TILE_PROVIDERS.satellite.url}
                attribution={TILE_PROVIDERS.satellite.attribution}
                maxZoom={18}
              />

              {/* Working Pit / Mining Lease Boundary Polygon */}
              <Polygon
                positions={profile.terrainData.boundaryCoords}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 2,
                  dashArray: '5 3',
                  fillColor: '#f59e0b',
                  fillOpacity: selectedSatelliteLayerId === 'TRUE_COLOR' ? 0.15 : 0.05,
                }}
              />

              {/* Thematic Simulated Raster Sample Overlay */}
              {selectedSatelliteLayerId !== 'TRUE_COLOR' && (
                <Circle
                  center={coords}
                  radius={750}
                  pathOptions={{
                    color:
                      selectedSatelliteLayerId === 'NDVI'
                        ? '#15803d'
                        : selectedSatelliteLayerId === 'SOIL_MOISTURE'
                        ? '#0284c7'
                        : selectedSatelliteLayerId === 'SAR_SUBSIDENCE'
                        ? '#8b5cf6'
                        : '#ef4444',
                    fillColor:
                      selectedSatelliteLayerId === 'NDVI'
                        ? '#15803d'
                        : selectedSatelliteLayerId === 'SOIL_MOISTURE'
                        ? '#0284c7'
                        : selectedSatelliteLayerId === 'SAR_SUBSIDENCE'
                        ? '#8b5cf6'
                        : '#ef4444',
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                />
              )}

              {/* Mine Head Marker */}
              <Marker position={coords} icon={minePinIcon}>
                <Popup>
                  <div className="p-1 text-xs">
                    <strong className="text-amber-500 block font-bold">{profile.mineName}</strong>
                    <span className="text-[10px] text-slate-600 block">
                      {profile.district}, {profile.state}
                    </span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Bottom Telemetry HUD */}
            <div className="absolute bottom-2 left-2 right-2 z-400 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/15 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-400">{profile.satelliteConfig.sensor}</span>
                <span className="text-slate-400">({profile.satelliteConfig.spatialResolution})</span>
              </div>
              <span className="text-slate-400">
                Lat: {coords[0].toFixed(3)}°N · Lng: {coords[1].toFixed(3)}°E · Pass: {profile.satelliteConfig.lastPassDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE TELEMETRY DRAWER FOR TERRAIN EQUIPMENT SELECTION               */}
      {/* ========================================================================= */}
      {activeMode === 'TERRAIN' && selectedEquipment && (
        <div className={`p-3.5 rounded-xl border space-y-2 animate-in fade-in ${
          isDark ? 'bg-[#141820] border-emerald-500/40' : 'bg-emerald-500/5 border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedEquipment.name} ({selectedEquipment.id})
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedEquipment.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedEquipment(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> LOCATION
              </span>
              <span className="font-bold text-slate-200 block mt-0.5">{selectedEquipment.location}</span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-400" /> OPERATOR
              </span>
              <span className="font-bold text-blue-400 block mt-0.5">{selectedEquipment.operator}</span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" /> FUEL / POWER
              </span>
              <span className="font-bold text-amber-400 block mt-0.5">88% Capacity</span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-400" /> AVAILABILITY
              </span>
              <span className="font-bold text-purple-400 block mt-0.5">94.5% Uptime</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Normal In-Place Visualizer */}
      <div className="space-y-3 pt-1">
        {renderVisualizerContent(false)}
      </div>

      {/* 2. Full-Screen Zoom Overlay Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-[#090C10]/95 backdrop-blur-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="max-w-[1700px] w-full mx-auto flex-1 flex flex-col justify-between">
            {renderVisualizerContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
