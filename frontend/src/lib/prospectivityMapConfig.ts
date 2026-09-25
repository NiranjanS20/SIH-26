// Configuration for MOIL Manganese Belt MapLibre GIS mapping
// Calibrated from National Geoscience Data Repository (NGDR) & Google Earth Engine (GEE)
// Reference: Ten_Mines_Data_Guide.pdf (SIH 2026 • PS 26009)

export const UNIFIED_MAP_STYLE: any = {
  version: 8,
  sources: {
    'satellite-source': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
    'aws-dem-source': {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 15,
    },
  },
  layers: [
    {
      id: 'basemap-satellite',
      type: 'raster',
      source: 'satellite-source',
      layout: { visibility: 'visible' },
      minzoom: 0,
      maxzoom: 24,
    },
    {
      id: 'hillshading-layer',
      type: 'hillshade',
      source: 'aws-dem-source',
      layout: { visibility: 'none' },
      paint: {
        'hillshade-exaggeration': 1.0,
        'hillshade-shadow-color': '#0f172a',
        'hillshade-highlight-color': '#ffffff',
        'hillshade-accent-color': '#334155',
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER MODES — directly mapped to real fields in the GeoJSON training data
// From Ten_Mines_Data_Guide.pdf Section 2
// ─────────────────────────────────────────────────────────────────────────────
export type ProspectivityFilterMode = 'prospectivity' | 'ndvi' | 'soil_moisture' | 'lst' | 'elevation';

export interface FilterModeConfig {
  id: ProspectivityFilterMode;
  name: string;
  shortName: string;
  sourceType: string;
  geojsonField: string;
  domain: [number, number];
  unit: string;
  minVal: string;
  midVal: string;
  maxVal: string;
  colorScale: string;
  fillOpacity: number;
  rasterHueRotate: number;
  rasterContrast: number;
  rasterSaturation: number;
  colorStops: Array<[number, string]>;
}

export const FILTER_MODES: Record<ProspectivityFilterMode, FilterModeConfig> = {
  prospectivity: {
    id: 'prospectivity',
    name: 'AI Prospectivity — MnO% Grade (Model 1)',
    shortName: 'Prospectivity (MnO%)',
    sourceType: 'Multi-Model AI Ensemble',
    geojsonField: 'ensemble_confidence_score',
    domain: [0.006, 0.578],
    unit: '% MnO Grade',
    minVal: 'Low (<28%)',
    midVal: 'Med (40%)',
    maxVal: 'High (>52%)',
    colorScale: 'linear-gradient(to right, #4c0080 0%, #7b0d8f 18%, #a8226a 38%, #d45a8a 55%, #f59e0b 78%, #fde047 100%)',
    fillOpacity: 0.85,
    rasterHueRotate: 0,
    rasterContrast: 0.10,
    rasterSaturation: 0.10,
    colorStops: [
      [0.0, '#4c0080'],
      [0.15, '#7b0d8f'],
      [0.30, '#a8226a'],
      [0.42, '#d45a8a'],
      [0.52, '#f59e0b'],
      [0.58, '#fde047'],
    ],
  },
  ndvi: {
    id: 'ndvi',
    name: 'NDVI — Vegetation Index / Bare Rock Exposure',
    shortName: 'NDVI (Vegetation)',
    sourceType: 'Sentinel-2 Multispectral',
    geojsonField: 'ndvi_anomaly',
    domain: [-0.4, 0.2],
    unit: 'NDVI Index',
    minVal: '-0.25 (Quarry Pit)',
    midVal: '0.20 (Scrub)',
    maxVal: '+0.70 (Forest)',
    colorScale: 'linear-gradient(to right, #991b1b 0%, #c2410c 20%, #d97706 40%, #fef08a 55%, #22c55e 75%, #14532d 100%)',
    fillOpacity: 0.82,
    rasterHueRotate: 0,
    rasterContrast: 0.10,
    rasterSaturation: 0.10,
    colorStops: [
      [-0.4, '#991b1b'],
      [-0.2, '#c2410c'],
      [-0.05, '#d97706'],
      [0.0, '#fef08a'],
      [0.1, '#22c55e'],
      [0.2, '#14532d'],
    ],
  },
  soil_moisture: {
    id: 'soil_moisture',
    name: 'Soil Moisture — Sentinel-1 Radar Backscatter (VV)',
    shortName: 'Soil Moisture (SAR)',
    sourceType: 'Sentinel-1 SAR C-Band',
    geojsonField: 'ndwi',
    domain: [0.0, 0.994],
    unit: 'SAR Moisture Index',
    minVal: 'Dry Highwall',
    midVal: 'Moist Bench',
    maxVal: 'Sump / Water',
    colorScale: 'linear-gradient(to right, #78350f 0%, #b45309 20%, #d97706 40%, #38bdf8 55%, #0284c7 75%, #1e3a8a 100%)',
    fillOpacity: 0.82,
    rasterHueRotate: 0,
    rasterContrast: 0.10,
    rasterSaturation: 0.10,
    colorStops: [
      [0.0, '#78350f'],
      [0.2, '#b45309'],
      [0.4, '#d97706'],
      [0.6, '#38bdf8'],
      [0.8, '#0284c7'],
      [1.0, '#1e3a8a'],
    ],
  },
  lst: {
    id: 'lst',
    name: 'Iron Oxide Index — Hydrothermal Alteration Proxy',
    shortName: 'Iron Oxide / LST',
    sourceType: 'Landsat-8/9 TIR',
    geojsonField: 'iron_oxide_index',
    domain: [0.0, 0.998],
    unit: 'Alteration Ratio (0–1)',
    minVal: '0.0 (Unaltered)',
    midVal: '0.5 (Moderate)',
    maxVal: '1.0 (Gossan)',
    colorScale: 'linear-gradient(to right, #1e1b4b 0%, #581c87 25%, #dc2626 50%, #f59e0b 75%, #fef08a 100%)',
    fillOpacity: 0.82,
    rasterHueRotate: 0,
    rasterContrast: 0.10,
    rasterSaturation: 0.10,
    colorStops: [
      [0.0, '#1e1b4b'],
      [0.2, '#581c87'],
      [0.4, '#dc2626'],
      [0.6, '#f59e0b'],
      [0.8, '#fef08a'],
      [1.0, '#ffffff'],
    ],
  },
  elevation: {
    id: 'elevation',
    name: 'Topographic Elevation & Slope — SRTM 30m DEM',
    shortName: 'Elevation (DEM)',
    sourceType: 'SRTM 30m DEM',
    geojsonField: 'slope',
    domain: [298.0, 455.0],
    unit: 'Meters ASL',
    minVal: '298m (Pit Floor)',
    midVal: '345m (Surface)',
    maxVal: '455m (Ridge Rim)',
    colorScale: 'linear-gradient(to right, #0f172a 0%, #1e3a8a 18%, #0284c7 35%, #3f6212 50%, #78716c 68%, #b45309 85%, #7f1d1d 100%)',
    fillOpacity: 0.80,
    rasterHueRotate: 0,
    rasterContrast: 0.10,
    rasterSaturation: 0.10,
    colorStops: [
      [0.00, '#0f172a'],
      [0.18, '#1e3a8a'],
      [0.35, '#0284c7'],
      [0.50, '#3f6212'],
      [0.68, '#78716c'],
      [0.85, '#b45309'],
      [1.00, '#7f1d1d'],
    ],
  },
};

export function buildFillColorExpression(filter: FilterModeConfig): any[] {
  const expr: any[] = ['interpolate', ['linear'], ['get', filter.geojsonField]];
  for (const [val, color] of filter.colorStops) {
    expr.push(val, color);
  }
  return expr;
}

// ─────────────────────────────────────────────────────────────────────────────
// MINE CONFIGS — 10 MOIL Manganese Mines
// ─────────────────────────────────────────────────────────────────────────────
export interface MineBoundaryConfig {
  id: string;
  name: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]]; // [[lng_sw, lat_sw], [lng_ne, lat_ne]]
  district: string;
  state: string;
  type: 'Open Cast' | 'Underground' | 'Hybrid';
  prospectivityGeojson: string;
  primaryEvidence: string;
  reserveNote: string;
}

export const MINE_BOUNDARIES: Record<string, MineBoundaryConfig> = {
  'dongri-buzurg': {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Mine',
    center: [79.6880, 21.5480],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.6400, 21.5000], [79.7400, 21.6000]],
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Open Cast',
    prospectivityGeojson: '/prospectivity/bhandara.geojson',
    primaryEvidence: 'Surface Sentinel-2 (NDVI, LST, Moisture) & Active Quarry Geomorphology',
    reserveNote: 'Richest multi-year production history; 2015-16 MCDR documented baseline',
  },
  'chikla': {
    id: 'chikla',
    name: 'Chikla Mine',
    center: [79.7540, 21.5510],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.7000, 21.5000], [79.8000, 21.6000]],
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/bhandara.geojson',
    primaryEvidence: 'Subsurface Incline Shafts & Surrounding Geochemical Stream Assays',
    reserveNote: 'Legacy surface quarry signatures with active mechanized incline underground',
  },
  'tirodi': {
    id: 'tirodi',
    name: 'Tirodi Mine',
    center: [79.7250, 21.6840],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.6700, 21.6300], [79.7800, 21.7400]],
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Open Cast',
    prospectivityGeojson: '/prospectivity/balaghat.geojson',
    primaryEvidence: 'Sentinel-2 Multispectral + Fault Proximity (0.67km) + Metallogenic Point',
    reserveNote: 'Documented Reserve: 799,700t at 48%+ Mn; ground fault 0.67km away',
  },
  'sitapatore': {
    id: 'sitapatore',
    name: 'Sitapatore Mine',
    center: [79.7050, 21.6620],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.6500, 21.6100], [79.7600, 21.7200]],
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Open Cast',
    prospectivityGeojson: '/prospectivity/balaghat.geojson',
    primaryEvidence: 'Sentinel-2 Multispectral & Confirmed Sukli Lease Boundary',
    reserveNote: 'Confirmed Sukli lease match; high opencast ore exposure',
  },
  'balaghat': {
    id: 'balaghat',
    name: 'Balaghat Mine (Bharweli)',
    center: [80.2080, 21.8470],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[80.1500, 21.7900], [80.2600, 21.9000]],
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/balaghat.geojson',
    primaryEvidence: 'Dense Magnetic/Gravity Surveys (>650 stations) & Deep Lode Boring',
    reserveNote: 'Reserve: 6.21 Mt at 48%+ Mn; deepest underground manganese lode in India',
  },
  'ukwa': {
    id: 'ukwa',
    name: 'Ukwa Mine',
    center: [80.4680, 21.9680],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[80.4000, 21.9100], [80.5300, 22.0200]],
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/balaghat.geojson',
    primaryEvidence: '6km Continuous Seam Strike & Radar Backscatter Displacement Proxy',
    reserveNote: 'Reserve: 12.5 Mt (largest in belt); 6km strike length',
  },
  'kandri': {
    id: 'kandri',
    name: 'Kandri Mine',
    center: [79.2700, 21.4170],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.2200, 21.3600], [79.3200, 21.4700]],
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Hybrid',
    prospectivityGeojson: '/prospectivity/nagpur.geojson',
    primaryEvidence: 'Kandri-Beldongri-Munsar Cluster Gondite Horizon + Geochemistry',
    reserveNote: 'Major synclinal gondite horizon; Kandri-Beldongri-Munsar tectonic cluster',
  },
  'beldongri': {
    id: 'beldongri',
    name: 'Beldongri Mine',
    center: [79.3080, 21.4330],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.2500, 21.3800], [79.3600, 21.4900]],
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/nagpur.geojson',
    primaryEvidence: 'Confirmed Manganese Lease Boundary & Soil C-Horizon Geochemistry',
    reserveNote: 'Closest lease match of the Nagpur group; high soil Mn anomaly',
  },
  'munsar': {
    id: 'munsar',
    name: 'Munsar Mine',
    center: [79.2880, 21.4010],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[79.2300, 21.3500], [79.3400, 21.4600]],
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/nagpur.geojson',
    primaryEvidence: 'Three Confirmed Leases within 1.1km & Mansar Formation Type-Locality',
    reserveNote: 'Type locality for Sausar Mansar Formation; parallel braunite horizons',
  },
  'gumgaon': {
    id: 'gumgaon',
    name: 'Gumgaon Mine',
    center: [78.9950, 21.3780],
    zoom: 14.2,
    minZoom: 11.0,
    maxZoom: 18.0,
    bounds: [[78.9400, 21.3200], [79.0500, 21.4300]],
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    prospectivityGeojson: '/prospectivity/nagpur.geojson',
    primaryEvidence: 'Deep Vertical Shaft Lode & Independent Western Cluster Lease',
    reserveNote: 'Geographically separate from other 3 Nagpur mines; own confirmed lease',
  },
};

