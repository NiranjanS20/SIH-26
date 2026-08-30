// ==============================================================================
// MOIL Mine Site Visualizer (Contour Topography, Live Satellite GIS, Subsurface Geology)
// ==============================================================================

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { TILE_PROVIDERS } from '../data/reserveMappingData';
import { type MineProductionProfile } from '../data/mineProductionData';
import { Layers, Mountain, Satellite } from 'lucide-react';

interface MineSiteVisualizerProps {
  mineProfile: MineProductionProfile;
  themeMode?: 'dark' | 'light';
}

export type VisualMode = 'CONTOUR' | 'SATELLITE' | 'GEOLOGY';

// Coordinates mapping for each mine
const MINE_COORDINATES: Record<string, [number, number]> = {
  'dongri-buzurg': [21.554, 79.702],
  'balaghat': [21.870, 80.185],
  'chikla': [21.565, 79.755],
  'kandri': [21.415, 79.280],
  'tirodi': [21.680, 79.720],
};

export const MineSiteVisualizer: React.FC<MineSiteVisualizerProps> = ({
  mineProfile,
  themeMode = 'dark',
}) => {
  const [visualMode, setVisualMode] = useState<VisualMode>('CONTOUR');
  const [activeElevation, setActiveElevation] = useState<number>(280);

  const isDark = themeMode === 'dark';
  const coords = MINE_COORDINATES[mineProfile.id] || [21.554, 79.702];

  // Bench polygon coordinates around the mine center
  const benchPolygon: [number, number][] = [
    [coords[0] + 0.003, coords[1] - 0.004],
    [coords[0] + 0.004, coords[1] + 0.003],
    [coords[0] - 0.003, coords[1] + 0.004],
    [coords[0] - 0.004, coords[1] - 0.003],
  ];

  const markerIcon = L.divIcon({
    className: 'pit-center-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 13px;
      ">
        ⛏
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="space-y-2 pt-2">
      {/* Header with 3 Mode Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          SITE VISUAL & RASTER OVERLAY
        </span>

        {/* 3 Distinct View Mode Buttons */}
        <div className={`flex items-center gap-1 p-1 rounded-lg border ${
          isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setVisualMode('CONTOUR')}
            className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'CONTOUR'
                ? 'bg-[#0E7C7B] text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mountain className="w-3 h-3" />
            <span>Contour</span>
          </button>

          <button
            onClick={() => setVisualMode('SATELLITE')}
            className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'SATELLITE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite GIS</span>
          </button>

          <button
            onClick={() => setVisualMode('GEOLOGY')}
            className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              visualMode === 'GEOLOGY'
                ? 'bg-purple-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Geology</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Container */}
      <div
        className={`w-full rounded-xl border relative overflow-hidden shadow-lg ${
          isDark ? 'bg-[#12151B] border-white/15' : 'bg-slate-900 border-slate-700'
        }`}
        style={{ height: '240px' }}
      >
        {/* ========================================================================= */}
        {/* OPTION 1: CONTOUR MODE (Topography, Bench Elevations, Excavation Limits) */}
        {/* ========================================================================= */}
        {visualMode === 'CONTOUR' && (
          <div className="w-full h-full relative p-3 flex flex-col justify-between select-none">
            {/* Background Grid & Elevation Isolines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

            <svg viewBox="0 0 540 200" className="w-full h-full relative z-10">
              {/* Elevation Contours */}
              {/* +340m Top Crest */}
              <path
                d="M 20 50 Q 140 10 270 50 T 520 50"
                fill="none"
                stroke="#64748B"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity="0.6"
              />
              <text x="30" y="44" fill="#94A3B8" fontSize="8" fontFamily="monospace">+340m Crest</text>

              {/* +310m Intermediate Bench */}
              <path
                d="M 35 85 Q 160 30 270 85 T 505 85"
                fill="none"
                stroke="#0E7C7B"
                strokeWidth="1.6"
                opacity="0.85"
              />
              <text x="45" y="80" fill="#0E7C7B" fontSize="8" fontWeight="bold" fontFamily="monospace">+310m ROM Bench</text>

              {/* +280m Active Extraction Pit Face */}
              <path
                d="M 60 120 Q 180 55 270 120 T 480 120"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.4"
                opacity="0.95"
              />
              <text x="70" y="115" fill="#F59E0B" fontSize="9" fontWeight="extrabold" fontFamily="monospace">+280m Active Ore Face</text>

              {/* +240m Sump Inflow Bottom */}
              <path
                d="M 90 155 Q 200 90 270 155 T 450 155"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.8"
                strokeDasharray="3 3"
                opacity="0.8"
              />
              <text x="100" y="150" fill="#60A5FA" fontSize="8" fontFamily="monospace">+240m Pit Sump Basin</text>

              {/* Ore Pit Polygon Boundary */}
              <polygon
                points="110,65 430,70 390,165 150,160"
                fill="#F59E0B"
                fillOpacity="0.15"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeDasharray="5 3"
              />

              {/* Dynamic Ore Pins */}
              <g className="cursor-pointer">
                <circle cx="230" cy="98" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="242" y="88" width="165" height="20" rx="4" fill="rgba(15,23,42,0.85)" stroke="rgba(245,158,11,0.5)" />
                <text x="248" y="102" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                  Pit Bench DB-01 (46.2% Mn)
                </text>
              </g>

              <g className="cursor-pointer">
                <circle cx="340" cy="132" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="352" y="122" width="140" height="20" rx="4" fill="rgba(15,23,42,0.85)" stroke="rgba(56,189,248,0.5)" />
                <text x="358" y="136" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                  East Ridge (+12.4kt ROM)
                </text>
              </g>
            </svg>

            {/* Bottom Status Bar with Interactive Elevation Selector */}
            <div className="relative z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>TOPOGRAPHIC BENCH CONTOUR</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[9px]">BENCH:</span>
                {[240, 280, 310, 340].map((elev) => (
                  <button
                    key={elev}
                    onClick={() => setActiveElevation(elev)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      activeElevation === elev
                        ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-amber-300'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    +{elev}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 2: SATELLITE GIS MODE (High-Resolution Space-Tech Pit View)       */}
        {/* ========================================================================= */}
        {visualMode === 'SATELLITE' && (
          <div className="w-full h-full relative">
            <MapContainer
              center={coords}
              zoom={14}
              minZoom={12}
              maxZoom={18}
              scrollWheelZoom={false}
              zoomControl={false}
              className="w-full h-full"
            >
              {/* Esri World Imagery (Satellite) */}
              <TileLayer
                url={TILE_PROVIDERS.satellite.url}
                attribution={TILE_PROVIDERS.satellite.attribution}
                maxZoom={18}
              />

              {/* Active Lease Bench Boundary */}
              <Polygon
                positions={benchPolygon}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 2,
                  dashArray: '4 4',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.2,
                }}
              />

              {/* Mine Head Marker */}
              <Marker position={coords} icon={markerIcon}>
                <Popup>
                  <div className="p-1.5 text-xs font-bold">
                    <span className="text-amber-500 block">{mineProfile.mineName}</span>
                    <span className="text-[10px] text-slate-600 block">
                      Coord: {coords[0].toFixed(3)}°N, {coords[1].toFixed(3)}°E
                    </span>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Live Space Telemetry HUD */}
            <div className="absolute bottom-2 left-2 right-2 z-400 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/15 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-amber-400">Sentinel-2B Optical MSI (10m)</span>
              </div>
              <span className="text-slate-400">
                Lat: {coords[0].toFixed(3)}°N · Lng: {coords[1].toFixed(3)}°E
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OPTION 3: GEOLOGY STRATIGRAPHY MODE (Subsurface Strata & Manganese Reef) */}
        {/* ========================================================================= */}
        {visualMode === 'GEOLOGY' && (
          <div className="w-full h-full relative p-3 flex flex-col justify-between select-none bg-[#0d1117]">
            <div className="relative z-10 w-full h-44 flex flex-col justify-between py-1">
              {/* Strata Layer 1: Weathered Laterite Soil */}
              <div className="h-7 w-full rounded bg-gradient-to-r from-[#854d0e] via-[#a16207] to-[#854d0e] flex items-center justify-between px-3 text-[9.5px] font-bold text-white border border-[#ca8a04]/40 shadow-xs">
                <span>0 – 8m: Lateritic Soil & Weathered Overburden</span>
                <span className="text-[8.5px] font-mono opacity-80">Waste Stripping Zone</span>
              </div>

              {/* Strata Layer 2: Quartz-Muscovite Schist */}
              <div className="h-7 w-full rounded bg-gradient-to-r from-[#334155] via-[#475569] to-[#334155] flex items-center justify-between px-3 text-[9.5px] font-bold text-slate-200 border border-slate-500/30 shadow-xs">
                <span>8 – 24m: Quartz-Muscovite Schist (Hanging Wall)</span>
                <span className="text-[8.5px] font-mono opacity-80">Dip: 68° NW</span>
              </div>

              {/* Strata Layer 3: High Grade Manganese Ore Reef (HERO MINERAL LAYER) */}
              <div className="h-9 w-full rounded bg-gradient-to-r from-[#581c87] via-[#7e22ce] to-[#581c87] flex items-center justify-between px-3 text-xs font-black text-white border-2 border-amber-400 shadow-md animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                    ORE REEF
                  </span>
                  <span>24 – 42m: Pyrolusite & Braunsite Band (48.5% Mn)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-extrabold">
                  {mineProfile.type === 'Open Cast' ? 'Open-Cast Bench Target' : 'Underground Stope Level'}
                </span>
              </div>

              {/* Strata Layer 4: Gondite & Quartzite Basement */}
              <div className="h-7 w-full rounded bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] flex items-center justify-between px-3 text-[9.5px] font-bold text-slate-400 border border-slate-700/50 shadow-xs">
                <span>&gt;42m: Gondite & Manganiferous Quartzite Basement (Footwall)</span>
                <span className="text-[8.5px] font-mono opacity-80">Sausar Group Formation</span>
              </div>
            </div>

            {/* Bottom Geological Telemetry Bar */}
            <div className="relative z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>SAUSAR GROUP • MANSAR STAGE STRATIGRAPHY</span>
              </span>
              <span className="text-amber-400 font-bold">STRIKE: N65°E · DIP: 68° NW</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
