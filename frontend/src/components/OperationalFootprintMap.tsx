// ==============================================================================
// MOIL Operational Footprint & Location Map (Interactive 3D Relief Static Map)
// Replaces Leaflet with authentic 3D India Topographic Relief Map
// Features uniform dynamic pinpoints, hover animations, tooltips, and 1-click workspace launch
// ==============================================================================

import React, { useState } from 'react';
import { PORTFOLIO_MINE_PROFILES } from '../data/portfolioData';
export type MineGeoLocation = any;
const MANGANESE_MINES_DATA: MineGeoLocation[] = PORTFOLIO_MINE_PROFILES.map((m) => ({
  id: m.id,
  name: m.name,
  state: m.location.split(',')[1]?.trim() || '',
  district: m.location.split(',')[0]?.trim() || '',
  type: m.type,
  coords: [21.1, 79.5] as [number, number],
  status: m.status === 'Shortfall' ? 'active' : 'inactive',
  reserves: 1.0,
  description: ''
}));
import {
  ExternalLink,
  Compass,
  Activity,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface OperationalFootprintMapProps {
  selectedState: string;
  selectedFilter: string;
  hoveredMineId: string | null;
  onSelectMine: (mine: MineGeoLocation) => void;
  onHoverMine?: (id: string | null) => void;
  onSelectState?: (state: string) => void;
  themeMode?: 'dark' | 'light';
  onLaunchWorkspace?: (mineId: string) => void;
}

// Precise calibrated coordinates matching frontend/public/assets/india-moil-map.png (1024 x 967)
interface MapMineDefinition {
  id: string;
  name: string;
  displayName: string;
  state: 'Maharashtra' | 'Madhya Pradesh';
  district: string;
  location: string;
  type: 'Underground' | 'Open Cast';
  gradePct: string;
  estimatedReserveTons: number;
  currentAnnualProductionTons: number;
  depthMeters: number;
  // Pin point coordinates (percent on 1024x967 image): tip of the pin
  pin: { x: number; tipY: number };
  // Badge callout coordinates (percent on 1024x967 image)
  badge: { x: number; y: number; w: number; h: number; side: 'left' | 'right' };
}

const STATIC_MAP_MINES: MapMineDefinition[] = [
  {
    id: 'balaghat',
    name: 'Balaghat Mine (Bharweli)',
    displayName: 'Balaghat',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Underground',
    gradePct: '46% - 52% Mn (Deep High-Grade)',
    estimatedReserveTons: 22400000,
    currentAnnualProductionTons: 580000,
    depthMeters: 385,
    pin: { x: 49.02, tipY: 47.78 },
    badge: { x: 6.15, y: 13.75, w: 15.82, h: 4.96, side: 'left' },
  },
  {
    id: 'ukwa',
    name: 'Ukwa Mine',
    displayName: 'Ukwa',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Underground',
    gradePct: '40% - 44% Mn',
    estimatedReserveTons: 7100000,
    currentAnnualProductionTons: 210000,
    depthMeters: 195,
    pin: { x: 52.25, tipY: 48.29 },
    badge: { x: 57.42, y: 26.37, w: 11.33, h: 5.27, side: 'right' },
  },
  {
    id: 'tirodi',
    name: 'Tirodi Mine',
    displayName: 'Tirodi',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Open Cast',
    gradePct: '38% - 45% Mn',
    estimatedReserveTons: 9800000,
    currentAnnualProductionTons: 310000,
    depthMeters: 90,
    pin: { x: 46.39, tipY: 52.02 },
    badge: { x: 7.71, y: 21.2, w: 11.43, h: 5.07, side: 'left' },
  },
  {
    id: 'sitapatore',
    name: 'Sitapatore Mine',
    displayName: 'Sitapatore',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Open Cast',
    gradePct: '36% - 41% Mn',
    estimatedReserveTons: 2400000,
    currentAnnualProductionTons: 95000,
    depthMeters: 65,
    pin: { x: 49.85, tipY: 52.22 },
    badge: { x: 72.46, y: 55.02, w: 23.63, h: 4.76, side: 'right' },
  },
  {
    id: 'chikla',
    name: 'Chikla Mine',
    displayName: 'Chikla',
    state: 'Maharashtra',
    district: 'Bhandara',
    location: 'Bhandara, Maharashtra',
    type: 'Underground',
    gradePct: '38% - 44% Mn',
    estimatedReserveTons: 8200000,
    currentAnnualProductionTons: 250000,
    depthMeters: 210,
    pin: { x: 44.87, tipY: 55.84 },
    badge: { x: 6.35, y: 57.91, w: 12.4, h: 5.17, side: 'left' },
  },
  {
    id: 'munsar',
    name: 'Munsar Mine',
    displayName: 'Munsar',
    state: 'Maharashtra',
    district: 'Nagpur',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    gradePct: '36% - 42% Mn',
    estimatedReserveTons: 5100000,
    currentAnnualProductionTons: 165000,
    depthMeters: 180,
    pin: { x: 48.19, tipY: 55.53 },
    badge: { x: 69.34, y: 59.98, w: 18.75, h: 4.65, side: 'right' },
  },
  {
    id: 'kandri',
    name: 'Kandri Mine',
    displayName: 'Kandri',
    state: 'Maharashtra',
    district: 'Nagpur',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    gradePct: '44% - 48% Mn',
    estimatedReserveTons: 9400000,
    currentAnnualProductionTons: 290000,
    depthMeters: 240,
    pin: { x: 42.48, tipY: 57.6 },
    badge: { x: 11.04, y: 67.11, w: 12.79, h: 4.76, side: 'left' },
  },
  {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Mine',
    displayName: 'Dongri Buzurg',
    state: 'Maharashtra',
    district: 'Bhandara',
    location: 'Bhandara, Maharashtra',
    type: 'Open Cast',
    gradePct: '42% - 49% Mn (Dioxide Ore)',
    estimatedReserveTons: 14850000,
    currentAnnualProductionTons: 420000,
    depthMeters: 85,
    pin: { x: 46.48, tipY: 59.46 },
    badge: { x: 67.87, y: 65.05, w: 19.24, h: 4.65, side: 'right' },
  },
  {
    id: 'gumgaon',
    name: 'Gumgaon Mine',
    displayName: 'Gumgaon',
    state: 'Maharashtra',
    district: 'Nagpur',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    gradePct: '37% - 43% Mn',
    estimatedReserveTons: 6300000,
    currentAnnualProductionTons: 185000,
    depthMeters: 225,
    pin: { x: 44.34, tipY: 60.7 },
    badge: { x: 65.43, y: 70.01, w: 16.11, h: 4.76, side: 'right' },
  },
  {
    id: 'beldongri',
    name: 'Beldongri Mine',
    displayName: 'Beldongri',
    state: 'Maharashtra',
    district: 'Nagpur',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    gradePct: '35% - 40% Mn',
    estimatedReserveTons: 3800000,
    currentAnnualProductionTons: 120000,
    depthMeters: 160,
    pin: { x: 41.6, tipY: 62.15 },
    badge: { x: 8.59, y: 72.49, w: 17.19, h: 5.27, side: 'left' },
  },
];

export const OperationalFootprintMap: React.FC<OperationalFootprintMapProps> = ({
  selectedState,
  selectedFilter,
  hoveredMineId,
  onSelectMine,
  onHoverMine,
  onSelectState,
  themeMode = 'dark',
  onLaunchWorkspace,
}) => {
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);
  const isDark = themeMode === 'dark';

  // Active highlighted mine: either hovered from internal map or from external right list
  const activeId = hoveredMineId || internalHoveredId;
  const activeMine = STATIC_MAP_MINES.find((m) => m.id === activeId) || null;

  const handleMouseEnter = (id: string) => {
    setInternalHoveredId(id);
    if (onHoverMine) onHoverMine(id);
  };

  const handleMouseLeave = () => {
    setInternalHoveredId(null);
    if (onHoverMine) onHoverMine(null);
  };

  const handleMineClick = (mineDef: MapMineDefinition) => {
    const geoMatch = MANGANESE_MINES_DATA.find((g) => g.id === mineDef.id);
    if (geoMatch) {
      onSelectMine(geoMatch);
    }
    if (onLaunchWorkspace) {
      onLaunchWorkspace(mineDef.id);
    }
  };

  // State filtering logic
  const isMineVisible = (mineDef: MapMineDefinition) => {
    if (selectedState && selectedState !== 'ALL') {
      const normState = selectedState.toLowerCase();
      if (!mineDef.state.toLowerCase().includes(normState)) {
        return false;
      }
    }
    if (selectedFilter === 'ACTIVE_PILOT' && mineDef.id === 'sitapatore') {
      return true;
    }
    return true;
  };

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden border relative flex flex-col shadow-2xl transition-colors duration-300 select-none ${
        isDark
          ? 'bg-gradient-to-b from-[#0B101D] via-[#0D1527] to-[#080C16] border-cyan-500/20 shadow-cyan-950/30'
          : 'bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] border-slate-300 shadow-slate-300/40'
      }`}
      style={{ minHeight: '620px' }}
    >
      {/* Background Cartographic Subtle Grid & Radar Scanlines */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)]'
            : 'opacity-25 bg-[radial-gradient(#002452_1px,transparent_1px)]'
        } [background-size:24px_24px]`}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 48% 54%, rgba(14, 165, 233, 0.25) 0%, rgba(245, 158, 11, 0.12) 35%, transparent 70%)'
            : 'radial-gradient(circle at 48% 54%, rgba(59, 130, 246, 0.15) 0%, rgba(245, 158, 11, 0.08) 35%, transparent 70%)',
        }}
      />

      {/* Top Floating Header HUD */}
      <div
        className={`relative z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${
          isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div>
            <h3
              className={`font-headline text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-[#002452]'
              }`}
            >
              <Compass className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-[#002452]'}`} />
              MOIL Geospatial Command Map
            </h3>
            <p className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Central India Manganese Ore Corridor • 10 Active & Pilot Leases
            </p>
          </div>
        </div>

        {/* State Filter Quick Chips */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          {(['ALL', 'Maharashtra', 'Madhya Pradesh'] as const).map((st) => {
            const isSelected =
              (st === 'ALL' && (!selectedState || selectedState === 'ALL')) ||
              (selectedState && selectedState.toLowerCase() === st.toLowerCase());
            return (
              <button
                key={st}
                onClick={() => onSelectState && onSelectState(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono tracking-wide transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                    : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                }`}
              >
                {st === 'ALL' ? 'All Leases (10)' : st === 'Maharashtra' ? 'MH (6)' : 'MP (4)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Interactive Canvas Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Aspect Ratio Container for 1024x967 India Map */}
        <div
          className="relative w-full max-w-[620px] aspect-[1024/967] mx-auto select-none"
          style={{ maxHeight: '540px' }}
        >
          {/* Static Topographic 3D India Relief Map */}
          <img
            src="/assets/india-moil-map.png"
            alt="MOIL India Topographic 3D Operations Map"
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
          />

          {/* Unified Dynamic Pin Points Layer */}
          {STATIC_MAP_MINES.map((mine) => {
            const isHovered = activeId === mine.id;
            const visible = isMineVisible(mine);

            return (
              <div
                key={`pin-${mine.id}`}
                className={`absolute z-20 cursor-pointer transition-all duration-300 ${
                  visible ? 'opacity-100' : 'opacity-35 grayscale-[50%]'
                }`}
                style={{
                  left: `${mine.pin.x}%`,
                  top: `${mine.pin.tipY}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                onClick={() => handleMineClick(mine)}
                onMouseEnter={() => handleMouseEnter(mine.id)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Sonar Beacon Pulse at Pin Tip (Clean subtle red radar pulse - NO golden ring) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 pointer-events-none flex items-center justify-center">
                  <span
                    className={`absolute rounded-full transition-opacity duration-300 ${
                      isHovered
                        ? 'w-9 h-9 bg-red-500/50 animate-ping'
                        : 'w-6 h-6 bg-red-500/25 animate-ping [animation-duration:2.8s]'
                    }`}
                  />
                  <span
                    className={`absolute w-3 h-3 rounded-full transition-opacity duration-300 ${
                      isHovered ? 'bg-red-500' : 'bg-red-600/70'
                    }`}
                  />
                </div>

                {/* Unified Teardrop Map Pin Marker (Clean authentic red map pin - NO golden ring, NO axe) */}
                <div
                  className={`relative transition-transform duration-200 ${
                    isHovered ? '-translate-y-2 scale-125' : 'hover:-translate-y-1 hover:scale-110'
                  }`}
                  title={`${mine.name} - Click to Open Workspace`}
                >
                  <svg
                    viewBox="0 0 24 34"
                    className={`w-[22px] h-[30px] filter transition-all duration-200 ${
                      isHovered
                        ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                        : 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.65)]'
                    }`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id={`pinGrad-${mine.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={isHovered ? '#FF6B6B' : '#FF4D4D'} />
                        <stop offset="50%" stopColor={isHovered ? '#EF4444' : '#DC2626'} />
                        <stop offset="100%" stopColor={isHovered ? '#B91C1C' : '#991B1B'} />
                      </linearGradient>
                    </defs>

                    {/* Authentic Teardrop Body */}
                    <path
                      d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12C0.5 20.3 10.8 32.7 11.3 33.3C11.68 33.75 12.32 33.75 12.7 33.3C13.2 32.7 23.5 20.3 23.5 12C23.5 5.65 18.35 0.5 12 0.5Z"
                      fill={`url(#pinGrad-${mine.id})`}
                      stroke="#FFFFFF"
                      strokeWidth={isHovered ? '1.6' : '1.2'}
                    />

                    {/* Crisp White Inner Center Dot */}
                    <circle cx="12" cy="12" r={isHovered ? '4.5' : '4.2'} fill="#FFFFFF" />
                  </svg>
                </div>
              </div>
            );
          })}
          {/* Dynamic Interactive Label Badges Hotspots (Invisible clickable zones over map badges - NO ring or outline) */}
          {STATIC_MAP_MINES.map((mine) => (
            <button
              key={`badge-${mine.id}`}
              onClick={() => handleMineClick(mine)}
              onMouseEnter={() => handleMouseEnter(mine.id)}
              onMouseLeave={handleMouseLeave}
              className="absolute z-25 cursor-pointer bg-transparent border-none outline-none ring-0 focus:outline-none"
              style={{
                left: `${mine.badge.x}%`,
                top: `${mine.badge.y}%`,
                width: `${mine.badge.w}%`,
                height: `${mine.badge.h}%`,
              }}
              title={`Click to open ${mine.name} Workspace`}
            />
          ))}

          {/* Floating High-Tech Inspector Tooltip Modal (Positioned smartly opposite badge side to avoid collision) */}
          {activeMine && (
            <div
              className={`absolute z-50 pointer-events-auto rounded-xl border p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-200 animate-in fade-in zoom-in-95 ${
                isDark
                  ? 'bg-[#0f172a]/95 border-amber-500/50 shadow-amber-500/20 text-white'
                  : 'bg-white/95 border-amber-500/50 shadow-slate-900/30 text-slate-900'
              }`}
              style={{
                // Opposite side placement: if badge is on right, tooltip shows on left; if badge is on left, tooltip shows on right
                left: activeMine.badge.side === 'right' ? '6%' : '56%',
                top: `${Math.max(10, Math.min(48, activeMine.pin.tipY - 20))}%`,
                width: '270px',
              }}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeMine.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {activeMine.state}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Hub
                </span>
              </div>

              {/* Mine Title & Location (Location pin icon, NO axe sign) */}
              <div className="mt-2">
                <h4
                  className={`font-headline font-black text-sm flex items-center gap-1.5 ${
                    isDark ? 'text-amber-400' : 'text-[#002452]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {activeMine.name}
                </h4>
                <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {activeMine.location}
                </p>
              </div>

              {/* Mining Metrics Grid */}
              <div
                className={`mt-2.5 grid grid-cols-2 gap-2 text-[10px] font-mono p-2 rounded-lg border ${
                  isDark
                    ? 'bg-black/40 border-white/5'
                    : 'bg-slate-100/90 border-slate-200'
                }`}
              >
                <div>
                  <span className={`block text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ore Grade
                  </span>
                  <span className={`font-bold truncate block ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
                    {activeMine.gradePct.split(' ')[0]} Mn
                  </span>
                </div>
                <div>
                  <span className={`block text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Est. Reserves
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                    {(activeMine.estimatedReserveTons / 1000000).toFixed(1)} M Tonnes
                  </span>
                </div>
                <div>
                  <span className={`block text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Annual Target
                  </span>
                  <span className={`font-bold block ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}>
                    {(activeMine.currentAnnualProductionTons / 1000).toFixed(0)}k T/yr
                  </span>
                </div>
                <div>
                  <span className={`block text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Shaft / Pit Depth
                  </span>
                  <span className={`font-bold block ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                    {activeMine.depthMeters}m
                  </span>
                </div>
              </div>

              {/* Interactive Open Workspace Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMineClick(activeMine);
                }}
                className="w-full mt-2.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 group"
              >
                <span>Open Workspace</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Floating Status Bar */}
      <div
        className={`relative z-30 px-4 py-2.5 border-t backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] font-mono gap-2 ${
          isDark
            ? 'border-white/10 bg-black/40 text-slate-300'
            : 'border-slate-200 bg-white/80 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>
            Telemetry Synchronized: <strong className={isDark ? 'text-amber-400' : 'text-[#002452]'}>10 Operations</strong> • Total
            Reserves: <strong className="text-emerald-500 font-bold">89.6M T</strong>
          </span>
        </div>

        <div className={`flex items-center gap-3 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <span className={`hidden sm:inline-flex items-center gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Sparkles className="w-3 h-3 text-cyan-500" />
            Click any pin or badge to open workspace
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-800'
            }`}
          >
            DGMS & IBM Standard
          </span>
        </div>
      </div>
    </div>
  );
};
