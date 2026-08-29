import React, { useState } from 'react';
import { MOIL_MINES, type MineItem } from '../data/minesData';

interface IndiaMapProps {
  selectedState: string;
  selectedFilter: string;
  hoveredMineId: string | null;
  onSelectMine: (mine: MineItem) => void;
  onHoverMine: (mineId: string | null) => void;
  onSelectState?: (state: string) => void;
  themeMode?: 'dark' | 'light';
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  selectedState,
  selectedFilter,
  hoveredMineId,
  onSelectMine,
  onHoverMine,
  onSelectState,
  themeMode = 'dark',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const isDark = themeMode === 'dark';

  // Filter mines according to filter tab and state selector
  const filteredMines = MOIL_MINES.filter((mine) => {
    // State filter
    if (selectedState !== 'ALL' && mine.state !== selectedState) {
      return false;
    }
    // Mine type / status filter
    if (selectedFilter === 'OPEN CAST' && mine.type !== 'Open Cast') return false;
    if (selectedFilter === 'UNDERGROUND' && mine.type !== 'Underground') return false;
    if (selectedFilter === 'ACTIVE' && !mine.isImplemented) return false;
    return true;
  });

  return (
    <div
      className={`relative w-full h-[540px] lg:h-[640px] rounded-2xl border p-4 sm:p-6 overflow-hidden shadow-2xl flex flex-col justify-between select-none transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-[#12151B] via-[#181B20] to-[#20252D] border-white/15'
          : 'bg-gradient-to-br from-[#001D42] via-[#002452] to-[#0A3266] border-[#002452]/20 text-white'
      }`}
    >
      {/* Background Operational Grid & Radial Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Map Header Controls Overlay */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/15">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
          <span className="font-body text-xs font-extrabold text-white tracking-wider uppercase">
            MOIL Operational Footprint Map
          </span>
        </div>

        {/* Legend & Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 px-3.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-body text-white/90">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D97706] border-2 border-[#181B20]"></span>
              <span className="font-bold">Dongri Buzurg (Active Workspace)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-white/70 font-semibold">MOIL Mine Network</span>
            </div>
          </div>

          {/* Map Zoom Preset Buttons */}
          <div className="flex items-center bg-black/40 backdrop-blur-md rounded-lg border border-white/15 p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
              className="px-2 py-1 text-white hover:text-[#D97706] font-bold text-xs cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-white/70 hover:text-white font-bold text-[10px] uppercase cursor-pointer border-x border-white/15"
              title="Reset Zoom"
            >
              Reset
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              className="px-2 py-1 text-white hover:text-[#D97706] font-bold text-xs cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* SVG Map of India Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center my-1 overflow-hidden">
        <svg
          viewBox="0 0 800 850"
          className="w-full h-full max-h-[580px] transition-transform duration-500 filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Gradient for Maharashtra */}
            <linearGradient id="mhGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2E3C54" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#1B2B45" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#121F33" stopOpacity="0.9" />
            </linearGradient>
            {/* Gradient for Madhya Pradesh */}
            <linearGradient id="mpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A374A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#162336" stopOpacity="0.85" />
            </linearGradient>
            {/* Glow Filter for Active Markers */}
            <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ========================================================================= */}
          {/* HIGH-PRECISION REALISTIC VECTOR MAP OF INDIA STATES */}
          {/* ========================================================================= */}

          <g className="transition-all duration-500">
            {/* 1. Northern Region: J&K / Ladakh */}
            <path
              d="M360 40 Q410 45 440 80 Q470 120 450 165 Q420 180 390 170 Q350 150 330 110 Q340 70 360 40 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 2. Himachal / Punjab / Haryana */}
            <path
              d="M330 110 Q370 140 390 170 Q380 210 340 220 Q310 200 300 160 Q310 130 330 110 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 3. Rajasthan */}
            <path
              d="M210 230 Q290 180 340 220 Q340 290 310 330 Q240 360 190 310 Q190 260 210 230 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 4. Gujarat */}
            <path
              d="M150 320 Q220 330 240 400 Q190 440 130 410 Q120 360 150 320 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 5. Uttar Pradesh */}
            <path
              d="M340 220 Q460 240 480 310 Q400 350 340 330 Q330 270 340 220 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 6. Bihar & Jharkhand & West Bengal */}
            <path
              d="M480 310 Q580 320 610 390 Q530 440 460 380 Q460 330 480 310 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.6"
            />
            {/* 7. Odisha */}
            <path
              d="M460 380 Q530 440 510 510 Q420 480 430 410 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 8. Chhattisgarh */}
            <path
              d="M390 360 Q460 380 430 410 Q420 480 370 450 Q390 400 390 360 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.7"
            />
            {/* 9. Telangana & Andhra Pradesh */}
            <path
              d="M320 460 Q390 460 420 540 Q370 630 290 560 Q310 490 320 460 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 10. Karnataka & Goa */}
            <path
              d="M220 490 Q290 490 290 600 Q240 640 200 550 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.65"
            />
            {/* 11. Tamil Nadu & Kerala */}
            <path
              d="M240 640 Q290 600 320 710 L260 770 Q230 710 240 640 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.6"
            />
            {/* 12. North East States */}
            <path
              d="M580 290 Q680 270 700 330 Q620 370 580 290 Z"
              fill="#121A28"
              stroke="#2C3B54"
              strokeWidth="1.2"
              opacity="0.5"
            />
          </g>

          {/* ========================================================================= */}
          {/* PRIMARY MOIL OPERATIONAL HUB STATES: MADHYA PRADESH & MAHARASHTRA */}
          {/* ========================================================================= */}

          {/* MADHYA PRADESH STATE (MOIL NORTHERN MINE CLUSTER) */}
          <path
            d="M270 330 Q400 310 440 360 Q390 430 L320 440 L250 390 Z"
            fill={selectedState === 'Madhya Pradesh' ? 'url(#mpGradient)' : '#192639'}
            stroke={selectedState === 'Madhya Pradesh' ? '#D97706' : selectedState === 'ALL' ? '#60A5FA' : '#334155'}
            strokeWidth={selectedState === 'Madhya Pradesh' ? '3' : '1.8'}
            opacity={selectedState === 'ALL' || selectedState === 'Madhya Pradesh' ? '1' : '0.4'}
            onClick={() => onSelectState && onSelectState('MADHYA PRADESH')}
            className="transition-all duration-500 cursor-pointer hover:opacity-100 filter drop-shadow-md"
          />
          {/* MP State Label */}
          <text
            x="340"
            y="375"
            fill={selectedState === 'Madhya Pradesh' ? '#D97706' : '#94A3B8'}
            fontSize="14"
            fontWeight="black"
            letterSpacing="1.2"
            className="pointer-events-none select-none font-headline uppercase"
          >
            MADHYA PRADESH
          </text>

          {/* MAHARASHTRA STATE (PRIMARY MOIL FLAGSHIP HUB) */}
          <path
            d="M210 410 Q320 420 390 430 L370 510 L290 530 L190 500 Z"
            fill={selectedState === 'Maharashtra' || selectedState === 'ALL' ? 'url(#mhGradient)' : '#192639'}
            stroke={selectedState === 'Maharashtra' ? '#D97706' : '#60A5FA'}
            strokeWidth={selectedState === 'Maharashtra' ? '3.5' : '2'}
            opacity={selectedState === 'ALL' || selectedState === 'Maharashtra' ? '1' : '0.45'}
            onClick={() => onSelectState && onSelectState('MAHARASHTRA')}
            className="transition-all duration-500 cursor-pointer hover:opacity-100 filter drop-shadow-xl"
          />
          {/* MH State Label */}
          <text
            x="270"
            y="470"
            fill={selectedState === 'Maharashtra' ? '#D97706' : '#93C5FD'}
            fontSize="15"
            fontWeight="black"
            letterSpacing="1.5"
            className="pointer-events-none select-none font-headline uppercase"
          >
            MAHARASHTRA
          </text>

          {/* MOIL Corporate HQ Marker (New Delhi) */}
          <g className="pointer-events-none">
            <circle cx="345" cy="218" r="4.5" fill="#D97706" />
            <text x="356" y="222" fill="#D97706" fontSize="10" fontWeight="bold" className="font-headline tracking-wider">
              MOIL HQ (NEW DELHI)
            </text>
          </g>

          {/* Connector dashed line highlighting Nagpur-Bhandara & Balaghat Manganese Belt */}
          <g opacity="0.5" stroke="#D97706" strokeDasharray="3,3" strokeWidth="1.2">
            <line x1="365" y1="435" x2="395" y2="405" />
          </g>

          {/* ========================================================================= */}
          {/* MINE MARKERS LAYER (11 MOIL MINES ACCURATELY SPREAD) */}
          {/* ========================================================================= */}

          {MOIL_MINES.map((mine) => {
            // Translate percentage coordinates to SVG map grid
            const cx = (mine.mapCoords.x / 100) * 800;
            const cy = (mine.mapCoords.y / 100) * 850;

            const isFiltered = filteredMines.some((m) => m.id === mine.id);
            const isHovered = hoveredMineId === mine.id;
            const isDongriBuzurg = mine.isImplemented;

            if (!isFiltered) return null;

            return (
              <g
                key={mine.id}
                onMouseEnter={() => onHoverMine(mine.id)}
                onMouseLeave={() => onHoverMine(null)}
                onClick={() => onSelectMine(mine)}
                className={`transition-all duration-300 ${
                  isDongriBuzurg ? 'cursor-pointer' : 'cursor-pointer opacity-90'
                }`}
              >
                {/* Dongri Buzurg Special Active Glow Rings */}
                {isDongriBuzurg && (
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '26' : '20'}
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2.5"
                      className="animate-ping opacity-75"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="#D97706"
                      opacity="0.35"
                      filter="url(#amberGlow)"
                    />
                  </>
                )}

                {/* Base Marker Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isDongriBuzurg ? (isHovered ? '11' : '9') : isHovered ? '8' : '6'}
                  fill={isDongriBuzurg ? '#D97706' : isHovered ? '#60A5FA' : '#94A3B8'}
                  stroke="#181B20"
                  strokeWidth={isDongriBuzurg ? '3' : '2'}
                  className="transition-all duration-300 shadow-md"
                />

                {/* Center Star / Dot for active pilot marker */}
                {isDongriBuzurg && (
                  <circle cx={cx} cy={cy} r="4" fill="#181B20" />
                )}

                {/* Mine Name Badge next to marker */}
                {(isDongriBuzurg || isHovered) && (
                  <g className="pointer-events-none">
                    <rect
                      x={cx + 14}
                      y={cy - 13}
                      width={mine.name.length * 8 + 26}
                      height="24"
                      rx="5"
                      fill={isDongriBuzurg ? '#181B20' : '#242830'}
                      stroke={isDongriBuzurg ? '#D97706' : '#64748B'}
                      strokeWidth="1.5"
                      className="shadow-xl"
                    />
                    <text
                      x={cx + 20}
                      y={cy + 3}
                      fill={isDongriBuzurg ? '#D97706' : '#FFFFFF'}
                      fontSize="11"
                      fontWeight="black"
                      className="font-headline tracking-wider uppercase"
                    >
                      {mine.name} {isDongriBuzurg ? '★' : ''}
                    </text>
                  </g>
                )}

                {/* Detailed Executive Tooltip on Hover */}
                {isHovered && (
                  <g className="pointer-events-none z-50 animate-in fade-in duration-200">
                    <rect
                      x={cx - 120}
                      y={cy - 92}
                      width="240"
                      height="75"
                      rx="10"
                      fill="#181B20"
                      stroke={isDongriBuzurg ? '#D97706' : '#475569'}
                      strokeWidth="2"
                      className="shadow-2xl"
                    />
                    <text x={cx - 106} y={cy - 68} fill="#D97706" fontSize="13" fontWeight="black" className="uppercase font-display">
                      {mine.name} {isDongriBuzurg ? '★ PILOT SITE' : ''}
                    </text>
                    <text x={cx - 106} y={cy - 50} fill="#E2E8F0" fontSize="11" fontWeight="semibold">
                      {mine.location} • {mine.type}
                    </text>
                    <text
                      x={cx - 106}
                      y={cy - 30}
                      fill={isDongriBuzurg ? '#10B981' : '#94A3B8'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {isDongriBuzurg ? '● Active Telemetry Hub (Click to Open)' : '● Phase II Telemetry Integration Pending'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Footer Information */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-white/10 text-white/80 text-[11px] font-body pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#D97706]">map</span>
          <span>
            Click state to filter region or click <strong className="text-[#D97706]">Dongri Buzurg</strong> marker to launch digital workspace.
          </span>
        </div>
        <span className="text-white/60 text-[10px] font-mono uppercase tracking-widest font-bold">
          MOIL GIS SPATIAL NETWORK v2.4
        </span>
      </div>
    </div>
  );
};
