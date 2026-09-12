export interface MineWorkspaceData {
  mineInfo: {
    id: string;
    name: string;
    location: string;
    district: string;
    state: string;
    type: string;
    leaseId: string;
    status: string;
    dgmsStatus: string;
    ibmRegistration: string;
  };
  operationalSummary: {
    headline: string;
    riskState: 'LOW' | 'MEDIUM' | 'HIGH';
    dynamicStatement: string;
    coreValueMessage: string;
    complianceStandard: string;
    lastUpdated: string;
  };
  production: {
    actual: number; // in tonnes
    target: number;
    forecast: number;
    gap: number;
    unit: string;
    isSynthetic: boolean;
    oreGradeBreakdown: {
      highGradeMn: number; // >44% Mn
      mediumGradeMn: number; // 30-44% Mn
      lowGradeMn: number; // <30% Mn
    };
    monthlyTrend: Array<{
      month: string;
      actual: number | null;
      target: number;
      forecast: number;
      lowerBound: number;
      upperBound: number;
    }>;
  };
  shortfallRisk: {
    probability: number; // e.g. 68%
    expectedProduction: number;
    target: number;
    expectedGap: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  accessibleOre: {
    geologicalPotential: number; // 82%
    accessiblePotential: number; // 61%
    operationallyRecoverable: number; // 44%
    estimatedVolumeTons: number;
  };
  gisZones: Array<{
    id: string;
    name: string;
    prospectivityScore: 'High' | 'Medium' | 'Low';
    geologicalPotential: number;
    accessiblePotential: number;
    recoverablePotential: number;
    estimatedContributionTons: number;
    mnGradePct: string;
    coords: { x: number; y: number; width: number; height: number };
  }>;
  modelInputs: Array<{
    category: string;
    label: string;
    status: 'LIVE SIMULATED' | 'DEMO DATA' | 'MODEL CALCULATED';
    source: string;
  }>;
  riskContributors: Array<{
    factor: string;
    importancePct: number;
    description: string;
    mitigationStrategy: string;
  }>;
  futureSourceZone: {
    id: string;
    name: string;
    prospectivity: 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedPotentialContributionTons: number;
    description: string;
  };
  recommendation: {
    instruction: string;
    currentParams: {
      equipmentAvailability: string;
      blastingDelay: string;
      expectedGap: string;
    };
    recommendedParams: {
      equipmentAvailability: string;
      blastingDelay: string;
      expectedGap: string;
    };
  };
  alerts: Array<{
    id: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    mine: string;
    triggeredCondition: string;
    affectedZone: string;
    timestamp: string;
  }>;
}

export const DONGRI_BUZURG_MODEL_DATA: MineWorkspaceData = {
  mineInfo: {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Mine',
    location: 'Bhandara, Maharashtra',
    district: 'Bhandara District',
    state: 'Maharashtra',
    type: 'Open Cast Manganese Mine',
    leaseId: 'MOIL-LEASE-DG-01',
    status: 'Active Digital Telemetry Hub',
    dgmsStatus: 'DGMS Safety Approved',
    ibmRegistration: 'IBM/4281/2011',
  },
  operationalSummary: {
    headline: 'Dongri Buzurg Enterprise Operations Center',
    riskState: 'MEDIUM',
    dynamicStatement: 'PREDICTIVE SHORTFALL DETECTED: Production is tracking 6.8% below planned target with medium variance risk.',
    coreValueMessage: 'Moving beyond raw geological potential to identify ore that is geotechnically accessible and operationally recoverable.',
    complianceStandard: 'DGMS & IBM Regulatory Standards Compliant',
    lastUpdated: 'Live Stream • Today, 08:30 IST',
  },
  production: {
    actual: 38600,
    target: 45000,
    forecast: 41800,
    gap: -3200,
    unit: 'tonnes',
    isSynthetic: true,
    oreGradeBreakdown: {
      highGradeMn: 18400, // >44% Mn
      mediumGradeMn: 14200, // 30-44% Mn
      lowGradeMn: 6000, // <30% Mn
    },
    monthlyTrend: [
      { month: 'Apr', actual: 42000, target: 44000, forecast: 42000, lowerBound: 41000, upperBound: 43000 },
      { month: 'May', actual: 43500, target: 44500, forecast: 43500, lowerBound: 42500, upperBound: 44500 },
      { month: 'Jun', actual: 41000, target: 45000, forecast: 41000, lowerBound: 40000, upperBound: 42000 },
      { month: 'Jul', actual: 39500, target: 45000, forecast: 39500, lowerBound: 38500, upperBound: 40500 },
      { month: 'Aug (Current)', actual: 38600, target: 45000, forecast: 41800, lowerBound: 40200, upperBound: 43400 },
      { month: 'Sep (Forecast)', actual: null, target: 46000, forecast: 42500, lowerBound: 41000, upperBound: 44000 },
      { month: 'Oct (Forecast)', actual: null, target: 46500, forecast: 43200, lowerBound: 41500, upperBound: 45000 },
    ],
  },
  shortfallRisk: {
    probability: 68,
    expectedProduction: 41800,
    target: 45000,
    expectedGap: -3200,
    riskLevel: 'MEDIUM',
  },
  accessibleOre: {
    geologicalPotential: 82,
    accessiblePotential: 61,
    operationallyRecoverable: 44,
    estimatedVolumeTons: 142000,
  },
  gisZones: [
    {
      id: 'DB-01',
      name: 'North Pit Bench DB-01',
      prospectivityScore: 'High',
      geologicalPotential: 88,
      accessiblePotential: 70,
      recoverablePotential: 52,
      estimatedContributionTons: 18500,
      mnGradePct: '46.2% Mn',
      coords: { x: 18, y: 22, width: 30, height: 24 },
    },
    {
      id: 'DB-02',
      name: 'Central Main Pit DB-02',
      prospectivityScore: 'Medium',
      geologicalPotential: 76,
      accessiblePotential: 58,
      recoverablePotential: 40,
      estimatedContributionTons: 11200,
      mnGradePct: '38.5% Mn',
      coords: { x: 52, y: 28, width: 32, height: 26 },
    },
    {
      id: 'DB-03',
      name: 'South Extension Bench DB-03',
      prospectivityScore: 'Low',
      geologicalPotential: 62,
      accessiblePotential: 45,
      recoverablePotential: 28,
      estimatedContributionTons: 6400,
      mnGradePct: '32.1% Mn',
      coords: { x: 22, y: 55, width: 26, height: 25 },
    },
    {
      id: 'DB-04',
      name: 'East Ridge Extension DB-04',
      prospectivityScore: 'High',
      geologicalPotential: 91,
      accessiblePotential: 75,
      recoverablePotential: 58,
      estimatedContributionTons: 12400,
      mnGradePct: '48.4% Mn',
      coords: { x: 56, y: 58, width: 30, height: 26 },
    },
  ],
  modelInputs: [
    { category: 'Geology', label: '3D Geological Wireframe Assays', status: 'LIVE SIMULATED', source: 'MOIL Core Drilling' },
    { category: 'Production', label: 'Historical Dispatch Telemetry', status: 'LIVE SIMULATED', source: 'Weighbridge Stream' },
    { category: 'Equipment', label: 'Excavator & Dumper Fleet Telemetry', status: 'LIVE SIMULATED', source: 'FMS Sensors' },
    { category: 'Environment', label: 'Precipitation & Drainage Rate', status: 'DEMO DATA', source: 'IMD Station Bhandara' },
    { category: 'Environment', label: 'Pit Bench Slope Moisture Index', status: 'DEMO DATA', source: 'Piezometer Sensors' },
    { category: 'Satellite', label: 'Sentinel-2 Vegetation & NDVI', status: 'DEMO DATA', source: 'ESA Copernicus' },
    { category: 'Satellite', label: 'Land Surface Thermal Radiation', status: 'DEMO DATA', source: 'Landsat-9 IR' },
    { category: 'Remote Sensing', label: 'High-Res Drone Pit Photogrammetry', status: 'DEMO DATA', source: 'UAV Survey 2026' },
    { category: 'Operations', label: 'Explosives & Blasting Cycle Log', status: 'DEMO DATA', source: 'Mine Manager Log' },
  ],
  riskContributors: [
    {
      factor: 'Equipment Availability & Fleet Runtime',
      importancePct: 42,
      description: 'Shovel loader breakdown & haul truck turnaround latency in Pit DB-02',
      mitigationStrategy: 'Deploy standby Komatsu 45T excavator to Bench DB-01',
    },
    {
      factor: 'Weather Conditions & Rain Inflow',
      importancePct: 31,
      description: 'Precipitation accumulation slowing lower bench haul road traction',
      mitigationStrategy: 'Activate secondary dewatering pump array at Pit Sump 3',
    },
    {
      factor: 'Blasting Schedule Delay',
      importancePct: 19,
      description: 'Explosives clearance protocol delayed bench fragmentation by 48 hrs',
      mitigationStrategy: 'Advance safety clearance window with DGMS field inspector',
    },
    {
      factor: 'Haul Road Logistics & Ramp Traffic',
      importancePct: 8,
      description: 'Shift handover congestion at main crusher hopper ramp',
      mitigationStrategy: 'Stagger shift transitions across North and South pits',
    },
  ],
  futureSourceZone: {
    id: 'DB-04',
    name: 'Zone DB-04 (East Ridge Extension)',
    prospectivity: 'HIGH',
    estimatedPotentialContributionTons: 12400,
    description: 'Model-identified high-prospectivity zone for immediate inclusion in next month production dispatch schedule.',
  },
  recommendation: {
    instruction: 'Increase excavator fleet deployment in Pit DB-01 by 15% and advance blasting clearance by 48 hours to recover 3,200 t shortfall.',
    currentParams: {
      equipmentAvailability: '72%',
      blastingDelay: '5 days',
      expectedGap: '-3,200 t',
    },
    recommendedParams: {
      equipmentAvailability: '82%',
      blastingDelay: '3 days',
      expectedGap: '0 t (Target Achieved)',
    },
  },
  alerts: [
    {
      id: 'ALT-101',
      priority: 'MEDIUM',
      title: 'PRODUCTION SHORTFALL PREDICTED',
      mine: 'Dongri Buzurg',
      triggeredCondition: 'Fleet availability dropped below 75% threshold (Current: 72%)',
      affectedZone: 'Central Pit Bench DB-02',
      timestamp: 'Today, 08:30 IST',
    },
    {
      id: 'ALT-102',
      priority: 'MEDIUM',
      title: 'BLASTING SCHEDULE DELAY',
      mine: 'Dongri Buzurg',
      triggeredCondition: 'Pre-bench blasting clearance buffer exceeded by 48 hours',
      affectedZone: 'North Pit Zone DB-01',
      timestamp: 'Yesterday, 14:15 IST',
    },
    {
      id: 'ALT-103',
      priority: 'LOW',
      title: 'DRAINAGE PUMP MAINTENANCE',
      mine: 'Dongri Buzurg',
      triggeredCondition: 'Routine 500-hour inspection required for Sump Pump #2',
      affectedZone: 'South Pit Sump DB-03',
      timestamp: '27 Aug, 11:00 IST',
    },
  ],
};
