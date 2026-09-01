export interface MineGeoLocation {
  id: string;
  name: string;
  shortCode: string;
  location: string;
  district: string;
  state: 'Maharashtra' | 'Madhya Pradesh' | 'Odisha' | 'Karnataka' | 'Andhra Pradesh';
  type: 'Open Cast' | 'Underground';
  status: 'Active' | 'Exploration Phase' | 'Care & Maintenance';
  isPilot: boolean;
  latitude: number;
  longitude: number;
  gradePct: string;
  estimatedReserveTons: number;
  currentAnnualProductionTons: number;
  operator: string;
  depthMeters: number;
}

export interface ExplorationTarget {
  id: string;
  rank: number;
  name: string;
  region: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  priorityScore: number; // 0 - 100
  confidence: number; // 0 - 100%
  uncertainty: 'Low' | 'Medium' | 'High';
  prospectivityLevel: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  modelProspectivityPct: number;
  drillStatus: string;
  reasons: Array<{
    tag: 'Spectral' | 'Structural' | 'Geology' | 'Validation' | 'Geochemistry' | 'Terrain';
    label: string;
    strength: number; // 0 - 1
  }>;
  validation: Array<{
    label: string;
    status: boolean;
  }>;
  nearestMines: Array<{
    name: string;
    distanceKm: number;
  }>;
  recommendedStep: string;
  recommendation: string;
}

export interface EquipmentTelemetry {
  id: string;
  tag: string;
  type: 'Excavator' | 'Haul Truck' | 'Drill Rig' | 'Continuous Miner' | 'Sump Pump';
  mineId: string;
  mineName: string;
  latitude: number;
  longitude: number;
  status: 'Active' | 'Idle' | 'Maintenance';
  operator: string;
  telemetry: {
    engineLoadPct: number;
    fuelLevelPct: number;
    operatingHoursToday: number;
  };
}

export interface ExplorationLicenseArea {
  id: string;
  name: string;
  code: string;
  state: string;
  areaSqKm: number;
  coordinates: [number, number][]; // Polygon [lat, lng]
  status: 'Granted' | 'Under Clearance' | 'Prospecting Tender';
}

export interface GeologicalLineament {
  id: string;
  name: string;
  type: 'Shear Zone' | 'Fault Axis' | 'Thrust Boundary';
  coordinates: [number, number][];
}

export interface ProspectivityHotspot {
  id: string;
  beltName: string;
  center: [number, number]; // [lat, lng]
  radiusKm: number;
  intensity: number; // 0 to 1
  level: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  dominantGrade: string;
  description: string;
}

export interface SpectralReflectancePoint {
  band: string;
  wavelengthNm: number;
  reflectance: number;
  mineralFeature: string;
}

