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
    currentOutputTons: 9400,
    plannedTargetTons: 10500,
    predictedOutputTons: 9600,
    projectedGapTons: -900,
    gapPct: 8.5,
    potentialSourceZone: 'Tirodi South Pit Section',
    monthlyTrend: [
      { label: 'Apr', actual: 10100, target: 10500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'May', actual: 10600, target: 10500, forecast: null, confidenceLower: null, confidenceUpper: null },
      { label: 'Jun', actual: 9800, target: 10500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Jul', actual: 9100, target: 10500, forecast: null, confidenceLower: null, confidenceUpper: null, isMonsoon: true },
      { label: 'Aug (Cur)', actual: 9400, target: 10500, forecast: 9400, confidenceLower: 8900, confidenceUpper: 9900, isMonsoon: true },
      { label: 'Sep (Fcst)', actual: null, target: 10500, forecast: 9600, confidenceLower: 9050, confidenceUpper: 10150, isMonsoon: true },
      { label: 'Oct (Fcst)', actual: null, target: 10500, forecast: 10650, confidenceLower: 10000, confidenceUpper: 11300 },
      { label: 'Nov (Fcst)', actual: null, target: 10500, forecast: 10900, confidenceLower: 10200, confidenceUpper: 11600 },
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
};

export function getMineProductionProfile(mineId: string): MineProductionProfile {
  return MINE_PRODUCTION_PROFILES[mineId] || MINE_PRODUCTION_PROFILES['dongri-buzurg'];
}
