import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  UNIFIED_MAP_STYLE,
  getMineBoundary,
  getMinePitZones,
  getMinePitBoundary,
  getMineFaultLines,
  getMineRasterHeatmapBounds,
  getMineWorldMask,
  FILTER_MODES,
  CONFIDENCE_BAND_COLORS,
  STRUCTURAL_LINE_COLORS,
} from '../lib/prospectivityMapConfig';
import type { ProspectivityFilterMode, MineBoundaryConfig } from '../lib/prospectivityMapConfig';
import {
  Mountain,
  Maximize2,
  Minimize2,
  Crosshair,
  Compass,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
  Map as MapIcon,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

// Static worker registration for MapLibre in Vite
if (typeof window !== 'undefined') {
  if (typeof (maplibregl as any).setWorkerUrl === 'function') {
    (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
  }
}


interface MapLibreProspectivityCanvasProps {
  selectedMineName?: string;
  isDark?: boolean;
  crossSectionActive: boolean;
  onToggleCrossSection: () => void;
  selectedPoint: { lat: number; lng: number; siteName?: string; zoneName?: string } | null;
  onSelectPoint: (point: { lat: number; lng: number; siteName?: string; zoneName?: string }) => void;
}

export default function MapLibreProspectivityCanvas({
  selectedMineName = 'Dongri Buzurg Mine',
  isDark = true,
  crossSectionActive,
  onToggleCrossSection,
  selectedPoint,
  onSelectPoint,
}: MapLibreProspectivityCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // View Mode: 2D Flat Image View vs 3D Terrain DEM View
  const [viewDimension, setViewDimension] = useState<'2D' | '3D'>('2D');

  // Filter Mode Dropdown (Standard: Prospectivity, NDVI, Soil Moisture, LST, Elevation)
  const [activeFilter, setActiveFilter] = useState<ProspectivityFilterMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const f = params.get('filter') as ProspectivityFilterMode;
      if (f && ['prospectivity', 'ndvi', 'soil_moisture', 'lst', 'elevation'].includes(f)) {
        return f;
      }
    }
    return 'prospectivity';
  });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);

  // Layer Toggles
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showFaults, setShowFaults] = useState<boolean>(true);
  const [showPitBoundary, setShowPitBoundary] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState<string | null>(null);

  const mineConfig: MineBoundaryConfig = getMineBoundary(selectedMineName);
  const filterConfig = FILTER_MODES[activeFilter];

  // Set up GeoJSON vector layers & Continuous Raster Heatmap overlay
  const setupLayers = useCallback((map: maplibregl.Map, config: MineBoundaryConfig) => {
    if (!map) return;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. TRUE RASTER HEATMAP OVERLAY: Draped multispectral image over pit
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const rasterInfo = getMineRasterHeatmapBounds(config, activeFilter);
      const existingRasterSource = map.getSource('pit-raster-heatmap-source') as any;

      if (existingRasterSource && existingRasterSource.updateImage) {
        existingRasterSource.updateImage({
          url: rasterInfo.url,
          coordinates: rasterInfo.coordinates,
        });
      } else if (!existingRasterSource) {
        map.addSource('pit-raster-heatmap-source', {
          type: 'image',
          url: rasterInfo.url,
          coordinates: rasterInfo.coordinates,
        });

        map.addLayer({
          id: 'pit-raster-heatmap-layer',
          type: 'raster',
          source: 'pit-raster-heatmap-source',
          paint: {
            'raster-opacity': filterConfig.fillOpacity,
            'raster-hue-rotate': 0,
            'raster-contrast': 0.10,
            'raster-saturation': 0.10,
            'raster-fade-duration': 200,
          },
        });
      }
    } catch (err) {
      console.warn('Raster heatmap setup notice:', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1b. WORLD MASK: Completely removes the extra map outside the mine heatmap
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const maskData = getMineWorldMask(config);
      const existingMaskSource = map.getSource('mine-world-mask-source') as maplibregl.GeoJSONSource;
      if (existingMaskSource) {
        existingMaskSource.setData(maskData);
      } else {
        map.addSource('mine-world-mask-source', {
          type: 'geojson',
          data: maskData,
        });

        // Mask layer covering all terrain outside the mine
        map.addLayer({
          id: 'mine-world-mask-layer',
          type: 'fill',
          source: 'mine-world-mask-source',
          paint: {
            'fill-color': '#020617', // Dark slate backdrop
            'fill-opacity': 1.0,
          },
        });

        // Clean border along the edge of the mine square
        map.addLayer({
          id: 'mine-world-mask-border',
          type: 'line',
          source: 'mine-world-mask-source',
          paint: {
            'line-color': '#0e7490',
            'line-width': 2.0,
            'line-opacity': 0.75,
          },
        });
      }
    } catch (err) {
      console.warn('World mask setup notice:', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. PIT SHELL / QUARRY RIM BOUNDARY: Vibrant Yellow Dashed Line
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const boundaryData = getMinePitBoundary(config);
      const existingBoundarySource = map.getSource('mine-pit-boundary-source') as maplibregl.GeoJSONSource;
      if (existingBoundarySource) {
        existingBoundarySource.setData(boundaryData);
      } else {
        map.addSource('mine-pit-boundary-source', {
          type: 'geojson',
          data: boundaryData,
        });

        map.addLayer({
          id: 'mine-pit-boundary-layer',
          type: 'line',
          source: 'mine-pit-boundary-source',
          paint: {
            'line-color': '#facc15', // High-visibility Yellow Pit Rim
            'line-width': 3.5,
            'line-dasharray': [4, 2],
            'line-opacity': 0.95,
          },
        });
      }
    } catch (err) {
      console.warn('Pit boundary setup notice:', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. STRUCTURAL FAULTS & SHEAR LINES: Bold Crimson Red & Amber Dashed Lines
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const faultData = getMineFaultLines(config);
      const existingFaultSource = map.getSource('structural-lines-source') as maplibregl.GeoJSONSource;
      if (existingFaultSource) {
        existingFaultSource.setData(faultData);
      } else {
        map.addSource('structural-lines-source', {
          type: 'geojson',
          data: faultData,
        });

        map.addLayer({
          id: 'structural-lines-layer',
          type: 'line',
          source: 'structural-lines-source',
          paint: {
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.8, 14, 4.0, 17, 5.5],
            'line-color': [
              'match',
              ['get', 'structure_type'],
              'fault', STRUCTURAL_LINE_COLORS.fault,
              'shear_zone', STRUCTURAL_LINE_COLORS.shear_zone,
              'fold_axis', STRUCTURAL_LINE_COLORS.fold_axis,
              STRUCTURAL_LINE_COLORS.default,
            ],
            'line-opacity': 0.95,
            'line-dasharray': [4, 2],
          },
        });

        map.on('click', 'structural-lines-layer', (e: any) => {
          if (!e.features || !e.features[0]) return;
          const props = e.features[0].properties || {};
          if (popupRef.current) popupRef.current.remove();

          popupRef.current = new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family: sans-serif; padding: 6px; color: #0f172a; min-width: 170px;">
                <div style="font-weight: 800; font-size: 13px; color: #dc2626; border-bottom: 2px solid #ef4444; padding-bottom: 3px; margin-bottom: 4px;">
                  ${props.label || 'Structural Fault'}
                </div>
                <div style="font-size: 11px;"><strong>Strike:</strong> N70°E Regional Fault</div>
                <div style="font-size: 11px;"><strong>Dip:</strong> 72° NW (Mansar Contact)</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Controls regional manganese reef displacement</div>
              </div>
            `)
            .addTo(map);
        });
      }
    } catch (err) {
      console.warn('Fault lines setup notice:', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ORE BENCH POLYGONS: High-contrast vector polygons with white border
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const zonesData = getMinePitZones(config);
      const existingZonesSource = map.getSource('pit-zones-source') as maplibregl.GeoJSONSource;
      if (existingZonesSource) {
        existingZonesSource.setData(zonesData);
      } else {
        map.addSource('pit-zones-source', {
          type: 'geojson',
          data: zonesData,
        });

        // Pit Bench Polygon Fills
        map.addLayer({
          id: 'pit-zones-fill',
          type: 'fill',
          source: 'pit-zones-source',
          paint: {
            'fill-color': [
              'match',
              ['get', 'confidence_band'],
              'Very High', CONFIDENCE_BAND_COLORS['Very High'],
              'High', CONFIDENCE_BAND_COLORS['High'],
              'Moderate', CONFIDENCE_BAND_COLORS['Moderate'],
              CONFIDENCE_BAND_COLORS['Low'],
            ],
            'fill-opacity': 0.40,
          },
        });

        // Pit Bench Outlines (Crisp White Vector Border)
        map.addLayer({
          id: 'pit-zones-line',
          type: 'line',
          source: 'pit-zones-source',
          paint: {
            'line-color': '#ffffff',
            'line-width': 2.5,
            'line-opacity': 0.95,
          },
        });

        // Interactive click on any ore bench zone
        map.on('click', 'pit-zones-fill', (e: any) => {
          if (!e.features || !e.features[0]) return;
          const f = e.features[0];
          const props = f.properties || {};

          onSelectPoint({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
            siteName: config.name,
            zoneName: props.zone_name,
          });

          if (popupRef.current) popupRef.current.remove();

          popupRef.current = new maplibregl.Popup({ closeButton: true, className: 'zone-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family: sans-serif; padding: 6px; color: #0f172a; min-width: 190px;">
                <div style="font-weight: 800; font-size: 13px; color: #0e7490; border-bottom: 2px solid #0e7490; padding-bottom: 3px; margin-bottom: 6px;">
                  ${props.zone_name || 'Ore Zone'}
                </div>
                <div style="font-size: 11px; margin-bottom: 3px;"><strong>Predicted Grade:</strong> <span style="color: #dc2626; font-weight: 800;">${props.avg_mno || 'N/A'}</span></div>
                <div style="font-size: 11px; margin-bottom: 3px;"><strong>Confidence:</strong> ${props.confidence_band || 'High'}</div>
                <div style="font-size: 11px; margin-bottom: 3px;"><strong>Formation:</strong> ${props.formation || 'Sausar Group'}</div>
                <div style="font-size: 10px; color: #475569; font-style: italic; margin-top: 4px;">${props.lithology || ''}</div>
                <div style="margin-top: 6px; font-size: 10px; color: #0e7490; font-weight: 700; background: #e0f2fe; padding: 3px 6px; border-radius: 4px; text-align: center;">
                  ✓ Subsurface Cross-Section Loaded Below
                </div>
              </div>
            `)
            .addTo(map);
        });

        map.on('mouseenter', 'pit-zones-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'pit-zones-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    } catch (err) {
      console.warn('Pit zones setup notice:', err);
    }
  }, [filterConfig, onSelectPoint]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const rasterInfo = getMineRasterHeatmapBounds(mineConfig, activeFilter);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: UNIFIED_MAP_STYLE,
      center: mineConfig.center,
      zoom: mineConfig.zoom,
      minZoom: 13.5, // Strictly lock camera to mine area (no zooming out into outer geography)
      maxZoom: 18.5,
      maxBounds: rasterInfo.restrictedBounds, // Strictly lock camera panning to heatmap square
      renderWorldCopies: false,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      setupLayers(map, mineConfig);
      map.resize();
    });

    map.on('error', (e: any) => {
      // Ignore non-fatal tile errors (e.g. boundary tile not found)
      console.warn('MapLibre event notice:', e.error?.message || e);
    });

    // Clicking anywhere on the pit canvas selects a point for 0-400m Cross-Section
    // STRICT BOUNDS CHECK: Only sample within the trained mine range!
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      const currentRaster = getMineRasterHeatmapBounds(mineConfig, activeFilter);
      const [sw, ne] = currentRaster.restrictedBounds;
      const isWithinTrainedBounds =
        e.lngLat.lng >= sw[0] &&
        e.lngLat.lng <= ne[0] &&
        e.lngLat.lat >= sw[1] &&
        e.lngLat.lat <= ne[1];

      if (!isWithinTrainedBounds) {
        setOutOfBoundsWarning(`Sampling restricted to within ${mineConfig.name} boundary.`);
        setTimeout(() => setOutOfBoundsWarning(null), 3500);
        return;
      }

      onSelectPoint({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        siteName: mineConfig.name,
        zoneName: 'In-Pit Subsurface Core',
      });
    });

    mapRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, []);

  // 2D Orthographic View vs 3D DEM Terrain Mapping
  const handleDimensionChange = (dimension: '2D' | '3D') => {
    setViewDimension(dimension);
    const map = mapRef.current;
    if (!map) return;

    if (dimension === '3D') {
      try {
        if (typeof (map as any).setTerrain === 'function') {
          (map as any).setTerrain({ source: 'aws-dem-source', exaggeration: 2.2 });
        }
        if (map.getLayer('hillshading-layer')) {
          map.setLayoutProperty('hillshading-layer', 'visibility', 'visible');
        }
        map.easeTo({
          pitch: 62,
          bearing: -22,
          duration: 1200,
        });
      } catch (err) {
        console.warn('3D Terrain setup notice:', err);
      }
    } else {
      try {
        if (typeof (map as any).setTerrain === 'function') {
          (map as any).setTerrain(null);
        }
        if (map.getLayer('hillshading-layer')) {
          map.setLayoutProperty('hillshading-layer', 'visibility', 'none');
        }
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000,
        });
      } catch (err) {
        console.warn('2D View reset notice:', err);
      }
    }
  };

  // Fly to mine when mine changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const rasterInfo = getMineRasterHeatmapBounds(mineConfig, activeFilter);
    map.setMaxBounds(rasterInfo.restrictedBounds);
    map.fitBounds([
      [mineConfig.center[0] - 0.024, mineConfig.center[1] - 0.016],
      [mineConfig.center[0] + 0.024, mineConfig.center[1] + 0.016],
    ], {
      pitch: viewDimension === '3D' ? 62 : 0,
      bearing: viewDimension === '3D' ? -22 : 0,
      duration: 1000,
      padding: viewDimension === '3D' ? 20 : 0,
    });

    setupLayers(map, mineConfig);
  }, [selectedMineName, mapLoaded, mineConfig, setupLayers, viewDimension]);

  // Recenter Pit View directly onto the active quarry pit
  const handleRecenterPit = () => {
    const map = mapRef.current;
    if (!map) return;
    const rasterInfo = getMineRasterHeatmapBounds(mineConfig, activeFilter);
    map.setMaxBounds(rasterInfo.restrictedBounds);
    map.fitBounds([
      [mineConfig.center[0] - 0.024, mineConfig.center[1] - 0.016],
      [mineConfig.center[0] + 0.024, mineConfig.center[1] + 0.016],
    ], {
      pitch: viewDimension === '3D' ? 62 : 0,
      bearing: viewDimension === '3D' ? -22 : 0,
      duration: 800,
      padding: viewDimension === '3D' ? 20 : 0,
    });
  };

  // React to Filter Mode changes from Dropdown - loads actual distinct raster layer
  const handleSelectFilter = (mode: ProspectivityFilterMode) => {
    setActiveFilter(mode);
    setIsFilterDropdownOpen(false);

    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const rasterInfo = getMineRasterHeatmapBounds(mineConfig, mode);
    const existingRasterSource = map.getSource('pit-raster-heatmap-source') as any;
    if (existingRasterSource && existingRasterSource.updateImage) {
      existingRasterSource.updateImage({
        url: rasterInfo.url,
        coordinates: rasterInfo.coordinates,
      });
    }

    const currentFilter = FILTER_MODES[mode];
    if (map.getLayer('pit-raster-heatmap-layer')) {
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', currentFilter.fillOpacity);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-hue-rotate', 0);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', 0.10);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', 0.10);
    }
  };

  // Update pulsating pin marker when target point changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedPoint) {
      if (!markerRef.current) {
        const el = document.createElement('div');
        el.className = 'cross-section-marker';
        el.innerHTML = `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #0e7490; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #0e7490, #14b8a6); border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
          </div>
        `;
        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([selectedPoint.lng, selectedPoint.lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([selectedPoint.lng, selectedPoint.lat]);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [selectedPoint]);

  // Handle layer toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('pit-raster-heatmap-layer')) {
      map.setLayoutProperty('pit-raster-heatmap-layer', 'visibility', showHeatmap ? 'visible' : 'none');
    }
    if (map.getLayer('pit-zones-fill')) {
      map.setLayoutProperty('pit-zones-fill', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('pit-zones-line')) {
      map.setLayoutProperty('pit-zones-line', 'visibility', showZones ? 'visible' : 'none');
    }
    if (map.getLayer('structural-lines-layer')) {
      map.setLayoutProperty('structural-lines-layer', 'visibility', showFaults ? 'visible' : 'none');
    }
    if (map.getLayer('mine-pit-boundary-layer')) {
      map.setLayoutProperty('mine-pit-boundary-layer', 'visibility', showPitBoundary ? 'visible' : 'none');
    }
  }, [showHeatmap, showZones, showFaults, showPitBoundary, mapLoaded]);

  // Dedicated reactive effect for Multispectral Filter Mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const rasterInfo = getMineRasterHeatmapBounds(mineConfig, activeFilter);
    const existingRasterSource = map.getSource('pit-raster-heatmap-source') as any;
    if (existingRasterSource && existingRasterSource.updateImage) {
      existingRasterSource.updateImage({
        url: rasterInfo.url,
        coordinates: rasterInfo.coordinates,
      });
    }

    const currentFilter = FILTER_MODES[activeFilter];
    if (map.getLayer('pit-raster-heatmap-layer')) {
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', currentFilter.fillOpacity);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-hue-rotate', 0);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', 0.10);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', 0.10);
    }
  }, [activeFilter, mapLoaded, mineConfig]);

  // Robust Fullscreen Toggle (supports both native requestFullscreen and CSS overlay without DOM remount)
  const toggleFullScreen = async () => {
    if (!outerContainerRef.current) return;

    if (!document.fullscreenElement && !isFullScreen) {
      setIsFullScreen(true);
      try {
        if (outerContainerRef.current.requestFullscreen) {
          await outerContainerRef.current.requestFullscreen();
        }
      } catch (err) {
        console.warn('Native requestFullscreen notice, continuing with CSS fullscreen:', err);
      }
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullScreen(false);
    }
  };

  // Sync fullscreen state with native browser fullscreen changes (e.g. user pressed Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement);
      setIsFullScreen(isNativeFs);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fullscreen resize effect: triggers map resize multiple times to cleanly fill viewport
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.resize();
    const t1 = setTimeout(() => map.resize(), 50);
    const t2 = setTimeout(() => map.resize(), 150);
    const t3 = setTimeout(() => map.resize(), 300);
    const t4 = setTimeout(() => map.resize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isFullScreen]);

  // Close fullscreen on ESC key (for CSS fallback)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // When clicking Cross-Section / Sampling Active button:
  const handleSamplingClick = () => {
    onToggleCrossSection();
    if (!selectedPoint) {
      onSelectPoint({
        lat: mineConfig.center[1],
        lng: mineConfig.center[0],
        siteName: mineConfig.name,
        zoneName: 'Main High-Grade Reef',
      });
    }
  };

  const hudStyle = 'bg-slate-950/90 border border-white/15 text-white backdrop-blur-md shadow-2xl';

  return (
    <div
      ref={outerContainerRef}
      className={`select-none group transition-all duration-150 ${
        isFullScreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen m-0 p-0 rounded-none border-0 bg-slate-950 flex flex-col'
          : `relative w-full h-[580px] rounded-2xl overflow-hidden border shadow-2xl ${
              isDark ? 'border-white/15 bg-slate-950' : 'border-slate-300 bg-slate-900'
            }`
      }`}
    >
      {/* MapLibre DOM Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${crossSectionActive ? 'cursor-crosshair' : 'cursor-grab'}`}
      />

      {/* Out of bounds toast notification */}
      {outOfBoundsWarning && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-amber-500/95 text-slate-950 font-bold text-xs shadow-2xl backdrop-blur-md border border-amber-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <AlertTriangle size={14} />
          <span>{outOfBoundsWarning}</span>
        </div>
      )}

      {/* TOP COMPACT HUD: Single sleek line that never clusters */}
      <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between gap-1.5 flex-nowrap pointer-events-none">
        {/* Left: 2D vs 3D Terrain DEM Switcher */}
        <div className={`flex items-center gap-0.5 p-1 rounded-xl pointer-events-auto ${hudStyle}`}>
          <button
            type="button"
            onClick={() => handleDimensionChange('2D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewDimension === '2D'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="2D Top-Down Orthographic Satellite View"
          >
            <MapIcon size={12} />
            <span>2D View</span>
          </button>
          <button
            type="button"
            onClick={() => handleDimensionChange('3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              viewDimension === '3D'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="3D DEM Terrain Elevation Model with Draped Heatmap"
          >
            <Mountain size={12} />
            <span>3D Terrain DEM</span>
          </button>
        </div>

        {/* Center: Standard Filter Dropdown */}
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-slate-900 ${hudStyle}`}
          >
            <Layers size={13} className="text-teal-400 shrink-0" />
            <span className="text-teal-300 truncate max-w-[140px] sm:max-w-[180px]">{filterConfig.shortName}</span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown Menu */}
          {isFilterDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-64 rounded-xl bg-slate-950/98 border border-white/20 shadow-2xl p-1 z-40 backdrop-blur-xl animate-in fade-in duration-100">
              <div className="px-2 py-1 text-[9.5px] font-mono uppercase text-slate-400 font-bold border-b border-white/10 mb-1">
                Select Multispectral Layer:
              </div>
              {(Object.keys(FILTER_MODES) as ProspectivityFilterMode[]).map((key) => {
                const item = FILTER_MODES[key];
                const isSelected = activeFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectFilter(key)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-[11px]">{item.shortName}</div>
                      <div className="text-[9px] font-mono text-slate-400">{item.sourceType}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={12} className="text-teal-400 ml-1.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sampling Tool, Focus Pit, Fullscreen */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Sampling Active Tool Button */}
          <button
            type="button"
            onClick={handleSamplingClick}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
              crossSectionActive
                ? 'bg-teal-500 text-white border-teal-300 ring-2 ring-teal-400/50'
                : 'bg-slate-950/90 backdrop-blur-md text-teal-400 border-white/15 hover:bg-slate-900'
            }`}
            title="Click anywhere in pit to inspect 0-400m Subsurface Cross-Section"
          >
            <Crosshair size={12} className={crossSectionActive ? 'rotate-90 transition-transform' : ''} />
            <span className="hidden sm:inline">{crossSectionActive ? 'Sampling Active' : 'Sampling Tool'}</span>
            <span className="sm:hidden">{crossSectionActive ? 'Active' : 'Sample'}</span>
          </button>

          {/* Recenter on Active Mine Pit */}
          <button
            type="button"
            onClick={handleRecenterPit}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-slate-900 ${hudStyle}`}
            title="Recenter camera on active mine pit benches"
          >
            <Compass size={12} className="text-teal-400 shrink-0" />
            <span className="hidden sm:inline">Focus Pit</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
              isFullScreen
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                : 'bg-slate-950/90 backdrop-blur-md text-slate-300 border-white/15 hover:bg-slate-900'
            }`}
            title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
          >
            {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden sm:inline">{isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT: Compact Layer Toggles */}
      <div className="absolute bottom-3 left-2.5 z-20 flex items-center gap-1 pointer-events-auto flex-wrap">
        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            showHeatmap
              ? 'bg-rose-950/90 border-rose-500/60 text-rose-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-slate-500'}`} />
          <span>Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setShowZones(!showZones)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            showZones
              ? 'bg-teal-950/90 border-teal-500/60 text-teal-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showZones ? 'bg-teal-400 shadow-sm shadow-teal-400/50' : 'bg-slate-500'}`} />
          <span>Ore Benches</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFaults(!showFaults)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            showFaults
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showFaults ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-slate-500'}`} />
          <span>Faults</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPitBoundary(!showPitBoundary)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer border ${
            showPitBoundary
              ? 'bg-yellow-950/90 border-yellow-500/60 text-yellow-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showPitBoundary ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50' : 'bg-slate-500'}`} />
          <span>Pit Shell</span>
        </button>
      </div>

      {/* BOTTOM-RIGHT: Collapsible Geoscientific Layer Legend */}
      <div className="absolute bottom-3 right-2.5 z-20 pointer-events-auto max-w-[250px] w-full">
        <div className="rounded-xl bg-slate-950/95 backdrop-blur-md border border-white/15 shadow-2xl p-2.5 text-white transition-all">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1">
              <Info size={11} />
              Layer Legend
            </span>
            <button
              type="button"
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              title={isLegendOpen ? 'Collapse Legend' : 'Expand Legend'}
            >
              {isLegendOpen ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>

          {isLegendOpen && (
            <div className="space-y-2 text-[10.5px] animate-in fade-in duration-100">
              {/* Active Color Gradient Bar */}
              <div>
                <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-300 mb-0.5">
                  <span className="font-bold">{filterConfig.shortName}</span>
                  <span className="text-teal-400 font-bold">{filterConfig.unit}</span>
                </div>
                <div
                  className="w-full h-2 rounded-full border border-white/20 shadow-inner"
                  style={{ background: filterConfig.colorScale }}
                />
                <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 mt-0.5">
                  <span>{filterConfig.minVal}</span>
                  <span>{filterConfig.midVal}</span>
                  <span className="font-bold text-white">{filterConfig.maxVal}</span>
                </div>
                {activeFilter === 'prospectivity' && (
                  <div className="text-[8.5px] text-purple-300 font-mono mt-1 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                    <span className="font-bold text-purple-300">Purple:</span> Low-Grade Host Rock (&lt;28% MnO) • <span className="font-bold text-amber-300">Gold:</span> High-Grade Ore
                  </div>
                )}
              </div>

              {/* Symbology Legend */}
              <div className="space-y-1 pt-1 border-t border-white/10 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b-2 border-yellow-400 border-dashed shrink-0" />
                  <span className="text-slate-300">Pit Shell / Lease Rim</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b-2 border-red-500 border-dashed shrink-0" />
                  <span className="text-slate-300">Fault / Shear Zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-red-600/70 border border-white shrink-0" />
                  <span className="text-slate-300">High-Grade Ore Bench (≥40% MnO)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 border border-white shrink-0" />
                  <span className="text-slate-300">Borehole Cross-Section Pin</span>
                </div>
              </div>

              {/* Primary Evidence note from Ten_Mines_Data_Guide.pdf */}
              <div className="p-1.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-300 leading-snug font-mono">
                <span className="text-amber-400 font-bold">Evidence: </span>
                {mineConfig.primaryEvidence}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
