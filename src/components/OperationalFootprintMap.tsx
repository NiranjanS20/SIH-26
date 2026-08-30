// ==============================================================================
// MOIL Operational Footprint & Location Map (Interactive Leaflet Geospatial Map)
// Replaces the old SVG mockup with a live, realistic interactive GIS map
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polygon,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MANGANESE_MINES_DATA,
  PROSPECTIVITY_HOTSPOTS_DATA,
  EXPLORATION_LICENSES_DATA,
  TILE_PROVIDERS,
  type MineGeoLocation,
} from '../data/reserveMappingData';
import { type SatelliteMode, SATELLITE_MODES } from './ReserveMappingPage';
import { Layers, ZoomIn, ZoomOut, Target } from 'lucide-react';

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

// Controller to smoothly pan & fly to state or selected mine
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
}

// State bounding boxes and zoom centers
const STATE_VIEWPORTS: Record<string, { center: [number, number]; zoom: number }> = {
  ALL: { center: [22.5, 80.0], zoom: 5.2 },
  Maharashtra: { center: [21.554, 79.702], zoom: 8.5 },
  'Madhya Pradesh': { center: [21.870, 80.185], zoom: 8.5 },
  Odisha: { center: [21.950, 85.420], zoom: 8.0 },
  Karnataka: { center: [15.085, 76.550], zoom: 8.0 },
  'Andhra Pradesh': { center: [18.250, 83.500], zoom: 8.5 },
};

