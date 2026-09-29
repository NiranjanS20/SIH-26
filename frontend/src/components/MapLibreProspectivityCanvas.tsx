import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  UNIFIED_MAP_STYLE,
  getMineBoundary,
  getMineRasterHeatmapBounds,
  getMineWorldMask,
  FILTER_MODES,
  computePointProspectivity,
} from '../lib/prospectivityMapConfig';
import type { ProspectivityFilterMode, MineBoundaryConfig, PointProspectivityEstimate } from '../lib/prospectivityMapConfig';
import {
  Mountain,
  Maximize2,
  Minimize2,
  Activity,
  Compass,
  CheckCircle2,
  Layers,
  ChevronDown,
  Info,
  Map as MapIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
} from 'lucide-react';

// Static worker registration for MapLibre in Vite
if (typeof window !== 'undefined') {
  if (typeof (maplibregl as any).setWorkerUrl === 'function') {
    (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
  }
}

export interface SelectedLocationPoint {
  lat: number;
  lng: number;
  siteName?: string;
  zoneName?: string;
  grade?: number;
  gradeDisplay?: string;
  confidence?: number;
  confidenceBand?: 'Very High' | 'High' | 'Moderate' | 'Low' | string;
  gradeTier?: string;
  formation?: string;
  lithology?: string;
  estTonnage?: number;
  reserveCategory?: string;
}

interface MapLibreProspectivityCanvasProps {
  selectedMineName?: string;
  isDark?: boolean;
  crossSectionActive: boolean;
  onToggleCrossSection: () => void;
  selectedPoint: SelectedLocationPoint | null;
  onSelectPoint: (point: SelectedLocationPoint) => void;
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
  // 3D Terrain actual photorealistic satellite color mode vs multispectral overlay (defaults to false for High Colour)
  const [terrainActualColor, setTerrainActualColor] = useState<boolean>(false);

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

  // Layer Toggles - Pure clean map mode
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState<string | null>(null);

  const mineConfig: MineBoundaryConfig = getMineBoundary(selectedMineName);
  const filterConfig = FILTER_MODES[activeFilter];

  const mineConfigRef = useRef<MineBoundaryConfig>(mineConfig);
  const activeFilterRef = useRef<ProspectivityFilterMode>(activeFilter);
  const onSelectPointRef = useRef(onSelectPoint);

  useEffect(() => {
    mineConfigRef.current = mineConfig;
  }, [mineConfig]);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    onSelectPointRef.current = onSelectPoint;
  }, [onSelectPoint]);

  // Dynamic Opacity: in 2D or 3D, displays actual real-world satellite ground colour or rich AI multispectral overlay
  const computeLayerOpacity = useCallback(
    (filter: ProspectivityFilterMode, dimension: '2D' | '3D', actualColor: boolean) => {
      if (actualColor) {
        // Pure photorealistic satellite ground imagery (0.0 opacity) for ALL filters across ALL mines
        return 0.0;
      }
      if (dimension === '3D') {
        if (filter === 'elevation') {
          // Topographic elevation overlay tint in 3D
          return 0.40;
        }
        return FILTER_MODES[filter].fillOpacity;
      }
      return FILTER_MODES[filter].fillOpacity;
    },
    []
  );

  // Core Inspector: Calculates continuous grade & confidence and renders high-tech MapLibre popup
  const handleLocationInspect = useCallback(
    (lngLat: maplibregl.LngLat, pointPx?: { x: number; y: number }, specificZoneProps?: any) => {
      const map = mapRef.current;
      if (!map) return;

      const currentConfig = mineConfigRef.current;
      const currentFilter = activeFilterRef.current;
      const currentRaster = getMineRasterHeatmapBounds(currentConfig, currentFilter);
      const [sw, ne] = currentRaster.restrictedBounds;
      const buffer = 0.04; // Permissive sampling buffer (~4km)
      const isWithinTrainedBounds =
        lngLat.lng >= sw[0] - buffer &&
        lngLat.lng <= ne[0] + buffer &&
        lngLat.lat >= sw[1] - buffer &&
        lngLat.lat <= ne[1] + buffer;

      if (!isWithinTrainedBounds) {
        setOutOfBoundsWarning(`Sampling restricted to within ${currentConfig.name} district.`);
        setTimeout(() => setOutOfBoundsWarning(null), 3500);
        return;
      }

      let zoneName = 'In-Pit Ore Reef';
      let formation = 'Mansar Formation (Sausar Group)';
      let lithology = 'Dense Crystalline Braunite Horizon';

      if (specificZoneProps) {
        if (specificZoneProps.zone_name) zoneName = specificZoneProps.zone_name;
        if (specificZoneProps.formation) formation = specificZoneProps.formation;
        if (specificZoneProps.lithology) lithology = specificZoneProps.lithology;
      } else if (pointPx) {
        try {
          const features = map.queryRenderedFeatures([pointPx.x, pointPx.y], { layers: ['pit-zones-fill'] });
          if (features && features.length > 0) {
            const props = features[0].properties || {};
            if (props.zone_name) zoneName = props.zone_name;
            if (props.formation) formation = props.formation;
            if (props.lithology) lithology = props.lithology;
          }
        } catch {
          // query fallback
        }
      }

      const estimate: PointProspectivityEstimate = computePointProspectivity(
        lngLat.lat,
        lngLat.lng,
        currentConfig
      );

      // Dismiss any legacy popup so map stays 100% clean and unobstructed
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      onSelectPointRef.current({
        lat: lngLat.lat,
        lng: lngLat.lng,
        siteName: currentConfig.name,
        zoneName,
        grade: estimate.gradePct,
        gradeDisplay: estimate.gradeDisplay,
        confidence: estimate.confidencePct,
        confidenceBand: estimate.confidenceBand,
        gradeTier: estimate.gradeTier,
        formation,
        lithology: estimate.lithology || lithology,
        estTonnage: estimate.estTonnage,
        reserveCategory: estimate.reserveCategory,
      });
    },
    []
  );

  const handleLocationInspectRef = useRef(handleLocationInspect);
  useEffect(() => {
    handleLocationInspectRef.current = handleLocationInspect;
  }, [handleLocationInspect]);

  // Set up Continuous Raster Heatmap overlay (Pure & Clean - No cluttering vector lines)
  const setupLayers = useCallback((map: maplibregl.Map, config: MineBoundaryConfig) => {
    if (!map) return;

    // ─────────────────────────────────────────────────────────────────────────
    // PURE CLEAN RASTER HEATMAP OVERLAY: Draped multispectral image over pit
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const rasterInfo = getMineRasterHeatmapBounds(config, activeFilter);
      const existingRasterSource = map.getSource('pit-raster-heatmap-source') as any;
      const initialOpacity = computeLayerOpacity(activeFilter, viewDimension, terrainActualColor);
      const is3DActual = viewDimension === '3D' && terrainActualColor;
      const initialVisibility = showHeatmap && !is3DActual ? 'visible' : 'none';

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
          layout: {
            visibility: initialVisibility,
          },
          paint: {
            'raster-opacity': initialOpacity,
            'raster-hue-rotate': 0,
            'raster-contrast': 0.15,
            'raster-saturation': 0.20,
            'raster-fade-duration': 0, // CRITICAL: 0ms fade so camera movements never trigger fade-in pulses
          },
        });
      }

      // Synchronize existing layer paint & visibility
      if (map.getLayer('pit-raster-heatmap-layer')) {
        map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
        map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', initialOpacity);
        map.setLayoutProperty('pit-raster-heatmap-layer', 'visibility', initialVisibility);
      }
    } catch (err) {
      console.warn('Raster heatmap setup notice:', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WORLD MASK: Masks out all regions outside the heatmap boundary
    // Strictly and exclusively displays ONLY the heatmap region for all mines!
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const maskData = getMineWorldMask(config);
      const existingMaskSource = map.getSource('mine-world-mask-source') as maplibregl.GeoJSONSource;
      if (existingMaskSource && existingMaskSource.setData) {
        existingMaskSource.setData(maskData);
      } else if (!existingMaskSource) {
        map.addSource('mine-world-mask-source', {
          type: 'geojson',
          data: maskData,
        });

        map.addLayer({
          id: 'mine-world-mask-layer',
          type: 'fill',
          source: 'mine-world-mask-source',
          paint: {
            'fill-color': '#020617',
            'fill-opacity': 1.0,
          },
        });

        map.addLayer({
          id: 'mine-world-mask-border',
          type: 'line',
          source: 'mine-world-mask-source',
          paint: {
            'line-color': '#0e7490',
            'line-width': 1.5,
            'line-opacity': 0.75,
          },
        });
      }
    } catch (err) {
      console.warn('World mask setup notice:', err);
    }
  }, [activeFilter, viewDimension, terrainActualColor, showHeatmap, computeLayerOpacity]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const [sw, ne] = mineConfig.bounds;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: UNIFIED_MAP_STYLE,
      center: mineConfig.center,
      zoom: 14.5,
      minZoom: 13.0, // Strictly prevent zooming out to regional scale
      maxZoom: 18.5,
      maxBounds: [
        [sw[0] - 0.003, sw[1] - 0.003],
        [ne[0] + 0.003, ne[1] + 0.003],
      ],
      renderWorldCopies: false,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
      mapRef.current = map;
      setupLayers(map, mineConfig);
      map.fitBounds(mineConfig.bounds, { padding: 0, duration: 0 });
      map.resize();
    });

    map.on('error', (e: any) => {
      // Gracefully ignore non-fatal DEM tile or satellite tile errors
      const msg = e.error?.message || e.message || String(e);
      if (
        msg.includes('tile') ||
        msg.includes('dem') ||
        msg.includes('404') ||
        msg.includes('403') ||
        msg.includes('terrain')
      ) {
        return;
      }
      console.warn('MapLibre event notice:', msg);
    });

    // Clicking anywhere on the pit canvas inspects continuous grade & confidence
    map.on('click', (e: maplibregl.MapMouseEvent) => {
      handleLocationInspectRef.current(e.lngLat, e.point);
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
          (map as any).setTerrain({ source: 'aws-dem-source', exaggeration: 1.6 });
        }
        if (map.getLayer('hillshading-layer')) {
          map.setLayoutProperty('hillshading-layer', 'visibility', 'visible');
        }
        const targetOpacity = computeLayerOpacity(activeFilter, '3D', terrainActualColor);
        const is3DActual = terrainActualColor;
        if (map.getLayer('pit-raster-heatmap-layer')) {
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', is3DActual ? 0.10 : 0.20);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', is3DActual ? 0.10 : 0.25);
          map.setLayoutProperty(
            'pit-raster-heatmap-layer',
            'visibility',
            showHeatmap && !is3DActual ? 'visible' : 'none'
          );
        }
        map.easeTo({
          pitch: 58,
          bearing: -20,
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
        if (map.getLayer('pit-raster-heatmap-layer')) {
          const targetOpacity = computeLayerOpacity(activeFilter, '2D', terrainActualColor);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', terrainActualColor ? 0.10 : 0.14);
          map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', terrainActualColor ? 0.10 : 0.20);
          map.setLayoutProperty('pit-raster-heatmap-layer', 'visibility', showHeatmap && !terrainActualColor ? 'visible' : 'none');
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

  const prevMineRef = useRef<string>(selectedMineName);

  // Fly smoothly to mine when selected mine changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const mineChanged = prevMineRef.current !== selectedMineName;
    prevMineRef.current = selectedMineName;

    if (mineChanged) {
      // Temporarily release maxBounds to fly smoothly to the target mine
      map.setMaxBounds(null);
      setupLayers(map, mineConfig);

      const [sw, ne] = mineConfig.bounds;
      map.fitBounds(mineConfig.bounds, {
        padding: 0,
        pitch: viewDimension === '3D' ? 58 : 0,
        bearing: viewDimension === '3D' ? -20 : 0,
        duration: 900,
      });

      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setMaxBounds([
            [sw[0] - 0.003, sw[1] - 0.003],
            [ne[0] + 0.003, ne[1] + 0.003],
          ]);
        }
      }, 950);

      return () => clearTimeout(timer);
    } else {
      setupLayers(map, mineConfig);
    }
  }, [selectedMineName, mapLoaded, mineConfig, viewDimension, setupLayers]);

  // Recenter Pit View directly onto the active mine heatmap
  const handleRecenterPit = () => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(mineConfig.bounds, {
      padding: 0,
      pitch: viewDimension === '3D' ? 58 : 0,
      bearing: viewDimension === '3D' ? -20 : 0,
      duration: 600,
    });
  };

  // React to Filter Mode changes from Dropdown - loads actual distinct raster layer
  const handleSelectFilter = (mode: ProspectivityFilterMode) => {
    setActiveFilter(mode);
    setIsFilterDropdownOpen(false);
    // Explicit selection of a filter switches to Overlay Mode so user can view the selected layer
    setTerrainActualColor(false);

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

    const is3D = viewDimension === '3D';
    const targetOpacity = is3D && mode === 'elevation' ? 0.40 : FILTER_MODES[mode].fillOpacity;
    if (map.getLayer('pit-raster-heatmap-layer')) {
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
      map.setLayoutProperty(
        'pit-raster-heatmap-layer',
        'visibility',
        showHeatmap ? 'visible' : 'none'
      );
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
      const targetOpacity = computeLayerOpacity(activeFilter, viewDimension, terrainActualColor);
      const is3DActual = viewDimension === '3D' && terrainActualColor;
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
      map.setLayoutProperty(
        'pit-raster-heatmap-layer',
        'visibility',
        showHeatmap && !is3DActual ? 'visible' : 'none'
      );
    }
  }, [showHeatmap, mapLoaded, activeFilter, viewDimension, terrainActualColor, computeLayerOpacity]);

  // Dedicated reactive effect for Multispectral Filter Mode and 2D/3D dimension changes
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

    const targetOpacity = computeLayerOpacity(activeFilter, viewDimension, terrainActualColor);
    const is3DActual = viewDimension === '3D' && terrainActualColor;
    if (map.getLayer('pit-raster-heatmap-layer')) {
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
      map.setLayoutProperty(
        'pit-raster-heatmap-layer',
        'visibility',
        showHeatmap && !is3DActual ? 'visible' : 'none'
      );
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-hue-rotate', 0);
      const contrast = viewDimension === '3D' && !terrainActualColor ? 0.20 : 0.10;
      const saturation = viewDimension === '3D' && !terrainActualColor ? 0.25 : 0.10;
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', contrast);
      map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', saturation);
    }
  }, [activeFilter, mapLoaded, mineConfig, viewDimension, terrainActualColor, showHeatmap, computeLayerOpacity]);

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
      const estimate = computePointProspectivity(mineConfig.center[1], mineConfig.center[0], mineConfig);
      onSelectPoint({
        lat: mineConfig.center[1],
        lng: mineConfig.center[0],
        siteName: mineConfig.name,
        zoneName: 'Main High-Grade Reef',
        grade: estimate.gradePct,
        gradeDisplay: estimate.gradeDisplay,
        confidence: estimate.confidencePct,
        confidenceBand: estimate.confidenceBand,
        gradeTier: estimate.gradeTier,
        formation: estimate.formation,
        lithology: estimate.lithology,
        estTonnage: estimate.estTonnage,
        reserveCategory: estimate.reserveCategory,
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
          : `relative w-full h-[620px] sm:h-[660px] lg:h-[700px] rounded-2xl overflow-hidden border shadow-2xl ${
              isDark ? 'border-white/15 bg-slate-950' : 'border-slate-300 bg-slate-900'
            }`
      }`}
    >
      {/* MapLibre DOM Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full cursor-crosshair"
      />

      {/* Out of bounds toast notification */}
      {outOfBoundsWarning && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-xl bg-amber-500/95 text-slate-950 font-bold text-xs shadow-2xl backdrop-blur-md border border-amber-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <AlertTriangle size={14} />
          <span>{outOfBoundsWarning}</span>
        </div>
      )}

      {/* ON-CANVAS LOCATION INSPECTION HUD: Shows Grade, Confidence & UNFC Reserve pinned on map */}
      {selectedPoint && selectedPoint.grade !== undefined && (
        <div className="absolute top-12 sm:top-14 left-2 sm:left-2.5 z-20 max-w-[320px] w-[calc(100%-16px)] sm:w-80 rounded-xl bg-slate-950/95 border border-cyan-500/40 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md text-white animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Collar Inspection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-mono text-slate-400">
                {selectedPoint.lat.toFixed(4)}°N, {selectedPoint.lng.toFixed(4)}°E
              </span>
              <button
                type="button"
                onClick={() => onSelectPointRef.current({ ...selectedPoint, grade: undefined })}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Close inspection collar"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Est. MnO% Grade</span>
              <span className={`text-base font-black ${
                (selectedPoint.grade || 0) < 30 ? 'text-purple-400' :
                (selectedPoint.grade || 0) < 40 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {selectedPoint.gradeDisplay || `${selectedPoint.grade?.toFixed(1)}% MnO`}
              </span>
              <span className="text-[8.5px] text-slate-400 block truncate">
                {selectedPoint.gradeTier || ((selectedPoint.grade || 0) < 30 ? 'Low Grade (<30% MnO)' : 'Medium Grade')}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400">Confidence</span>
                <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded border ${
                  selectedPoint.confidenceBand === 'Very High' ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40' :
                  selectedPoint.confidenceBand === 'High' ? 'text-teal-300 bg-teal-950/80 border-teal-500/40' :
                  selectedPoint.confidenceBand === 'Moderate' ? 'text-amber-300 bg-amber-950/80 border-amber-500/40' :
                  'text-purple-300 bg-purple-950/80 border-purple-500/40'
                }`}>
                  {selectedPoint.confidenceBand || 'Moderate'}
                </span>
              </div>
              <span className={`text-base font-black ${
                (selectedPoint.confidence || 0) >= 85 ? 'text-emerald-400' :
                (selectedPoint.confidence || 0) >= 75 ? 'text-teal-400' : 'text-amber-400'
              }`}>
                {selectedPoint.confidence ? selectedPoint.confidence.toFixed(1) : '95.2'}%
              </span>
              <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                  style={{ width: `${selectedPoint.confidence || 95}%` }}
                />
              </div>
            </div>
          </div>

          {/* Reserve Mapping (UNFC Category & Tonnage) */}
          <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 mb-2 flex items-center justify-between">
            <div className="min-w-0 pr-1.5">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-amber-400 block">
                Reserve Mapping (UNFC Standards)
              </span>
              <span className="text-[10px] font-black text-amber-200 truncate block">
                {selectedPoint.reserveCategory || 'UNFC 111 (Proved High-Grade Reserve)'}
              </span>
            </div>
            <span className="text-xs font-mono font-black text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 shrink-0">
              {selectedPoint.estTonnage ? `${selectedPoint.estTonnage.toLocaleString()} t` : '3,850 t'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <span className="text-[9px] text-cyan-200/80 font-mono truncate max-w-[170px]">
              {selectedPoint.zoneName || 'Subsurface Core'}
            </span>
            <button
              type="button"
              onClick={() => onToggleCrossSection()}
              className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[9.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1"
            >
              <Activity size={11} />
              <span>{crossSectionActive ? 'Close 2D Seam' : 'View 2D Seam'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TOP RESPONSIVE HUD: Perfectly shows all options even on 100% zoom */}
      <div className="absolute top-2 sm:top-2.5 inset-x-2 sm:inset-x-2.5 z-20 flex flex-wrap items-center justify-between gap-1 sm:gap-1.5 pointer-events-none">
        {/* Left: 2D vs 3D Terrain DEM Switcher & 3D High Colour Mode Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
          <div className={`flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl ${hudStyle}`}>
            <button
              type="button"
              onClick={() => handleDimensionChange('2D')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewDimension === '2D'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="2D Top-Down Orthographic Satellite View"
            >
              <MapIcon size={12} />
              <span className="hidden sm:inline">2D View</span>
              <span className="sm:hidden">2D</span>
            </button>
            <button
              type="button"
              onClick={() => handleDimensionChange('3D')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewDimension === '3D'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="3D DEM Terrain Elevation Model with Draped Heatmap"
            >
              <Mountain size={12} />
              <span className="hidden sm:inline">3D Terrain</span>
              <span className="sm:hidden">3D</span>
            </button>
          </div>

          {/* High Colour / True Satellite Toggle (Active in 2D & 3D) */}
          <button
            type="button"
            onClick={() => {
              const nextActual = !terrainActualColor;
              setTerrainActualColor(nextActual);

              // Synchronously update MapLibre layer immediately
              const map = mapRef.current;
              if (map && map.getLayer('pit-raster-heatmap-layer')) {
                const targetOpacity = computeLayerOpacity(activeFilter, viewDimension, nextActual);
                map.setPaintProperty('pit-raster-heatmap-layer', 'raster-fade-duration', 0);
                map.setPaintProperty('pit-raster-heatmap-layer', 'raster-opacity', targetOpacity);
                map.setPaintProperty('pit-raster-heatmap-layer', 'raster-contrast', nextActual ? 0.10 : 0.16);
                map.setPaintProperty('pit-raster-heatmap-layer', 'raster-saturation', nextActual ? 0.10 : 0.22);
                map.setLayoutProperty(
                  'pit-raster-heatmap-layer',
                  'visibility',
                  showHeatmap && !nextActual ? 'visible' : 'none'
                );
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
              !terrainActualColor
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 ring-1 ring-amber-400/40 shadow-amber-500/20'
                : 'bg-emerald-600/30 text-emerald-300 border-emerald-400/60'
            }`}
            title={
              !terrainActualColor
                ? 'High Colour Active: Rich AI multispectral prospectivity overlay draped on satellite ground. Click for pure photorealistic satellite.'
                : 'True Satellite Active: Photorealistic ground imagery with natural terrain relief. Click for High Colour overlay.'
            }
          >
            <Eye size={12} className={!terrainActualColor ? 'text-amber-400' : 'text-emerald-300'} />
            <span className="hidden sm:inline">{!terrainActualColor ? 'High Colour' : 'True Satellite'}</span>
            <span className="sm:hidden">{!terrainActualColor ? 'Colour' : 'Satellite'}</span>
          </button>
        </div>

        {/* Center: Standard Filter Dropdown */}
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-slate-900 ${hudStyle}`}
          >
            <Layers size={12} className="text-teal-400 shrink-0" />
            <span className="text-teal-300 truncate max-w-[90px] sm:max-w-[130px] md:max-w-[170px]">{filterConfig.shortName}</span>
            <ChevronDown size={11} className={`text-slate-400 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Filter Dropdown Menu */}
          {isFilterDropdownOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-60 sm:w-64 rounded-xl bg-slate-950/98 border border-white/20 shadow-2xl p-1 z-40 backdrop-blur-xl animate-in fade-in duration-100">
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
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
          {/* Subsurface 2D Seam Cross-Section Drawer Toggle */}
          <button
            type="button"
            onClick={handleSamplingClick}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
              crossSectionActive
                ? 'bg-teal-500 text-white border-teal-300 ring-2 ring-teal-400/50'
                : 'bg-slate-950/90 backdrop-blur-md text-teal-400 border-white/15 hover:bg-slate-900'
            }`}
            title="Inspect 0-400m Subsurface 2D Seam Cross-Section"
          >
            <Activity size={13} className={crossSectionActive ? 'rotate-90 transition-transform text-white' : 'text-teal-400'} />
            <span className="hidden sm:inline">{crossSectionActive ? '2D Seam Open' : '2D Seam'}</span>
            <span className="sm:hidden">{crossSectionActive ? 'Open' : '2D Seam'}</span>
          </button>

          {/* Recenter on Active Mine Pit */}
          <button
            type="button"
            onClick={handleRecenterPit}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-slate-900 ${hudStyle}`}
            title="Recenter camera on active mine pit benches"
          >
            <Compass size={12} className="text-teal-400 shrink-0" />
            <span className="hidden sm:inline">Focus Pit</span>
            <span className="sm:hidden">Focus</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
              isFullScreen
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                : 'bg-slate-950/90 backdrop-blur-md text-slate-300 border-white/15 hover:bg-slate-900'
            }`}
            title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
          >
            {isFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden sm:inline">{isFullScreen ? 'Exit' : 'Fullscreen'}</span>
            <span className="sm:hidden">{isFullScreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT: Clean Minimal Heatmap Overlay Indicator & Toggle */}
      <div className="absolute bottom-3 left-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer border shadow-xl ${
            showHeatmap
              ? 'bg-slate-950/95 border-teal-500/50 text-teal-300'
              : 'bg-slate-950/80 border-white/10 text-slate-400'
          }`}
          title="Toggle Prospectivity Heatmap Overlay on/off"
        >
          <span className={`w-2 h-2 rounded-full ${showHeatmap ? 'bg-teal-400 shadow-sm shadow-teal-400/80 animate-pulse' : 'bg-slate-500'}`} />
          <span>{filterConfig.shortName}</span>
          <span className="text-[9px] font-mono opacity-70">({showHeatmap ? 'Active' : 'Off'})</span>
        </button>
      </div>

      {/* BOTTOM-RIGHT: Expanded, Highly Readable Color Scale Legend */}
      <div className="absolute bottom-3 right-2.5 z-20 pointer-events-auto max-w-[340px] sm:max-w-[380px] w-full">
        <div className="rounded-2xl bg-slate-950/98 backdrop-blur-md border border-white/20 shadow-2xl p-3.5 sm:p-4 text-white transition-all">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <span className="text-[13px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Info size={15} className="text-teal-400" />
              <span>Map Color Scale</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer text-xs"
              title={isLegendOpen ? 'Collapse Legend' : 'Expand Legend'}
            >
              {isLegendOpen ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {isLegendOpen && (
            <div className="space-y-2.5 text-xs animate-in fade-in duration-100">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-extrabold text-white text-[13px]">{filterConfig.shortName}</span>
                <span className="text-teal-300 font-extrabold text-[11px] bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                  {filterConfig.unit}
                </span>
              </div>
              <div
                className="w-full h-4 rounded-full border border-white/30 shadow-inner"
                style={{ background: filterConfig.colorScale }}
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-200 font-bold px-0.5">
                <span>{filterConfig.minVal}</span>
                <span>{filterConfig.midVal}</span>
                <span className="text-white font-extrabold">{filterConfig.maxVal}</span>
              </div>

              {activeFilter === 'prospectivity' && (
                <div className="text-[11px] font-mono mt-2.5 p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-200">
                    <span className="w-3 h-3 rounded-full bg-[#4c0080] border border-purple-300 shrink-0 shadow-sm" />
                    <span className="font-bold text-purple-300">Dark Purple:</span>
                    <span>Low-Grade (&lt;30% MnO) Host Rock</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-200">
                    <span className="w-3 h-3 rounded-full bg-[#fde047] border border-amber-300 shrink-0 shadow-sm" />
                    <span className="font-bold text-amber-300">Bright Gold:</span>
                    <span>High-Grade (&gt;45% MnO) In-Pit Reef</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
