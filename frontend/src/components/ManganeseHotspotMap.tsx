/**
 * ManganeseHotspotMap.tsx
 *
 * Interactive SVG-based geological prospectivity map for the Central India
 * Sausar Manganese Belt covering all 10 MOIL mines.
 *
 * Displays:
 *  - All 10 mine locations as confidence-coloured pins
 *  - Iron oxide / geochem hotspot zones as pulsing halos
 *  - Potential exploration targets (unexplored strike continuations)
 *  - Structural features: fault traces, Gondite belt axis
 *  - Hover tooltip with: confidence %, Mn grade, iron oxide index,
 *    elevation, MnO geochem, accessible depth, potential zone type
 *
 * Coordinate system: Linear projection over
 *   Lat 20.8–22.6°N  ×  Lng 78.6–81.2°E
 */

import React, { useState, useRef, useCallback } from 'react';

// ── GEOGRAPHIC PROJECTION ──────────────────────────────────────────────────
const GEO = { latMin: 20.8, latMax: 22.6, lngMin: 78.6, lngMax: 81.2 };

function project(lat: number, lng: number, w: number, h: number): [number, number] {
  const x = ((lng - GEO.lngMin) / (GEO.lngMax - GEO.lngMin)) * w;
  const y = ((GEO.latMax - lat) / (GEO.latMax - GEO.latMin)) * h;
  return [x, y];
}

// ── DATA TYPES ─────────────────────────────────────────────────────────────
type PinKind = 'mine' | 'hotspot' | 'strike-target' | 'geochem-anomaly';
type ConfTier = 'CONFIRMED' | 'STRONG' | 'MODERATE' | 'AMBIGUOUS';

interface GeoPin {
  id: string;
  kind: PinKind;
  name: string;
  lat: number;
  lng: number;
  // Geological parameters
  confidence: number;        // 0-100
  confTier: ConfTier;
  mnGradePct: number;        // % Mn
  ironOxideIndex: number;    // 0-10 scale (from Sentinel-2 band ratio)
  elevationM: number;        // metres above sea level
  mno_geochem: number | null;// MnO% from stream sediment (null if not measured)
  depthM: number | null;     // depth to ore body (null for surface)
  accessRating: 'Excellent' | 'Good' | 'Moderate' | 'Difficult';
  potentialZoneType: 'High Grade' | 'Structural' | 'Geochemical' | 'Strike Extension' | 'Gossan';
  summary: string;
  shortCode?: string;
}

