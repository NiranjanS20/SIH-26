// ==============================================================================
// MOIL Multi-Mine Production & AI Forecasting Profiles
// ==============================================================================

export interface MonthDataPoint {
  label: string;
  actual: number | null; // in metric tonnes
  target: number;
  forecast: number | null;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  isMonsoon?: boolean;
}

export interface FeatureImportanceItem {
  feature: string;
  weightPct: number;
  category: 'Environmental' | 'Operational' | 'Geological';
  color: string;
}

export interface MineProductionProfile {
  id: string;
  mineName: string;
  shortCode: string;
  type: 'Open Cast' | 'Underground';
  state: string;
  district: string;
  currentOutputTons: number;
  plannedTargetTons: number;
  predictedOutputTons: number;
  projectedGapTons: number;
  gapPct: number;
  potentialSourceZone: string;
  monthlyTrend: MonthDataPoint[];
  featureImportance: FeatureImportanceItem[];
  environmentalFactors: {
    rainfallPct: number;
    rainfallMm: number;
    ndvi: number;
    soilMoisturePct: number;
    temperatureC: number;
    equipmentAvailabilityPct: number;
    blastingDelayDays: number;
  };
}

export const MINE_PRODUCTION_PROFILES: Record<string, MineProductionProfile> = {
  'dongri-buzurg': {
    id: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Opencast Mine',
    shortCode: 'DB-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Bhandara',
    currentOutputTons: 4100,
    plannedTargetTons: 5000,
    predictedOutputTons: 4100,
    projectedGapTons: -900,
    gapPct: 18,
    potentialSourceZone: 'Zone 14 (South Extension)',
    monthlyTrend: [
      { label: 'Apr', actual: 4800, target: 5000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 5100, target: 5000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 4300, target: 5000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 3800, target: 5000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 4100, target: 5000, forecast: 4100, confidenceLower: 3850, confidenceUpper: 4350, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 5000, forecast: 4100, confidenceLower: 3750, confidenceUpper: 4450, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 5000, forecast: 4650, confidenceLower: 4200, confidenceUpper: 5100 },
      { label: 'Nov (Fcst)', actual: null, target: 5000, forecast: 5150, confidenceLower: 4700, confidenceUpper: 5600 },
    ],
    featureImportance: [
      { feature: 'Rainfall & Pit Sump Inflow', weightPct: 32, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Excavator & Haul Fleet Uptime', weightPct: 24, category: 'Operational', color: '#10B981' },
      { feature: 'Bench Soil Moisture & Siltation', weightPct: 18, category: 'Environmental', color: '#06B6D4' },
      { feature: 'Blasting Clearance Delay', weightPct: 15, category: 'Operational', color: '#F59E0B' },
      { feature: 'Reef Grade Heterogeneity', weightPct: 11, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 70,
      rainfallMm: 4.2,
      ndvi: 0.42,
      soilMoisturePct: 38,
      temperatureC: 31.4,
      equipmentAvailabilityPct: 80,
      blastingDelayDays: 2,
    },
  },

  'balaghat': {
    id: 'balaghat',
    mineName: 'Balaghat (Bharweli) Deep Underground Mine',
    shortCode: 'BG-01',
    type: 'Underground',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    currentOutputTons: 32500,
    plannedTargetTons: 35000,
    predictedOutputTons: 33200,
    projectedGapTons: -1800,
    gapPct: 5.1,
    potentialSourceZone: 'Bharweli Sub-Level Stope 400RL',
    monthlyTrend: [
      { label: 'Apr', actual: 34200, target: 35000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 35100, target: 35000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 33800, target: 35000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 31900, target: 35000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 32500, target: 35000, forecast: 32500, confidenceLower: 31200, confidenceUpper: 33800, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 35000, forecast: 33200, confidenceLower: 31800, confidenceUpper: 34600, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 35000, forecast: 35400, confidenceLower: 33800, confidenceUpper: 37000 },
      { label: 'Nov (Fcst)', actual: null, target: 35000, forecast: 36200, confidenceLower: 34500, confidenceUpper: 37900 },
    ],
    featureImportance: [
      { feature: 'Shaft Hoist & Winder Availability', weightPct: 36, category: 'Operational', color: '#10B981' },
      { feature: 'Deep Level Stope Ventilation', weightPct: 24, category: 'Operational', color: '#F59E0B' },
      { feature: 'Underground Dewatering Capacity', weightPct: 18, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Continuous Miner Fleet Utilization', weightPct: 14, category: 'Operational', color: '#06B6D4' },
      { feature: 'Ore Body Dip & Wall Stability', weightPct: 8, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 55,
      rainfallMm: 2.8,
      ndvi: 0.48,
      soilMoisturePct: 32,
      temperatureC: 28.6,
      equipmentAvailabilityPct: 88,
      blastingDelayDays: 1,
    },
  },

  'chikla': {
    id: 'chikla',
    mineName: 'Chikla Underground Mine',
    shortCode: 'CH-01',
    type: 'Underground',
    state: 'Maharashtra',
    district: 'Bhandara',
    currentOutputTons: 8400,
    plannedTargetTons: 9000,
    predictedOutputTons: 8550,
    projectedGapTons: -450,
    gapPct: 5.0,
    potentialSourceZone: 'Chikla Deep North Stope',
    monthlyTrend: [
      { label: 'Apr', actual: 8800, target: 9000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 9100, target: 9000, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 8600, target: 9000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 8100, target: 9000, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 8400, target: 9000, forecast: 8400, confidenceLower: 8000, confidenceUpper: 8800, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 9000, forecast: 8550, confidenceLower: 8100, confidenceUpper: 9000, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 9000, forecast: 9150, confidenceLower: 8700, confidenceUpper: 9600 },
      { label: 'Nov (Fcst)', actual: null, target: 9000, forecast: 9300, confidenceLower: 8800, confidenceUpper: 9800 },
    ],
    featureImportance: [
      { feature: 'Underground Rail & Tramming Uptime', weightPct: 30, category: 'Operational', color: '#10B981' },
      { feature: 'Sump Water Inflow Rate', weightPct: 25, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Stope Drilling & Charging Cycle', weightPct: 22, category: 'Operational', color: '#F59E0B' },
      { feature: 'Auxiliary Ventilation Fan Efficiency', weightPct: 13, category: 'Operational', color: '#06B6D4' },
      { feature: 'High-Grade Braunsite Ratio', weightPct: 10, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 62,
      rainfallMm: 3.6,
      ndvi: 0.44,
      soilMoisturePct: 35,
      temperatureC: 30.2,
      equipmentAvailabilityPct: 85,
      blastingDelayDays: 1,
    },
  },

  'kandri': {
    id: 'kandri',
    mineName: 'Kandri Opencast & Underground Mine',
    shortCode: 'KD-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Nagpur',
    currentOutputTons: 6900,
    plannedTargetTons: 7500,
    predictedOutputTons: 7050,
    projectedGapTons: -450,
    gapPct: 6.0,
    potentialSourceZone: 'Kandri Pit-2 West Face',
    monthlyTrend: [
      { label: 'Apr', actual: 7300, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 7600, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 7100, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 6600, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 6900, target: 7500, forecast: 6900, confidenceLower: 6500, confidenceUpper: 7300, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 7500, forecast: 7050, confidenceLower: 6600, confidenceUpper: 7500, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 7500, forecast: 7600, confidenceLower: 7100, confidenceUpper: 8100 },
      { label: 'Nov (Fcst)', actual: null, target: 7500, forecast: 7750, confidenceLower: 7250, confidenceUpper: 8250 },
    ],
    featureImportance: [
      { feature: 'Pit Slope & Bench Stability', weightPct: 30, category: 'Geological', color: '#8B5CF6' },
      { feature: 'Excavator & Tipper Availability', weightPct: 26, category: 'Operational', color: '#10B981' },
      { feature: 'Seasonal Rainfall Gradient', weightPct: 20, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Blasting Fragmentation Index', weightPct: 14, category: 'Operational', color: '#F59E0B' },
      { feature: 'Ore-Waste Stripping Ratio', weightPct: 10, category: 'Operational', color: '#06B6D4' },
    ],
    environmentalFactors: {
      rainfallPct: 60,
      rainfallMm: 3.1,
      ndvi: 0.39,
      soilMoisturePct: 34,
      temperatureC: 32.1,
      equipmentAvailabilityPct: 83,
      blastingDelayDays: 2,
    },
  },

  'tirodi': {
    id: 'tirodi',
    mineName: 'Tirodi Opencast Mine',
    shortCode: 'TR-01',
    type: 'Open Cast',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    currentOutputTons: 9200,
    plannedTargetTons: 9380,
    predictedOutputTons: 9250,
    projectedGapTons: -130,
    gapPct: 1.4,
    potentialSourceZone: 'Tirodi South Pit Section',
    monthlyTrend: [
      { label: 'Apr', actual: 9100, target: 9380, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 9500, target: 9380, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 8800, target: 9380, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 8100, target: 9380, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 9200, target: 9380, forecast: 9200, confidenceLower: 8900, confidenceUpper: 9500, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 9380, forecast: 9250, confidenceLower: 9050, confidenceUpper: 9450, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 9380, forecast: 9650, confidenceLower: 9300, confidenceUpper: 9800 },
      { label: 'Nov (Fcst)', actual: null, target: 9380, forecast: 9900, confidenceLower: 9500, confidenceUpper: 10200 },
    ],
    featureImportance: [
      { feature: 'Monsoon Sump Drainage', weightPct: 35, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Dumper Dispatch Efficiency', weightPct: 25, category: 'Operational', color: '#10B981' },
      { feature: 'Haul Road Traction & Silt', weightPct: 18, category: 'Environmental', color: '#06B6D4' },
      { feature: 'Drill Hole Charging Cycle', weightPct: 14, category: 'Operational', color: '#F59E0B' },
      { feature: 'Psilomelane Oxide Purity', weightPct: 8, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 65,
      rainfallMm: 3.8,
      ndvi: 0.46,
      soilMoisturePct: 37,
      temperatureC: 30.5,
      equipmentAvailabilityPct: 81,
      blastingDelayDays: 2,
    },
  },

  'sitapatore': {
    id: 'sitapatore',
    mineName: 'Sitapatore Opencast Mine',
    shortCode: 'SP-10',
    type: 'Open Cast',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    currentOutputTons: 1350,
    plannedTargetTons: 1415,
    predictedOutputTons: 1380,
    projectedGapTons: -35,
    gapPct: 2.4,
    potentialSourceZone: 'Pit 6 Active Face',
    monthlyTrend: [
      { label: 'Apr', actual: 1400, target: 1415, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 1420, target: 1415, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 1300, target: 1415, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 1250, target: 1415, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 1350, target: 1415, forecast: 1350, confidenceLower: 1200, confidenceUpper: 1450, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 1415, forecast: 1380, confidenceLower: 1250, confidenceUpper: 1500, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 1415, forecast: 1450, confidenceLower: 1350, confidenceUpper: 1550 },
      { label: 'Nov (Fcst)', actual: null, target: 1415, forecast: 1480, confidenceLower: 1400, confidenceUpper: 1600 },
    ],
    featureImportance: [
      { feature: 'Fleet Capacity & Uptime', weightPct: 40, category: 'Operational', color: '#10B981' },
      { feature: 'Pit 3 Non-operation Impact', weightPct: 25, category: 'Operational', color: '#F59E0B' },
      { feature: 'Monsoon Rainfall / Sump', weightPct: 15, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Blasting Cycle Efficiency', weightPct: 12, category: 'Operational', color: '#06B6D4' },
      { feature: 'Reef Continuity', weightPct: 8, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 65,
      rainfallMm: 3.5,
      ndvi: 0.44,
      soilMoisturePct: 35,
      temperatureC: 31.0,
      equipmentAvailabilityPct: 78,
      blastingDelayDays: 1,
    },
  },

  'gumgaon': {
    id: 'gumgaon',
    mineName: 'Gumgaon Underground Mine',
    shortCode: 'GG-01',
    type: 'Underground',
    state: 'Maharashtra',
    district: 'Nagpur',
    currentOutputTons: 6200,
    plannedTargetTons: 6800,
    predictedOutputTons: 6350,
    projectedGapTons: -450,
    gapPct: 6.6,
    potentialSourceZone: 'Gumgaon Deep Vertical Shaft Lode',
    monthlyTrend: [
      { label: 'Apr', actual: 6500, target: 6800, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 6700, target: 6800, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 6300, target: 6800, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 5900, target: 6800, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 6200, target: 6800, forecast: 6200, confidenceLower: 5900, confidenceUpper: 6500, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 6800, forecast: 6350, confidenceLower: 6000, confidenceUpper: 6700, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 6800, forecast: 6900, confidenceLower: 6500, confidenceUpper: 7300 },
      { label: 'Nov (Fcst)', actual: null, target: 6800, forecast: 7100, confidenceLower: 6650, confidenceUpper: 7500 },
    ],
    featureImportance: [
      { feature: 'Shaft Hoist & Incline Tramming', weightPct: 34, category: 'Operational', color: '#10B981' },
      { feature: 'Underground Dewatering Inflow', weightPct: 26, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Stope Ventilation Fan Efficiency', weightPct: 20, category: 'Operational', color: '#F59E0B' },
      { feature: 'Ore Dip & Mansar Horizon Stability', weightPct: 12, category: 'Geological', color: '#8B5CF6' },
      { feature: 'High-Grade Braunite Proportion', weightPct: 8, category: 'Geological', color: '#06B6D4' },
    ],
    environmentalFactors: {
      rainfallPct: 58,
      rainfallMm: 3.2,
      ndvi: 0.40,
      soilMoisturePct: 33,
      temperatureC: 31.8,
      equipmentAvailabilityPct: 84,
      blastingDelayDays: 1,
    },
  },

  'ukwa': {
    id: 'ukwa',
    mineName: 'Ukwa Underground Mine',
    shortCode: 'UK-01',
    type: 'Underground',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    currentOutputTons: 7100,
    plannedTargetTons: 7500,
    predictedOutputTons: 7200,
    projectedGapTons: -300,
    gapPct: 4.0,
    potentialSourceZone: 'Ukwa Continuous Strike Lode',
    monthlyTrend: [
      { label: 'Apr', actual: 7300, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 7600, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 7100, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 6700, target: 7500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 7100, target: 7500, forecast: 7100, confidenceLower: 6800, confidenceUpper: 7400, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 7500, forecast: 7200, confidenceLower: 6900, confidenceUpper: 7500, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 7500, forecast: 7700, confidenceLower: 7300, confidenceUpper: 8100 },
      { label: 'Nov (Fcst)', actual: null, target: 7500, forecast: 7850, confidenceLower: 7400, confidenceUpper: 8300 },
    ],
    featureImportance: [
      { feature: 'Long Strike Tramming & Rail Track Uptime', weightPct: 36, category: 'Operational', color: '#10B981' },
      { feature: 'Groundwater Seepage & Inflow Rate', weightPct: 24, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Stope Excavation Cycle Time', weightPct: 20, category: 'Operational', color: '#F59E0B' },
      { feature: 'Thin Seam Grade Uniformity', weightPct: 12, category: 'Geological', color: '#8B5CF6' },
      { feature: 'Ventilation Fan Availability', weightPct: 8, category: 'Operational', color: '#06B6D4' },
    ],
    environmentalFactors: {
      rainfallPct: 60,
      rainfallMm: 3.4,
      ndvi: 0.45,
      soilMoisturePct: 36,
      temperatureC: 29.5,
      equipmentAvailabilityPct: 86,
      blastingDelayDays: 1,
    },
  },

  'beldongri': {
    id: 'beldongri',
    mineName: 'Beldongri Opencast Mine',
    shortCode: 'BD-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Nagpur',
    currentOutputTons: 2800,
    plannedTargetTons: 3100,
    predictedOutputTons: 2890,
    projectedGapTons: -210,
    gapPct: 6.8,
    potentialSourceZone: 'Beldongri North Pit Cut',
    monthlyTrend: [
      { label: 'Apr', actual: 3000, target: 3100, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 3200, target: 3100, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 2900, target: 3100, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 2600, target: 3100, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 2800, target: 3100, forecast: 2800, confidenceLower: 2600, confidenceUpper: 3000, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 3100, forecast: 2890, confidenceLower: 2700, confidenceUpper: 3100, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 3100, forecast: 3200, confidenceLower: 2950, confidenceUpper: 3450 },
      { label: 'Nov (Fcst)', actual: null, target: 3100, forecast: 3300, confidenceLower: 3050, confidenceUpper: 3550 },
    ],
    featureImportance: [
      { feature: 'Pit Sump Water Evacuation Rate', weightPct: 32, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Tipper & Shovel Availability', weightPct: 28, category: 'Operational', color: '#10B981' },
      { feature: 'Haul Road Stability & Soil Mud', weightPct: 20, category: 'Environmental', color: '#06B6D4' },
      { feature: 'Bench Stripping Ratio', weightPct: 12, category: 'Operational', color: '#F59E0B' },
      { feature: 'Braunite-Pyrolusite Enrichment', weightPct: 8, category: 'Geological', color: '#8B5CF6' },
    ],
    environmentalFactors: {
      rainfallPct: 56,
      rainfallMm: 3.0,
      ndvi: 0.38,
      soilMoisturePct: 32,
      temperatureC: 32.5,
      equipmentAvailabilityPct: 82,
      blastingDelayDays: 2,
    },
  },

  'munsar': {
    id: 'munsar',
    mineName: 'Munsar Opencast & Underground Mine',
    shortCode: 'MS-01',
    type: 'Open Cast',
    state: 'Maharashtra',
    district: 'Nagpur',
    currentOutputTons: 5400,
    plannedTargetTons: 5800,
    predictedOutputTons: 5500,
    projectedGapTons: -300,
    gapPct: 5.2,
    potentialSourceZone: 'Mansar Formation Type-Locality Ridge',
    monthlyTrend: [
      { label: 'Apr', actual: 5600, target: 5800, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 5900, target: 5800, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 5500, target: 5800, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 5100, target: 5800, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 5400, target: 5800, forecast: 5400, confidenceLower: 5150, confidenceUpper: 5650, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 5800, forecast: 5500, confidenceLower: 5250, confidenceUpper: 5750, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 5800, forecast: 5950, confidenceLower: 5650, confidenceUpper: 6250 },
      { label: 'Nov (Fcst)', actual: null, target: 5800, forecast: 6100, confidenceLower: 5800, confidenceUpper: 6400 },
    ],
    featureImportance: [
      { feature: 'Bench Face & Ridge Slope Stability', weightPct: 34, category: 'Geological', color: '#8B5CF6' },
      { feature: 'Excavator & Tipper Fleet Availability', weightPct: 26, category: 'Operational', color: '#10B981' },
      { feature: 'Pit Water Inflow Management', weightPct: 20, category: 'Environmental', color: '#3B82F6' },
      { feature: 'Blasting Fragmentation & Powder Factor', weightPct: 12, category: 'Operational', color: '#F59E0B' },
      { feature: 'Parallel Braunite Horizons Recovery', weightPct: 8, category: 'Geological', color: '#06B6D4' },
    ],
    environmentalFactors: {
      rainfallPct: 58,
      rainfallMm: 3.1,
      ndvi: 0.41,
      soilMoisturePct: 34,
      temperatureC: 32.0,
      equipmentAvailabilityPct: 85,
      blastingDelayDays: 1,
    },
  },
};

export function getMineProductionProfile(mineId: string): MineProductionProfile {
  return MINE_PRODUCTION_PROFILES[mineId] || MINE_PRODUCTION_PROFILES['dongri-buzurg'];
}

