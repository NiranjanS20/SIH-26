// ==============================================================================
// MOIL Mine Intelligence Data Models & Mine-Specific Datasets
// Provides typed structures for TERRAIN, SATELLITE, and INTELLIGENCE visual modes.
// Prepared for future FastAPI endpoints:
//   - GET /mines/{mineId}
//   - GET /mines/{mineId}/layers
//   - GET /mines/{mineId}/prospectivity
// ==============================================================================

export interface TerrainContour {
  elevationM: number;
  label: string;
  pathD: string;
  color: string;
  type: 'crest' | 'bench' | 'ore_face' | 'sump' | 'shaft_collar' | 'stope_level';
}

export interface HaulRoad {
  name: string;
  gradePct: number;
  pathD: string;
  lengthM: number;
}

export interface EquipmentAsset {
  id: string;
  name: string;
  type: 'Excavator' | 'Dumper Fleet' | 'Drill Rig' | 'Headframe Winder' | 'Primary Crusher';
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
  location: string;
  x: number; // SVG canvas coordinate 0..540
  y: number; // SVG canvas coordinate 0..200
  operator: string;
}

export interface SatelliteLayerOption {
  id: string;
  label: string;
  icon: string;
  type: 'OPTICAL' | 'NDVI' | 'MOISTURE' | 'THERMAL' | 'SAR';
  isLiveConnected: boolean;
  sampleOverlayColor: string;
  description: string;
}

export interface ProspectivityZone {
  id: string;
  name: string;
  scorePct: number;
  confidencePct: number;
  estimatedTonnageKt: number;
  dominantGradePct: number;
  structuralContext: string;
  polygonD: string; // SVG canvas polygon
  geoPolygon: [number, number][]; // Real GIS coordinate polygon
  evidence: string[];
  recommendedAction: string;
}

export interface DrillHole {
  id: string;
  holeCode: string;
  lat: number;
  lng: number;
  x: number; // SVG canvas coordinate 0..540
  y: number; // SVG canvas coordinate 0..200
  depthM: number;
  interceptLengthM: number;
  avgGradePct: number;
  mineralization: string;
  status: 'COMPLETED' | 'CONFIRMED_ORE' | 'EXPLORATION_TARGET';
}

export interface StructuralFeature {
  name: string;
  strike: string;
  dip: string;
  trendLineD: string;
  type: 'Thrust Fault' | 'Anticline Axis' | 'Syncline Axis' | 'Shear Contact';
}

export interface MineIntelligenceProfile {
  mineId: string;
  mineName: string;
  shortCode: string;
  type: 'Open Cast' | 'Underground';
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationMsl: number;
  leaseAreaHa: number;
  geologicalFormation: string;
  dominantMineral: string;

  // 1. TERRAIN DATA
  terrainData: {
    boundaryCoords: [number, number][];
    pitWorkingAreaCoords: [number, number][];
    elevationRangeM: { min: number; max: number };
    contours: TerrainContour[];
    haulRoads: HaulRoad[];
    equipmentAssets: EquipmentAsset[];
  };

  // 2. SATELLITE CONFIG
  satelliteConfig: {
    sensor: string;
    lastPassDate: string;
    cloudCoverPct: number;
    spatialResolution: string;
    availableLayers: SatelliteLayerOption[];
  };

  // 3. INTELLIGENCE DATA (Decision Support)
  prospectivityZones: ProspectivityZone[];
  drillHoles: DrillHole[];
  structuralFeatures: StructuralFeature[];
}

// ==============================================================================
// MINE-SPECIFIC DATASETS (5 Distinct Operational MOIL Mines)
// ==============================================================================

