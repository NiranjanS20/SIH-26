import React, { useState } from 'react';

// ── TYPES ──────────────────────────────────────────────────────────────────
type ConfidenceTier = 'CONFIRMED' | 'STRONG' | 'MODERATE' | 'AMBIGUOUS' | 'WEAK';
type HeatmapFilter = 'prospectivity' | 'ndvi' | 'soil_moisture' | 'lst' | 'elevation';

interface EvidenceFactor {
  tier: 1 | 2 | 3 | 4 | 5;
  label: string;
  value: string;
  confidence: number;
}

interface PotentialZone {
  label: string;
  type: 'High Grade' | 'Structural' | 'Geochemical' | 'Surface' | 'Lease';
  description: string;
}

interface MineConfidenceRecord {
  id: string;
  name: string;
  shortCode: string;
  district: string;
  state: string;
  mineType: 'Open Cast' | 'Underground';
  confidence: number;
  baseTier12: number;
  adjustments: string;
  confidenceTierLabel: ConfidenceTier;
  avgGradePct: number;
  reservesMT: number;
  heatmapFolder: string;
  evidenceFactors: EvidenceFactor[];
  potentialZones: PotentialZone[];
  keyRisk: string;
  geologicalContext: string;
}

// ── DATA — derived from Manganese_Confidence_Analysis.pdf (SIH 2026 PS 26009)
const MINE_CONFIDENCE_DATA: MineConfidenceRecord[] = [
  {
    id: 'tirodi', name: 'Tirodi', shortCode: 'TR-09', district: 'Balaghat',
    state: 'Madhya Pradesh', mineType: 'Open Cast',
    confidence: 95, baseTier12: 90,
    adjustments: '+10% (fault 0.67km, high MnO geochem)',
    confidenceTierLabel: 'CONFIRMED', avgGradePct: 41.8, reservesMT: 12.2, heatmapFolder: 'tirodi',
    evidenceFactors: [
      { tier: 1, label: 'Metallogenic Reserve Point', value: '799,700t @ 48%+ Mn, 0.9km', confidence: 90 },
      { tier: 2, label: 'MnO Geochem (stream sediment)', value: '3.33% MnO @ 0.73km', confidence: 75 },
      { tier: 3, label: 'Fault/Shear Zone Proximity', value: '0.67km — strong structural control', confidence: 50 },
      { tier: 3, label: 'Metallogenic Zone', value: 'Sausar Mn Belt (Gondite)', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Tirodi Braunite Ore Reef', type: 'High Grade', description: 'Confirmed metallogenic reserve body at 48%+ Mn grade, proven 799,700t' },
      { label: 'Strike Continuation NE', type: 'Structural', description: 'Fault-controlled strike zone extending 0.67km NE' },
      { label: 'Surface Gossan Alteration', type: 'Geochemical', description: 'High iron oxide index from Sentinel-2 confirms surface alteration' },
    ],
    keyRisk: 'Monsoon-season dewatering constraints on open-pit benches',
    geologicalContext: 'Sausar Mn Belt — Gondite-hosted braunite/pyrolusite seams. Active opencast pit with confirmed high-grade ore body.',
  },
  {
    id: 'munsar', name: 'Munsar', shortCode: 'MS-04', district: 'Nagpur',
    state: 'Maharashtra', mineType: 'Underground',
    confidence: 90, baseTier12: 85,
    adjustments: '+10% (3 leases within 1.1km, closest geochem of all mines)',
    confidenceTierLabel: 'CONFIRMED', avgGradePct: 40.5, reservesMT: 6.8, heatmapFolder: 'munsar',
    evidenceFactors: [
      { tier: 1, label: 'Mining Leases (x3)', value: '3 confirmed Mn leases within 1.1km radius', confidence: 85 },
      { tier: 2, label: 'Nearest Geochem Sample', value: 'Highest MnO proximity of all 10 mines', confidence: 80 },
      { tier: 3, label: 'Metallogenic Zone', value: 'Nagpur Mn Belt — parallel braunite horizons', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Mansar Formation Type-Locality Ridge', type: 'Lease', description: '3 overlapping leases establish highest spatial lease density in Nagpur cluster' },
      { label: 'Braunite Parallel Horizons', type: 'Structural', description: 'Multiple sub-parallel ore horizons typical of Nagpur belt stratigraphy' },
    ],
    keyRisk: 'Underground inflow management during monsoon; bench face stability on ridge',
    geologicalContext: 'Nagpur Mn Belt — type-locality for Mansar Formation. Multi-horizon braunite-pyrolusite bodies in undulating ridge terrain.',
  },
  {
    id: 'balaghat', name: 'Balaghat (Bharweli)', shortCode: 'BG-07', district: 'Balaghat',
    state: 'Madhya Pradesh', mineType: 'Underground',
    confidence: 88, baseTier12: 85,
    adjustments: '+5% (dense geophysics coverage)',
    confidenceTierLabel: 'CONFIRMED', avgGradePct: 46.8, reservesMT: 38.6, heatmapFolder: 'balaghat',
    evidenceFactors: [
      { tier: 1, label: 'Confirmed Mining Lease', value: '182.3 ha confirmed Mn lease @ 0.53km', confidence: 85 },
      { tier: 2, label: 'Metallogenic Reserve Point', value: 'Documented reserve @ 7.2km (district level)', confidence: 60 },
      { tier: 3, label: 'Dense Geophysical Coverage', value: 'Magnetic + gravity anomaly grid confirmed', confidence: 45 },
      { tier: 3, label: 'Sausar Mn Zone', value: 'Inside primary metallogenic belt', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Bharweli Deep Ore Column', type: 'High Grade', description: "India's deepest Mn mine at 435m vertical shaft — ultra-high grade 46.8% Mn" },
      { label: 'Peripheral Sub-Level Zones', type: 'Structural', description: 'Dense geophysics suggests additional sub-level ore packages flanking main decline' },
      { label: 'SAR Subsidence Ring', type: 'Surface', description: 'Sentinel-1 backscatter shows active subsidence ring consistent with underground extraction' },
    ],
    keyRisk: 'Groundwater seepage at depth; geomechanical stability at 435m',
    geologicalContext: "MOIL's largest mine. Gondite-hosted ultra-high grade ore body at 435m. Dense geophysical surveys confirm massive Mn reserve column.",
  },
  {
    id: 'ukwa', name: 'Ukwa', shortCode: 'UK-08', district: 'Balaghat',
    state: 'Madhya Pradesh', mineType: 'Underground',
    confidence: 85, baseTier12: 90,
    adjustments: '-5% (unresolved Active Quarry ambiguity)',
    confidenceTierLabel: 'CONFIRMED', avgGradePct: 44.2, reservesMT: 16.5, heatmapFolder: 'ukwa',
    evidenceFactors: [
      { tier: 1, label: 'Metallogenic Reserve Point', value: 'Largest reserve of any mine at 0.49km', confidence: 90 },
      { tier: 2, label: 'Geochem Assay', value: 'Strong MnO signal at verified proximity', confidence: 70 },
      { tier: 4, label: 'Active Quarry Ambiguity', value: 'Surface quarry near underground mine — legacy working unverified', confidence: 20 },
    ],
    potentialZones: [
      { label: 'Ukwa Continuous Strike Lode', type: 'High Grade', description: 'Largest single proved reserve body at 16.5 MT, metallogenic point at 0.49km' },
      { label: 'Flank Extension Zone', type: 'Geochemical', description: 'SAR + clay index layers indicate possible extension along strike' },
    ],
    keyRisk: 'Legacy surface quarry creates ambiguity in surface/underground boundary demarcation',
    geologicalContext: 'Gondite-hosted incline shaft mine with largest proven reserve in portfolio. High-grade 44.2% Mn ore column.',
  },
  {
    id: 'beldongri', name: 'Beldongri', shortCode: 'BD-06', district: 'Nagpur',
    state: 'Maharashtra', mineType: 'Underground',
    confidence: 78, baseTier12: 75,
    adjustments: '+5% (geochem samples at 1.06-1.26km)',
    confidenceTierLabel: 'STRONG', avgGradePct: 38.5, reservesMT: 3.5, heatmapFolder: 'beldongri',
    evidenceFactors: [
      { tier: 1, label: 'Confirmed Mn Mining Lease', value: 'Lease at 0.32km — legally confirmed Mn ore', confidence: 75 },
      { tier: 2, label: 'Geochem (stream sediment)', value: 'MnO signal at 1.06-1.26km', confidence: 60 },
      { tier: 3, label: 'Structural Zone', value: 'Fault proximity at 16.2km — low contribution', confidence: 20 },
    ],
    potentialZones: [
      { label: 'Beldongri North Pit Cut', type: 'Lease', description: 'Mining lease at 0.32km confirms active Mn ore extraction zone' },
      { label: 'Monsoon Sump Extension', type: 'Geochemical', description: 'Soil moisture anomaly + geochem signal suggests deeper ore below current working level' },
    ],
    keyRisk: 'No metallogenic reserve point matched — confidence gap without direct reserve confirmation',
    geologicalContext: 'Nagpur cluster underground mine. Lease-confirmed but lacks direct metallogenic reserve documentation.',
  },
  {
    id: 'dongri-buzurg', name: 'Dongri Buzurg', shortCode: 'DB-01', district: 'Bhandara',
    state: 'Maharashtra', mineType: 'Open Cast',
    confidence: 73, baseTier12: 70,
    adjustments: '+5% (regional Gondite lithology confirmed)',
    confidenceTierLabel: 'STRONG', avgGradePct: 43.2, reservesMT: 14.8, heatmapFolder: 'dongri-buzurg',
    evidenceFactors: [
      { tier: 2, label: 'Real Production History (MCDR)', value: 'Documented 19.6% shortfall — actual ore production confirmed', confidence: 70 },
      { tier: 2, label: 'Geochem MnO Assay', value: 'Multiple stream sediment samples confirmed Mn signal', confidence: 65 },
      { tier: 3, label: 'Regional Gondite Lithology', value: 'Host rock formation confirmed inside Sausar belt', confidence: 45 },
    ],
    potentialZones: [
      { label: 'Bhandara Gondite Ore Zone', type: 'Geochemical', description: 'Real MCDR production records confirm active extraction from confirmed Mn body' },
      { label: 'Open-Pit Strike Continuation', type: 'Structural', description: 'Clay index and NDVI contrast suggest NW strike extension beyond current pit limits' },
    ],
    keyRisk: 'No direct metallogenic reserve point — confidence relies on production records + geochem',
    geologicalContext: 'Pilot mine and project anchor. Bhandara district — Sausar Gondite belt. Real production history provides primary evidence.',
  },
  {
    id: 'sitapatore', name: 'Sitapatore', shortCode: 'SP-10', district: 'Balaghat',
    state: 'Madhya Pradesh', mineType: 'Open Cast',
    confidence: 65, baseTier12: 65,
    adjustments: '0% (no Tier 3 boost applicable)',
    confidenceTierLabel: 'MODERATE', avgGradePct: 39.8, reservesMT: 4.2, heatmapFolder: 'sitapatore',
    evidenceFactors: [
      { tier: 1, label: 'Confirmed Mn Mining Lease', value: 'Legally confirmed lease — no metallogenic reserve point documented', confidence: 65 },
      { tier: 3, label: 'Metallogenic Zone Classification', value: 'Inside Sausar Belt — non-discriminating between mines', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Sitapatore Lease Polygon', type: 'Lease', description: 'Confirmed Mn lease but no direct reserve tonnage/grade record on file' },
      { label: 'Iron Oxide Alteration Patch', type: 'Geochemical', description: 'Iron oxide index heatmap shows elevated alteration consistent with gossan formation' },
    ],
    keyRisk: 'No metallogenic data point confirmed — lease exists but reserve body not directly documented',
    geologicalContext: 'Balaghat district Gondite belt. Lease confirmed but classified Moderate until reserve point is documented.',
  },
  {
    id: 'chikla', name: 'Chikla', shortCode: 'CK-02', district: 'Bhandara',
    state: 'Maharashtra', mineType: 'Underground',
    confidence: 52, baseTier12: 55,
    adjustments: '-5% (Active Quarry ambiguity unresolved)',
    confidenceTierLabel: 'MODERATE', avgGradePct: 42.5, reservesMT: 8.4, heatmapFolder: 'chikla',
    evidenceFactors: [
      { tier: 2, label: 'Geochem (stream sediment)', value: 'MnO signal at 0.64km', confidence: 55 },
      { tier: 4, label: 'Active Quarry Ambiguity', value: 'Surface quarry near underground mine — legacy or active unclear', confidence: 15 },
      { tier: 3, label: 'Metallogenic Zone', value: 'Sausar Belt — flat 40% for any point in zone', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Chikla Geochem Plume (0.64km)', type: 'Geochemical', description: 'Stream sediment MnO signal at 0.64km from mine centroid' },
      { label: 'Bhandara Cluster NE Extension', type: 'Structural', description: 'Regional belt strikes NE connecting Chikla-Dongri cluster via Gondite horizon' },
    ],
    keyRisk: 'Surface quarry ambiguity reduces confidence by 5%; underground geology incompletely documented',
    geologicalContext: 'Bhandara cluster underground mine. Geochem-only evidence at moderate proximity. No confirmed metallogenic reserve point.',
  },
  {
    id: 'kandri', name: 'Kandri', shortCode: 'KD-03', district: 'Nagpur',
    state: 'Maharashtra', mineType: 'Underground',
    confidence: 52, baseTier12: 50,
    adjustments: '+5% (nearby geochem corroborates lease)',
    confidenceTierLabel: 'MODERATE', avgGradePct: 43.8, reservesMT: 9.3, heatmapFolder: 'kandri',
    evidenceFactors: [
      { tier: 1, label: 'Mining Lease', value: 'Confirmed Mn lease at 7.3km — wider than ideal gap', confidence: 50 },
      { tier: 2, label: 'Geochem Assay', value: 'Nearby MnO sample supports the lease', confidence: 55 },
      { tier: 3, label: 'Borehole Proximity', value: 'Boreholes 10-30km — low confidence contribution', confidence: 15 },
    ],
    potentialZones: [
      { label: 'Kandri-Gumgaon Shared Strike', type: 'Structural', description: 'Regional Gondite horizon shared with Gumgaon; mine plan separation needed' },
      { label: 'Incline Shaft Extension', type: 'Geochemical', description: 'Geochem + SAR subsidence ring suggests accessible ore below 275m level' },
    ],
    keyRisk: 'Lease at 7.3km — largest spatial gap. No metallogenic reserve point at mine coordinates.',
    geologicalContext: 'Nagpur cluster underground mine. Moderate confidence — lease confirmed but at wide spatial gap. Needs Mining Plan verification.',
  },
  {
    id: 'gumgaon', name: 'Gumgaon', shortCode: 'GG-05', district: 'Nagpur',
    state: 'Maharashtra', mineType: 'Underground',
    confidence: 48, baseTier12: 55,
    adjustments: '-10% (metallogenic name-location mismatch — points sit 28km away)',
    confidenceTierLabel: 'AMBIGUOUS', avgGradePct: 41.0, reservesMT: 7.1, heatmapFolder: 'gumgaon',
    evidenceFactors: [
      { tier: 1, label: 'Mining Lease', value: 'Confirmed Mn lease within 1km', confidence: 55 },
      { tier: 5, label: 'Name-Location Mismatch', value: 'Reserve points named Gumgaon sit 28km from mine — not usable', confidence: 0 },
      { tier: 3, label: 'Nagpur Belt Classification', value: 'Inside metallogenic belt — non-discriminating', confidence: 40 },
    ],
    potentialZones: [
      { label: 'Gumgaon/Junewani Lease Zone', type: 'Lease', description: 'Lease confirmed but naming confusion with Junewani (28km away) reduces metallogenic confidence' },
      { label: 'Nagpur Cluster Shared Horizon', type: 'Structural', description: 'Nagpur belt Gondite horizon may connect Gumgaon, Kandri, Beldongri, Munsar at depth' },
    ],
    keyRisk: 'CRITICAL: Metallogenic points named Gumgaon are 28km from mine — needs urgent field verification.',
    geologicalContext: 'Nagpur cluster underground mine. Lowest confidence in portfolio. Direct reserve evidence disqualified by name-location mismatch.',
  },
];

// ── STATIC MAPS ─────────────────────────────────────────────────────────────
const TIER_META: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Tier 1 — Direct Confirmation',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  2: { label: 'Tier 2 — Strong Evidence',         color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  3: { label: 'Tier 3 — Structural/Geophysical',  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  4: { label: 'Tier 4 — Ambiguous',               color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  5: { label: 'Tier 5 — Weak/Contextual',         color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

const CONF_META: Record<ConfidenceTier, { ringColor: string; badgeBg: string; badgeText: string }> = {
  CONFIRMED: { ringColor: 'ring-emerald-400', badgeBg: 'bg-emerald-500', badgeText: 'text-white' },
  STRONG:    { ringColor: 'ring-blue-400',    badgeBg: 'bg-blue-500',    badgeText: 'text-white' },
  MODERATE:  { ringColor: 'ring-amber-400',   badgeBg: 'bg-amber-500',   badgeText: 'text-white' },
  AMBIGUOUS: { ringColor: 'ring-orange-400',  badgeBg: 'bg-orange-500',  badgeText: 'text-white' },
  WEAK:      { ringColor: 'ring-red-400',     badgeBg: 'bg-red-500',     badgeText: 'text-white' },
};

const FILTER_LABELS: Record<HeatmapFilter, string> = {
  prospectivity: 'Prospectivity', ndvi: 'NDVI', soil_moisture: 'Soil Moisture',
  lst: 'Iron Oxide', elevation: 'Elevation',
};
const FILTER_ICONS: Record<HeatmapFilter, string> = {
  prospectivity: 'diamond', ndvi: 'forest', soil_moisture: 'water_drop',
  lst: 'local_fire_department', elevation: 'terrain',
};

// ── HELPERS ─────────────────────────────────────────────────────────────────
function barColor(p: number) { return p >= 85 ? 'bg-emerald-500' : p >= 70 ? 'bg-blue-500' : p >= 50 ? 'bg-amber-500' : 'bg-orange-500'; }
function dotColor(t: number) { return t === 1 ? 'bg-emerald-500' : t === 2 ? 'bg-blue-500' : t === 3 ? 'bg-amber-500' : t === 4 ? 'bg-orange-500' : 'bg-red-500'; }
function strokeColor(p: number) { return p >= 85 ? '#10b981' : p >= 70 ? '#3b82f6' : p >= 50 ? '#f59e0b' : '#f97316'; }
function zoneBadge(t: PotentialZone['type']) {
  switch (t) {
    case 'High Grade':  return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Structural':  return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Geochemical': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Surface':     return 'bg-teal-100 text-teal-700 border-teal-200';
    default:            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

// ── SVG RING ─────────────────────────────────────────────────────────────────
function Ring({ value, size = 56 }: { value: number; size?: number }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const col = strokeColor(value);
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="5"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="800" fill={col}>{value}%</text>
    </svg>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface Props { isDark?: boolean; }

export const MineProspectivityIntelligence: React.FC<Props> = ({ isDark = false }) => {
  const [filter, setFilter] = useState<HeatmapFilter>('prospectivity');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [minConf, setMinConf] = useState(0);
  const [sortBy, setSortBy] = useState<'confidence' | 'grade' | 'reserves'>('confidence');

  const card  = isDark ? 'bg-[#151922] border-slate-800'            : 'bg-white border-slate-200 shadow-sm';
  const th    = isDark ? 'text-white'                                : 'text-[#0B1E38]';
  const ts    = isDark ? 'text-slate-400'                            : 'text-slate-500';
  const inp   = isDark ? 'bg-slate-800 border-slate-700 text-white'  : 'bg-white border-slate-200 text-slate-800';

  const sel = MINE_CONFIDENCE_DATA.find(m => m.id === selectedId) ?? null;
  const mines = [...MINE_CONFIDENCE_DATA].filter(m => m.confidence >= minConf).sort((a, b) => {
    if (sortBy === 'grade')    return b.avgGradePct - a.avgGradePct;
    if (sortBy === 'reserves') return b.reservesMT - a.reservesMT;
    return b.confidence - a.confidence;
  });

  const avgConf   = Math.round(MINE_CONFIDENCE_DATA.reduce((s, m) => s + m.confidence, 0) / MINE_CONFIDENCE_DATA.length);
  const confirmed = MINE_CONFIDENCE_DATA.filter(m => m.confidence >= 85).length;
  const needsChk  = MINE_CONFIDENCE_DATA.filter(m => m.confidence < 55).length;

  return (
    <div className="space-y-6">

      {/* ── HEADER ── */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#002452] to-[#1a3d6e] text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <div>
              <h2 className={`text-base font-black uppercase tracking-wide ${th}`}>
                Manganese Prospectivity &amp; Confidence Intelligence
              </h2>
              <p className={`text-xs mt-1 max-w-2xl ${ts}`}>
                Tiered confidence framework from <em className="font-semibold">Manganese Confidence Analysis — SIH 2026 · PS 26009</em>.{' '}
                Mines ranked by evidence strength: Tier 1 (direct govt. records) to Tier 5 (contextual only).
                Heatmaps derived from Sentinel-2 / SRTM GeoTIFFs processed per mine.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">{confirmed} Confirmed (&ge;85%)</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-100  text-amber-800  border border-amber-200">Avg: {avgConf}%</span>
            <span className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 border border-orange-200">{needsChk} Need Verification</span>
          </div>
        </div>
        {/* Tier legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[1,2,3,4,5].map(t => (
            <div key={t} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${TIER_META[t].bg}`}>
              <span className={`w-2 h-2 rounded-full ${dotColor(t)}`} />
              <span className={`font-semibold ${TIER_META[t].color}`}>{TIER_META[t].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className={`rounded-2xl border p-4 ${card}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`text-xs font-bold ${ts}`}>Heatmap Layer:</span>
          {(Object.keys(FILTER_LABELS) as HeatmapFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                filter === f ? 'bg-[#002452] text-white border-[#002452]'
                  : isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}>
              <span className="material-symbols-outlined text-sm">{FILTER_ICONS[f]}</span>
              {FILTER_LABELS[f]}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className={`text-xs font-bold ${ts}`}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${inp}`}>
              <option value="confidence">Confidence</option>
              <option value="grade">Grade %</option>
              <option value="reserves">Reserves MT</option>
            </select>
            <span className={`text-xs font-bold ${ts}`}>Min:</span>
            <select value={minConf} onChange={e => setMinConf(Number(e.target.value))}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${inp}`}>
              <option value={0}>All mines</option>
              <option value={50}>50%+</option>
              <option value={70}>70%+</option>
              <option value={85}>85%+ (Confirmed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── MINE CARDS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {mines.map((mine, idx) => {
          const cm = CONF_META[mine.confidenceTierLabel];
          const active = selectedId === mine.id;
          return (
            <div key={mine.id} onClick={() => setSelectedId(active ? null : mine.id)}
              className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 group relative ${card} ${active ? `ring-2 ${cm.ringColor} shadow-lg` : 'hover:shadow-md hover:border-slate-300'}`}>
              {/* Rank badge */}
              <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-[#002452] text-white text-[10px] font-black flex items-center justify-center shadow">{idx + 1}</div>
              {/* Heatmap thumb */}
              <div className="relative h-36 bg-slate-900 overflow-hidden">
                <img src={`/prospectivity/layers/${mine.heatmapFolder}/${filter}.png`}
                  alt={`${mine.name} ${FILTER_LABELS[filter]}`}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-lg">
                  <span className="material-symbols-outlined text-xs align-middle mr-0.5">{FILTER_ICONS[filter]}</span>
                  {FILTER_LABELS[filter]}
                </div>
              </div>
              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`text-sm font-black ${th}`}>{mine.name}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${cm.badgeBg} ${cm.badgeText}`}>{mine.confidenceTierLabel}</span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${ts}`}>{mine.shortCode} · {mine.district} · {mine.mineType}</p>
                  </div>
                  <Ring value={mine.confidence} size={52} />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-semibold mb-1">
                    <span className={ts}>Evidence Confidence</span>
                    <span className={th}>{mine.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${barColor(mine.confidence)}`} style={{ width: `${mine.confidence}%` }} />
                  </div>
                  <p className={`text-[10px] mt-1 ${ts}`}>Base: {mine.baseTier12}% · Adj: <span className="font-semibold">{mine.adjustments}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] ${ts}`}>Avg Grade</p>
                    <p className={`text-sm font-black ${th}`}>{mine.avgGradePct}% <span className="text-[10px] font-normal">Mn</span></p>
                  </div>
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] ${ts}`}>Proved Reserves</p>
                    <p className={`text-sm font-black ${th}`}>{mine.reservesMT} <span className="text-[10px] font-normal">MT</span></p>
                  </div>
                </div>
                <div className="space-y-1">
                  {mine.evidenceFactors.slice(0, 2).map((ef, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className={`w-1.5 h-1.5 mt-1 rounded-full flex-shrink-0 ${dotColor(ef.tier)}`} />
                      <span className={`text-[10px] leading-snug ${ts}`}><span className="font-semibold">{ef.label}:</span> {ef.value}</span>
                    </div>
                  ))}
                  {mine.evidenceFactors.length > 2 && <p className={`text-[10px] italic ${ts}`}>+{mine.evidenceFactors.length - 2} more factors</p>}
                </div>
                <p className={`text-center text-[10px] font-bold ${active ? 'text-[#002452]' : ts}`}>{active ? '▲ Collapse' : '▼ Full Analysis'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DETAIL PANEL ── */}
      {sel && (
        <div className={`rounded-2xl border p-6 space-y-6 ${card}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Ring value={sel.confidence} size={72} />
              <div>
                <h3 className={`text-xl font-black ${th}`}>{sel.name}</h3>
                <p className={`text-sm ${ts}`}>{sel.shortCode} · {sel.district}, {sel.state} · {sel.mineType}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${CONF_META[sel.confidenceTierLabel].badgeBg} ${CONF_META[sel.confidenceTierLabel].badgeText}`}>{sel.confidenceTierLabel}</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">Grade: {sel.avgGradePct}% Mn</span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">Reserves: {sel.reservesMT} MT</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedId(null)}
              className={`p-2 rounded-xl cursor-pointer ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Evidence */}
            <div className="space-y-3">
              <h4 className={`text-sm font-black uppercase tracking-wide ${th}`}>Evidence Breakdown</h4>
              <div className="space-y-2">
                {sel.evidenceFactors.map((ef, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${TIER_META[ef.tier].bg}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${TIER_META[ef.tier].color} ${TIER_META[ef.tier].bg}`}>T{ef.tier}</span>
                        <span className={`text-xs font-bold ${TIER_META[ef.tier].color}`}>{ef.label}</span>
                      </div>
                      <span className={`text-xs font-black ${TIER_META[ef.tier].color}`}>{ef.confidence}%</span>
                    </div>
                    <p className={`text-[11px] mt-1.5 ${ts}`}>{ef.value}</p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/60 overflow-hidden">
                      <div className={`h-full rounded-full ${dotColor(ef.tier)}`} style={{ width: `${ef.confidence}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Key Risk */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-200'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-rose-500 text-sm">warning</span>
                  <span className={`text-xs font-bold ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>Key Risk</span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-rose-200' : 'text-rose-700'}`}>{sel.keyRisk}</p>
              </div>
              {/* Geological Context */}
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-slate-500 text-sm">geology</span>
                  <span className={`text-xs font-bold ${th}`}>Geological Context</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${ts}`}>{sel.geologicalContext}</p>
              </div>
            </div>

            {/* Heatmaps + Zones */}
            <div className="space-y-3">
              <h4 className={`text-sm font-black uppercase tracking-wide ${th}`}>Multispectral Heatmap Layers</h4>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(FILTER_LABELS) as HeatmapFilter[]).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${filter === f ? 'border-[#002452] shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                    <div className="h-20 bg-slate-900 overflow-hidden">
                      <img src={`/prospectivity/layers/${sel.heatmapFolder}/${f}.png`}
                        alt={`${sel.name} ${FILTER_LABELS[f]}`}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </div>
                    <div className={`text-center py-1 text-[10px] font-bold truncate px-1 ${filter === f ? 'bg-[#002452] text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {FILTER_LABELS[f]}
                    </div>
                  </button>
                ))}
              </div>
              <h4 className={`text-sm font-black uppercase tracking-wide ${th} mt-4`}>Identified Potential Zones</h4>
              <div className="space-y-2">
                {sel.potentialZones.map((zone, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold flex-shrink-0 ${zoneBadge(zone.type)}`}>{zone.type}</span>
                      <div>
                        <p className={`text-xs font-black ${th}`}>{zone.label}</p>
                        <p className={`text-[11px] mt-1 leading-snug ${ts}`}>{zone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RANK TABLE ── */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-black uppercase tracking-wide ${th}`}>Confidence Rank Table — All 10 Mines</h3>
          <p className={`text-xs mt-0.5 ${ts}`}>Formula: final = min(base + Tier-3 boost &minus; name-mismatch penalty, 95%)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                {['#','Mine','State','Type','Base T1/T2','Adjustment','Confidence','Grade %','Reserves MT','Tier'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...MINE_CONFIDENCE_DATA].sort((a, b) => b.confidence - a.confidence).map((mine, idx) => {
                const cm = CONF_META[mine.confidenceTierLabel];
                return (
                  <tr key={mine.id} onClick={() => setSelectedId(mine.id === selectedId ? null : mine.id)}
                    className={`border-t cursor-pointer transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'} ${selectedId === mine.id ? (isDark ? 'bg-slate-800' : 'bg-blue-50') : ''}`}>
                    <td className={`px-4 py-3 font-black ${ts}`}>{idx + 1}</td>
                    <td className={`px-4 py-3 font-bold ${th}`}>{mine.name}</td>
                    <td className={`px-4 py-3 ${ts}`}>{mine.state === 'Maharashtra' ? 'MH' : 'MP'}</td>
                    <td className={`px-4 py-3 ${ts}`}>{mine.mineType === 'Open Cast' ? 'OC' : 'UG'}</td>
                    <td className={`px-4 py-3 font-semibold ${ts}`}>{mine.baseTier12}%</td>
                    <td className={`px-4 py-3 text-[11px] max-w-xs ${ts}`}>{mine.adjustments}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor(mine.confidence)}`} style={{ width: `${mine.confidence}%` }} />
                        </div>
                        <span className={`font-black ${th}`}>{mine.confidence}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 font-bold ${th}`}>{mine.avgGradePct}%</td>
                    <td className={`px-4 py-3 font-bold ${th}`}>{mine.reservesMT}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cm.badgeBg} ${cm.badgeText}`}>{mine.confidenceTierLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── METHODOLOGY ── */}
      <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0d1117] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className={`text-xs font-bold mb-1 ${th}`}>Confidence Formula (PDF Report — SIH 2026 PS 26009)</p>
            <code className={`text-[11px] font-mono block leading-relaxed ${ts}`}>
              base_confidence = highest single Tier-1 or Tier-2 indicator for that cell<br />
              boost = + (Tier-3 evidence count x 5%), capped at +15%<br />
              penalty = -10% if lease/metallogenic match has name-location mismatch<br />
              final_confidence = min(base_confidence + boost - penalty, 95%)
            </code>
            <p className={`text-[11px] mt-2 ${ts}`}>
              Heatmap layers: Sentinel-2 NDVI, clay/iron oxide index; SRTM DEM elevation/slope; Sentinel-1 SAR InSAR; Landsat LST.
              Standard geological practice: Gondite-hosted braunite/pyrolusite lodes in Sausar Belt, Central India.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MineProspectivityIntelligence;
