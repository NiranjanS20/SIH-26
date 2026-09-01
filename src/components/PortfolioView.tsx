import React, { useState } from 'react';
import { ShaderCard } from './ui/ShaderCard';
import ColorBends from './ui/ColorBends';

interface PortfolioViewProps {
  isDark?: boolean;
  onOpenMine: (mineId: string) => void;
}

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

export const PORTFOLIO_MINES_DATA: PortfolioMineProfile[] = [
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
];

// Aggregated Multi-Month Supply Outlook Dataset (Model 2 Aggregated Outputs)
export const PORTFOLIO_SUPPLY_OUTLOOK_DATA: PortfolioOutlookPeriod[] = [
  {
    period: 'SEP',
    monthFull: 'September 2026',
    target: 14000,
    forecast: 13400,
    coveragePct: 96,
    variance: -600,
    status: 'BELOW TARGET',
    statusLabel: 'BELOW TARGET',
    statusColor: '#B8860B', // Amber
    statusIcon: '🟡',
  },
  {
    period: 'OCT',
    monthFull: 'October 2026',
    target: 15200,
    forecast: 14900,
    coveragePct: 98,
    variance: -300,
    status: 'NEAR TARGET',
    statusLabel: 'NEAR TARGET',
    statusColor: '#D97706', // Amber-Gold
    statusIcon: '🟡',
  },
  {
    period: 'NOV',
    monthFull: 'November 2026',
    target: 15500,
    forecast: 15800,
    coveragePct: 102,
    variance: 300,
    status: 'SURPLUS',
    statusLabel: 'SURPLUS',
    statusColor: '#2E7D32', // Green
    statusIcon: '🟢',
  },
];

