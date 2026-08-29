import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Compass,
  RotateCcw,
  Target,
  CheckCircle2,
  AlertCircle,
  Info,
  MapPin,
  Satellite,
  Activity,
  Sun,
  Moon,
  ArrowLeft,
  Search,
} from 'lucide-react';
import {
  MANGANESE_MINES_DATA,
  EXPLORATION_TARGETS_DATA,
  ACTIVE_EQUIPMENT_DATA,
  EXPLORATION_LICENSES_DATA,
  GEOLOGICAL_LINEAMENTS_DATA,
  PROSPECTIVITY_HOTSPOTS_DATA,
  SPECTRAL_REFLECTANCE_DATA,
  SPECTRAL_INDICES_METRICS,
  SATELLITE_ACQUISITION_METADATA,
  TILE_PROVIDERS,
  type MineGeoLocation,
  type ExplorationTarget,
  type EquipmentTelemetry,
} from '../data/reserveMappingData';
import { type PortalRoute } from './Navbar';

// ── Custom Leaflet Icons ──────────────────────────────────────────────────────
const createMineIcon = (mine: MineGeoLocation, isSelected: boolean) => {
  const isPilot = mine.isPilot;
  const borderColor = isPilot ? '#f59e0b' : isSelected ? '#a855f7' : '#7c3aed';
  const bgColor = isPilot ? 'rgba(245, 158, 11, 0.95)' : 'rgba(124, 58, 237, 0.9)';
  
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isPilot || isSelected
          ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${borderColor}; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        width: ${isSelected ? '28px' : '22px'};
        height: ${isSelected ? '28px' : '22px'};
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${borderColor}88;
        color: white;
        transition: transform 0.2s ease;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
          <path d="M15 13 9 7l4-4 6 6h3l3 3"/>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -18px;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: -0.02em;
        background: rgba(15, 23, 42, 0.85);
        color: #f8fafc;
        padding: 1px 5px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.15);
        pointer-events: none;
        backdrop-filter: blur(4px);
      ">
        ${mine.shortCode}
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
  const isRank1 = target.rank === 1;
  const color = isRank1 ? '#ef4444' : target.rank === 2 ? '#f97316' : '#eab308';
  
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="
        position: absolute;
        width: ${isSelected ? '38px' : '30px'};
        height: ${isSelected ? '38px' : '30px'};
        border-radius: 50%;
        border: 1.5px dashed ${color};
        opacity: 0.85;
      "></div>
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 14px ${color}bb;
        color: white;
        font-size: 10px;
        font-weight: 800;
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