// ── GEOLOGICAL PIN DATASET ─────────────────────────────────────────────────
// Real approx. coordinates for MOIL mines (Central India, Sausar Belt)
// Iron Oxide Index derived from Sentinel-2 (B11-B8A)/(B11+B8A) ratio, normalised 0–10
// Elevation from SRTM DEM
const PINS: GeoPin[] = [
  // ── CONFIRMED MINES ──
  {
    id: 'tirodi', kind: 'mine', name: 'Tirodi', shortCode: 'TR-09',
    lat: 21.68, lng: 79.98,
    confidence: 95, confTier: 'CONFIRMED',
    mnGradePct: 41.8, ironOxideIndex: 8.7, elevationM: 412,
    mno_geochem: 3.33, depthM: 35, accessRating: 'Excellent',
    potentialZoneType: 'High Grade',
    summary: 'Highest confidence (95%). Proven 799,700t @ 48%+ Mn. Open-pit with active dewatering.',
  },
  {
    id: 'munsar', kind: 'mine', name: 'Munsar', shortCode: 'MS-04',
    lat: 21.37, lng: 79.15,
    confidence: 90, confTier: 'CONFIRMED',
    mnGradePct: 40.5, ironOxideIndex: 7.9, elevationM: 345,
    mno_geochem: 4.1, depthM: 95, accessRating: 'Good',
    potentialZoneType: 'High Grade',
    summary: '3 confirmed leases within 1.1km. Closest geochem of all mines. Ridge-top braunite horizons.',
  },
  {
    id: 'balaghat', kind: 'mine', name: 'Balaghat (Bharweli)', shortCode: 'BG-07',
    lat: 21.83, lng: 80.19,
    confidence: 88, confTier: 'CONFIRMED',
    mnGradePct: 46.8, ironOxideIndex: 9.2, elevationM: 520,
    mno_geochem: 2.8, depthM: 435, accessRating: 'Good',
    potentialZoneType: 'High Grade',
    summary: "Highest grade (46.8% Mn). India's deepest Mn mine at 435m. Dense geophysics confirms massive ore column.",
  },
  {
    id: 'ukwa', kind: 'mine', name: 'Ukwa', shortCode: 'UK-08',
    lat: 22.07, lng: 80.67,
    confidence: 85, confTier: 'CONFIRMED',
    mnGradePct: 44.2, ironOxideIndex: 7.4, elevationM: 380,
    mno_geochem: 2.2, depthM: 185, accessRating: 'Good',
    potentialZoneType: 'High Grade',
    summary: 'Largest proved reserve (16.5 MT). Metallogenic point at 0.49km. Incline shaft mine.',
  },
  // ── STRONG EVIDENCE MINES ──
  {
    id: 'beldongri', kind: 'mine', name: 'Beldongri', shortCode: 'BD-06',
    lat: 21.22, lng: 79.20,
    confidence: 78, confTier: 'STRONG',
    mnGradePct: 38.5, ironOxideIndex: 6.8, elevationM: 310,
    mno_geochem: 1.8, depthM: 140, accessRating: 'Good',
    potentialZoneType: 'Structural',
    summary: 'Lease at 0.32km confirmed. Geochem at 1.06-1.26km. Soil moisture anomaly indicates deeper ore.',
  },
  {
    id: 'dongri-buzurg', kind: 'mine', name: 'Dongri Buzurg', shortCode: 'DB-01',
    lat: 21.17, lng: 79.65,
    confidence: 73, confTier: 'STRONG',
    mnGradePct: 43.2, ironOxideIndex: 6.2, elevationM: 275,
    mno_geochem: 2.6, depthM: 30, accessRating: 'Excellent',
    potentialZoneType: 'Geochemical',
    summary: 'Pilot mine — real MCDR production records (19.6% shortfall). Open-pit with confirmed Sausar Gondite.',
  },
  // ── MODERATE MINES ──
  {
    id: 'sitapatore', kind: 'mine', name: 'Sitapatore', shortCode: 'SP-10',
    lat: 21.72, lng: 80.08,
    confidence: 65, confTier: 'MODERATE',
    mnGradePct: 39.8, ironOxideIndex: 5.5, elevationM: 395,
    mno_geochem: null, depthM: 60, accessRating: 'Good',
    potentialZoneType: 'Gossan',
    summary: 'Lease confirmed but no metallogenic reserve point. Iron oxide anomaly visible in Sentinel-2.',
  },
  {
    id: 'chikla', kind: 'mine', name: 'Chikla', shortCode: 'CK-02',
    lat: 21.13, lng: 79.78,
    confidence: 52, confTier: 'MODERATE',
    mnGradePct: 42.5, ironOxideIndex: 5.1, elevationM: 260,
    mno_geochem: 1.1, depthM: 220, accessRating: 'Moderate',
    potentialZoneType: 'Geochemical',
    summary: 'Geochem at 0.64km. Active Quarry ambiguity unresolved. Part of Bhandara cluster NE horizon.',
  },
  {
    id: 'kandri', kind: 'mine', name: 'Kandri', shortCode: 'KD-03',
    lat: 21.42, lng: 79.03,
    confidence: 52, confTier: 'MODERATE',
    mnGradePct: 43.8, ironOxideIndex: 4.8, elevationM: 295,
    mno_geochem: 1.4, depthM: 275, accessRating: 'Moderate',
    potentialZoneType: 'Structural',
    summary: 'Lease at 7.3km — widest gap. Shares Gondite horizon with Gumgaon. Mining Plan verification needed.',
  },
  {
    id: 'gumgaon', kind: 'mine', name: 'Gumgaon', shortCode: 'GG-05',
    lat: 21.28, lng: 79.08,
    confidence: 48, confTier: 'AMBIGUOUS',
    mnGradePct: 41.0, ironOxideIndex: 4.3, elevationM: 330,
    mno_geochem: 0.8, depthM: 210, accessRating: 'Moderate',
    potentialZoneType: 'Structural',
    summary: 'CRITICAL: Name-location mismatch — Gumgaon metallogenic points sit 28km away. Field verification required.',
  },

  // ── IRON OXIDE HOTSPOT ZONES (identified from Sentinel-2 imagery) ──
  {
    id: 'hs-tirodi-ne', kind: 'hotspot', name: 'Tirodi NE Strike Extension',
    lat: 21.71, lng: 80.06,
    confidence: 72, confTier: 'STRONG',
    mnGradePct: 38, ironOxideIndex: 8.1, elevationM: 425,
    mno_geochem: 1.9, depthM: 50, accessRating: 'Good',
    potentialZoneType: 'Strike Extension',
    summary: 'High iron oxide anomaly (8.1/10) along NE fault trace from Tirodi. Probable braunite reef continuation.',
  },
  {
    id: 'hs-balaghat-flank', kind: 'hotspot', name: 'Bharweli Flank Zone',
    lat: 21.87, lng: 80.13,
    confidence: 68, confTier: 'MODERATE',
    mnGradePct: 35, ironOxideIndex: 7.8, elevationM: 490,
    mno_geochem: null, depthM: 80, accessRating: 'Good',
    potentialZoneType: 'Structural',
    summary: 'Dense geophysics + clay index anomaly on SW flank of Balaghat mine. Possible peripheral sub-level ore package.',
  },
  {
    id: 'hs-ukwa-strike', kind: 'hotspot', name: 'Ukwa East Continuation',
    lat: 22.09, lng: 80.78,
    confidence: 60, confTier: 'MODERATE',
    mnGradePct: 33, ironOxideIndex: 6.9, elevationM: 370,
    mno_geochem: 1.2, depthM: 90, accessRating: 'Excellent',
    potentialZoneType: 'Strike Extension',
    summary: 'SAR subsidence ring + clay index anomaly east of Ukwa. Strike lode may extend >1km along Gondite horizon.',
  },
  {
    id: 'hs-bhandara-ne', kind: 'hotspot', name: 'Bhandara NE Gossan Ridge',
    lat: 21.22, lng: 79.92,
    confidence: 58, confTier: 'MODERATE',
    mnGradePct: 30, ironOxideIndex: 7.3, elevationM: 295,
    mno_geochem: 0.9, depthM: 40, accessRating: 'Excellent',
    potentialZoneType: 'Gossan',
    summary: 'Surface gossan visible in Sentinel-2 iron oxide band ratio. Connects Dongri-Chikla cluster via Gondite horizon.',
  },

  // ── GEOCHEM ANOMALY TARGETS (stream sediment MnO signals without confirmed leases) ──
  {
    id: 'ga-sausar-central', kind: 'geochem-anomaly', name: 'Sausar Central Geochem Anomaly',
    lat: 21.55, lng: 79.50,
    confidence: 45, confTier: 'AMBIGUOUS',
    mnGradePct: 28, ironOxideIndex: 6.5, elevationM: 360,
    mno_geochem: 2.1, depthM: null, accessRating: 'Good',
    potentialZoneType: 'Geochemical',
    summary: 'MnO stream sediment signal 2.1% along Sausar belt axis. No active lease. Prospective for sub-surface Gondite.',
  },
  {
    id: 'ga-nagpur-sw', kind: 'geochem-anomaly', name: 'Nagpur SW Cluster Target',
    lat: 21.10, lng: 78.95,
    confidence: 38, confTier: 'AMBIGUOUS',
    mnGradePct: 25, ironOxideIndex: 5.8, elevationM: 310,
    mno_geochem: 1.5, depthM: null, accessRating: 'Good',
    potentialZoneType: 'Geochemical',
    summary: 'SW extension of Nagpur cluster. Lithology map shows Gondite formation. No confirmed lease yet.',
  },

  // ── STRIKE EXPLORATION TARGETS ──
  {
    id: 'st-sausar-axis-e', kind: 'strike-target', name: 'Sausar Belt Eastern Strike',
    lat: 22.25, lng: 80.95,
    confidence: 40, confTier: 'AMBIGUOUS',
    mnGradePct: 22, ironOxideIndex: 5.2, elevationM: 420,
    mno_geochem: null, depthM: null, accessRating: 'Difficult',
    potentialZoneType: 'Strike Extension',
    summary: 'Eastern Sausar Belt strike projection. Regional Gondite trend continues SE. Unexplored geophysical anomaly.',
  },
];

