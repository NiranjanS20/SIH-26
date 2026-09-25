import React, { useState, useEffect, useMemo } from 'react';
import { type PortalRoute } from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { MOIL_MINES } from '../data/minesData';
import { apiGet } from '../services/apiClient';

interface AdminControlCenterProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

type AdminTab =
  | 'portfolio-overview'
  | 'mine-network'
  | 'alert-center'
  | 'compliance-oversight'
  | 'reports-center';

interface AlertItem {
  id: string;
  mineId: string;
  mineName: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  exposureTons: number;
  timestamp: string;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED';
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-101',
    mineId: 'dongri-buzurg',
    mineName: 'Dongri Buzurg Opencast',
    risk: 'HIGH',
    title: 'Monsoon Dewatering Sump Capacity Limit',
    description: 'Projected pit precipitation exceeds primary pump throughput. Flooding risk in bench 3.',
    exposureTons: 900,
    timestamp: '14 mins ago',
    status: 'UNACKNOWLEDGED',
  },
  {
    id: 'ALT-102',
    mineId: 'tirodi',
    mineName: 'Tirodi Opencast',
    risk: 'HIGH',
    title: 'Excavator Shovel #3 Hydraulic Maintenance Delay',
    description: 'Blasting clearance delayed due to preventive maintenance backlog. Shovel down for 18 hours.',
    exposureTons: 450,
    timestamp: '42 mins ago',
    status: 'ACKNOWLEDGED',
  },
  {
    id: 'ALT-103',
    mineId: 'sitapatore',
    mineName: 'Sitapatore Underground',
    risk: 'MEDIUM',
    title: 'Ventilation Shaft Airflow Variance in Level 4',
    description: 'Main blower secondary exhaust experiencing 12% air volume drop. MCDR safety threshold alert.',
    exposureTons: 300,
    timestamp: '2 hours ago',
    status: 'UNACKNOWLEDGED',
  },
  {
    id: 'ALT-104',
    mineId: 'balaghat',
    mineName: 'Balaghat Underground',
    risk: 'MEDIUM',
    title: 'Pyrolusite Grade Blending Variance',
    description: 'Run-of-mine feed batch contains 41.2% Mn vs 44.0% targeted contract grade specification.',
    exposureTons: 250,
    timestamp: '5 hours ago',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-105',
    mineId: 'ukwa',
    mineName: 'Ukwa Underground',
    risk: 'LOW',
    title: 'Rake Loading Conveyor Belt Alignment Notice',
    description: 'Minor idler roller misalignment detected on pithead siding rail conveyor belt.',
    exposureTons: 120,
    timestamp: '8 hours ago',
    status: 'RESOLVED',
  },
  {
    id: 'ALT-106',
    mineId: 'chikla',
    mineName: 'Chikla Underground',
    risk: 'MEDIUM',
    title: 'Hoist Engine Auxiliary Power Delay',
    description: 'Main shaft electric winder backup power transition delay of 12 minutes during grid fluctuation.',
    exposureTons: 400,
    timestamp: '1 hour ago',
    status: 'UNACKNOWLEDGED',
  },
  {
    id: 'ALT-107',
    mineId: 'gumgaon',
    mineName: 'Gumgaon Underground',
    risk: 'MEDIUM',
    title: 'Geotechnical Alert: RMR Drop in -1000L Stope',
    description: 'Average RMR dropped below 45. Review support bolting density.',
    exposureTons: 150,
    timestamp: '30 mins ago',
    status: 'UNACKNOWLEDGED',
  },
];