export const OperationalFootprintMap: React.FC<OperationalFootprintMapProps> = ({
  selectedState,
  selectedFilter,
  hoveredMineId,
  onSelectMine,
  themeMode = 'dark',
  onLaunchWorkspace,
}) => {
  const [activeLayer, setActiveLayer] = useState<SatelliteMode>('TRUE_COLOR');
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.554, 79.702]);
  const [mapZoom, setMapZoom] = useState<number>(7.5);

  const isDark = themeMode === 'dark';

  // React to selectedState changes
  useEffect(() => {
    const target = STATE_VIEWPORTS[selectedState] || STATE_VIEWPORTS.ALL;
    setMapCenter(target.center);
    setMapZoom(target.zoom);
  }, [selectedState]);

  // React to hovered mine from external list
  useEffect(() => {
    if (hoveredMineId) {
      const match = MANGANESE_MINES_DATA.find((m) => m.id === hoveredMineId);
      if (match) {
        setMapCenter([match.latitude, match.longitude]);
      }
    }
  }, [hoveredMineId]);

  const filteredMines = MANGANESE_MINES_DATA.filter((mine) => {
    if (selectedState !== 'ALL' && mine.state !== selectedState) return false;
    if (selectedFilter === 'ACTIVE_PILOT' && !mine.isPilot) return false;
    if (selectedFilter === 'EXPLORATION' && mine.status !== 'Exploration Phase') return false;
    return true;
  });

  const createMarkerIcon = (mine: MineGeoLocation, isHovered: boolean) => {
    const isPilot = mine.isPilot;
    const size = isHovered ? 38 : isPilot ? 32 : 26;
    const bgGrad = isPilot
      ? 'background: linear-gradient(135deg, #f59e0b, #d97706);'
      : 'background: linear-gradient(135deg, #3b82f6, #1d4ed8);';
    const border = isHovered
      ? 'border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(245, 158, 11, 0.9);'
      : isPilot
      ? 'border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);'
      : 'border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 2px 6px rgba(0,0,0,0.5);';

    return L.divIcon({
      className: 'moil-mine-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          ${bgGrad}
          ${border}
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: ${size * 0.38}px;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ⛏
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden border relative flex flex-col shadow-xl ${
        isDark ? 'bg-[#121620] border-white/10' : 'bg-white border-slate-200'
      }`}
      style={{ height: '580px' }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-400 flex items-center justify-between pointer-events-none gap-2">
        {/* Layer Selector Chips */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-lg overflow-x-auto max-w-[85%]">
          <div className="px-2 text-[9px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1 shrink-0">
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Layer:</span>
          </div>
          {SATELLITE_MODES.map((mode) => {
            const isActive = activeLayer === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveLayer(mode.id)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300 font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="pointer-events-auto flex items-center rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-lg overflow-hidden shrink-0">
          <button
            onClick={() => setMapZoom((z) => Math.min(15, z + 1))}
            className="p-2 text-slate-200 hover:bg-white/15 transition-colors cursor-pointer border-r border-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(4, z - 1))}
            className="p-2 text-slate-200 hover:bg-white/15 transition-colors cursor-pointer border-r border-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              const target = STATE_VIEWPORTS[selectedState] || STATE_VIEWPORTS.ALL;
              setMapCenter(target.center);
              setMapZoom(target.zoom);
            }}
            className="p-2 text-amber-400 hover:bg-white/15 transition-colors cursor-pointer"
            title="Reset State View"
          >
            <Target className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend / Status HUD */}
      <div className="absolute bottom-3 left-3 z-400 pointer-events-none flex flex-col gap-1.5 text-[10px] font-mono">
        <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-slate-200 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {filteredMines.length} MOIL Mines Visible • State:{' '}
            <strong className="text-amber-400">{selectedState}</strong>
          </span>
        </div>
      </div>

      {/* Leaflet MapContainer */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={4}
        maxZoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        <MapViewController center={mapCenter} zoom={mapZoom} />

        {/* High-Resolution Satellite Basemap */}
        <TileLayer
          url={TILE_PROVIDERS.satellite.url}
          attribution={TILE_PROVIDERS.satellite.attribution}
          maxZoom={18}
        />

        {/* Satellite Prospectivity & Radiance Overlays */}
        {activeLayer !== 'TRUE_COLOR' &&
          PROSPECTIVITY_HOTSPOTS_DATA.map((hs) => {
            const isThermal = activeLayer === 'THERMAL_LST';
            const isMoisture = activeLayer === 'SOIL_MOISTURE';
            const isNdvi = activeLayer === 'NDVI_VEGETATION';

            const outerColor = isThermal
              ? '#3b82f6'
              : isMoisture
              ? '#0284c7'
              : isNdvi
              ? '#15803d'
              : '#d97706';

            const coreColor = isThermal
              ? '#ef4444'
              : isMoisture
              ? '#06b6d4'
              : isNdvi
              ? '#eab308'
              : '#ef4444';

            return (
              <React.Fragment key={hs.id}>
                <Circle
                  center={hs.center}
                  radius={hs.radiusKm * 1000}
                  pathOptions={{
                    color: outerColor,
                    fillColor: outerColor,
                    fillOpacity: 0.18,
                    stroke: false,
                  }}
                />
                <Circle
                  center={hs.center}
                  radius={hs.radiusKm * 320}
                  pathOptions={{
                    color: coreColor,
                    fillColor: coreColor,
                    fillOpacity: 0.6,
                    weight: 2,
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

        {/* Exploration Lease Boundaries */}
        {EXPLORATION_LICENSES_DATA.map((lic) => (
          <Polygon
            key={lic.id}
            positions={lic.coordinates}
            pathOptions={{
              color: '#f59e0b',
              weight: 1.5,
              dashArray: '4 4',
              fillColor: '#f59e0b',
              fillOpacity: 0.08,
            }}
          />
        ))}

        {/* Manganese Mine Markers */}
        {filteredMines.map((mine) => {
          const isHovered = hoveredMineId === mine.id;
          return (
            <Marker
              key={mine.id}
              position={[mine.latitude, mine.longitude]}
              icon={createMarkerIcon(mine, isHovered)}
              eventHandlers={{
                click: () => onSelectMine(mine),
              }}
            >
              <Popup>
                <div className="p-3 text-xs min-w-[220px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                      {mine.shortCode}
                    </span>
                    <span className="text-[9px] text-slate-300 font-semibold">{mine.type}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{mine.name}</h4>
                    <p className="text-[11px] text-slate-300">{mine.location}</p>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-[10px] space-y-1">
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
                  <button
                    onClick={() => onLaunchWorkspace && onLaunchWorkspace(mine.id)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md text-center block"
                  >
                    Open Mine Workspace →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