// ── Leaflet Tile Providers (Configurable & Free) ──────────────────────────────
export const TILE_PROVIDERS = {
  dark: {
    name: 'Esri Dark Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap',
  },
  light: {
    name: 'Esri Light Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; OpenStreetMap',
  },
  satellite: {
    name: 'Esri World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
  },
  osm: {
    name: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. ALL MANGANESE MINES (MOIL + National Occurrences)
// ─────────────────────────────────────────────────────────────────────────────
export const MANGANESE_MINES_DATA: MineGeoLocation[] = [
  // Maharashtra Belt (Nagpur - Bhandara)
  {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Mine',
    shortCode: 'DB-01',
    location: 'Bhandara, Maharashtra',
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Open Cast',
    status: 'Active',
    isPilot: true,
    latitude: 21.5540,
    longitude: 79.7020,
    gradePct: '42% - 49% Mn (Dioxide Ore)',
    estimatedReserveTons: 14850000,
    currentAnnualProductionTons: 420000,
    operator: 'MOIL Limited',
    depthMeters: 85,
  },
  {
    id: 'chikla',
    name: 'Chikla Mine',
    shortCode: 'CK-02',
    location: 'Bhandara, Maharashtra',
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.5820,
    longitude: 79.7460,
    gradePct: '38% - 44% Mn',
    estimatedReserveTons: 8200000,
    currentAnnualProductionTons: 250000,
    operator: 'MOIL Limited',
    depthMeters: 210,
  },
  {
    id: 'kandri',
    name: 'Kandri Mine',
    shortCode: 'KD-03',
    location: 'Nagpur, Maharashtra',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.4180,
    longitude: 79.2820,
    gradePct: '44% - 48% Mn',
    estimatedReserveTons: 9400000,
    currentAnnualProductionTons: 290000,
    operator: 'MOIL Limited',
    depthMeters: 240,
  },
  {
    id: 'mansar',
    name: 'Mansar Mine',
    shortCode: 'MS-04',
    location: 'Nagpur, Maharashtra',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.3980,
    longitude: 79.2550,
    gradePct: '36% - 42% Mn',
    estimatedReserveTons: 5100000,
    currentAnnualProductionTons: 165000,
    operator: 'MOIL Limited',
    depthMeters: 180,
  },
  {
    id: 'gumgaon',
    name: 'Gumgaon Mine',
    shortCode: 'GG-05',
    location: 'Nagpur, Maharashtra',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.3700,
    longitude: 79.0300,
    gradePct: '37% - 43% Mn',
    estimatedReserveTons: 6300000,
    currentAnnualProductionTons: 185000,
    operator: 'MOIL Limited',
    depthMeters: 225,
  },
  {
    id: 'beldongri',
    name: 'Beldongri Mine',
    shortCode: 'BD-06',
    location: 'Nagpur, Maharashtra',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.3500,
    longitude: 79.2900,
    gradePct: '35% - 40% Mn',
    estimatedReserveTons: 3800000,
    currentAnnualProductionTons: 120000,
    operator: 'MOIL Limited',
    depthMeters: 160,
  },

  // Madhya Pradesh Belt (Balaghat Belt)
  {
    id: 'balaghat',
    name: 'Balaghat Mine (Bharweli)',
    shortCode: 'BG-07',
    location: 'Balaghat, Madhya Pradesh',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.8700,
    longitude: 80.1850,
    gradePct: '46% - 52% Mn (Deep High-Grade)',
    estimatedReserveTons: 22400000,
    currentAnnualProductionTons: 580000,
    operator: 'MOIL Limited',
    depthMeters: 385,
  },
  {
    id: 'ukwa',
    name: 'Ukwa Mine',
    shortCode: 'UK-08',
    location: 'Balaghat, Madhya Pradesh',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.9700,
    longitude: 80.4600,
    gradePct: '40% - 44% Mn',
    estimatedReserveTons: 7100000,
    currentAnnualProductionTons: 210000,
    operator: 'MOIL Limited',
    depthMeters: 195,
  },
  {
    id: 'tirodi',
    name: 'Tirodi Mine',
    shortCode: 'TR-09',
    location: 'Balaghat, Madhya Pradesh',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 21.6880,
    longitude: 79.7120,
    gradePct: '38% - 45% Mn',
    estimatedReserveTons: 9800000,
    currentAnnualProductionTons: 310000,
    operator: 'MOIL Limited',
    depthMeters: 90,
  },
  {
    id: 'sitapatore',
    name: 'Sitapatore Mine',
    shortCode: 'SP-10',
    location: 'Balaghat, Madhya Pradesh',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 21.7200,
    longitude: 79.7600,
    gradePct: '34% - 39% Mn',
    estimatedReserveTons: 4200000,
    currentAnnualProductionTons: 140000,
    operator: 'MOIL Limited',
    depthMeters: 70,
  },
  {
    id: 'sukli',
    name: 'Sukli Mine',
    shortCode: 'SK-11',
    location: 'Balaghat, Madhya Pradesh',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    status: 'Active',
    isPilot: false,
    latitude: 21.6500,
    longitude: 79.7300,
    gradePct: '36% - 41% Mn',
    estimatedReserveTons: 3500000,
    currentAnnualProductionTons: 110000,
    operator: 'MOIL Limited',
    depthMeters: 140,
  },

  // Odisha Manganese Belt Occurrences (GSI / National Inventory)
  {
    id: 'joda-west',
    name: 'Joda West Mn Deposit',
    shortCode: 'OD-01',
    location: 'Keonjhar, Odisha',
    district: 'Keonjhar',
    state: 'Odisha',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 22.0250,
    longitude: 85.4200,
    gradePct: '35% - 42% Mn',
    estimatedReserveTons: 16500000,
    currentAnnualProductionTons: 450000,
    operator: 'State / Private Leases',
    depthMeters: 110,
  },
  {
    id: 'siljora-kalimati',
    name: 'Siljora Kalimati Mn Mine',
    shortCode: 'OD-02',
    location: 'Sundargarh, Odisha',
    district: 'Sundargarh',
    state: 'Odisha',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 21.8500,
    longitude: 85.3400,
    gradePct: '32% - 38% Mn',
    estimatedReserveTons: 11200000,
    currentAnnualProductionTons: 320000,
    operator: 'State Leases',
    depthMeters: 95,
  },

  // Karnataka Manganese Belt (Sandur - Bellary - Chitradurga)
  {
    id: 'sandur-central',
    name: 'Sandur Deogiri Manganese Complex',
    shortCode: 'KA-01',
    location: 'Bellary, Karnataka',
    district: 'Bellary',
    state: 'Karnataka',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 15.0850,
    longitude: 76.5500,
    gradePct: '30% - 38% Mn (Ferro-Mn Grade)',
    estimatedReserveTons: 18900000,
    currentAnnualProductionTons: 480000,
    operator: 'SMIORE / Leases',
    depthMeters: 120,
  },
  {
    id: 'kumsi-shimoga',
    name: 'Kumsi Prospect Area',
    shortCode: 'KA-02',
    location: 'Shimoga, Karnataka',
    district: 'Shimoga',
    state: 'Karnataka',
    type: 'Open Cast',
    status: 'Exploration Phase',
    isPilot: false,
    latitude: 14.0400,
    longitude: 75.4100,
    gradePct: '28% - 34% Mn',
    estimatedReserveTons: 4900000,
    currentAnnualProductionTons: 0,
    operator: 'Exploration Tender',
    depthMeters: 45,
  },

  // Andhra Pradesh Belt
  {
    id: 'garividi-ap',
    name: 'Garividi - Srikakulam Manganese Unit',
    shortCode: 'AP-01',
    location: 'Vizianagaram, Andhra Pradesh',
    district: 'Vizianagaram',
    state: 'Andhra Pradesh',
    type: 'Open Cast',
    status: 'Active',
    isPilot: false,
    latitude: 18.2800,
    longitude: 83.5400,
    gradePct: '32% - 36% Mn',
    estimatedReserveTons: 6100000,
    currentAnnualProductionTons: 175000,
    operator: 'FACOR / APMDC',
    depthMeters: 75,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXPLORATION TARGETS (Ranked AI Target Areas)
// ─────────────────────────────────────────────────────────────────────────────
export const EXPLORATION_TARGETS_DATA: ExplorationTarget[] = [
  {
    id: 'tgt-balaghat-alpha',
    rank: 1,
    name: 'Balaghat Alpha',
    region: 'Bharweli-Ukwa Corridor',
    state: 'Madhya Pradesh',
    latitude: 21.8700,
    longitude: 80.1850,
    radiusKm: 14.5,
    priorityScore: 92,
    confidence: 89,
    uncertainty: 'Low',
    prospectivityLevel: 'Very High',
    modelProspectivityPct: 93,
    drillStatus: '3 holes — 2 completed (48.2% Mn), 1 in progress',
    reasons: [
      { tag: 'Spectral', label: 'Strong ASTER band ratio (B4/B7) spectral anomaly', strength: 0.94 },
      { tag: 'Structural', label: 'N-S lineament shear proximity < 200m', strength: 0.89 },
      { tag: 'Geology', label: 'Favourable Gondite-Sausar contact metamorphic unit', strength: 0.91 },
      { tag: 'Validation', label: 'Nearby drill assays confirm 48.2% Mn grade intercept', strength: 0.96 },
    ],
    validation: [
      { label: 'GSI occurrence overlap', status: true },
      { label: 'Drill hole confirmation (Cored)', status: true },
      { label: 'Geochemical sampling (XRF verified)', status: true },
      { label: 'Geophysical survey (IP/Resistivity anomaly)', status: true },
    ],
    nearestMines: [
      { name: 'Balaghat Bharweli Mine', distanceKm: 3.2 },
      { name: 'Ukwa Deep Shaft', distanceKm: 18.5 },
      { name: 'Tirodi Open Cast', distanceKm: 28.4 },
    ],
    recommendedStep: 'Prioritize for deep core drilling & resource block modeling',
    recommendation:
      'High confidence prospectivity confirmed by coincident thermal IR spectral signatures and borehole assays. Accelerate resource definition drilling before mine plan finalization.',
  },
  {
    id: 'tgt-dongri-deep',
    rank: 2,
    name: 'Dongri Buzurg North-East Deep',
    region: 'Dongri-Chikla Suture Belt',
    state: 'Maharashtra',
    latitude: 21.5540,
    longitude: 79.7020,
    radiusKm: 12.0,
    priorityScore: 94,
    confidence: 91,
    uncertainty: 'Low',
    prospectivityLevel: 'Very High',
    modelProspectivityPct: 95,
    drillStatus: '4 drill holes completed — 45.8% avg Mn grade',
    reasons: [
      { tag: 'Spectral', label: 'SAR polarimetric dielectric anomaly & low NDVI', strength: 0.92 },
      { tag: 'Geology', label: 'Continuation of active Dongri manganese dioxide reef', strength: 0.95 },
      { tag: 'Structural', label: 'Major strike-slip fault axis intersection', strength: 0.88 },
      { tag: 'Validation', label: 'Pilot pit wall exposures confirm high grade pyrolusite', strength: 0.98 },
    ],
    validation: [
      { label: 'GSI occurrence overlap', status: true },
      { label: 'Drill hole confirmation (Cored)', status: true },
      { label: 'Geochemical sampling (XRF verified)', status: true },
      { label: 'Geophysical survey (IP/Resistivity anomaly)', status: true },
    ],
    nearestMines: [
      { name: 'Dongri Buzurg Pilot Pit', distanceKm: 0.8 },
      { name: 'Chikla Mine', distanceKm: 6.4 },
      { name: 'Sitapatore Deposit', distanceKm: 14.1 },
    ],
    recommendedStep: 'Incorporate into next quarterly production pit schedule',
    recommendation:
      'Direct structural continuation of the high-grade Dongri ore body. Immediate operational access recommended with pit bench pushback.',
  },
  {
    id: 'tgt-keonjhar-west',
    rank: 3,
    name: 'Keonjhar North Ridge',
    region: 'Keonjhar-Sundargarh Belt',
    state: 'Odisha',
    latitude: 21.9200,
    longitude: 85.3800,
    radiusKm: 18.0,
    priorityScore: 86,
    confidence: 83,
    uncertainty: 'Low',
    prospectivityLevel: 'High',
    modelProspectivityPct: 87,
    drillStatus: '2 scout drill holes planned for next quarter',
    reasons: [
      { tag: 'Geology', label: 'Iron Ore Group (IOG) shale-dolomite manganiferous contact', strength: 0.87 },
      { tag: 'Spectral', label: 'Elevated Land Surface Temperature (LST) thermal signature', strength: 0.82 },
      { tag: 'Structural', label: 'Regional synclinal limb structure orientation', strength: 0.84 },
      { tag: 'Geochemistry', label: 'Historical stream sediment Mn anomaly > 1200 ppm', strength: 0.88 },
    ],
    validation: [
      { label: 'GSI occurrence overlap', status: true },
      { label: 'Drill hole confirmation', status: false },
      { label: 'Geochemical sampling', status: true },
      { label: 'Geophysical survey', status: true },
    ],
    nearestMines: [
      { name: 'Joda West Deposit', distanceKm: 11.2 },
      { name: 'Siljora Kalimati', distanceKm: 14.8 },
    ],
    recommendedStep: 'Execute reconnaissance ground magnetic and scout drilling',
    recommendation:
      'Strong regional geochemical indicators and structural alignment. Target for greenfield prospecting tender allocation.',
  },
  {
    id: 'tgt-sandur-deogiri',
    rank: 4,
    name: 'Sandur Synclinorium South',
    region: 'Bellary-Sandur Schist Belt',
    state: 'Karnataka',
    latitude: 15.0850,
    longitude: 76.5500,
    radiusKm: 16.5,
    priorityScore: 79,
    confidence: 76,
    uncertainty: 'Medium',
    prospectivityLevel: 'Medium',
    modelProspectivityPct: 81,
    drillStatus: '1 exploratory borehole in-progress',
    reasons: [
      { tag: 'Geology', label: 'Dharwar Supergroup ferruginous manganese banded sequence', strength: 0.80 },
      { tag: 'Spectral', label: 'Moderate ASTER clay and oxide index anomaly', strength: 0.74 },
      { tag: 'Structural', label: 'Cross-faulting with moderate displacement', strength: 0.76 },
      { tag: 'Validation', label: 'Adjacent open pit operations support stratigraphy', strength: 0.82 },
    ],
    validation: [
      { label: 'GSI occurrence overlap', status: true },
      { label: 'Drill hole confirmation', status: false },
      { label: 'Geochemical sampling', status: true },
      { label: 'Geophysical survey', status: false },
    ],
    nearestMines: [
      { name: 'Sandur Central Complex', distanceKm: 4.5 },
      { name: 'Kumsi Exploration Area', distanceKm: 140.0 },
    ],
    recommendedStep: 'Complete ongoing borehole before allocating heavy CAPEX',
    recommendation:
      'Moderate to high potential within established regional schist belt. Await assay results from active drill hole.',
  },
  {
    id: 'tgt-tirodi-extension',
    rank: 5,
    name: 'Tirodi South-West Extension',
    region: 'Central Sausar Group',
    state: 'Madhya Pradesh',
    latitude: 21.6880,
    longitude: 79.7120,
    radiusKm: 9.5,
    priorityScore: 76,
    confidence: 74,
    uncertainty: 'Medium',
    prospectivityLevel: 'Medium',
    modelProspectivityPct: 78,
    drillStatus: 'Historical hole logged; assays pending re-testing',
    reasons: [
      { tag: 'Structural', label: 'Tirodi gneiss contact zone shear zone lineament', strength: 0.79 },
      { tag: 'Spectral', label: 'Sentinel-2 SWIR mineral absorption ratio signature', strength: 0.75 },
      { tag: 'Geology', label: 'Mansar Formation quartz-mica-schist host lithology', strength: 0.77 },
      { tag: 'Validation', label: 'Surrounding open-cast mine continuity', strength: 0.76 },
    ],
    validation: [
      { label: 'GSI occurrence overlap', status: true },
      { label: 'Drill hole confirmation', status: false },
      { label: 'Geochemical sampling', status: true },
      { label: 'Geophysical survey', status: false },
    ],
    nearestMines: [
      { name: 'Tirodi Open Cast', distanceKm: 2.1 },
      { name: 'Dongri Buzurg Hub', distanceKm: 18.2 },
      { name: 'Sitapatore Mine', distanceKm: 7.9 },
    ],
    recommendedStep: 'Schedule 2 infill diamond drill holes along shear axis',
    recommendation:
      'Suitable candidate for brownfield extension of existing open cast operations.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACTIVE FLEET EQUIPMENT (Real-Time GPS Telematics)
// ─────────────────────────────────────────────────────────────────────────────
export const ACTIVE_EQUIPMENT_DATA: EquipmentTelemetry[] = [
  {
    id: 'eq-db-ex-101',
    tag: 'EX-101 (CAT 390F)',
    type: 'Excavator',
    mineId: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Mine',
    latitude: 21.5562,
    longitude: 79.7041,
    status: 'Active',
    operator: 'V. Rathore',
    telemetry: { engineLoadPct: 88, fuelLevelPct: 74, operatingHoursToday: 6.8 },
  },
  {
    id: 'eq-db-ht-204',
    tag: 'HT-204 (Volvo FMX 460)',
    type: 'Haul Truck',
    mineId: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Mine',
    latitude: 21.5518,
    longitude: 79.6995,
    status: 'Active',
    operator: 'R. Meshram',
    telemetry: { engineLoadPct: 79, fuelLevelPct: 62, operatingHoursToday: 7.2 },
  },
  {
    id: 'eq-db-dr-03',
    tag: 'DR-03 (Epiroc SmartROC)',
    type: 'Drill Rig',
    mineId: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Mine',
    latitude: 21.5579,
    longitude: 79.7063,
    status: 'Active',
    operator: 'M. Shinde',
    telemetry: { engineLoadPct: 92, fuelLevelPct: 85, operatingHoursToday: 5.5 },
  },
  {
    id: 'eq-bg-ex-201',
    tag: 'EX-201 (Komatsu PC1250)',
    type: 'Excavator',
    mineId: 'balaghat',
    mineName: 'Balaghat Mine',
    latitude: 21.8725,
    longitude: 80.1882,
    status: 'Active',
    operator: 'K. Verma',
    telemetry: { engineLoadPct: 84, fuelLevelPct: 68, operatingHoursToday: 8.0 },
  },
  {
    id: 'eq-bg-ht-305',
    tag: 'HT-305 (BEML BH60M)',
    type: 'Haul Truck',
    mineId: 'balaghat',
    mineName: 'Balaghat Mine',
    latitude: 21.8680,
    longitude: 80.1820,
    status: 'Idle',
    operator: 'P. Tiwari',
    telemetry: { engineLoadPct: 22, fuelLevelPct: 53, operatingHoursToday: 4.3 },
  },
  {
    id: 'eq-tr-ex-104',
    tag: 'EX-104 (Tata Hitachi EX1200)',
    type: 'Excavator',
    mineId: 'tirodi',
    mineName: 'Tirodi Mine',
    latitude: 21.6902,
    longitude: 79.7145,
    status: 'Active',
    operator: 'S. Patle',
    telemetry: { engineLoadPct: 76, fuelLevelPct: 71, operatingHoursToday: 6.1 },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. EXPLORATION LICENSES / LEASE BOUNDARIES
// ─────────────────────────────────────────────────────────────────────────────
export const EXPLORATION_LICENSES_DATA: ExplorationLicenseArea[] = [
  {
    id: 'lic-moil-db',
    name: 'MOIL Dongri Buzurg ML-01',
    code: 'ML/MH/BHD/001',
    state: 'Maharashtra',
    areaSqKm: 18.4,
    status: 'Granted',
    coordinates: [
      [21.572, 79.675],
      [21.575, 79.728],
      [21.535, 79.732],
      [21.530, 79.680],
      [21.572, 79.675],
    ],
  },
  {
    id: 'lic-moil-bg',
    name: 'MOIL Balaghat Bharweli ML-04',
    code: 'ML/MP/BGT/004',
    state: 'Madhya Pradesh',
    areaSqKm: 24.6,
    status: 'Granted',
    coordinates: [
      [21.895, 80.150],
      [21.890, 80.220],
      [21.845, 80.225],
      [21.850, 80.155],
      [21.895, 80.150],
    ],
  },
  {
    id: 'lic-od-kj',
    name: 'Keonjhar North Composite PL-12',
    code: 'PL/OD/KJR/012',
    state: 'Odisha',
    areaSqKm: 32.1,
    status: 'Under Clearance',
    coordinates: [
      [22.080, 85.350],
      [22.070, 85.480],
      [21.900, 85.490],
      [21.910, 85.340],
      [22.080, 85.350],
    ],
  },
  {
    id: 'lic-ka-sd',
    name: 'Sandur-Deogiri Mining Block KA-08',
    code: 'ML/KA/BLY/008',
    state: 'Karnataka',
    areaSqKm: 28.5,
    status: 'Granted',
    coordinates: [
      [15.150, 76.480],
      [15.160, 76.620],
      [15.020, 76.630],
      [15.010, 76.490],
      [15.150, 76.480],
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. GEOLOGICAL LINEAMENTS & FAULT SYSTEMS
// ─────────────────────────────────────────────────────────────────────────────
export const GEOLOGICAL_LINEAMENTS_DATA: GeologicalLineament[] = [
  {
    id: 'lin-sausar-shear',
    name: 'Central Sausar Shear Axis (N-S Trend)',
    type: 'Shear Zone',
    coordinates: [
      [21.300, 79.100],
      [21.450, 79.350],
      [21.600, 79.720],
      [21.880, 80.190],
      [22.050, 80.500],
    ],
  },
  {
    id: 'lin-bhandara-fault',
    name: 'Dongri-Bhandara Cross Fault System',
    type: 'Fault Axis',
    coordinates: [
      [21.510, 79.600],
      [21.560, 79.710],
      [21.620, 79.820],
    ],
  },
  {
    id: 'lin-odisha-thrust',
    name: 'Eastern Ghats Mobile Belt Contact',
    type: 'Thrust Boundary',
    coordinates: [
      [21.750, 85.200],
      [21.950, 85.450],
      [22.100, 85.600],
    ],
  },
  {
    id: 'lin-sandur-fault',
    name: 'Sandur Schist Belt Major Lineament',
    type: 'Shear Zone',
    coordinates: [
      [14.950, 76.450],
      [15.100, 76.560],
      [15.250, 76.680],
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROSPECTIVITY HOTSPOTS (Smooth GIS Heatmap Centers & Radii)
// ─────────────────────────────────────────────────────────────────────────────
export const PROSPECTIVITY_HOTSPOTS_DATA: ProspectivityHotspot[] = [
  // High intensity Central India Belt (Balaghat - Bhandara - Nagpur)
  {
    id: 'hs-central-balaghat',
    beltName: 'Central India (Balaghat-Bhandara)',
    center: [21.8700, 80.1850],
    radiusKm: 65,
    intensity: 0.95,
    level: 'Very High',
    dominantGrade: '46% - 52% Mn (Gondite High-Grade Oxide)',
    description: 'Premier manganese ore belt of India containing deepest high-grade pyrolusite and braunite deposits.',
  },
  {
    id: 'hs-central-dongri',
    beltName: 'Central India (Dongri-Chikla)',
    center: [21.5540, 79.7020],
    radiusKm: 55,
    intensity: 0.93,
    level: 'Very High',
    dominantGrade: '42% - 49% Mn (Dioxide Ore)',
    description: 'Electrolytic Manganese Dioxide (EMD) and battery-grade manganese reserves.',
  },
  {
    id: 'hs-central-nagpur',
    beltName: 'Central India (Nagpur Kandri-Mansar)',
    center: [21.4000, 79.2500],
    radiusKm: 48,
    intensity: 0.86,
    level: 'High',
    dominantGrade: '38% - 46% Mn',
    description: 'Structural metasedimentary manganese reefs hosted within Sausar Group quartz-mica schists.',
  },

  // Odisha Belt (Keonjhar - Sundargarh)
  {
    id: 'hs-odisha-keonjhar',
    beltName: 'Odisha Belt (Keonjhar-Sundargarh)',
    center: [21.9500, 85.4200],
    radiusKm: 70,
    intensity: 0.88,
    level: 'High',
    dominantGrade: '35% - 44% Mn',
    description: 'Major ferruginous manganese and siliceous ore occurrences in the Bonai-Keonjhar Iron Ore Group basin.',
  },
  {
    id: 'hs-odisha-rayagada',
    beltName: 'Odisha Belt (Rayagada-Koraput)',
    center: [19.2000, 83.4000],
    radiusKm: 40,
    intensity: 0.65,
    level: 'Medium',
    dominantGrade: '28% - 36% Mn',
    description: 'Khondalite-hosted manganese lenses and lateritic cappings.',
  },

  // Karnataka Belt (Sandur - Bellary - Chitradurga)
  {
    id: 'hs-karnataka-sandur',
    beltName: 'Karnataka Belt (Bellary-Sandur)',
    center: [15.0850, 76.5500],
    radiusKm: 60,
    intensity: 0.78,
    level: 'Medium',
    dominantGrade: '30% - 38% Mn',
    description: 'Ferro-manganese and low phosphorus manganese ores within banded formation horizons.',
  },
  {
    id: 'hs-karnataka-shimoga',
    beltName: 'Karnataka Belt (Shimoga-Chitradurga)',
    center: [14.1000, 75.6000],
    radiusKm: 45,
    intensity: 0.58,
    level: 'Low',
    dominantGrade: '26% - 32% Mn',
    description: 'Stratiform and nodular deposits with high silica/iron association.',
  },

  // Andhra Pradesh Belt
  {
    id: 'hs-ap-vizianagaram',
    beltName: 'Andhra Pradesh Belt (Garividi)',
    center: [18.2800, 83.5400],
    radiusKm: 38,
    intensity: 0.68,
    level: 'Medium',
    dominantGrade: '32% - 36% Mn',
    description: 'Kodurite suite manganese formations along eastern mobile belt.',
  },

  // Gujarat / Panchmahal
  {
    id: 'hs-gujarat-panchmahal',
    beltName: 'Gujarat Belt (Panchmahal-Vadodara)',
    center: [22.6000, 73.6500],
    radiusKm: 35,
    intensity: 0.52,
    level: 'Low',
    dominantGrade: '25% - 30% Mn',
    description: 'Aravalli Supergroup associated manganese occurrences.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. SPECTRAL TELEMETRY (Sentinel-2 & ASTER Spectral Profiles)
// ─────────────────────────────────────────────────────────────────────────────
export const SPECTRAL_REFLECTANCE_DATA: SpectralReflectancePoint[] = [
  { band: 'B2 (Blue)', wavelengthNm: 490, reflectance: 0.058, mineralFeature: 'Baseline Atmospheric' },
  { band: 'B3 (Green)', wavelengthNm: 560, reflectance: 0.082, mineralFeature: 'Vegetation Background' },
  { band: 'B4 (Red)', wavelengthNm: 665, reflectance: 0.142, mineralFeature: 'Fe3+ Oxide Absorption' },
  { band: 'B5 (Red Edge)', wavelengthNm: 705, reflectance: 0.178, mineralFeature: 'Soil-Rock Transition' },
  { band: 'B7 (Red Edge)', wavelengthNm: 783, reflectance: 0.275, mineralFeature: 'High Mineral Albedo' },
  { band: 'B8 (NIR)', wavelengthNm: 842, reflectance: 0.312, mineralFeature: 'Rock Fabric Dispersion' },
  { band: 'B11 (SWIR-1)', wavelengthNm: 1610, reflectance: 0.198, mineralFeature: 'Mn-Hydroxide / Clay Dip' },
  { band: 'B12 (SWIR-2)', wavelengthNm: 2190, reflectance: 0.245, mineralFeature: 'Carbonate / Pyrolusite Peak' },
];

export const SPECTRAL_INDICES_METRICS = [
  { name: 'NDVI', value: '-0.14', description: 'Normalised Difference Vegetation Index (Low = Exposed Bare Ore Body)', status: 'Optimal Anomaly' },
  { name: 'BSI', value: '0.42', description: 'Bare Soil & Mineral Exposure Index', status: 'High Signature' },
  { name: 'Fe-Mn Absorption Ratio', value: '1.38', description: 'ASTER SWIR Iron-Manganese Mineral Ratio', status: 'Strong Target' },
  { name: 'Clay & Laterite Index', value: '0.68', description: 'Weathering alteration index over Sausar schists', status: 'Confirmed' },
  { name: 'LST Anomaly', value: '+3.4 °C', description: 'Land Surface Temperature thermal inertia contrast', status: 'Denser Bedrock' },
  { name: 'SAR Moisture Ratio', value: '0.31', description: 'Sentinel-1 SAR dielectric contrast over dry rock bench', status: 'Optimal' },
];

export const SATELLITE_ACQUISITION_METADATA = {
  primaryConstellation: 'Copernicus Sentinel-2B MSI + NASA ASTER Thermal IR',
  secondaryConstellation: 'ISRO RISAT-1A / EOS-04 SAR Backscatter (C-Band)',
  groundResolution: '10m Multi-spectral / 30m SWIR-Thermal',
  cloudCoverPct: '0.04%',
  acquisitionDate: '2026-08-29 10:42 UTC (Latest Telemetry Pass)',
  crs: 'EPSG:4326 (WGS84) / UTM Zone 44N',
  processingLevel: 'Level-2A Bottom-Of-Atmosphere (BOA) Surface Reflectance',
  aiModelEngine: 'MOIL Space-Spatial XGBoost v2.4 + Spatial Prior Ensemble',
};
