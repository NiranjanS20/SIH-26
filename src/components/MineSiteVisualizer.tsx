// ==============================================================================
// MOIL Mine Intelligence View Component (TERRAIN, SATELLITE, INTELLIGENCE)
// Provides mine-specific, data-driven visualizations for each selected mine.
// ==============================================================================

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { TILE_PROVIDERS } from '../data/reserveMappingData';
import {
  getMineIntelligenceProfile,
  type ProspectivityZone,
} from '../data/mineIntelligenceData';
import {
  Mountain,
  Satellite,
  Sparkles,
  Target,
  Truck,
  CheckCircle2,
  Info,
} from 'lucide-react';

export type IntelligenceMode = 'TERRAIN' | 'SATELLITE' | 'INTELLIGENCE';

interface MineSiteVisualizerProps {
  mineId: string;
  themeMode?: 'dark' | 'light';
  onSelectZone?: (zone: ProspectivityZone) => void;
}

export const MineSiteVisualizer: React.FC<MineSiteVisualizerProps> = ({
  mineId,
  themeMode = 'dark',
  onSelectZone,
}) => {
  const [activeMode, setActiveMode] = useState<IntelligenceMode>('INTELLIGENCE');
  const [selectedSatelliteLayerId, setSelectedSatelliteLayerId] = useState<string>('TRUE_COLOR');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDrillHoleId, setSelectedDrillHoleId] = useState<string | null>(null);
  const [hoveredEquipmentId, setHoveredEquipmentId] = useState<string | null>(null);

  const isDark = themeMode === 'dark';
  const profile = getMineIntelligenceProfile(mineId);

  // Default active zone if none explicitly selected
  const activeZone =
    profile.prospectivityZones.find((z) => z.id === selectedZoneId) ||
    profile.prospectivityZones[0] ||
    null;

  const activeDrillHole = profile.drillHoles.find((d) => d.id === selectedDrillHoleId) || null;

  const coords: [number, number] = [profile.latitude, profile.longitude];

  // Mine center custom leaflet pin
  const minePinIcon = L.divIcon({
    className: 'mine-center-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px rgba(245, 158, 11, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 13px;
        cursor: pointer;
      ">
        ⛏
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="space-y-3 pt-1">
      {/* Header with Title and Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            MINE INTELLIGENCE VIEW
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
            isDark ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-slate-100 border-slate-300 text-[#002452]'
          }`}>
            {profile.shortCode} • {profile.type.toUpperCase()}
          </span>
        </div>

        {/* 3 Main Modes */}
        <div className={`flex items-center gap-1 p-1 rounded-lg border shadow-sm ${
          isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveMode('TERRAIN')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'TERRAIN'
                ? 'bg-[#0E7C7B] text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setActiveMode('SATELLITE')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'SATELLITE'
                ? 'bg-blue-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => setActiveMode('INTELLIGENCE')}
            className={`px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'INTELLIGENCE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-1 ring-amber-300'
                : isDark
                ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligence</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Container */}
      <div
        className={`w-full rounded-xl border relative overflow-hidden shadow-xl ${
          isDark ? 'bg-[#0F1218] border-white/15' : 'bg-slate-900 border-slate-700'
        }`}
        style={{ height: '280px' }}
      >
        {/* ========================================================================= */}
        {/* 1. TERRAIN MODE                                                           */}
        {/* ========================================================================= */}
        {activeMode === 'TERRAIN' && (
          <div className="w-full h-full relative p-3 flex flex-col justify-between select-none">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <svg viewBox="0 0 540 210" className="w-full h-full relative z-10">
              {/* Mine Contours */}
              {profile.terrainData.contours.map((contour, idx) => (
                <g key={idx}>
                  <path
                    d={contour.pathD}
                    fill="none"
                    stroke={contour.color}
                    strokeWidth={contour.type === 'ore_face' ? '2.4' : '1.4'}
                    strokeDasharray={contour.type === 'crest' || contour.type === 'sump' ? '4 2' : undefined}
                    opacity="0.9"
                  />
                  <text
                    x="25"
                    y={32 + idx * 36}
                    fill={contour.color}
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {contour.label}
                  </text>
                </g>
              ))}

              {/* Haul Roads */}
              {profile.terrainData.haulRoads.map((road, idx) => (
                <g key={idx}>
                  <path
                    d={road.pathD}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    opacity="0.75"
                  />
                  <path
                    d={road.pathD}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                </g>
              ))}

              {/* Equipment Assets Pins */}
              {profile.terrainData.equipmentAssets.map((eq) => {
                const isHovered = hoveredEquipmentId === eq.id;
                return (
                  <g
                    key={eq.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEquipmentId(eq.id)}
                    onMouseLeave={() => setHoveredEquipmentId(null)}
                  >
                    <circle
                      cx={eq.x}
                      cy={eq.y}
                      r={isHovered ? 7 : 5}
                      fill={eq.status === 'ACTIVE' ? '#10B981' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={eq.x + 8}
                      y={eq.y - 12}
                      width={eq.name.length * 5.8 + 14}
                      height="18"
                      rx="3"
                      fill="rgba(15,23,42,0.9)"
                      stroke={isHovered ? '#F59E0B' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1"
                    />
                    <text
                      x={eq.x + 14}
                      y={eq.y}
                      fill="#F8FAFC"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {eq.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Status Bar */}
            <div className="relative z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Truck className="w-3 h-3 text-emerald-400" />
                <span>
                  {profile.terrainData.equipmentAssets.length} Active Fleet Assets · Elevation Range:{' '}
                  {profile.terrainData.elevationRangeM.min}m to +{profile.terrainData.elevationRangeM.max}m MSL
                </span>
              </span>
              <span className="text-amber-400 font-bold">
                LEASE AREA: {profile.leaseAreaHa} Ha
              </span>
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

        {/* ========================================================================= */}
        {/* 3. INTELLIGENCE MODE (Decision Support, Zones, Drill Holes, Evidence)    */}
        {/* ========================================================================= */}
        {activeMode === 'INTELLIGENCE' && (
          <div className="w-full h-full relative p-3 flex flex-col justify-between select-none">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <svg viewBox="0 0 540 210" className="w-full h-full relative z-10">
              {/* Structural Faults / Axes */}
              {profile.structuralFeatures.map((feat, idx) => (
                <g key={idx}>
                  <path
                    d={feat.trendLineD}
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    opacity="0.8"
                  />
                  <text
                    x="28"
                    y={195 - idx * 20}
                    fill="#F472B6"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    -- {feat.name} ({feat.strike} / {feat.dip})
                  </text>
                </g>
              ))}

              {/* Prospectivity Zones (Interactive Polygons) */}
              {profile.prospectivityZones.map((zone) => {
                const isSelected = activeZone?.id === zone.id;
                return (
                  <g
                    key={zone.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setSelectedDrillHoleId(null);
                      if (onSelectZone) onSelectZone(zone);
                    }}
                  >
                    <path
                      d={zone.polygonD}
                      fill="#F59E0B"
                      fillOpacity={isSelected ? 0.35 : 0.18}
                      stroke={isSelected ? '#F59E0B' : '#D97706'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeDasharray={isSelected ? undefined : '5 3'}
                    />
                    <text
                      x="230"
                      y={zone.id === profile.prospectivityZones[0].id ? 72 : 42}
                      fill="#FDE68A"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ★ {zone.name} ({zone.scorePct}%)
                    </text>
                  </g>
                );
              })}

              {/* Drill Hole Pins (Interactive) */}
              {profile.drillHoles.map((dh) => {
                const isSelected = selectedDrillHoleId === dh.id;
                return (
                  <g
                    key={dh.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedDrillHoleId(dh.id);
                    }}
                  >
                    <circle
                      cx={dh.x}
                      cy={dh.y}
                      r={isSelected ? 7 : 5}
                      fill={dh.status === 'CONFIRMED_ORE' ? '#38BDF8' : '#F59E0B'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />
                    <rect
                      x={dh.x + 8}
                      y={dh.y - 10}
                      width="60"
                      height="16"
                      rx="3"
                      fill="rgba(15,23,42,0.9)"
                      stroke={isSelected ? '#38BDF8' : 'rgba(255,255,255,0.2)'}
                    />
                    <text
                      x={dh.x + 12}
                      y={dh.y + 1}
                      fill="#FFFFFF"
                      fontSize="7.5"
                      fontWeight="bold"
                    >
                      {dh.holeCode}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Intelligence HUD Bar */}
            <div className="relative z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Target className="w-3 h-3 text-amber-400" />
                <span>
                  {profile.prospectivityZones.length} PROSPECTIVITY ZONES · {profile.drillHoles.length} CONFIRMED DRILL INTERCEPTS
                </span>
              </span>
              <span className="text-slate-400">
                FORMATION: <strong className="text-slate-200">{profile.geologicalFormation}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EVIDENCE & DETAILS PANEL (Updates when Zone or Drillhole is selected)     */}
      {/* ========================================================================= */}
      {activeMode === 'INTELLIGENCE' && activeZone && (
        <div
          className={`p-3.5 rounded-xl border space-y-2.5 transition-all duration-300 animate-in fade-in ${
            isDark ? 'bg-[#141820] border-amber-500/30' : 'bg-amber-500/5 border-amber-500/30 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                ACTIVE TARGET
              </span>
              <h4 className={`text-xs font-black uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeDrillHole ? `${activeDrillHole.holeCode} Drill Intercept` : activeZone.name}
              </h4>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-slate-400">
                Score:{' '}
                <strong className="text-amber-400 font-bold">
                  {activeDrillHole ? `${activeDrillHole.avgGradePct}% Mn` : `${activeZone.scorePct}%`}
                </strong>
              </span>
              <span className="text-slate-400">
                Confidence:{' '}
                <strong className="text-emerald-400 font-bold">
                  {activeZone.confidencePct}%
                </strong>
              </span>
              <span className="text-slate-400">
                Est. Ore:{' '}
                <strong className="text-blue-400 font-bold">
                  {activeZone.estimatedTonnageKt} kt
                </strong>
              </span>
            </div>
          </div>

          {/* Drillhole Detail if selected */}
          {activeDrillHole ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block">TOTAL DEPTH</span>
                <span className="font-bold text-slate-200">{activeDrillHole.depthM} m</span>
              </div>
              <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block">ORE INTERCEPT</span>
                <span className="font-bold text-emerald-400">{activeDrillHole.interceptLengthM} m @ {activeDrillHole.avgGradePct}% Mn</span>
              </div>
              <div className={`p-2 rounded border ${isDark ? 'bg-black/30 border-white/10' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 block">MINERALIZATION</span>
                <span className="font-bold text-amber-400">{activeDrillHole.mineralization}</span>
              </div>
            </div>
          ) : (
            /* Multi-Source Evidence Points */
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-400" />
                <span>DECISION-SUPPORT EVIDENCE BASE</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {activeZone.evidence.map((ev, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-1.5 text-[11px] p-1.5 rounded border ${
                      isDark ? 'bg-black/20 border-white/5 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Recommendation */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
            <span>
              Recommendation: <strong className="text-amber-400">{activeZone.recommendedAction}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