const createEquipmentIcon = (eq: EquipmentTelemetry) => {
  const color = eq.status === 'Active' ? '#06b6d4' : '#94a3b8';
  const html = `
    <div style="
      width: 18px;
      height: 18px;
      background: rgba(15, 23, 42, 0.9);
      border: 1.5px solid ${color};
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px ${color}88;
      color: ${color};
      cursor: pointer;
    ">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-eq-pin',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

// ── Props Interface ───────────────────────────────────────────────────────────
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
  // Navigation & UI States
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'zone' | 'targets' | 'spectral' | 'info'>('zone');
  const [baseMapStyle, setBaseMapStyle] = useState<'dark' | 'satellite' | 'light' | 'osm'>(
    themeMode === 'dark' ? 'dark' : 'light'
  );

  // Map Target Focus
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([22.5, 80.0]);
  const [mapZoom, setMapZoom] = useState<number | null>(5.2);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 21.8700,
    lng: 80.1850,
    zoom: 5.2,
  });

  // Layer Toggles
  const [layers, setLayers] = useState({
    prospectivityHeatmap: true,
    manganeseMines: true,
    explorationLicenses: true,
    activeEquipment: true,
    geologicalUnits: true,
    lineaments: true,
    roadsRailways: false,
    satelliteImagery: false,
  });

  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);

  // Filters State
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [selectedMineType, setSelectedMineType] = useState<string>('All Types');
  const [minConfidence, setMinConfidence] = useState<number>(60);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Target / Mine for Deep Inspection
  const [selectedTarget, setSelectedTarget] = useState<ExplorationTarget>(EXPLORATION_TARGETS_DATA[0]);
  const [selectedMine, setSelectedMine] = useState<MineGeoLocation | null>(null);

  // Sync basemap with themeMode when theme toggles
  useEffect(() => {
    if (baseMapStyle === 'dark' || baseMapStyle === 'light') {
      setBaseMapStyle(themeMode === 'dark' ? 'dark' : 'light');
    }
  }, [themeMode]);

  // Filtered Mines
  const filteredMines = useMemo(() => {
    return MANGANESE_MINES_DATA.filter((mine) => {
      const matchState = selectedState === 'All States' || mine.state === selectedState;
      const matchStatus =
        selectedStatus === 'All Statuses' ||
        (selectedStatus === 'Active Mines' && mine.status === 'Active') ||
        mine.status === selectedStatus;
      const matchType = selectedMineType === 'All Types' || mine.type === selectedMineType;
      const matchSearch =
        !searchQuery ||
        mine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mine.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mine.shortCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchStatus && matchType && matchSearch;
    });
  }, [selectedState, selectedStatus, selectedMineType, searchQuery]);

  // Filtered Exploration Targets
  const filteredTargets = useMemo(() => {
    return EXPLORATION_TARGETS_DATA.filter((tgt) => {
      const matchState = selectedState === 'All States' || tgt.state === selectedState;
      const matchConfidence = tgt.confidence >= minConfidence;
      const matchSearch =
        !searchQuery ||
        tgt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tgt.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchConfidence && matchSearch;
    });
  }, [selectedState, minConfidence, searchQuery]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedState('All States');
    setSelectedStatus('All Statuses');
    setSelectedMineType('All Types');
    setMinConfidence(60);
    setSearchQuery('');
  };

  // Quick Zoom to Location / Mine
  const handleFlyToTarget = (target: ExplorationTarget) => {
    setSelectedTarget(target);
    setSelectedMine(null);
    setRightTab('zone');
    setMapCenter([target.latitude, target.longitude]);
    setMapZoom(9.5);
  };

  const handleFlyToMine = (mine: MineGeoLocation) => {
    setSelectedMine(mine);
    // Find closest target or set target based on mine
    const closestTarget = EXPLORATION_TARGETS_DATA.find((t) => t.state === mine.state) || EXPLORATION_TARGETS_DATA[0];
    setSelectedTarget(closestTarget);
    setRightTab('zone');
    setMapCenter([mine.latitude, mine.longitude]);
    setMapZoom(11.0);
  };

  const handleResetToIndia = () => {
    setMapCenter([22.5, 80.0]);
    setMapZoom(5.2);
  };

  // Color Theme Variables
  const isDark = themeMode === 'dark';
  const bgMain = isDark ? 'bg-[#0f1218] text-slate-100' : 'bg-[#f8fafc] text-slate-900';
  const bgPanel = isDark ? 'bg-[#151921]/95 border-white/10' : 'bg-white/95 border-slate-200';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const borderCard = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${bgMain} font-body select-none`}>
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP APP HEADER / GIS STATUS BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <header
        className={`h-14 shrink-0 flex items-center justify-between px-4 z-30 border-b ${
          isDark
            ? 'bg-[#10141d]/90 border-white/10 backdrop-blur-md'
            : 'bg-white/90 border-slate-200 backdrop-blur-md'
        }`}
      >
        {/* Left: Branding & Back Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-slate-300'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Return to MOIL Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">MOIL Portal</span>
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Logo & Section Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white text-[6px] font-black leading-none shrink-0 border border-white/30 shadow-md">
              <span>मॉयल</span>
              <span>MOIL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold tracking-tight uppercase ${textHeader}`}>
                  MOIL Reserve Intelligence
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  DEMO
                </span>
              </div>
              <p className={`text-[10px] hidden md:block ${textMuted}`}>
                National Geospatial Manganese Prospectivity & Telemetry Hub
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Region Switcher & Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isDark
                ? 'bg-slate-900/80 border-white/10 text-slate-300'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono">29 Aug • 18:38 IST</span>
          </div>

          {/* Quick Region Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedTarget.id}
              onChange={(e) => {
                const found = EXPLORATION_TARGETS_DATA.find((t) => t.id === e.target.value);
                if (found) handleFlyToTarget(found);
              }}
              className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-white/15 text-slate-200 focus:border-amber-400'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-amber-500'
              }`}
            >
              <option value="">🎯 Quick Zoom: Select Focus Area</option>
              {EXPLORATION_TARGETS_DATA.map((tgt) => (
                <option key={tgt.id} value={tgt.id}>
                  #{tgt.rank} {tgt.name} ({tgt.state})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Badges, Theme Toggle & Navigation shortcuts */}
        <div className="flex items-center gap-2">
          {/* Status Badges */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
              ML PREDICTIONS
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
              SIMULATED DATA
            </span>
          </div>

          {/* Pilot Workspace Direct Access */}
          <button
            onClick={() => onNavigate('dongri-buzurg-workspace')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-transform active:scale-95"
            title="Open Dongri Buzurg Operational Workspace"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dongri Buzurg Hub</span>
          </button>

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-white/15 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. THREE-COLUMN GIS WORKSPACE (LEFT: Layers/Filters, CENTER: Map, RIGHT: Evidence)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT PANEL: Layers & Operational Filters ─────────────────────────── */}
        <aside
          className={`shrink-0 z-20 flex flex-col transition-all duration-300 border-r ${bgPanel} ${
            leftPanelOpen ? 'w-64' : 'w-12'
          }`}
        >
          {/* Panel Header & Collapse Toggle */}
          <div className={`flex items-center justify-between px-3 h-11 border-b ${borderCard}`}>
            {leftPanelOpen && (
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className={`text-xs font-bold uppercase tracking-wider ${textHeader}`}>
                  Layers & Filters
                </span>
              </div>
            )}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className={`p-1 rounded-md text-slate-400 hover:text-white transition-colors ${
                !leftPanelOpen ? 'mx-auto' : ''
              }`}
              title={leftPanelOpen ? 'Collapse panel' : 'Expand panel'}
            >
              {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {leftPanelOpen ? (
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 text-xs">
              {/* Map Layer Toggles */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                  Map Layers
                </span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.prospectivityHeatmap}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, prospectivityHeatmap: e.target.checked }))
                      }
                      className="accent-red-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-500 to-amber-500 shrink-0" />
                    <span className="font-medium text-slate-200">Prospectivity Heatmap</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.manganeseMines}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, manganeseMines: e.target.checked }))
                      }
                      className="accent-purple-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-3 rounded-full bg-purple-500 shrink-0 flex items-center justify-center text-[7px] text-white">
                      ⛏
                    </div>
                    <span className="font-medium text-slate-200">Manganese Mines ({filteredMines.length})</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.explorationLicenses}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, explorationLicenses: e.target.checked }))
                      }
                      className="accent-amber-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-3 border border-amber-500 border-dashed bg-amber-500/20 rounded-sm shrink-0" />
                    <span className="font-medium text-slate-200">Exploration Licenses</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.activeEquipment}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, activeEquipment: e.target.checked }))
                      }
                      className="accent-cyan-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shrink-0" />
                    <span className="font-medium text-slate-200">Active Equipment (GPS)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.geologicalUnits}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, geologicalUnits: e.target.checked }))
                      }
                      className="accent-indigo-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-3 rounded-sm bg-indigo-500/50 border border-indigo-400 shrink-0" />
                    <span className="font-medium text-slate-300">Geological Units (GSI)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={layers.lineaments}
                      onChange={(e) =>
                        setLayers((prev) => ({ ...prev, lineaments: e.target.checked }))
                      }
                      className="accent-yellow-500 rounded w-3.5 h-3.5"
                    />
                    <div className="w-3 h-0.5 bg-yellow-400 shrink-0" />
                    <span className="font-medium text-slate-300">Structural Lineaments</span>
                  </label>
                </div>
              </div>

              {/* Heatmap Gradient & Opacity */}
              <div className={`p-2.5 rounded-lg border ${borderCard} bg-white/5`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Heatmap Scale
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {Math.round(heatmapOpacity * 100)}%
                  </span>
                </div>
                {/* Smooth Gradient Bar */}
                <div
                  className="w-full h-2 rounded-full mb-2"
                  style={{
                    background: 'linear-gradient(to right, #1e3a8a, #10b981, #eab308, #f97316, #dc2626)',
                  }}
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-2">
                  <span>Low Potential</span>
                  <span>Very High</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Basemap Style Switcher */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-mono">
                  Basemap Source
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'dark', label: 'Dark Matter', icon: '🌑' },
                    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
                    { id: 'light', label: 'Light', icon: '☀️' },
                    { id: 'osm', label: 'Streets', icon: '🗺️' },
                  ].map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => setBaseMapStyle(tile.id as any)}
                      className={`px-2 py-1.5 rounded text-[11px] font-medium border text-left flex items-center gap-1.5 transition-colors ${
                        baseMapStyle === tile.id
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{tile.icon}</span>
                      <span className="truncate">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographical & Operational Filters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Filters
                  </span>
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Reset
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search mine or target..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full text-xs pl-8 pr-2.5 py-1.5 rounded-md border ${
                        isDark
                          ? 'bg-slate-900/90 border-white/15 text-slate-100 placeholder-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* State Select */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className={`w-full text-xs rounded-md px-2 py-1.5 border ${
                        isDark ? 'bg-slate-900 border-white/15 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="All States">All States (National)</option>
                      <option value="Maharashtra">Maharashtra (Nagpur-Bhandara)</option>
                      <option value="Madhya Pradesh">Madhya Pradesh (Balaghat)</option>
                      <option value="Odisha">Odisha (Keonjhar-Sundargarh)</option>
                      <option value="Karnataka">Karnataka (Sandur-Bellary)</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                    </select>
                  </div>

                  {/* Mine Type Select */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Mine Type</label>
                    <select
                      value={selectedMineType}
                      onChange={(e) => setSelectedMineType(e.target.value)}
                      className={`w-full text-xs rounded-md px-2 py-1.5 border ${
                        isDark ? 'bg-slate-900 border-white/15 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="All Types">All Types</option>
                      <option value="Open Cast">Open Cast Only</option>
                      <option value="Underground">Underground Only</option>
                    </select>
                  </div>

                  {/* Confidence Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                      <span>Min Model Confidence</span>
                      <span className="text-amber-400 font-mono font-bold">{minConfidence}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={minConfidence}
                      onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Icon-Only Bar */
            <div className="flex flex-col items-center py-4 space-y-4">
              <button
                onClick={() => setLayers((p) => ({ ...p, prospectivityHeatmap: !p.prospectivityHeatmap }))}
                className={`p-2 rounded-lg ${layers.prospectivityHeatmap ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}
                title="Toggle Heatmap"
              >
                🔥
              </button>
              <button
                onClick={() => setLayers((p) => ({ ...p, manganeseMines: !p.manganeseMines }))}
                className={`p-2 rounded-lg ${layers.manganeseMines ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500'}`}
                title="Toggle Mines"
              >
                ⛏️
              </button>
              <button
                onClick={() => setLayers((p) => ({ ...p, activeEquipment: !p.activeEquipment }))}
                className={`p-2 rounded-lg ${layers.activeEquipment ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}
                title="Toggle Equipment"
              >
                🚜
              </button>
              <button
                onClick={handleResetToIndia}
                className="p-2 rounded-lg text-slate-400 hover:text-amber-400"
                title="Reset Map View"
              >
                🇮🇳
              </button>
            </div>
          )}
        </aside>

        {/* ── CENTER: THE HERO GEOSPATIAL MAP ─────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {/* Floating Map Sub-Header Banner */}
          <div
            className={`absolute top-3 left-4 z-20 px-3.5 py-2 rounded-xl border backdrop-blur-md shadow-xl flex items-center gap-3 ${
              isDark
                ? 'bg-[#111622]/90 border-white/15 text-white'
                : 'bg-white/90 border-slate-200 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight">Reserve Mapping India</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {selectedMine ? selectedMine.name : selectedTarget ? selectedTarget.name : 'National Overview'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Model predictions & prospectivity indicators — not confirmed reserves
              </p>
            </div>
          </div>

          {/* Floating Map Controls (Zoom, Reset Extent, Compass) */}
          <div className="absolute top-3 right-4 z-20 flex flex-col gap-2">
            {/* Compass Card */}
            <div
              className={`p-2 rounded-xl border shadow-lg backdrop-blur-md flex flex-col items-center justify-center ${
                isDark ? 'bg-[#111622]/90 border-white/15' : 'bg-white/90 border-slate-200'
              }`}
              title="North Orientation"
            >
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span className="text-[9px] font-black text-amber-400 mt-0.5">N</span>
            </div>

            {/* Custom Controls */}
            <div
              className={`flex flex-col rounded-xl border shadow-lg backdrop-blur-md overflow-hidden ${
                isDark ? 'bg-[#111622]/90 border-white/15' : 'bg-white/90 border-slate-200'
              }`}
            >
              <button
                onClick={() => setMapZoom((z) => (z ? Math.min(14, z + 1) : 6))}
                className="p-2 hover:bg-white/10 text-slate-200 transition-colors border-b border-white/10"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMapZoom((z) => (z ? Math.max(4, z - 1) : 4))}
                className="p-2 hover:bg-white/10 text-slate-200 transition-colors border-b border-white/10"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetToIndia}
                className="p-2 hover:bg-white/10 text-amber-400 transition-colors"
                title="Reset to Full India Extent"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="flex-1 w-full h-full relative">
            <MapContainer
              center={[22.5, 80.0]}
              zoom={5.2}
              minZoom={4}
              maxZoom={15}
              scrollWheelZoom={true}
              zoomControl={false}
              className="w-full h-full"
            >
              {/* Dynamic Map FlyTo Controller */}
              <MapController
                centerCoords={mapCenter}
                zoomLevel={mapZoom}
                onMapMove={(lat, lng, zoom) => setCurrentCoords({ lat, lng, zoom })}
              />

              {/* Active Basemap Tile Layer */}
              <TileLayer
                url={TILE_PROVIDERS[baseMapStyle].url}
                attribution={TILE_PROVIDERS[baseMapStyle].attribution}
                maxZoom={18}
              />

              {/* ── 1. SMOOTH GEOGRAPHIC PROSPECTIVITY HEATMAP OVERLAYS ─────────── */}
              {layers.prospectivityHeatmap && (
                <>
                  {PROSPECTIVITY_HOTSPOTS_DATA.map((hs) => {
                    const isSelectedHotspot = selectedTarget.region.includes(hs.beltName);
                    // Multi-tier radial rings to create smooth natural GIS gradients
                    return (
                      <React.Fragment key={hs.id}>
                        {/* Outer Dispersion Ring */}
                        <Circle
                          center={hs.center}
                          radius={hs.radiusKm * 1000}
                          pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.12 * heatmapOpacity,
                            stroke: false,
                          }}
                        />
                        {/* Mid-Transition Ring */}
                        <Circle
                          center={hs.center}
                          radius={hs.radiusKm * 650}
                          pathOptions={{
                            color: '#f59e0b',
                            fillColor: '#f59e0b',
                            fillOpacity: 0.28 * heatmapOpacity,
                            stroke: false,
                          }}
                        />
                        {/* Core High-Concentration Hotspot */}
                        <Circle
                          center={hs.center}
                          radius={hs.radiusKm * 320}
                          pathOptions={{
                            color: '#ef4444',
                            fillColor: '#dc2626',
                            fillOpacity: 0.45 * heatmapOpacity,
                            weight: isSelectedHotspot ? 2 : 0,
                            dashArray: isSelectedHotspot ? '4 4' : undefined,
                          }}
                          eventHandlers={{
                            click: () => {
                              const matchTarget =
                                EXPLORATION_TARGETS_DATA.find((t) =>
                                  Math.abs(t.latitude - hs.center[0]) < 0.5
                                ) || EXPLORATION_TARGETS_DATA[0];
                              handleFlyToTarget(matchTarget);
                            },
                          }}
                        >
                          <Popup>
                            <div className="p-2 text-xs">
                              <span className="font-bold text-amber-400 block">{hs.beltName}</span>
                              <span className="text-[10px] text-slate-300 block mt-0.5">{hs.dominantGrade}</span>
                              <span className="text-[9px] text-slate-400 block mt-1">{hs.description}</span>
                            </div>
                          </Popup>
                        </Circle>
                      </React.Fragment>
                    );
                  })}
                </>
              )}

              {/* ── 2. EXPLORATION LICENSES / LEASE BOUNDARIES ─────────────────── */}
              {layers.explorationLicenses &&
                EXPLORATION_LICENSES_DATA.map((lic) => (
                  <Polygon
                    key={lic.id}
                    positions={lic.coordinates}
                    pathOptions={{
                      color: '#f59e0b',
                      weight: 1.5,
                      dashArray: '6 4',
                      fillColor: '#f59e0b',
                      fillOpacity: 0.08,
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-xs">
                        <span className="font-bold text-amber-400 block">{lic.name}</span>
                        <span className="text-[10px] text-slate-300 font-mono block">Code: {lic.code}</span>
                        <span className="text-[10px] text-slate-300 block">Area: {lic.areaSqKm} km²</span>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-1">Status: {lic.status}</span>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

              {/* ── 3. STRUCTURAL GEOLOGICAL LINEAMENTS ───────────────────────── */}
              {layers.lineaments &&
                GEOLOGICAL_LINEAMENTS_DATA.map((lin) => (
                  <Polyline
                    key={lin.id}
                    positions={lin.coordinates}
                    pathOptions={{
                      color: '#eab308',
                      weight: 2,
                      dashArray: '4 4',
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-xs">
                        <span className="font-bold text-yellow-400 block">{lin.name}</span>
                        <span className="text-[10px] text-slate-300 block font-mono">{lin.type}</span>
                      </div>
                    </Popup>
                  </Polyline>
                ))}

              {/* ── 4. EXPLORATION TARGETS PINS ───────────────────────────────── */}
              {filteredTargets.map((tgt) => {
                const isSelected = selectedTarget.id === tgt.id;
                return (
                  <Marker
                    key={tgt.id}
                    position={[tgt.latitude, tgt.longitude]}
                    icon={createTargetIcon(tgt, isSelected)}
                    eventHandlers={{
                      click: () => handleFlyToTarget(tgt),
                    }}
                  >
                    <Popup>
                      <div className="p-2.5 text-xs min-w-[200px]">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-red-400">Target #{tgt.rank}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                            {tgt.prospectivityLevel}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm leading-tight">{tgt.name}</h4>
                        <p className="text-[11px] text-slate-300 mt-1">{tgt.region}, {tgt.state}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[10px]">
                          <div>
                            <span className="text-slate-400 block">Priority Score</span>
                            <span className="text-amber-400 font-bold text-xs">{tgt.priorityScore}/100</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Confidence</span>
                            <span className="text-emerald-400 font-bold text-xs">{tgt.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* ── 5. MANGANESE MINES PINS ───────────────────────────────────── */}
              {layers.manganeseMines &&
                filteredMines.map((mine) => {
                  const isSelected = selectedMine?.id === mine.id;
                  return (
                    <Marker
                      key={mine.id}
                      position={[mine.latitude, mine.longitude]}
                      icon={createMineIcon(mine, isSelected)}
                      eventHandlers={{
                        click: () => handleFlyToMine(mine),
                      }}
                    >
                      <Popup>
                        <div className="p-2.5 text-xs min-w-[220px]">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-purple-400">{mine.shortCode}</span>
                            {mine.isPilot && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                                PILOT HUB
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-sm">{mine.name}</h4>
                          <p className="text-[11px] text-slate-300">{mine.location}</p>
                          <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Type:</span>
                              <span className="text-slate-200 font-medium">{mine.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Avg Ore Grade:</span>
                              <span className="text-amber-300 font-medium">{mine.gradePct}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Est. Reserves:</span>
                              <span className="text-emerald-400 font-medium">
                                {(mine.estimatedReserveTons / 1000000).toFixed(1)} M Tonnes
                              </span>
                            </div>
                          </div>
                          {mine.isPilot && (
                            <button
                              onClick={() => onNavigate('dongri-buzurg-workspace')}
                              className="w-full mt-2.5 py-1 text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[11px] transition-colors"
                            >
                              Launch Pilot Workspace →
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* ── 6. ACTIVE FLEET EQUIPMENT PINS ────────────────────────────── */}
              {layers.activeEquipment &&
                ACTIVE_EQUIPMENT_DATA.map((eq) => (
                  <Marker
                    key={eq.id}
                    position={[eq.latitude, eq.longitude]}
                    icon={createEquipmentIcon(eq)}
                  >
                    <Popup>
                      <div className="p-2 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-cyan-400">{eq.tag}</span>
                          <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                            {eq.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300">{eq.mineName}</p>
                        <p className="text-[9px] text-slate-400 mt-1">Operator: {eq.operator}</p>
                        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[9px] font-mono grid grid-cols-2 gap-1 text-slate-300">
                          <span>Load: {eq.telemetry.engineLoadPct}%</span>
                          <span>Fuel: {eq.telemetry.fuelLevelPct}%</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {/* Floating Bottom Left: Coordinates & Map Legend */}
          <div className="absolute bottom-12 left-4 z-20 flex flex-col gap-2">
            {/* Live GPS Coordinates Pill */}
            <div
              className={`px-3 py-1.5 rounded-lg border backdrop-blur-md font-mono text-[10px] shadow-lg flex items-center gap-2 ${
                isDark ? 'bg-[#111622]/90 border-white/15 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'
              }`}
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                {currentCoords.lat.toFixed(4)}°N · {currentCoords.lng.toFixed(4)}°E · Zoom {currentCoords.zoom.toFixed(1)}x
              </span>
            </div>

            {/* Compact Map Legend Box */}
            <div
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl text-xs space-y-1.5 ${
                isDark ? 'bg-[#111622]/90 border-white/15 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                Map Legend
              </span>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Manganese Mine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Equipment (Active)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-amber-500 border-dashed rounded-sm" />
                  <span>Exploration License</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-yellow-400" />
                  <span>Lineament Fault</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Bottom Bar: Major Mn Belts Summary Strip */}
          <div
            className={`h-9 shrink-0 flex items-center justify-between px-4 border-t z-20 overflow-x-auto text-[11px] ${
              isDark
                ? 'bg-[#10141d]/95 border-white/10 text-slate-300'
                : 'bg-white/95 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-4 shrink-0 font-medium">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                Major Mn Belts:
              </span>
              <button
                onClick={() => {
                  setMapCenter([21.75, 79.85]);
                  setMapZoom(9);
                }}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Central India (Balaghat-Nagpur-Bhandara)</span>
              </button>
              <button
                onClick={() => {
                  setMapCenter([21.95, 85.42]);
                  setMapZoom(8.5);
                }}
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Odisha Belt (Keonjhar-Sundargarh)</span>
              </button>
              <button
                onClick={() => {
                  setMapCenter([15.08, 76.55]);
                  setMapZoom(8.5);
                }}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Karnataka Belt (Bellary-Sandur)</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
              <Satellite className="w-3 h-3 text-cyan-400" />
              <span>Sentinel-2 L2A & ASTER TIR Validated</span>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL: Evidence, ML Explainability & Target Ranking ──────── */}
        <aside
          className={`w-80 shrink-0 z-20 flex flex-col border-l ${bgPanel} overflow-hidden`}
        >
          {/* Tabs Navigation */}
          <div className={`flex shrink-0 border-b ${borderCard}`}>
            {[
              { id: 'zone', label: 'Zone Detail' },
              { id: 'targets', label: 'Targets' },
              { id: 'spectral', label: 'Spectral' },
              { id: 'info', label: 'Info' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id as any)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                  rightTab === tab.id
                    ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* ── TAB 1: ZONE DETAIL & WHY THIS PREDICTION ─────────────────────── */}
            {rightTab === 'zone' && (
              <div className="space-y-4">
                {/* Selected Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">
                      Exploration Target #{selectedTarget.rank}
                    </span>
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                        selectedTarget.prospectivityLevel === 'Very High'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : selectedTarget.prospectivityLevel === 'High'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {selectedTarget.prospectivityLevel}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold leading-tight ${textHeader}`}>
                    {selectedTarget.name}
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                    {selectedTarget.region} • {selectedTarget.state}
                  </p>
                </div>

                {/* Score & Confidence KPI Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 text-center`}>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Priority Score
                    </span>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {selectedTarget.priorityScore}
                      <span className="text-xs text-slate-400 font-normal"> /100</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 text-center`}>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                      Confidence
                    </span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {selectedTarget.confidence}%
                    </div>
                    <span className="text-[9px] text-emerald-300 font-medium">
                      {selectedTarget.uncertainty} Uncertainty
                    </span>
                  </div>
                </div>

                {/* Model Prospectivity Gauge */}
                <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 space-y-1.5`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Model Prospectivity</span>
                    <span className="text-red-400 font-bold font-mono">
                      {selectedTarget.modelProspectivityPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${selectedTarget.modelProspectivityPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    Engine: {SATELLITE_ACQUISITION_METADATA.aiModelEngine}
                  </span>
                </div>

                {/* Why This Prediction? (Contributing Factors) */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                    Why This Prediction? (Evidence)
                  </span>
                  <div className="space-y-2">
                    {selectedTarget.reasons.map((r, i) => (
                      <div key={i} className={`p-2.5 rounded-lg border ${borderCard} bg-white/5 space-y-1`}>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              r.tag === 'Spectral'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : r.tag === 'Structural'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : r.tag === 'Geology'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {r.tag}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">
                            {Math.round(r.strength * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 leading-snug">{r.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearest Mines */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                    Nearest Manganese Mines
                  </span>
                  <div className="space-y-1.5">
                    {selectedTarget.nearestMines.map((m, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-lg border ${borderCard} bg-white/5 text-[11px]`}
                      >
                        <span className="font-medium text-slate-200">{m.name}</span>
                        <span className="text-amber-400 font-mono font-bold">{m.distanceKm} km</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Next Step */}
                <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                    Recommended Action
                  </span>
                  <p className="text-xs font-bold text-white">{selectedTarget.recommendedStep}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedTarget.recommendation}
                  </p>
                </div>

                {/* Validation Status Checklist */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                    Validation Status — {selectedTarget.name}
                  </span>
                  <div className="space-y-1.5">
                    {selectedTarget.validation.map((v, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 p-2 rounded-lg border ${borderCard} bg-white/5 text-[11px]`}
                      >
                        {v.status ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className={v.status ? 'text-slate-200' : 'text-slate-400'}>
                          {v.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: EXPLORATION TARGETS RANKING ──────────────────────────── */}
            {rightTab === 'targets' && (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Ranked AI Exploration Targets
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Prioritized using multi-spectral, gravity/magnetics & structural proxies.
                  </p>
                </div>

                <div className="space-y-2">
                  {filteredTargets.map((tgt) => (
                    <div
                      key={tgt.id}
                      onClick={() => handleFlyToTarget(tgt)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTarget.id === tgt.id
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-400">#{tgt.rank}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            tgt.prospectivityLevel === 'Very High'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {tgt.prospectivityLevel}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-sm leading-tight">{tgt.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tgt.region}, {tgt.state}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] font-mono">
                        <span className="text-slate-300">Score: {tgt.priorityScore}/100</span>
                        <span className="text-emerald-400">{tgt.confidence}% Confidence</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5-Step Exploration Workflow Card */}
                <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 space-y-2`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block">
                    AI Exploration Pipeline
                  </span>
                  {[
                    '1. Satellite & Multi-Spectral Ingestion',
                    '2. Structural & Fault Axis Proxies',
                    '3. XGBoost Prospectivity Inference',
                    '4. Confidence & Drill Plan Optimization',
                    '5. Resource Block Conversion',
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: SPECTRAL & SATELLITE TELEMETRY ───────────────────────── */}
            {rightTab === 'spectral' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Spectral Signature Profile
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sentinel-2 L2A BOA Reflectance over {selectedTarget.name}
                  </p>
                </div>

                {/* Custom SVG Reflectance Chart */}
                <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 space-y-2`}>
                  <div className="h-32 w-full flex items-end justify-between gap-1 pt-4 pb-1">
                    {SPECTRAL_REFLECTANCE_DATA.map((band, idx) => {
                      const heightPct = (band.reflectance / 0.35) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on Hover */}
                          <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded shadow border border-white/20 whitespace-nowrap z-30">
                            {band.reflectance.toFixed(3)}
                          </div>
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-amber-600 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[8px] font-mono text-slate-400 truncate w-full text-center">
                            {band.band.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/10">
                    <span>490nm (VNIR)</span>
                    <span>2190nm (SWIR-2)</span>
                  </div>
                </div>

                {/* Spectral Indices Breakdown */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block font-mono">
                    Mineral Indices
                  </span>
                  <div className="space-y-1.5">
                    {SPECTRAL_INDICES_METRICS.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border ${borderCard} bg-white/5 space-y-0.5`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-amber-400 font-mono">{item.name}</span>
                          <span className="font-mono font-bold text-white">{item.value}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Satellite Acquisition Telemetry */}
                <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 space-y-1.5 text-[10px]`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Acquisition Telemetry
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary:</span>
                      <span className="font-mono">{SATELLITE_ACQUISITION_METADATA.primaryConstellation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pass Time:</span>
                      <span className="font-mono">{SATELLITE_ACQUISITION_METADATA.acquisitionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CRS:</span>
                      <span className="font-mono">{SATELLITE_ACQUISITION_METADATA.crs}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: METHODOLOGY & INFO ──────────────────────────────────── */}
            {rightTab === 'info' && (
              <div className="space-y-3 text-slate-300">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Methodology & Architecture
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1">
                    SIH Problem Statement 26009
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    AI/ML and Space Technology framework designed for MOIL Limited to identify manganese reserve extensions and mitigate operational production shortfalls.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${borderCard} bg-white/5 space-y-2`}>
                  <span className="text-[10px] font-bold text-amber-400 font-mono block">
                    Data Fusion Layers
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Combines Sentinel-2 multi-spectral absorption bands, ASTER thermal inertia, Sentinel-1 SAR moisture proxies, GSI digitized geological maps, and historical borehole assays.
                  </p>
                </div>

                {/* Important Prototype Notice */}
                <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Scientific Disclaimer</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    The displayed prospectivity values represent AI model predictions and simulated exploration proxies. Confirmed reserve estimation requires statutory UNFC / JORC compliant drilling and borehole assay validation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
