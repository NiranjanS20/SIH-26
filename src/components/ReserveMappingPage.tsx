import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Satellite,
  ZoomIn,
  ZoomOut,
  Target,
  MapPin,
  Sun,
  Moon,
  ArrowLeft,
  Compass,
} from 'lucide-react';
import {
  MANGANESE_MINES_DATA,
  EXPLORATION_TARGETS_DATA,
  EXPLORATION_LICENSES_DATA,
  PROSPECTIVITY_HOTSPOTS_DATA,
  SPECTRAL_REFLECTANCE_DATA,
  SATELLITE_ACQUISITION_METADATA,
  TILE_PROVIDERS,
  type MineGeoLocation,
  type ExplorationTarget,
} from '../data/reserveMappingData';
import { type PortalRoute } from './Navbar';

// ── Satellite Analysis Layers ────────────────────────────────────────────────
export type SatelliteMode =
  | 'TRUE_COLOR'
  | 'NDVI_VEGETATION'
  | 'SOIL_MOISTURE'
  | 'THERMAL_LST'
  | 'MN_PROSPECTIVITY';

export const SATELLITE_MODES: Array<{
  id: SatelliteMode;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  sensor: string;
  colormap: string;
}> = [
  {
    id: 'TRUE_COLOR',
    name: 'True-Color Satellite',
    shortName: 'Satellite',
    icon: '🛰️',
    description: 'High-resolution optical surface imagery from Sentinel-2 MSI (10m ground resolution).',
    sensor: 'Sentinel-2B (B4-B3-B2)',
    colormap: 'Natural Surface RGB',
  },
  {
    id: 'MN_PROSPECTIVITY',
    name: 'Manganese Prospectivity',
    shortName: 'Mn AI Heatmap',
    icon: '⛏️',
    description: 'AI spatial prior model combining ASTER thermal IR, SWIR absorption, and structural geology.',
    sensor: 'Space-ML Ensemble Model',
    colormap: 'Red (High) → Amber → Green (Low)',
  },
  {
    id: 'NDVI_VEGETATION',
    name: 'Vegetation Index (NDVI)',
    shortName: 'NDVI Index',
    icon: '🌿',
    description: 'Identifies vegetative suppression over open-cast pits and exposed mineralized bedrock.',
    sensor: 'Sentinel-2 (NIR/Red Ratio)',
    colormap: 'Brown (Bare Mineral) → Green (Dense)',
  },
  {
    id: 'SOIL_MOISTURE',
    name: 'Soil Moisture (SAR)',
    shortName: 'Moisture',
    icon: '💧',
    description: 'Dielectric backscatter proxy detecting water accumulation and haul road trafficability.',
    sensor: 'Sentinel-1 SAR C-Band (VV/VH)',
    colormap: 'Amber (Dry Rock) → Cyan (Moist Sump)',
  },
  {
    id: 'THERMAL_LST',
    name: 'Land Surface Temp (LST)',
    shortName: 'Thermal LST',
    icon: '🌡️',
    description: 'Thermal inertia contrast detecting dense sub-surface manganese and iron formation reefs.',
    sensor: 'Landsat-9 TIRS / ASTER TIR',
    colormap: 'Blue (Cool) → Crimson (Thermal Anomaly)',
  },
];

// ── Custom Leaflet Pin Icons ──────────────────────────────────────────────────
const createMineIcon = (mine: MineGeoLocation, isSelected: boolean) => {
  const isPilot = mine.isPilot;
  const borderColor = isPilot ? '#f59e0b' : isSelected ? '#a855f7' : '#7c3aed';
  const bgColor = isPilot ? 'rgba(245, 158, 11, 0.95)' : 'rgba(124, 58, 237, 0.9)';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isPilot || isSelected
          ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2px solid ${borderColor}; opacity: 0.8; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        width: ${isSelected ? '26px' : '22px'};
        height: ${isSelected ? '26px' : '22px'};
        background: ${bgColor};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px ${borderColor};
        color: white;
      ">
        <span style="font-size: 11px; font-weight: 800;">⛏</span>
      </div>
      <div style="
        position: absolute;
        bottom: -18px;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 800;
        background: rgba(15, 23, 42, 0.9);
        color: #f8fafc;
        padding: 1px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.2);
        pointer-events: none;
        backdrop-filter: blur(4px);
      ">
        ${mine.name}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-mine-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const createTargetIcon = (target: ExplorationTarget, isSelected: boolean) => {
  const color = target.rank === 1 ? '#ef4444' : target.rank === 2 ? '#f97316' : '#eab308';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="
        width: ${isSelected ? '26px' : '22px'};
        height: ${isSelected ? '26px' : '22px'};
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color};
        color: white;
        font-size: 10px;
        font-weight: 900;
        font-family: 'Inter', sans-serif;
      ">
        #${target.rank}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-target-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// ── Map Controller Helpers ────────────────────────────────────────────────────
