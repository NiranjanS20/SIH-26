import React, { useState, useEffect } from 'react';
import { type PortalRoute } from './Navbar';
import { fetchLiveMineWeather, type LiveWeatherData } from '../services/weatherService';
import { ProductionForecastEChart } from './ProductionForecastEChart';
import { FeatureImportanceEChart } from './FeatureImportanceEChart';
import { BlastingDelayHistogramEChart } from './BlastingDelayHistogramEChart';
import { SiteProductionPulseEChart } from './SiteProductionPulseEChart';
import { MineSiteVisualizer } from './MineSiteVisualizer';
import { PortfolioView } from './PortfolioView';
import { ShaderCard } from './ui/ShaderCard';
import Beams from './ui/Beams';
import { ThemeToggleSwitch } from './ui/ThemeToggleSwitch';
import { CustomerView } from './CustomerView';
import { ProspectivityView } from './ProspectivityView';
import { RecentActivityCard } from './RecentActivityCard';
import {
  getMineProductionProfile,
  MINE_PRODUCTION_PROFILES,
} from '../data/mineProductionData';
import { apiGet } from '../services/apiClient';

interface MineWorkspaceProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  initialMineId?: string;
  userRole?: 'admin' | 'site_manager' | 'industry_viewer';
}

export type OverviewTab =
  | 'overview'
  | 'site-intelligence'
  | 'prospectivity'
  | 'production-forecast'
  | 'shortfall-diagnosis'
  | 'corrective-actions'
  | 'alerts'
  | 'portfolio-view'
  | 'customer-view';

export interface ActionItem {
  id: string;
  priority: 'HIGH' | 'MEDIUM';
  title: string;
  problem: string;
  currentValue: string;
  targetValue: string;
  expectedImpact: string;
  status: 'PENDING' | 'ACTIONED' | 'RESOLVED';
  cause: string;
  reason: string;
  createdTime: string;
}

export interface AlertItem {
  id: string;
  alertId: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  zone: string;
  title: string;
  description: string;
  forecast: string;
  target: string;
  gap: string;
  generatedTime: string;
  status: 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'MONITORING';
  acknowledgedBy?: string;
  acknowledgedTime?: string;
  recipients: string[];
}

// Tabs accessible to site_manager
const SITE_MANAGER_TABS: OverviewTab[] = [
  'overview',
  'site-intelligence',
  'prospectivity',
  'production-forecast',
  'shortfall-diagnosis',
  'corrective-actions',
  'alerts',
];