// Aggregated Corrective Action Recovery Dataset (Models 3 + 4 + 5 Aggregation)
export const PORTFOLIO_RECOVERY_BREAKDOWN: MineRecoveryData[] = [
  {
    id: 'dongri-buzurg',
    shortName: 'Dongri Buzurg',
    mineName: 'Dongri Buzurg Opencast Mine',
    location: 'Bhandara, Maharashtra',
    type: 'Open Cast',
    projectedShortfall: 900,
    potentiallyRecoverable: 650,
    recoveryRatePct: 72,
    remainingGap: 250,
    primaryAction: 'Deploy standby Komatsu excavator & activate Pit Sump-3 auxiliary pump array',
    riskLevel: 'HIGH',
    riskColor: '#B03A2E',
  },
  {
    id: 'balaghat',
    shortName: 'Balaghat',
    mineName: 'Balaghat Deep Underground Mine',
    location: 'Balaghat, Madhya Pradesh',
    type: 'Underground',
    projectedShortfall: 410,
    potentiallyRecoverable: 200,
    recoveryRatePct: 49,
    remainingGap: 210,
    primaryAction: 'Shaft winder cycle calibration & deep stope auxiliary ventilation realignment',
    riskLevel: 'MEDIUM',
    riskColor: '#B8860B',
  },
  {
    id: 'chikla',
    shortName: 'Chikla',
    mineName: 'Chikla Underground Mine',
    location: 'Bhandara, Maharashtra',
    type: 'Underground',
    projectedShortfall: 0,
    potentiallyRecoverable: 0,
    recoveryRatePct: 100,
    remainingGap: 0,
    primaryAction: 'Surplus operational trajectory maintained (+150 t) • Continuous tramming tracking',
    riskLevel: 'LOW',
    riskColor: '#2E7D32',
  },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  isDark = true,
  onOpenMine,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [outlookPeriodView, setOutlookPeriodView] = useState<'3-months' | 'this-month'>('3-months');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const scrollToNationalImpact = () => {
    const elem = document.getElementById('national-impact-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reusable theme styles (Vibrant contrast in Light Mode, 100% untouched in Dark Mode)
  const cardBg = isDark
    ? 'bg-[#20242D] border-white/10'
    : 'bg-gradient-to-br from-white via-slate-50/50 to-white border-slate-200/90 shadow-md hover:shadow-lg transition-all';
  const nestedBg = isDark
    ? 'bg-[#14171C] border-white/10'
    : 'bg-slate-50/90 border-slate-200 shadow-xs hover:border-slate-300 transition-colors';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200/80';

  // Sorted list for Mine Performance cards (Dongri Buzurg, Chikla, Balaghat)
  const displayCardsOrder = ['dongri-buzurg', 'chikla', 'balaghat'];
  const mineCards = displayCardsOrder.map((id) =>
    PORTFOLIO_MINES_DATA.find((m) => m.id === id)!
  );

  // Sorted list for Ranking Table (by performance descending)
  const sortedRanking = [...PORTFOLIO_MINES_DATA].sort(
    (a, b) => b.performance - a.performance
  );

  // Deterministic Top Priority Mine derivation (Highest Risk + Largest Absolute Shortfall)
  const topPriorityMine = [...PORTFOLIO_MINES_DATA]
    .filter((m) => m.variance < 0)
    .sort((a, b) => {
      const riskRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (riskRank[b.risk] !== riskRank[a.risk]) {
        return riskRank[b.risk] - riskRank[a.risk];
      }
      return Math.abs(b.variance) - Math.abs(a.variance);
    })[0] || PORTFOLIO_MINES_DATA.find((m) => m.id === 'dongri-buzurg')!;

  // Dynamic Portfolio Recovery calculations
  const totalProjectedShortfall = PORTFOLIO_RECOVERY_BREAKDOWN.reduce(
    (sum, m) => sum + m.projectedShortfall,
    0
  ); // 1,310 t
  const totalPotentiallyRecoverable = PORTFOLIO_RECOVERY_BREAKDOWN.reduce(
    (sum, m) => sum + m.potentiallyRecoverable,
    0
  ); // 850 t
  const overallRecoveryPct = Math.round(
    (totalPotentiallyRecoverable / totalProjectedShortfall) * 100
  ); // 65%
  const totalRemainingGap = totalProjectedShortfall - totalPotentiallyRecoverable; // 460 t

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. PORTFOLIO PAGE HEADER & CONTROLS */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-xl border relative overflow-hidden shadow-xl min-h-[160px] flex flex-col justify-center text-white ${
        isDark ? 'border-white/15' : 'border-slate-300'
      }`}>
        {/* React Bits Interactive ColorBends WebGL Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ColorBends
            colors={["#0E7C7B", "#001433", "#FEA619", "#00d2ff"]}
            rotation={45}
            speed={0.15}
            scale={1.2}
            frequency={1}
            warpStrength={1.2}
            mouseInfluence={1}
            noise={0.1}
            parallax={0.4}
            iterations={2}
            intensity={1.3}
            bandWidth={6}
            transparent={true}
          />
        </div>

        {/* Subtle Vignette Overlay for Text Contrast */}
        <div className={`absolute inset-0 z-5 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-[#001433]/85 via-[#001433]/60 to-[#001433]/80 backdrop-blur-[0.5px]'
            : 'bg-gradient-to-r from-[#002452]/90 via-[#002452]/75 to-[#002452]/85 backdrop-blur-[0.5px]'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#0E7C7B]/30 border border-[#0E7C7B]/50 text-emerald-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PORTFOLIO MANAGEMENT LAYER
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                3 MINES • Current Month
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[9.5px] font-mono font-bold uppercase tracking-wider">
                DEMO DATA
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none">
              PORTFOLIO OVERVIEW
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Production and risk snapshot across MOIL mines.
            </p>
          </div>

          {/* Right Header Controls: Period & Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#001433]/80 px-3.5 py-2 rounded-lg border border-white/20 text-xs font-semibold shadow-sm">
              <span className="text-slate-300 text-[11px] font-mono">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                <option value="This Month" className="bg-[#1F3864] text-white">This Month</option>
                <option value="Previous Month" className="bg-[#1F3864] text-white">Previous Month</option>
                <option value="Q3 FY26" className="bg-[#1F3864] text-white">Q3 FY26</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6B6A] text-white text-xs font-bold transition-all border border-teal-400/30 cursor-pointer shadow-md active:scale-95"
              title="Refresh Portfolio Telemetry"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PORTFOLIO SUMMARY KPI ROW WITH SHADER EFFECTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* CARD 1: TOTAL PRODUCTION */}
        <ShaderCard variant="teal" isDark={isDark} className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-teal-800'}`}>
              TOTAL PRODUCTION
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 text-[#0E7C7B]' : 'bg-teal-100 border border-teal-300 text-teal-700'
            }`}>
              <span className="material-symbols-outlined text-lg">view_stream</span>
            </div>
          </div>

          <div className="mt-3">
            <div className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? textPrimary : 'text-slate-950'}`}>
              12,840 <span className={`text-sm font-sans font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>t</span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isDark ? textMuted : 'text-teal-700'}`}>
              Current period
            </p>
          </div>
        </ShaderCard>

        {/* CARD 2: TOTAL TARGET */}
        <ShaderCard variant="indigo" isDark={isDark} className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-blue-800'}`}>
              TOTAL TARGET
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#1F3864]/30 border border-indigo-400/30 text-indigo-400' : 'bg-blue-100 border border-blue-300 text-blue-700'
            }`}>
              <span className="material-symbols-outlined text-lg">track_changes</span>
            </div>
          </div>

          <div className="mt-3">
            <div className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? textPrimary : 'text-blue-700'}`}>
              14,000 <span className={`text-sm font-sans font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>t</span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isDark ? textMuted : 'text-blue-800'}`}>
              Current period
            </p>
          </div>
        </ShaderCard>

        {/* CARD 3: PORTFOLIO PERFORMANCE */}
        <ShaderCard variant="amber" isDark={isDark} className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-amber-900'}`}>
              PORTFOLIO PERFORMANCE
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-amber-500/15 border border-amber-500/30 text-[#D97706]' : 'bg-amber-100 border border-amber-300 text-amber-800'
            }`}>
              <span className="material-symbols-outlined text-lg">speed</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? textPrimary : 'text-amber-700'}`}>
                91.7%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-amber-500/20 text-[#D97706] border-amber-500/30' : 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold'
              }`}>
                -8.3% gap
              </span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isDark ? textMuted : 'text-amber-800'}`}>
              Of target
            </p>
          </div>
        </ShaderCard>

        {/* CARD 4: MINES AT RISK */}
        <ShaderCard variant="red" isDark={isDark} className="p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-rose-900'}`}>
              MINES AT RISK
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-[#B03A2E]/20 border border-[#B03A2E]/40 text-[#B03A2E]' : 'bg-rose-100 border border-rose-300 text-rose-700'
            }`}>
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <div className="flex items-baseline gap-3">
              <span className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-[#B03A2E]' : 'text-rose-700'}`}>
                1
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-[#B03A2E]/20 text-[#B03A2E] border-[#B03A2E]/30' : 'bg-rose-100 text-rose-800 border-rose-300 font-black'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B03A2E] animate-ping" />
                High Risk
              </span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${isDark ? textMuted : 'text-rose-800 font-medium'}`}>
              Dongri Buzurg requires attention
            </p>
          </div>
        </ShaderCard>
      </div>

      {/* ========================================================================= */}
      {/* 3. MINE PERFORMANCE SECTION (3 CARDS SIDE BY SIDE) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`font-headline font-black text-lg uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#0E7C7B] text-xl">view_kanban</span>
              MINE PERFORMANCE
            </h2>
            <p className={`text-xs font-medium ${textMuted}`}>
              Comparative production snapshots across active profiles
            </p>
          </div>

          <span className={`text-[11px] font-mono ${textMuted}`}>
            Target Period: Month-to-Date
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mineCards.map((mine) => {
            const isHighRisk = mine.risk === 'HIGH';
            const isMediumRisk = mine.risk === 'MEDIUM';

            // Risk badge styling with crisp contrast in light mode
            let badgeBg = isDark
              ? 'bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black shadow-xs';
            let riskDotColor = 'bg-[#2E7D32]';
            let riskLabel = '🟢 ON TRACK';

            if (isHighRisk) {
              badgeBg = isDark
                ? 'bg-[#B03A2E]/20 text-[#B03A2E] border-[#B03A2E]/40'
                : 'bg-rose-100 text-rose-800 border-rose-300 font-black shadow-xs';
              riskDotColor = 'bg-[#B03A2E]';
              riskLabel = '🔴 HIGH RISK';
            } else if (isMediumRisk) {
              badgeBg = isDark
                ? 'bg-[#B8860B]/20 text-[#B8860B] border-[#B8860B]/40'
                : 'bg-amber-100 text-amber-800 border-amber-300 font-black shadow-xs';
              riskDotColor = 'bg-[#B8860B]';
              riskLabel = '🟡 MEDIUM RISK';
            }

            return (
              <div
                key={mine.id}
                className={`p-6 rounded-xl border flex flex-col justify-between space-y-5 transition-all relative ${
                  isDark
                    ? 'hover:border-white/30 hover:shadow-lg ' + cardBg
                    : 'hover:border-slate-300 hover:shadow-xl ' + cardBg
                }`}
              >
                {/* Top Mine Header & Risk Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-headline font-black text-lg uppercase tracking-tight ${textPrimary}`}>
                        {mine.shortName}
                      </h3>
                      <span className={`text-[11px] font-medium block ${textMuted}`}>
                        {mine.location} • {mine.type}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${badgeBg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${riskDotColor} ${isHighRisk ? 'animate-pulse' : ''}`} />
                      {riskLabel}
                    </span>
                  </div>

                  {/* Production Metrics Grid */}
                  <div className={`p-3.5 rounded-lg border grid grid-cols-2 gap-3 ${
                    isDark ? nestedBg : 'bg-gradient-to-br from-slate-50/90 to-white border-slate-200 shadow-xs'
                  }`}>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        PRODUCTION
                      </span>
                      <span className={`font-headline font-black text-lg sm:text-xl ${textPrimary}`}>
                        {mine.production.toLocaleString()} <span className="text-xs font-normal text-slate-400">t</span>
                      </span>
                    </div>

                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        TARGET
                      </span>
                      <span className={`font-headline font-black text-lg sm:text-xl ${textPrimary}`}>
                        {mine.target.toLocaleString()} <span className="text-xs font-normal text-slate-400">t</span>
                      </span>
                    </div>

                    <div className={`pt-1 border-t ${borderDivider}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        VARIANCE
                      </span>
                      <span
                        className="font-headline font-black text-sm"
                        style={{ color: isDark ? mine.riskColor : (mine.variance > 0 ? '#15803D' : mine.variance > -500 ? '#B45309' : '#BE123C') }}
                      >
                        {mine.variance > 0 ? `+${mine.variance}` : mine.variance} t
                      </span>
                    </div>

                    <div className={`pt-1 border-t ${borderDivider}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        PERFORMANCE
                      </span>
                      <span className={`font-headline font-black text-sm ${textPrimary}`}>
                        {mine.performance}%
                      </span>
                    </div>
                  </div>

                  {/* Compact Production vs Target Visualization */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-mono font-bold">
                      <span className={textMuted}>ACTUAL vs TARGET</span>
                      <span className={textPrimary}>{mine.performance}% achieved</span>
                    </div>

                    <div className="space-y-1">
                      {/* Target reference bar */}
                      <div className={`w-full h-2 rounded-full relative overflow-hidden border ${
                        isDark ? 'bg-slate-700/40 border-white/5' : 'bg-slate-200 border-slate-300'
                      }`}>
                        {/* Actual bar */}
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${Math.min(mine.performance, 100)}%`,
                            backgroundColor: mine.riskColor,
                          }}
                        />
                      </div>
                      <div className={`flex justify-between text-[9px] font-mono pt-0.5 ${textMuted}`}>
                        <span>0 t</span>
                        <span>TARGET ({mine.target.toLocaleString()} t)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className={`pt-3 border-t ${borderDivider}`}>
                  <button
                    onClick={() => onOpenMine(mine.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-md group ${
                      mine.id === 'dongri-buzurg'
                        ? isDark
                          ? 'bg-[#1F3864] hover:bg-[#27467C] text-white border-indigo-400/30'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black border-blue-500 shadow-blue-500/20'
                        : isDark
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300 font-semibold'
                    }`}
                  >
                    <span>{mine.id === 'dongri-buzurg' ? 'Open Mine' : 'Open Mine (Phase II 🔒)'}</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      {mine.id === 'dongri-buzurg' ? 'arrow_forward' : 'lock'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 1 — PORTFOLIO SUPPLY OUTLOOK (NEW SECTION) */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-7 rounded-xl border space-y-6 ${cardBg}`}>
        {/* Header with Title & Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`font-headline font-black text-lg uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-[#0E7C7B] text-xl">query_stats</span>
                PORTFOLIO SUPPLY OUTLOOK
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                isDark ? 'bg-[#0E7C7B]/20 text-teal-300 border border-[#0E7C7B]/30' : 'bg-teal-100 text-teal-800 border border-teal-300'
              }`}>
                MODEL 2 AGGREGATION
              </span>
            </div>
            <p className={`text-xs font-medium ${textMuted}`}>
              Projected production versus target across the portfolio.
            </p>
          </div>

          {/* Right Controls: Period Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-mono font-bold ${textMuted}`}>Period:</span>
            <div className={`p-1 rounded-lg border flex items-center gap-1 ${
              isDark ? nestedBg : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setOutlookPeriodView('3-months')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  outlookPeriodView === '3-months'
                    ? 'bg-[#0E7C7B] text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Next 3 Months
              </button>
              <button
                onClick={() => setOutlookPeriodView('this-month')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  outlookPeriodView === 'this-month'
                    ? 'bg-[#0E7C7B] text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Month (Sep)
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate Management Question Answer Callout */}
        <div className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? nestedBg : 'bg-gradient-to-r from-slate-50 to-teal-50/40 border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? 'bg-amber-500/15 border border-amber-500/30 text-[#D97706]' : 'bg-amber-100 border border-amber-300 text-amber-800'
            }`}>
              <span className="material-symbols-outlined text-lg">insights</span>
            </div>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                PORTFOLIO TARGET ATTAINMENT OUTLOOK
              </span>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Portfolio tracks at <strong className={isDark ? 'text-amber-400' : 'text-amber-700'}>96% coverage in Sep</strong>, rebounding to <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>102% surplus in Nov</strong> as opencast monsoon constraints ease.
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-4 text-xs font-mono shrink-0 px-3 py-1.5 rounded-lg border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div>
              <span className={`text-[10px] block ${textMuted}`}>3-MO TARGET</span>
              <strong className={textPrimary}>44,700 t</strong>
            </div>
            <div className="w-px h-6 bg-slate-500/20" />
            <div>
              <span className={`text-[10px] block ${textMuted}`}>3-MO FORECAST</span>
              <strong className="text-[#0E7C7B]">44,100 t</strong>
            </div>
            <div className="w-px h-6 bg-slate-500/20" />
            <div>
              <span className={`text-[10px] block ${textMuted}`}>AVG COVERAGE</span>
              <strong className={isDark ? 'text-white' : 'text-slate-900'}>98.7%</strong>
            </div>
          </div>
        </div>

        {/* Clean Enterprise Bar & Metric Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PORTFOLIO_SUPPLY_OUTLOOK_DATA.map((item) => {
            const isSurplus = item.status === 'SURPLUS';
            const isNearTarget = item.status === 'NEAR TARGET';

            // Status chip badge styles
            let statusBadge = isDark
              ? 'bg-[#B8860B]/15 text-[#B8860B] border-[#B8860B]/30'
              : 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
            let barColor = '#B8860B';

            if (isSurplus) {
              statusBadge = isDark
                ? 'bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/30'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
              barColor = '#2E7D32';
            } else if (isNearTarget) {
              statusBadge = isDark
                ? 'bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30'
                : 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
              barColor = '#D97706';
            }

            return (
              <div
                key={item.period}
                className={`p-5 rounded-xl border space-y-4 flex flex-col justify-between transition-all ${
                  isDark ? nestedBg : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Month Title & Status Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-headline font-black text-base text-[#0E7C7B] tracking-wider">
                      {item.period}
                    </span>
                    <span className={`text-[11px] font-medium block ${textMuted}`}>
                      {item.monthFull}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge}`}>
                    <span>{item.statusIcon}</span>
                    <span>{item.statusLabel}</span>
                  </span>
                </div>

                {/* Target vs Forecast Metrics */}
                <div className={`p-3 rounded-lg border grid grid-cols-2 gap-2 ${
                  isDark ? 'bg-black/30 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                      TARGET
                    </span>
                    <span className={`font-mono font-bold text-sm ${textPrimary}`}>
                      {item.target.toLocaleString()} t
                    </span>
                  </div>

                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                      FORECAST
                    </span>
                    <span className={`font-mono font-bold text-sm ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                      {item.forecast.toLocaleString()} t
                    </span>
                  </div>

                  <div className={`pt-1 border-t ${borderDivider}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                      COVERAGE
                    </span>
                    <span className={`font-mono font-black text-sm ${
                      item.coveragePct >= 100 ? (isDark ? 'text-[#2E7D32]' : 'text-emerald-700') : (isDark ? 'text-amber-400' : 'text-amber-700')
                    }`}>
                      {item.coveragePct}%
                    </span>
                  </div>

                  <div className={`pt-1 border-t ${borderDivider}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                      VARIANCE
                    </span>
                    <span className="font-mono font-bold text-sm" style={{ color: barColor }}>
                      {item.variance > 0 ? `+${item.variance}` : item.variance} t
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar comparing Forecast to Target (100% Marker) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className={textMuted}>PROJECTED ATTAINMENT</span>
                    <span className={textPrimary}>{item.coveragePct}%</span>
                  </div>

                  <div className={`w-full h-3 rounded-full relative overflow-hidden border ${
                    isDark ? 'bg-slate-800 border-white/5' : 'bg-slate-200 border-slate-300'
                  }`}>
                    {/* Forecast fill */}
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(item.coveragePct, 100)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <div className={`flex justify-between text-[9px] font-mono ${textMuted}`}>
                    <span>0 t</span>
                    <span>TARGET: {item.target.toLocaleString()} t</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small Data Source Note */}
        <div className={`flex flex-wrap items-center justify-between text-[10.5px] font-mono pt-1 ${textMuted}`}>
          <span>* Aggregation Rule: Portfolio Forecast = Σ(Mine Forecasts) • Portfolio Target = Σ(Mine Targets)</span>
          <span className="font-bold text-[#0E7C7B]">Source: Model 2 Machine Learning Outputs</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MINE PERFORMANCE RANKING (ENTERPRISE DATA TABLE) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h2 className={`font-headline font-black text-lg uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
            <span className="material-symbols-outlined text-[#0E7C7B] text-xl">leaderboard</span>
            MINE PERFORMANCE RANKING
          </h2>
          <p className={`text-xs font-medium ${textMuted}`}>
            Sorted list of mines by monthly target compliance
          </p>
        </div>

        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b ${borderDivider} ${
                  isDark ? nestedBg : 'bg-slate-100 text-slate-700 font-black'
                }`}>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    RANK
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    MINE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    PRODUCTION
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    TARGET
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    VARIANCE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    PERFORMANCE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    RISK
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-slate-700'}`}>
                    STATUS
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider text-right ${isDark ? textMuted : 'text-slate-700'}`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderDivider}`}>
                {sortedRanking.map((mine, index) => {
                  return (
                    <tr
                      key={mine.id}
                      className={`transition-colors group ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-teal-50/50'
                      }`}
                    >
                      <td className="px-4 py-4 font-mono font-black text-sm text-[#0E7C7B]">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className={`font-headline font-bold text-sm ${textPrimary}`}>
                          {mine.shortName}
                        </div>
                        <span className={`text-[10px] font-medium block ${textMuted}`}>
                          {mine.location}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-mono font-bold text-xs ${textPrimary}`}>
                        {mine.production.toLocaleString()} t
                      </td>
                      <td className={`px-4 py-4 font-mono text-xs ${textMuted}`}>
                        {mine.target.toLocaleString()} t
                      </td>
                      <td
                        className="px-4 py-4 font-mono font-bold text-xs"
                        style={{ color: isDark ? mine.riskColor : (mine.variance > 0 ? '#15803D' : mine.variance > -500 ? '#B45309' : '#BE123C') }}
                      >
                        {mine.variance > 0 ? `+${mine.variance}` : mine.variance} t
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-xs ${textPrimary}`}>
                            {mine.performance}%
                          </span>
                          <div className={`w-16 h-1.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-slate-700/40' : 'bg-slate-200'
                          }`}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(mine.performance, 100)}%`,
                                backgroundColor: mine.riskColor,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase"
                          style={{
                            color: isDark ? mine.riskColor : (mine.risk === 'LOW' ? '#15803D' : mine.risk === 'MEDIUM' ? '#B45309' : '#BE123C'),
                            backgroundColor: `${mine.riskColor}${isDark ? '18' : '22'}`,
                            border: `1px solid ${mine.riskColor}40`,
                          }}
                        >
                          {mine.risk}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold ${
                          mine.status === 'Surplus'
                            ? (isDark ? 'text-[#2E7D32]' : 'text-emerald-700 font-extrabold')
                            : (isDark ? 'text-slate-300' : 'text-slate-600')
                        }`}>
                          {mine.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => onOpenMine(mine.id)}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border cursor-pointer ${
                            mine.id === 'dongri-buzurg'
                              ? 'bg-[#0E7C7B] hover:bg-[#0C6B6A] text-white border-teal-400/30 shadow-sm'
                              : isDark
                              ? 'bg-white/10 hover:bg-white/20 text-slate-400 border-white/15'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300 font-semibold'
                          }`}
                        >
                          {mine.id === 'dongri-buzurg' ? 'Open Mine →' : 'Phase II 🔒'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RISK DISTRIBUTION & FEATURE 2 — TOP PRIORITY MINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RISK DISTRIBUTION PANEL (5 COLS) */}
        <div className={`lg:col-span-5 p-6 rounded-xl border space-y-4 flex flex-col justify-between ${cardBg}`}>
          <div className="space-y-1">
            <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#0E7C7B] text-base">donut_large</span>
              RISK DISTRIBUTION
            </h3>
            <p className={`text-xs font-medium ${textMuted}`}>
              Portfolio segmentation across operational risk levels
            </p>
          </div>

          <div className={`p-4 rounded-lg border space-y-4 ${
            isDark ? nestedBg : 'bg-slate-50/80 border-slate-200 shadow-xs'
          }`}>
            {/* HIGH RISK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`flex items-center gap-2 ${isDark ? 'text-[#B03A2E]' : 'text-rose-700 font-black'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03A2E]" />
                  HIGH RISK
                </span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900 font-extrabold'}`}>1 Mine</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="h-full bg-[#B03A2E] w-[33.3%]" />
              </div>
            </div>

            {/* MEDIUM RISK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`flex items-center gap-2 ${isDark ? 'text-[#B8860B]' : 'text-amber-700 font-black'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                  MEDIUM RISK
                </span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900 font-extrabold'}`}>1 Mine</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="h-full bg-[#B8860B] w-[33.3%]" />
              </div>
            </div>

            {/* LOW RISK / ON TRACK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={`flex items-center gap-2 ${isDark ? 'text-[#2E7D32]' : 'text-emerald-700 font-black'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  LOW / ON TRACK
                </span>
                <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900 font-extrabold'}`}>1 Mine</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div className="h-full bg-[#2E7D32] w-[33.3%]" />
              </div>
            </div>
          </div>

          <div className={`text-[11px] font-mono flex items-center justify-between pt-1 ${textMuted}`}>
            <span>TOTAL PROFILES: 3</span>
            <span className={`font-bold ${isDark ? 'text-[#B03A2E]' : 'text-rose-700'}`}>33% HIGH RISK</span>
          </div>
        </div>

        {/* FEATURE 2 — TOP PRIORITY MINE CARD (7 COLS) */}
        <div className={`lg:col-span-7 p-6 rounded-xl border space-y-4 flex flex-col justify-between ${cardBg}`}>
          <div className="flex items-start justify-between gap-2 border-b pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#B03A2E] text-base">emergency_home</span>
                  TOP PRIORITY MINE
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#B03A2E]/20 text-[#B03A2E] border border-[#B03A2E]/40 text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B03A2E] animate-pulse" />
                  🔴 HIGH RISK
                </span>
              </div>
              <p className={`text-xs font-medium ${textMuted}`}>
                Requires immediate operational intervention to prevent portfolio shortfall
              </p>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
              isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}>
              PRIORITY #1
            </span>
          </div>

          <div className={`p-4 rounded-lg border space-y-4 ${
            isDark
              ? 'bg-[#B03A2E]/10 border-[#B03A2E]/30'
              : 'bg-gradient-to-br from-rose-50/90 to-white border-rose-200 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className={`font-headline font-black text-xl uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {topPriorityMine.name.toUpperCase()}
                </h4>
                <span className={`text-xs font-medium block ${textMuted}`}>
                  {topPriorityMine.location} • {topPriorityMine.type}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-xs font-mono font-bold uppercase ${textMuted}`}>
                  COMPLIANCE:
                </span>
                <span className={`font-headline font-black text-lg ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                  {topPriorityMine.performance}%
                </span>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className={`p-3 rounded-lg border grid grid-cols-2 sm:grid-cols-3 gap-3 ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-white border-rose-200/80 shadow-xs'
            }`}>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                  PROJECTED SHORTFALL
                </span>
                <span className="font-headline font-black text-lg text-[#B03A2E]">
                  {topPriorityMine.variance} t
                </span>
              </div>

              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                  PERFORMANCE
                </span>
                <span className={`font-headline font-black text-lg ${textPrimary}`}>
                  {topPriorityMine.performance}%
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                  CURRENT GAP
                </span>
                <span className={`font-headline font-black text-lg ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  -18% of Target
                </span>
              </div>
            </div>

            {/* Primary Contributing Factor Box */}
            <div className={`p-3 rounded-lg border space-y-1 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <span className="material-symbols-outlined text-xs text-[#0E7C7B]">engineering</span>
                  PRIMARY CONTRIBUTING FACTOR
                </span>
                <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  isDark ? 'bg-[#0E7C7B]/20 text-teal-300' : 'bg-teal-100 text-teal-800'
                }`}>
                  SHAP WEIGHT 42%
                </span>
              </div>
              <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Equipment downtime & shovel loader availability (Pit DB-02 haulage latency)
              </p>
            </div>
          </div>

          {/* Action Open Mine Button */}
          <div className="flex items-center justify-between pt-1">
            <span className={`text-[11px] font-mono ${textMuted}`}>
              * Priority Rule: Highest Risk (HIGH) + Largest Shortfall (-900 t)
            </span>

            <button
              onClick={() => onOpenMine(topPriorityMine.id)}
              className="px-5 py-2.5 rounded-lg bg-[#B03A2E] hover:bg-[#962F24] text-white text-xs font-bold transition-all border border-red-400/40 cursor-pointer shadow-md flex items-center gap-2 group active:scale-95"
            >
              <span>Open Mine</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE 3 — PORTFOLIO RECOVERY POTENTIAL (NEW SECTION) */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-7 rounded-xl border space-y-6 ${cardBg}`}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`font-headline font-black text-lg uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-[#0E7C7B] text-xl">healing</span>
                PORTFOLIO RECOVERY POTENTIAL
              </h2>
              <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}>
                MODELS 3 + 4 + 5 SYNTHESIS
              </span>
            </div>
            <p className={`text-xs font-medium ${textMuted}`}>
              How much of the projected portfolio shortfall could potentially be recovered through recommended corrective actions?
            </p>
          </div>

          {/* Quick Action to National Impact */}
          <button
            onClick={scrollToNationalImpact}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-teal-300 border-teal-500/30 hover:border-teal-400/50'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300 shadow-xs'
            }`}
          >
            <span>View National Impact</span>
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
          </button>
        </div>

        {/* 3 Large Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* KPI 1: TOTAL PROJECTED SHORTFALL */}
          <div className={`p-5 rounded-xl border space-y-2 flex flex-col justify-between ${
            isDark ? nestedBg : 'bg-gradient-to-br from-rose-50/70 to-white border-rose-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10.5px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-rose-900'}`}>
                TOTAL PROJECTED SHORTFALL
              </span>
              <span className="material-symbols-outlined text-base text-[#B03A2E]">trending_down</span>
            </div>
            <div>
              <div className="font-headline font-black text-3xl sm:text-4xl text-[#B03A2E]">
                {totalProjectedShortfall.toLocaleString()} <span className="text-sm font-sans font-bold text-slate-400">t</span>
              </div>
              <p className={`text-[11px] font-medium mt-1 ${textMuted}`}>
                Across 2 impacted mines (Dongri Buzurg & Balaghat)
              </p>
            </div>
          </div>

          {/* KPI 2: POTENTIALLY RECOVERABLE */}
          <div className={`p-5 rounded-xl border space-y-2 flex flex-col justify-between ${
            isDark ? nestedBg : 'bg-gradient-to-br from-teal-50/70 to-white border-teal-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10.5px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-teal-900'}`}>
                POTENTIALLY RECOVERABLE
              </span>
              <span className="material-symbols-outlined text-base text-[#0E7C7B]">build</span>
            </div>
            <div>
              <div className="font-headline font-black text-3xl sm:text-4xl text-[#0E7C7B]">
                {totalPotentiallyRecoverable.toLocaleString()} <span className="text-sm font-sans font-bold text-slate-400">t</span>
              </div>
              <p className={`text-[11px] font-medium mt-1 ${textMuted}`}>
                Modeled recovery from simulated corrective actions
              </p>
            </div>
          </div>

          {/* KPI 3: RECOVERY POTENTIAL */}
          <div className={`p-5 rounded-xl border space-y-2 flex flex-col justify-between ${
            isDark ? nestedBg : 'bg-gradient-to-br from-indigo-50/70 to-white border-indigo-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10.5px] font-black uppercase tracking-wider ${isDark ? textMuted : 'text-indigo-900'}`}>
                RECOVERY POTENTIAL
              </span>
              <span className="material-symbols-outlined text-base text-indigo-400">published_with_changes</span>
            </div>
            <div>
              <div className={`font-headline font-black text-3xl sm:text-4xl ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                {overallRecoveryPct}%
              </div>
              <p className={`text-[11px] font-medium mt-1 ${textMuted}`}>
                Of total identified portfolio production gap
              </p>
            </div>
          </div>
        </div>

        {/* Simple Horizontal Gap vs Recovery Visual Representation */}
        <div className={`p-5 rounded-xl border space-y-3 ${
          isDark ? nestedBg : 'bg-slate-50/90 border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono font-bold">
            <span className={textPrimary}>PORTFOLIO SHORTFALL vs RECOVERY GAP</span>
            <span className="text-[#0E7C7B]">{overallRecoveryPct}% OF IDENTIFIED GAP POTENTIALLY RECOVERABLE</span>
          </div>

          {/* Segmented Bar Visualization */}
          <div className="space-y-1.5">
            <div className={`w-full h-5 rounded-lg relative overflow-hidden flex border ${
              isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-200 border-slate-300'
            }`}>
              {/* Potentially Recoverable Segment (65%) */}
              <div
                className="h-full bg-gradient-to-r from-[#0E7C7B] to-[#10B981] flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500 shadow-xs"
                style={{ width: `${overallRecoveryPct}%` }}
                title={`Potentially Recoverable: ${totalPotentiallyRecoverable} t (${overallRecoveryPct}%)`}
              >
                <span className="truncate">{totalPotentiallyRecoverable} t Recoverable ({overallRecoveryPct}%)</span>
              </div>

              {/* Remaining Gap Segment (35%) */}
              <div
                className="h-full bg-gradient-to-r from-[#B03A2E] to-[#B8860B] flex items-center justify-center text-[10px] font-black text-white px-2 transition-all duration-500 shadow-xs"
                style={{ width: `${100 - overallRecoveryPct}%` }}
                title={`Remaining Gap: ${totalRemainingGap} t (${100 - overallRecoveryPct}%)`}
              >
                <span className="truncate">{totalRemainingGap} t Gap ({100 - overallRecoveryPct}%)</span>
              </div>
            </div>

            {/* Segment Labels */}
            <div className={`flex justify-between text-[10px] font-mono ${textMuted}`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0E7C7B]" />
                <span>Potentially Recoverable: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalPotentiallyRecoverable} t</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B03A2E]" />
                <span>Remaining Gap: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalRemainingGap} t</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Total Gap: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalProjectedShortfall} t</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Mine-Level Recovery Breakdown (Compact Rows) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`font-headline font-black text-xs uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#0E7C7B] text-base">format_list_bulleted</span>
              MINE-LEVEL RECOVERY BREAKDOWN
            </h3>
            <span className={`text-[10px] font-mono ${textMuted}`}>
              Estimated impact per mine intervention
            </span>
          </div>

          <div className="space-y-3">
            {PORTFOLIO_RECOVERY_BREAKDOWN.map((mine) => {
              const isSurplus = mine.projectedShortfall === 0;

              return (
                <div
                  key={mine.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isDark ? nestedBg : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Left Mine Identification & Risk */}
                    <div className="space-y-1 md:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className={`font-headline font-black text-sm uppercase ${textPrimary}`}>
                          {mine.shortName}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-black uppercase"
                          style={{
                            color: isDark ? mine.riskColor : (mine.riskLevel === 'LOW' ? '#15803D' : mine.riskLevel === 'MEDIUM' ? '#B45309' : '#BE123C'),
                            backgroundColor: `${mine.riskColor}${isDark ? '18' : '22'}`,
                            border: `1px solid ${mine.riskColor}40`,
                          }}
                        >
                          {mine.riskLevel === 'LOW' ? '🟢 ON TRACK' : mine.riskLevel === 'HIGH' ? '🔴 HIGH RISK' : '🟡 MEDIUM RISK'}
                        </span>
                      </div>
                      <p className={`text-[11px] font-medium leading-tight ${textMuted}`}>
                        {mine.primaryAction}
                      </p>
                    </div>

                    {/* Middle Metric Columns */}
                    <div className="grid grid-cols-3 gap-3 md:w-1/2">
                      <div>
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${textMuted}`}>
                          SHORTFALL
                        </span>
                        <span className="font-mono font-bold text-xs" style={{ color: isSurplus ? '#2E7D32' : mine.riskColor }}>
                          {isSurplus ? '0 t (Surplus)' : `-${mine.projectedShortfall} t`}
                        </span>
                      </div>

                      <div>
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${textMuted}`}>
                          RECOVERABLE
                        </span>
                        <span className={`font-mono font-bold text-xs ${isSurplus ? textMuted : (isDark ? 'text-teal-300' : 'text-teal-700 font-extrabold')}`}>
                          {isSurplus ? '0 t' : `+${mine.potentiallyRecoverable} t`}
                        </span>
                      </div>

                      <div>
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${textMuted}`}>
                          RECOVERY RATE
                        </span>
                        <span className={`font-mono font-black text-xs ${
                          isSurplus ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-white' : 'text-slate-900')
                        }`}>
                          {isSurplus ? '100%' : `${mine.recoveryRatePct}%`}
                        </span>
                      </div>
                    </div>

                    {/* Right Open Mine Link */}
                    <div className="shrink-0 flex justify-end">
                      <button
                        onClick={() => onOpenMine(mine.id)}
                        className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border cursor-pointer ${
                          mine.id === 'dongri-buzurg'
                            ? 'bg-[#0E7C7B] hover:bg-[#0C6B6A] text-white border-teal-400/30 shadow-xs'
                            : isDark
                            ? 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                        }`}
                      >
                        {mine.id === 'dongri-buzurg' ? 'View Actions →' : 'Details 🔒'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Recovery Insight Sentence & Strategic Connection to National Impact */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark
            ? 'bg-gradient-to-r from-[#0E7C7B]/15 via-[#1F3864]/25 to-[#0E7C7B]/10 border-teal-500/30'
            : 'bg-gradient-to-r from-teal-500/10 via-teal-50 to-indigo-50 border-teal-300 shadow-xs'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-400 text-base">verified</span>
              <span className={`font-headline font-bold text-xs uppercase tracking-wider ${
                isDark ? 'text-teal-300' : 'text-teal-950 font-black'
              }`}>
                RECOVERY INTELLIGENCE INSIGHT
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              “Modeled corrective actions could potentially recover <strong className={isDark ? 'text-teal-300' : 'text-teal-700 font-black'}>{totalPotentiallyRecoverable} t</strong> of the portfolio's <strong className={isDark ? 'text-rose-400' : 'text-rose-700 font-black'}>{totalProjectedShortfall} t</strong> projected shortfall. Potentially preventing {totalPotentiallyRecoverable} t of shortfall directly strengthens domestic manganese availability.”
            </p>
          </div>

          <button
            onClick={scrollToNationalImpact}
            className="px-4 py-2 rounded-lg bg-[#0E7C7B] hover:bg-[#0C6B6A] text-white text-xs font-bold transition-all border border-teal-400/40 cursor-pointer shadow-md shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            <span>View National Impact</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. PORTFOLIO INSIGHT SECTION (EXISTING SECTION) */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-xl border space-y-4 flex flex-col justify-between ${cardBg}`}>
        <div className="space-y-1">
          <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
            <span className="material-symbols-outlined text-[#D97706] text-base">lightbulb</span>
            PORTFOLIO INSIGHT
          </h3>
          <p className={`text-xs font-medium ${textMuted}`}>
            Aggregated Operational Intelligence & Action Recommendation
          </p>
        </div>

        <div className={`p-4 rounded-lg border space-y-3 ${
          isDark
            ? 'bg-[#B03A2E]/10 border-[#B03A2E]/30'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-50 to-rose-500/5 border-rose-300 shadow-sm'
        }`}>
          <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            “1 mine is currently projected below its production target. <strong className={`font-bold ${isDark ? 'text-white' : 'text-rose-950'}`}>Dongri Buzurg</strong> has the largest projected shortfall and requires priority attention.”
          </p>

          <div className={`p-3 rounded-md border flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-rose-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isDark ? 'bg-[#B03A2E]/20 border border-[#B03A2E]/40 text-[#B03A2E]' : 'bg-rose-100 border border-rose-300 text-rose-700'
              }`}>
                <span className="material-symbols-outlined text-lg">priority_high</span>
              </div>
              <div>
                <span className={`font-headline font-black text-sm uppercase block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  DONGRI BUZURG
                </span>
                <span className={`text-[11px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Projected Shortfall: <strong className={isDark ? 'text-[#B03A2E]' : 'text-rose-700 font-black'}>-900 t</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenMine('dongri-buzurg')}
              className="px-4 py-2 rounded-lg bg-[#B03A2E] hover:bg-[#962F24] text-white text-xs font-bold transition-all border border-red-400/40 cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>Open Mine</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className={`text-[11px] font-mono ${textMuted}`}>
          * Operational recommendation generated from aggregated per-mine telemetry.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. NATIONAL IMPACT SECTION (STRATEGIC CLOSING CONTEXT - PRESERVED) */}
      {/* ========================================================================= */}
      <div id="national-impact-section" className={`space-y-6 pt-4 border-t scroll-mt-6 ${borderDivider}`}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className={`font-headline font-black text-lg sm:text-xl uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#0E7C7B] text-xl">public</span>
              NATIONAL IMPACT
            </h2>
            <p className={`text-xs font-medium ${textMuted}`}>
              Why domestic manganese intelligence matters.
            </p>
          </div>

          {/* Subtle Visual Connector Flow */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9.5px] font-mono font-bold ${
            isDark ? 'bg-[#14171C] border-white/10 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
          }`}>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>NATIONAL PRIORITY</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>MOIL DOMESTIC ROLE</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>MINE INTELLIGENCE</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className="text-[#D97706]">PRODUCTION DECISIONS</span>
          </div>
        </div>

        {/* Strategic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: INDIA'S MANGANESE IMPORT DEPENDENCY */}
          <div className={`p-6 sm:p-7 rounded-xl border space-y-4 relative overflow-hidden flex flex-col justify-between ${
            isDark ? cardBg : 'bg-gradient-to-br from-white via-teal-50/20 to-white border-teal-200 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E7C7B]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className={`flex items-start justify-between gap-2 border-b pb-3 ${borderDivider}`}>
                <h3 className={`font-headline font-extrabold text-xs sm:text-sm uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-teal-950 font-black'
                }`}>
                  INDIA'S MANGANESE IMPORT DEPENDENCY
                </h3>
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 text-[#0E7C7B]' : 'bg-teal-100 border border-teal-300 text-teal-700'
                }`}>
                  <span className="material-symbols-outlined text-base">swap_vert</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-headline font-black text-4xl sm:text-5xl text-[#0E7C7B] tracking-tight">
                  XX%
                </div>
                <span className={`inline-block mt-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600 font-bold'
                }`}>
                  [VERIFIED VALUE PLACEHOLDER]
                </span>
              </div>

              <p className={`text-xs sm:text-sm font-medium leading-relaxed pt-1 ${
                isDark ? 'text-slate-300' : 'text-slate-800 font-medium'
              }`}>
                “Domestic manganese supply remains strategically important for reducing dependence on imports.”
              </p>
            </div>

            <div className={`pt-4 border-t ${borderDivider} relative z-10 flex items-center justify-between`}>
              <span className={`text-[10px] font-mono ${textMuted}`}>
                Source: <span className={isDark ? 'text-slate-300 font-semibold' : 'text-slate-700 font-bold'}>[Verified Source / Indian Bureau of Mines Data]</span>
              </span>
            </div>
          </div>

          {/* CARD 2: MOIL'S SHARE OF DOMESTIC PRODUCTION */}
          <div className={`p-6 sm:p-7 rounded-xl border space-y-4 relative overflow-hidden flex flex-col justify-between ${
            isDark ? cardBg : 'bg-gradient-to-br from-white via-indigo-50/20 to-white border-indigo-200 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1F3864]/20 rounded-bl-full pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className={`flex items-start justify-between gap-2 border-b pb-3 ${borderDivider}`}>
                <h3 className={`font-headline font-extrabold text-xs sm:text-sm uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-indigo-950 font-black'
                }`}>
                  MOIL'S SHARE OF DOMESTIC PRODUCTION
                </h3>
                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-[#1F3864]/40 border border-indigo-400/30 text-indigo-300' : 'bg-indigo-100 border border-indigo-300 text-indigo-700'
                }`}>
                  <span className="material-symbols-outlined text-base">pie_chart</span>
                </div>
              </div>

              <div className="pt-2">
                <div className={`font-headline font-black text-4xl sm:text-5xl tracking-tight ${
                  isDark ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  XX%
                </div>
                <span className={`inline-block mt-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600 font-bold'
                }`}>
                  [VERIFIED VALUE PLACEHOLDER]
                </span>
              </div>

              <p className={`text-xs sm:text-sm font-medium leading-relaxed pt-1 ${
                isDark ? 'text-slate-300' : 'text-slate-800 font-medium'
              }`}>
                “MOIL plays a significant role in India's domestic manganese supply.”
              </p>
            </div>

            <div className={`pt-4 border-t ${borderDivider} relative z-10 flex items-center justify-between`}>
              <span className={`text-[10px] font-mono ${textMuted}`}>
                Source: <span className={isDark ? 'text-slate-300 font-semibold' : 'text-slate-700 font-bold'}>[Verified Source / MOIL Annual Report Data]</span>
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Connection Statement */}
        <div className={`p-4 rounded-xl border text-center ${
          isDark ? nestedBg : 'bg-slate-100/90 border-slate-300 shadow-xs'
        }`}>
          <p className={`text-xs sm:text-sm font-semibold max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            “From national resource priorities to mine-level decisions, the platform connects manganese intelligence with actionable production planning.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