// ── COLOUR HELPERS ─────────────────────────────────────────────────────────
function pinFill(tier: ConfTier, kind: PinKind): string {
  if (kind === 'geochem-anomaly') return '#f59e0b';
  if (kind === 'strike-target')   return '#8b5cf6';
  if (kind === 'hotspot')         return '#0ea5e9';
  switch (tier) {
    case 'CONFIRMED':  return '#10b981';
    case 'STRONG':     return '#3b82f6';
    case 'MODERATE':   return '#f59e0b';
    case 'AMBIGUOUS':  return '#f97316';
    default:           return '#6b7280';
  }
}

function accessColor(a: GeoPin['accessRating']): string {
  switch (a) {
    case 'Excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Good':      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Moderate':  return 'text-amber-600 bg-amber-50 border-amber-200';
    default:          return 'text-red-600 bg-red-50 border-red-200';
  }
}

// ── IRON OXIDE BAR ─────────────────────────────────────────────────────────
function IronOxideBar({ value, isDark }: { value: number; isDark: boolean }) {
  const pct = (value / 10) * 100;
  const col = value >= 7.5 ? 'bg-red-500' : value >= 5.5 ? 'bg-orange-400' : 'bg-amber-400';
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Iron Oxide Index</span>
        <span className="font-black" style={{ color: value >= 7.5 ? '#ef4444' : value >= 5.5 ? '#f97316' : '#f59e0b' }}>{value.toFixed(1)}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${col}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
interface Props {
  isDark?: boolean;
}

export const ManganeseHotspotMap: React.FC<Props> = ({ isDark = false }) => {
  const [hoveredId, setHoveredId]       = useState<string | null>(null);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [filterKind, setFilterKind]     = useState<PinKind | 'all'>('all');
  const [filterMinConf, setFilterMinConf] = useState(0);
  const [tooltipPos, setTooltipPos]     = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const card  = isDark ? 'bg-[#151922] border-slate-800'            : 'bg-white border-slate-200 shadow-sm';
  const th    = isDark ? 'text-white'                                : 'text-[#0B1E38]';
  const ts    = isDark ? 'text-slate-400'                            : 'text-slate-500';
  const inp   = isDark ? 'bg-slate-800 border-slate-700 text-white'  : 'bg-white border-slate-200 text-slate-800';

  const W = 740, H = 440; // SVG viewport

  const visiblePins = PINS.filter(p =>
    (filterKind === 'all' || p.kind === filterKind) &&
    p.confidence >= filterMinConf
  );

  const hoveredPin  = PINS.find(p => p.id === hoveredId)  ?? null;
  const selectedPin = PINS.find(p => p.id === selectedId) ?? null;
  const activePin   = selectedPin ?? hoveredPin;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Fault trace path (approximate Sausar Belt axis)
  const faultPath = (() => {
    const pts: [number, number][] = [
      [20.9, 78.7], [21.1, 79.0], [21.3, 79.2], [21.5, 79.5],
      [21.7, 79.8], [21.9, 80.1], [22.1, 80.5], [22.3, 80.9],
    ];
    return pts.map(([lat, lng], i) => {
      const [x, y] = project(lat, lng, W, H);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  })();

  // Secondary fault (Nagpur spur)
  const fault2Path = (() => {
    const pts: [number, number][] = [
      [21.5, 78.9], [21.35, 79.1], [21.2, 79.3],
    ];
    return pts.map(([lat, lng], i) => {
      const [x, y] = project(lat, lng, W, H);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  })();

  return (
    <div className={`rounded-2xl border overflow-hidden ${card}`}>
      {/* ── HEADER ── */}
      <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7c2d12] to-[#dc2626] text-white shadow">
            <span className="material-symbols-outlined text-xl">location_on</span>
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-wide ${th}`}>
              Manganese Hotspot Pinpoint Map — Sausar Belt, Central India
            </h3>
            <p className={`text-[11px] mt-0.5 ${ts}`}>
              Iron oxide index, elevation, geochem MnO% and structural controls plotted per zone.
              Click any pin to inspect geological parameters. Confidence-coloured by evidence tier.
            </p>
          </div>
        </div>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <select value={filterKind} onChange={e => setFilterKind(e.target.value as typeof filterKind)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${inp}`}>
            <option value="all">All Pins</option>
            <option value="mine">Mines Only</option>
            <option value="hotspot">Iron Oxide Hotspots</option>
            <option value="geochem-anomaly">Geochem Anomalies</option>
            <option value="strike-target">Strike Targets</option>
          </select>
          <select value={filterMinConf} onChange={e => setFilterMinConf(Number(e.target.value))}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${inp}`}>
            <option value={0}>All Confidence</option>
            <option value={50}>50%+</option>
            <option value={70}>70%+</option>
            <option value={85}>85%+ Confirmed</option>
          </select>
        </div>
      </div>

      {/* ── MAP + DETAIL LAYOUT ── */}
      <div className="flex flex-col lg:flex-row">

        {/* ── SVG MAP ── */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 380 }}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { setHoveredId(null); setTooltipPos(null); }}>

            {/* Background */}
            <defs>
              <radialGradient id="mapbg" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={isDark ? '#1a2535' : '#f0f9ff'} />
                <stop offset="100%" stopColor={isDark ? '#0e1218' : '#e0edf8'} />
              </radialGradient>
              {/* Glow filters */}
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-blue">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>

            <rect width={W} height={H} fill="url(#mapbg)" />

            {/* Grid lines */}
            {[21.0, 21.5, 22.0, 22.5].map(lat => {
              const [, y] = project(lat, 79, W, H);
              return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke={isDark ? '#1e293b' : '#cbd5e1'} strokeWidth="0.5" strokeDasharray="4,4" />;
            })}
            {[79.0, 79.5, 80.0, 80.5, 81.0].map(lng => {
              const [x] = project(21, lng, W, H);
              return <line key={lng} x1={x} y1={0} x2={x} y2={H} stroke={isDark ? '#1e293b' : '#cbd5e1'} strokeWidth="0.5" strokeDasharray="4,4" />;
            })}

            {/* Grid labels */}
            {[21.0, 21.5, 22.0, 22.5].map(lat => {
              const [, y] = project(lat, 79, W, H);
              return <text key={lat} x={4} y={y - 3} fontSize="8" fill={isDark ? '#475569' : '#94a3b8'} fontFamily="monospace">{lat}°N</text>;
            })}
            {[79.0, 79.5, 80.0, 80.5, 81.0].map(lng => {
              const [x] = project(21, lng, W, H);
              return <text key={lng} x={x + 2} y={H - 4} fontSize="8" fill={isDark ? '#475569' : '#94a3b8'} fontFamily="monospace">{lng}°E</text>;
            })}

            {/* Sausar Belt axis (primary geological structure) */}
            <path d={faultPath} fill="none" stroke="#92400e" strokeWidth="3"
              strokeDasharray="8,4" opacity="0.6" />
            <path d={faultPath} fill="none" stroke="#fbbf24" strokeWidth="1"
              strokeDasharray="8,4" opacity="0.4" />

            {/* Secondary fault spur */}
            <path d={fault2Path} fill="none" stroke="#92400e" strokeWidth="1.5"
              strokeDasharray="4,3" opacity="0.4" />

            {/* Belt label */}
            {(() => {
              const [x, y] = project(21.85, 79.55, W, H);
              return (
                <g transform={`translate(${x},${y}) rotate(-25)`}>
                  <text fontSize="9" fill="#b45309" fontWeight="700" fontFamily="sans-serif"
                    textAnchor="middle" opacity="0.8">SAUSAR Mn BELT</text>
                </g>
              );
            })()}

            {/* Iron oxide hotspot halos */}
            {visiblePins.filter(p => p.ironOxideIndex >= 6.5).map(p => {
              const [x, y] = project(p.lat, p.lng, W, H);
              const r = 14 + (p.ironOxideIndex - 6) * 5;
              return (
                <circle key={`halo-${p.id}`} cx={x} cy={y} r={r}
                  fill={pinFill(p.confTier, p.kind)} opacity="0.08"
                  stroke={pinFill(p.confTier, p.kind)} strokeWidth="0.5" strokeOpacity="0.2" />
              );
            })}

            {/* Geochem anomaly halos (larger, amber) */}
            {visiblePins.filter(p => p.mno_geochem && p.mno_geochem > 1.5).map(p => {
              const [x, y] = project(p.lat, p.lng, W, H);
              return (
                <circle key={`geo-halo-${p.id}`} cx={x} cy={y} r={20}
                  fill="#f59e0b" opacity="0.07" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.2" />
              );
            })}

            {/* ── PINS ── */}
            {visiblePins.map(p => {
              const [x, y] = project(p.lat, p.lng, W, H);
              const fill   = pinFill(p.confTier, p.kind);
              const isHov  = hoveredId === p.id;
              const isSel  = selectedId === p.id;
              const active = isHov || isSel;
              const r      = p.kind === 'mine' ? 9 : 7;

              return (
                <g key={p.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(isSel ? null : p.id)}>

                  {/* Active pulse ring */}
                  {active && (
                    <circle cx={x} cy={y} r={r + 7} fill="none"
                      stroke={fill} strokeWidth="1.5" opacity="0.5"
                      style={{ animation: 'pulse 1.5s infinite' }} />
                  )}

                  {/* Outer ring (always shown for mines) */}
                  {p.kind === 'mine' && (
                    <circle cx={x} cy={y} r={r + 3} fill="none"
                      stroke={fill} strokeWidth="1.5" opacity={active ? 0.8 : 0.35} />
                  )}

                  {/* Main pin body */}
                  {p.kind === 'mine' ? (
                    // Diamond-tipped location pin for confirmed mines
                    <>
                      <circle cx={x} cy={y - 2} r={r} fill={fill}
                        stroke="white" strokeWidth={active ? 2 : 1.5}
                        filter={active ? 'url(#shadow)' : undefined}
                        opacity={active ? 1 : 0.9} />
                      <line x1={x} y1={y + r - 2} x2={x} y2={y + r + 5}
                        stroke={fill} strokeWidth="2" />
                    </>
                  ) : p.kind === 'hotspot' ? (
                    // Star-burst for iron oxide hotspots
                    <polygon points={`${x},${y - r} ${x + 3},${y - 3} ${x + r},${y - 2} ${x + 4},${y + 2} ${x + 6},${y + r} ${x},${y + 5} ${x - 6},${y + r} ${x - 4},${y + 2} ${x - r},${y - 2} ${x - 3},${y - 3}`}
                      fill={fill} stroke="white" strokeWidth={active ? 1.5 : 1} opacity={active ? 1 : 0.85}
                      filter={active ? 'url(#shadow)' : undefined} />
                  ) : p.kind === 'strike-target' ? (
                    // Triangle for strike targets
                    <polygon points={`${x},${y - r} ${x + r},${y + r - 2} ${x - r},${y + r - 2}`}
                      fill={fill} stroke="white" strokeWidth={active ? 1.5 : 1} opacity={active ? 1 : 0.8} />
                  ) : (
                    // Diamond for geochem anomalies
                    <polygon points={`${x},${y - r} ${x + r - 2},${y} ${x},${y + r} ${x - r + 2},${y}`}
                      fill={fill} stroke="white" strokeWidth={active ? 1.5 : 1} opacity={active ? 1 : 0.8} />
                  )}

                  {/* Short code label for mines */}
                  {p.kind === 'mine' && p.shortCode && active && (
                    <text x={x + r + 5} y={y - 1} fontSize="9" fontWeight="700"
                      fill={fill} fontFamily="sans-serif" filter="url(#shadow)">{p.shortCode}</text>
                  )}

                  {/* Iron oxide indicator dot */}
                  {p.ironOxideIndex >= 7 && (
                    <circle cx={x + r - 1} cy={y - r - 1} r={3}
                      fill="#ef4444" stroke="white" strokeWidth="0.8" opacity="0.9" />
                  )}
                </g>
              );
            })}

            {/* Hover tooltip inside SVG */}
            {hoveredPin && tooltipPos && !selectedId && (() => {
              const [x, y] = project(hoveredPin.lat, hoveredPin.lng, W, H);
              const tx = x + 14;
              const ty = Math.max(y - 60, 10);
              return (
                <g>
                  <rect x={tx} y={ty} width={130} height={46} rx="5" ry="5"
                    fill={isDark ? '#1e293b' : '#ffffff'} stroke={pinFill(hoveredPin.confTier, hoveredPin.kind)}
                    strokeWidth="1.5" filter="url(#shadow)" />
                  <text x={tx + 7} y={ty + 14} fontSize="9" fontWeight="800"
                    fill={isDark ? '#f1f5f9' : '#0f172a'} fontFamily="sans-serif">{hoveredPin.name}</text>
                  <text x={tx + 7} y={ty + 25} fontSize="8"
                    fill={isDark ? '#94a3b8' : '#64748b'} fontFamily="sans-serif">
                    {hoveredPin.mnGradePct}% Mn · Fe₂O₃: {hoveredPin.ironOxideIndex}/10
                  </text>
                  <text x={tx + 7} y={ty + 37} fontSize="8"
                    fill={pinFill(hoveredPin.confTier, hoveredPin.kind)} fontFamily="sans-serif" fontWeight="700">
                    Confidence: {hoveredPin.confidence}%
                  </text>
                </g>
              );
            })()}

            {/* Compass */}
            {(() => {
              const cx = W - 28, cy = 30;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={16} fill={isDark ? '#1e293b' : '#f8fafc'} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth="1" />
                  <polygon points={`${cx},${cy - 13} ${cx + 5},${cy + 2} ${cx - 5},${cy + 2}`} fill="#ef4444" />
                  <polygon points={`${cx},${cy + 13} ${cx + 5},${cy - 2} ${cx - 5},${cy - 2}`} fill={isDark ? '#475569' : '#94a3b8'} />
                  <text x={cx} y={cy - 16} fontSize="7" textAnchor="middle" fill="#ef4444" fontWeight="800">N</text>
                </g>
              );
            })()}

            {/* Scale bar */}
            {(() => {
              const [x1] = project(21.0, 79.0, W, H);
              const [x2] = project(21.0, 79.5, W, H);
              const y = H - 22;
              return (
                <g>
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
                  <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
                  <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={isDark ? '#475569' : '#94a3b8'} strokeWidth="1.5" />
                  <text x={(x1 + x2) / 2} y={y - 7} fontSize="8" textAnchor="middle"
                    fill={isDark ? '#475569' : '#94a3b8'} fontFamily="sans-serif">~55 km</text>
                </g>
              );
            })()}
          </svg>

          {/* Legend overlay */}
          <div className={`absolute bottom-3 left-3 p-2.5 rounded-xl border text-[10px] space-y-1 ${isDark ? 'bg-[#151922]/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-sm`}>
            <p className={`font-black text-[10px] mb-1.5 ${th}`}>Pin Legend</p>
            {[
              { shape: '●', color: '#10b981', label: 'Mine — Confirmed (≥85%)' },
              { shape: '●', color: '#3b82f6', label: 'Mine — Strong (70-84%)' },
              { shape: '●', color: '#f59e0b', label: 'Mine — Moderate (<70%)' },
              { shape: '★', color: '#0ea5e9', label: 'Iron Oxide Hotspot' },
              { shape: '◆', color: '#f59e0b', label: 'Geochem Anomaly' },
              { shape: '▲', color: '#8b5cf6', label: 'Strike Target (unexplored)' },
              { shape: '—', color: '#b45309', label: 'Sausar Belt Axis / Fault' },
              { shape: '●', color: '#ef4444', label: 'Red dot = Fe₂O₃ index ≥7' },
            ].map(({ shape, color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span style={{ color, fontSize: 11 }} className="font-black w-3 text-center">{shape}</span>
                <span className={ts}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DETAIL PANEL (right side) ── */}
        <div className={`w-full lg:w-72 xl:w-80 shrink-0 border-t lg:border-t-0 lg:border-l ${isDark ? 'border-slate-800' : 'border-slate-200'} overflow-y-auto`}
          style={{ maxHeight: 440 }}>
          {activePin ? (
            <div className="p-4 space-y-3">
              {/* Pin Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black" style={{ color: pinFill(activePin.confTier, activePin.kind) }}>
                      {activePin.kind === 'mine' ? '⛏' : activePin.kind === 'hotspot' ? '★' : activePin.kind === 'strike-target' ? '▲' : '◆'}
                    </span>
                    <h4 className={`text-sm font-black leading-tight ${th}`}>{activePin.name}</h4>
                  </div>
                  {activePin.shortCode && (
                    <p className={`text-[10px] mt-0.5 ${ts}`}>{activePin.shortCode} · {activePin.lat.toFixed(3)}°N, {activePin.lng.toFixed(3)}°E</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-black" style={{ color: pinFill(activePin.confTier, activePin.kind) }}>{activePin.confidence}%</p>
                  <p className={`text-[9px] font-bold ${ts}`}>confidence</p>
                </div>
              </div>

              {/* Summary */}
              <p className={`text-[11px] leading-snug ${ts}`}>{activePin.summary}</p>

              {/* Geological Parameters */}
              <div className="space-y-2">
                <p className={`text-[10px] font-black uppercase tracking-wide ${th}`}>Geological Parameters</p>

                {/* Iron Oxide Index */}
                <IronOxideBar value={activePin.ironOxideIndex} isDark={isDark} />

                {/* Mn Grade */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className={ts}>Mn Grade (avg)</span>
                    <span className={`font-black ${th}`}>{activePin.mnGradePct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500"
                      style={{ width: `${Math.min((activePin.mnGradePct / 50) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* MnO Geochem */}
                {activePin.mno_geochem !== null && (
                  <div className="flex justify-between text-[10px]">
                    <span className={ts}>MnO Geochem (stream sediment)</span>
                    <span className={`font-black ${th}`}>{activePin.mno_geochem}%</span>
                  </div>
                )}

                {/* Elevation */}
                <div className="flex justify-between text-[10px]">
                  <span className={ts}>Elevation (SRTM DEM)</span>
                  <span className={`font-black ${th}`}>{activePin.elevationM} m</span>
                </div>

                {/* Depth to ore */}
                {activePin.depthM !== null && (
                  <div className="flex justify-between text-[10px]">
                    <span className={ts}>Depth to ore body</span>
                    <span className={`font-black ${activePin.depthM <= 60 ? 'text-emerald-600' : activePin.depthM <= 150 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {activePin.depthM} m {activePin.depthM <= 60 ? '✓ Shallow' : activePin.depthM <= 150 ? 'Medium' : 'Deep'}
                    </span>
                  </div>
                )}

                {/* Access Rating */}
                <div className="flex justify-between items-center text-[10px]">
                  <span className={ts}>Site Access Rating</span>
                  <span className={`px-2 py-0.5 rounded-lg border font-bold ${accessColor(activePin.accessRating)}`}>
                    {activePin.accessRating}
                  </span>
                </div>

                {/* Zone Type */}
                <div className="flex justify-between items-center text-[10px]">
                  <span className={ts}>Potential Zone Type</span>
                  <span className={`px-2 py-0.5 rounded-lg border font-bold text-purple-700 bg-purple-50 border-purple-200`}>
                    {activePin.potentialZoneType}
                  </span>
                </div>

                {/* Coordinates */}
                <div className={`text-[10px] font-mono p-2 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                  Lat: {activePin.lat.toFixed(4)}°N · Lng: {activePin.lng.toFixed(4)}°E
                </div>
              </div>

              {/* Composite Score */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wide mb-2 ${th}`}>Composite Accessibility Score</p>
                {(() => {
                  const score = Math.round(
                    (activePin.confidence * 0.35) +
                    (activePin.ironOxideIndex * 5 * 0.25) +
                    ((activePin.depthM !== null ? Math.max(0, 100 - activePin.depthM * 0.3) : 40) * 0.20) +
                    (activePin.mnGradePct * 1.2 * 0.20)
                  );
                  const col = score >= 70 ? '#10b981' : score >= 50 ? '#3b82f6' : '#f59e0b';
                  return (
                    <>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black" style={{ color: col }}>{score}</span>
                        <span className={`text-[10px] mb-1 ${ts}`}>/100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden mt-1">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${score}%`, backgroundColor: col }} />
                      </div>
                      <p className={`text-[10px] mt-1.5 ${ts}`}>
                        Weighted: 35% confidence + 25% Fe₂O₃ + 20% depth accessibility + 20% Mn grade
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
              <span className="material-symbols-outlined text-4xl mb-3" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
                location_searching
              </span>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Hover or click a pin to inspect geological parameters
              </p>
              <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                {visiblePins.length} zones visible · {visiblePins.filter(p => p.ironOxideIndex >= 7).length} high Fe₂O₃
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK STATS FOOTER ── */}
      <div className={`px-5 py-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
        {[
          { label: 'Total Zones Mapped', value: PINS.length, unit: '' },
          { label: 'High Fe₂O₃ Zones (≥7)', value: PINS.filter(p => p.ironOxideIndex >= 7).length, unit: '' },
          { label: 'Best Mn Grade', value: Math.max(...PINS.map(p => p.mnGradePct)).toFixed(1), unit: '% Mn' },
          { label: 'Shallowest Target', value: Math.min(...PINS.filter(p => p.depthM !== null).map(p => p.depthM!)), unit: 'm depth' },
        ].map(({ label, value, unit }) => (
          <div key={label}>
            <p className={`text-[10px] ${ts}`}>{label}</p>
            <p className={`text-base font-black ${th}`}>{value}<span className={`text-[10px] font-normal ml-0.5 ${ts}`}>{unit}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManganeseHotspotMap;