export const MineWorkspace: React.FC<MineWorkspaceProps> = ({
  onNavigate,
  themeMode = 'dark',
  onToggleTheme,
  initialMineId = 'dongri-buzurg',
  userRole = 'admin',
}) => {
  const [activeTab, setActiveTab] = useState<OverviewTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab') as OverviewTab;
      if (t && SITE_MANAGER_TABS.includes(t)) {
        return t;
      }
    }
    return 'overview';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMineDropdownOpen, setIsMineDropdownOpen] = useState<boolean>(false);

  // Multi-Mine State
  const [selectedMineId, setSelectedMineId] = useState<string>(initialMineId);
  const [mineProfile, setMineProfile] = useState<any>(getMineProductionProfile(initialMineId));

  // Sync state if prop changes
  useEffect(() => {
    setSelectedMineId(initialMineId);
    setMineProfile(getMineProductionProfile(initialMineId));
  }, [initialMineId]);

  useEffect(() => {
    let isMounted = true;
    apiGet<any>(`/mines/${selectedMineId}/workspace`)
      .then((data) => {
        if (isMounted && data) {
          const mappedProfile = {
            mineName: data.mineInfo?.name || 'Unknown Mine',
            shortCode: data.mineInfo?.name === 'Balaghat' ? 'BG' : data.mineInfo?.name === 'Tirodi' ? 'TR' : data.mineInfo?.name === 'Sitapatore' ? 'SP' : 'DB',
            type: data.mineInfo?.type || 'UNDERGROUND',
            state: data.mineInfo?.state || 'Maharashtra',
            district: data.mineInfo?.district || 'Bhandara',
            potentialSourceZone: data.futureSourceZone?.name || 'Unknown Zone',
            currentOutputTons: data.production?.actual || 0,
            plannedTargetTons: data.production?.target || 0,
            predictedOutputTons: data.production?.forecast || 0,
            projectedGapTons: data.production?.gap || 0,
            gapPct: data.production?.target ? Math.abs(Math.round((data.production.gap / data.production.target) * 100)) : 0,
            monthlyTrend: (data.production?.monthlyTrend || []).map((mt: any) => ({
              label: mt.month,
              actual: mt.actual,
              target: mt.target,
              forecast: mt.forecast,
              confidenceLower: mt.lowerBound,
              confidenceUpper: mt.upperBound,
              isMonsoon: ['Jun', 'Jul', 'Aug', 'Sep'].some(m => mt.month.includes(m))
            })),
            featureImportance: (data.riskContributors || []).map((rc: any, idx: number) => ({
              feature: rc.factor,
              weightPct: rc.importancePct,
              category: rc.factor.toLowerCase().includes('rain') ? 'Environmental' : 'Operational',
              color: ['#3B82F6', '#10B981', '#06B6D4', '#F59E0B', '#8B5CF6'][idx % 5]
            })),
            environmentalFactors: {
              rainfallPct: 70,
              rainfallMm: 45,
              ndvi: 0.42,
              soilMoisturePct: 65,
              equipmentAvailabilityPct: 80
            }
          };
          setMineProfile(mappedProfile);
        }
      })
      .catch((err) => console.error("Failed to fetch workspace:", err));
    return () => {
      isMounted = false;
    };
  }, [selectedMineId]);

  // Fetch ML Forecasting Data
  useEffect(() => {
    let isMounted = true;
    apiGet<any>(`/mines/${selectedMineId}/forecasting`)
      .then((data) => {
        if (isMounted && data && data.forecasting) {
          setMineProfile((prev: any) => ({
            ...prev,
            monthlyTrend: data.forecasting.monthlyTrend ? data.forecasting.monthlyTrend.map((mt: any) => ({
              label: mt.month,
              actual: mt.actual,
              target: mt.target,
              forecast: mt.forecast,
              confidenceLower: mt.lowerBound,
              confidenceUpper: mt.upperBound,
              isMonsoon: ['Jun', 'Jul', 'Aug', 'Sep'].some(m => mt.month.includes(m))
            })) : prev.monthlyTrend,
            predictedOutputTons: data.forecasting.forecast || prev.predictedOutputTons
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch forecasting:", err));
    return () => { isMounted = false; };
  }, [selectedMineId]);

  // Fetch Shortfall Early Warning Data
  useEffect(() => {
    let isMounted = true;
    apiGet<any>(`/mines/${selectedMineId}/shortfall`)
      .then((data) => {
        if (isMounted && data && data.shortfall) {
          setMineProfile((prev: any) => ({
            ...prev,
            shortfallRisk: data.shortfall || prev.shortfallRisk,
            alerts: data.alerts || prev.alerts
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch shortfall:", err));
    return () => { isMounted = false; };
  }, [selectedMineId]);

  // Fetch SHAP Cause Analysis Data (admin only — backend enforces, frontend skips for site_manager)
  useEffect(() => {
    if (userRole !== 'admin') return;
    let isMounted = true;
    apiGet<any>(`/mines/${selectedMineId}/cause-analysis`)
      .then((data) => {
        if (isMounted && data && data.causeAnalysis) {
          setMineProfile((prev: any) => ({
            ...prev,
            featureImportance: data.causeAnalysis ? data.causeAnalysis.map((rc: any, idx: number) => ({
              feature: rc.factor,
              weightPct: rc.importancePct,
              category: rc.factor.toLowerCase().includes('rain') ? 'Environmental' : 'Operational',
              color: ['#3B82F6', '#10B981', '#06B6D4', '#F59E0B', '#8B5CF6'][idx % 5]
            })) : prev.featureImportance
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch cause analysis:", err));
    return () => { isMounted = false; };
  }, [selectedMineId, userRole]);

  // Fetch Corrective Actions Data
  useEffect(() => {
    let isMounted = true;
    apiGet<any>(`/mines/${selectedMineId}/corrective-action`)
      .then((data) => {
        if (isMounted && data && data.correctiveActions) {
          const rec = data.correctiveActions;
          setActions(prev => {
            const updated = [...prev];
            updated[0] = {
              ...updated[0],
              problem: rec.instruction || updated[0].problem,
              currentValue: rec.currentParams?.equipmentAvailability || updated[0].currentValue,
              targetValue: rec.recommendedParams?.equipmentAvailability || updated[0].targetValue,
              expectedImpact: `Mitigate gap: ${rec.currentParams?.expectedGap} -> ${rec.recommendedParams?.expectedGap}`,
              reason: rec.instruction || updated[0].reason
            };
            return updated;
          });
        }
      })
      .catch((err) => console.error("Failed to fetch corrective action:", err));
    return () => { isMounted = false; };
  }, [selectedMineId]);

  // Shortfall Diagnosis View Mode & Tab State
  const [shortfallMode, setShortfallMode] = useState<'SHIFT_LOG' | 'BASELINE'>('SHIFT_LOG');
  const [diagnosisViewMode, setDiagnosisViewMode] = useState<'SUMMARY' | 'CAUSE_ANALYSIS'>('SUMMARY');

  // Google Form Style Multi-Section Navigation State
  const [shiftSection, setShiftSection] = useState<'PRODUCTION' | 'BLASTING'>('PRODUCTION');

  // Section 1: Site Manager Interactive Production & Fleet State
  const [shiftDate, setShiftDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shiftType, setShiftType] = useState<'SHIFT_A' | 'SHIFT_B' | 'SHIFT_C' | 'GENERAL'>('SHIFT_A');
  const [actualOutputInput, setActualOutputInput] = useState<number>(4100);
  const [operatingHoursInput, setOperatingHoursInput] = useState<number>(6.2);
  const [downtimeHoursInput, setDowntimeHoursInput] = useState<number>(1.8);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([
    'EQUIPMENT_BREAKDOWN',
    'BLASTING_DELAY',
    'RAINFALL_INFLOW',
  ]);
  const [managerRemarks, setManagerRemarks] = useState<string>(
    'Excavator EX-04 experienced hydraulic seal rupture at 10:15 AM causing 1.8h loading stoppage at Pit Bench 3.'
  );

  // Section 2: Blasting Plan Timeline & Delay Diagnostics State
  const [blastId, setBlastId] = useState<string>('DB-Z14-P3-SHOT88');
  const [blastBenchZone, setBlastBenchZone] = useState<string>('Pit Bench 3 (Zone 14 South Reef)');
  const [plannedBlastTime, setPlannedBlastTime] = useState<string>('13:30');
  const [actualDetonationTime, setActualDetonationTime] = useState<string>('15:45');
  const [blastDelayHours, setBlastDelayHours] = useState<number>(2.25);
  const [plannedHoles, setPlannedHoles] = useState<number>(48);
  const [chargedHoles, setChargedHoles] = useState<number>(48);
  const [explosiveMassKg, setExplosiveMassKg] = useState<number>(2400);
  const [predictedYieldTons, setPredictedYieldTons] = useState<number>(4500);
  const [powderFactor, setPowderFactor] = useState<number>(0.53);
  const [selectedBlastingReasons, setSelectedBlastingReasons] = useState<string[]>([
    'DGMS_SAFETY_CLEARANCE',
    'WET_HOLES_PUMPING',
  ]);
  const [blastingRemarks, setBlastingRemarks] = useState<string>(
    'DGMS statutory bench vibration clearance delayed charging by 1.25h; water in 8 drill holes required secondary submersible blowouts.'
  );
  const [blastMilestones, setBlastMilestones] = useState([
    { id: 1, name: 'Pattern Drilling Complete', time: '08:30', status: 'COMPLETED', detail: '48 holes drilled at 4.2m spacing' },
    { id: 2, name: 'Hole Charging & Priming', time: '10:45', status: 'COMPLETED', detail: '2,400 kg ANFO/Emulsion charged' },
    { id: 3, name: 'DGMS Statutory Clearance', time: '13:15', status: 'DELAYED', detail: 'Statutory bench signoff lag (+75 min)' },
    { id: 4, name: 'Siren & Buffer Evacuation', time: '14:30', status: 'COMPLETED', detail: '500m haul road perimeter sealed' },
    { id: 5, name: 'Detonation Clearance', time: '15:45', status: 'COMPLETED', detail: 'Nonel shock tube fired without misfire' },
    { id: 6, name: 'Post-Blast Inspection', time: '16:15', status: 'COMPLETED', detail: 'All-clear clearance granted for loading' },
  ]);

  // Processing, progress, and result states
  const [isProcessingDiagnosis, setIsProcessingDiagnosis] = useState<boolean>(false);
  const [hasRunDiagnosis, setHasRunDiagnosis] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(1);
  const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);
  const [shiftToastMsg, setShiftToastMsg] = useState<string | null>(null);

  const [processedDiagnosis, setProcessedDiagnosis] = useState<{
    target: number;
    actual: number;
    gap: number;
    gapPct: number;
    operatingHours: number;
    downtimeHours: number;
    blastDelayHours: number;
    efficiencyPct: number;
    riskState: 'HIGH' | 'MEDIUM' | 'LOW';
    riskLabel: string;
    reasons: string[];
    blastingReasons: string[];
    shapContributions: { label: string; pct: number; color: string; desc: string }[];
    closureConditions: { title: string; target: string; desc: string }[];
    evaluatedAt: string;
    shiftDate: string;
    shiftType: string;
    blastId: string;
    blastBenchZone: string;
  } | null>(null);

  // Sync default actual output when mineProfile loads
  useEffect(() => {
    if (mineProfile?.plannedTargetTons) {
      setActualOutputInput(mineProfile.currentOutputTons || 4100);
    }
  }, [mineProfile?.currentOutputTons]);

  const handleToggleReason = (key: string) => {
    setSelectedReasons((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  const handleToggleBlastingReason = (key: string) => {
    setSelectedBlastingReasons((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  const handleRunDiagnosis = () => {
    setIsProcessingDiagnosis(true);
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 400);
    setTimeout(() => setProcessingStep(3), 850);

    setTimeout(() => {
      const target = mineProfile?.plannedTargetTons || 5000;
      const actual = Number(actualOutputInput) || 0;
      const gap = actual - target;
      const gapPct = target > 0 ? Math.abs(Math.round((gap / target) * 100)) : 0;
      const opHours = Number(operatingHoursInput) || 0;
      const dtHours = Number(downtimeHoursInput) || 0;
      const bDelay = Number(blastDelayHours) || 0;
      const totalHours = opHours + dtHours > 0 ? opHours + dtHours : 8.0;
      const efficiencyPct = Math.min(100, Math.round((opHours / totalHours) * 100));

      let riskState: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let riskLabel = 'LOW RISK / ON TARGET';
      if (gap < -400 || dtHours >= 1.5 || bDelay >= 1.5 || gapPct >= 15) {
        riskState = 'HIGH';
        riskLabel = 'HIGH RISK TARGET DEFICIT';
      } else if (gap < 0 || dtHours >= 0.8 || bDelay >= 0.5 || gapPct >= 5) {
        riskState = 'MEDIUM';
        riskLabel = 'MEDIUM RISK VARIANCE';
      }

      // Dynamic SHAP cause weighting integrating both shift downtime and blasting delay factors
      const blastingWeight = Math.min(
        50,
        Math.max(22, Math.round((bDelay / 3.0) * 32 + selectedBlastingReasons.length * 5))
      );

      const equipmentWeight = Math.min(
        55,
        Math.max(28, Math.round((dtHours / totalHours) * 100 + 12))
      );

      const reasonsMap: Record<string, { label: string; basePct: number; color: string; desc: string }> = {
        EQUIPMENT_BREAKDOWN: {
          label: 'EQUIPMENT DOWNTIME',
          basePct: equipmentWeight,
          color: '#B03A2E',
          desc: `${dtHours} hrs of equipment breakdown reduced active excavator loading capacity.`,
        },
        BLASTING_DELAY: {
          label: 'BLASTING DELAY & STATUTORY LAG',
          basePct: blastingWeight,
          color: '#D97706',
          desc: `${bDelay} hrs delay in shot execution at ${blastBenchZone} restricted muckpile release (${selectedBlastingReasons.join(', ').replace(/_/g, ' ')}).`,
        },
        RAINFALL_INFLOW: {
          label: 'MONSOON & DEWATERING',
          basePct: 20,
          color: '#3B82F6',
          desc: 'Sump water accumulation and wet haul road conditions slowed dumper turnaround cycle.',
        },
        ORE_GRADE_VARIANCE: {
          label: 'ORE GRADE VARIANCE',
          basePct: 15,
          color: '#10B981',
          desc: 'Local reef siltation and grade dilution resulted in higher rejection.',
        },
        HAUL_ROAD_CONGESTION: {
          label: 'HAUL ROAD CONGESTION',
          basePct: 14,
          color: '#8B5CF6',
          desc: 'Siding queuing and dumper turnaround bottlenecks reduced hourly haul rate.',
        },
        POWER_OUTAGE: {
          label: 'GRID POWER INTERRUPTION',
          basePct: 12,
          color: '#EC4899',
          desc: 'Feeder voltage fluctuations paused secondary crushing and sump pump motors.',
        },
        PLANT_CHOKE: {
          label: 'SCREENING PLANT CHOKE',
          basePct: 10,
          color: '#06B6D4',
          desc: 'Grizzly screen blinding caused temporary feed hopper overflow.',
        },
      };

      const activeKeys = selectedReasons.length > 0 ? selectedReasons : ['EQUIPMENT_BREAKDOWN', 'BLASTING_DELAY'];
      const rawItems = activeKeys.map((key) => reasonsMap[key] || {
        label: key.replace('_', ' '),
        basePct: 20,
        color: '#64748B',
        desc: 'Identified operational factor impacting shift throughput.',
      });

      const totalRaw = rawItems.reduce((sum, item) => sum + item.basePct, 0);
      const shapContributions = rawItems.map((item) => ({
        ...item,
        pct: Math.round((item.basePct / totalRaw) * 100),
      }));

      const closureConditions = [
        {
          title: 'EQUIPMENT EFFICIENCY',
          target: `${efficiencyPct}% → ≥ 95%`,
          desc: `Eliminate ${dtHours}h downtime by completing hydraulic preventative checks on shift start.`,
        },
        {
          title: 'BLASTING WINDOW CALIBRATION',
          target: `Advance by ${bDelay > 0 ? `${bDelay} hrs` : '2.0 hrs'}`,
          desc: `Pre-schedule statutory DGMS bench clearance and deploy mobile air hole dewatering to prevent shot lag.`,
        },
        {
          title: 'FRAGMENTATION MUCKPILE RELEASE',
          target: `${predictedYieldTons.toLocaleString()} t yield`,
          desc: `Maintain optimal powder factor (${powderFactor} kg/t) to sustain shovel payload index.`,
        },
        {
          title: 'DEWATERING SUMP PUMPING',
          target: '1,200 m³/hr continuous',
          desc: 'Engage auxiliary submersible pumps in lower sump benches.',
        },
      ];

      setProcessedDiagnosis({
        target,
        actual,
        gap,
        gapPct,
        operatingHours: opHours,
        downtimeHours: dtHours,
        blastDelayHours: bDelay,
        efficiencyPct,
        riskState,
        riskLabel,
        reasons: activeKeys,
        blastingReasons: selectedBlastingReasons,
        shapContributions,
        closureConditions,
        evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        shiftDate,
        shiftType,
        blastId,
        blastBenchZone,
      });

      setIsProcessingDiagnosis(false);
      setHasRunDiagnosis(true);
      setIsFormCollapsed(true);
      setShiftToastMsg('AI Shortfall Diagnosis & Multi-Factor SHAP Analysis synthesized successfully!');
      setTimeout(() => setShiftToastMsg(null), 3500);
    }, 1350);
  };

  const handleLoadDefaults = () => {
    setActualOutputInput(mineProfile?.currentOutputTons || 4100);
    setOperatingHoursInput(6.2);
    setDowntimeHoursInput(1.8);
    setSelectedReasons(['EQUIPMENT_BREAKDOWN', 'BLASTING_DELAY', 'RAINFALL_INFLOW']);
    setManagerRemarks('Excavator EX-04 experienced hydraulic seal rupture at 10:15 AM causing 1.8h loading stoppage at Pit Bench 3.');
  };

  const handleToggleMilestone = (id: number) => {
    setBlastMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'COMPLETED' ? 'DELAYED' : 'COMPLETED' }
          : m
      )
    );
  };

  const handleLoadBlastingDefaults = () => {
    setBlastId('DB-Z14-P3-SHOT88');
    setBlastBenchZone('Pit Bench 3 (Zone 14 South Reef)');
    setPlannedBlastTime('13:30');
    setActualDetonationTime('15:45');
    setBlastDelayHours(2.25);
    setPlannedHoles(48);
    setChargedHoles(48);
    setExplosiveMassKg(2400);
    setPredictedYieldTons(4500);
    setPowderFactor(0.53);
    setSelectedBlastingReasons(['DGMS_SAFETY_CLEARANCE', 'WET_HOLES_PUMPING']);
    setBlastingRemarks('DGMS statutory bench vibration clearance delayed charging by 1.25h; water in 8 drill holes required secondary submersible blowouts.');
    setBlastMilestones([
      { id: 1, name: 'Pattern Drilling Complete', time: '08:30', status: 'COMPLETED', detail: '48 holes drilled at 4.2m spacing' },
      { id: 2, name: 'Hole Charging & Priming', time: '10:45', status: 'COMPLETED', detail: '2,400 kg ANFO/Emulsion charged' },
      { id: 3, name: 'DGMS Statutory Clearance', time: '13:15', status: 'DELAYED', detail: 'Statutory bench signoff lag (+75 min)' },
      { id: 4, name: 'Siren & Buffer Evacuation', time: '14:30', status: 'COMPLETED', detail: '500m haul road perimeter sealed' },
      { id: 5, name: 'Detonation Clearance', time: '15:45', status: 'COMPLETED', detail: 'Nonel shock tube fired without misfire' },
      { id: 6, name: 'Post-Blast Inspection', time: '16:15', status: 'COMPLETED', detail: 'All-clear clearance granted for loading' },
    ]);
  };

  // Real-time OpenWeather Stream State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    const lat = selectedMineId === 'balaghat' ? 21.870 : (selectedMineId === 'tirodi' || selectedMineId === 'sitapatore') ? 21.680 : 21.554;
    const lng = selectedMineId === 'balaghat' ? 80.185 : (selectedMineId === 'tirodi' || selectedMineId === 'sitapatore') ? 79.720 : 79.702;
    fetchLiveMineWeather(lat, lng, mineProfile.mineName).then((data) => {
      setLiveWeather(data);
    });
  }, [selectedMineId]);

  // Corrective Actions State & In-Place Expansion
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act-1',
      priority: 'HIGH',
      title: 'Improve Equipment Efficiency',
      problem: 'Equipment downtime is the largest contributor to the projected shortfall.',
      currentValue: '80%',
      targetValue: '100%',
      expectedImpact: 'Reduce production gap',
      status: 'PENDING',
      cause: 'Equipment downtime',
      reason: 'Equipment availability is currently the largest contributor to the projected shortfall.',
      createdTime: '08:42 today',
    },
    {
      id: 'act-2',
      priority: 'HIGH',
      title: 'Reduce Blasting Delay',
      problem: 'Current blasting delay is contributing significantly to the production gap.',
      currentValue: '2 days',
      targetValue: '≤ 0 days',
      expectedImpact: 'Increase available production window',
      status: 'PENDING',
      cause: 'Blasting delay',
      reason: 'Bench clearance delays are reducing the available excavator loading hours.',
      createdTime: '08:52 today',
    },
    {
      id: 'act-3',
      priority: 'MEDIUM',
      title: 'Monitor Rainfall Impact',
      problem: 'Rainfall is contributing to reduced production conditions.',
      currentValue: '70%',
      targetValue: 'Threshold Monitor',
      expectedImpact: 'Contextual monitoring',
      status: 'PENDING',
      cause: 'Rainfall & drainage',
      reason: 'IMD precipitation station indicates potential pit sump inflow.',
      createdTime: 'Yesterday',
    },
  ]);

  // Alerts State
  const [alertSubTab, setAlertSubTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED'>('ALL');
  const [alertsList, setAlertsList] = useState<AlertItem[]>([
    {
      id: 'alt-1',
      alertId: 'MOIL-DB-014',
      risk: 'HIGH',
      zone: 'Zone 14',
      title: 'PRODUCTION SHORTFALL',
      description: 'Projected production has crossed the configured High-risk threshold.',
      forecast: '4,100 t',
      target: '5,000 t',
      gap: '-900 t',
      generatedTime: '09:14 Today',
      status: 'UNACKNOWLEDGED',
      recipients: ['Mine Officer', 'MOIL HQ / Ministry Oversight', 'Industry Regional Desk'],
    },
    {
      id: 'alt-2',
      alertId: 'MOIL-DB-009',
      risk: 'MEDIUM',
      zone: 'Zone 09',
      title: 'PRODUCTION VARIANCE',
      description: 'Precipitation inflow affecting bench extraction access.',
      forecast: '4,650 t',
      target: '5,000 t',
      gap: '-350 t',
      generatedTime: 'Yesterday',
      status: 'MONITORING',
      recipients: ['Mine Officer', 'Pit Operations Lead'],
    },
  ]);

  // Alert History Log Entries
  const alertHistoryLog = [
    {
      time: '09:14 Today',
      risk: 'HIGH',
      zone: 'Zone 14',
      title: 'Production shortfall',
      status: 'Acknowledged',
      by: 'Mine Officer',
    },
    {
      time: 'Yesterday',
      risk: 'MEDIUM',
      zone: 'Zone 09',
      title: 'Production variance',
      status: 'Monitoring',
      by: 'Mine Officer',
    },
    {
      time: '2 days ago',
      risk: 'HIGH',
      zone: 'Zone 22',
      title: 'Forecast threshold',
      status: 'Resolved',
      by: 'Mine Supervisor',
    },
    {
      time: '5 days ago',
      risk: 'MEDIUM',
      zone: 'Zone 04',
      title: 'Bench drainage warning',
      status: 'Resolved',
      by: 'Shift In-Charge',
    },
  ];

  // What-If Simulation Sliders State
  const [simEquipment, setSimEquipment] = useState<number>(80);
  const [simBlastingDelay, setSimBlastingDelay] = useState<number>(2);
  const [simRainfall, setSimRainfall] = useState<number>(70);
  const [simNdvi, setSimNdvi] = useState<number>(0.42);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const isDark = themeMode === 'dark';

  // Calculate simulated output dynamically based on inputs
  const simulatedGain = Math.round(
    (simEquipment - 80) * 25 - (simBlastingDelay - 2) * 120 - (simRainfall - 70) * 10
  );
  const simulatedOutput = 4100 + Math.max(-400, Math.min(900, simulatedGain));

  // Toggle Action Status
  const handleToggleActionStatus = (id: string) => {
    setActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextStatus =
            act.status === 'PENDING'
              ? 'ACTIONED'
              : act.status === 'ACTIONED'
              ? 'RESOLVED'
              : 'PENDING';
          return { ...act, status: nextStatus };
        }
        return act;
      })
    );
  };

  // Acknowledge Alert in-place
  const handleAcknowledgeAlert = (id: string) => {
    setAlertsList((prev) =>
      prev.map((alt) => {
        if (alt.id === id) {
          return {
            ...alt,
            status: 'ACKNOWLEDGED',
            acknowledgedBy: 'Mine Officer',
            acknowledgedTime: '09:18 Today',
          };
        }
        return alt;
      })
    );
  };

  const highPriorityCount = actions.filter((a) => a.priority === 'HIGH').length;
  const mediumPriorityCount = actions.filter((a) => a.priority === 'MEDIUM').length;
  const completedCount = actions.filter((a) => a.status === 'RESOLVED').length;
  const actionedCount = actions.filter((a) => a.status === 'ACTIONED' || a.status === 'RESOLVED').length;

  const filteredAlerts = alertsList.filter((alt) => {
    if (riskFilter !== 'ALL' && alt.risk !== riskFilter) return false;
    if (statusFilter === 'UNACKNOWLEDGED' && alt.status !== 'UNACKNOWLEDGED') return false;
    if (statusFilter === 'ACKNOWLEDGED' && alt.status !== 'ACKNOWLEDGED') return false;
    return true;
  });

  // =========================================================================
  // SITE MANAGER INTELLIGENCE & STATUTORY THREAT REGISTER STATE
  // =========================================================================
  const [siteRiskFilter, setSiteRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'STATUTORY'>('ALL');
  const [siteStatusSearch, setSiteStatusSearch] = useState<string>('');
  const [siteManagerToast, setSiteManagerToast] = useState<string | null>(null);

  const [siteManagerActions, setSiteManagerActions] = useState([
    {
      id: 'SMACT-01',
      priority: 'CRITICAL',
      title: 'DGMS Blasting Window Advance & Nonel Air-Decking',
      statutoryRef: 'DGMS Safety Tech Circular No. 04/2026 (Sec. 22A)',
      targetParam: 'Advance bench vibration signoff by 2.0h; keep PPV < 4.5 mm/s',
      owner: 'Blast In-Charge (Er. R. K. Sharma)',
      deadline: 'Next Shift 06:30',
      expectedRecoveryTons: 280,
      status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      impactArea: 'Restores Pit Bench 3 loading cycle; removes statutory stop-work hazard.',
    },
    {
      id: 'SMACT-02',
      priority: 'HIGH',
      title: 'High-Pressure Hydraulic Seal Overhaul on Excavator EX-04',
      statutoryRef: 'OEM Fleet Mechanical Standard & IBM MCDR Mining Regs',
      targetParam: 'Replace boom hydraulic seals; restore 100% equipment availability',
      owner: 'Fleet Maintenance Head (Er. V. Patel)',
      deadline: 'Today 18:00',
      expectedRecoveryTons: 420,
      status: 'IN_PROGRESS' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      impactArea: 'Recovers 1.8h active loading downtime across Pit Bench 3.',
    },
    {
      id: 'SMACT-03',
      priority: 'HIGH',
      title: 'Auxiliary Sump Dewatering Submersible Pump Array Deployment',
      statutoryRef: 'Central Ground Water Board (CGWB) & SPCB Dewatering Quota',
      targetParam: 'Deploy 2x 600 m³/hr submersible pumps to clear 8 waterlogged blast holes',
      owner: 'Dewatering Lead (Er. S. Rao)',
      deadline: 'Tomorrow 08:00',
      expectedRecoveryTons: 150,
      status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      impactArea: 'Maintains sump water discharge below 1,500 m³/hr statutory ceiling.',
    },
    {
      id: 'SMACT-04',
      priority: 'MEDIUM',
      title: 'Haul Road Incline Regrading & Smart Siding Dispatch Balancing',
      statutoryRef: 'Mines Rules 1955 (Ramp Gradient & Traffic Safety)',
      targetParam: 'Regrade 450m haul ramp; reduce cycle turnaround from 17.6m to 14.0m',
      owner: 'Mine Logistics Lead (Er. A. Deshmukh)',
      deadline: 'Today 20:00',
      expectedRecoveryTons: 120,
      status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      impactArea: 'Eliminates dumper siding queuing and haul ramp traffic chokepoints.',
    },
  ]);

  const handleToggleSiteManagerAction = (id: string) => {
    setSiteManagerActions((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const next = act.status === 'PENDING' ? 'IN_PROGRESS' : act.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
          setSiteManagerToast(`Corrective Action ${act.id} marked as ${next.replace('_', ' ')}!`);
          setTimeout(() => setSiteManagerToast(null), 3200);
          return { ...act, status: next };
        }
        return act;
      })
    );
  };

  interface MineBenchStatusItem {
    id: string;
    benchName: string;
    zone: string;
    phase: 'EXTRACTION ACTIVE' | 'CHARGING & PRIMING' | 'DEWATERING IN PROGRESS' | 'HAULAGE ACTIVE' | 'SIZING & CRUSHING' | 'WASTE DISPOSAL';
    statusColor: string;
    shiftActualTons: number;
    shiftTargetTons: number;
    assignedMachinery: string;
    dgmsSlopeIndex: number;
    geotechRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    operatorInCharge: string;
    notes: string;
  }

  const CURRENT_MINE_INTERNAL_BENCHES: Record<string, MineBenchStatusItem[]> = {
    'dongri-buzurg': [
      {
        id: 'db-b3',
        benchName: 'Pit Bench 3 (High-Grade Reef)',
        zone: 'Zone 14 South Reef',
        phase: 'EXTRACTION ACTIVE',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        shiftActualTons: 1800,
        shiftTargetTons: 2200,
        assignedMachinery: 'Excavator EX-04 • Dumper Fleet A (4x CAT 773E)',
        dgmsSlopeIndex: 96.5,
        geotechRisk: 'HIGH',
        operatorInCharge: 'Er. S. K. Meshram',
        notes: 'EX-04 hydraulic seal leak reduced output pace by 1.8h; reef grade at 44.2% Mn.',
      },
      {
        id: 'db-z14',
        benchName: 'Zone 14 South Blast Pattern',
        zone: 'South Boundary Highwall',
        phase: 'CHARGING & PRIMING',
        statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        shiftActualTons: 1100,
        shiftTargetTons: 1400,
        assignedMachinery: 'Atlas Copco Drill Rig D01 • ANFO Charging Van',
        dgmsSlopeIndex: 94.2,
        geotechRisk: 'MEDIUM',
        operatorInCharge: 'Er. R. K. Sharma',
        notes: 'Shot #DB-Z14-P3-SHOT88 charged (48 holes); DGMS bench vibration clearance audit logged.',
      },
      {
        id: 'db-b2',
        benchName: 'Pit Bench 2 (Secondary Loading Face)',
        zone: 'North Highwall Face',
        phase: 'HAULAGE ACTIVE',
        statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        shiftActualTons: 1200,
        shiftTargetTons: 1400,
        assignedMachinery: 'Excavator EX-02 • Dumper Fleet B (3x BEML 35T)',
        dgmsSlopeIndex: 98.0,
        geotechRisk: 'LOW',
        operatorInCharge: 'Er. N. C. Baghel',
        notes: 'Secondary loading operating steadily on 8.5% ramp gradient without congestion.',
      },
      {
        id: 'db-sump',
        benchName: 'Lower Pit Sump (Bench 4 Dewatering)',
        zone: 'Central Deep Sump',
        phase: 'DEWATERING IN PROGRESS',
        statusColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        shiftActualTons: 0,
        shiftTargetTons: 0,
        assignedMachinery: '2x 600 m³/hr Kirloskar Submersible Pumps',
        dgmsSlopeIndex: 91.0,
        geotechRisk: 'HIGH',
        operatorInCharge: 'Er. S. Rao',
        notes: 'Monsoon inflow rate at 1,450 m³/hr; CGWB discharge quota strictly monitored.',
      },
      {
        id: 'db-crusher',
        benchName: 'Primary Crusher Hopper Siding',
        zone: 'Surface ROM Pad',
        phase: 'SIZING & CRUSHING',
        statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        shiftActualTons: 580,
        shiftTargetTons: 600,
        assignedMachinery: 'Grizzly Sizing Screen 01 • Mist Cannon M02',
        dgmsSlopeIndex: 99.0,
        geotechRisk: 'LOW',
        operatorInCharge: 'Er. P. V. Nair',
        notes: 'Dust suppression mist operating at 4.1 bar; SPCB ambient PM10 at 82 µg/m³.',
      },
      {
        id: 'db-dump',
        benchName: 'Waste Rock Dump Terrace 3',
        zone: 'North Waste Overburden Area',
        phase: 'WASTE DISPOSAL',
        statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        shiftActualTons: 3400,
        shiftTargetTons: 3500,
        assignedMachinery: 'CAT D8R Bulldozer • Wheel Loader WL-03',
        dgmsSlopeIndex: 99.2,
        geotechRisk: 'LOW',
        operatorInCharge: 'Er. T. S. Yadav',
        notes: 'Terrace slope berm angle maintained at 26.5° (IBM MCDR standard limit: 28°).',
      },
    ],
    balaghat: [
      {
        id: 'bg-bharveli',
        benchName: 'Bharveli Stope L7 (Open Stope Face)',
        zone: 'Bharveli Deep Ore Body',
        phase: 'EXTRACTION ACTIVE',
        statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        shiftActualTons: 1600,
        shiftTargetTons: 1500,
        assignedMachinery: 'Sandvik LH410 LHD • Tamrock Jumbo Drill',
        dgmsSlopeIndex: 98.0,
        geotechRisk: 'LOW',
        operatorInCharge: 'Er. S. N. Mukherjee',
        notes: 'High-grade 46.8% Mn ore extraction pacing at 107% of shift target.',
      },
      {
        id: 'bg-holmes',
        benchName: 'Holmes Shaft Friction Winder',
        zone: 'Central Production Shaft',
        phase: 'HAULAGE ACTIVE',
        statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        shiftActualTons: 1400,
        shiftTargetTons: 1400,
        assignedMachinery: 'Multi-Rope Friction Winder (ABB Drive)',
        dgmsSlopeIndex: 97.5,
        geotechRisk: 'LOW',
        operatorInCharge: 'Er. A. K. Biswas',
        notes: 'Hoisting payload index nominal; NDT laser scan scheduled for shift change.',
      },
      {
        id: 'bg-l12',
        benchName: 'Deep Level -12 Stope Face',
        zone: 'Sub-Level Stope Block',
        phase: 'EXTRACTION ACTIVE',
        statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        shiftActualTons: 600,
        shiftTargetTons: 600,
        assignedMachinery: 'Electro-Hydraulic Jumbo J02',
        dgmsSlopeIndex: 94.0,
        geotechRisk: 'MEDIUM',
        operatorInCharge: 'Er. R. D. Roy',
        notes: 'Airflow velocity maintained at 0.42 m/s; DGMS MMR ventilation par verified.',
      },
    ],
  };

  const SITE_SPECIFIC_RISK_EVENTS: Record<string, {
    id: string;
    code: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    statutoryAuthority: string;
    benchZone: string;
    description: string;
    quantitativeImpact: string;
    mitigationStrategy: string;
    linkedActionId: string;
    updatedAt: string;
  }[]> = {
    'dongri-buzurg': [
      {
        id: 'rsk-1',
        code: 'RSK-DGMS-04',
        title: 'DGMS Statutory Bench Vibration Clearance Stoppage',
        severity: 'CRITICAL',
        category: 'STATUTORY / DGMS',
        statutoryAuthority: 'DGMS Safety Tech Circular No. 04/2026 (Sec. 22A)',
        benchZone: 'Pit Bench 3 (Zone 14 South Reef)',
        description: 'Detonation delay of +2.25h caused by statutory bench vibration audit and flyrock perimeter clearance. Restricts active muckpile turnover by 350 t.',
        quantitativeImpact: '-350 t/day output risk | Statutory stop-work risk if PPV > 5.0 mm/s',
        mitigationStrategy: 'Advance DGMS notice by 2.0h; implement air-decking nonel relays to restrict vibration to < 4.5 mm/s.',
        linkedActionId: 'SMACT-01',
        updatedAt: '15:45 Today',
      },
      {
        id: 'rsk-2',
        code: 'RSK-MECH-01',
        title: 'Excavator EX-04 Hydraulic System Seal Degradation',
        severity: 'HIGH',
        category: 'MECHANICAL FLEET',
        statutoryAuthority: 'OEM Fleet Mechanical Standard & IBM MCDR Mining Regs',
        benchZone: 'Pit Bench 3 - Loading Face',
        description: 'Hydraulic cylinder seal rupture caused 1.8h active loading downtime, idling 4 dumpers in haul circuit.',
        quantitativeImpact: '-420 t/shift loading deficit | Fleet turnaround slowed to 14 trips/h',
        mitigationStrategy: 'Deploy rapid mobile mechanical crew for high-pressure seal replacement on EX-04.',
        linkedActionId: 'SMACT-02',
        updatedAt: '10:15 Today',
      },
      {
        id: 'rsk-3',
        code: 'RSK-HYDRO-08',
        title: 'Monsoon Sump Inflow & CGWB Dewatering Ceiling',
        severity: 'HIGH',
        category: 'HYDROLOGICAL',
        statutoryAuthority: 'Central Ground Water Board (CGWB) & SPCB Water Quota',
        benchZone: 'Lower Sump Pit Bench 4',
        description: 'Sump accumulation rate (1,450 m³/hr) approaching statutory discharge cap (1,500 m³/hr); waterlogged 8 blast holes.',
        quantitativeImpact: '-200 t blasting readiness | Potential ramp gradient siltation',
        mitigationStrategy: 'Engage 2x 600 m³/hr auxiliary submersible pumps and mobile drill hole blowers.',
        linkedActionId: 'SMACT-03',
        updatedAt: '11:30 Today',
      },
      {
        id: 'rsk-4',
        code: 'RSK-HAUL-03',
        title: 'Haul Road Ramp Gradient Siltation & Siding Bottleneck',
        severity: 'MEDIUM',
        category: 'MINE LOGISTICS',
        statutoryAuthority: 'Mines Rules 1955 (Ramp Gradient & Traffic Safety)',
        benchZone: 'Ramp Road 2 (450m incline)',
        description: 'Surface siltation on 8.5% incline increased dumper cycle turnaround time by +3.4 minutes per trip.',
        quantitativeImpact: '-120 t/shift haulage rate deficit',
        mitigationStrategy: 'Deploy road grader MG-02 with gravel dressing; balance dumper siding dispatch.',
        linkedActionId: 'SMACT-04',
        updatedAt: '08:45 Today',
      },
      {
        id: 'rsk-5',
        code: 'RSK-ENV-05',
        title: 'Highwall Crest Dust Suppression Nozzle Pressure Drop',
        severity: 'LOW',
        category: 'ENVIRONMENTAL',
        statutoryAuthority: 'State Pollution Control Board (MPCB PM10 Standard)',
        benchZone: 'Crusher Hopper & Highwall Crest',
        description: 'Dust suppression mist cannon water line pressure dropped from 6.0 bar to 4.1 bar.',
        quantitativeImpact: 'Minor PM10 elevation (<85 µg/m³; statutory limit 100 µg/m³)',
        mitigationStrategy: 'Flush nozzle manifold strainer and adjust booster pump line valve.',
        linkedActionId: 'SMACT-04',
        updatedAt: '07:30 Today',
      },
    ],
    balaghat: [
      {
        id: 'rsk-bg-1',
        code: 'RSK-VENT-02',
        title: 'Bharveli Main Shaft Auxiliary Fan Static Pressure Fluctuation',
        severity: 'HIGH',
        category: 'STATUTORY / DGMS',
        statutoryAuthority: 'DGMS Metalliferous Mines Regulations (MMR) 1961 Reg. 131',
        benchZone: 'Bharveli Deep Level -12 Stope',
        description: 'Airflow velocity in Deep Level -12 dropped to 0.42 m/s (statutory threshold: 0.35 m/s) due to ducting leakage.',
        quantitativeImpact: '-180 t/shift production pace | Requires secondary booster fan activation',
        mitigationStrategy: 'Seal flexible ventilation duct joint at Cross-Cut 4 and ramp up auxiliary booster fan.',
        linkedActionId: 'SMACT-01',
        updatedAt: '12:15 Today',
      },
      {
        id: 'rsk-bg-2',
        code: 'RSK-HOIST-01',
        title: 'Holmes Shaft Winder Rope NDT Inspection Due',
        severity: 'MEDIUM',
        category: 'MECHANICAL FLEET',
        statutoryAuthority: 'DGMS Statutory Winder Inspection Circular',
        benchZone: 'Holmes Shaft Headframe',
        description: 'Quarterly electromagnetic NDT testing of multi-rope friction hoist scheduled for maintenance window.',
        quantitativeImpact: 'Planned 2.0h hoisting slowdown during shift handover',
        mitigationStrategy: 'Perform automated laser rope scan during 14:00 shift change.',
        linkedActionId: 'SMACT-02',
        updatedAt: '09:00 Today',
      },
      {
        id: 'rsk-bg-3',
        code: 'RSK-STOPE-03',
        title: 'Stope Fill Curing Lag at Level 7 South',
        severity: 'LOW',
        category: 'GEOTECHNICAL',
        statutoryAuthority: 'IBM Mine Plan Approved Stope Cycle',
        benchZone: 'Level 7 South Cut-and-Fill Stope',
        description: 'Cemented tailings paste backfill cure reached 78% compressive strength at Day 4 (target: 80%).',
        quantitativeImpact: 'Delayed next lift drilling by 4 hours',
        mitigationStrategy: 'Monitor digital load cells in fill bulkhead before firing blast holes.',
        linkedActionId: 'SMACT-03',
        updatedAt: '06:45 Today',
      },
    ],
  };

  // Reusable Theme Helper Classes
  const cardBg = isDark ? 'bg-[#20242D] border-white/10' : 'bg-gradient-to-br from-white via-slate-50/40 to-white border-slate-200/90 shadow-md hover:shadow-lg transition-all';
  const nestedBg = isDark ? 'bg-[#14171C] border-white/10' : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-700 font-medium';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200/80';

  return (
    <div
      className={`min-h-screen font-body select-none transition-colors duration-300 ${
        isDark
          ? 'bg-[#12151B] text-slate-100 selection:bg-[#D97706] selection:text-[#12151B]'
          : 'bg-[#F4F6F9] text-slate-900 selection:bg-[#1F3864] selection:text-white'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (THIN HORIZONTAL HEADER) */}
      {/* ========================================================================= */}
      <header
        className={`h-14 w-full px-4 md:px-6 border-b flex items-center justify-between z-40 fixed top-0 left-0 right-0 backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#181B20]/95 border-white/10 text-white'
            : 'bg-[#1F3864] border-[#15294A] text-white shadow-md'
        }`}
      >
        {/* Left Branding & Back to Mine Selection Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('mine-selection')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer shrink-0"
            title="Return to Mine Selection Screen"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="hidden sm:inline">Mines</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white text-[6px] font-black leading-none shrink-0 border border-white/30 shadow-md">
            <span>मॉयल</span>
            <span>MOIL</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm md:text-base text-white tracking-wider uppercase leading-none">
                MOIL RESERVE PLATFORM
              </span>
            </div>
            <span className="text-[10px] text-[#FEA619] font-bold tracking-normal block mt-0.5">
              Manganese Reserve Intelligence Platform
            </span>
          </div>
        </div>

        {/* Center Mine Selector */}
        <div className="relative">
          <button
            onClick={() => setIsMineDropdownOpen(!isMineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-headline font-extrabold uppercase tracking-wide">
              {mineProfile.mineName} ▾
            </span>
          </button>

          {/* Mine Selector Dropdown Menu */}
          {isMineDropdownOpen && (
            <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 p-2 space-y-1 border ${
              isDark ? 'bg-[#20242D] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="px-3 py-1 text-[10px] font-black uppercase text-[#D97706] tracking-wider border-b border-slate-200/20">
                Select Active MOIL Mining Lease
              </div>
              {Object.values(MINE_PRODUCTION_PROFILES).map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMineId(m.id);
                    setIsMineDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    selectedMineId === m.id
                      ? 'bg-[#D97706]/20 border border-[#D97706] text-[#D97706]'
                      : isDark
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="block">{m.mineName}</span>
                    <span className={`text-[10px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {m.district}, {m.state} • {m.type}
                    </span>
                  </div>
                  {selectedMineId === m.id && (
                    <span className="text-[9px] text-[#D97706] font-black px-1.5 py-0.5 rounded bg-[#D97706]/20">
                      ACTIVE
                    </span>
                  )}
                </button>
              ))}
              <div className="pt-1 border-t border-slate-200/20">
                <button
                  onClick={() => onNavigate('mine-selection')}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#D97706] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  <span>← Back to Mine Selection Map</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Header Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('alerts')}
            className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-lg text-[#FEA619]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B03A2E] animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B03A2E]" />
          </button>

          {onToggleTheme && (
            <ThemeToggleSwitch
              isDark={isDark}
              onToggle={onToggleTheme}
            />
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. LEFT VERTICAL SIDEBAR & MAIN BODY CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex pt-14 min-h-[calc(100vh-3.5rem)]">

        {/* NARROW DARK SIDEBAR */}
        <aside
          className={`transition-all duration-300 border-r flex flex-col justify-between shrink-0 z-30 ${
            sidebarCollapsed ? 'w-16' : 'w-56'
          } ${
            isDark ? 'bg-[#14171C] border-white/10' : 'bg-[#1E293B] text-white border-slate-700'
          }`}
        >
          {/* Top Sidebar Nav Links */}
          <div className="p-2 space-y-3 overflow-y-auto">
            {/* 1. MINE OPERATIONS SECTION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  MINE OPERATIONS
                </div>
              )}
              {[
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'site-intelligence', label: 'Site Intelligence & Pulse', icon: 'shield_person' },
                { id: 'prospectivity', label: 'Prospectivity', icon: 'landscape' },
                { id: 'production-forecast', label: 'Production & Forecast', icon: 'trending_up' },
                { id: 'shortfall-diagnosis', label: 'Shortfall Diagnosis', icon: 'analytics' },
                { id: 'corrective-actions', label: 'Corrective Actions', icon: 'checklist' },
                { id: 'alerts', label: 'Alerts', icon: 'notifications' },
              ]
              .filter((item) =>
                userRole === 'admin' || SITE_MANAGER_TABS.includes(item.id as OverviewTab)
              )
              .map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as OverviewTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0E7C7B] text-white font-bold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="material-symbols-outlined text-base shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Portfolio section “ admin only */}
            {userRole === 'admin' && (
              <>
                <div className="border-t border-white/10 my-1" />
                <div className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      PORTFOLIO
                    </div>
                  )}
                  {[{ id: 'portfolio-view', label: 'Portfolio View', icon: 'grid_view' }].map((item) => {
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as OverviewTab)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected ? 'bg-[#0E7C7B] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Customer View section “ admin only */}
            {userRole === 'admin' && (
              <>
                <div className="border-t border-white/10 my-1" />
                <div className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      CUSTOMER
                    </div>
                  )}
                  {[{ id: 'customer-view', label: 'Customer View', icon: 'factory' }].map((item) => {
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as OverviewTab)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected ? 'bg-[#0E7C7B] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Role badge at bottom of top section */}
            {!sidebarCollapsed && (
              <div className="mt-3 mx-2">
                <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-bold ${
                  userRole === 'admin'
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    : 'bg-teal-500/10 border-teal-500/25 text-teal-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {userRole === 'admin' ? 'shield' : 'badge'}
                  </span>
                  {userRole === 'admin' ? 'Admin Access' : 'Site Manager'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sidebar Nav Items */}
          <div className="p-2 border-t border-white/10 space-y-1">
            {/* Back to Mine Selection Sidebar Button */}
            <button
              onClick={() => onNavigate('mine-selection')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-[#D97706] hover:bg-white/10 transition-all cursor-pointer"
              title={sidebarCollapsed ? 'Back to Mine Selection' : undefined}
            >
              <span className="material-symbols-outlined text-base shrink-0">map</span>
              {!sidebarCollapsed && <span>← Mine Selection</span>}
            </button>

            <button
              onClick={() => alert('Platform Configurations')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              title={sidebarCollapsed ? 'Settings' : undefined}
            >
              <span className="material-symbols-outlined text-base shrink-0">tune</span>
              {!sidebarCollapsed && <span>Settings</span>}
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <span className="material-symbols-outlined text-base shrink-0">
                {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT SHELL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8 max-w-[1440px] mx-auto">

          {/* MINE HERO BANNER WITH REACT BITS BEAMS EFFECT (Only shown on Mine Operations tabs) */}
          {activeTab !== 'customer-view' && activeTab !== 'portfolio-view' && (
            <div
              className="p-8 sm:p-12 lg:p-14 rounded-3xl border border-white/20 relative overflow-hidden shadow-2xl min-h-[360px] md:min-h-[400px] flex flex-col justify-center transition-all duration-300"
            >
              {/* React Bits Interactive WebGL Beams Background */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Beams
                  beamWidth={3.5}
                  beamHeight={25}
                  beamNumber={8}
                  lightColor="#FFC107"
                  beamColor="#185a9d"
                  backgroundColor="#020914"
                  speed={1.5}
                  noiseIntensity={1.2}
                  scale={0.22}
                  rotation={20}
                />
              </div>

              {/* Light Overlay Tint for Maximum Background Beam Visibility & High Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#020b18]/75 via-[#020b18]/45 to-[#020b18]/65 backdrop-blur-[0.5px] z-5 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12">
                {/* Left Mine Details & Navigation */}
                <div className="space-y-5 max-w-3xl">
                  {/* Top Badges & Back Button */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-[11px] font-black uppercase tracking-widest backdrop-blur-md shadow-md">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>● OPERATIONAL</span>
                    </div>

                    {/* Prominent Back to Mine Selection Button inside Hero Banner */}
                    <button
                      onClick={() => onNavigate('mine-selection')}
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/30 border border-white/40 text-white text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md shadow-md active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      <span>Back to Mine Selection</span>
                    </button>
                  </div>

                  {/* Main Heading Title */}
                  <h1 className="font-headline font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight drop-shadow-2xl">
                    {mineProfile.mineName}
                  </h1>

                  {/* Location Badge */}
                  <p className="text-sm sm:text-base md:text-lg text-slate-100 font-bold flex items-center gap-2 pt-1 drop-shadow-md">
                    <span className="material-symbols-outlined text-[#FEA619] text-xl shrink-0">location_on</span>
                    <span>{mineProfile.district} District, {mineProfile.state}</span>
                  </p>
                </div>

                {/* Right High-Level Production Metric */}
                <div className="p-6 sm:p-7 rounded-2xl bg-[#001433]/85 border border-white/25 shrink-0 backdrop-blur-md shadow-2xl min-w-[240px] sm:min-w-[270px]">
                  <span className="text-[11px] font-black font-mono text-slate-300 uppercase tracking-widest block text-right">
                    CURRENT ANNUAL OUTPUT
                  </span>
                  <span className="font-headline font-black text-4xl sm:text-5xl text-white block mt-1.5 drop-shadow-md text-right">
                    550,000
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#FEA619] block uppercase tracking-wider mt-0.5 text-right">
                    Tonnes
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* UPPER TWO-COLUMN SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* MINE OVERVIEW / SITE VISUAL CARD (7 COLS) */}
                <div className={`lg:col-span-7 p-6 rounded-xl border space-y-4 flex flex-col justify-between ${cardBg}`}>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                      <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                        <span className="material-symbols-outlined text-[#0E7C7B] text-base">domain</span>
                        {mineProfile.mineName.toUpperCase()} OVERVIEW
                      </h2>
                      <span className={`text-[10px] font-mono uppercase font-bold ${textMuted}`}>
                        LEASE ID: MOIL-{mineProfile.shortCode}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        DESCRIPTION & GEOLOGICAL STRATA
                      </span>
                      <p className={`text-sm leading-relaxed font-medium ${textSecondary}`}>
                        "{mineProfile.mineName} is an active {mineProfile.type.toLowerCase()} manganese ore lease in {mineProfile.district} district, {mineProfile.state}, producing metallurgical and high-grade battery oxide ores." 
                      </p>
                    </div>
                  </div>

                  {/* MINE INTELLIGENCE VIEW (TERRAIN, SATELLITE, INTELLIGENCE) */}
                  <MineSiteVisualizer mineId={selectedMineId} themeMode={themeMode} />
                </div>

                {/* CURRENT STATUS CARD (5 COLS) - RICHER DARKER BLUE THEME WITH INTEGRATED ARTWORK */}
                <div className={`lg:col-span-5 rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xl group min-h-[420px] ${
                  isDark
                    ? 'bg-gradient-to-br from-[#081524] via-[#0E2036] to-[#142C4B] border-blue-900/50 text-white'
                    : 'bg-gradient-to-br from-[#0C3466] via-[#14498C] to-[#1C5EB3] border-[#1C5EB3]/50 text-white'
                }`}>
                  {/* Background Artwork Layer (Blended Integration) */}
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none ${
                      isDark ? 'opacity-40 mix-blend-screen' : 'opacity-55 mix-blend-multiply'
                    }`}
                    style={{
                      backgroundImage: `url('/assets/status_editorial_collage.jpg')`,
                    }}
                  />

                  {/* Soft Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001026]/75 via-transparent to-transparent pointer-events-none" />

                  {/* Top Header Content */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-3xl font-extralight tracking-tighter text-sky-300 drop-shadow-sm">
                        01
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs border bg-amber-400/20 border-amber-400/40 text-amber-300 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>ACTIVE MONITORING</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="font-headline font-black text-xl sm:text-2xl uppercase tracking-tight leading-tight text-white drop-shadow-sm">
                        CURRENT STATUS: <br className="hidden sm:inline" />
                        <span className="text-[#FEA619]">MEDIUM RISK</span>
                      </h2>
                      <p className="text-[11px] font-medium mt-1 uppercase tracking-wider text-blue-100/90">
                        Active operational telemetry &amp; extraction shortfall tracking
                      </p>
                    </div>
                  </div>

                  {/* Bottom Docked Recommendation Module (Transparent Editorial Section) */}
                  <div className="mt-6 pt-4 border-t border-white/20 space-y-3.5 relative z-10">
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] block mb-0.5 text-sky-300">
                        HOW TO PROCEED
                      </span>
                      <h3 className="font-serif italic text-lg tracking-wide font-normal text-white">
                        RECOMMENDATION
                      </h3>
                    </div>

                    <p className="text-xs leading-relaxed font-medium text-blue-100">
                      "Production is currently being monitored against monthly target. Initiate bench throughput optimization." 
                    </p>

                    {/* Telemetry Checklist */}
                    <div className="grid grid-cols-1 gap-1.5 pt-2.5 border-t border-white/15 text-[11px] font-semibold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0" />
                        <span>Fleet &amp; Equipment Operational</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0" />
                        <span>Production Monitoring Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 shadow-xs shadow-sky-400/80 shrink-0" />
                        <span>Forecast &amp; Grade Telemetry Sync</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => setActiveTab('shortfall-diagnosis')}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FDE047] via-[#FACC15] to-[#EAB308] hover:from-[#FEF08A] hover:to-[#FACC15] text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-md shadow-yellow-500/20 border border-yellow-200/40 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer mt-1"
                    >
                      <span>View Shortfall Diagnosis</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* KEY PERFORMANCE INDICATORS (BLUE HERO STRIP + CLEAN SUBTLE CARDS)        */}
              {/* ========================================================================= */}
              <div className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden shadow-xl transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-[#141820] via-[#181D27] to-[#141820] border-white/10'
                  : 'bg-gradient-to-r from-[#002452] via-[#0E3870] to-[#194E96] border-[#002452]/30 text-white'
              }`}>
                {/* Subtle Geometric Background Motif */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="kpiBlueGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#kpiBlueGrid)" />
                  </svg>
                </div>

                {/* Section Header Inside Blue Banner */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b pb-4 border-white/15">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FEA619] shadow-sm shadow-amber-500/50" />
                      <h2 className="font-headline font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FEA619] text-base">bar_chart</span>
                        KEY PERFORMANCE INDICATORS
                      </h2>
                    </div>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-blue-100/85'}`}>
                      Live monthly production output, target allocations, and risk diagnostics
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 self-start sm:self-auto border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-slate-300'
                      : 'bg-white/15 border-white/25 text-white backdrop-blur-xs'
                  }`}>
                    CYCLE: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                  </span>
                </div>

                {/* 4 Clean Subtle Tinted Cards */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* CARD 1: CURRENT PRODUCTION (SUBTLE SAGE/MINT TINT) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'bg-[#062419]/60 border-emerald-500/30 shadow-lg hover:border-emerald-400/50 text-emerald-50'
                      : 'bg-[#EEF9F2] border-[#C2E8D2] shadow-md shadow-blue-950/10 hover:shadow-lg hover:border-emerald-300 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                        isDark ? 'text-emerald-300' : 'text-[#0E6245]'
                      }`}>
                        CURRENT PRODUCTION
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                        isDark ? 'bg-white/10 text-emerald-300' : 'bg-white text-blue-600 border border-blue-100'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">trending_up</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-baseline">
                        <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          4,100
                        </span>
                        <span className={`text-xs font-bold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>t</span>
                      </div>

                      {/* Mini Sparkline Indicator */}
                      <svg width="68" height="26" viewBox="0 0 68 26" fill="none" className="shrink-0 overflow-visible">
                        <path
                          d="M 2 18 C 16 18, 22 14, 34 15 C 46 16, 52 7, 64 4"
                          stroke={isDark ? '#34D399' : '#059669'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="64" cy="4" r="3" fill={isDark ? '#34D399' : '#059669'} />
                      </svg>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-[#065F46]'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>82% of target</span>
                        </span>
                        <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>4,100 / 5,000 t</span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-950/60' : 'bg-emerald-200/60'}`}>
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: TARGET ALLOCATION (SUBTLE ICE BLUE TINT) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'bg-[#0B213D]/60 border-blue-500/30 shadow-lg hover:border-blue-400/50 text-blue-50'
                      : 'bg-[#EEF5FC] border-[#C3DCF9] shadow-md shadow-blue-950/10 hover:shadow-lg hover:border-blue-300 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                        isDark ? 'text-blue-300' : 'text-[#1E40AF]'
                      }`}>
                        TARGET ALLOCATION
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                        isDark ? 'bg-white/10 text-blue-300' : 'bg-white text-blue-600 border border-blue-100'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">flag</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline">
                        <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-blue-300' : 'text-slate-900'}`}>
                          5,000
                        </span>
                        <span className={`text-xs font-bold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>t</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shrink-0 ${
                        isDark ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' : 'bg-white/90 text-blue-800 border-blue-200'
                      }`}>
                        FIXED QUOTA
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Current month allocation
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono font-extrabold border ${
                        isDark ? 'bg-blue-900/40 text-blue-200 border-blue-700/40' : 'bg-white/90 text-slate-800 border-blue-100'
                      }`}>
                        161.2 t/day
                      </span>
                    </div>
                  </div>

                  {/* CARD 3: PROSPECTIVITY (SUBTLE WARM AMBER TINT) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'bg-[#291B07]/60 border-amber-500/30 shadow-lg hover:border-amber-400/50 text-amber-50'
                      : 'bg-[#FEF8EC] border-[#FCE4B6] shadow-md shadow-blue-950/10 hover:shadow-lg hover:border-amber-300 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                        isDark ? 'text-amber-300' : 'text-[#92400E]'
                      }`}>
                        PROSPECTIVITY
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                        isDark ? 'bg-white/10 text-amber-300' : 'bg-white text-blue-600 border border-blue-100'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">layers</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-amber-300' : 'text-slate-900'}`}>
                        82%
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                        isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-[#DCFCE7] text-[#15803D] border-emerald-300'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>HIGH CONFIDENCE</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Highest potential:
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        isDark ? 'bg-amber-900/40 text-amber-200 border-amber-700/40' : 'bg-white/90 text-amber-950 border-amber-200'
                      }`}>
                        Zone 14
                      </span>
                    </div>
                  </div>

                  {/* CARD 4: ACTIVE ALERTS (SUBTLE BLUSH ROSE TINT) */}
                  <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? 'bg-[#2B0E14]/60 border-rose-500/30 shadow-lg hover:border-rose-400/50 text-rose-50'
                      : 'bg-[#FDF1F0] border-[#FBCFD0] shadow-md shadow-blue-950/10 hover:shadow-lg hover:border-rose-300 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${
                        isDark ? 'text-rose-300' : 'text-[#9F1239]'
                      }`}>
                        ACTIVE ALERTS
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-xs ${
                        isDark ? 'bg-white/10 text-rose-300' : 'bg-white text-blue-600 border border-blue-100'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">notifications</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-rose-300' : 'text-slate-900'}`}>
                        2
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shrink-0 ${
                        isDark ? 'bg-rose-500/20 text-rose-300 border-rose-400/40' : 'bg-white/90 text-[#BE123C] border-rose-200'
                      }`}>
                        ACTION REQUIRED
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold border ${
                        isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-white/90 text-rose-800 border-rose-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>1 High Risk</span>
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-extrabold border ${
                        isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/90 text-amber-800 border-amber-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>1 Med Risk</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MANGANESE CORE OPERATIONS & TELEMETRY HUB (UNIFIED CONTAINER) */}
              <div className={`p-5 sm:p-6 lg:p-7 rounded-3xl border space-y-6 transition-all relative ${
                isDark
                  ? 'bg-gradient-to-b from-[#12161E] via-[#0E1217] to-[#0A0D12] border-slate-700/80 shadow-2xl'
                  : 'bg-gradient-to-b from-[#D4DEEB] via-[#C6D2E2] to-[#B8C6D7] border-slate-400/90 shadow-lg'
              }`}>
                {/* Subtle Manganese Ore Shimmer / Metallic Grain Glow */}
                <div className="absolute inset-0 pointer-events-none rounded-3xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400/15 via-transparent to-transparent" />

                {/* ROW 1: OPERATIONAL HEALTH & PROSPECTIVITY SNAPSHOT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
                  <div className={`lg:col-span-7 p-6 rounded-2xl border-2 space-y-4 ${
                    isDark
                      ? 'bg-[#20170B] border-amber-500/30 shadow-xl text-white'
                      : 'bg-[#FEF8EC] border-[#FCE4B6] shadow-sm text-[#1B1B1C]'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-3.5 ${
                      isDark ? 'border-white/10' : 'border-amber-200/70'
                    }`}>
                      <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                        <span className="material-symbols-outlined text-[#0E7C7B] text-base">health_metrics</span>
                        OPERATIONAL HEALTH
                      </h2>
                      <span className={`text-[10px] font-mono uppercase ${textMuted}`}>
                        HIGH-LEVEL SNAPSHOT
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl border-2 space-y-1 transition-all ${
                        isDark
                          ? 'bg-[#072422]/60 border-teal-500/60 shadow-lg shadow-black/20'
                          : 'bg-[#EEF9F7] border-[#0E7C7B] shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-teal-300' : 'text-teal-800'}`}>
                          EQUIPMENT AVAILABILITY
                        </span>
                        <span className={`font-headline font-black text-2xl block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          80%
                        </span>
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-teal-400' : 'text-[#0E7C7B]'}`}>Fleet operational</span>
                      </div>

                      <div className={`p-4 rounded-xl border-2 space-y-1 transition-all ${
                        isDark
                          ? 'bg-[#291B07]/60 border-amber-500/60 shadow-lg shadow-black/20'
                          : 'bg-[#FEF8EC] border-[#D97706] shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                          BLASTING STATUS
                        </span>
                        <span className={`font-headline font-black text-2xl block ${isDark ? 'text-amber-400' : 'text-[#D97706]'}`}>
                          2 days delay
                        </span>
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>Bench clearance</span>
                      </div>

                      <div className={`p-4 rounded-xl border-2 space-y-1 transition-all ${
                        isDark
                          ? 'bg-[#062419]/60 border-emerald-500/60 shadow-lg shadow-black/20'
                          : 'bg-[#EEF9F2] border-[#059669] shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                          PRODUCTION EFFICIENCY
                        </span>
                        <span className={`font-headline font-black text-2xl block ${isDark ? 'text-emerald-400' : 'text-[#059669]'}`}>
                          82%
                        </span>
                        <span className={`text-[10px] font-bold block ${isDark ? 'text-emerald-400' : 'text-[#059669]'}`}>Throughput rate</span>
                      </div>
                    </div>
                  </div>

                  <div className={`lg:col-span-5 p-6 rounded-2xl border-2 flex flex-col justify-between space-y-4 ${
                    isDark
                      ? 'bg-[#101C2E] border-blue-500/30 shadow-xl text-white'
                      : 'bg-[#EFF6FF] border-[#002452]/20 shadow-sm text-[#1B1B1C]'
                  }`}>
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between border-b pb-3.5 ${
                        isDark ? 'border-white/10' : 'border-[#002452]/15'
                      }`}>
                        <h2 className={`font-headline font-bold text-base uppercase tracking-wide flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-[#002452]'
                        }`}>
                          <span className={`material-symbols-outlined text-lg ${isDark ? 'text-blue-400' : 'text-[#002452]'}`}>layers</span>
                          PROSPECTIVITY SNAPSHOT
                        </h2>
                        <span className={`text-xs font-mono font-bold uppercase ${
                          isDark ? 'text-blue-400' : 'text-[#002452]/80'
                        }`}>
                          SPATIAL MODEL
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#0A2548] border-blue-400/20 text-white'
                            : 'bg-[#002452] border-[#002452] text-white shadow-xs'
                        }`}>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-200 block mb-1">
                            Overall Score
                          </span>
                          <span className="font-headline text-2xl font-black text-white block leading-none">
                            82%
                          </span>
                        </div>

                        <div className={`p-3.5 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#103565] border-blue-400/20 text-white'
                            : 'bg-[#0F3B7A] border-[#0F3B7A] text-white shadow-xs'
                        }`}>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-200 block mb-1">
                            Highest Potential
                          </span>
                          <span className="font-headline text-2xl font-black text-white block leading-none">
                            Zone 14
                          </span>
                        </div>

                        <div className={`p-3.5 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#154682] border-blue-400/20 text-white'
                            : 'bg-[#18539E] border-[#18539E] text-white shadow-xs'
                        }`}>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-200 block mb-1">
                            Accessible
                          </span>
                          <span className="font-headline text-2xl font-black text-white block leading-none">
                            61%
                          </span>
                        </div>

                        <div className={`p-3.5 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-[#0D4B73] border-blue-400/20 text-white'
                            : 'bg-[#0A6291] border-[#0A6291] text-white shadow-xs'
                        }`}>
                          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-200 block mb-1">
                            Recoverable
                          </span>
                          <span className="font-headline text-2xl font-black text-white block leading-none">
                            44%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('prospectivity')}
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isDark
                          ? 'bg-[#D97706] hover:bg-[#F59E0B] text-slate-950 shadow-amber-500/10'
                          : 'bg-[#D97706] hover:bg-[#B45309] text-white shadow-amber-500/20'
                      }`}
                    >
                      <span>Open Prospectivity Map</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>

                {/* ROW 2: ENVIRONMENTAL CONDITIONS & RECENT ACTIVITY */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
                  <div className={`lg:col-span-7 p-6 rounded-2xl border-2 relative overflow-hidden flex flex-col justify-between min-h-[340px] ${
                    isDark
                      ? 'border-white/10 shadow-xl text-white bg-[#181B20]'
                      : 'border-slate-200/90 shadow-sm text-[#1B1B1C] bg-white'
                  }`}>
                    {/* Topographic Landscape Background with smooth gradient wash */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                      <img
                        src="/assets/mine_environment_landscape.jpg"
                        alt="Topographic Mine Landscape"
                        className="w-full h-full object-cover object-bottom opacity-85 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className={`absolute inset-0 ${
                          isDark
                            ? 'bg-gradient-to-b from-[#181B20]/95 via-[#181B20]/80 to-[#181B20]/50'
                            : 'bg-gradient-to-b from-white/95 via-white/80 to-white/35'
                        }`}
                      />
                    </div>

                    {/* Foreground Content */}
                    <div className="relative z-10 space-y-4">
                      <div className={`flex items-center justify-between border-b pb-3.5 ${
                        isDark ? 'border-white/15' : 'border-slate-300/80'
                      }`}>
                        <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-[#002452]'
                        }`}>
                          <span className="material-symbols-outlined text-[#0E7C7B] text-base">thermostat</span>
                          ENVIRONMENTAL CONDITIONS
                        </h2>
                        <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{liveWeather?.lastUpdated || 'LIVE STREAM • OPENWEATHER API'}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        {/* RAINFALL */}
                        <div className={`p-4 rounded-xl border space-y-1.5 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-md ${
                          isDark
                            ? 'bg-[#0B213D]/70 border-blue-500/30 hover:border-blue-400/60 shadow-sm text-blue-100'
                            : 'bg-[#F4F9FD]/90 border-[#D0E2F5] hover:border-[#A8CCE8] shadow-xs text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isDark ? 'text-blue-300/80' : 'text-[#1B4D85]'
                            }`}>
                              RAINFALL (MM)
                            </span>
                            <span className="material-symbols-outlined text-sm text-blue-500">rainy</span>
                          </div>
                          <span className={`font-headline font-black text-2xl block leading-tight ${
                            isDark ? 'text-blue-300' : 'text-[#0B3B70]'
                          }`}>
                            {liveWeather ? `${liveWeather.rainfallMm} mm` : '4.2 mm'}
                          </span>
                          <span className={`text-[10px] block truncate ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {liveWeather?.isLive ? 'Live Station Rain' : 'IMD Precip Station'}
                          </span>
                        </div>

                        {/* HUMIDITY */}
                        <div className={`p-4 rounded-xl border space-y-1.5 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-md ${
                          isDark
                            ? 'bg-[#08292E]/70 border-cyan-500/30 hover:border-cyan-400/60 shadow-sm text-cyan-100'
                            : 'bg-[#F2FCFC]/90 border-[#C7EFF1] hover:border-[#9CE0E4] shadow-xs text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isDark ? 'text-cyan-300/80' : 'text-[#0E707D]'
                            }`}>
                              HUMIDITY
                            </span>
                            <span className="material-symbols-outlined text-sm text-cyan-500">humidity_percentage</span>
                          </div>
                          <span className={`font-headline font-black text-2xl block leading-tight ${
                            isDark ? 'text-cyan-300' : 'text-[#08636E]'
                          }`}>
                            {liveWeather ? `${liveWeather.humidity}%` : '68%'}
                          </span>
                          <span className={`text-[10px] block truncate ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            Ambient Air RH
                          </span>
                        </div>

                        {/* SOIL MOISTURE */}
                        <div className={`p-4 rounded-xl border space-y-1.5 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-md ${
                          isDark
                            ? 'bg-[#291B07]/70 border-amber-500/30 hover:border-amber-400/60 shadow-sm text-amber-100'
                            : 'bg-[#FEFBF4]/90 border-[#F8E8C8] hover:border-[#EDD49F] shadow-xs text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isDark ? 'text-amber-300/80' : 'text-[#995C14]'
                            }`}>
                              SOIL MOISTURE
                            </span>
                            <span className="material-symbols-outlined text-sm text-amber-500">terrain</span>
                          </div>
                          <span className={`font-headline font-black text-2xl block leading-tight ${
                            isDark ? 'text-amber-300' : 'text-[#8B500C]'
                          }`}>
                            38%
                          </span>
                          <span className={`text-[10px] block truncate ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            Pit Bench Sensor
                          </span>
                        </div>

                        {/* TEMPERATURE */}
                        <div className={`p-4 rounded-xl border space-y-1.5 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-md ${
                          isDark
                            ? 'bg-[#2B1309]/70 border-orange-500/30 hover:border-orange-400/60 shadow-sm text-orange-100'
                            : 'bg-[#FFF9F5]/90 border-[#FCE0D2] hover:border-[#FAC5AD] shadow-xs text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                              isDark ? 'text-orange-300/80' : 'text-[#A84318]'
                            }`}>
                              TEMPERATURE
                            </span>
                            <span className="material-symbols-outlined text-sm text-orange-500">thermostat</span>
                          </div>
                          <span className={`font-headline font-black text-2xl block leading-tight ${
                            isDark ? 'text-orange-300' : 'text-[#9C3810]'
                          }`}>
                            {liveWeather ? `${liveWeather.temp}°C` : '31.4°C'}
                          </span>
                          <span className={`text-[10px] block truncate ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {liveWeather ? `${liveWeather.weatherCondition} (${liveWeather.windSpeedKmh} km/h)` : 'Partly Cloudy (14.5 km/h)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Topographic Elevation & Sensor Status Strip */}
                    <div className={`relative z-10 mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono ${
                      isDark ? 'border-white/10 text-zinc-300' : 'border-slate-200/80 text-slate-700'
                    }`}>
                      <div className="flex items-center gap-2 bg-white/70 dark:bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-inherit">
                        <span className="font-bold">⛰️ PIT ELEVATION:</span>
                        <span>Sump 680mRL • Bench 720mRL • Crest 760mRL</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-inherit">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-semibold">Station Precip Sync Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col">
                    <RecentActivityCard
                      themeMode={themeMode}
                      mineName={mineProfile.mineName}
                      onNavigateStream={() => {
                        setActiveTab('alerts');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SITE PROFILE: {mineProfile.mineName} */}
              <div className="relative overflow-hidden p-6 rounded-2xl border mb-6 text-white border-[#1A5499]/40 shadow-lg group">
                {/* Background Mine Photo Layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    backgroundImage: `url('/assets/site_profile_mine_bg.jpg')`,
                  }}
                />

                {/* Subtle Blue Gradient Overlay (Dark to Light Blue) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00142E]/92 via-[#002452]/84 to-[#0B3A73]/78 backdrop-blur-[0.5px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001026]/80 via-transparent to-transparent pointer-events-none" />

                {/* Foreground Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 text-white drop-shadow-sm">
                      <span className="material-symbols-outlined text-[#38BDF8] text-lg">factory</span>
                      SITE PROFILE: {mineProfile.mineName.toUpperCase()}
                    </h3>
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-widest text-sky-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ACTIVE LEASE &amp; PLANT
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-700/65 backdrop-blur-md border border-slate-400/30 text-white shadow-sm hover:border-slate-300/50 hover:bg-slate-700/80 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block text-[#38BDF8]">Beneficiation Plant</span>
                      <p className="font-medium text-sm text-slate-100 leading-relaxed">
                        Integrated manganese ore beneficiation plant with 4 lakh tonnes/annum r.o.m. processing capacity.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-700/65 backdrop-blur-md border border-slate-400/30 text-white shadow-sm hover:border-slate-300/50 hover:bg-slate-700/80 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block text-[#38BDF8]">EMD Plant Capacity</span>
                      <p className="font-medium text-sm text-slate-100 leading-relaxed">
                        Hosts MOIL's Electrolytic Manganese Dioxide (EMD) plant with a capacity of 1,500 tonnes/year.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-700/65 backdrop-blur-md border border-slate-400/30 text-white shadow-sm hover:border-slate-300/50 hover:bg-slate-700/80 transition-all">
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block text-[#38BDF8]">EMD Production Trend</span>
                      <p className="font-medium text-sm text-slate-100 leading-relaxed">
                        992t (2018-19) → 1,100t (2022-23) → 1,413t (2023-24)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* STRATEGIC ALIGNMENT STRIP */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${nestedBg}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-[#D97706] text-white shrink-0">
                    NATIONAL PRIORITY ALIGNMENT
                  </span>
                  <p className={`text-xs font-semibold italic ${textSecondary}`}>
                    "Contributing to import-substitution for India's steel & battery industry" 
                  </p>
                </div>

                <span className={`text-[10px] font-mono uppercase shrink-0 ${textMuted}`}>
                  MOIL RESERVE PLATFORM v2.4
                </span>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SITE MANAGER INTELLIGENCE & OPERATIONAL COCKPIT */}
          {/* ========================================================================= */}
          {activeTab === 'site-intelligence' && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Toast Notification Banner */}
              {siteManagerToast && (
                <div className="p-3.5 rounded-2xl bg-[#002452] text-white border border-blue-400/50 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-amber-400 text-xl animate-bounce">check_circle</span>
                    <span className="text-xs sm:text-sm font-black">{siteManagerToast}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-900/60 px-2 py-0.5 rounded text-blue-200">
                    Live Telemetry Synced
                  </span>
                </div>
              )}

              {/* SECTION 1: SITE MANAGER EXECUTIVE IDENTITY & STATUTORY RECALIBRATION HEADER */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-5 relative overflow-hidden ${
                isDark ? 'bg-gradient-to-br from-[#0B1524] via-[#10223A] to-[#173256] border-blue-900/50 text-white' : 'bg-gradient-to-br from-[#002452] via-[#083E7D] to-[#0E5CA8] border-blue-800 text-white shadow-xl'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>SITE MANAGER OPERATIONS COCKPIT</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-200 text-[10px] font-mono font-black uppercase">
                        LEASE: MOIL-{mineProfile.shortCode}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                        DGMS & IBM RECALIBRATED
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-2xl">
                      Individual site synthesis recalibrated from active shift operational entries, blasting timeline logs, DGMS Safety circulars (Cir. 04/2026), and IBM MCDR mineral conservation mandates.
                    </p>
                  </div>

                  {/* Designated Current Mine Lease Badge */}
                  <div className="p-4 rounded-2xl bg-[#00173B]/85 border border-white/20 shrink-0 space-y-2.5 backdrop-blur-md min-w-[260px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300">
                        Assigned Lease Scope:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[9px] font-mono font-bold">
                        EXCLUSIVE ACCESS
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0F274E] border border-blue-400/30 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-black text-white block uppercase truncate">
                          {mineProfile.mineName}
                        </span>
                        <span className="text-[10px] text-slate-300 block">
                          {mineProfile.type} • {mineProfile.district || 'Bhandara'}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-black px-2 py-1 rounded bg-[#002452] text-amber-300 border border-amber-400/30 shrink-0">
                        {mineProfile.shortCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5 border-t border-white/10">
                      <span>Statutory First-Class Mgr:</span>
                      <span className="text-emerald-300 font-bold font-mono">Er. S. K. Meshram</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 5 TOP EXECUTIVE HEALTH & RISK METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Metric 1: Total Active Risk Events */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 ${
                  isDark ? 'bg-[#2B0E14]/70 border-rose-500/40 shadow-lg text-rose-50' : 'bg-[#FFF1F2] border-rose-300 shadow-md text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      NO. OF RISK EVENTS
                    </span>
                    <span className="material-symbols-outlined text-rose-500 text-lg">warning</span>
                  </div>
                  <div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-rose-600 dark:text-rose-400 block">
                      {(SITE_SPECIFIC_RISK_EVENTS[selectedMineId] || SITE_SPECIFIC_RISK_EVENTS['dongri-buzurg']).length}
                    </span>
                    <span className="text-[10px] font-bold block text-rose-700 dark:text-rose-300 mt-0.5">
                      1 Critical • 2 High • 1 Med • 1 Low
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 pt-1 border-t border-rose-200 dark:border-rose-900/50">
                    +1 new from recent shift
                  </span>
                </div>

                {/* Metric 2: Managed Site Status */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${textMuted}`}>
                      SITE STATUS
                    </span>
                    <span className="material-symbols-outlined text-teal-500 text-lg">domain</span>
                  </div>
                  <div>
                    <span className="font-headline font-black text-xl text-teal-600 dark:text-teal-400 block truncate">
                      OPERATIONAL
                    </span>
                    <span className={`text-[10px] font-bold block ${textSecondary} mt-0.5`}>
                      Pit Bench 3 Active
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                    Velocity: 610 t/hr (Surplus)
                  </span>
                </div>

                {/* Metric 3: DGMS & IBM Statutory Compliance Score */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${textMuted}`}>
                      DGMS & IBM COMPLIANCE
                    </span>
                    <span className="material-symbols-outlined text-emerald-500 text-lg">gavel</span>
                  </div>
                  <div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 block">
                      94.2%
                    </span>
                    <span className={`text-[10px] font-bold block text-emerald-600 dark:text-emerald-400 mt-0.5`}>
                      Standard Par Compliant
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    PPV &lt; 5.0 mm/s verified
                  </span>
                </div>

                {/* Metric 4: Shift Production Pulse & Deficit */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${textMuted}`}>
                      PRODUCTION PULSE
                    </span>
                    <span className="material-symbols-outlined text-blue-500 text-lg">speed</span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-headline font-black text-2xl ${textPrimary}`}>4,100</span>
                      <span className={`text-xs ${textMuted}`}>/ 5,000 t</span>
                    </div>
                    <span className="text-[10px] font-bold block text-rose-500 mt-0.5">
                      -900 t Shift Shortfall (82%)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-blue-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                    Downtime: 1.8h loading stoppage
                  </span>
                </div>

                {/* Metric 5: Actionable Corrective Items */}
                <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all duration-300 hover:-translate-y-0.5 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${textMuted}`}>
                      CORRECTIVE ACTIONS
                    </span>
                    <span className="material-symbols-outlined text-amber-500 text-lg">checklist</span>
                  </div>
                  <div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-amber-500 block">
                      {siteManagerActions.filter(a => a.status === 'PENDING').length}
                    </span>
                    <span className={`text-[10px] font-bold block text-amber-600 dark:text-amber-400 mt-0.5`}>
                      1 In Progress • 3 Pending
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500 font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
                    +680 t potential recovery
                  </span>
                </div>
              </div>

              {/* SECTION 3: CURRENT MINE ACTIVE BENCHES & WORKING FACES STATUS GRID */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-500 text-xl">layers</span>
                      <h3 className={`font-headline font-black text-sm sm:text-base uppercase tracking-wider ${textPrimary}`}>
                        {mineProfile.mineName} Active Benches & Working Faces Matrix
                      </h3>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                      Live operational monitoring across active pit benches, blasting zones, dewatering sumps, and ROM handling points of {mineProfile.mineName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter benches, zones, or equipment..."
                      value={siteStatusSearch}
                      onChange={(e) => setSiteStatusSearch(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      } focus:outline-none focus:border-blue-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveTab('prospectivity')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
                      title="Inspect active benches on the GIS Prospectivity Map"
                    >
                      <span className="material-symbols-outlined text-sm">satellite_alt</span>
                      <span className="hidden sm:inline">GIS Prospectivity Map</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(CURRENT_MINE_INTERNAL_BENCHES[selectedMineId] || CURRENT_MINE_INTERNAL_BENCHES['dongri-buzurg'])
                    .filter((bench) =>
                      siteStatusSearch === '' ||
                      bench.benchName.toLowerCase().includes(siteStatusSearch.toLowerCase()) ||
                      bench.zone.toLowerCase().includes(siteStatusSearch.toLowerCase()) ||
                      bench.assignedMachinery.toLowerCase().includes(siteStatusSearch.toLowerCase())
                    )
                    .map((bench) => {
                      const outputPct = bench.shiftTargetTons > 0
                        ? Math.min(100, Math.round((bench.shiftActualTons / bench.shiftTargetTons) * 100))
                        : 100;
                      return (
                        <div
                          key={bench.id}
                          className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                            isDark
                              ? 'bg-[#151922] border-slate-800 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className={`font-headline font-black text-sm uppercase truncate ${textPrimary}`}>
                                {bench.benchName}
                              </h4>
                              <span className={`text-[11px] font-medium block mt-0.5 ${textMuted}`}>
                                {bench.zone} • In-Charge: {bench.operatorInCharge}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shrink-0 ${bench.statusColor}`}>
                              {bench.phase}
                            </span>
                          </div>

                          {/* Output Progress Bar or Status */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className={textSecondary}>
                                {bench.shiftTargetTons > 0 ? 'Shift Output:' : 'Bench Phase:'}
                              </span>
                              <span className={`font-mono ${textPrimary}`}>
                                {bench.shiftTargetTons > 0
                                  ? `${bench.shiftActualTons.toLocaleString()} / ${bench.shiftTargetTons.toLocaleString()} t (${outputPct}%)`
                                  : bench.phase}
                              </span>
                            </div>
                            {bench.shiftTargetTons > 0 && (
                              <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex p-0.5">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    outputPct >= 95 ? 'bg-emerald-500' : outputPct >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${outputPct}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Assigned Machinery & Equipment */}
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                              <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                              <span>Assigned Equipment & Fleet:</span>
                            </div>
                            <p className={`text-[11px] font-medium ${textPrimary} leading-tight`}>
                              {bench.assignedMachinery}
                            </p>
                          </div>

                          {/* Live Bench Notes */}
                          <p className={`text-[11px] italic leading-snug ${textMuted}`}>
                            "{bench.notes}"
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">DGMS Slope Par:</span>
                              <strong className="font-mono text-emerald-500">{bench.dgmsSlopeIndex}%</strong>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              bench.geotechRisk === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : bench.geotechRisk === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {bench.geotechRisk} RISK
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* SECTION 4: INTERACTIVE PRODUCTION PULSE & COMPLIANCE RADAR VISUALIZER */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-6 ${cardBg}`}>
                <SiteProductionPulseEChart
                  themeMode={themeMode}
                  selectedMineId={selectedMineId}
                  mineName={mineProfile.mineName}
                />
              </div>

              {/* SECTION 5: SITE-SPECIFIC RISKS WITH SEVERITY (RISK MATRIX & THREAT REGISTER) */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-xl">shield</span>
                      <h3 className={`font-headline font-black text-sm sm:text-base uppercase tracking-wider ${textPrimary}`}>
                        Site-Specific Risks & Statutory Threat Register ({mineProfile.mineName})
                      </h3>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                      Live severity matrix classifying operational, geotechnical, and DGMS compliance hazards
                    </p>
                  </div>

                  {/* Risk Severity Filters */}
                  <div className={`flex items-center p-1 rounded-xl border flex-wrap gap-1 ${
                    isDark ? 'bg-[#14171C] border-slate-700' : 'bg-slate-100 border-slate-300'
                  }`}>
                    {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'STATUTORY'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSiteRiskFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          siteRiskFilter === filter
                            ? 'bg-[#002452] text-white shadow-xs'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Register List Cards */}
                <div className="space-y-3.5">
                  {(SITE_SPECIFIC_RISK_EVENTS[selectedMineId] || SITE_SPECIFIC_RISK_EVENTS['dongri-buzurg'])
                    .filter((rsk) => {
                      if (siteRiskFilter === 'ALL') return true;
                      if (siteRiskFilter === 'STATUTORY') return rsk.category.includes('STATUTORY') || rsk.statutoryAuthority.includes('DGMS');
                      return rsk.severity === siteRiskFilter;
                    })
                    .map((risk) => (
                      <div
                        key={risk.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          risk.severity === 'CRITICAL'
                            ? isDark ? 'bg-rose-950/20 border-rose-800/60' : 'bg-rose-50/70 border-rose-200'
                            : risk.severity === 'HIGH'
                            ? isDark ? 'bg-amber-950/20 border-amber-800/60' : 'bg-amber-50/70 border-amber-200'
                            : risk.severity === 'MEDIUM'
                            ? isDark ? 'bg-blue-950/20 border-blue-800/60' : 'bg-blue-50/70 border-blue-200'
                            : nestedBg
                        }`}
                      >
                        <div className="space-y-2 max-w-3xl">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              risk.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                                : risk.severity === 'HIGH'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : risk.severity === 'MEDIUM'
                                ? 'bg-blue-500 text-white'
                                : 'bg-emerald-500 text-white'
                            }`}>
                              {risk.severity} SEVERITY
                            </span>

                            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                              {risk.code}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isDark ? 'bg-[#14171C] border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                            }`}>
                              {risk.benchZone}
                            </span>
                          </div>

                          <h4 className={`font-headline font-black text-sm sm:text-base ${textPrimary}`}>
                            {risk.title}
                          </h4>

                          <p className={`text-xs leading-relaxed ${textSecondary}`}>
                            {risk.description}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] pt-1 flex-wrap">
                            <span className="font-mono text-rose-500 font-bold">
                              • Impact: {risk.quantitativeImpact}
                            </span>
                            <span className={`text-slate-400 italic`}>
                              • Authority: {risk.statutoryAuthority}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-400">
                            Logged: {risk.updatedAt}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleToggleSiteManagerAction(risk.linkedActionId);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>Trigger Mitigation</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* SECTION 6: GOVERNMENT STATUTORY REPORTS & COMPLIANCE DIRECTIVES */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-5 ${
                isDark ? 'bg-gradient-to-br from-[#0B1524] to-[#122238] border-blue-900/60' : 'bg-blue-50/60 border-blue-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 border-blue-900/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-xl">policy</span>
                    <h3 className={`font-headline font-black text-sm sm:text-base uppercase tracking-wider ${textPrimary}`}>
                      Government Statutory Reports & Compliance Directives
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800">
                    Live Ministry Feeds
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className={`p-4 rounded-xl border space-y-2 ${nestedBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-500">DGMS SAFETY CIRCULAR</span>
                      <span className="material-symbols-outlined text-teal-500 text-base">verified</span>
                    </div>
                    <h4 className={`font-bold ${textPrimary}`}>Bench Vibration & Flyrock Radius</h4>
                    <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                      Mandates PPV ground vibration &lt; 5.0 mm/s at 300m buffer and verified Nonel shock-tube detonation sequence.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold block">Status: Verified Compliant</span>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${nestedBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">IBM MCDR 2017</span>
                      <span className="material-symbols-outlined text-blue-500 text-base">star</span>
                    </div>
                    <h4 className={`font-bold ${textPrimary}`}>5-Star Rating Mineral Conservation</h4>
                    <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                      Enforces grade recovery threshold &gt; 28% Mn and waste rock dump slope stability maintenance below 28 degrees.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold block">Rating: 5-Star Certified</span>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${nestedBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">CGWB GROUND WATER</span>
                      <span className="material-symbols-outlined text-amber-500 text-base">water_drop</span>
                    </div>
                    <h4 className={`font-bold ${textPrimary}`}>Monsoon Dewatering Ceiling</h4>
                    <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                      Pit sump discharge capped at 1,500 m³/hr with mandatory settling pond turbidity filtration before discharge.
                    </p>
                    <span className="text-[10px] font-mono text-amber-500 font-bold block">Status: 1,450 m³/hr (Watch)</span>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-2 ${nestedBg}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">SPCB AIR QUALITY</span>
                      <span className="material-symbols-outlined text-purple-500 text-base">air</span>
                    </div>
                    <h4 className={`font-bold ${textPrimary}`}>PM10 Dust Suppression Norm</h4>
                    <p className={`text-[11px] leading-relaxed ${textSecondary}`}>
                      Continuous water mist cannon deployment across crusher dump hopper and active 450m haul ramp gradient.
                    </p>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold block">PM10: 82 µg/m³ (&lt; 100 limit)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 7: PRESCRIPTIVE CORRECTIVE ACTIONS (SITE MANAGER CHECKLIST) */}
              <div className={`p-6 sm:p-7 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-xl">task_alt</span>
                      <h3 className={`font-headline font-black text-sm sm:text-base uppercase tracking-wider ${textPrimary}`}>
                        Actionable Corrective Actions & Tonnage Gap Closures
                      </h3>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-0.5`}>
                      Prioritized mitigation tasks synthesized from shift delay logs and statutory parameters (Click status to advance)
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    {siteManagerActions.filter(a => a.status === 'COMPLETED').length} of {siteManagerActions.length} Actions Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteManagerActions.map((act) => {
                    const isCompleted = act.status === 'COMPLETED';
                    const isInProgress = act.status === 'IN_PROGRESS';
                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggleSiteManagerAction(act.id)}
                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 select-none hover:-translate-y-0.5 hover:shadow-md ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                            : isInProgress
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                            : nestedBg
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                              act.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950 font-bold'
                            }`}>
                              {act.priority} PRIORITY
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white'
                                  : isInProgress
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}>
                                {act.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-bold">↻</span>
                            </div>
                          </div>

                          <h4 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                            {act.title}
                          </h4>

                          <p className={`text-xs leading-relaxed ${textSecondary}`}>
                            {act.targetParam}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className={textMuted}>Assigned In-Charge:</span>
                            <strong className={textPrimary}>{act.owner}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className={textMuted}>Target Completion:</span>
                            <span className="font-mono text-amber-500 font-bold">{act.deadline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={textMuted}>Expected Output Recovery:</span>
                            <span className="font-mono text-emerald-500 font-black">+{act.expectedRecoveryTons} Tonnes</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROSPECTIVITY TAB CONTENT (MODEL 1) */}
          {/* ========================================================================= */}
          {activeTab === 'prospectivity' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <ProspectivityView
                isDark={isDark}
                selectedMineName={selectedMineId}
                onSendToForecast={() => setActiveTab('production-forecast')}
                onNavigateToTab={(tab) => setActiveTab(tab as OverviewTab)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRODUCTION & FORECAST TAB CONTENT */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB 3: PRODUCTION & FORECAST TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'production-forecast' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`font-headline font-black text-2xl uppercase tracking-tight flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-2xl">trending_up</span>
                      PRODUCTION & FORECAST
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isDark
                        ? 'bg-[#D97706]/20 border-[#D97706] text-[#D97706]'
                        : 'bg-amber-100 border-amber-300 text-amber-800 shadow-xs'
                    }`}>
                      POTENTIAL FUTURE SOURCE: {mineProfile.potentialSourceZone}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>
                    "Production performance and model-based output forecast for {mineProfile.mineName}." 
                  </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer ${nestedBg} ${textPrimary}`}>
                    <span>This Month</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>
                  <button className={`px-3.5 py-2 rounded-lg border text-xs font-bold cursor-pointer ${nestedBg} ${textSecondary}`}>
                    Custom Range
                  </button>
                  <button
                    onClick={() => alert(`Executing Model Re-Forecast Simulation for ${mineProfile.mineName}...`)}
                    className="px-4 py-2 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6A69] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 border border-[#0E7C7B]"
                  >
                    <span className="material-symbols-outlined text-sm">autorenew</span>
                    <span>Run Forecast</span>
                  </button>
                </div>
              </div>

              {/* FORECAST SUMMARY CARDS WITH SHADER EFFECTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <ShaderCard variant="teal" isDark={isDark} className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-emerald-800'}`}>
                      CURRENT OUTPUT
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                    }`}>
                      <span className="material-symbols-outlined text-base">trending_up</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`font-headline font-black text-3xl block ${isDark ? textPrimary : 'text-slate-950'}`}>
                      {mineProfile.currentOutputTons.toLocaleString()} t
                    </span>
                    <div className={`w-full h-1.5 rounded-full mt-2.5 overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`}>
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((mineProfile.currentOutputTons / mineProfile.plannedTargetTons) * 100))}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold block mt-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      {Math.round((mineProfile.currentOutputTons / mineProfile.plannedTargetTons) * 100)}% of target
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="indigo" isDark={isDark} className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-blue-800'}`}>
                      PLANNED TARGET
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'bg-blue-100 border border-blue-300 text-blue-700'
                    }`}>
                      <span className="material-symbols-outlined text-base">flag</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`font-headline font-black text-3xl block ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {mineProfile.plannedTargetTons.toLocaleString()} t
                    </span>
                    <span className={`text-xs font-semibold block mt-1.5 ${textMuted}`}>
                      Current month allocation
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="teal" isDark={isDark} className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider block ${isDark ? 'text-[#0E7C7B]' : 'text-teal-800'}`}>
                      PREDICTED OUTPUT
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 text-[#0E7C7B]' : 'bg-teal-100 border border-teal-300 text-teal-700'
                    }`}>
                      <span className="material-symbols-outlined text-base">layers</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`font-headline font-black text-3xl block ${isDark ? 'text-[#0E7C7B]' : 'text-teal-700'}`}>
                      {mineProfile.predictedOutputTons.toLocaleString()} t
                    </span>
                    <span className={`text-xs font-semibold block mt-1.5 ${isDark ? 'text-[#0E7C7B]' : 'text-teal-700'}`}>
                      Model forecast
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="amber" isDark={isDark} className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider block ${isDark ? 'text-[#D97706]' : 'text-amber-900'}`}>
                      PROJECTED GAP
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-amber-500/15 border border-amber-500/30 text-[#D97706]' : 'bg-amber-100 border border-amber-300 text-amber-800'
                    }`}>
                      <span className="material-symbols-outlined text-base">notifications</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`font-headline font-black text-3xl block ${isDark ? 'text-[#D97706]' : 'text-amber-700'}`}>
                      {mineProfile.projectedGapTons.toLocaleString()} t
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        1 High Risk
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {mineProfile.gapPct}% deficit
                      </span>
                    </div>
                  </div>
                </ShaderCard>
              </div>

              {/* MAIN APACHE ECHARTS PRODUCTION VS TARGET CHART */}
              <div className={`p-6 rounded-xl border space-y-4 relative ${cardBg}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${borderDivider}`}>
                  <div>
                    <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B]">analytics</span>
                      PRODUCTION VS TARGET (APACHE ECHARTS)
                    </h3>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>
                      Historical actual tonnage vs planned allocation vs ML predicted output curve with 95% confidence interval.
                    </p>
                  </div>
                </div>

                {/* Apache ECharts Instance */}
                <ProductionForecastEChart
                  data={mineProfile.monthlyTrend}
                  mineName={mineProfile.mineName}
                  themeMode={themeMode}
                />
              </div>

              {/* SHORTFALL WARNING BANNER */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark
                  ? 'bg-[#D97706]/15 border-[#D97706]/50'
                  : 'bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-500/10 border-amber-300 shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-2xl ${isDark ? 'text-[#D97706]' : 'text-amber-700'}`}>warning</span>
                  <div>
                    <span className={`font-headline font-black text-sm uppercase tracking-wider block ${isDark ? 'text-[#D97706]' : 'text-amber-900'}`}>
                      ⚠️ SHORTFALL DETECTED • {mineProfile.mineName}
                    </span>
                    <p className={`text-xs font-medium mt-0.5 ${isDark ? textSecondary : 'text-slate-800'}`}>
                      Predicted production is below the allocation target. Projected gap:{' '}
                      <strong className={isDark ? 'text-[#D97706]' : 'text-amber-800'}>{Math.abs(mineProfile.projectedGapTons).toLocaleString()} t</strong> ({mineProfile.gapPct}% deficit).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('shortfall-diagnosis')}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md border ${
                    isDark
                      ? 'bg-[#D97706] hover:bg-[#B45309] text-white border-[#D97706]'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                  }`}
                >
                  View Shortfall Diagnosis →
                </button>
              </div>

              {/* EXPLAINABLE AI (XAI) FEATURE IMPORTANCE & ENVIRONMENTAL FACTORS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Explainable AI ECharts Horizontal Bar */}
                <div className={`lg:col-span-7 p-6 rounded-xl border space-y-3 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                    <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#8B5CF6] text-base">psychology</span>
                      EXPLAINABLE AI (XAI) • FEATURE IMPORTANCE
                    </h3>
                    <span className={`text-[10px] font-mono uppercase ${textMuted}`}>
                      ATTRIBUTION WEIGHTS
                    </span>
                  </div>
                  <FeatureImportanceEChart
                    features={mineProfile.featureImportance}
                    themeMode={themeMode}
                  />
                </div>

                {/* ENVIRONMENTAL & OPERATIONAL FACTORS */}
                <div className={`lg:col-span-5 p-6 rounded-xl border space-y-3 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                    <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-base">tune</span>
                      TELEMETRY FEEDS
                    </h3>
                    <span className={`text-[10px] font-mono uppercase ${textMuted}`}>LIVE SENSOR STREAM</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg} ${!isDark ? 'bg-gradient-to-br from-blue-50/60 via-white to-white border-blue-200 shadow-xs' : ''}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${isDark ? textMuted : 'text-blue-800'}`}>RAINFALL</span>
                      <span className={`font-headline font-black text-lg block ${isDark ? 'text-blue-500' : 'text-blue-700'}`}>
                        {mineProfile.environmentalFactors.rainfallPct}% ({mineProfile.environmentalFactors.rainfallMm} mm)
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg} ${!isDark ? 'bg-gradient-to-br from-emerald-50/60 via-white to-white border-emerald-200 shadow-xs' : ''}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${isDark ? textMuted : 'text-emerald-800'}`}>NDVI VEGETATION</span>
                      <span className={`font-headline font-black text-lg block ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>
                        {mineProfile.environmentalFactors.ndvi}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg} ${!isDark ? 'bg-gradient-to-br from-amber-50/60 via-white to-white border-amber-200 shadow-xs' : ''}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${isDark ? textMuted : 'text-amber-800'}`}>SOIL MOISTURE</span>
                      <span className={`font-headline font-black text-lg block ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
                        {mineProfile.environmentalFactors.soilMoisturePct}%
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg} ${!isDark ? 'bg-gradient-to-br from-teal-50/60 via-white to-white border-teal-200 shadow-xs' : ''}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${isDark ? textMuted : 'text-teal-800'}`}>FLEET UPTIME</span>
                      <span className={`font-headline font-black text-lg block ${isDark ? 'text-emerald-500' : 'text-teal-700'}`}>
                        {mineProfile.environmentalFactors.equipmentAvailabilityPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT-IF SIMULATION */}
              {userRole === 'admin' && (
              <div className={`p-6 rounded-xl border space-y-5 ${cardBg}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${borderDivider}`}>
                  <div>
                    <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B]">tune</span>
                      WHAT-IF SIMULATION
                    </h3>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>"Explore how operational and environmental changes could affect predicted output." </p>
                  </div>
                  <div className={`p-4 rounded-xl border text-right shrink-0 ${nestedBg} ${!isDark ? 'bg-gradient-to-br from-teal-50/60 via-white to-white border-teal-200 shadow-xs' : ''}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? 'text-[#0E7C7B]' : 'text-teal-800'}`}>SIMULATED OUTPUT</span>
                    <span className={`font-headline font-black text-2xl block ${isDark ? textPrimary : 'text-slate-950'}`}>{simulatedOutput.toLocaleString()} t</span>
                    <span className={`text-xs font-extrabold block ${isDark ? 'text-emerald-500' : 'text-emerald-700'}`}>{simulatedGain >= 0 ? `+${simulatedGain}` : simulatedGain} t vs current forecast</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isDark ? textSecondary : 'text-slate-800'}>Equipment Efficiency</span>
                      <span className={`font-mono ${isDark ? 'text-[#0E7C7B]' : 'text-teal-700 font-black'}`}>{simEquipment}%</span>
                    </div>
                    <input type="range" min="50" max="100" value={simEquipment} onChange={(e) => setSimEquipment(Number(e.target.value))} className="w-full accent-[#0E7C7B] cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isDark ? textSecondary : 'text-slate-800'}>Blasting Delay</span>
                      <span className={`font-mono ${isDark ? 'text-[#D97706]' : 'text-amber-700 font-black'}`}>{simBlastingDelay} days</span>
                    </div>
                    <input type="range" min="0" max="7" value={simBlastingDelay} onChange={(e) => setSimBlastingDelay(Number(e.target.value))} className="w-full accent-[#D97706] cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isDark ? textSecondary : 'text-slate-800'}>Rainfall</span>
                      <span className={`font-mono ${isDark ? 'text-blue-500' : 'text-blue-700 font-black'}`}>{simRainfall}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={simRainfall} onChange={(e) => setSimRainfall(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={isDark ? textSecondary : 'text-slate-800'}>NDVI</span>
                      <span className={`font-mono ${isDark ? 'text-emerald-500' : 'text-emerald-700 font-black'}`}>{simNdvi.toFixed(2)}</span>
                    </div>
                    <input type="range" min="10" max="90" value={simNdvi * 100} onChange={(e) => setSimNdvi(Number(e.target.value) / 100)} className="w-full accent-emerald-500 cursor-pointer" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setIsSimulating(true);
                      setTimeout(() => setIsSimulating(false), 600);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6A69] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md border border-[#0E7C7B]"
                  >
                    {isSimulating ? 'Computing Simulation...' : 'Run Simulation'}
                  </button>
                </div>
              </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SHORTFALL DIAGNOSIS TAB CONTENT */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB 3: SHORTFALL DIAGNOSIS TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'shortfall-diagnosis' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Toast Feedback */}
              {shiftToastMsg && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5 font-bold text-xs">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{shiftToastMsg}</span>
                  </div>
                  <button onClick={() => setShiftToastMsg(null)} className="text-xs hover:text-white cursor-pointer font-mono">✕</button>
                </div>
              )}

              {/* Console Header - Deep MOIL Dark Blue Signature Bar */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#002452] text-white shadow-md border border-[#00387A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                    <span className="material-symbols-outlined text-2xl">analytics</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                        Shortfall Diagnosis & Shift Calibration Console
                      </h2>
                      <span className="text-[10px] font-mono font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Real-Time AI Attribution</span>
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5">
                      {shortfallMode === 'BASELINE'
                        ? 'Live model baseline shortfall analysis, quantitative deficit gap, and SHAP root cause attribution'
                        : 'Input shift extraction telemetry to compute multi-variable SHAP cause attribution and gap-to-target diagnostics'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Segmented Mode Switcher */}
                  <div className="flex items-center p-1 rounded-xl bg-black/25 border border-white/20">
                    <button
                      onClick={() => setShortfallMode('BASELINE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        shortfallMode === 'BASELINE'
                          ? 'bg-white text-[#002452] shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">troubleshoot</span>
                      <span>Live Baseline Diagnosis</span>
                    </button>
                    <button
                      onClick={() => setShortfallMode('SHIFT_LOG')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        shortfallMode === 'SHIFT_LOG'
                          ? 'bg-white text-[#002452] shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      <span>Shift Audit Console</span>
                    </button>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-emerald-400">lock</span>
                    <span>Site: {mineProfile?.mineName || 'Dongri Buzurg Mine'}</span>
                  </span>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* MODE A: LIVE AI BASELINE SHORTFALL DIAGNOSIS (ORIGINAL RESTORED FEATURE) */}
              {/* ========================================================================= */}
              {shortfallMode === 'BASELINE' && (
                <div className="space-y-7 animate-in fade-in duration-200">
                  {/* Top Bar with View Mode Switcher */}
                  <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className={`font-headline font-black text-lg uppercase tracking-tight flex items-center gap-2 ${textPrimary}`}>
                          <span className="material-symbols-outlined text-[#B03A2E] text-2xl">troubleshoot</span>
                          Continuous Production Risk Baseline
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-[#B03A2E]/20 border border-[#B03A2E] text-[#B03A2E] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B03A2E] animate-ping" />
                          <span>● HIGH RISK TARGET DEFICIT</span>
                        </span>
                      </div>
                      <p className={`text-xs font-medium ${textSecondary}`}>
                        Autonomous model surveillance identifying production shortfalls and contributing root-cause factors.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`flex items-center p-1 rounded-lg border ${nestedBg}`}>
                        <button
                          onClick={() => setDiagnosisViewMode('SUMMARY')}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                            diagnosisViewMode === 'SUMMARY' ? 'bg-[#002452] text-white shadow-xs' : textMuted
                          }`}
                        >
                          Summary
                        </button>
                        <button
                          onClick={() => setDiagnosisViewMode('CAUSE_ANALYSIS')}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                            diagnosisViewMode === 'CAUSE_ANALYSIS' ? 'bg-[#002452] text-white shadow-xs' : textMuted
                          }`}
                        >
                          Cause Analysis
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RISK SUMMARY & GAP VISUAL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Evaluated State Profile Tile */}
                    <div className={`lg:col-span-5 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                      isDark ? 'bg-[#20242D] border-[#B03A2E]/50' : 'bg-white border-[#B03A2E]/40 shadow-sm'
                    }`}>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                          <span className={`text-xs font-headline font-black uppercase tracking-wider ${textMuted}`}>
                            CURRENT RISK DIAGNOSIS
                          </span>
                          <span className="text-[10px] font-mono text-[#B03A2E] font-bold">ACTIVE TRIGGER</span>
                        </div>

                        <div className="p-5 rounded-xl bg-[#B03A2E]/20 border border-[#B03A2E] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black text-[#B03A2E] uppercase tracking-widest block">
                              EVALUATED STATE
                            </span>
                            <span className="font-headline text-3xl font-black text-[#B03A2E] block mt-0.5">
                              HIGH RISK
                            </span>
                            <span className={`text-xs font-bold block mt-0.5 ${textPrimary}`}>
                              Affected: {mineProfile?.potentialSourceZone || 'Zone 14 (South Extension)'}
                            </span>
                          </div>
                          <span className="w-4 h-4 rounded-full bg-[#B03A2E] animate-ping" />
                        </div>

                        {/* 3 Metric Tiles */}
                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                          <div className={`p-3 rounded-lg border ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>TARGET</span>
                            <span className="font-headline font-black text-lg sm:text-xl text-blue-600">
                              {(mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000).toLocaleString()} t
                            </span>
                          </div>
                          <div className={`p-3 rounded-lg border ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>FORECAST</span>
                            <span className={`font-headline font-black text-lg sm:text-xl ${textPrimary}`}>
                              {(mineProfile?.predictedOutputTons || 4100).toLocaleString()} t
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-[#B03A2E]/10 border border-[#B03A2E]/40">
                            <span className="text-[10px] text-[#B03A2E] font-bold uppercase block">SHORTFALL</span>
                            <span className="font-headline font-black text-lg sm:text-xl text-[#B03A2E]">
                              -{Math.abs((mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000) - (mineProfile?.predictedOutputTons || 4100)).toLocaleString()} t
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gap to Target Visualization Card */}
                    <div className={`lg:col-span-7 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${cardBg}`}>
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                          <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                            <span className="material-symbols-outlined text-[#B03A2E] text-base">straighten</span>
                            GAP TO TARGET VISUALIZATION
                          </h3>
                          <span className={`text-[10px] font-mono ${textMuted}`}>QUANTITATIVE DEFICIT</span>
                        </div>

                        <p className={`text-sm font-semibold ${textSecondary}`}>
                          "Production is projected to finish{' '}
                          <strong className="text-[#B03A2E]">
                            {Math.abs((mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000) - (mineProfile?.predictedOutputTons || 4100)).toLocaleString()} t
                          </strong>{' '}
                          below the current target."
                        </p>

                        <div className="space-y-4 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-blue-600">PLANNED TARGET</span>
                              <span className="font-mono text-blue-600">
                                {(mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000).toLocaleString()} t (100%)
                              </span>
                            </div>
                            <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                              <div className="h-full bg-blue-600 rounded-md" style={{ width: '100%' }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            {(() => {
                              const target = mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000;
                              const forecast = mineProfile?.predictedOutputTons || 4100;
                              const pct = Math.min(100, Math.round((forecast / target) * 100));
                              const shortfallPct = Math.max(0, 100 - pct);
                              return (
                                <>
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className={textPrimary}>PROJECTED FORECAST</span>
                                    <span className={`font-mono ${textPrimary}`}>
                                      {forecast.toLocaleString()} t ({pct}%)
                                    </span>
                                  </div>
                                  <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 flex ${nestedBg}`}>
                                    <div
                                      className="h-full bg-[#0E7C7B] rounded-l-md transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                    <div
                                      className="h-full bg-[#B03A2E] rounded-r-md animate-pulse transition-all duration-500"
                                      style={{ width: `${shortfallPct}%` }}
                                    />
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CAUSE CONTRIBUTION SHAP (Feature Importance) */}
                  <div className={`p-6 rounded-xl border space-y-5 ${cardBg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                        <span className="material-symbols-outlined text-[#B03A2E]">align_horizontal_left</span>
                        CAUSE CONTRIBUTION (SHAP FEATURE IMPORTANCE)
                      </h3>
                      <span className={`text-[11px] font-mono ${textMuted}`}>
                        Model weights derived from pit telemetry & weather telemetry
                      </span>
                    </div>
                    <div className="space-y-4 pt-1">
                      {[
                        { label: 'EQUIPMENT DOWNTIME', pct: 42, color: '#B03A2E' },
                        { label: 'BLASTING DELAY', pct: 28, color: '#D97706' },
                        { label: 'RAINFALL', pct: 18, color: '#3B82F6' },
                        { label: 'ORE GRADE', pct: 12, color: '#10B981' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className={`uppercase tracking-wider ${textPrimary}`}>{item.label}</span>
                            <span className="font-mono font-black text-sm" style={{ color: item.color }}>
                              {item.pct}% CONTRIBUTION
                            </span>
                          </div>
                          <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                            <div
                              className="h-full rounded-md transition-all duration-500"
                              style={{ width: `${item.pct}%`, background: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CAUSE DETAILS & GAP CLOSURE CONDITIONS */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className={`lg:col-span-8 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                      <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                        CAUSE EXPLANATIONS & OPERATIONAL IMPACT
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {[
                          {
                            label: 'EQUIPMENT DOWNTIME',
                            color: '#B03A2E',
                            pct: '42%',
                            desc: 'Reduced equipment availability is the largest contributor to the projected production gap.',
                          },
                          {
                            label: 'BLASTING DELAY',
                            color: '#D97706',
                            pct: '28%',
                            desc: 'Current blasting delay is reducing the available operating window in active benches.',
                          },
                          {
                            label: 'RAINFALL',
                            color: '#3B82F6',
                            pct: '18%',
                            desc: 'Seasonal rainfall is contributing to reduced haul road traction and pit dewatering requirements.',
                          },
                          {
                            label: 'ORE GRADE',
                            color: '#10B981',
                            pct: '12%',
                            desc: 'Lower ore grade variance contributes to the remaining production tonnage gap.',
                          },
                        ].map((item) => (
                          <div key={item.label} className={`p-4 rounded-xl border space-y-1.5 ${nestedBg}`}>
                            <div className="flex justify-between items-center font-bold">
                              <span className={textPrimary}>{item.label}</span>
                              <span style={{ color: item.color }} className="font-mono font-black">{item.pct} IMPACT</span>
                            </div>
                            <p className={textSecondary}>&ldquo;{item.desc}&rdquo;</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`lg:col-span-4 p-6 rounded-xl border space-y-3 ${cardBg}`}>
                      <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                        GAP CLOSURE CONDITIONS
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                          <span className={`text-[10px] uppercase block font-bold ${textMuted}`}>EQUIPMENT EFFICIENCY</span>
                          <span className="font-headline font-black text-base text-emerald-500 block mt-0.5">80% → 100%</span>
                          <p className={`text-[11px] mt-1 ${textSecondary}`}>Restore excavator uptime to recover 420 t</p>
                        </div>
                        <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                          <span className={`text-[10px] uppercase block font-bold ${textMuted}`}>BLASTING DELAY</span>
                          <span className="font-headline font-black text-base text-emerald-500 block mt-0.5">2 days → ≤ 0 days</span>
                          <p className={`text-[11px] mt-1 ${textSecondary}`}>Expedite safety clearance to recover 280 t</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('corrective-actions')}
                          className="w-full py-2.5 rounded-lg bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>JUMP TO CORRECTIVE ACTIONS</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bridge Callout Card to Shift Log */}
                  <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isDark ? 'bg-blue-950/20 border-blue-900/60' : 'bg-blue-50/80 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#002452] text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">edit_note</span>
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${textPrimary}`}>
                          Want to calibrate this diagnosis with active shift production numbers?
                        </h4>
                        <p className={`text-xs ${textSecondary} mt-0.5`}>
                          Open the Shift Operational Log to input today's actual output, breakdown hours, and specific pit drivers.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShortfallMode('SHIFT_LOG')}
                      className="px-4 py-2 rounded-xl bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <span>Open Shift Audit Console</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MODE B: INTERACTIVE SHIFT OPERATIONAL LOG & RECALIBRATION CONSOLE */}
              {/* ========================================================================= */}
              {/* ========================================================================= */}
              {/* MODE B: INTERACTIVE SHIFT OPERATIONAL LOG & RECALIBRATION CONSOLE */}
              {/* ========================================================================= */}
              {shortfallMode === 'SHIFT_LOG' && (
                <div className="space-y-7 animate-in fade-in duration-200">
                  {/* Google Form Style Stepper & Progress Navigation */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#002452] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                            Multi-Section Form Flow
                          </span>
                          <span className={`text-xs font-bold ${textSecondary}`}>
                            {shiftSection === 'PRODUCTION' ? 'Section 1 of 2: Shift Production Telemetry' : 'Section 2 of 2: Blasting Details & Delay Root Causes'}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-black uppercase tracking-wide mt-1 ${textPrimary}`}>
                          {shiftSection === 'PRODUCTION'
                            ? '1. Shift Extraction & Fleet Operating Availability'
                            : '2. Blast Plan Timeline, Delay Root Causes & Frequency Histogram'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasRunDiagnosis && (
                          <button
                            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                            className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isDark ? 'bg-[#14171C] border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isFormCollapsed ? 'edit_note' : 'unfold_less'}
                            </span>
                            <span>{isFormCollapsed ? 'Modify Form Inputs' : 'Collapse Form'}</span>
                          </button>
                        )}
                        <button
                          onClick={shiftSection === 'PRODUCTION' ? handleLoadDefaults : handleLoadBlastingDefaults}
                          className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isDark ? 'bg-[#14171C] border-slate-700 text-cyan-400' : 'bg-white border-slate-300 text-teal-700'
                          }`}
                          title="Load standard shift telemetry"
                        >
                          <span className="material-symbols-outlined text-sm">sync</span>
                          <span>Load Sample Telemetry</span>
                        </button>
                      </div>
                    </div>

                    {/* Section Step Switcher Tabs (Clickable like Google Form Sections) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShiftSection('PRODUCTION')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          shiftSection === 'PRODUCTION'
                            ? 'bg-[#002452] text-white border-[#00387A] shadow-md ring-2 ring-[#002452]/40'
                            : isDark
                            ? 'bg-[#14171C] border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            shiftSection === 'PRODUCTION' ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            1
                          </div>
                          <div>
                            <span className="text-xs font-bold block">Production & Fleet Uptime</span>
                            <span className={`text-[10px] ${shiftSection === 'PRODUCTION' ? 'text-blue-200' : textMuted}`}>
                              Actual tons, operating hours & general drivers
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm">
                          {shiftSection === 'PRODUCTION' ? 'radio_button_checked' : 'arrow_forward'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShiftSection('BLASTING')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          shiftSection === 'BLASTING'
                            ? 'bg-[#002452] text-white border-[#00387A] shadow-md ring-2 ring-[#002452]/40'
                            : isDark
                            ? 'bg-[#14171C] border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            shiftSection === 'BLASTING' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            2
                          </div>
                          <div>
                            <span className="text-xs font-bold block">Blasting Details & Histogram</span>
                            <span className={`text-[10px] ${shiftSection === 'BLASTING' ? 'text-blue-200' : textMuted}`}>
                              Timeline milestones, delay reasons & frequency plot
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm">
                          {shiftSection === 'BLASTING' ? 'radio_button_checked' : 'arrow_forward'}
                        </span>
                      </button>
                    </div>

                    {/* Google Form Section Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400">
                        <span>Section Progress</span>
                        <span>{shiftSection === 'PRODUCTION' ? '50% (Step 1 of 2 Completed)' : '100% (Ready to Synthesize AI Diagnosis)'}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-300 rounded-full"
                          style={{ width: shiftSection === 'PRODUCTION' ? '50%' : '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* SECTION 1: SHIFT EXTRACTION & FLEET AVAILABILITY */}
                  {/* ================================================================= */}
                  {shiftSection === 'PRODUCTION' && (!hasRunDiagnosis || !isFormCollapsed) && (
                    <div className={`p-6 sm:p-7 rounded-2xl border-2 space-y-7 transition-all ${
                      isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-white border-[#002452]/90 shadow-sm'
                    }`}>
                      {/* Row 1: 4 Modern Shift Metadata Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tile 1: Selected Mine / Site (Locked) */}
                        <div className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${nestedBg} border-slate-200 dark:border-slate-800`}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-xl">domain</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                              PREFILLED MINE SITE
                            </span>
                            <h4 className={`text-xs sm:text-sm font-bold truncate ${textPrimary}`}>
                              {mineProfile?.mineName || 'Dongri Buzurg Mine'}
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active Session • {mineProfile?.district || 'Bhandara'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Tile 2: Shift Date */}
                        <div className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${nestedBg} border-slate-200 dark:border-slate-800`}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-xl">calendar_month</span>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                              SHIFT DATE
                            </span>
                            <input
                              type="date"
                              value={shiftDate}
                              onChange={(e) => setShiftDate(e.target.value)}
                              className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              } focus:outline-none focus:border-[#002452] dark:focus:border-blue-400`}
                            />
                          </div>
                        </div>

                        {/* Tile 3: Shift Window */}
                        <div className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${nestedBg} border-slate-200 dark:border-slate-800`}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white flex items-center justify-center shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-xl">schedule</span>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                              SHIFT WINDOW (8.0H)
                            </span>
                            <select
                              value={shiftType}
                              onChange={(e) => setShiftType(e.target.value as any)}
                              className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              } focus:outline-none focus:border-[#002452] dark:focus:border-blue-400`}
                            >
                              <option value="SHIFT_A">Shift A (06:00 - 14:00)</option>
                              <option value="SHIFT_B">Shift B (14:00 - 22:00)</option>
                              <option value="SHIFT_C">Shift C (22:00 - 06:00)</option>
                              <option value="GENERAL">General (08:00 - 17:00)</option>
                            </select>
                          </div>
                        </div>

                        {/* Tile 4: Model Target Baseline */}
                        <div className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                          isDark ? 'bg-blue-950/30 border-blue-800/60' : 'bg-blue-50/70 border-blue-200'
                        }`}>
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <span className="material-symbols-outlined text-xl">flag</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black uppercase tracking-wider block text-blue-600 dark:text-blue-400">
                              MODEL SHIFT TARGET
                            </span>
                            <h4 className="text-base font-black text-blue-700 dark:text-blue-300">
                              {(mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000).toLocaleString()} t
                            </h4>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold block mt-0.5">
                              100% Shift Baseline PAR
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Actual Output & Fleet Availability Station */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                        {/* Actual Shift Output Input Box (6 Cols) */}
                        <div className={`lg:col-span-6 p-5 rounded-2xl border space-y-3.5 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${textPrimary}`}>
                              <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">scale</span>
                              <span>Actual Shift Production Output</span>
                            </label>
                            {/* Live Delta Chip */}
                            {(() => {
                              const target = (mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000);
                              const delta = actualOutputInput - target;
                              const pct = target > 0 ? ((delta / target) * 100).toFixed(1) : '0.0';
                              return (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black border flex items-center gap-1 ${
                                  delta < 0
                                    ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                                }`}>
                                  <span>{delta < 0 ? '▼' : '▲'}</span>
                                  <span>{delta >= 0 ? `+${delta} t` : `${delta} t`} ({pct}%)</span>
                                </span>
                              );
                            })()}
                          </div>

                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="200000"
                              step="50"
                              value={actualOutputInput}
                              onChange={(e) => setActualOutputInput(Number(e.target.value))}
                              className={`w-full p-3 pr-12 rounded-xl border text-lg font-black transition-all ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              } focus:outline-none focus:border-[#002452] dark:focus:border-blue-400`}
                            />
                            <span className={`absolute right-4 top-3.5 text-xs font-mono font-bold ${textMuted}`}>Tonnes</span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-bold">
                            <span className={textMuted}>Quick Presets:</span>
                            <button
                              type="button"
                              onClick={() => setActualOutputInput(4100)}
                              className={`px-2.5 py-1 rounded-md border ${isDark ? 'bg-[#14171C] border-slate-700 hover:border-slate-500' : 'bg-white border-slate-300 hover:border-slate-400'} cursor-pointer transition-all`}
                            >
                              4,100 t (Current Shift)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActualOutputInput(mineProfile?.plannedTargetTons && mineProfile.plannedTargetTons <= 20000 ? mineProfile.plannedTargetTons : 5000)}
                              className={`px-2.5 py-1 rounded-md border ${isDark ? 'bg-[#14171C] border-slate-700 hover:border-slate-500' : 'bg-white border-slate-300 hover:border-slate-400'} cursor-pointer transition-all`}
                            >
                              5,000 t (On Target)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActualOutputInput(Math.max(0, actualOutputInput - 200))}
                              className={`px-2.5 py-1 rounded-md border text-rose-500 ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-white border-slate-300'} cursor-pointer transition-all`}
                            >
                              -200 t
                            </button>
                            <button
                              type="button"
                              onClick={() => setActualOutputInput(actualOutputInput + 200)}
                              className={`px-2.5 py-1 rounded-md border text-emerald-500 ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-white border-slate-300'} cursor-pointer transition-all`}
                            >
                              +200 t
                            </button>
                          </div>
                        </div>

                        {/* Operating & Downtime Split Station with Visual Gauge (6 Cols) */}
                        <div className={`lg:col-span-6 p-5 rounded-2xl border space-y-3.5 ${nestedBg} border-slate-200 dark:border-slate-800 flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${textPrimary}`}>
                                <span className="material-symbols-outlined text-base text-teal-600 dark:text-teal-400">timelapse</span>
                                <span>Equipment Availability & Operating Hours</span>
                              </label>
                              <span className="text-[11px] font-mono font-bold text-teal-600 dark:text-teal-400">
                                {operatingHoursInput + downtimeHoursInput > 0
                                  ? `${((operatingHoursInput / (operatingHoursInput + downtimeHoursInput)) * 100).toFixed(0)}% Uptime`
                                  : '100% Uptime'}
                              </span>
                            </div>

                            {/* Dual Numeric Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className={`text-[10px] font-bold uppercase ${textMuted}`}>Operating Time</span>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="8"
                                    step="0.1"
                                    value={operatingHoursInput}
                                    onChange={(e) => setOperatingHoursInput(Number(e.target.value))}
                                    className={`w-full p-2.5 pr-10 rounded-xl border text-sm font-black transition-all ${
                                      isDark ? 'bg-[#14171C] border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
                                    } focus:outline-none focus:border-emerald-500`}
                                  />
                                  <span className={`absolute right-3 top-2.5 text-xs font-mono font-bold ${textMuted}`}>hrs</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className={`text-[10px] font-bold uppercase text-rose-500`}>Downtime Stoppage</span>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="8"
                                    step="0.1"
                                    value={downtimeHoursInput}
                                    onChange={(e) => setDowntimeHoursInput(Number(e.target.value))}
                                    className={`w-full p-2.5 pr-10 rounded-xl border text-sm font-black transition-all ${
                                      isDark ? 'bg-[#14171C] border-slate-700 text-rose-400' : 'bg-white border-slate-300 text-rose-700'
                                    } focus:outline-none focus:border-rose-500`}
                                  />
                                  <span className={`absolute right-3 top-2.5 text-xs font-mono font-bold ${textMuted}`}>hrs</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Live Visual Equipment Availability Meter */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Run: {operatingHoursInput}h ({operatingHoursInput + downtimeHoursInput > 0 ? ((operatingHoursInput / (operatingHoursInput + downtimeHoursInput)) * 100).toFixed(1) : 100}%)
                              </span>
                              <span className="text-rose-600 dark:text-rose-400">
                                Down: {downtimeHoursInput}h ({operatingHoursInput + downtimeHoursInput > 0 ? ((downtimeHoursInput / (operatingHoursInput + downtimeHoursInput)) * 100).toFixed(1) : 0}%)
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex p-0.5">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-l-full transition-all duration-300"
                                style={{
                                  width: `${operatingHoursInput + downtimeHoursInput > 0 ? (operatingHoursInput / (operatingHoursInput + downtimeHoursInput)) * 100 : 100}%`,
                                }}
                              />
                              <div
                                className="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full transition-all duration-300"
                                style={{
                                  width: `${operatingHoursInput + downtimeHoursInput > 0 ? (downtimeHoursInput / (operatingHoursInput + downtimeHoursInput)) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Shift Downtime Drivers (7 Squircle Cards) */}
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${textPrimary}`}>
                            <span className="material-symbols-outlined text-amber-500 text-base">help</span>
                            <span>Why was the target not reached? (Select General Drivers)</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-[#002452] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                            {selectedReasons.length} driver(s) active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                          {[
                            {
                              key: 'EQUIPMENT_BREAKDOWN',
                              label: 'Equipment Breakdown / Downtime',
                              category: 'OPERATIONAL',
                              catClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
                              icon: 'precision_manufacturing',
                              gradient: 'from-rose-500 via-red-600 to-pink-700',
                              desc: 'Excavator hydraulic failure, dumper engine breakdown, or tire wear',
                            },
                            {
                              key: 'BLASTING_DELAY',
                              label: 'Blasting Delay & Detonation Lag',
                              category: 'GEOTECHNICAL',
                              catClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
                              icon: 'warning',
                              gradient: 'from-amber-400 via-orange-500 to-amber-700',
                              desc: 'DGMS safety clearance delays, flyrock buffering, or misfire clearing',
                            },
                            {
                              key: 'RAINFALL_INFLOW',
                              label: 'Monsoon Sump Inflow & Dewatering',
                              category: 'MONSOON',
                              catClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
                              icon: 'water_drop',
                              gradient: 'from-sky-400 via-blue-500 to-indigo-600',
                              desc: 'Pit sump flooding, ramp haul siltation, or pump capacity shortfall',
                            },
                            {
                              key: 'ORE_GRADE_VARIANCE',
                              label: 'Ore Grade Variance & Siltation',
                              category: 'METALLURGY',
                              catClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
                              icon: 'diamond',
                              gradient: 'from-emerald-400 via-teal-500 to-teal-700',
                              desc: 'Highwall grade heterogeneity, dilution, or low recovery blend',
                            },
                            {
                              key: 'HAUL_ROAD_CONGESTION',
                              label: 'Haul Road & Dumper Bottleneck',
                              category: 'LOGISTICS',
                              catClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
                              icon: 'local_shipping',
                              gradient: 'from-purple-500 via-violet-600 to-indigo-800',
                              desc: 'Siding queuing, ramp gradient bottlenecks, or haul fleet shortage',
                            },
                            {
                              key: 'POWER_OUTAGE',
                              label: 'Grid Power Interruption & Tripping',
                              category: 'UTILITIES',
                              catClass: 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/60',
                              icon: 'bolt',
                              gradient: 'from-pink-500 via-rose-600 to-rose-800',
                              desc: 'Feeder voltage drops, motor overload trips, or substation outages',
                            },
                            {
                              key: 'PLANT_CHOKE',
                              label: 'Screening Plant & Sizing Choke',
                              category: 'PROCESSING',
                              catClass: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60',
                              icon: 'filter_alt',
                              gradient: 'from-teal-400 via-cyan-500 to-blue-700',
                              desc: 'Grizzly screen blinding, hopper bridging, or crusher jamming',
                            },
                          ].map((item) => {
                            const isSelected = selectedReasons.includes(item.key);
                            return (
                              <div
                                key={item.key}
                                onClick={() => handleToggleReason(item.key)}
                                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 hover:shadow-md select-none ${
                                  isSelected
                                    ? 'bg-blue-50/70 dark:bg-[#1E2638] border-[#002452] dark:border-blue-500 shadow-xs ring-1 ring-[#002452] dark:ring-blue-500'
                                    : 'bg-white dark:bg-[#14171C] border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between mb-3">
                                    <div
                                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md relative overflow-hidden bg-gradient-to-br ${item.gradient}`}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-xl" />
                                      <span className="material-symbols-outlined text-xl drop-shadow-xs relative z-10">
                                        {item.icon}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.catClass}`}>
                                        {item.category}
                                      </span>
                                      <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                          isSelected
                                            ? 'bg-[#002452] dark:bg-blue-500 text-white'
                                            : 'border border-slate-400 text-transparent'
                                        }`}
                                      >
                                        ✓
                                      </div>
                                    </div>
                                  </div>

                                  <h4 className={`text-xs sm:text-sm font-bold leading-snug mb-1 ${
                                    isSelected ? 'text-[#002452] dark:text-blue-300 font-extrabold' : textPrimary
                                  }`}>
                                    {item.label}
                                  </h4>

                                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                    isDark ? 'text-slate-400' : 'text-slate-600 font-normal'
                                  }`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 4: Remarks */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMuted}`}>
                            Shift Manager Operational Remarks & Bench Log
                          </label>
                          <span className={`text-[10px] font-mono ${textMuted}`}>
                            Click preset tags to quickly append details
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          {[
                            'EX-04 Hydraulic Seal Leak',
                            'Pit Bench 3 Sump Flooding',
                            'Zone 14 Blasting Delay',
                            'Feeder 33kV Substation Trip',
                            'Dumper D-12 Brake Overhaul',
                          ].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setManagerRemarks((prev) => (prev ? `${prev} | ${tag}` : tag));
                              }}
                              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                isDark
                                  ? 'bg-[#14171C] border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>

                        <textarea
                          rows={2}
                          value={managerRemarks}
                          onChange={(e) => setManagerRemarks(e.target.value)}
                          placeholder="Specify affected pit bench, excavator serial number, or statutory clearance details..."
                          className={`w-full p-3 rounded-xl border text-xs font-medium transition-all ${
                            isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          } focus:outline-none focus:border-[#002452] dark:focus:border-blue-400`}
                        />
                      </div>

                      {/* Row 5: Section Navigation Bar */}
                      <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${borderDivider}`}>
                        <div className="flex items-center gap-2.5 text-xs font-semibold">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                          <span className={textMuted}>
                            Section 1 Ready • Proceed to Section 2 to log Blasting details & Delay histogram
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleLoadDefaults}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isDark ? 'bg-[#14171C] border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Reset Section 1
                          </button>

                          <button
                            type="button"
                            onClick={() => setShiftSection('BLASTING')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98"
                          >
                            <span>CONTINUE TO SECTION 2: BLASTING DETAILS</span>
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================================================= */}
                  {/* SECTION 2: BLASTING OPERATIONS & DELAY ROOT CAUSE ANALYTICS */}
                  {/* ================================================================= */}
                  {shiftSection === 'BLASTING' && (!hasRunDiagnosis || !isFormCollapsed) && (
                    <div className={`p-6 sm:p-7 rounded-2xl border-2 space-y-7 transition-all ${
                      isDark ? 'bg-[#151922] border-[#00387A]' : 'bg-white border-[#002452]/90 shadow-sm'
                    }`}>
                      {/* Part A: Blast Plan Timeline & Technical Telemetry */}
                      <div className="space-y-4">
                        <div className={`flex items-center justify-between border-b pb-2.5 ${borderDivider}`}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-xl">timer</span>
                            <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wide ${textPrimary}`}>
                              Part A: Blast Plan Timeline & Detonation Telemetry
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            Shot #{blastId}
                          </span>
                        </div>

                        {/* 4 Blast Operational Parameter Tiles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Card 1: Blast Pattern ID */}
                          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 text-white flex items-center justify-center shadow-xs shrink-0">
                              <span className="material-symbols-outlined text-xl">pin</span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                                BLAST PATTERN ID
                              </span>
                              <input
                                type="text"
                                value={blastId}
                                onChange={(e) => setBlastId(e.target.value)}
                                className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Card 2: Bench / Zone */}
                          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                              <span className="material-symbols-outlined text-xl">layers</span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                                TARGET BENCH / ZONE
                              </span>
                              <input
                                type="text"
                                value={blastBenchZone}
                                onChange={(e) => setBlastBenchZone(e.target.value)}
                                className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Card 3: Planned Time */}
                          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0">
                              <span className="material-symbols-outlined text-xl">alarm</span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                                PLANNED BLAST TIME
                              </span>
                              <input
                                type="time"
                                value={plannedBlastTime}
                                onChange={(e) => setPlannedBlastTime(e.target.value)}
                                className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Card 4: Actual Detonation Time */}
                          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                            blastDelayHours > 0
                              ? isDark ? 'bg-amber-950/25 border-amber-800/60' : 'bg-amber-50 border-amber-200'
                              : nestedBg
                          }`}>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 text-white flex items-center justify-center shadow-xs shrink-0">
                              <span className="material-symbols-outlined text-xl">electric_bolt</span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                  ACTUAL DETONATION
                                </span>
                                <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-500/15 px-1.5 py-0.5 rounded">
                                  +{blastDelayHours}h lag
                                </span>
                              </div>
                              <input
                                type="time"
                                value={actualDetonationTime}
                                onChange={(e) => setActualDetonationTime(e.target.value)}
                                className={`w-full p-1.5 rounded-lg border text-xs font-bold transition-all ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Blast Engineering Metric Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className={`p-3.5 rounded-xl border text-center ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>PLANNED / CHARGED HOLES</span>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={plannedHoles}
                                onChange={(e) => setPlannedHoles(Number(e.target.value))}
                                className={`w-14 p-1 rounded text-center font-headline font-black text-base border ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                              <span className="text-slate-400 font-black">/</span>
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={chargedHoles}
                                onChange={(e) => setChargedHoles(Number(e.target.value))}
                                className={`w-14 p-1 rounded text-center font-headline font-black text-base border ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
                                }`}
                              />
                            </div>
                            <span className={`text-[9px] font-mono block mt-1 ${textMuted}`}>100% Pattern Charged</span>
                          </div>

                          <div className={`p-3.5 rounded-xl border text-center ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>EXPLOSIVE MASS (KG)</span>
                            <input
                              type="number"
                              min="100"
                              max="10000"
                              step="100"
                              value={explosiveMassKg}
                              onChange={(e) => setExplosiveMassKg(Number(e.target.value))}
                              className={`w-full p-1 rounded text-center font-headline font-black text-base border mt-1 ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                            <span className={`text-[9px] font-mono block mt-1 ${textMuted}`}>ANFO / Emulsion Blend</span>
                          </div>

                          <div className={`p-3.5 rounded-xl border text-center ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>PREDICTED YIELD (TONS)</span>
                            <input
                              type="number"
                              min="500"
                              max="30000"
                              step="250"
                              value={predictedYieldTons}
                              onChange={(e) => setPredictedYieldTons(Number(e.target.value))}
                              className={`w-full p-1 rounded text-center font-headline font-black text-base border mt-1 ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
                              }`}
                            />
                            <span className={`text-[9px] font-mono block mt-1 ${textMuted}`}>Fragmented Ore Muckpile</span>
                          </div>

                          <div className={`p-3.5 rounded-xl border text-center ${nestedBg}`}>
                            <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>POWDER FACTOR (KG/T)</span>
                            <input
                              type="number"
                              min="0.1"
                              max="2.0"
                              step="0.01"
                              value={powderFactor}
                              onChange={(e) => setPowderFactor(Number(e.target.value))}
                              className={`w-full p-1 rounded text-center font-headline font-black text-base border mt-1 ${
                                isDark ? 'bg-[#14171C] border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-amber-700'
                              }`}
                            />
                            <span className={`text-[9px] font-mono block mt-1 ${textMuted}`}>Optimal Fragmentation Index</span>
                          </div>
                        </div>

                        {/* Chronological Blast Timeline Milestones Tracker */}
                        <div className={`p-4 rounded-xl border space-y-3 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${textPrimary}`}>
                              <span className="material-symbols-outlined text-sm text-blue-500">alt_route</span>
                              <span>Blast Execution Timeline Milestones</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold">
                              6 Milestone Checkpoints
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {blastMilestones.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => handleToggleMilestone(m.id)}
                                className={`p-2.5 rounded-lg border text-center space-y-1 transition-all cursor-pointer select-none hover:-translate-y-0.5 hover:shadow-xs ${
                                  m.status === 'DELAYED'
                                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                                    : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500'
                                }`}
                                title="Click to toggle between COMPLETED and DELAYED"
                              >
                                <span className="font-mono text-xs font-black block">{m.time}</span>
                                <span className={`text-[10px] font-bold block leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {m.name}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded block ${
                                  m.status === 'DELAYED' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Part B: Blasting Delay Issues & Root Causes Logging */}
                      <div className="space-y-4 pt-2">
                        <div className={`flex items-center justify-between border-b pb-2.5 ${borderDivider}`}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500 text-xl">warning</span>
                            <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wide ${textPrimary}`}>
                              Part B: Blasting Delay Issues & Root Cause Logging
                            </h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                            {selectedBlastingReasons.length} Delay Driver(s) Selected
                          </span>
                        </div>

                        {/* Blasting Delay Duration Input with Quick Presets */}
                        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${nestedBg}`}>
                          <div>
                            <label className={`text-xs font-black uppercase tracking-wider block ${textPrimary}`}>
                              Recorded Blasting Delay Stoppage (Hours)
                            </label>
                            <span className={`text-[11px] ${textSecondary}`}>
                              Impacts active loading window & daily muckpile fragmentation turnover
                            </span>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="12"
                                step="0.25"
                                value={blastDelayHours}
                                onChange={(e) => setBlastDelayHours(Number(e.target.value))}
                                className={`w-32 p-2 pr-10 rounded-xl border text-sm font-black transition-all ${
                                  isDark ? 'bg-[#14171C] border-slate-700 text-rose-400' : 'bg-white border-slate-300 text-rose-700'
                                } focus:outline-none focus:border-rose-500`}
                              />
                              <span className={`absolute right-3 top-2 text-xs font-mono font-bold ${textMuted}`}>hrs</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <button
                                type="button"
                                onClick={() => setBlastDelayHours(Math.max(0, Number((blastDelayHours - 0.5).toFixed(2))))}
                                className={`px-2 py-1 rounded-md border text-emerald-500 ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-white border-slate-300'} cursor-pointer`}
                              >
                                -0.5h
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlastDelayHours(Number((blastDelayHours + 0.5).toFixed(2)))}
                                className={`px-2 py-1 rounded-md border text-rose-500 ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-white border-slate-300'} cursor-pointer`}
                              >
                                +0.5h
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlastDelayHours(2.25)}
                                className={`px-2 py-1 rounded-md border text-slate-400 ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-white border-slate-300'} cursor-pointer`}
                              >
                                Default (2.25h)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 7 Blasting Delay Driver Squircle Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                          {[
                            {
                              key: 'DGMS_SAFETY_CLEARANCE',
                              label: 'DGMS & Safety Clearance Lag',
                              category: 'REGULATORY',
                              catClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
                              icon: 'policy',
                              gradient: 'from-amber-400 via-orange-500 to-amber-700',
                              desc: 'Statutory bench signoff lag, vibration monitoring setup, or inspector shift handover delay',
                            },
                            {
                              key: 'WET_HOLES_PUMPING',
                              label: 'Wet Drill Holes & Sump Inflow',
                              category: 'GEOTECHNICAL',
                              catClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
                              icon: 'water_drop',
                              gradient: 'from-sky-400 via-blue-500 to-indigo-600',
                              desc: 'Groundwater ingress in 8–12 blast holes required secondary submersible hole blowouts before charging',
                            },
                            {
                              key: 'EXPLOSIVE_LOGISTICS',
                              label: 'Explosive Van & PESO Dispatch',
                              category: 'LOGISTICS',
                              catClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
                              icon: 'local_shipping',
                              gradient: 'from-purple-500 via-violet-600 to-indigo-800',
                              desc: 'PESO compliance magazine delivery and booster cartridge convoy delayed in transit',
                            },
                            {
                              key: 'PERIMETER_EVACUATION',
                              label: 'Buffer Zone Haul Evacuation',
                              category: 'SAFETY BUFFER',
                              catClass: 'bg-pink-50 text-pink-800 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800/60',
                              icon: 'notifications_active',
                              gradient: 'from-pink-500 via-rose-600 to-red-700',
                              desc: '500m danger perimeter clearance lag due to public siding roadblocks and villager buffer sweep',
                            },
                            {
                              key: 'MISFIRE_DETONATION_LAG',
                              label: 'Shock Tube & Detonator Testing',
                              category: 'TECHNICAL',
                              catClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
                              icon: 'electrical_services',
                              gradient: 'from-rose-500 via-red-600 to-pink-700',
                              desc: 'Nonel shock tube circuit continuity test indicated discontinuity requiring booster re-priming',
                            },
                            {
                              key: 'LIGHTNING_WEATHER',
                              label: 'Lightning & Cloudburst Protocol',
                              category: 'ENVIRONMENTAL',
                              catClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
                              icon: 'thunderstorm',
                              gradient: 'from-teal-400 via-cyan-500 to-blue-700',
                              desc: 'Atmospheric electrical hazard sensor suspended charging operations under safety protocol',
                            },
                            {
                              key: 'DRILLING_BURDEN_DEFECT',
                              label: 'Drill Burden & Collar Deviation',
                              category: 'DRILLING',
                              catClass: 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800/60',
                              icon: 'construction',
                              gradient: 'from-slate-500 via-zinc-600 to-neutral-700',
                              desc: 'Overburden collar collapse and hole deviation required secondary rig re-drilling',
                            },
                          ].map((item) => {
                            const isSelected = selectedBlastingReasons.includes(item.key);
                            return (
                              <div
                                key={item.key}
                                onClick={() => handleToggleBlastingReason(item.key)}
                                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5 hover:shadow-md select-none ${
                                  isSelected
                                    ? 'bg-amber-50/70 dark:bg-[#2A2418] border-amber-500 shadow-xs ring-1 ring-amber-500'
                                    : 'bg-white dark:bg-[#14171C] border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between mb-3">
                                    <div
                                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md relative overflow-hidden bg-gradient-to-br ${item.gradient}`}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-xl" />
                                      <span className="material-symbols-outlined text-xl drop-shadow-xs relative z-10">
                                        {item.icon}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${item.catClass}`}>
                                        {item.category}
                                      </span>
                                      <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                          isSelected
                                            ? 'bg-amber-500 text-white'
                                            : 'border border-slate-400 text-transparent'
                                        }`}
                                      >
                                        ✓
                                      </div>
                                    </div>
                                  </div>

                                  <h4 className={`text-xs sm:text-sm font-bold leading-snug mb-1 ${
                                    isSelected ? 'text-amber-800 dark:text-amber-300 font-extrabold' : textPrimary
                                  }`}>
                                    {item.label}
                                  </h4>

                                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                                    isDark ? 'text-slate-400' : 'text-slate-600 font-normal'
                                  }`}>
                                    {item.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Blasting Remarks Input */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className={`text-[11px] font-bold uppercase tracking-wider block ${textMuted}`}>
                              Blasting In-Charge Remarks & DGMS Bench Audit Log
                            </label>
                            <span className={`text-[10px] font-mono ${textMuted}`}>
                              Click preset tags to append incident details
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                            {[
                              'DGMS Delayed Clearance Bench 3',
                              'Sump Water in 8 Holes',
                              'Haul Road Perimeter Delay',
                              'Lightning Static Safety Hold',
                              'PESO Delivery Convoy Lag',
                            ].map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  setBlastingRemarks((prev) => (prev ? `${prev} | ${tag}` : tag));
                                }}
                                className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  isDark
                                    ? 'bg-[#14171C] border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>

                          <textarea
                            rows={2}
                            value={blastingRemarks}
                            onChange={(e) => setBlastingRemarks(e.target.value)}
                            placeholder="Detail statutory clearance time, water pump blowouts, or detonation continuity testing..."
                            className={`w-full p-3 rounded-xl border text-xs font-medium transition-all ${
                              isDark ? 'bg-[#14171C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                            } focus:outline-none focus:border-[#002452] dark:focus:border-blue-400`}
                          />
                        </div>
                      </div>

                      {/* Part C: Blasting Delay Frequency & Downtime Histogram Chart */}
                      <div className={`p-5 rounded-2xl border space-y-4 ${nestedBg} border-slate-200 dark:border-slate-800`}>
                        <BlastingDelayHistogramEChart
                          themeMode={themeMode}
                          onSelectCategory={(key) => handleToggleBlastingReason(key)}
                        />
                      </div>

                      {/* Section 2 Action Bar */}
                      <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${borderDivider}`}>
                        <button
                          type="button"
                          onClick={() => setShiftSection('PRODUCTION')}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isDark ? 'bg-[#14171C] border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">arrow_back</span>
                          <span>Back to Section 1: Production Entry</span>
                        </button>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleLoadBlastingDefaults}
                            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isDark ? 'bg-[#14171C] border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Reset Section 2
                          </button>

                          <button
                            type="button"
                            onClick={handleRunDiagnosis}
                            disabled={isProcessingDiagnosis}
                            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                          >
                            {isProcessingDiagnosis ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>SYNTHESIZING SHORTFALL & BLAST SHAP...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-base">psychology</span>
                                <span>RUN AI SHORTFALL DIAGNOSIS</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. AI PROCESSING SIMULATION STATE (1-2 SECONDS) */}
                  {isProcessingDiagnosis && (
                    <div className={`p-8 rounded-2xl border text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 ${cardBg} border-[#0E7C7B]/50 shadow-lg`}>
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-[#0E7C7B]/20 border-t-[#0E7C7B] animate-spin" />
                        <span className="material-symbols-outlined text-2xl text-[#0E7C7B] animate-pulse">analytics</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className={`font-headline font-black text-lg uppercase tracking-wide ${textPrimary}`}>
                          CALCULATING SHORTFALL SHAP ATTRIBUTION
                        </h3>
                        <p className={`text-xs ${textSecondary}`}>
                          Correlating {operatingHoursInput}h operating time, {downtimeHoursInput}h downtime, and {selectedReasons.length} shortfall factors against baseline target...
                        </p>
                      </div>

                      {/* Multi-step progress tracker */}
                      <div className="max-w-md mx-auto space-y-2 text-xs">
                        <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#0E7C7B] to-emerald-400 h-full rounded-full transition-all duration-300"
                            style={{ width: processingStep === 1 ? '35%' : processingStep === 2 ? '75%' : '100%' }}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[10px] text-slate-400">
                          <span className={processingStep >= 1 ? 'text-emerald-400 font-bold' : ''}>1. Ingest Shift Telemetry</span>
                          <span className={processingStep >= 2 ? 'text-emerald-400 font-bold' : ''}>2. Compute SHAP Weights</span>
                          <span className={processingStep >= 3 ? 'text-emerald-400 font-bold' : ''}>3. Synthesize Gap</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DYNAMIC DIAGNOSTIC OUTPUT (APPEARS ONCE PROCESSED) */}
                  {hasRunDiagnosis && processedDiagnosis && !isProcessingDiagnosis && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
                      {/* Status Banner */}
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        processedDiagnosis.riskState === 'HIGH'
                          ? 'bg-[#B03A2E]/15 border-[#B03A2E]/50 text-[#B03A2E]'
                          : processedDiagnosis.riskState === 'MEDIUM'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-500'
                          : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-500'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-current animate-ping shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-black text-sm uppercase tracking-wider">
                                EVALUATED STATE: {processedDiagnosis.riskLabel}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 font-bold">
                                {processedDiagnosis.shiftType.replace('_', ' ')}
                              </span>
                            </div>
                            <span className={`text-[11px] font-medium block mt-0.5 ${textSecondary}`}>
                              Evaluated for {mineProfile?.mineName} on {processedDiagnosis.shiftDate} at {processedDiagnosis.evaluatedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsFormCollapsed(false)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
                          >
                            ✎ Adjust Shift Inputs
                          </button>
                        </div>
                      </div>

                      {/* 4 Quantitative KPI Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
                          <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>PLANNED TARGET</span>
                          <span className="font-headline font-black text-2xl text-blue-600 block mt-1">
                            {processedDiagnosis.target.toLocaleString()} t
                          </span>
                          <span className={`text-[10px] font-mono ${textMuted}`}>Model Benchmark</span>
                        </div>

                        <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
                          <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>ACTUAL OUTPUT</span>
                          <span className={`font-headline font-black text-2xl block mt-1 ${textPrimary}`}>
                            {processedDiagnosis.actual.toLocaleString()} t
                          </span>
                          <span className={`text-[10px] font-mono ${textMuted}`}>Logged for Shift</span>
                        </div>

                        <div className={`p-4 rounded-xl border text-center ${
                          processedDiagnosis.gap < 0 ? 'bg-[#B03A2E]/10 border-[#B03A2E]/40' : 'bg-emerald-500/10 border-emerald-500/40'
                        }`}>
                          <span className={`text-[10px] font-bold uppercase block ${
                            processedDiagnosis.gap < 0 ? 'text-[#B03A2E]' : 'text-emerald-500'
                          }`}>
                            PROJECTED DEFICIT
                          </span>
                          <span className={`font-headline font-black text-2xl block mt-1 ${
                            processedDiagnosis.gap < 0 ? 'text-[#B03A2E]' : 'text-emerald-500'
                          }`}>
                            {processedDiagnosis.gap >= 0 ? '+' : ''}{processedDiagnosis.gap.toLocaleString()} t
                          </span>
                          <span className="text-[10px] font-mono font-bold block">
                            {processedDiagnosis.gapPct}% variance
                          </span>
                        </div>

                        <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
                          <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>OPERATING EFFICIENCY</span>
                          <span className={`font-headline font-black text-2xl block mt-1 ${
                            processedDiagnosis.efficiencyPct >= 85 ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {processedDiagnosis.efficiencyPct}%
                          </span>
                          <span className={`text-[10px] font-mono ${textMuted}`}>
                            {processedDiagnosis.operatingHours}h Run / {processedDiagnosis.downtimeHours}h Down
                          </span>
                        </div>
                      </div>

                      {/* RISK SUMMARY & GAP VISUAL */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Evaluated Risk Profile Card */}
                        <div className={`lg:col-span-5 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                          isDark ? 'bg-[#20242D] border-[#B03A2E]/50' : 'bg-white border-[#B03A2E]/40 shadow-sm'
                        }`}>
                          <div className="space-y-4">
                            <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                              <span className={`text-xs font-headline font-black uppercase tracking-wider ${textMuted}`}>
                                EVALUATED SHIFT RISK PROFILE
                              </span>
                              <span className="text-[10px] font-mono text-[#B03A2E] font-bold">ACTIVE TRIGGER</span>
                            </div>

                            <div className="p-5 rounded-xl bg-[#B03A2E]/20 border border-[#B03A2E] flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-black text-[#B03A2E] uppercase tracking-widest block">
                                  EVALUATED STATE
                                </span>
                                <span className="font-headline text-3xl font-black text-[#B03A2E] block mt-0.5">
                                  {processedDiagnosis.riskState} RISK
                                </span>
                                <span className={`text-xs font-bold block mt-0.5 ${textPrimary}`}>
                                  Affected: {mineProfile?.potentialSourceZone || 'Zone 14 (South Extension)'}
                                </span>
                              </div>
                              <span className="w-4 h-4 rounded-full bg-[#B03A2E] animate-ping" />
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between font-bold">
                                <span className={textMuted}>Logged Remarks:</span>
                              </div>
                              <p className={`p-3 rounded-lg border text-xs italic ${nestedBg} ${textSecondary}`}>
                                "{managerRemarks || 'Shift operations recorded with equipment downtime.'}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Gap to Target Visualization */}
                        <div className={`lg:col-span-7 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${cardBg}`}>
                          <div className="space-y-4">
                            <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                              <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                                <span className="material-symbols-outlined text-[#B03A2E] text-base">straighten</span>
                                GAP TO TARGET VISUALIZATION
                              </h3>
                              <span className={`text-[10px] font-mono ${textMuted}`}>QUANTITATIVE DEFICIT</span>
                            </div>

                            <p className={`text-sm font-semibold ${textSecondary}`}>
                              "Production is projected to finish <strong>{Math.abs(processedDiagnosis.gap).toLocaleString()} t</strong> below the current target."
                            </p>

                            <div className="space-y-4 pt-2">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-blue-600">PLANNED TARGET</span>
                                  <span className="font-mono text-blue-600">
                                    {processedDiagnosis.target.toLocaleString()} t (100%)
                                  </span>
                                </div>
                                <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                                  <div className="h-full bg-blue-600 rounded-md" style={{ width: '100%' }} />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className={textPrimary}>ACTUAL SHIFT OUTPUT</span>
                                  <span className={`font-mono ${textPrimary}`}>
                                    {processedDiagnosis.actual.toLocaleString()} t ({Math.min(100, Math.round((processedDiagnosis.actual / processedDiagnosis.target) * 100))}%)
                                  </span>
                                </div>
                                <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 flex ${nestedBg}`}>
                                  <div
                                    className="h-full bg-[#0E7C7B] rounded-l-md transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round((processedDiagnosis.actual / processedDiagnosis.target) * 100))}%` }}
                                  />
                                  {processedDiagnosis.gap < 0 && (
                                    <div
                                      className="h-full bg-[#B03A2E] rounded-r-md animate-pulse transition-all duration-500"
                                      style={{ width: `${Math.min(100, processedDiagnosis.gapPct)}%` }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CAUSE CONTRIBUTION SHAP (Dynamic Feature Importance) */}
                      <div className={`p-6 rounded-xl border space-y-5 ${cardBg}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                            <span className="material-symbols-outlined text-[#B03A2E]">align_horizontal_left</span>
                            CAUSE CONTRIBUTION (SHAP FEATURE IMPORTANCE)
                          </h3>
                          <span className={`text-[11px] font-mono ${textMuted}`}>
                            Dynamic attribution calibrated on logged downtime & drivers
                          </span>
                        </div>

                        <div className="space-y-4 pt-1">
                          {processedDiagnosis.shapContributions.map((item) => (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className={`uppercase tracking-wider ${textPrimary}`}>{item.label}</span>
                                <span className="font-mono font-black text-sm" style={{ color: item.color }}>
                                  {item.pct}% CONTRIBUTION
                                </span>
                              </div>
                              <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                                <div
                                  className="h-full rounded-md transition-all duration-500"
                                  style={{ width: `${item.pct}%`, background: item.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CAUSE DETAILS & GAP CLOSURE CONDITIONS */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className={`lg:col-span-8 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                          <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                            CAUSE EXPLANATIONS & OPERATIONAL IMPACT
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {processedDiagnosis.shapContributions.map((item) => (
                              <div key={item.label} className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                                <div className="flex justify-between items-center font-bold">
                                  <span className={textPrimary}>{item.label}</span>
                                  <span style={{ color: item.color }}>{item.pct}% IMPACT</span>
                                </div>
                                <p className={textSecondary}>&ldquo;{item.desc}&rdquo;</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`lg:col-span-4 p-6 rounded-xl border space-y-3 ${cardBg}`}>
                          <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                            GAP CLOSURE CONDITIONS
                          </h3>
                          <div className="space-y-3 text-xs">
                            {processedDiagnosis.closureConditions.map((cond) => (
                              <div key={cond.title} className={`p-3.5 rounded-xl border ${nestedBg}`}>
                                <span className={`text-[10px] uppercase block font-bold ${textMuted}`}>{cond.title}</span>
                                <span className="font-headline font-black text-base text-emerald-500 block mt-0.5">
                                  {cond.target}
                                </span>
                                <p className={`text-[11px] mt-1 ${textSecondary}`}>{cond.desc}</p>
                              </div>
                            ))}

                            <button
                              onClick={() => setActiveTab('corrective-actions')}
                              className="w-full py-2.5 rounded-lg bg-[#002452] hover:bg-[#00387A] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                            >
                              <span>JUMP TO CORRECTIVE ACTIONS</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CORRECTIVE ACTIONS TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'corrective-actions' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`font-headline font-black text-2xl uppercase tracking-tight flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-2xl">checklist</span>
                      CORRECTIVE ACTIONS
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-[#B03A2E]/20 border border-[#B03A2E] text-[#B03A2E] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B03A2E] animate-pulse" />
                      <span>● HIGH RISK • Zone 14</span>
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>“Recommended operational actions to reduce the projected production shortfall.”</p>
                </div>
              </div>

              {/* ALERT ACKNOWLEDGEMENT CONTEXT STRIP */}
              <div className="p-3.5 rounded-xl bg-[#B03A2E]/15 border border-[#B03A2E]/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03A2E] animate-ping shrink-0" />
                  <span className="text-xs font-black text-[#B03A2E] uppercase tracking-wider">🔴 HIGH-RISK ALERT ACTIVE</span>
                  <span className={`text-xs font-medium ${textSecondary}`}>“MOIL stakeholders have been notified of projected shortfall.”</span>
                </div>
                <button onClick={() => setActiveTab('alerts')} className="px-3 py-1 rounded bg-[#B03A2E] hover:bg-[#8F2E24] text-white text-[11px] font-bold uppercase transition-all shrink-0 cursor-pointer">
                  View Alert →
                </button>
              </div>

              {/* SHORTFALL CONTEXT BAR */}
              <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${nestedBg}`}>
                <div className="flex items-center gap-6 text-xs font-bold flex-wrap">
                  <div><span className={`uppercase block text-[10px] ${textMuted}`}>CURRENT FORECAST</span><span className={`font-headline font-black text-lg ${textPrimary}`}>4,100 t</span></div>
                  <div className={`h-6 w-px ${borderDivider}`} />
                  <div><span className={`uppercase block text-[10px] ${textMuted}`}>TARGET</span><span className="font-headline font-black text-lg text-blue-600">5,000 t</span></div>
                  <div className={`h-6 w-px ${borderDivider}`} />
                  <div><span className="text-[#B03A2E] uppercase block text-[10px]">PROJECTED GAP</span><span className="font-headline font-black text-lg text-[#B03A2E]">-900 t</span></div>
                  <div className={`h-6 w-px ${borderDivider}`} />
                  <div><span className="text-[#B03A2E] uppercase block text-[10px]">EVALUATED RISK</span><span className="px-2 py-0.5 rounded bg-[#B03A2E] text-white text-[10px] font-black uppercase">🔴 HIGH</span></div>
                </div>
                <span className={`text-[11px] italic ${textMuted}`}>“Actions below are generated from the current shortfall diagnosis.”</span>
              </div>

              {/* RECOMMENDED ACTIONS & PRIORITY SUMMARY GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 space-y-4">
                  {actions.map((act) => {
                    const isExpanded = expandedActionId === act.id;
                    return (
                      <div key={act.id} className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${act.priority === 'HIGH' ? 'bg-[#B03A2E]/20 text-[#B03A2E]' : 'bg-[#D97706]/20 text-[#D97706]'}`}>{act.priority} PRIORITY</span>
                            <h4 className={`font-headline font-black text-lg uppercase ${textPrimary}`}>{act.title}</h4>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-black uppercase text-[#D97706] border border-[#D97706]/40">● {act.status}</span>
                        </div>
                        <p className={`text-xs font-medium ${textSecondary}`}>Problem: {act.problem}</p>
                        <div className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-bold ${nestedBg}`}>
                          <span>Current: <strong className={textPrimary}>{act.currentValue}</strong> → Target: <strong className="text-emerald-500">{act.targetValue}</strong></span>
                          <span className={`text-[11px] font-mono ${textMuted}`}>Impact: {act.expectedImpact}</span>
                        </div>
                        <div className={`flex items-center justify-between pt-2 border-t ${borderDivider}`}>
                          <button onClick={() => handleToggleActionStatus(act.id)} className="px-4 py-2 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6A69] text-white text-xs font-black uppercase cursor-pointer transition-all shadow-sm">[ MARK AS ACTIONED ]</button>
                          <button onClick={() => setExpandedActionId(isExpanded ? null : act.id)} className="text-xs text-[#0E7C7B] font-bold hover:underline cursor-pointer">{isExpanded ? 'Hide Details ▲' : 'View Details ▼'}</button>
                        </div>
                        {isExpanded && (
                          <div className={`p-4 rounded-lg border space-y-2 text-xs ${nestedBg}`}>
                            <p><strong className={textPrimary}>Cause:</strong> {act.cause}</p>
                            <p><strong className={textPrimary}>Reason:</strong> "{act.reason}"</p>
                            <p><strong className={textPrimary}>Created:</strong> {act.createdTime}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className={`lg:col-span-4 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>ACTION PRIORITY SUMMARY</h3>
                  <div className="space-y-2 text-xs font-bold">
                    <div className={`flex justify-between py-1 border-b ${borderDivider}`}><span className="text-[#B03A2E]">HIGH PRIORITY:</span><span className={textPrimary}>{highPriorityCount}</span></div>
                    <div className={`flex justify-between py-1 border-b ${borderDivider}`}><span className="text-[#D97706]">MEDIUM PRIORITY:</span><span className={textPrimary}>{mediumPriorityCount}</span></div>
                    <div className={`flex justify-between py-1 border-b ${borderDivider}`}><span className="text-emerald-500">COMPLETED:</span><span className="text-emerald-500">{completedCount}</span></div>
                    <div className="flex justify-between py-1"><span className={textMuted}>IN PROGRESS:</span><span className="text-[#0E7C7B]">{actionedCount}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ALERTS TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* 1. PAGE HEADER & STATUS INDICATOR */}
              <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`font-headline font-black text-2xl uppercase tracking-tight flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#B03A2E] text-2xl">notifications</span>
                      ALERTS
                    </h2>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>● ALERT MONITORING ACTIVE</span>
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>
                    "Automated shortfall and risk notifications across mine operations." 
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer ${nestedBg} ${textPrimary}`}>
                    <span>{mineProfile.mineName} ▾</span>
                  </button>
                </div>
              </div>

              {/* 2. ALERT SUMMARY CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border space-y-1 ${cardBg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>ACTIVE ALERTS</span>
                  <span className={`font-headline font-black text-3xl block ${textPrimary}`}>2</span>
                  <span className={`text-[10px] font-semibold block ${textMuted}`}>Currently unresolved</span>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-[#20242D] border-[#B03A2E]/50' : 'bg-white border-[#B03A2E]/50 shadow-sm'}`}>
                  <span className="text-[10px] font-bold text-[#B03A2E] uppercase tracking-wider block">HIGH RISK</span>
                  <span className="font-headline font-black text-3xl text-[#B03A2E] block">1</span>
                  <span className="text-[10px] font-bold text-[#B03A2E] block">Requires acknowledgement</span>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-[#20242D] border-[#D97706]/40' : 'bg-white border-[#D97706]/40 shadow-sm'}`}>
                  <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider block">MEDIUM RISK</span>
                  <span className="font-headline font-black text-3xl text-[#D97706] block">1</span>
                  <span className="text-[10px] font-bold text-[#D97706] block">Monitoring</span>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${cardBg}`}>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">ACKNOWLEDGED</span>
                  <span className={`font-headline font-black text-3xl block ${textPrimary}`}>4</span>
                  <span className={`text-[10px] font-semibold block ${textMuted}`}>Today</span>
                </div>
              </div>

              {/* 8 & 9. TAB TOGGLE (ACTIVE vs HISTORY) & COMPACT FILTERS */}
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3 ${borderDivider}`}>
                <div className={`flex items-center p-1 rounded-lg border ${nestedBg}`}>
                  <button
                    onClick={() => setAlertSubTab('ACTIVE')}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      alertSubTab === 'ACTIVE' ? 'bg-[#0E7C7B] text-white shadow-sm' : `${textMuted} hover:${textPrimary}`
                    }`}
                  >
                    ACTIVE ALERTS
                  </button>
                  <button
                    onClick={() => setAlertSubTab('HISTORY')}
                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      alertSubTab === 'HISTORY' ? 'bg-[#0E7C7B] text-white shadow-sm' : `${textMuted} hover:${textPrimary}`
                    }`}
                  >
                    ALERT HISTORY
                  </button>
                </div>

                {alertSubTab === 'ACTIVE' && (
                  <div className="flex items-center gap-2.5 text-xs flex-wrap">
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value as 'ALL' | 'HIGH' | 'MEDIUM')}
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${nestedBg} ${textPrimary}`}
                    >
                      <option value="ALL">Risk: All</option>
                      <option value="HIGH">Risk: High</option>
                      <option value="MEDIUM">Risk: Medium</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'UNACKNOWLEDGED' | 'ACKNOWLEDGED')}
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${nestedBg} ${textPrimary}`}
                    >
                      <option value="ALL">Status: All</option>
                      <option value="UNACKNOWLEDGED">Unacknowledged</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ACTIVE ALERTS VIEW */}
              {alertSubTab === 'ACTIVE' && (
                <div className="space-y-4">
                  {filteredAlerts.map((alt) => {
                    const isExpanded = expandedAlertId === alt.id;
                    const isHigh = alt.risk === 'HIGH';

                    return (
                      <div
                        key={alt.id}
                        className={`p-6 rounded-xl border space-y-4 transition-all ${
                          isDark
                            ? isHigh
                              ? 'bg-[#20242D] border-[#B03A2E]/50'
                              : 'bg-[#20242D] border-[#D97706]/40'
                            : isHigh
                              ? 'bg-white border-[#B03A2E]/50 shadow-sm'
                              : 'bg-white border-[#D97706]/40 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                isHigh
                                  ? 'bg-[#B03A2E] text-white shadow-sm'
                                  : 'bg-[#D97706] text-white'
                              }`}
                            >
                              <span>{isHigh ? '🔴' : '🟡'} {alt.risk} RISK</span>
                            </span>

                            <div>
                              <span className={`font-headline font-black text-lg uppercase block ${textPrimary}`}>
                                {alt.title}
                              </span>
                              <span className="text-[11px] font-mono text-[#D97706] font-bold">
                                {alt.zone} • {mineProfile.mineName}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5 ${
                                alt.status === 'UNACKNOWLEDGED'
                                  ? 'bg-[#B03A2E]/20 text-[#B03A2E] border border-[#B03A2E]/40'
                                  : alt.status === 'ACKNOWLEDGED'
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                                  : 'bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/40'
                              }`}
                            >
                              <span>
                                {alt.status === 'UNACKNOWLEDGED'
                                  ? '● UNACKNOWLEDGED'
                                  : alt.status === 'ACKNOWLEDGED'
                                  ? '✓ ACKNOWLEDGED'
                                  : '● MONITORING'}
                              </span>
                            </span>
                            {alt.acknowledgedBy && (
                              <span className={`text-[10px] block mt-1 font-mono ${textMuted}`}>
                                By {alt.acknowledgedBy} at {alt.acknowledgedTime}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs font-medium ${textSecondary}`}>
                          {alt.description}
                        </p>

                        <div className={`p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-4 text-xs font-bold ${nestedBg}`}>
                          <div><span className={textMuted}>FORECAST:</span> <strong className={textPrimary}>{alt.forecast}</strong></div>
                          <div><span className={textMuted}>TARGET:</span> <strong className="text-blue-600">{alt.target}</strong></div>
                          <div><span className="text-[#B03A2E]">GAP:</span> <strong className="text-[#B03A2E]">{alt.gap}</strong></div>
                          <div><span className={textMuted}>GENERATED:</span> <strong className={textSecondary}>{alt.generatedTime}</strong></div>
                        </div>

                        <div className={`flex items-center justify-between pt-2 border-t flex-wrap gap-3 ${borderDivider}`}>
                          <div className="flex items-center gap-3">
                            {alt.status === 'UNACKNOWLEDGED' ? (
                              <button
                                onClick={() => handleAcknowledgeAlert(alt.id)}
                                className="px-4 py-2 rounded-lg bg-[#B03A2E] hover:bg-[#8F2E24] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                              >
                                [ ACKNOWLEDGE ALERT ]
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>Human Acknowledgement Recorded</span>
                              </span>
                            )}

                            <button
                              onClick={() => setActiveTab('shortfall-diagnosis')}
                              className={`px-3.5 py-2 rounded-lg border text-xs font-bold uppercase transition-all cursor-pointer ${nestedBg} ${textPrimary}`}
                            >
                              [ VIEW DIAGNOSIS → ]
                            </button>
                          </div>

                          <button
                            onClick={() => setExpandedAlertId(isExpanded ? null : alt.id)}
                            className="text-xs text-[#0E7C7B] font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Details ▲' : 'View Alert Details & Audit Timeline ▼'}</span>
                          </button>
                        </div>

                        {isExpanded && (
                          <div className={`p-4 rounded-lg border space-y-4 text-xs animate-in fade-in duration-200 ${nestedBg}`}>
                            <div className={`font-headline font-black text-xs text-[#0E7C7B] uppercase tracking-wider border-b pb-2 ${borderDivider}`}>
                              ALERT DETAILS & DELIVERY TRAIL
                            </div>

                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium ${textSecondary}`}>
                              <div><strong className={textPrimary}>Alert ID:</strong> {alt.alertId}</div>
                              <div><strong className={textPrimary}>Trigger:</strong> Production forecast crossed High-risk threshold</div>
                              <div><strong className={textPrimary}>Recipients:</strong> {alt.recipients.join(', ')}</div>
                              <div><strong className={textPrimary}>Delivery Status:</strong> ✓ Sent (Automated)</div>
                            </div>

                            <div className={`space-y-2 pt-2 border-t ${borderDivider}`}>
                              <span className={`font-bold uppercase text-[10px] block ${textPrimary}`}>AUDIT TIMELINE:</span>
                              <div className="space-y-1.5 font-mono text-[11px]">
                                <div className={`flex items-center gap-2 ${textMuted}`}>
                                  <span className="text-[#0E7C7B]">09:14</span>
                                  <span>High-risk threshold crossed by ML forecast model</span>
                                </div>
                                <div className={`flex items-center gap-2 ${textMuted}`}>
                                  <span className="text-[#0E7C7B]">09:14</span>
                                  <span>Alert MOIL-DB-014 automatically generated</span>
                                </div>
                                <div className={`flex items-center gap-2 ${textMuted}`}>
                                  <span className="text-[#0E7C7B]">09:14</span>
                                  <span>Notification payload delivered to stakeholders</span>
                                </div>
                                {alt.status === 'ACKNOWLEDGED' && (
                                  <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                    <span>09:18</span>
                                    <span>Acknowledged by Mine Officer</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8. ALERT HISTORY TABLE */}
              {alertSubTab === 'HISTORY' && (
                <div className={`p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-[#0E7C7B]">history</span>
                    HISTORICAL ALERT AUDIT LOG
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className={`border-b uppercase ${borderDivider} ${textMuted}`}>
                          <th className="py-2.5 px-3">Date/Time</th>
                          <th className="py-2.5 px-3">Risk</th>
                          <th className="py-2.5 px-3">Mine / Zone</th>
                          <th className="py-2.5 px-3">Alert Title</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Acknowledged By</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${borderDivider} ${textSecondary}`}>
                        {alertHistoryLog.map((log, idx) => (
                          <tr key={idx} className={isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}>
                            <td className={`py-2.5 px-3 font-bold ${textPrimary}`}>{log.time}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${log.risk === 'HIGH' ? 'bg-[#B03A2E] text-white' : 'bg-[#D97706] text-white'}`}>
                                {log.risk}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">{log.zone}</td>
                            <td className={`py-2.5 px-3 font-bold ${textPrimary}`}>{log.title}</td>
                            <td className="py-2.5 px-3 text-emerald-500">{log.status}</td>
                            <td className={`py-2.5 px-3 ${textMuted}`}>{log.by}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 10 & 11. ALERT AUTOMATION & CURRENT ALERT THRESHOLDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className={`p-5 rounded-xl border space-y-3 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${borderDivider}`}>
                    <h4 className={`font-headline font-black text-xs uppercase flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-base">smart_toy</span>
                      ALERT AUTOMATION ENGINE
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono text-[10px] font-bold">
                      â—● ACTIVE
                    </span>
                  </div>
                  <div className={`space-y-1.5 text-xs font-medium ${textSecondary}`}>
                    <div className="flex justify-between"><span>Forecast Monitoring:</span><strong className="text-emerald-500">Active</strong></div>
                    <div className="flex justify-between"><span>Threshold Monitoring:</span><strong className="text-emerald-500">Active</strong></div>
                    <div className="flex justify-between"><span>Last Alert Triggered:</span><strong className={`font-mono ${textPrimary}`}>09:14 Today</strong></div>
                  </div>
                </div>

                <div className={`p-5 rounded-xl border space-y-3 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${borderDivider}`}>
                    <h4 className={`font-headline font-black text-xs uppercase flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#D97706] text-base">tune</span>
                      CURRENT ALERT THRESHOLDS
                    </h4>
                    <button
                      onClick={() => alert('Threshold configuration interface is restricted to Administrator role.')}
                      className="text-[10px] text-[#0E7C7B] font-bold hover:underline cursor-pointer"
                    >
                      [ Configure thresholds → ]
                    </button>
                  </div>
                  <div className={`space-y-1.5 text-xs font-medium ${textSecondary}`}>
                    <div className="flex justify-between"><span>Medium Risk Threshold:</span><strong className="text-[#D97706]">10% below target</strong></div>
                    <div className="flex justify-between"><span>High Risk Threshold:</span><strong className="text-[#B03A2E]">20% below target</strong></div>
                    <div className={`text-[10px] italic pt-0.5 ${textMuted}`}>Automated push triggers when ML forecast crosses High Risk boundary.</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: PORTFOLIO OVERVIEW TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'portfolio-view' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <PortfolioView
                isDark={isDark}
                onOpenMine={(mineId) => {
                  setSelectedMineId(mineId);
                  setActiveTab('overview');
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: CUSTOMER SUPPLY VIEW TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'customer-view' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <CustomerView
                isDark={isDark}
                onNavigateTab={(tab) => setActiveTab(tab as OverviewTab)}
              />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