interface MapControllerProps {
  centerCoords: [number, number] | null;
  zoomLevel: number | null;
  onMapMove?: (lat: number, lng: number, zoom: number) => void;
}

const MapController: React.FC<MapControllerProps> = ({
  centerCoords,
  zoomLevel,
  onMapMove,
}) => {
  const map = useMap();

  useEffect(() => {
    if (centerCoords && zoomLevel !== null) {
      map.flyTo(centerCoords, zoomLevel, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [centerCoords, zoomLevel, map]);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (onMapMove) {
        onMapMove(center.lat, center.lng, zoom);
      }
    },
  });

  return null;
};

// ── Main Component ────────────────────────────────────────────────────────────
interface ReserveMappingPageProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const ReserveMappingPage: React.FC<ReserveMappingPageProps> = ({
  onNavigate,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  // Active Satellite Mode (Default: True Color Satellite)
  const [activeSatelliteMode, setActiveSatelliteMode] = useState<SatelliteMode>('TRUE_COLOR');
  const layerOpacity = 0.75;

  // Selected Mine or Exploration Target
  const [selectedTarget, setSelectedTarget] = useState<ExplorationTarget>(EXPLORATION_TARGETS_DATA[1]); // Default Dongri Deep
  const [selectedMine, setSelectedMine] = useState<MineGeoLocation | null>(MANGANESE_MINES_DATA[0]); // Default Dongri Buzurg

  // Map Navigation & GPS Coordinates
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([21.554, 79.702]); // Default Dongri Buzurg
  const [mapZoom, setMapZoom] = useState<number | null>(7.5);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 21.554,
    lng: 79.702,
    zoom: 7.5,
  });

  // UI Drawer State
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Environment Token Configuration (Reads cleanly from .env)
  const envMapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  // Quick Zoom Presets
  const QUICK_REGIONS = [
    { name: 'Dongri Buzurg (Pilot)', lat: 21.554, lng: 79.702, zoom: 11.5, mineId: 'dongri-buzurg' },
    { name: 'Balaghat (Bharweli)', lat: 21.870, lng: 80.185, zoom: 11.0, mineId: 'balaghat' },
    { name: 'Central India Belt', lat: 21.650, lng: 79.750, zoom: 8.5 },
    { name: 'Odisha Belt', lat: 21.950, lng: 85.420, zoom: 8.5 },
    { name: 'Karnataka (Sandur)', lat: 15.085, lng: 76.550, zoom: 8.5 },
    { name: 'All India', lat: 22.500, lng: 80.000, zoom: 5.2 },
  ];

  const handleSelectRegion = (region: (typeof QUICK_REGIONS)[0]) => {
    setMapCenter([region.lat, region.lng]);
    setMapZoom(region.zoom);
    if (region.mineId) {
      const match = MANGANESE_MINES_DATA.find((m) => m.id === region.mineId);
      if (match) setSelectedMine(match);
    }
  };

  const handleSelectMine = (mine: MineGeoLocation) => {
    setSelectedMine(mine);
    const closestTarget =
      EXPLORATION_TARGETS_DATA.find((t) => t.state === mine.state) || EXPLORATION_TARGETS_DATA[0];
    setSelectedTarget(closestTarget);
    setMapCenter([mine.latitude, mine.longitude]);
    setMapZoom(11.5);
  };

  // Determine active tile URL (Mapbox if configured in .env, otherwise Esri Satellite or Dark Matter)
  const activeTileUrl = useMemo(() => {
    if (envMapboxToken && envMapboxToken.trim()) {
      return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${envMapboxToken.trim()}`;
    }
    if (
      activeSatelliteMode === 'TRUE_COLOR' ||
      activeSatelliteMode === 'NDVI_VEGETATION' ||
      activeSatelliteMode === 'THERMAL_LST'
    ) {
      return TILE_PROVIDERS.satellite.url;
    }
    return themeMode === 'dark' ? TILE_PROVIDERS.dark.url : TILE_PROVIDERS.light.url;
  }, [envMapboxToken, activeSatelliteMode, themeMode]);

  const activeTileAttribution = envMapboxToken
    ? '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
    : activeSatelliteMode === 'TRUE_COLOR'
    ? TILE_PROVIDERS.satellite.attribution
    : TILE_PROVIDERS.dark.attribution;

  const isDark = themeMode === 'dark';

  // Dynamic theme tokens for high-contrast readability in both Light & Dark modes
  const textHeading = isDark ? 'text-white' : 'text-slate-900';
  const textBody = isDark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-600';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs';
  const panelBg = isDark ? 'bg-[#121620]/95 border-white/10' : 'bg-white/95 border-slate-200 shadow-xl';

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden ${
        isDark ? 'bg-[#0b0e14] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'
      } font-body select-none`}
    >
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP APP BAR (MOIL Space-Reserve Intelligence Header)
      ────────────────────────────────────────────────────────────────────────── */}
      <header
        className={`h-14 shrink-0 flex items-center justify-between px-4 z-30 border-b ${
          isDark
            ? 'bg-[#10141d]/90 border-white/10 backdrop-blur-md'
            : 'bg-white/95 border-slate-200 shadow-xs backdrop-blur-md'
        }`}
      >
        {/* Left: Branding & Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Return to MOIL Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className={`h-5 w-px hidden sm:block ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* MOIL Emblem & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white text-[6px] font-black leading-none shrink-0 border border-white/30 shadow-md">
              <span>मॉयल</span>
              <span>MOIL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-bold tracking-tight uppercase ${textHeading}`}>
                  MOIL Space-Reserve Intelligence
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  SATELLITE GIS
                </span>
              </div>
              <p className={`text-[10px] hidden md:block ${textMuted}`}>
                Problem Statement 26009 • Satellite-Based Manganese Reserve Mapping
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Region Switcher Pills */}
        <div className={`hidden lg:flex items-center gap-1.5 p-1 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          {QUICK_REGIONS.map((r) => (
            <button
              key={r.name}
              onClick={() => handleSelectRegion(r)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-white shadow-2xs'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Right: Pilot Hub & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Pilot Workspace Direct Access */}
          <button
            onClick={() => onNavigate('dongri-buzurg-workspace')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-transform active:scale-95 cursor-pointer"
            title="Open Dongri Buzurg Operational Workspace"
          >
            <span>Dongri Pilot Hub →</span>
          </button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-white/10 bg-white/5 text-amber-400 hover:bg-white/10'
                  : 'border-slate-200 bg-slate-100 text-amber-600 hover:bg-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SATELLITE MODE SELECTOR BAR (Primary Space Tech Interaction)
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        className={`h-11 shrink-0 px-4 border-b flex items-center justify-between gap-2 overflow-x-auto z-20 text-xs ${
          isDark
            ? 'bg-[#141822] border-white/10 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline ${textMuted}`}>
            Satellite Layer:
          </span>
          <div className="flex items-center gap-1.5">
            {SATELLITE_MODES.map((mode) => {
              const isActive = activeSatelliteMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveSatelliteMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title={mode.description}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Sensor & Ground Resolution Telemetry */}
        <div className={`hidden md:flex items-center gap-3 text-[10px] font-mono ${textMuted}`}>
          <span>
            Sensor:{' '}
            <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>
              {SATELLITE_MODES.find((m) => m.id === activeSatelliteMode)?.sensor}
            </strong>
          </span>
          <span>•</span>
          <span>
            Pass:{' '}
            <strong className={isDark ? 'text-emerald-400' : 'text-emerald-600 font-bold'}>
              {SATELLITE_ACQUISITION_METADATA.acquisitionDate.split(' ')[0]}
            </strong>
          </span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. MAIN INTERACTIVE MAP & SATELLITE HUD
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── MAP CONTAINER (HERO) ───────────────────────────────────────────── */}
        <main className="flex-1 w-full h-full relative">
          {/* Floating Controls Overlay (Top Right) */}
          <div className="absolute top-3 right-4 z-20 flex flex-col gap-2">
            {/* Compass */}
            <div
              className={`p-2 rounded-xl border shadow-lg backdrop-blur-md flex flex-col items-center justify-center ${
                isDark ? 'bg-[#111622]/90 border-white/15' : 'bg-white/90 border-slate-200'
              }`}
              title="North Orientation"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-[8px] font-black text-amber-400 mt-0.5">N</span>
            </div>

            {/* Zoom Controls */}
            <div
              className={`flex flex-col rounded-xl border shadow-lg backdrop-blur-md overflow-hidden ${
                isDark ? 'bg-[#111622]/90 border-white/15' : 'bg-white/95 border-slate-200'
              }`}
            >
              <button
                onClick={() => setMapZoom((z) => (z ? Math.min(15, z + 1) : 8))}
                className={`p-2 transition-colors cursor-pointer border-b ${
                  isDark
                    ? 'hover:bg-white/10 text-slate-200 border-white/10'
                    : 'hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMapZoom((z) => (z ? Math.max(4, z - 1) : 4))}
                className={`p-2 transition-colors cursor-pointer border-b ${
                  isDark
                    ? 'hover:bg-white/10 text-slate-200 border-white/10'
                    : 'hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMapCenter([22.5, 80.0]);
                  setMapZoom(5.2);
                }}
                className={`p-2 transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-white/10 text-amber-400'
                    : 'hover:bg-slate-100 text-amber-600'
                }`}
                title="Reset to Full India Extent"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>

            {/* Expand Right Panel Button */}
            {!rightPanelOpen && (
              <button
                onClick={() => setRightPanelOpen(true)}
                className={`p-2 rounded-xl border shadow-lg backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#111622]/90 border-white/15 text-amber-400 hover:bg-white/10'
                    : 'bg-white/95 border-slate-200 text-amber-600 hover:bg-slate-100'
                }`}
                title="Open Satellite Insights Panel"
              >
                <Satellite className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Floating Current Location Readout (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
            <div
              className={`px-3 py-1.5 rounded-lg border backdrop-blur-md font-mono text-[10px] shadow-lg flex items-center gap-2 ${
                isDark
                  ? 'bg-[#111622]/90 border-white/15 text-slate-300'
                  : 'bg-white/95 border-slate-200 text-slate-800 font-bold'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {currentCoords.lat.toFixed(4)}°N · {currentCoords.lng.toFixed(4)}°E · Zoom{' '}
                {currentCoords.zoom.toFixed(1)}x
              </span>
            </div>

            {/* Colormap Legend */}
            <div
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl text-xs space-y-1.5 ${
                isDark
                  ? 'bg-[#111622]/90 border-white/15 text-slate-300'
                  : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className={textMuted}>
                  Colormap:{' '}
                  <strong className={isDark ? 'text-amber-400' : 'text-amber-600 font-bold'}>
                    {SATELLITE_MODES.find((m) => m.id === activeSatelliteMode)?.colormap}
                  </strong>
                </span>
              </div>
              <div
                className="w-48 h-2 rounded-full border border-black/10"
                style={{
                  background:
                    activeSatelliteMode === 'NDVI_VEGETATION'
                      ? 'linear-gradient(to right, #854d0e, #eab308, #22c55e, #15803d)'
                      : activeSatelliteMode === 'SOIL_MOISTURE'
                      ? 'linear-gradient(to right, #d97706, #38bdf8, #0284c7)'
                      : activeSatelliteMode === 'THERMAL_LST'
                      ? 'linear-gradient(to right, #3b82f6, #f59e0b, #ef4444)'
                      : 'linear-gradient(to right, #1e3a8a, #10b981, #eab308, #ef4444)',
                }}
              />
            </div>
          </div>

          {/* Leaflet MapContainer */}
          <MapContainer
            center={[21.554, 79.702]}
            zoom={7.5}
            minZoom={4}
            maxZoom={16}
            scrollWheelZoom={true}
            zoomControl={false}
            className="w-full h-full"
          >
            <MapController
              centerCoords={mapCenter}
              zoomLevel={mapZoom}
              onMapMove={(lat, lng, zoom) => setCurrentCoords({ lat, lng, zoom })}
            />

            {/* Satellite Base Layer */}
            <TileLayer url={activeTileUrl} attribution={activeTileAttribution} maxZoom={18} />

            {/* ── SATELLITE RASTER / HEATMAP LAYER OVERLAYS ───────────────────── */}
            {activeSatelliteMode !== 'TRUE_COLOR' &&
              PROSPECTIVITY_HOTSPOTS_DATA.map((hs) => {
                const ringColor =
                  activeSatelliteMode === 'NDVI_VEGETATION'
                    ? '#22c55e'
                    : activeSatelliteMode === 'SOIL_MOISTURE'
                    ? '#38bdf8'
                    : activeSatelliteMode === 'THERMAL_LST'
                    ? '#ef4444'
                    : '#f59e0b';

                return (
                  <React.Fragment key={hs.id}>
                    {/* Outer Falloff Ring */}
                    <Circle
                      center={hs.center}
                      radius={hs.radiusKm * 800}
                      pathOptions={{
                        color: ringColor,
                        fillColor: ringColor,
                        fillOpacity: 0.15 * layerOpacity,
                        stroke: false,
                      }}
                    />
                    {/* Core Anomaly Hotspot */}
                    <Circle
                      center={hs.center}
                      radius={hs.radiusKm * 350}
                      pathOptions={{
                        color: ringColor,
                        fillColor: ringColor,
                        fillOpacity: 0.45 * layerOpacity,
                        weight: 1.5,
                      }}
                    >
                      <Popup>
                        <div className="p-2 text-xs">
                          <span className="font-bold text-amber-400 block">{hs.beltName}</span>
                          <span className="text-[10px] text-slate-300 block">{hs.dominantGrade}</span>
                        </div>
                      </Popup>
                    </Circle>
                  </React.Fragment>
                );
              })}

            {/* ── MANGANESE MINES MARKERS ────────────────────────────────────── */}
            {MANGANESE_MINES_DATA.map((mine) => {
              const isSelected = selectedMine?.id === mine.id;
              return (
                <Marker
                  key={mine.id}
                  position={[mine.latitude, mine.longitude]}
                  icon={createMineIcon(mine, isSelected)}
                  eventHandlers={{
                    click: () => handleSelectMine(mine),
                  }}
                >
                  <Popup>
                    <div className="p-2.5 text-xs min-w-[200px]">
                      <span className="font-bold text-purple-400 block">{mine.shortCode}</span>
                      <h4 className="font-bold text-white text-sm">{mine.name}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">{mine.location}</p>
                      <div className="mt-2 pt-2 border-t border-white/10 text-[10px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ore Grade:</span>
                          <span className="text-amber-300 font-bold">{mine.gradePct}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Est. Reserves:</span>
                          <span className="text-emerald-400 font-bold">
                            {(mine.estimatedReserveTons / 1000000).toFixed(1)} M Tonnes
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* ── EXPLORATION TARGET PINS ────────────────────────────────────── */}
            {EXPLORATION_TARGETS_DATA.map((tgt) => {
              const isSelected = selectedTarget.id === tgt.id;
              return (
                <Marker
                  key={tgt.id}
                  position={[tgt.latitude, tgt.longitude]}
                  icon={createTargetIcon(tgt, isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedTarget(tgt);
                      setMapCenter([tgt.latitude, tgt.longitude]);
                      setMapZoom(10.5);
                    },
                  }}
                />
              );
            })}

            {/* ── EXPLORATION LEASE BOUNDARIES ───────────────────────────────── */}
            {EXPLORATION_LICENSES_DATA.map((lic) => (
              <Polygon
                key={lic.id}
                positions={lic.coordinates}
                pathOptions={{
                  color: '#f59e0b',
                  weight: 1.5,
                  dashArray: '5 5',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.08,
                }}
              />
            ))}
          </MapContainer>
        </main>

        {/* ── RIGHT PANEL: SATELLITE TELEMETRY & RESERVE ANALYSIS ─────────────── */}
        <aside
          className={`w-80 shrink-0 z-20 flex flex-col border-l transition-all ${panelBg} ${
            rightPanelOpen ? 'block' : 'hidden'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-amber-500" />
              <span className={`font-bold text-xs uppercase tracking-wider ${textHeading}`}>
                Satellite Reserve Insights
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                LIVE
              </span>
              <button
                onClick={() => setRightPanelOpen(false)}
                className={`text-xs px-1 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Collapse Panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Selected Location Summary */}
            <div className={`p-3 rounded-xl border space-y-1 ${cardBg}`}>
              <span className={`text-[9px] font-mono uppercase block font-bold ${textMuted}`}>
                Focused Mine Area
              </span>
              <h3 className={`font-bold text-sm ${textHeading}`}>
                {selectedMine ? selectedMine.name : selectedTarget.name}
              </h3>
              <p className={`text-[11px] ${textBody}`}>
                {selectedMine ? selectedMine.location : `${selectedTarget.region}, ${selectedTarget.state}`}
              </p>
            </div>

            {/* Live Satellite Index Cards */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block font-mono ${textMuted}`}>
                Satellite Indicators (Sentinel-2 & TIR)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg border space-y-0.5 ${cardBg}`}>
                  <span className={`text-[9px] block font-mono ${textMuted}`}>NDVI (Vegetation)</span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">-0.14</span>
                  <span className={`text-[8.5px] block ${textMuted}`}>Exposed mineral reef</span>
                </div>

                <div className={`p-2.5 rounded-lg border space-y-0.5 ${cardBg}`}>
                  <span className={`text-[9px] block font-mono ${textMuted}`}>LST Thermal</span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">+3.4 °C</span>
                  <span className={`text-[8.5px] block ${textMuted}`}>Bedrock inertia anomaly</span>
                </div>

                <div className={`p-2.5 rounded-lg border space-y-0.5 ${cardBg}`}>
                  <span className={`text-[9px] block font-mono ${textMuted}`}>Soil Moisture</span>
                  <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono">0.31</span>
                  <span className={`text-[8.5px] block ${textMuted}`}>SAR dielectric contrast</span>
                </div>

                <div className={`p-2.5 rounded-lg border space-y-0.5 ${cardBg}`}>
                  <span className={`text-[9px] block font-mono ${textMuted}`}>ASTER Fe-Mn Ratio</span>
                  <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono">1.38</span>
                  <span className={`text-[8.5px] block ${textMuted}`}>Oxide gossan signature</span>
                </div>
              </div>
            </div>

            {/* Multi-Band Reflectance Chart */}
            <div className={`p-3 rounded-xl border space-y-2 ${cardBg}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold font-mono uppercase ${textHeading}`}>
                  Reflectance Curve (BOA)
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                  Sentinel-2B L2A
                </span>
              </div>
              <div className="h-24 w-full flex items-end justify-between gap-1 pt-2">
                {SPECTRAL_REFLECTANCE_DATA.map((band, idx) => {
                  const heightPct = (band.reflectance / 0.35) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-amber-600 to-amber-400 shadow-2xs"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className={`text-[7.5px] font-mono font-semibold ${textMuted}`}>
                        {band.band.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Exploration Priority & Recommendation */}
            <div className={`p-3.5 rounded-xl border space-y-1.5 ${
              isDark
                ? 'border-amber-500/40 bg-amber-500/10'
                : 'border-amber-400 bg-amber-50/90 shadow-2xs'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono block">
                Exploration Recommendation
              </span>
              <p className={`text-xs font-bold leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {selectedTarget.recommendedStep}
              </p>
              <p className={`text-[11px] leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {selectedTarget.recommendation}
              </p>
            </div>

            {/* Satellite Acquisition Telemetry */}
            <div className={`p-3 rounded-xl border space-y-1 text-[10px] font-mono ${cardBg} ${textMuted}`}>
              <div className="flex justify-between">
                <span>Constellation:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Sentinel-2B + Landsat-9
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ground Res:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  10m Optical / 30m TIR
                </span>
              </div>
              <div className="flex justify-between">
                <span>CRS:</span>
                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  EPSG:4326 (WGS84)
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