export const MINE_INTELLIGENCE_DATA: Record<string, MineIntelligenceProfile> = {
  // ----------------------------------------------------------------------------
  // 1. DONGRI BUZURG (Flagship Open-Cast Mine, Bhandara, MH)
  // ----------------------------------------------------------------------------
  'dongri-buzurg': {
    mineId: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Opencast Mine',
    shortCode: 'DB-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Bhandara',
    latitude: 21.554,
    longitude: 79.702,
    elevationMsl: 280,
    leaseAreaHa: 138.4,
    geologicalFormation: 'Mansar Stage (Sausar Group)',
    dominantMineral: 'High-Grade Pyrolusite & Cryptomelane (Battery Oxide)',

    terrainData: {
      boundaryCoords: [
        [21.558, 79.697],
        [21.559, 79.707],
        [21.549, 79.708],
        [21.548, 79.698],
      ],
      pitWorkingAreaCoords: [
        [21.556, 79.700],
        [21.557, 79.705],
        [21.552, 79.704],
        [21.551, 79.699],
      ],
      elevationRangeM: { min: 240, max: 340 },
      contours: [
        {
          elevationM: 340,
          label: '+340m Overburden Crest',
          pathD: 'M 20 40 Q 140 10 270 40 T 520 40',
          color: '#64748B',
          type: 'crest',
        },
        {
          elevationM: 310,
          label: '+310m ROM Top Bench',
          pathD: 'M 35 75 Q 160 25 270 75 T 505 75',
          color: '#0E7C7B',
          type: 'bench',
        },
        {
          elevationM: 280,
          label: '+280m Active Pyrolusite Face',
          pathD: 'M 60 110 Q 180 50 270 110 T 480 110',
          color: '#F59E0B',
          type: 'ore_face',
        },
        {
          elevationM: 240,
          label: '+240m Drainage Sump Basin',
          pathD: 'M 90 145 Q 200 85 270 145 T 450 145',
          color: '#3B82F6',
          type: 'sump',
        },
      ],
      haulRoads: [
        {
          name: 'Main Haul Ramp #1',
          gradePct: 8.2,
          pathD: 'M 100 40 L 160 80 L 230 115 L 290 150',
          lengthM: 840,
        },
        {
          name: 'East Waste Dump Access',
          gradePct: 6.5,
          pathD: 'M 380 40 L 430 85 L 470 130',
          lengthM: 620,
        },
      ],
      equipmentAssets: [
        {
          id: 'EQ-EX-01',
          name: 'Hitachi EX1200 Excavator',
          type: 'Excavator',
          status: 'ACTIVE',
          location: 'Pit Bench DB-01',
          x: 285,
          y: 135,
          operator: 'Shift A • R. Verma',
        },
        {
          id: 'EQ-DP-04',
          name: 'CAT 773E 50T Dumper Fleet',
          type: 'Dumper Fleet',
          status: 'ACTIVE',
          location: 'Ramp Node 2',
          x: 175,
          y: 80,
          operator: 'Auto Dispatch Fleet',
        },
        {
          id: 'EQ-DR-02',
          name: 'Atlas Copco Blasthole Rig',
          type: 'Drill Rig',
          status: 'MAINTENANCE',
          location: 'East Ridge Bench',
          x: 435,
          y: 50,
          operator: 'Tech Crew B',
        },
      ],
    },

    satelliteConfig: {
      sensor: 'Sentinel-2B MSI (10m)',
      lastPassDate: '2026-08-28',
      cloudCoverPct: 0.0,
      spatialResolution: '10m / Pixel',
      availableLayers: [
        {
          id: 'TRUE_COLOR',
          label: 'True Color (RGB)',
          icon: '🛰️',
          type: 'OPTICAL',
          isLiveConnected: true,
          sampleOverlayColor: 'transparent',
          description: 'High-resolution natural optical surface imagery.',
        },
        {
          id: 'NDVI',
          label: 'NDVI Vegetation',
          icon: '🌿',
          type: 'NDVI',
          isLiveConnected: true,
          sampleOverlayColor: '#15803d',
          description: 'Vegetation canopy clearing and environmental footprint tracking.',
        },
        {
          id: 'SOIL_MOISTURE',
          label: 'Pit Sump Moisture',
          icon: '💧',
          type: 'MOISTURE',
          isLiveConnected: true,
          sampleOverlayColor: '#0284c7',
          description: 'Sump inundation and ground moisture saturation index.',
        },
        {
          id: 'THERMAL_LST',
          label: 'Thermal LST Anomaly',
          icon: '🌡️',
          type: 'THERMAL',
          isLiveConnected: true,
          sampleOverlayColor: '#ef4444',
          description: 'Land surface temperature anomalies across active blasting benches.',
        },
      ],
    },

    prospectivityZones: [
      {
        id: 'PZ-DB-14',
        name: 'Zone 14 (East Extension Reef)',
        scorePct: 88.5,
        confidencePct: 92.0,
        estimatedTonnageKt: 185.0,
        dominantGradePct: 48.2,
        structuralContext: 'Mansar Schist synclinal fold nose dipping 68° NW',
        polygonD: 'M 300 70 L 460 75 L 430 155 L 280 145 Z',
        geoPolygon: [
          [21.557, 79.704],
          [21.558, 79.709],
          [21.553, 79.708],
          [21.552, 79.703],
        ],
        evidence: [
          'High magnetic susceptibility anomaly (+420 nT)',
          'Drill core DH-DB-14 confirmed 14.8m continuous pyrolusite reef',
          'Spectral absorption peak at 2.2µm (manganese hydroxide signature)',
          'Topographic bench extension accessible via existing East Haul Ramp',
        ],
        recommendedAction: 'Priority Phase 1 bench development & production ramp-up.',
      },
      {
        id: 'PZ-DB-07',
        name: 'Zone 07 (North Hanging Wall)',
        scorePct: 74.2,
        confidencePct: 81.0,
        estimatedTonnageKt: 95.0,
        dominantGradePct: 42.8,
        structuralContext: 'Faulted contact with quartz-muscovite schist',
        polygonD: 'M 130 50 L 260 45 L 240 100 L 110 95 Z',
        geoPolygon: [
          [21.559, 79.699],
          [21.560, 79.704],
          [21.556, 79.703],
          [21.555, 79.698],
        ],
        evidence: [
          'Subsurface ground magnetic gradient confirmed strike continuity',
          'Historical trench sample assays averaging 41.5% - 44.0% Mn',
          'Requires 18m overburden stripping prior to reef extraction',
        ],
        recommendedAction: 'Advance exploratory infill drilling 50m grid spacing.',
      },
    ],

    drillHoles: [
      {
        id: 'DH-DB-01',
        holeCode: 'DH-DB-01',
        lat: 21.555,
        lng: 79.701,
        x: 210,
        y: 105,
        depthM: 85.0,
        interceptLengthM: 16.4,
        avgGradePct: 46.2,
        mineralization: 'Hard Pyrolusite & Braunsite',
        status: 'CONFIRMED_ORE',
      },
      {
        id: 'DH-DB-14',
        holeCode: 'DH-DB-14',
        lat: 21.556,
        lng: 79.706,
        x: 370,
        y: 115,
        depthM: 110.0,
        interceptLengthM: 14.8,
        avgGradePct: 48.2,
        mineralization: 'Massive Dioxide Reef',
        status: 'CONFIRMED_ORE',
      },
      {
        id: 'DH-DB-22',
        holeCode: 'DH-DB-22',
        lat: 21.558,
        lng: 79.708,
        x: 460,
        y: 65,
        depthM: 140.0,
        interceptLengthM: 8.2,
        avgGradePct: 39.5,
        mineralization: 'Ferruginous Manganese',
        status: 'EXPLORATION_TARGET',
      },
    ],

    structuralFeatures: [
      {
        name: 'Dongri Main Thrust (DMT-1)',
        strike: 'N65°E',
        dip: '68° NW',
        trendLineD: 'M 40 160 L 260 110 L 490 60',
        type: 'Thrust Fault',
      },
      {
        name: 'Bhandara Syncline Axial Plane',
        strike: 'N70°E',
        dip: '75° NW',
        trendLineD: 'M 60 90 L 290 60 L 510 30',
        type: 'Syncline Axis',
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // 2. BALAGHAT MINE (Deep Underground Mine, Balaghat, MP - Bharweli Reef)
  // ----------------------------------------------------------------------------
  'balaghat': {
    mineId: 'balaghat',
    mineName: 'Balaghat Underground Mine',
    shortCode: 'BG-01',
    type: 'Underground',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    latitude: 21.870,
    longitude: 80.185,
    elevationMsl: 315,
    leaseAreaHa: 180.5,
    geologicalFormation: 'Bharweli Stage • Chilpi Ghat Series',
    dominantMineral: 'High-Grade Braunsite & Psilomelane (Metallurgical Grade)',

    terrainData: {
      boundaryCoords: [
        [21.875, 80.180],
        [21.876, 80.192],
        [21.864, 80.191],
        [21.863, 80.179],
      ],
      pitWorkingAreaCoords: [
        [21.872, 80.183],
        [21.873, 80.188],
        [21.867, 80.187],
        [21.866, 80.182],
      ],
      elevationRangeM: { min: -120, max: 315 },
      contours: [
        {
          elevationM: 315,
          label: 'Surface Shaft Headframe Collar (+315m MSL)',
          pathD: 'M 30 35 L 510 35',
          color: '#0E7C7B',
          type: 'shaft_collar',
        },
        {
          elevationM: 180,
          label: 'Level 4 Haulage Crosscut (+180m MSL)',
          pathD: 'M 50 75 Q 260 55 490 75',
          color: '#3B82F6',
          type: 'bench',
        },
        {
          elevationM: 60,
          label: 'Level 8 Bharweli High-Grade Stope (+60m MSL)',
          pathD: 'M 70 115 Q 270 95 470 115',
          color: '#F59E0B',
          type: 'ore_face',
        },
        {
          elevationM: -60,
          label: 'Deep Level 12 Extraction Stope (-60m MSL)',
          pathD: 'M 90 155 Q 280 135 450 155',
          color: '#8B5CF6',
          type: 'stope_level',
        },
      ],
      haulRoads: [
        {
          name: 'Main Vertical Production Shaft #1 (420m depth)',
          gradePct: 90.0,
          pathD: 'M 140 35 L 140 170',
          lengthM: 420,
        },
        {
          name: 'Holmes Shaft Incline Winder',
          gradePct: 35.0,
          pathD: 'M 380 35 L 320 165',
          lengthM: 580,
        },
      ],
      equipmentAssets: [
        {
          id: 'EQ-WN-01',
          name: 'Double Drum 1200kW Friction Winder',
          type: 'Headframe Winder',
          status: 'ACTIVE',
          location: 'Production Shaft #1',
          x: 140,
          y: 40,
          operator: 'Hoist Master S. Rao',
        },
        {
          id: 'EQ-LHD-03',
          name: 'Sandvik LH203 Underground LHD Loader',
          type: 'Excavator',
          status: 'ACTIVE',
          location: 'Level 8 Stope 4B',
          x: 280,
          y: 115,
          operator: 'Drift Team Delta',
        },
        {
          id: 'EQ-CR-01',
          name: 'Underground Jaw Crusher (300 t/h)',
          type: 'Primary Crusher',
          status: 'ACTIVE',
          location: 'Level 10 Crusher Chamber',
          x: 210,
          y: 145,
          operator: 'Plant Operator K. Patel',
        },
      ],
    },

    satelliteConfig: {
      sensor: 'Sentinel-2B MSI + Sentinel-1 SAR',
      lastPassDate: '2026-08-29',
      cloudCoverPct: 2.0,
      spatialResolution: '10m Optical / 5m SAR',
      availableLayers: [
        {
          id: 'TRUE_COLOR',
          label: 'Surface Infrastructure (RGB)',
          icon: '🛰️',
          type: 'OPTICAL',
          isLiveConnected: true,
          sampleOverlayColor: 'transparent',
          description: 'High-resolution surface shaft heads, beneficiation plant, and tailings layout.',
        },
        {
          id: 'SAR_SUBSIDENCE',
          label: 'InSAR Ground Subsidence',
          icon: '📡',
          type: 'SAR',
          isLiveConnected: true,
          sampleOverlayColor: '#8b5cf6',
          description: 'Millimeter-level ground stability and shaft collar deformation monitoring.',
        },
        {
          id: 'THERMAL_LST',
          label: 'Thermal Venting Discharge',
          icon: '🌡️',
          type: 'THERMAL',
          isLiveConnected: true,
          sampleOverlayColor: '#ef4444',
          description: 'Ventilation exhaust temperature and subsurface thermal dissipation.',
        },
      ],
    },

    prospectivityZones: [
      {
        id: 'PZ-BG-04',
        name: 'Bharweli Deep South Stope (Level 12)',
        scorePct: 94.0,
        confidencePct: 96.5,
        estimatedTonnageKt: 320.0,
        dominantGradePct: 48.8,
        structuralContext: 'Continuous 2.8km synclinal manganese ore shoot plunging 45° S',
        polygonD: 'M 180 80 L 360 85 L 340 160 L 160 155 Z',
        geoPolygon: [
          [21.871, 80.184],
          [21.873, 80.189],
          [21.868, 80.188],
          [21.867, 80.183],
        ],
        evidence: [
          'Confirmed continuous ore body extending below -100m MSL',
          'Underground diamond drilling borehole UGD-118 intersected 18.2m @ 49.4% Mn',
          'High density braunsite ore (sp. gravity 4.6 g/cm³)',
          'High-capacity shaft winder allows direct skip hoisting to surface',
        ],
        recommendedAction: 'Commission Level 12 decline development for full extraction.',
      },
    ],

    drillHoles: [
      {
        id: 'DH-BG-102',
        holeCode: 'UGD-BG-102',
        lat: 21.871,
        lng: 80.186,
        x: 240,
        y: 95,
        depthM: 320.0,
        interceptLengthM: 18.2,
        avgGradePct: 49.4,
        mineralization: 'Massive Crystalline Braunsite',
        status: 'CONFIRMED_ORE',
      },
      {
        id: 'DH-BG-115',
        holeCode: 'UGD-BG-115',
        lat: 21.869,
        lng: 80.187,
        x: 320,
        y: 135,
        depthM: 410.0,
        interceptLengthM: 15.6,
        avgGradePct: 48.1,
        mineralization: 'Braunsite-Quartzite Band',
        status: 'CONFIRMED_ORE',
      },
    ],

    structuralFeatures: [
      {
        name: 'Bharweli Major Syncline Axis',
        strike: 'N15°E',
        dip: '75° SE',
        trendLineD: 'M 120 180 L 260 100 L 400 20',
        type: 'Syncline Axis',
      },
      {
        name: 'South Boundary Shear Contact',
        strike: 'N20°E',
        dip: '80° SE',
        trendLineD: 'M 80 150 L 220 80 L 370 10',
        type: 'Shear Contact',
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // 3. CHIKLA MINE (Underground Mine, Bhandara, MH - Sitasaongi Block)
  // ----------------------------------------------------------------------------
  'chikla': {
    mineId: 'chikla',
    mineName: 'Chikla Underground Mine',
    shortCode: 'CK-01',
    type: 'Underground',
    state: 'Maharashtra',
    district: 'Bhandara',
    latitude: 21.565,
    longitude: 79.755,
    elevationMsl: 295,
    leaseAreaHa: 120.0,
    geologicalFormation: 'Mansar Formation (Sausar Group)',
    dominantMineral: 'Braunsite, Hollandite & Jacobsite',

    terrainData: {
      boundaryCoords: [
        [21.570, 79.750],
        [21.571, 79.760],
        [21.560, 79.759],
        [21.559, 79.749],
      ],
      pitWorkingAreaCoords: [
        [21.567, 79.753],
        [21.568, 79.758],
        [21.563, 79.757],
        [21.562, 79.752],
      ],
      elevationRangeM: { min: 40, max: 295 },
      contours: [
        {
          elevationM: 295,
          label: 'Surface Adit Portal (+295m MSL)',
          pathD: 'M 40 40 L 500 40',
          color: '#0E7C7B',
          type: 'shaft_collar',
        },
        {
          elevationM: 210,
          label: 'Level 2 Track Haulage (+210m MSL)',
          pathD: 'M 60 80 Q 270 60 480 80',
          color: '#3B82F6',
          type: 'bench',
        },
        {
          elevationM: 120,
          label: 'Level 5 Sitasaongi Ore Band (+120m MSL)',
          pathD: 'M 80 120 Q 270 100 460 120',
          color: '#F59E0B',
          type: 'ore_face',
        },
      ],
      haulRoads: [
        {
          name: 'Chikla Main Incline Haulage Track',
          gradePct: 22.0,
          pathD: 'M 120 40 L 260 140',
          lengthM: 650,
        },
      ],
      equipmentAssets: [
        {
          id: 'EQ-TR-01',
          name: 'Battery Electric Mine Locomotive',
          type: 'Dumper Fleet',
          status: 'ACTIVE',
          location: 'Level 2 Main Haulage',
          x: 220,
          y: 80,
          operator: 'Operator N. Shinde',
        },
      ],
    },

    satelliteConfig: {
      sensor: 'Sentinel-2B MSI (10m)',
      lastPassDate: '2026-08-28',
      cloudCoverPct: 0.0,
      spatialResolution: '10m / Pixel',
      availableLayers: [
        {
          id: 'TRUE_COLOR',
          label: 'Surface Plant & Adit (RGB)',
          icon: '🛰️',
          type: 'OPTICAL',
          isLiveConnected: true,
          sampleOverlayColor: 'transparent',
          description: 'True-color surface view of adit portals, rail siding, and stockyard.',
        },
        {
          id: 'NDVI',
          label: 'Eco Buffer Zone',
          icon: '🌿',
          type: 'NDVI',
          isLiveConnected: true,
          sampleOverlayColor: '#15803d',
          description: 'Environmental green belt compliance tracking surrounding Chikla hill.',
        },
      ],
    },

    prospectivityZones: [
      {
        id: 'PZ-CK-02',
        name: 'Sitasaongi West Fold Limb',
        scorePct: 82.0,
        confidencePct: 87.0,
        estimatedTonnageKt: 140.0,
        dominantGradePct: 43.5,
        structuralContext: 'Tight isoclinal synform with 2.2m average reef thickness',
        polygonD: 'M 140 70 L 320 75 L 300 145 L 120 140 Z',
        geoPolygon: [
          [21.566, 79.752],
          [21.568, 79.757],
          [21.564, 79.756],
          [21.563, 79.751],
        ],
        evidence: [
          'High grade continuity across 4 underground sub-levels',
          'Core sample assay confirmed 43.8% Mn and 0.18% Phosphorus',
          'Existing decline track directly intersects reef footwall',
        ],
        recommendedAction: 'Expand mechanized stope drilling along west limb.',
      },
    ],

    drillHoles: [
      {
        id: 'DH-CK-04',
        holeCode: 'DH-CK-04',
        lat: 21.566,
        lng: 79.754,
        x: 210,
        y: 105,
        depthM: 140.0,
        interceptLengthM: 11.2,
        avgGradePct: 44.0,
        mineralization: 'Massive Braunsite Reef',
        status: 'CONFIRMED_ORE',
      },
    ],

    structuralFeatures: [
      {
        name: 'Sitasaongi Isoclinal Fold Axis',
        strike: 'N80°E',
        dip: '72° S',
        trendLineD: 'M 50 140 L 270 90 L 480 50',
        type: 'Anticline Axis',
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // 4. KANDRI MINE (Opencast / Underground Transition, Nagpur, MH)
  // ----------------------------------------------------------------------------
  'kandri': {
    mineId: 'kandri',
    mineName: 'Kandri Mine',
    shortCode: 'KD-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Nagpur',
    latitude: 21.415,
    longitude: 79.280,
    elevationMsl: 310,
    leaseAreaHa: 105.0,
    geologicalFormation: 'Mansar Stage (Sausar Group)',
    dominantMineral: 'High-Grade Braunsite & Hausmannite',

    terrainData: {
      boundaryCoords: [
        [21.420, 79.275],
        [21.421, 79.285],
        [21.410, 79.284],
        [21.409, 79.274],
      ],
      pitWorkingAreaCoords: [
        [21.418, 79.278],
        [21.419, 79.283],
        [21.413, 79.282],
        [21.412, 79.277],
      ],
      elevationRangeM: { min: 210, max: 310 },
      contours: [
        {
          elevationM: 310,
          label: 'Kandri Hill Top Crest (+310m MSL)',
          pathD: 'M 30 45 Q 180 15 300 45 T 510 45',
          color: '#64748B',
          type: 'crest',
        },
        {
          elevationM: 260,
          label: 'Working Ore Bench (+260m MSL)',
          pathD: 'M 60 95 Q 200 65 300 95 T 470 95',
          color: '#F59E0B',
          type: 'ore_face',
        },
        {
          elevationM: 210,
          label: 'Bottom Pit Floor & Incline Sump (+210m MSL)',
          pathD: 'M 90 145 Q 220 115 300 145 T 430 145',
          color: '#3B82F6',
          type: 'sump',
        },
      ],
      haulRoads: [
        {
          name: 'Kandri Spiral Haul Road',
          gradePct: 8.0,
          pathD: 'M 80 45 L 180 90 L 310 135',
          lengthM: 720,
        },
      ],
      equipmentAssets: [
        {
          id: 'EQ-KD-EX02',
          name: 'Komatsu PC450 Hydraulic Shovel',
          type: 'Excavator',
          status: 'ACTIVE',
          location: 'South Pit Face',
          x: 230,
          y: 95,
          operator: 'Operator V. Gaikwad',
        },
      ],
    },

    satelliteConfig: {
      sensor: 'Sentinel-2B MSI (10m)',
      lastPassDate: '2026-08-28',
      cloudCoverPct: 0.0,
      spatialResolution: '10m / Pixel',
      availableLayers: [
        {
          id: 'TRUE_COLOR',
          label: 'True Color (RGB)',
          icon: '🛰️',
          type: 'OPTICAL',
          isLiveConnected: true,
          sampleOverlayColor: 'transparent',
          description: 'High-resolution pit progression and bench stability imagery.',
        },
      ],
    },

    prospectivityZones: [
      {
        id: 'PZ-KD-01',
        name: 'Kandri South Syncline Ore Body',
        scorePct: 89.0,
        confidencePct: 91.0,
        estimatedTonnageKt: 165.0,
        dominantGradePct: 47.0,
        structuralContext: 'South plunging synclinal fold with 12m thick massive braunsite band',
        polygonD: 'M 160 65 L 360 70 L 330 145 L 140 140 Z',
        geoPolygon: [
          [21.417, 79.279],
          [21.418, 79.283],
          [21.414, 79.282],
          [21.413, 79.278],
        ],
        evidence: [
          'High grade assay averaging 47.0% Mn with low silica (<6%)',
          'Drill hole KD-DH-08 intersected 16.5m ore intercept at 65m depth',
        ],
        recommendedAction: 'Accelerate pushback to expose high grade ore body.',
      },
    ],

    drillHoles: [
      {
        id: 'DH-KD-08',
        holeCode: 'DH-KD-08',
        lat: 21.416,
        lng: 79.281,
        x: 250,
        y: 100,
        depthM: 95.0,
        interceptLengthM: 16.5,
        avgGradePct: 47.0,
        mineralization: 'Massive Braunsite',
        status: 'CONFIRMED_ORE',
      },
    ],

    structuralFeatures: [
      {
        name: 'Kandri Main Synclinal Axis',
        strike: 'N75°E',
        dip: '70° S',
        trendLineD: 'M 40 120 L 260 85 L 480 50',
        type: 'Syncline Axis',
      },
    ],
  },

  // ----------------------------------------------------------------------------
  // 5. TIRODI MINE (Extensive Open-Cast Manganese Mine, Balaghat, MP)
  // ----------------------------------------------------------------------------
  'tirodi': {
    mineId: 'tirodi',
    mineName: 'Tirodi Opencast Mine',
    shortCode: 'TR-01',
    type: 'Open Cast',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    latitude: 21.680,
    longitude: 79.720,
    elevationMsl: 300,
    leaseAreaHa: 210.0,
    geologicalFormation: 'Tirodi Biotite Gneiss & Mansar Schist',
    dominantMineral: 'High-Grade Braunsite & Manganese Dioxide',

    terrainData: {
      boundaryCoords: [
        [21.686, 79.713],
        [21.687, 79.727],
        [21.674, 79.726],
        [21.673, 79.712],
      ],
      pitWorkingAreaCoords: [
        [21.683, 79.717],
        [21.684, 79.724],
        [21.677, 79.723],
        [21.676, 79.716],
      ],
      elevationRangeM: { min: 230, max: 300 },
      contours: [
        {
          elevationM: 300,
          label: 'North Pit Rim (+300m MSL)',
          pathD: 'M 20 40 Q 150 15 280 40 T 520 40',
          color: '#64748B',
          type: 'crest',
        },
        {
          elevationM: 265,
          label: 'Central Working Ore Bench (+265m MSL)',
          pathD: 'M 50 90 Q 170 60 280 90 T 490 90',
          color: '#F59E0B',
          type: 'ore_face',
        },
        {
          elevationM: 230,
          label: 'Tirodi Sump Floor (+230m MSL)',
          pathD: 'M 80 140 Q 190 110 280 140 T 460 140',
          color: '#3B82F6',
          type: 'sump',
        },
      ],
      haulRoads: [
        {
          name: 'Main South Link Haul Road',
          gradePct: 7.5,
          pathD: 'M 90 40 L 190 85 L 310 135',
          lengthM: 890,
        },
      ],
      equipmentAssets: [
        {
          id: 'EQ-TR-EX05',
          name: 'Volvo EC750D Excavator',
          type: 'Excavator',
          status: 'ACTIVE',
          location: 'Central Tirodi Pit Face',
          x: 260,
          y: 90,
          operator: 'Operator M. Yadav',
        },
      ],
    },

    satelliteConfig: {
      sensor: 'Sentinel-2B MSI (10m)',
      lastPassDate: '2026-08-28',
      cloudCoverPct: 0.0,
      spatialResolution: '10m / Pixel',
      availableLayers: [
        {
          id: 'TRUE_COLOR',
          label: 'True Color (RGB)',
          icon: '🛰️',
          type: 'OPTICAL',
          isLiveConnected: true,
          sampleOverlayColor: 'transparent',
          description: 'High-resolution natural optical surface imagery.',
        },
        {
          id: 'SOIL_MOISTURE',
          label: 'Soil Moisture Index',
          icon: '💧',
          type: 'MOISTURE',
          isLiveConnected: true,
          sampleOverlayColor: '#0284c7',
          description: 'Moisture accumulation tracking across low-lying sump sectors.',
        },
      ],
    },

    prospectivityZones: [
      {
        id: 'PZ-TR-05',
        name: 'Tirodi West Reef Extension',
        scorePct: 86.5,
        confidencePct: 90.0,
        estimatedTonnageKt: 210.0,
        dominantGradePct: 44.5,
        structuralContext: 'Folded braunsite bed in contact with Tirodi gneiss basement',
        polygonD: 'M 180 65 L 380 70 L 350 145 L 160 140 Z',
        geoPolygon: [
          [21.682, 79.718],
          [21.684, 79.723],
          [21.679, 79.722],
          [21.678, 79.717],
        ],
        evidence: [
          'High lateral continuity along 1.2km strike length',
          'Assay samples indicate 44.5% Mn with low phosphorus (<0.12%)',
          'Accessible with minimal pre-stripping requirement',
        ],
        recommendedAction: 'Incorporate into upcoming quarterly extraction schedule.',
      },
    ],

    drillHoles: [
      {
        id: 'DH-TR-12',
        holeCode: 'DH-TR-12',
        lat: 21.681,
        lng: 79.720,
        x: 270,
        y: 95,
        depthM: 90.0,
        interceptLengthM: 13.5,
        avgGradePct: 44.5,
        mineralization: 'Braunsite & Psilomelane',
        status: 'CONFIRMED_ORE',
      },
    ],

    structuralFeatures: [
      {
        name: 'Tirodi Gneissic Contact Fault',
        strike: 'N60°E',
        dip: '65° NW',
        trendLineD: 'M 40 140 L 270 95 L 500 50',
        type: 'Shear Contact',
      },
    ],
  },
};

// Helper function to safely fetch mine intelligence profile
export function getMineIntelligenceProfile(mineId: string): MineIntelligenceProfile {
  return MINE_INTELLIGENCE_DATA[mineId] || MINE_INTELLIGENCE_DATA['dongri-buzurg'];
}

// Future FastAPI loader service stub (GET /mines/{mineId})
export async function fetchMineIntelligenceApi(mineId: string): Promise<MineIntelligenceProfile> {
  // When FastAPI backend is connected:
  // const res = await fetch(`/api/v1/mines/${mineId}/intelligence`);
  // return await res.json();
  return Promise.resolve(getMineIntelligenceProfile(mineId));
}
