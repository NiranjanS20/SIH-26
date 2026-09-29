export interface DetailedMineStat {
  id: string;
  name: string;
  shortCode: string;
  district: string;
  state: 'Maharashtra' | 'Madhya Pradesh';
  type: 'Open Cast' | 'Underground';
  isImplemented: boolean;
  monthlyOutput: number; // MT
  monthlyTarget: number; // MT
  provedReservesMT: number; // Million MT
  avgGradePct: number; // % Mn
  gradeTier: 'Ultra High (>=46%)' | 'High (44–46%)' | 'Medium (38–44%)' | 'Standard (<38%)';
  strippingRatioOrHoisting: string;
  recoveryRatePct: number;
  waterRecycledPct: number;
  energyKwhPerTon: number;
  dispatchRakesPerMonth: number;
  monthlyTrend: {
    month: string;
    actual: number | null;
    target: number;
    forecast: number;
    isMonsoon?: boolean;
  }[];
  gradeBreakdown: {
    highGrade44Plus: number;
    mediumGrade38To44: number;
    lowGradeBelow38: number;
    emdElectrolytic: number;
  };
}

export const PORTFOLIO_MINES_DATA: Record<string, DetailedMineStat> = {
  'dongri-buzurg': {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg',
    shortCode: 'DB-01',
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Open Cast',
    isImplemented: true,
    monthlyOutput: 4100,
    monthlyTarget: 5000,
    provedReservesMT: 14.8,
    avgGradePct: 43.2,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '1:5.2 OB Ratio',
    recoveryRatePct: 86.4,
    waterRecycledPct: 88.0,
    energyKwhPerTon: 24.5,
    dispatchRakesPerMonth: 1.1,
    monthlyTrend: [
      { month: 'Apr', actual: 4800, target: 5000, forecast: 4800 },
      { month: 'May', actual: 5100, target: 5000, forecast: 5100 },
      { month: 'Jun', actual: 4300, target: 5000, forecast: 4300, isMonsoon: true },
      { month: 'Jul', actual: 3800, target: 5000, forecast: 3800, isMonsoon: true },
      { month: 'Aug', actual: 4100, target: 5000, forecast: 4100, isMonsoon: true },
      { month: 'Sep', actual: null, target: 5000, forecast: 4250, isMonsoon: true },
      { month: 'Oct', actual: null, target: 5000, forecast: 4750 },
      { month: 'Nov', actual: null, target: 5000, forecast: 5200 },
      { month: 'Dec', actual: null, target: 5000, forecast: 5350 },
      { month: 'Jan', actual: null, target: 5000, forecast: 5100 },
      { month: 'Feb', actual: null, target: 5000, forecast: 4950 },
      { month: 'Mar', actual: null, target: 5000, forecast: 5300 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 25,
      mediumGrade38To44: 45,
      lowGradeBelow38: 15,
      emdElectrolytic: 15,
    },
  },
  chikla: {
    id: 'chikla',
    name: 'Chikla',
    shortCode: 'CK-02',
    district: 'Bhandara',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 15000,
    monthlyTarget: 16666,
    provedReservesMT: 4.89,
    avgGradePct: 43.5,
    gradeTier: 'High (44–46%)',
    strippingRatioOrHoisting: '470 m Vertical Shaft',
    recoveryRatePct: 90.0,
    waterRecycledPct: 85.0,
    energyKwhPerTon: 30.5,
    dispatchRakesPerMonth: 4.0,
    monthlyTrend: [
      { month: 'Apr', actual: 15200, target: 16666, forecast: 15200 },
      { month: 'May', actual: 15500, target: 16666, forecast: 15500 },
      { month: 'Jun', actual: 14800, target: 16666, forecast: 14800, isMonsoon: true },
      { month: 'Jul', actual: 14200, target: 16666, forecast: 14200, isMonsoon: true },
      { month: 'Aug', actual: 15000, target: 16666, forecast: 15000, isMonsoon: true },
      { month: 'Sep', actual: null, target: 16666, forecast: 15200, isMonsoon: true },
      { month: 'Oct', actual: null, target: 16666, forecast: 16000 },
      { month: 'Nov', actual: null, target: 16666, forecast: 16300 },
      { month: 'Dec', actual: null, target: 16666, forecast: 16500 },
      { month: 'Jan', actual: null, target: 16666, forecast: 16200 },
      { month: 'Feb', actual: null, target: 16666, forecast: 15900 },
      { month: 'Mar', actual: null, target: 16666, forecast: 16600 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 27,
      mediumGrade38To44: 72,
      lowGradeBelow38: 1,
      emdElectrolytic: 0,
    },
  },
  balaghat: {
    id: 'balaghat',
    name: 'Balaghat (Bharweli)',
    shortCode: 'BG-07',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 32500,
    monthlyTarget: 35000,
    provedReservesMT: 38.6,
    avgGradePct: 46.8,
    gradeTier: 'Ultra High (>=46%)',
    strippingRatioOrHoisting: '435 m Vertical Shaft',
    recoveryRatePct: 92.1,
    waterRecycledPct: 91.5,
    energyKwhPerTon: 36.2,
    dispatchRakesPerMonth: 8.5,
    monthlyTrend: [
      { month: 'Apr', actual: 34200, target: 35000, forecast: 34200 },
      { month: 'May', actual: 35100, target: 35000, forecast: 35100 },
      { month: 'Jun', actual: 33400, target: 35000, forecast: 33400, isMonsoon: true },
      { month: 'Jul', actual: 31800, target: 35000, forecast: 31800, isMonsoon: true },
      { month: 'Aug', actual: 32500, target: 35000, forecast: 32500, isMonsoon: true },
      { month: 'Sep', actual: null, target: 35000, forecast: 33200, isMonsoon: true },
      { month: 'Oct', actual: null, target: 35000, forecast: 35400 },
      { month: 'Nov', actual: null, target: 35000, forecast: 36100 },
      { month: 'Dec', actual: null, target: 35000, forecast: 36800 },
      { month: 'Jan', actual: null, target: 35000, forecast: 35900 },
      { month: 'Feb', actual: null, target: 35000, forecast: 35300 },
      { month: 'Mar', actual: null, target: 35000, forecast: 37200 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 68,
      mediumGrade38To44: 24,
      lowGradeBelow38: 8,
      emdElectrolytic: 0,
    },
  },
  tirodi: {
    id: 'tirodi',
    name: 'Tirodi',
    shortCode: 'TR-03',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Open Cast',
    isImplemented: true,
    monthlyOutput: 8400,
    monthlyTarget: 9500,
    provedReservesMT: 12.2,
    avgGradePct: 41.8,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '1:4.8 OB Ratio',
    recoveryRatePct: 83.5,
    waterRecycledPct: 84.0,
    energyKwhPerTon: 22.8,
    dispatchRakesPerMonth: 2.2,
    monthlyTrend: [
      { month: 'Apr', actual: 9200, target: 9500, forecast: 9200 },
      { month: 'May', actual: 9600, target: 9500, forecast: 9600 },
      { month: 'Jun', actual: 8800, target: 9500, forecast: 8800, isMonsoon: true },
      { month: 'Jul', actual: 7900, target: 9500, forecast: 7900, isMonsoon: true },
      { month: 'Aug', actual: 8400, target: 9500, forecast: 8400, isMonsoon: true },
      { month: 'Sep', actual: null, target: 9500, forecast: 8700, isMonsoon: true },
      { month: 'Oct', actual: null, target: 9500, forecast: 9400 },
      { month: 'Nov', actual: null, target: 9500, forecast: 9800 },
      { month: 'Dec', actual: null, target: 9500, forecast: 9900 },
      { month: 'Jan', actual: null, target: 9500, forecast: 9600 },
      { month: 'Feb', actual: null, target: 9500, forecast: 9450 },
      { month: 'Mar', actual: null, target: 9500, forecast: 9950 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 32,
      mediumGrade38To44: 52,
      lowGradeBelow38: 16,
      emdElectrolytic: 0,
    },
  },
  ukwa: {
    id: 'ukwa',
    name: 'Ukwa',
    shortCode: 'UK-08',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 14200,
    monthlyTarget: 15000,
    provedReservesMT: 16.5,
    avgGradePct: 44.2,
    gradeTier: 'High (44–46%)',
    strippingRatioOrHoisting: '185 m Incline Shaft',
    recoveryRatePct: 88.0,
    waterRecycledPct: 89.0,
    energyKwhPerTon: 31.0,
    dispatchRakesPerMonth: 3.7,
    monthlyTrend: [
      { month: 'Apr', actual: 14800, target: 15000, forecast: 14800 },
      { month: 'May', actual: 15200, target: 15000, forecast: 15200 },
      { month: 'Jun', actual: 14500, target: 15000, forecast: 14500, isMonsoon: true },
      { month: 'Jul', actual: 13900, target: 15000, forecast: 13900, isMonsoon: true },
      { month: 'Aug', actual: 14200, target: 15000, forecast: 14200, isMonsoon: true },
      { month: 'Sep', actual: null, target: 15000, forecast: 14400, isMonsoon: true },
      { month: 'Oct', actual: null, target: 15000, forecast: 15100 },
      { month: 'Nov', actual: null, target: 15000, forecast: 15400 },
      { month: 'Dec', actual: null, target: 15000, forecast: 15600 },
      { month: 'Jan', actual: null, target: 15000, forecast: 15200 },
      { month: 'Feb', actual: null, target: 15000, forecast: 14900 },
      { month: 'Mar', actual: null, target: 15000, forecast: 15800 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 55,
      mediumGrade38To44: 35,
      lowGradeBelow38: 10,
      emdElectrolytic: 0,
    },
  },

  kandri: {
    id: 'kandri',
    name: 'Kandri',
    shortCode: 'KD-03',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 7100,
    monthlyTarget: 7800,
    provedReservesMT: 9.3,
    avgGradePct: 43.8,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '275 m Incline Shaft',
    recoveryRatePct: 87.0,
    waterRecycledPct: 87.5,
    energyKwhPerTon: 34.0,
    dispatchRakesPerMonth: 1.9,
    monthlyTrend: [
      { month: 'Apr', actual: 7600, target: 7800, forecast: 7600 },
      { month: 'May', actual: 7850, target: 7800, forecast: 7850 },
      { month: 'Jun', actual: 7300, target: 7800, forecast: 7300, isMonsoon: true },
      { month: 'Jul', actual: 6800, target: 7800, forecast: 6800, isMonsoon: true },
      { month: 'Aug', actual: 7100, target: 7800, forecast: 7100, isMonsoon: true },
      { month: 'Sep', actual: null, target: 7800, forecast: 7350, isMonsoon: true },
      { month: 'Oct', actual: null, target: 7800, forecast: 7750 },
      { month: 'Nov', actual: null, target: 7800, forecast: 8000 },
      { month: 'Dec', actual: null, target: 7800, forecast: 8100 },
      { month: 'Jan', actual: null, target: 7800, forecast: 7900 },
      { month: 'Feb', actual: null, target: 7800, forecast: 7700 },
      { month: 'Mar', actual: null, target: 7800, forecast: 8200 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 45,
      mediumGrade38To44: 45,
      lowGradeBelow38: 10,
      emdElectrolytic: 0,
    },
  },
  gumgaon: {
    id: 'gumgaon',
    name: 'Gumgaon',
    shortCode: 'GG-05',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 3800,
    monthlyTarget: 4166,
    provedReservesMT: 5.0,
    avgGradePct: 41.0,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '210 m Vertical Shaft',
    recoveryRatePct: 84.0,
    waterRecycledPct: 85.0,
    energyKwhPerTon: 32.5,
    dispatchRakesPerMonth: 1.5,
    monthlyTrend: [
      { month: 'Apr', actual: 6300, target: 6500, forecast: 6300 },
      { month: 'May', actual: 6550, target: 6500, forecast: 6550 },
      { month: 'Jun', actual: 6100, target: 6500, forecast: 6100, isMonsoon: true },
      { month: 'Jul', actual: 5600, target: 6500, forecast: 5600, isMonsoon: true },
      { month: 'Aug', actual: 5900, target: 6500, forecast: 5900, isMonsoon: true },
      { month: 'Sep', actual: null, target: 6500, forecast: 6150, isMonsoon: true },
      { month: 'Oct', actual: null, target: 6500, forecast: 6450 },
      { month: 'Nov', actual: null, target: 6500, forecast: 6650 },
      { month: 'Dec', actual: null, target: 6500, forecast: 6750 },
      { month: 'Jan', actual: null, target: 6500, forecast: 6550 },
      { month: 'Feb', actual: null, target: 6500, forecast: 6400 },
      { month: 'Mar', actual: null, target: 6500, forecast: 6800 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 28,
      mediumGrade38To44: 56,
      lowGradeBelow38: 16,
      emdElectrolytic: 0,
    },
  },
  munsar: {
    id: 'munsar',
    name: 'Munsar',
    shortCode: 'MS-04',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 5400,
    monthlyTarget: 6000,
    provedReservesMT: 6.8,
    avgGradePct: 40.5,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '190 m Hoisting Depth',
    recoveryRatePct: 83.2,
    waterRecycledPct: 84.5,
    energyKwhPerTon: 31.8,
    dispatchRakesPerMonth: 1.4,
    monthlyTrend: [
      { month: 'Apr', actual: 5800, target: 6000, forecast: 5800 },
      { month: 'May', actual: 6100, target: 6000, forecast: 6100 },
      { month: 'Jun', actual: 5600, target: 6000, forecast: 5600, isMonsoon: true },
      { month: 'Jul', actual: 5100, target: 6000, forecast: 5100, isMonsoon: true },
      { month: 'Aug', actual: 5400, target: 6000, forecast: 5400, isMonsoon: true },
      { month: 'Sep', actual: null, target: 6000, forecast: 5650, isMonsoon: true },
      { month: 'Oct', actual: null, target: 6000, forecast: 5950 },
      { month: 'Nov', actual: null, target: 6000, forecast: 6150 },
      { month: 'Dec', actual: null, target: 6000, forecast: 6250 },
      { month: 'Jan', actual: null, target: 6000, forecast: 6050 },
      { month: 'Feb', actual: null, target: 6000, forecast: 5900 },
      { month: 'Mar', actual: null, target: 6000, forecast: 6300 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 22,
      mediumGrade38To44: 60,
      lowGradeBelow38: 18,
      emdElectrolytic: 0,
    },
  },
  sitapatore: {
    id: 'sitapatore',
    name: 'Sitapatore',
    shortCode: 'SP-10',
    district: 'Balaghat',
    state: 'Madhya Pradesh',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 3800,
    monthlyTarget: 4500,
    provedReservesMT: 4.2,
    avgGradePct: 39.8,
    gradeTier: 'Medium (38–44%)',
    strippingRatioOrHoisting: '160 m Level Shaft',
    recoveryRatePct: 82.0,
    waterRecycledPct: 83.0,
    energyKwhPerTon: 29.5,
    dispatchRakesPerMonth: 1.0,
    monthlyTrend: [
      { month: 'Apr', actual: 4200, target: 4500, forecast: 4200 },
      { month: 'May', actual: 4400, target: 4500, forecast: 4400 },
      { month: 'Jun', actual: 3900, target: 4500, forecast: 3900, isMonsoon: true },
      { month: 'Jul', actual: 3500, target: 4500, forecast: 3500, isMonsoon: true },
      { month: 'Aug', actual: 3800, target: 4500, forecast: 3800, isMonsoon: true },
      { month: 'Sep', actual: null, target: 4500, forecast: 4000, isMonsoon: true },
      { month: 'Oct', actual: null, target: 4500, forecast: 4350 },
      { month: 'Nov', actual: null, target: 4500, forecast: 4550 },
      { month: 'Dec', actual: null, target: 4500, forecast: 4650 },
      { month: 'Jan', actual: null, target: 4500, forecast: 4500 },
      { month: 'Feb', actual: null, target: 4500, forecast: 4400 },
      { month: 'Mar', actual: null, target: 4500, forecast: 4700 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 18,
      mediumGrade38To44: 64,
      lowGradeBelow38: 18,
      emdElectrolytic: 0,
    },
  },
  beldongri: {
    id: 'beldongri',
    name: 'Beldongri',
    shortCode: 'BD-06',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: true,
    monthlyOutput: 2900,
    monthlyTarget: 3200,
    provedReservesMT: 3.5,
    avgGradePct: 38.5,
    gradeTier: 'Standard (<38%)',
    strippingRatioOrHoisting: '140 m Hoisting Incline',
    recoveryRatePct: 81.5,
    waterRecycledPct: 82.0,
    energyKwhPerTon: 28.0,
    dispatchRakesPerMonth: 0.8,
    monthlyTrend: [
      { month: 'Apr', actual: 3100, target: 3200, forecast: 3100 },
      { month: 'May', actual: 3250, target: 3200, forecast: 3250 },
      { month: 'Jun', actual: 3000, target: 3200, forecast: 3000, isMonsoon: true },
      { month: 'Jul', actual: 2700, target: 3200, forecast: 2700, isMonsoon: true },
      { month: 'Aug', actual: 2900, target: 3200, forecast: 2900, isMonsoon: true },
      { month: 'Sep', actual: null, target: 3200, forecast: 3050, isMonsoon: true },
      { month: 'Oct', actual: null, target: 3200, forecast: 3150 },
      { month: 'Nov', actual: null, target: 3200, forecast: 3250 },
      { month: 'Dec', actual: null, target: 3200, forecast: 3300 },
      { month: 'Jan', actual: null, target: 3200, forecast: 3200 },
      { month: 'Feb', actual: null, target: 3200, forecast: 3100 },
      { month: 'Mar', actual: null, target: 3200, forecast: 3350 },
    ],
    gradeBreakdown: {
      highGrade44Plus: 12,
      mediumGrade38To44: 68,
      lowGradeBelow38: 20,
      emdElectrolytic: 0,
    },
  },
};


export interface PortfolioMineProfile {
  id: string;
  name: string;
  shortName: string;
  location: string;
  type: string;
  production: number; // in tonnes
  target: number; // in tonnes
  variance: number; // in tonnes
  performance: number; // percentage e.g. 82
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Shortfall' | 'Surplus';
  riskColor: string;
}

export interface PortfolioOutlookPeriod {
  period: string; // 'SEP', 'OCT', 'NOV'
  monthFull: string;
  target: number; // in tonnes
  forecast: number; // in tonnes
  coveragePct: number; // e.g. 96
  variance: number; // e.g. -600
  status: 'BELOW TARGET' | 'NEAR TARGET' | 'SURPLUS';
  statusLabel: string;
  statusColor: string;
  statusIcon: string;
}

export interface MineRecoveryData {
  id: string;
  shortName: string;
  mineName: string;
  location: string;
  type: string;
  projectedShortfall: number; // in tonnes
  potentiallyRecoverable: number; // in tonnes
  recoveryRatePct: number; // percentage
  remainingGap: number; // in tonnes
  primaryAction: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskColor: string;
}

export const PORTFOLIO_MINE_PROFILES: PortfolioMineProfile[] = [
  {
    id: 'chikla',
    name: 'Chikla Underground Mine',
    shortName: 'Chikla',
    location: 'Bhandara, Maharashtra',
    type: 'Underground',
    production: 4850,
    target: 4700,
    variance: 150,
    performance: 103,
    risk: 'LOW',
    status: 'Surplus',
    riskColor: '#2E7D32', // Green
  },
  {
    id: 'balaghat',
    name: 'Balaghat Underground Mine',
    shortName: 'Balaghat',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Underground',
    production: 3890,
    target: 4300,
    variance: -410,
    performance: 91,
    risk: 'MEDIUM',
    status: 'Shortfall',
    riskColor: '#B8860B', // Amber
  },
  {
    id: 'dongri-buzurg',
    name: 'Dongri Buzurg Opencast Mine',
    shortName: 'Dongri Buzurg',
    location: 'Bhandara, Maharashtra',
    type: 'Open Cast',
    production: 4100,
    target: 5000,
    variance: -900,
    performance: 82,
    risk: 'HIGH',
    status: 'Shortfall',
    riskColor: '#B03A2E', // Red
  },
  {
    id: 'tirodi',
    name: 'Tirodi Opencast Mine',
    shortName: 'Tirodi',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Open Cast',
    production: 9200,
    target: 9380,
    variance: -180,
    performance: 98,
    risk: 'LOW',
    status: 'Shortfall',
    riskColor: '#2E7D32', // Green
  },
  {
    id: 'sitapatore',
    name: 'Sitapatore Opencast Mine',
    shortName: 'Sitapatore',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Open Cast',
    production: 1350,
    target: 1415,
    variance: -65,
    performance: 95,
    risk: 'MEDIUM',
    status: 'Shortfall',
    riskColor: '#B8860B', // Amber
  },
  {
    id: 'kandri',
    name: 'Kandri Opencast & Underground Mine',
    shortName: 'Kandri',
    location: 'Nagpur, Maharashtra',
    type: 'Open Cast',
    production: 3600,
    target: 4000,
    variance: -400,
    performance: 90,
    risk: 'LOW',
    status: 'Shortfall',
    riskColor: '#2E7D32',
  },
  {
    id: 'beldongri',
    name: 'Beldongri Underground Mine',
    shortName: 'Beldongri',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    production: 2900,
    target: 3200,
    variance: -300,
    performance: 91,
    risk: 'LOW',
    status: 'Shortfall',
    riskColor: '#2E7D32',
  },
  {
    id: 'munsar',
    name: 'Munsar Underground Mine',
    shortName: 'Munsar',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    production: 3800,
    target: 4100,
    variance: -300,
    performance: 93,
    risk: 'LOW',
    status: 'Shortfall',
    riskColor: '#2E7D32',
  },
  {
    id: 'gumgaon',
    name: 'Gumgaon Underground Mine',
    shortName: 'Gumgaon',
    location: 'Nagpur, Maharashtra',
    type: 'Underground',
    production: 3800,
    target: 4166,
    variance: -366,
    performance: 91,
    risk: 'MEDIUM',
    status: 'Shortfall',
    riskColor: '#B8860B',
  },
  {
    id: 'ukwa',
    name: 'Ukwa Underground Mine',
    shortName: 'Ukwa',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Underground',
    production: 14200,
    target: 15000,
    variance: -800,
    performance: 95,
    risk: 'LOW',
    status: 'Shortfall',
    riskColor: '#2E7D32',
  },
];