// Rich Multi-Mine Analytics Dataset
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
    isImplemented: false,
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
    isImplemented: false,
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
  mansar: {
    id: 'mansar',
    name: 'Mansar',
    shortCode: 'MS-04',
    district: 'Nagpur',
    state: 'Maharashtra',
    type: 'Underground',
    isImplemented: false,
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
    isImplemented: false,
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
    isImplemented: false,
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

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  onNavigate,
  themeMode = 'light',
  onToggleTheme,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('portfolio-overview');
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Portfolio interactive selector state
  const [selectedMineId, setSelectedMineId] = useState<string>('all');
  const [clusterFilter, setClusterFilter] = useState<'ALL' | 'MH' | 'MP'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Open Cast' | 'Underground'>('ALL');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Backend Health State
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'CHECKING'>('CHECKING');

  const isDark = themeMode === 'dark';

  // Theme Design Tokens for crisp contrast
  const pageBg = isDark ? 'bg-[#0E1218] text-slate-100' : 'bg-[#F4F7FB] text-slate-900';
  const cardBg = isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs';
  const textHeading = isDark ? 'text-white' : 'text-[#0B1E38]';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';
  const borderDivider = isDark ? 'border-slate-800' : 'border-slate-200';

  // Fetch backend overview on load
  useEffect(() => {
    let isMounted = true;
    apiGet<any>('/admin/overview')
      .then((res) => {
        if (isMounted && res && res.success) {
          setBackendStatus('CONNECTED');
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendStatus('OFFLINE');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    triggerNotification(`Alert ${id} acknowledged. Recorded in operational chain.`);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
    triggerNotification(`Alert ${id} marked as RESOLVED. Dispatched to Site Manager.`);
  };

  // Filtered mines based on cluster and type
  const filteredMinesList = useMemo(() => {
    return Object.values(PORTFOLIO_MINES_DATA).filter((mine) => {
      if (clusterFilter === 'MH' && mine.state !== 'Maharashtra') return false;
      if (clusterFilter === 'MP' && mine.state !== 'Madhya Pradesh') return false;
      if (typeFilter !== 'ALL' && mine.type !== typeFilter) return false;
      return true;
    });
  }, [clusterFilter, typeFilter]);

  // Roster table interactive filter state (Tab 2)
  const [rosterTabFilter, setRosterTabFilter] = useState<'ALL' | 'ACTIVE' | 'TELEMETRY' | 'MH' | 'MP'>('ALL');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [selectedRosterMineId, setSelectedRosterMineId] = useState<string | null>('dongri-buzurg');

  const filteredRosterMines = useMemo(() => {
    return MOIL_MINES.filter((mine) => {
      if (rosterTabFilter === 'ACTIVE' && !mine.isImplemented) return false;
      if (rosterTabFilter === 'TELEMETRY' && mine.isImplemented) return false;
      if (rosterTabFilter === 'MH' && mine.state !== 'Maharashtra') return false;
      if (rosterTabFilter === 'MP' && mine.state !== 'Madhya Pradesh') return false;

      if (rosterSearch.trim()) {
        const q = rosterSearch.toLowerCase();
        const matchName = mine.name.toLowerCase().includes(q);
        const matchCode = mine.shortCode.toLowerCase().includes(q);
        const matchDistrict = mine.district.toLowerCase().includes(q);
        const matchState = mine.state.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDistrict && !matchState) return false;
      }

      return true;
    });
  }, [rosterTabFilter, rosterSearch]);

  // Selected single mine or Aggregate Stats
  const isAggregate = selectedMineId === 'all';
  const selectedMineData = isAggregate ? null : PORTFOLIO_MINES_DATA[selectedMineId];

  // Aggregate Computations across filtered/all mines
  const aggregateMetrics = useMemo(() => {
    const list = filteredMinesList;
    const totalOutput = list.reduce((sum, m) => sum + m.monthlyOutput, 0);
    const totalTarget = list.reduce((sum, m) => sum + m.monthlyTarget, 0);
    const totalReserves = list.reduce((sum, m) => sum + m.provedReservesMT, 0);
    const avgGrade = list.length ? (list.reduce((sum, m) => sum + m.avgGradePct * m.monthlyOutput, 0) / (totalOutput || 1)) : 43.1;
    const totalRakes = list.reduce((sum, m) => sum + m.dispatchRakesPerMonth, 0);
    const avgWater = list.length ? list.reduce((sum, m) => sum + m.waterRecycledPct, 0) / list.length : 86.5;
    const avgRecovery = list.length ? list.reduce((sum, m) => sum + m.recoveryRatePct, 0) / list.length : 85.8;
    const shortfall = totalTarget - totalOutput;
    const achievementPct = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;

    // Aggregate 12-Month Trend
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const aggregateTrend = months.map((month) => {
      let actSum: number | null = 0;
      let hasActual = true;
      let tgtSum = 0;
      let fcstSum = 0;
      let isMonsoon = false;

      list.forEach((m) => {
        const pt = m.monthlyTrend.find((t) => t.month === month);
        if (pt) {
          if (pt.actual === null) hasActual = false;
          else if (actSum !== null) actSum += pt.actual;
          tgtSum += pt.target;
          fcstSum += pt.forecast;
          if (pt.isMonsoon) isMonsoon = true;
        }
      });

      return {
        month,
        actual: hasActual ? actSum : null,
        target: tgtSum,
        forecast: fcstSum,
        isMonsoon,
      };
    });

    // Aggregate Grade Composition
    const totalHighGradeMT = list.reduce((sum, m) => sum + (m.monthlyOutput * m.gradeBreakdown.highGrade44Plus) / 100, 0);
    const totalMediumGradeMT = list.reduce((sum, m) => sum + (m.monthlyOutput * m.gradeBreakdown.mediumGrade38To44) / 100, 0);
    const totalLowGradeMT = list.reduce((sum, m) => sum + (m.monthlyOutput * m.gradeBreakdown.lowGradeBelow38) / 100, 0);
    const totalEmdMT = list.reduce((sum, m) => sum + (m.monthlyOutput * m.gradeBreakdown.emdElectrolytic) / 100, 0);

    return {
      count: list.length,
      monthlyOutput: totalOutput,
      monthlyTarget: totalTarget,
      annualizedOutput: totalOutput * 12,
      annualizedTarget: totalTarget * 12,
      provedReservesMT: totalReserves,
      avgGradePct: avgGrade,
      dispatchRakesPerMonth: totalRakes,
      waterRecycledPct: avgWater,
      recoveryRatePct: avgRecovery,
      shortfallMT: shortfall,
      achievementPct,
      trend: aggregateTrend,
      gradeComposition: {
        highGradePct: totalOutput ? Math.round((totalHighGradeMT / totalOutput) * 100) : 48,
        mediumGradePct: totalOutput ? Math.round((totalMediumGradeMT / totalOutput) * 100) : 41,
        lowGradePct: totalOutput ? Math.round((totalLowGradeMT / totalOutput) * 100) : 9,
        emdPct: totalOutput ? Math.round((totalEmdMT / totalOutput) * 100) : 2,
      },
    };
  }, [filteredMinesList]);

  // High Risk Alerts Count
  const highRiskCount = alerts.filter((a) => a.risk === 'HIGH' && a.status !== 'RESOLVED').length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${pageBg}`}>
      {/* Top Banner Notice for Action Feedback */}
      {actionNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#0E7C7B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-400/40 text-xs font-semibold flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-base">verified</span>
          <span>{actionNotification}</span>
        </div>
      )}

      {/* ADMIN TOP APP BAR */}
      <header className="sticky top-0 z-40 bg-[#002452] text-white shadow-md border-b border-[#00387A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Left */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white px-1 shadow-md border border-white/20">
              <div className="w-4 h-2 bg-white rounded-t-full mb-0.5" />
              <span className="text-[6.5px] leading-tight font-bold tracking-tighter">मॉयल</span>
              <span className="text-[7.5px] leading-none font-black tracking-tighter">MOIL</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
                  MOIL Admin Control Center
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                  Portfolio Governance
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                Multi-Mine Portfolio Intelligence, Statutory Compliance & Production Analytics
              </p>
            </div>
          </div>

          {/* User Controls Right */}
          <div className="flex items-center gap-3">
            {/* Backend status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'CONNECTED'
                    ? 'bg-teal-400 animate-pulse'
                    : backendStatus === 'CHECKING'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
              <span className="text-slate-200 font-medium">
                API: {backendStatus}
              </span>
            </div>

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              >
                <span className="material-symbols-outlined text-base">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}

            {/* User Profile info */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-xl">
              <span className="material-symbols-outlined text-amber-400 text-base">security</span>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {user?.display_name || user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-300">
                  Role: <span className="text-amber-300 font-bold uppercase">{user?.role || 'admin'}</span>
                </div>
              </div>
            </div>

            {/* Quick Switch to Mine Selection */}
            <button
              onClick={() => onNavigate('mine-selection')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              title="Inspect Operational Workspace as Site Manager"
            >
              <span className="material-symbols-outlined text-sm">engineering</span>
              <span>Operator View</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                onNavigate('landing');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-xs font-semibold text-rose-200 hover:text-white transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* 5 STREAMLINED ADMIN TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-[#00387A]/70 text-xs font-medium">
          {[
            { id: 'portfolio-overview', label: 'Portfolio Analytics & Intelligence', icon: 'analytics' },
            { id: 'mine-network', label: 'Mine Network Roster', icon: 'hub' },
            { id: 'alert-center', label: 'Risk & Alert Command', icon: 'crisis_alert' },
            { id: 'compliance-oversight', label: 'Statutory Compliance', icon: 'verified_user' },
            { id: 'reports-center', label: 'Reports & Dossiers', icon: 'description' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 py-3 px-4 whitespace-nowrap border-b-2 transition-all font-semibold cursor-pointer ${
                  isActive
                    ? 'border-[#FEA619] text-[#FEA619] bg-white/10 font-bold'
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'alert-center' && highRiskCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {highRiskCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN ADMIN WORKSPACE BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: UPGRADED PORTFOLIO ANALYTICS & INTELLIGENCE */}
        {/* ========================================================================= */}
        {activeTab === 'portfolio-overview' && (
          <div className="space-y-6">

            {/* ── 1. MINE SELECTION & CLUSTER FILTER CONTROL CONSOLE ── */}
            <div className={`p-5 rounded-2xl border shadow-sm ${
              isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200/90'
            }`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#002452] text-white material-symbols-outlined text-lg shadow-sm">
                      travel_explore
                    </span>
                    <div>
                      <h2 className={`text-base font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                        Central Manganese Belt — Portfolio Intelligence Console
                      </h2>
                      <p className={`text-xs mt-0.5 ${textSub}`}>
                        Filter entire central leasehold network or select specific mines to inspect localized telemetry
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter Controls: Cluster & Method */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {/* Cluster Pills */}
                  <div className={`flex items-center p-1 rounded-xl border ${
                    isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100/90 border-slate-200'
                  }`}>
                    {(['ALL', 'MH', 'MP'] as const).map((cluster) => (
                      <button
                        key={cluster}
                        onClick={() => {
                          setClusterFilter(cluster);
                          setSelectedMineId('all');
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          clusterFilter === cluster
                            ? 'bg-[#002452] text-white shadow-xs'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cluster === 'ALL' ? 'All States (11)' : cluster === 'MH' ? 'Maharashtra (6)' : 'Madhya Pradesh (5)'}
                      </button>
                    ))}
                  </div>

                  {/* Extraction Type Pills */}
                  <div className={`flex items-center p-1 rounded-xl border ${
                    isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100/90 border-slate-200'
                  }`}>
                    {(['ALL', 'Open Cast', 'Underground'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTypeFilter(t);
                          setSelectedMineId('all');
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          typeFilter === t
                            ? 'bg-[#0E7C7B] text-white shadow-xs'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t === 'ALL' ? 'All Methods' : t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mine Selection Chip Carousel */}
              <div className={`mt-4 pt-3.5 border-t flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}>
                <button
                  onClick={() => setSelectedMineId('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isAggregate
                      ? 'bg-[#002452] text-white shadow-md ring-2 ring-[#FEA619]'
                      : isDark ? 'bg-white/10 text-slate-200 hover:bg-white/15' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-[#FEA619]">hub</span>
                  <span>Aggregate Portfolio ({filteredMinesList.length} Mines)</span>
                </button>

                {filteredMinesList.map((m) => {
                  const isSelected = selectedMineId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMineId(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs shrink-0 transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                        isSelected
                          ? 'bg-[#0E7C7B] text-white font-bold shadow-md ring-2 ring-teal-400'
                          : isDark
                          ? 'bg-black/40 border border-white/10 text-slate-300 hover:bg-white/10'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {m.shortCode}
                      </span>
                      <span className="font-bold">{m.name}</span>
                      {m.isImplemented && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" title="AI Pilot Connected" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 2. DYNAMIC EXECUTIVE KPI HERO STRIP (6 Polished High-Contrast Cards) ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Output Metric */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-teal-500' : 'border-t-4 border-t-[#0E7C7B]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Monthly Output
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#0E7C7B] dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                    <span className="material-symbols-outlined text-base">inventory_2</span>
                  </span>
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-2 tracking-tight ${textHeading}`}>
                  {isAggregate
                    ? `${aggregateMetrics.monthlyOutput.toLocaleString()}`
                    : `${selectedMineData?.monthlyOutput.toLocaleString()}`}
                  <span className="text-xs font-normal text-slate-500 ml-1">MT</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                    Target: {isAggregate ? aggregateMetrics.monthlyTarget.toLocaleString() : selectedMineData?.monthlyTarget.toLocaleString()} MT
                  </span>
                </div>
              </div>

              {/* Achievement Rate */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-blue-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Achievement Rate
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-base">track_changes</span>
                  </span>
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-2 tracking-tight ${
                  (isAggregate ? aggregateMetrics.achievementPct : (((selectedMineData?.monthlyOutput || 0) / (selectedMineData?.monthlyTarget || 1)) * 100)) >= 90
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {isAggregate
                    ? `${aggregateMetrics.achievementPct.toFixed(1)}%`
                    : `${(((selectedMineData?.monthlyOutput || 0) / (selectedMineData?.monthlyTarget || 1)) * 100).toFixed(1)}%`}
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
                    Gap: {isAggregate ? `-${aggregateMetrics.shortfallMT.toLocaleString()} MT` : `-${((selectedMineData?.monthlyTarget || 0) - (selectedMineData?.monthlyOutput || 0)).toLocaleString()} MT`}
                  </span>
                </div>
              </div>

              {/* Proved Reserves */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-indigo-500' : 'border-t-4 border-t-indigo-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    UNFC 111 Reserves
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                    <span className="material-symbols-outlined text-base">landscape</span>
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-indigo-700 dark:text-indigo-400">
                  {isAggregate
                    ? `${aggregateMetrics.provedReservesMT.toFixed(1)}`
                    : `${selectedMineData?.provedReservesMT.toFixed(1)}`}
                  <span className="text-xs font-normal text-slate-500 ml-1">M MT</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                    MCDR Certified Proved
                  </span>
                </div>
              </div>

              {/* Weighted Grade */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-amber-500' : 'border-t-4 border-t-amber-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Weighted Grade
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                    <span className="material-symbols-outlined text-base">diamond</span>
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-amber-800 dark:text-amber-400">
                  {isAggregate
                    ? `${aggregateMetrics.avgGradePct.toFixed(1)}%`
                    : `${selectedMineData?.avgGradePct.toFixed(1)}%`}
                  <span className="text-xs font-bold text-slate-500 ml-1">Mn</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 truncate max-w-full">
                    {isAggregate ? 'High Furnace Purity' : selectedMineData?.gradeTier}
                  </span>
                </div>
              </div>

              {/* Rail Logistics */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-orange-500' : 'border-t-4 border-t-orange-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Rail Logistics
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800">
                    <span className="material-symbols-outlined text-base">train</span>
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-orange-700 dark:text-orange-400">
                  {isAggregate
                    ? `${aggregateMetrics.dispatchRakesPerMonth.toFixed(1)}`
                    : `${selectedMineData?.dispatchRakesPerMonth.toFixed(1)}`}
                  <span className="text-xs font-normal text-slate-500 ml-1">Rakes/mo</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800">
                    ~{isAggregate ? Math.round(aggregateMetrics.monthlyOutput * 0.95).toLocaleString() : Math.round((selectedMineData?.monthlyOutput || 0) * 0.95).toLocaleString()} MT Dispatched
                  </span>
                </div>
              </div>

              {/* Eco & Recovery */}
              <div className={`p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardBg} ${
                isDark ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-emerald-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Eco & Recovery
                  </span>
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-base">water_drop</span>
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black mt-2 tracking-tight text-emerald-700 dark:text-emerald-400">
                  {isAggregate
                    ? `${aggregateMetrics.waterRecycledPct.toFixed(0)}%`
                    : `${selectedMineData?.waterRecycledPct.toFixed(0)}%`}
                  <span className="text-xs font-bold text-slate-500 ml-1">Recycled</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                    Yield: {isAggregate ? aggregateMetrics.recoveryRatePct.toFixed(1) : selectedMineData?.recoveryRatePct.toFixed(1)}% Recovery
                  </span>
                </div>
              </div>
            </div>

            {/* ── 3. INTERACTIVE 12-MONTH TRAJECTORY & MONSOON FORECAST CHART ── */}
            <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0E7C7B] text-xl">monitoring</span>
                    <h3 className={`text-base font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                      {isAggregate
                        ? `12-Month Portfolio Production Trajectory & AI Forecast`
                        : `${selectedMineData?.name} 12-Month Output vs Target Baseline`}
                    </h3>
                  </div>
                  <p className={`text-xs mt-0.5 ${textSub}`}>
                    Historical MCDR actuals (Apr–Aug) with calibrated XGBoost monsoon deficits and post-monsoon surge trajectory (Sep–Mar)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    Live AI Forecast Model
                  </span>
                </div>
              </div>

              {/* Monsoon Season Highlight Ribbon - High Contrast */}
              <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-sky-50 via-blue-50 to-sky-100 dark:from-sky-950/60 dark:via-blue-950/40 dark:to-sky-950/60 border border-sky-300 dark:border-sky-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-700 dark:text-sky-300 text-lg">thunderstorm</span>
                  <div>
                    <span className="font-black text-sky-950 dark:text-sky-100 mr-1.5">
                      Monsoon Dewatering Window (June – September):
                    </span>
                    <span className="text-sky-900/90 dark:text-sky-200 font-medium">
                      Pit flooding & pithead drainage pump loads factored into AI baseline
                    </span>
                  </div>
                </div>
                <span className="self-start sm:self-auto font-mono font-bold text-[11px] bg-sky-800 text-white dark:bg-sky-700 px-2.5 py-1 rounded-lg border border-sky-900 shadow-xs">
                  Deficit Recovered by Q4
                </span>
              </div>

              {/* Graphical Visualization with Left Y-Axis Scale */}
              {(() => {
                const trendData = isAggregate ? aggregateMetrics.trend : selectedMineData?.monthlyTrend || [];
                const highestPoint = Math.max(...trendData.map((d) => Math.max(d.actual || 0, d.target, d.forecast)));
                const maxVal = Math.ceil((highestPoint * 1.15) / 1000) * 1000;
                const yTicks = [
                  Math.round(maxVal),
                  Math.round(maxVal * 0.75),
                  Math.round(maxVal * 0.5),
                  Math.round(maxVal * 0.25),
                  0,
                ];

                return (
                  <div className="space-y-4">
                    {/* Chart Outer Container with Y-Axis */}
                    <div className="relative pt-6 pb-2">
                      
                      {/* Flex layout: Left Y-Axis + Main Chart Area */}
                      <div className="flex items-stretch gap-2 sm:gap-4 h-72">
                        
                        {/* Y-Axis Numerical Labels */}
                        <div className="flex flex-col justify-between items-end pb-8 pt-1 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 w-12 sm:w-16 shrink-0 select-none">
                          {yTicks.map((val, idx) => (
                            <span key={idx} className="leading-none">
                              {val >= 1000 ? `${(val / 1000).toFixed(0)}k MT` : `${val} MT`}
                            </span>
                          ))}
                        </div>

                        {/* Chart Grid & Columns Container */}
                        <div className="relative flex-1 h-full pb-8">
                          
                          {/* Horizontal Dashed Grid Lines */}
                          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                            <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
                            <div className="border-b border-slate-400 dark:border-slate-600 w-full" />
                          </div>

                          {/* Columns Grid */}
                          <div className="grid grid-cols-12 gap-1.5 sm:gap-3 items-end h-full relative z-10">
                            {trendData.map((pt) => {
                              const valueToDisplay = pt.actual !== null ? pt.actual : pt.forecast;
                              const barH = Math.min(100, Math.max(8, Math.round((valueToDisplay / maxVal) * 100)));
                              const targetH = Math.min(100, Math.round((pt.target / maxVal) * 100));
                              const isProjected = pt.actual === null;
                              const gap = valueToDisplay - pt.target;
                              const isDeficit = gap < 0;

                              return (
                                <div
                                  key={pt.month}
                                  onMouseEnter={() => setHoveredMonth(pt.month)}
                                  onMouseLeave={() => setHoveredMonth(null)}
                                  className="flex flex-col items-center h-full justify-end group relative cursor-pointer"
                                >
                                  {/* Hover Tooltip Card */}
                                  {hoveredMonth === pt.month && (
                                    <div className="absolute -top-24 z-40 bg-[#002452] text-white p-3 rounded-xl text-xs whitespace-nowrap shadow-2xl border border-blue-400/40 space-y-1 animate-fade-in pointer-events-none">
                                      <div className="font-bold flex items-center justify-between gap-3 border-b border-white/15 pb-1">
                                        <span className="text-sm font-black text-white">{pt.month}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono font-bold ${
                                          isProjected ? 'bg-teal-500/30 text-teal-300 border border-teal-400/40' : 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                                        }`}>
                                          {isProjected ? 'XGBoost AI Forecast' : 'MCDR Actual'}
                                        </span>
                                      </div>
                                      <div className="pt-1 flex items-center justify-between gap-4">
                                        <span className="text-slate-300">Production:</span>
                                        <span className="font-mono font-black text-teal-300">{valueToDisplay.toLocaleString()} MT</span>
                                      </div>
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-slate-300">Baseline Target:</span>
                                        <span className="font-mono text-slate-200">{pt.target.toLocaleString()} MT</span>
                                      </div>
                                      <div className={`font-bold flex items-center justify-between gap-4 pt-0.5 ${
                                        isDeficit ? 'text-rose-300' : 'text-emerald-300'
                                      }`}>
                                        <span>Variance:</span>
                                        <span>{gap > 0 ? `+${gap.toLocaleString()}` : `${gap.toLocaleString()}`} MT</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Target Marker Tick Line */}
                                  <div
                                    className="w-full border-t-2 border-dashed border-amber-500 dark:border-amber-400 absolute z-20 pointer-events-none"
                                    style={{ bottom: `${targetH}%` }}
                                  />

                                  {/* Bar Column with Rich Theme Gradients */}
                                  <div className="w-full max-w-[42px] flex items-end h-full">
                                    <div
                                      className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-115 shadow-sm ${
                                        isProjected
                                          ? 'bg-gradient-to-t from-teal-700 via-teal-500 to-teal-400 border-2 border-dashed border-teal-300 dark:border-teal-400'
                                          : pt.isMonsoon
                                          ? 'bg-gradient-to-t from-sky-700 via-sky-600 to-sky-400'
                                          : 'bg-gradient-to-t from-[#002452] via-[#0A4D7C] to-[#0E7C7B]'
                                      }`}
                                      style={{ height: `${barH}%` }}
                                    />
                                  </div>

                                  {/* Month Label */}
                                  <span className={`text-[11px] font-black mt-2 font-mono ${
                                    pt.isMonsoon
                                      ? 'text-sky-700 dark:text-sky-400'
                                      : isDark ? 'text-slate-300' : 'text-slate-800'
                                  }`}>
                                    {pt.month}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Legend Bar */}
                      <div className="flex flex-wrap items-center justify-center gap-6 mt-3 text-xs font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded bg-gradient-to-t from-[#002452] to-[#0E7C7B] shadow-xs" />
                          <span>Actual Output</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded bg-gradient-to-t from-sky-700 to-sky-400 shadow-xs" />
                          <span>Monsoon Period (Jun–Sep)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded bg-teal-400 border-2 border-dashed border-teal-700 shadow-xs" />
                          <span>XGBoost AI Forecast (Sep–Mar)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 border-t-2 border-dashed border-amber-500" />
                          <span>Target Baseline</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── 4. MULTI-MINE COMPARATIVE BENCHMARK & QUALITY SPECTRUM ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Mine-by-Mine Comparative Performance Spectrum */}
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0E7C7B] text-xl">stacked_bar_chart</span>
                    <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                      Mine-by-Mine Output vs Target Spectrum
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredMinesList.length} Operating Mines
                  </span>
                </div>

                <div className="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
                  {filteredMinesList.map((m) => {
                    const achPct = Math.min(100, Math.round((m.monthlyOutput / m.monthlyTarget) * 100));
                    const gap = m.monthlyOutput - m.monthlyTarget;
                    const isSevere = gap < -800;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMineId(m.id)}
                        className="pt-3 first:pt-0 space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                              {m.shortCode}
                            </span>
                            <span className="text-slate-900 dark:text-white font-black text-xs hover:text-[#0E7C7B]">
                              {m.name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              m.type === 'Open Cast'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}>
                              {m.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 font-mono text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {m.monthlyOutput.toLocaleString()} / {m.monthlyTarget.toLocaleString()} MT
                            </span>
                            <span className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                              isSevere
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : achPct >= 95
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                            }`}>
                              {achPct}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSevere
                                ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                                : achPct >= 95
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                : 'bg-gradient-to-r from-[#002452] to-[#0E7C7B]'
                            }`}
                            style={{ width: `${achPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ore Grade & Quality Tier Distribution */}
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${cardBg}`}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FEA619] text-xl">pie_chart</span>
                    <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                      Ore Grade & Quality Composition
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {isAggregate ? 'Portfolio Aggregate' : selectedMineData?.name}
                  </span>
                </div>

                {(() => {
                  const breakdown = isAggregate ? aggregateMetrics.gradeComposition : {
                    highGradePct: selectedMineData?.gradeBreakdown.highGrade44Plus || 0,
                    mediumGradePct: selectedMineData?.gradeBreakdown.mediumGrade38To44 || 0,
                    lowGradePct: selectedMineData?.gradeBreakdown.lowGradeBelow38 || 0,
                    emdPct: selectedMineData?.gradeBreakdown.emdElectrolytic || 0,
                  };

                  return (
                    <div className="space-y-4 pt-1">
                      {/* Visual Stacked Bar with Clear Labels */}
                      <div className="w-full h-8 rounded-xl overflow-hidden flex shadow-sm border border-slate-300 dark:border-slate-700">
                        <div
                          style={{ width: `${breakdown.highGradePct}%` }}
                          className="bg-blue-600 h-full flex items-center justify-center text-[11px] font-mono font-bold text-white transition-all"
                          title={`High Grade (≥44% Mn): ${breakdown.highGradePct}%`}
                        >
                          {breakdown.highGradePct > 15 && `${breakdown.highGradePct}%`}
                        </div>
                        <div
                          style={{ width: `${breakdown.mediumGradePct}%` }}
                          className="bg-[#0E7C7B] h-full flex items-center justify-center text-[11px] font-mono font-bold text-white transition-all"
                          title={`Medium Grade (38–44%): ${breakdown.mediumGradePct}%`}
                        >
                          {breakdown.mediumGradePct > 15 && `${breakdown.mediumGradePct}%`}
                        </div>
                        <div
                          style={{ width: `${breakdown.lowGradePct}%` }}
                          className="bg-amber-500 h-full flex items-center justify-center text-[11px] font-mono font-bold text-white transition-all"
                          title={`Standard / Fines (<38%): ${breakdown.lowGradePct}%`}
                        >
                          {breakdown.lowGradePct > 10 && `${breakdown.lowGradePct}%`}
                        </div>
                        {breakdown.emdPct > 0 && (
                          <div
                            style={{ width: `${breakdown.emdPct}%` }}
                            className="bg-purple-600 h-full flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all"
                            title={`EMD Battery Grade: ${breakdown.emdPct}%`}
                          >
                            {breakdown.emdPct > 5 && `${breakdown.emdPct}%`}
                          </div>
                        )}
                      </div>

                      {/* 4 Detail Grade Breakdown Cards - High Contrast & Vibrant */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* High Grade Card */}
                        <div className="p-3.5 rounded-xl bg-[#EEF4FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-950 dark:text-blue-300">
                                High Grade (≥44% Mn)
                              </span>
                              <div className="font-mono text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
                                {breakdown.highGradePct}%
                              </div>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1" />
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-snug font-medium">
                            Premium ferromanganese & silico-manganese core smelter feed
                          </p>
                        </div>

                        {/* Medium Grade Card */}
                        <div className="p-3.5 rounded-xl bg-[#F0FDF9] dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-teal-950 dark:text-teal-300">
                                Medium Grade (38–44%)
                              </span>
                              <div className="font-mono text-xl font-black text-[#0E7C7B] dark:text-teal-400 mt-1">
                                {breakdown.mediumGradePct}%
                              </div>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7C7B] mt-1" />
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-snug font-medium">
                            Blast furnace direct charging and standard foundry grade
                          </p>
                        </div>

                        {/* Standard Fines Card */}
                        <div className="p-3.5 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
                                Standard / Fines (&lt;38%)
                              </span>
                              <div className="font-mono text-xl font-black text-amber-800 dark:text-amber-400 mt-1">
                                {breakdown.lowGradePct}%
                              </div>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1" />
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-snug font-medium">
                            Sinter plant blending ore & heavy media beneficiation feed
                          </p>
                        </div>

                        {/* Electrolytic Battery Grade Card */}
                        <div className="p-3.5 rounded-xl bg-[#FAF5FF] dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 shadow-2xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-purple-950 dark:text-purple-300">
                                Electrolytic (EMD/Battery)
                              </span>
                              <div className="font-mono text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
                                {breakdown.emdPct}%
                              </div>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1" />
                          </div>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1.5 leading-snug font-medium">
                            Specialty chemical battery grade mined at Dongri Buzurg
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ── 5. GEOTECHNICAL & OPERATIONAL PARAMETER MATRIX ── */}
            <div className={`p-6 rounded-2xl border shadow-sm ${cardBg}`}>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0E7C7B] text-xl">precision_manufacturing</span>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                    Geotechnical, Energy & Operational Parameters
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  DGMS & MCDR Calibrated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {/* Extraction Depth */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black block tracking-wider">
                    Extraction Depth / Ratio
                  </span>
                  <span className={`font-black text-base mt-1.5 block tracking-tight ${textHeading}`}>
                    {isAggregate ? '1:4.9 Avg OB / 260m Avg Hoist' : selectedMineData?.strippingRatioOrHoisting}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded mt-1.5">
                    Bench safety factor &gt; 1.35
                  </span>
                </div>

                {/* Beneficiation Yield */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black block tracking-wider">
                    Beneficiation Yield
                  </span>
                  <span className="font-black text-xl text-teal-700 dark:text-teal-400 mt-1.5 block font-mono">
                    {isAggregate ? `${aggregateMetrics.recoveryRatePct.toFixed(1)}%` : `${selectedMineData?.recoveryRatePct}%`}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-teal-900 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded mt-1.5">
                    Heavy Media Separation yield
                  </span>
                </div>

                {/* Specific Energy Rate */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black block tracking-wider">
                    Specific Energy Rate
                  </span>
                  <span className="font-black text-xl text-blue-700 dark:text-blue-400 mt-1.5 block font-mono">
                    {isAggregate ? '28.4 kWh/t' : `${selectedMineData?.energyKwhPerTon} kWh/t`}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded mt-1.5">
                    Captive solar offset
                  </span>
                </div>

                {/* Water Conservation */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                }`}>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black block tracking-wider">
                    Water Conservation
                  </span>
                  <span className="font-black text-xl text-emerald-700 dark:text-emerald-400 mt-1.5 block font-mono">
                    {isAggregate ? `${aggregateMetrics.waterRecycledPct.toFixed(0)}% Recycled` : `${selectedMineData?.waterRecycledPct}% Recycled`}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded mt-1.5">
                    Zero liquid discharge
                  </span>
                </div>
              </div>

              {/* Action Button for single mine */}
              {!isAggregate && selectedMineData?.isImplemented && (
                <div className={`mt-4 pt-3.5 border-t flex justify-end ${borderDivider}`}>
                  <button
                    onClick={() => onNavigate(`workspace/${selectedMineData.id}` as PortalRoute)}
                    className="px-4 py-2.5 bg-[#002452] hover:bg-[#00387A] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    <span>Launch {selectedMineData.name} Operational AI Workspace</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MINE NETWORK ROSTER — PASTEL ICE BLUE & DEEP NAVY TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'mine-network' && (
          <div className="space-y-6">
            {/* Header with Title & Summary Counter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-[#002452] text-white material-symbols-outlined text-xl shadow-md">
                    hub
                  </span>
                  <div>
                    <h2 className={`text-lg font-black uppercase tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      MOIL Central Manganese Belt — 11 Mines Network Roster
                    </h2>
                    <p className={`text-xs mt-0.5 ${textSub}`}>
                      Comprehensive register of leaseholds across Maharashtra and Madhya Pradesh clusters
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                {filteredRosterMines.length} of {MOIL_MINES.length} Registered Mines
              </span>
            </div>

            {/* Filter Pills Toolbar & Search Bar with Dark Blue Border */}
            <div className={`p-3.5 rounded-2xl border-2 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-xs ${
              isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-slate-50/90 border-[#002452]'
            }`}>
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold pb-1 md:pb-0">
                {[
                  { id: 'ALL', label: `All Mines (${MOIL_MINES.length})`, icon: 'apps' },
                  { id: 'ACTIVE', label: `AI Pilot Active (5)`, icon: 'smart_toy', color: 'text-emerald-500' },
                  { id: 'TELEMETRY', label: `Telemetry (6)`, icon: 'sensors', color: 'text-slate-400' },
                  { id: 'MH', label: `Maharashtra (6)`, icon: 'map', color: 'text-sky-500' },
                  { id: 'MP', label: `Madhya Pradesh (5)`, icon: 'location_city', color: 'text-amber-500' },
                ].map((tab) => {
                  const isActive = rosterTabFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setRosterTabFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                        isActive
                          ? 'bg-[#002452] text-white shadow-sm font-bold'
                          : isDark
                          ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                          : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80 font-semibold shadow-2xs'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-base ${tab.color || ''}`}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0 md:w-72">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Search mine, code, district..."
                  className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border transition-all focus:outline-hidden font-medium ${
                    isDark
                      ? 'bg-black/30 border-white/15 text-white placeholder:text-slate-500 focus:border-teal-400'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#002452] focus:ring-1 focus:ring-[#002452]'
                  }`}
                />
                {rosterSearch && (
                  <button
                    onClick={() => setRosterSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Table Container with Dark Blue Border */}
            <div className={`rounded-2xl border-2 shadow-sm overflow-hidden ${
              isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-white border-[#002452]'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  {/* Table Header with Signature Dark Blue Background */}
                  <thead className="bg-[#002452] text-white border-b border-[#00387A] text-[11px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Mine / Leasehold</th>
                      <th className="p-4">Location & Cluster</th>
                      <th className="p-4">Extraction Method</th>
                      <th className="p-4">Output / Target</th>
                      <th className="p-4">Average Grade</th>
                      <th className="p-4">Platform Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  {/* Table Body with Dark Blue Row Dividers */}
                  <tbody className={`divide-y-2 font-medium ${
                    isDark ? 'divide-[#00387A]/60' : 'divide-[#002452]/25'
                  }`}>
                    {filteredRosterMines.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">No mines match your filter criteria</span>
                            <button
                              onClick={() => {
                                setRosterTabFilter('ALL');
                                setRosterSearch('');
                              }}
                              className="text-xs text-sky-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                            >
                              Reset filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRosterMines.map((mine) => {
                        const detail = PORTFOLIO_MINES_DATA[mine.id];
                        const isSelected = selectedRosterMineId === mine.id;
                        const achPct = detail ? Math.min(100, Math.round((detail.monthlyOutput / detail.monthlyTarget) * 100)) : 90;

                        return (
                          <tr
                            key={mine.id}
                            onClick={() => setSelectedRosterMineId(mine.id)}
                            className={`transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? isDark
                                  ? 'bg-sky-950/30 border-l-4 border-l-teal-400'
                                  : 'bg-[#F0F7FF] border-l-4 border-l-[#002452]'
                                : isDark
                                ? 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                                : 'hover:bg-[#F8FAFC] border-l-4 border-l-transparent'
                            }`}
                          >
                            {/* Column 1: Mine / Identifier with Crisp Pastel Icon Box */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                                  mine.type === 'Open Cast'
                                    ? isDark
                                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                                      : 'bg-amber-50 text-amber-600 border-amber-200/90'
                                    : isDark
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                                    : 'bg-blue-50 text-blue-600 border-blue-200/90'
                                }`}>
                                  <span className="material-symbols-outlined text-xl">
                                    {mine.type === 'Open Cast' ? 'landscape' : 'layers'}
                                  </span>
                                </div>
                                <div>
                                  <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {mine.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                      isDark
                                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {mine.shortCode}
                                    </span>
                                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Lease #{mine.id.toUpperCase().replace('-', '')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Location & District */}
                            <td className="p-4">
                              <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                <span className={`material-symbols-outlined text-sm ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>location_on</span>
                                <span>{mine.district}, {mine.state}</span>
                              </div>
                              <div className="mt-1 pl-5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  isDark
                                    ? 'bg-slate-800/60 text-slate-300 border-slate-700'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {mine.state === 'Maharashtra' ? 'MH Central Belt' : 'MP Central Belt'}
                                </span>
                              </div>
                            </td>

                            {/* Column 3: Extraction Method (Crisp Pastel Pill) */}
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border shadow-2xs ${
                                mine.type === 'Open Cast'
                                  ? isDark
                                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                  : isDark
                                  ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${mine.type === 'Open Cast' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                {mine.type}
                              </span>
                            </td>

                            {/* Column 4: Monthly Output / Target with Mini Progress */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {detail ? `${detail.monthlyOutput.toLocaleString()}` : '—'}
                                </span>
                                <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>/</span>
                                <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {detail ? `${detail.monthlyTarget.toLocaleString()} MT` : '—'}
                                </span>
                              </div>
                              {detail && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <div className={`w-24 h-1.5 rounded-full overflow-hidden border ${
                                    isDark ? 'bg-slate-700 border-slate-700' : 'bg-slate-100 border-slate-200/60'
                                  }`}>
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        achPct >= 95
                                          ? 'bg-emerald-500'
                                          : achPct >= 85
                                          ? isDark ? 'bg-sky-400' : 'bg-[#002452]'
                                          : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${achPct}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {achPct}%
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Column 5: Average Grade (Pastel Mint/Teal/Cyan Badge) */}
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 border shadow-2xs ${
                                (detail?.avgGradePct || 42) >= 44
                                  ? isDark
                                    ? 'bg-teal-950/40 text-teal-300 border-teal-800/60'
                                    : 'bg-teal-50 text-teal-800 border-teal-200/90'
                                  : (detail?.avgGradePct || 42) >= 38
                                  ? isDark
                                    ? 'bg-sky-950/40 text-sky-300 border-sky-800/60'
                                    : 'bg-sky-50 text-sky-800 border-sky-200/90'
                                  : isDark
                                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                                  : 'bg-amber-50 text-amber-800 border-amber-200/90'
                              }`}>
                                <span className={`material-symbols-outlined text-xs ${
                                  (detail?.avgGradePct || 42) >= 44
                                    ? isDark ? 'text-teal-400' : 'text-teal-600'
                                    : (detail?.avgGradePct || 42) >= 38
                                    ? isDark ? 'text-sky-400' : 'text-sky-600'
                                    : isDark ? 'text-amber-400' : 'text-amber-600'
                                }`}>diamond</span>
                                <span>{detail ? `${detail.avgGradePct}% Mn` : '42.0% Mn'}</span>
                              </span>
                            </td>

                            {/* Column 6: Platform Status */}
                            <td className="p-4">
                              {mine.isImplemented ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border shadow-2xs ${
                                  isDark
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/90'
                                }`}>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  AI Pilot Active
                                </span>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${
                                  isDark
                                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                                  Telemetry Monitored
                                </span>
                              )}
                            </td>

                            {/* Column 7: Operational Actions */}
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMineId(mine.id);
                                  setActiveTab('portfolio-overview');
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all shadow-2xs hover:shadow-xs inline-flex items-center gap-1.5 ${
                                  isDark
                                    ? 'bg-slate-800 hover:bg-slate-700 text-blue-200 border-slate-700'
                                    : 'bg-white hover:bg-slate-50 text-[#002452] border-slate-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">query_stats</span>
                                <span>Analytics</span>
                              </button>
                              {mine.isImplemented && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate(`workspace/${mine.id}` as PortalRoute);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#002452] hover:bg-[#00387A] text-white text-xs font-bold cursor-pointer transition-all shadow-xs hover:shadow-sm inline-flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                                  <span>Workspace</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: OPERATIONAL RISK & ALERT COMMAND CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'alert-center' && (
          <div className="space-y-6">
            {/* Common Dark Blue Console Header & Priority Filter Toolbar */}
            <div className="p-5 rounded-2xl bg-[#002452] text-white shadow-md border border-[#00387A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white/10 text-white material-symbols-outlined text-xl shadow-inner border border-white/15">
                  crisis_alert
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                      Portfolio Risk & Alert Command Center
                    </h2>
                    {highRiskCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white rounded-full shadow-xs">
                        {highRiskCount} High Risk
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Cross-mine operational deviations requiring executive acknowledgement or remediation assignment
                  </p>
                </div>
              </div>

              {/* Priority Filter Toolbar with Dark Blue Styling */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 border border-white/20 text-xs font-bold shrink-0">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAlertFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      alertFilter === filter
                        ? 'bg-white text-[#002452] shadow-sm font-black'
                        : 'text-white hover:bg-white/15'
                    }`}
                  >
                    {filter === 'ALL' ? 'All Alerts' : `${filter}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Cards Container with Dark Blue Border */}
            <div className={`p-4 rounded-2xl border-2 space-y-3 shadow-xs ${
              isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-slate-50/70 border-[#002452]'
            }`}>
              {alerts
                .filter((a) => alertFilter === 'ALL' || a.risk === alertFilter)
                .map((alert) => {
                  const cardColorClass =
                    alert.risk === 'HIGH'
                      ? isDark
                        ? 'bg-rose-950/25 border-rose-800/60'
                        : 'bg-[#FFF1F2] border-rose-200'
                      : alert.risk === 'MEDIUM'
                      ? isDark
                        ? 'bg-amber-950/25 border-amber-800/60'
                        : 'bg-[#FEF9C3]/80 border-amber-300'
                      : isDark
                      ? 'bg-yellow-950/15 border-yellow-900/40'
                      : 'bg-[#FEFCE8] border-yellow-200';

                  const badgeColorClass =
                    alert.risk === 'HIGH'
                      ? isDark
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-700/80'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                      : alert.risk === 'MEDIUM'
                      ? isDark
                        ? 'bg-amber-900/60 text-amber-200 border border-amber-700/80'
                        : 'bg-amber-200/90 text-amber-950 border border-amber-400'
                      : isDark
                      ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-800/80'
                      : 'bg-yellow-100 text-yellow-900 border border-yellow-300';

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-2xs hover:shadow-xs ${cardColorClass}`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColorClass}`}>
                            {alert.risk} PRIORITY
                          </span>
                          <span className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {alert.mineName}
                          </span>
                          <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            • {alert.timestamp}
                          </span>
                        </div>
                        <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {alert.title}
                        </h4>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                          {alert.description}
                        </p>
                        <div className="text-xs flex items-center gap-2 pt-1 font-medium">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                            Shortfall Exposure:{' '}
                            <span className="font-mono font-bold text-rose-600">{alert.exposureTons} MT</span>
                          </span>
                          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>•</span>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                            Status:{' '}
                            <span className={`font-bold ${
                              alert.status === 'RESOLVED'
                                ? 'text-teal-700'
                                : alert.status === 'ACKNOWLEDGED'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}>
                              {alert.status}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Administrative Actions */}
                      <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                        {alert.status === 'UNACKNOWLEDGED' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3.5 py-2 bg-[#002452] hover:bg-[#00387A] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STATUTORY & COMPLIANCE OVERSIGHT */}
        {/* ========================================================================= */}
        {activeTab === 'compliance-oversight' && (
          <div className="space-y-6">
            {/* Common Dark Blue Console Header */}
            <div className="p-5 rounded-2xl bg-[#002452] text-white shadow-md border border-[#00387A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white/10 text-white material-symbols-outlined text-xl shadow-inner border border-white/15">
                  verified_user
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                      Statutory Governance & MOIL Public Compliance
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white rounded-full shadow-xs">
                      100% Audit Current
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Continuous oversight of DGMS safety circulars, IBM MCDR annual filings, environmental clearances, and SEBI disclosures
                  </p>
                </div>
              </div>

              {/* Status Indicator Badges */}
              <div className="flex items-center gap-2 text-xs font-mono font-bold shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  DGMS Valid
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-sky-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  SEBI Current
                </span>
              </div>
            </div>

            {/* 2 Primary Governance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regulatory Clearances Card */}
              <div className={`rounded-2xl border-2 shadow-xs overflow-hidden ${
                isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-white border-[#002452]'
              }`}>
                {/* Header Strip */}
                <div className="bg-[#002452] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#00387A]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-emerald-400">shield</span>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      Regulatory Clearances & Safety Standards
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/15 px-2.5 py-0.5 rounded-md text-emerald-300">
                    4 Authorities
                  </span>
                </div>

                {/* Items Body */}
                <div className={`divide-y-2 p-4 space-y-3.5 ${
                  isDark ? 'divide-[#00387A]/50' : 'divide-[#002452]/15'
                }`}>
                  {[
                    {
                      agency: 'DGMS (Directorate General of Mines Safety)',
                      icon: 'security',
                      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      subject: 'Mines Act 1952 Safety Circulars & Periodic Clearance',
                      status: 'COMPLIANT',
                      statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      date: 'Audit completed Aug 2024',
                    },
                    {
                      agency: 'IBM (Indian Bureau of Mines)',
                      icon: 'description',
                      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
                      subject: 'MCDR 2017 Form F1 / G1 Annual Returns Verification',
                      status: 'FILED & VERIFIED',
                      statusClass: 'bg-teal-50 text-teal-800 border-teal-200',
                      date: 'FY 2023-24 Approved',
                    },
                    {
                      agency: 'Ministry of Environment, Forest & Climate Change',
                      icon: 'eco',
                      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
                      subject: 'Environmental Clearance (EC) & Consent to Operate (CTO)',
                      status: 'ACTIVE',
                      statusClass: 'bg-sky-50 text-sky-800 border-sky-200',
                      date: 'Valid till 2028',
                    },
                    {
                      agency: 'State Pollution Control Boards (MP & MH)',
                      icon: 'water_drop',
                      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
                      subject: 'Air & Water Quality Index Discharge Parameters',
                      status: 'WITHIN THRESHOLDS',
                      statusClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      date: 'Continuous Telemetry',
                    },
                  ].map((item) => (
                    <div key={item.agency} className="pt-3.5 first:pt-0 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-sm ${item.iconBg}`}>
                            <span className="material-symbols-outlined text-base">{item.icon}</span>
                          </div>
                          <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.agency}
                          </span>
                        </div>
                        <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border inline-flex items-center gap-1 shadow-2xs ${item.statusClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </div>
                      <p className={`text-xs pl-9 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>
                        {item.subject}
                      </p>
                      <div className="pl-9 pt-0.5">
                        <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOIL Public Disclosures Card */}
              <div className={`rounded-2xl border-2 shadow-xs overflow-hidden ${
                isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-white border-[#002452]'
              }`}>
                {/* Header Strip */}
                <div className="bg-[#002452] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#00387A]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-amber-400">corporate_fare</span>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                      Corporate Disclosures & Stakeholder Transparency
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/15 px-2.5 py-0.5 rounded-md text-amber-300">
                    Active Portals
                  </span>
                </div>

                {/* Items Body */}
                <div className={`divide-y-2 p-4 space-y-3.5 ${
                  isDark ? 'divide-[#00387A]/50' : 'divide-[#002452]/15'
                }`}>
                  {[
                    {
                      title: 'SEBI Corporate Governance Quarterly Report',
                      icon: 'fact_check',
                      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
                      category: 'SEBI (LODR) Regulation 27(2)',
                      state: 'PUBLISHED',
                      stateClass: 'bg-blue-50 text-blue-800 border-blue-200',
                    },
                    {
                      title: 'CSR Expenditure & Local Community Welfare (Health, Water)',
                      icon: 'volunteer_activism',
                      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      category: 'Section 135 Companies Act 2013',
                      state: 'ON TRACK (100% Budget)',
                      stateClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    },
                    {
                      title: 'Public Vigilance & Whistleblower Redressal Portal',
                      icon: 'policy',
                      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
                      category: 'Central Vigilance Commission (CVC)',
                      state: 'ZERO PENDING CASES',
                      stateClass: 'bg-teal-50 text-teal-800 border-teal-200',
                    },
                    {
                      title: 'Investor Grievance & E-Sales Metal Mandi Transparency',
                      icon: 'storefront',
                      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
                      category: 'MOIL Direct Sales Portal',
                      state: 'ACTIVE AUCTIONS',
                      stateClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    },
                  ].map((d) => (
                    <div key={d.title} className="pt-3.5 first:pt-0 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-sm ${d.iconBg}`}>
                            <span className="material-symbols-outlined text-base">{d.icon}</span>
                          </div>
                          <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {d.title}
                          </span>
                        </div>
                        <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border inline-flex items-center gap-1 shadow-2xs ${d.stateClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {d.state}
                        </span>
                      </div>
                      <div className="pl-9">
                        <span className={`inline-block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {d.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 5: REPORTS & TECHNICAL DOSSIERS */}
        {/* ========================================================================= */}
        {activeTab === 'reports-center' && (
          <div className="space-y-6">
            {/* Common Dark Blue Console Header */}
            <div className="p-5 rounded-2xl bg-[#002452] text-white shadow-md border border-[#00387A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white/10 text-white material-symbols-outlined text-xl shadow-inner border border-white/15">
                  description
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                    Reports & Technical Dossiers Center
                  </h2>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Technical evaluation dossiers, statutory integration reports, and operational gap analyses
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold bg-white/15 border border-white/20 text-white px-3 py-1.5 rounded-xl">
                6 Audited Dossiers
              </span>
            </div>

            {/* Reports 3x2 Grid matching the modern squircle card reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: 'MCDR Ground Truth Integration Report',
                  desc: 'Validation of Indian Bureau of Mines statutory production baselines across 11 MOIL manganese mines for FY 2024-25.',
                  path: 'reports/mcdr_integration_report.md',
                  category: 'STATUTORY',
                  catClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
                  size: '4.4 KB',
                  icon: 'fact_check',
                  gradient: 'from-sky-400 via-blue-500 to-indigo-600',
                  shadowClass: 'shadow-sky-500/25',
                },
                {
                  title: 'Production Gap-to-Target Operational Diagnosis',
                  desc: 'Comprehensive root cause diagnostic mapping weather disruptions, blasting schedules, and equipment downtime.',
                  path: 'models/evaluation/gap_to_target_report.md',
                  category: 'OPERATIONAL',
                  catClass: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
                  size: '2.2 KB',
                  icon: 'troubleshoot',
                  gradient: 'from-indigo-500 via-purple-600 to-slate-900',
                  shadowClass: 'shadow-indigo-500/25',
                },
                {
                  title: 'Feature 2 Seasonal Monsoon Dewatering Evaluation',
                  desc: 'Hydrological sensitivity curve and dewatering deficit forecasts for the Balaghat/Bhandara manganese belt.',
                  path: 'models/evaluation/feature2_seasonal_component_report.md',
                  category: 'ML EVALUATION',
                  catClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
                  size: '2.6 KB',
                  icon: 'water_drop',
                  gradient: 'from-amber-400 via-orange-500 to-amber-700',
                  shadowClass: 'shadow-amber-500/25',
                },
                {
                  title: 'Central Belt Ore Grade & Beneficiation Baseline',
                  desc: 'UNFC 111 reserve categorization and high-carbon ferromanganese blend formulation specifications.',
                  path: 'reports/ore_grade_beneficiation.md',
                  category: 'METALLURGY',
                  catClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
                  size: '3.1 KB',
                  icon: 'diamond',
                  gradient: 'from-rose-400 via-red-500 to-pink-700',
                  shadowClass: 'shadow-rose-500/25',
                },
                {
                  title: 'Geotechnical Pit Slope Stability & Safety Audit',
                  desc: 'Real-time radar displacement telemetry and highwall bench factor of safety (FoS) geotechnical audits.',
                  path: 'reports/dgms_slope_stability_audit.md',
                  category: 'DGMS SAFETY',
                  catClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
                  size: '5.8 KB',
                  icon: 'landscape',
                  gradient: 'from-teal-400 via-emerald-600 to-cyan-800',
                  shadowClass: 'shadow-teal-500/25',
                },
                {
                  title: 'Multi-Mine Rail Logistics & Fleet Dispatch Optimization',
                  desc: 'SECR rake allocation schedules, sidings turnaround times, and automated EV-dumper route optimization.',
                  path: 'reports/rail_fleet_dispatch_optimization.md',
                  category: 'LOGISTICS',
                  catClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
                  size: '3.7 KB',
                  icon: 'train',
                  gradient: 'from-purple-500 via-violet-600 to-indigo-800',
                  shadowClass: 'shadow-purple-500/25',
                },
              ].map((report) => (
                <div
                  key={report.title}
                  className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5 hover:shadow-lg ${
                    isDark
                      ? 'bg-[#151922] border-slate-800 hover:border-slate-700 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Squircle App Icon Badge + Category & Size Pill */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md relative overflow-hidden bg-gradient-to-br ${report.gradient} ${report.shadowClass}`}
                      >
                        {/* Subtle glass reflection highlight */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-2xl" />
                        <span className="material-symbols-outlined text-2xl drop-shadow-xs relative z-10">
                          {report.icon}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${report.catClass}`}>
                          {report.category}
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {report.size}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-base font-bold leading-snug mb-2 group-hover:text-[#002452] dark:group-hover:text-blue-400 transition-colors ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {report.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${
                      isDark ? 'text-slate-300' : 'text-slate-600 font-normal'
                    }`}>
                      {report.desc}
                    </p>

                    {/* File Path Tag */}
                    <div className={`text-[11px] font-mono truncate mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="opacity-75">File:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{report.path}</span>
                    </div>
                  </div>

                  {/* Bottom Action: Sleek Dark "Download" button matching reference */}
                  <div className="pt-2">
                    <button
                      onClick={() => triggerNotification(`Downloaded: ${report.title}`)}
                      className="px-4 py-2 rounded-lg bg-[#0e121b] dark:bg-[#1f2636] hover:bg-[#002452] dark:hover:bg-[#00387A] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 self-start active:scale-98"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminControlCenter;