export function getMineBoundary(mineNameOrId?: string): MineBoundaryConfig {
  if (!mineNameOrId) return MINE_BOUNDARIES['dongri-buzurg'];
  const s = mineNameOrId.toLowerCase();
  for (const [key, config] of Object.entries(MINE_BOUNDARIES)) {
    if (s.includes(key) || key.includes(s.replace(/\s+mine$/, '').trim())) {
      return config;
    }
  }
  for (const config of Object.values(MINE_BOUNDARIES)) {
    if (config.name.toLowerCase().includes(s.replace(' mine', ''))) {
      return config;
    }
  }
  return MINE_BOUNDARIES['dongri-buzurg'];
}

export const CONFIDENCE_BAND_COLORS: Record<string, string> = {
  'Very High': '#dc2626',
  'High': '#ea580c',
  'Moderate': '#0284c7',
  'Low': '#475569',
  'Very Low': '#1e293b',
};

export const STRUCTURAL_LINE_COLORS = {
  fault: '#ef4444',
  shear_zone: '#f59e0b',
  fold_axis: '#a855f7',
  default: '#0ea5e9',
};

// ─────────────────────────────────────────────────────────────────────────────
// Pit Shell / Lease Boundary Generator around Mine Center
// ─────────────────────────────────────────────────────────────────────────────
export function getMinePitBoundary(config: MineBoundaryConfig): any {
  const [lng, lat] = config.center;
  const dLng = 0.010;
  const dLat = 0.007;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: `${config.name} Pit Boundary / Lease Rim`,
          type: 'Pit Rim',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - dLng * 0.9, lat - dLat * 0.7],
              [lng - dLng * 0.4, lat - dLat * 1.0],
              [lng + dLng * 0.6, lat - dLat * 0.8],
              [lng + dLng * 1.1, lat - dLat * 0.2],
              [lng + dLng * 0.9, lat + dLat * 0.7],
              [lng + dLng * 0.2, lat + dLat * 1.0],
              [lng - dLng * 0.7, lat + dLat * 0.8],
              [lng - dLng * 1.1, lat + dLat * 0.1],
              [lng - dLng * 0.9, lat - dLat * 0.7],
            ],
          ],
        },
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Structural Faults & Shear Lines Generator around Mine Center
// ─────────────────────────────────────────────────────────────────────────────
export function getMineFaultLines(config: MineBoundaryConfig): any {
  const [lng, lat] = config.center;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          line_id: `${config.id}_fault_1`,
          structure_type: 'fault',
          label: 'Regional Strike Fault (ENE-WSW)',
          site_id: config.id,
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [lng - 0.015, lat - 0.007],
            [lng - 0.005, lat - 0.002],
            [lng + 0.008, lat + 0.003],
            [lng + 0.018, lat + 0.009],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          line_id: `${config.id}_shear_2`,
          structure_type: 'shear_zone',
          label: 'Mansar Shear Zone',
          site_id: config.id,
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [lng - 0.012, lat + 0.008],
            [lng - 0.001, lat + 0.004],
            [lng + 0.011, lat - 0.001],
            [lng + 0.020, lat - 0.005],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          line_id: `${config.id}_fold_3`,
          structure_type: 'fold_axis',
          label: 'Sausar Syncline Axis',
          site_id: config.id,
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [lng - 0.010, lat - 0.010],
            [lng, lat - 0.004],
            [lng + 0.009, lat + 0.005],
          ],
        },
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ore Bench Polygons Generator around Mine Center
// ─────────────────────────────────────────────────────────────────────────────
export function getMinePitZones(config: MineBoundaryConfig): any {
  const [lng, lat] = config.center;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          zone_name: 'High-Grade Central Braunite Reef (Bench #4)',
          avg_mno: '48.5% MnO',
          confidence_band: 'Very High',
          formation: 'Mansar Formation (Sausar Group)',
          lithology: 'Dense crystalline braunite-quartzite banded horizon',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - 0.004, lat - 0.002],
              [lng + 0.003, lat - 0.001],
              [lng + 0.005, lat + 0.002],
              [lng - 0.002, lat + 0.003],
              [lng - 0.004, lat - 0.002],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          zone_name: 'Secondary Manganese Footwall Lode (Bench #2)',
          avg_mno: '38.2% MnO',
          confidence_band: 'High',
          formation: 'Mansar Schist Contact',
          lithology: 'Gondite with pyrolusite/psilomelane enrichment',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng - 0.007, lat - 0.004],
              [lng - 0.003, lat - 0.003],
              [lng - 0.001, lat - 0.001],
              [lng - 0.006, lat + 0.001],
              [lng - 0.007, lat - 0.004],
            ],
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          zone_name: 'Hanging Wall Low-Grade Siliceous Ore (Bench #6)',
          avg_mno: '26.8% MnO',
          confidence_band: 'Moderate',
          formation: 'Chorbaoli Quartzite Interface',
          lithology: 'Manganiferous quartzite with quartz vein intrusions',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lng + 0.002, lat + 0.001],
              [lng + 0.008, lat + 0.003],
              [lng + 0.007, lat + 0.006],
              [lng + 0.001, lat + 0.004],
              [lng + 0.002, lat + 0.001],
            ],
          ],
        },
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Raster Heatmap Surface Generator draped onto Satellite Imagery
// Loads distinct calibrated multispectral PNGs for each filter mode
// and provides strict restricted bounds for MapLibre camera locking
// ─────────────────────────────────────────────────────────────────────────────
export function getMineRasterHeatmapBounds(
  config: MineBoundaryConfig,
  filterMode: ProspectivityFilterMode = 'prospectivity'
): {
  url: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
  restrictedBounds: [[number, number], [number, number]];
} {
  const [lng, lat] = config.center;
  // Span covers the active opencast pit and surrounding prospective strike
  const dLng = 0.024;
  const dLat = 0.016;

  // Use dedicated multispectral layer for each mine
  const folder = config.id;
  const url = `/prospectivity/layers/${folder}/${filterMode}.png`;

  // Buffer around heatmap box (~300m) to strictly prevent panning out of the mine area
  const bufferLng = 0.0035;
  const bufferLat = 0.0025;
  const restrictedBounds: [[number, number], [number, number]] = [
    [lng - dLng - bufferLng, lat - dLat - bufferLat], // SW [minLng, minLat]
    [lng + dLng + bufferLng, lat + dLat + bufferLat], // NE [maxLng, maxLat]
  ];

  return {
    url,
    coordinates: [
      [lng - dLng, lat + dLat], // top-left
      [lng + dLng, lat + dLat], // top-right
      [lng + dLng, lat - dLat], // bottom-right
      [lng - dLng, lat - dLat], // bottom-left
    ],
    restrictedBounds,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mask Polygon covering the outside world so only the mine area is visible
// Completely removes the "extra map" outside the mine boundaries
// ─────────────────────────────────────────────────────────────────────────────
export function getMineWorldMask(config: MineBoundaryConfig): any {
  const [lng, lat] = config.center;
  const dLng = 0.024;
  const dLat = 0.016;

  // Exterior ring covering the entire globe
  const worldRing = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ];

  // Interior cutout hole (clockwise) for the mine heatmap
  const mineHole = [
    [lng - dLng, lat - dLat],
    [lng - dLng, lat + dLat],
    [lng + dLng, lat + dLat],
    [lng + dLng, lat - dLat],
    [lng - dLng, lat - dLat],
  ];

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [worldRing, mineHole],
        },
      },
    ],
  };
}
