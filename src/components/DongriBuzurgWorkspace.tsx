import React, { useState, useEffect } from 'react';
import { type PortalRoute } from './Navbar';
import { fetchLiveMineWeather, type LiveWeatherData } from '../services/weatherService';
import { ProductionForecastEChart } from './ProductionForecastEChart';
import { FeatureImportanceEChart } from './FeatureImportanceEChart';
import { MineSiteVisualizer } from './MineSiteVisualizer';
import { PortfolioView } from './PortfolioView';
import { ShaderCard } from './ui/ShaderCard';
import Beams from './ui/Beams';
import { GlowCard } from './ui/spotlight-card';
import FeatureCard from './ui/binaural-glow-feature-card';
import { ThemeToggleSwitch } from './ui/ThemeToggleSwitch';
import { CustomerView } from './CustomerView';
import {
  getMineProductionProfile,
  MINE_PRODUCTION_PROFILES,
} from '../data/mineProductionData';

interface DongriBuzurgWorkspaceProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export type OverviewTab =
  | 'overview'
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

export const DongriBuzurgWorkspace: React.FC<DongriBuzurgWorkspaceProps> = ({
  onNavigate,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMineDropdownOpen, setIsMineDropdownOpen] = useState<boolean>(false);

  // Multi-Mine State (Defaults to Dongri Buzurg)
  const [selectedMineId, setSelectedMineId] = useState<string>('dongri-buzurg');
  const mineProfile = getMineProductionProfile(selectedMineId);

  // Shortfall Diagnosis View Toggle State
  const [diagnosisViewMode, setDiagnosisViewMode] = useState<'SUMMARY' | 'CAUSE_ANALYSIS'>('SUMMARY');

  // Real-time OpenWeather Stream State
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    const lat = selectedMineId === 'balaghat' ? 21.870 : selectedMineId === 'tirodi' ? 21.680 : 21.554;
    const lng = selectedMineId === 'balaghat' ? 80.185 : selectedMineId === 'tirodi' ? 79.720 : 79.702;
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

  // Reusable Theme Helper Classes
  const cardBg = isDark ? 'bg-[#20242D] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const nestedBg = isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200';

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
            onClick={() => onNavigate('reserve-mapping')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            title="Open National Geospatial Reserve Mapping"
          >
            <span>🗺️</span>
            <span>National Reserve Map</span>
          </button>

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
                { id: 'production-forecast', label: 'Production & Forecast', icon: 'trending_up' },
                { id: 'shortfall-diagnosis', label: 'Shortfall Diagnosis', icon: 'analytics' },
                { id: 'corrective-actions', label: 'Corrective Actions', icon: 'checklist' },
                { id: 'alerts', label: 'Alerts', icon: 'notifications' },
              ].map((item) => {
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

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* 2. PORTFOLIO SECTION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  PORTFOLIO
                </div>
              )}
              {[
                { id: 'portfolio-view', label: 'Portfolio View', icon: 'grid_view' },
              ].map((item) => {
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

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* 3. CUSTOMER SECTION */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  CUSTOMER
                </div>
              )}
              {[
                { id: 'customer-view', label: 'Customer View', icon: 'factory' },
              ].map((item) => {
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
                  beamNumber={18}
                  lightColor="#FFC107"
                  beamColor="#185a9d"
                  backgroundColor="#020914"
                  speed={2.2}
                  noiseIntensity={1.8}
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
                        “{mineProfile.mineName} is an active {mineProfile.type.toLowerCase()} manganese ore lease in {mineProfile.district} district, {mineProfile.state}, producing metallurgical and high-grade battery oxide ores.”
                      </p>
                    </div>
                  </div>

                  {/* MINE INTELLIGENCE VIEW (TERRAIN, SATELLITE, INTELLIGENCE) */}
                  <MineSiteVisualizer mineId={selectedMineId} themeMode={themeMode} />
                </div>

                {/* CURRENT STATUS CARD (5 COLS) WITH ELEGANT BINAURAL GLOW EFFECT */}
                <FeatureCard
                  glowColors="from-amber-500/70 via-blue-600/50 via-teal-500/60 to-amber-500/70"
                  className="lg:col-span-5 h-full"
                >
                  <div className="flex flex-col justify-between h-full space-y-5">
                    <div className="space-y-4">
                      <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                        <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                          <span className="material-symbols-outlined text-[#D97706] text-base">verified</span>
                          CURRENT STATUS
                        </h2>
                        <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase tracking-wider">
                          ACTIVE MONITORING
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-extrabold text-[#D97706] uppercase tracking-wider block">
                            RISK ASSESSMENT STATE
                          </span>
                          <span className="font-headline text-3xl font-black text-[#D97706] block mt-0.5">
                            MEDIUM RISK
                          </span>
                        </div>
                        <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] animate-pulse shrink-0" />
                      </div>

                      <p className={`text-sm leading-relaxed font-semibold ${textSecondary}`}>
                        “Production is currently being monitored against the monthly target.”
                      </p>

                      <div className={`space-y-2.5 pt-1 border-t text-xs font-bold ${borderDivider} ${textSecondary}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Production Monitoring Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Forecast Monitoring Active</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('shortfall-diagnosis')}
                      className={`w-full py-2.5 rounded-xl border border-[#D97706]/30 text-[#D97706] hover:bg-[#D97706]/15 hover:text-[#FEA619] text-xs font-extrabold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${nestedBg}`}
                    >
                      <span>View shortfall diagnosis</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </FeatureCard>
              </div>

              {/* KEY PERFORMANCE INDICATORS */}
              <div className="space-y-3">
                <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#0E7C7B] text-base">bar_chart</span>
                  KEY PERFORMANCE INDICATORS
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* CARD 1: CURRENT PRODUCTION (EMERALD GREEN GLOW) */}
                  <GlowCard 
                    glowColor="green" 
                    customSize={true} 
                    className="relative p-5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-4 overflow-hidden shadow-xl"
                    style={{
                      background: 'radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.30) 0%, rgba(12, 20, 29, 0.95) 75%)',
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">CURRENT PRODUCTION</span>
                      <span className="material-symbols-outlined text-lg text-emerald-400">trending_up</span>
                    </div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-white block relative z-10 drop-shadow-md">
                      4,100 t
                    </span>
                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-400">82% of target</span>
                        <span className="font-mono text-slate-400">4,100 / 5,000 t</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800/80 border border-white/10">
                        <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: '82%' }} />
                      </div>
                    </div>
                  </GlowCard>

                  {/* CARD 2: TARGET (BLUE GLOW) */}
                  <GlowCard 
                    glowColor="blue" 
                    customSize={true} 
                    className="relative p-5 rounded-2xl border border-blue-500/30 flex flex-col justify-between space-y-4 overflow-hidden shadow-xl"
                    style={{
                      background: 'radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.30) 0%, rgba(12, 20, 29, 0.95) 75%)',
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">TARGET</span>
                      <span className="material-symbols-outlined text-lg text-blue-400">flag</span>
                    </div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-blue-400 block relative z-10 drop-shadow-md">
                      5,000 t
                    </span>
                    <span className="text-xs font-semibold text-slate-300 block relative z-10">
                      Current month allocation
                    </span>
                  </GlowCard>

                  {/* CARD 3: PROSPECTIVITY (AMBER GOLD GLOW) */}
                  <GlowCard 
                    glowColor="orange" 
                    customSize={true} 
                    className="relative p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-4 overflow-hidden shadow-xl"
                    style={{
                      background: 'radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.30) 0%, rgba(12, 20, 29, 0.95) 75%)',
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">PROSPECTIVITY</span>
                      <span className="material-symbols-outlined text-lg text-amber-400">layers</span>
                    </div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-amber-400 block relative z-10 drop-shadow-md">
                      82%
                    </span>
                    <span className="text-xs font-semibold text-amber-300/90 block relative z-10">
                      Highest potential: Zone 14
                    </span>
                  </GlowCard>

                  {/* CARD 4: ACTIVE ALERTS (RED GLOW) */}
                  <GlowCard 
                    glowColor="red" 
                    customSize={true} 
                    className="relative p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between space-y-4 overflow-hidden shadow-xl"
                    style={{
                      background: 'radial-gradient(circle at 85% 15%, rgba(239, 68, 68, 0.30) 0%, rgba(12, 20, 29, 0.95) 75%)',
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">ACTIVE ALERTS</span>
                      <span className="material-symbols-outlined text-lg text-red-400">notifications</span>
                    </div>
                    <span className="font-headline font-black text-3xl sm:text-4xl text-white block relative z-10 drop-shadow-md">
                      2
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold relative z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/25 text-red-300 border border-red-500/40">1 High Risk</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40">1 Medium Risk</span>
                    </div>
                  </GlowCard>
                </div>
              </div>

              {/* OPERATIONAL HEALTH & PROSPECTIVITY SNAPSHOT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={`lg:col-span-7 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                    <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-base">health_metrics</span>
                      OPERATIONAL HEALTH
                    </h2>
                    <span className={`text-[10px] font-mono uppercase ${textMuted}`}>
                      HIGH-LEVEL SNAPSHOT
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>
                        EQUIPMENT AVAILABILITY
                      </span>
                      <span className={`font-headline font-black text-2xl block ${textPrimary}`}>
                        80%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 block">Fleet operational</span>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>
                        BLASTING STATUS
                      </span>
                      <span className="font-headline font-black text-2xl text-[#D97706] block">
                        2 days delay
                      </span>
                      <span className="text-[10px] font-bold text-[#D97706] block">Bench clearance</span>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>
                        PRODUCTION EFFICIENCY
                      </span>
                      <span className="font-headline font-black text-2xl text-emerald-500 block">
                        82%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 block">Throughput rate</span>
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-5 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-[#20242D] border-[#D97706]/40' : 'bg-white border-[#D97706]/40 shadow-sm'
                }`}>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                      <h2 className="font-headline font-black text-sm uppercase tracking-wider text-[#D97706] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#D97706] text-base">layers</span>
                        PROSPECTIVITY SNAPSHOT
                      </h2>
                      <span className="text-[10px] font-mono text-[#D97706] font-bold uppercase">
                        SPATIAL MODEL
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div className={`p-2.5 rounded-lg border ${nestedBg}`}>
                        <span className={`text-[10px] uppercase block ${textMuted}`}>Overall Score</span>
                        <span className="font-headline text-xl font-black text-[#D97706]">82%</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${nestedBg}`}>
                        <span className={`text-[10px] uppercase block ${textMuted}`}>Highest Potential</span>
                        <span className={`font-headline text-xl font-black ${textPrimary}`}>Zone 14</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${nestedBg}`}>
                        <span className={`text-[10px] uppercase block ${textMuted}`}>Accessible</span>
                        <span className="font-headline text-xl font-black text-[#D97706]">61%</span>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${nestedBg}`}>
                        <span className={`text-[10px] uppercase block ${textMuted}`}>Recoverable</span>
                        <span className="font-headline text-xl font-black text-emerald-500">44%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('production-forecast')}
                    className={`w-full py-2.5 rounded-lg border text-[#D97706] hover:text-[#B45309] text-xs font-extrabold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${nestedBg}`}
                  >
                    <span>Open Prospectivity Map</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* ENVIRONMENTAL CONDITIONS & RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={`lg:col-span-7 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                    <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B] text-base">thermostat</span>
                      ENVIRONMENTAL CONDITIONS
                    </h2>
                    <span className="text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{liveWeather?.lastUpdated || 'LIVE STREAM • OPENWEATHER API'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`p-3.5 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>RAINFALL (MM)</span>
                      <span className="font-headline font-black text-xl text-blue-500 block">
                        {liveWeather ? `${liveWeather.rainfallMm} mm` : '70%'}
                      </span>
                      <span className={`text-[9px] block ${textMuted}`}>
                        {liveWeather?.isLive ? 'Live Station Rain' : 'IMD Precip Station'}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>HUMIDITY</span>
                      <span className="font-headline font-black text-xl text-cyan-500 block">
                        {liveWeather ? `${liveWeather.humidity}%` : '68%'}
                      </span>
                      <span className={`text-[9px] block ${textMuted}`}>Ambient Air RH</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>SOIL MOISTURE</span>
                      <span className="font-headline font-black text-xl text-amber-500 block">38%</span>
                      <span className={`text-[9px] block ${textMuted}`}>Pit Bench Sensor</span>
                    </div>

                    <div className={`p-3.5 rounded-xl border space-y-1 ${nestedBg}`}>
                      <span className={`text-[10px] font-bold uppercase block ${textMuted}`}>TEMPERATURE</span>
                      <span className={`font-headline font-black text-xl block ${textPrimary}`}>
                        {liveWeather ? `${liveWeather.temp}°C` : '31°C'}
                      </span>
                      <span className={`text-[9px] block ${textMuted}`}>
                        {liveWeather ? `${liveWeather.weatherCondition} (${liveWeather.windSpeedKmh} km/h)` : 'Pit Station Temp'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-5 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                    <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#D97706] text-base">history</span>
                      RECENT ACTIVITY
                    </h2>
                    <span className={`text-[10px] font-mono uppercase ${textMuted}`}>
                      LIVE LOG STREAM
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-[#B03A2E] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className={`flex justify-between items-center text-[10px] font-mono ${textMuted}`}>
                          <span className="font-bold text-[#B03A2E]">09:14</span>
                          <span>Today</span>
                        </div>
                        <p className={`font-bold mt-0.5 ${textPrimary}`}>High-risk shortfall detected</p>
                        <p className={`text-[11px] ${textMuted}`}>Zone 14 shortfall probability raised to 78%</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-3 text-xs pt-2 border-t ${borderDivider}`}>
                      <span className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className={`flex justify-between items-center text-[10px] font-mono ${textMuted}`}>
                          <span className="font-bold text-[#D97706]">08:42</span>
                          <span>Today</span>
                        </div>
                        <p className={`font-bold mt-0.5 ${textPrimary}`}>Production forecast updated</p>
                        <p className={`text-[11px] ${textMuted}`}>Predicted output below monthly target</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-3 text-xs pt-2 border-t ${borderDivider}`}>
                      <span className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className={`flex justify-between items-center text-[10px] font-mono ${textMuted}`}>
                          <span className="font-bold">Yesterday</span>
                        </div>
                        <p className={`font-bold mt-0.5 ${textPrimary}`}>Zone 09 moved to Medium Risk</p>
                        <p className={`text-[11px] ${textMuted}`}>Precipitation inflow affecting bench access</p>
                      </div>
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
                    “Contributing to import-substitution for India’s steel & battery industry”
                  </p>
                </div>

                <span className={`text-[10px] font-mono uppercase shrink-0 ${textMuted}`}>
                  MOIL RESERVE PLATFORM v2.4
                </span>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PRODUCTION & FORECAST TAB CONTENT */}
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
                    <span className="px-3 py-1 rounded-full bg-[#D97706]/20 border border-[#D97706] text-[#D97706] text-[10px] font-black uppercase tracking-wider">
                      POTENTIAL FUTURE SOURCE: {mineProfile.potentialSourceZone}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>
                    “Production performance and model-based output forecast for {mineProfile.mineName}.”
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
                <ShaderCard variant="teal" className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
                      CURRENT OUTPUT
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined text-base">trending_up</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className={`font-headline font-black text-3xl block ${textPrimary}`}>
                      {mineProfile.currentOutputTons.toLocaleString()} t
                    </span>
                    <div className="w-full bg-slate-700/50 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((mineProfile.currentOutputTons / mineProfile.plannedTargetTons) * 100))}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 block mt-1.5">
                      {Math.round((mineProfile.currentOutputTons / mineProfile.plannedTargetTons) * 100)}% of target
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="indigo" className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
                      PLANNED TARGET
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined text-base">flag</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-headline font-black text-3xl text-blue-400 block">
                      {mineProfile.plannedTargetTons.toLocaleString()} t
                    </span>
                    <span className={`text-xs font-semibold block mt-1.5 ${textMuted}`}>
                      Current month allocation
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="teal" className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-black text-[#0E7C7B] uppercase tracking-wider block">
                      PREDICTED OUTPUT
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 flex items-center justify-center text-[#0E7C7B]">
                      <span className="material-symbols-outlined text-base">layers</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-headline font-black text-3xl text-[#0E7C7B] block">
                      {mineProfile.predictedOutputTons.toLocaleString()} t
                    </span>
                    <span className="text-xs font-semibold text-[#0E7C7B] block mt-1.5">
                      Model forecast
                    </span>
                  </div>
                </ShaderCard>

                <ShaderCard variant="amber" className="p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-black text-[#D97706] uppercase tracking-wider block">
                      PROJECTED GAP
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D97706]">
                      <span className="material-symbols-outlined text-base">notifications</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-headline font-black text-3xl text-[#D97706] block">
                      {mineProfile.projectedGapTons.toLocaleString()} t
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-extrabold border border-red-500/30">
                        1 High Risk
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-extrabold border border-amber-500/30">
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
              <div className="p-4 rounded-xl bg-[#D97706]/15 border border-[#D97706]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#D97706] text-2xl">warning</span>
                  <div>
                    <span className="font-headline font-black text-[#D97706] text-sm uppercase tracking-wider block">
                      ⚠️ SHORTFALL DETECTED • {mineProfile.mineName}
                    </span>
                    <p className={`text-xs font-medium mt-0.5 ${textSecondary}`}>
                      Predicted production is below the allocation target. Projected gap:{' '}
                      <strong className="text-[#D97706]">{Math.abs(mineProfile.projectedGapTons).toLocaleString()} t</strong> ({mineProfile.gapPct}% deficit).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('shortfall-diagnosis')}
                  className="px-4 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md border border-[#D97706]"
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
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${textMuted}`}>RAINFALL</span>
                      <span className="font-headline font-black text-lg text-blue-500 block">
                        {mineProfile.environmentalFactors.rainfallPct}% ({mineProfile.environmentalFactors.rainfallMm} mm)
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${textMuted}`}>NDVI VEGETATION</span>
                      <span className="font-headline font-black text-lg text-emerald-500 block">
                        {mineProfile.environmentalFactors.ndvi}
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${textMuted}`}>SOIL MOISTURE</span>
                      <span className="font-headline font-black text-lg text-amber-500 block">
                        {mineProfile.environmentalFactors.soilMoisturePct}%
                      </span>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${nestedBg}`}>
                      <span className={`text-[9.5px] font-bold uppercase block ${textMuted}`}>FLEET UPTIME</span>
                      <span className="font-headline font-black text-lg text-emerald-500 block">
                        {mineProfile.environmentalFactors.equipmentAvailabilityPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT-IF SIMULATION */}
              <div className={`p-6 rounded-xl border space-y-5 ${cardBg}`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${borderDivider}`}>
                  <div>
                    <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#0E7C7B]">tune</span>
                      WHAT-IF SIMULATION
                    </h3>
                    <p className={`text-xs mt-0.5 ${textSecondary}`}>“Explore how operational and environmental changes could affect predicted output.”</p>
                  </div>
                  <div className={`p-4 rounded-xl border text-right shrink-0 ${nestedBg}`}>
                    <span className="text-[10px] font-black text-[#0E7C7B] uppercase tracking-wider block">SIMULATED OUTPUT</span>
                    <span className={`font-headline font-black text-2xl block ${textPrimary}`}>{simulatedOutput.toLocaleString()} t</span>
                    <span className="text-xs font-extrabold text-emerald-500 block">{simulatedGain >= 0 ? `+${simulatedGain}` : simulatedGain} t vs current forecast</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={textSecondary}>Equipment Efficiency</span>
                      <span className="text-[#0E7C7B] font-mono">{simEquipment}%</span>
                    </div>
                    <input type="range" min="50" max="100" value={simEquipment} onChange={(e) => setSimEquipment(Number(e.target.value))} className="w-full accent-[#0E7C7B] cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={textSecondary}>Blasting Delay</span>
                      <span className="text-[#D97706] font-mono">{simBlastingDelay} days</span>
                    </div>
                    <input type="range" min="0" max="7" value={simBlastingDelay} onChange={(e) => setSimBlastingDelay(Number(e.target.value))} className="w-full accent-[#D97706] cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={textSecondary}>Rainfall</span>
                      <span className="text-blue-500 font-mono">{simRainfall}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={simRainfall} onChange={(e) => setSimRainfall(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className={textSecondary}>NDVI</span>
                      <span className="text-emerald-500 font-mono">{simNdvi.toFixed(2)}</span>
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
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SHORTFALL DIAGNOSIS TAB CONTENT */}
          {/* ========================================================================= */}
          {activeTab === 'shortfall-diagnosis' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className={`p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`font-headline font-black text-2xl uppercase tracking-tight flex items-center gap-2 ${textPrimary}`}>
                      <span className="material-symbols-outlined text-[#B03A2E] text-2xl">analytics</span>
                      SHORTFALL DIAGNOSIS
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-[#B03A2E]/20 border border-[#B03A2E] text-[#B03A2E] text-[10px] font-black uppercase tracking-wider">
                      ● HIGH RISK TARGET DEFICIT
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${textSecondary}`}>“Understand the factors contributing to the projected production gap.”</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`flex items-center p-1 rounded-lg border ${nestedBg}`}>
                    <button onClick={() => setDiagnosisViewMode('SUMMARY')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${diagnosisViewMode === 'SUMMARY' ? 'bg-[#B03A2E] text-white' : textMuted}`}>Summary</button>
                    <button onClick={() => setDiagnosisViewMode('CAUSE_ANALYSIS')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${diagnosisViewMode === 'CAUSE_ANALYSIS' ? 'bg-[#B03A2E] text-white' : textMuted}`}>Cause Analysis</button>
                  </div>
                </div>
              </div>

              {/* RISK SUMMARY & GAP VISUAL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={`lg:col-span-5 p-6 rounded-xl border flex flex-col justify-between space-y-4 ${isDark ? 'bg-[#20242D] border-[#B03A2E]/50' : 'bg-white border-[#B03A2E]/40 shadow-sm'}`}>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                      <span className={`text-xs font-headline font-black uppercase tracking-wider ${textMuted}`}>CURRENT RISK DIAGNOSIS</span>
                      <span className="text-[10px] font-mono text-[#B03A2E] font-bold">ACTIVE TRIGGER</span>
                    </div>

                    <div className="p-5 rounded-xl bg-[#B03A2E]/20 border border-[#B03A2E] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black text-[#B03A2E] uppercase tracking-widest block">EVALUATED STATE</span>
                        <span className="font-headline text-3xl font-black text-[#B03A2E] block mt-0.5">HIGH RISK</span>
                        <span className={`text-xs font-bold block mt-0.5 ${textPrimary}`}>Affected: Zone 14</span>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-[#B03A2E] animate-ping" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className={`p-3 rounded-lg border ${nestedBg}`}><span className={`text-[10px] font-bold uppercase block ${textMuted}`}>TARGET</span><span className="font-headline font-black text-xl text-blue-600">5,000 t</span></div>
                      <div className={`p-3 rounded-lg border ${nestedBg}`}><span className={`text-[10px] font-bold uppercase block ${textMuted}`}>FORECAST</span><span className={`font-headline font-black text-xl ${textPrimary}`}>4,100 t</span></div>
                      <div className="p-3 rounded-lg bg-[#B03A2E]/10 border border-[#B03A2E]/40"><span className="text-[10px] text-[#B03A2E] font-bold uppercase block">SHORTFALL</span><span className="font-headline font-black text-xl text-[#B03A2E]">-900 t</span></div>
                    </div>
                  </div>
                </div>

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
                      “Production is projected to finish <strong>900 t</strong> below the current target.”
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold"><span className="text-blue-600">PLANNED TARGET</span><span className="font-mono text-blue-600">5,000 t (100%)</span></div>
                        <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}><div className="h-full bg-blue-600 rounded-md" style={{ width: '100%' }} /></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold"><span className={textPrimary}>PROJECTED FORECAST</span><span className={`font-mono ${textPrimary}`}>4,100 t (82%)</span></div>
                        <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 flex ${nestedBg}`}>
                          <div className="h-full bg-[#0E7C7B] rounded-l-md" style={{ width: '82%' }} />
                          <div className="h-full bg-[#B03A2E] rounded-r-md animate-pulse" style={{ width: '18%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CAUSE CONTRIBUTION SHAP HORIZONTAL BARS */}
              <div className={`p-6 rounded-xl border space-y-5 ${cardBg}`}>
                <h3 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#B03A2E]">align_horizontal_left</span>
                  CAUSE CONTRIBUTION (SHAP FEATURE IMPORTANCE)
                </h3>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`uppercase tracking-wider ${textPrimary}`}>EQUIPMENT DOWNTIME</span>
                      <span className="font-mono font-black text-[#B03A2E] text-sm">42% CONTRIBUTION</span>
                    </div>
                    <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                      <div className="h-full bg-[#B03A2E] rounded-md" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`uppercase tracking-wider ${textPrimary}`}>BLASTING DELAY</span>
                      <span className="font-mono font-black text-[#D97706] text-sm">28% CONTRIBUTION</span>
                    </div>
                    <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                      <div className="h-full bg-[#D97706] rounded-md" style={{ width: '28%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`uppercase tracking-wider ${textPrimary}`}>RAINFALL</span>
                      <span className="font-mono font-black text-blue-500 text-sm">18% CONTRIBUTION</span>
                    </div>
                    <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                      <div className="h-full bg-blue-500 rounded-md" style={{ width: '18%' }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={`uppercase tracking-wider ${textPrimary}`}>ORE GRADE</span>
                      <span className="font-mono font-black text-emerald-500 text-sm">12% CONTRIBUTION</span>
                    </div>
                    <div className={`w-full h-4 rounded-lg overflow-hidden border p-0.5 ${nestedBg}`}>
                      <div className="h-full bg-emerald-500 rounded-md" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CAUSE DETAILS & DIAGNOSTIC INPUTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className={`lg:col-span-8 p-6 rounded-xl border space-y-4 ${cardBg}`}>
                  <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>CAUSE EXPLANATIONS</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={textPrimary}>EQUIPMENT DOWNTIME</span>
                        <span className="text-[#B03A2E]">42% IMPACT</span>
                      </div>
                      <p className={textSecondary}>“Reduced equipment availability is the largest contributor to the projected production gap.”</p>
                    </div>
                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={textPrimary}>BLASTING DELAY</span>
                        <span className="text-[#D97706]">28% IMPACT</span>
                      </div>
                      <p className={textSecondary}>“Current blasting delay is reducing the available operating window.”</p>
                    </div>
                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={textPrimary}>RAINFALL</span>
                        <span className="text-blue-500">18% IMPACT</span>
                      </div>
                      <p className={textSecondary}>“Seasonal rainfall is contributing to reduced production conditions.”</p>
                    </div>
                    <div className={`p-4 rounded-xl border space-y-1 ${nestedBg}`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={textPrimary}>ORE GRADE</span>
                        <span className="text-emerald-500">12% IMPACT</span>
                      </div>
                      <p className={textSecondary}>“Lower ore grade contributes to the remaining production variance.”</p>
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-4 p-6 rounded-xl border space-y-3 ${cardBg}`}>
                  <h3 className={`font-headline font-black text-sm uppercase ${textPrimary}`}>GAP CLOSURE CONDITIONS</h3>
                  <div className="space-y-3 text-xs">
                    <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                      <span className={`text-[10px] uppercase block ${textMuted}`}>EQUIPMENT EFFICIENCY</span>
                      <span className="font-headline font-black text-lg text-emerald-500">80% → 100%</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                      <span className={`text-[10px] uppercase block ${textMuted}`}>BLASTING DELAY</span>
                      <span className="font-headline font-black text-lg text-emerald-500">2 days → ≤ 0 days</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('corrective-actions')}
                      className="w-full py-2.5 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6A69] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      JUMP TO CORRECTIVE ACTIONS →
                    </button>
                  </div>
                </div>
              </div>
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
                            <p><strong className={textPrimary}>Reason:</strong> “{act.reason}”</p>
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
                    “Automated shortfall and risk notifications across mine operations.”
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 cursor-pointer ${nestedBg} ${textPrimary}`}>
                    <span>Dongri Buzurg ▾</span>
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
                                {alt.zone} • Dongri Buzurg
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
                      ● ACTIVE
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
