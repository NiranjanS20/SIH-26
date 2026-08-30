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

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  isDark = true,
  onOpenMine,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Reusable theme styles to match existing MOIL dashboard design system
  const cardBg = isDark ? 'bg-[#20242D] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const nestedBg = isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200';

  // Sorted list for Mine Performance cards (Dongri Buzurg, Chikla, Balaghat)
  const displayCardsOrder = ['dongri-buzurg', 'chikla', 'balaghat'];
  const mineCards = displayCardsOrder.map((id) =>
    PORTFOLIO_MINES_DATA.find((m) => m.id === id)!
  );

  // Sorted list for Ranking Table (by performance descending)
  const sortedRanking = [...PORTFOLIO_MINES_DATA].sort(
    (a, b) => b.performance - a.performance
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. PORTFOLIO PAGE HEADER & CONTROLS */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-xl border border-white/15 relative overflow-hidden shadow-xl min-h-[160px] flex flex-col justify-center text-white">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#001433]/85 via-[#001433]/60 to-[#001433]/80 backdrop-blur-[0.5px] z-5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#0E7C7B]/30 border border-[#0E7C7B]/50 text-emerald-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PORTFOLIO MANAGEMENT LAYER
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                3 MINES • Current Month
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
            <div className="flex items-center gap-2 bg-[#001433]/80 px-3.5 py-2 rounded-lg border border-white/20 text-xs font-semibold">
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
        <ShaderCard variant="teal" className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
              TOTAL PRODUCTION
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 flex items-center justify-center text-[#0E7C7B]">
              <span className="material-symbols-outlined text-lg">view_stream</span>
            </div>
          </div>

          <div className="mt-3">
            <div className={`font-headline font-black text-3xl sm:text-4xl ${textPrimary}`}>
              12,840 <span className="text-sm font-sans font-bold text-slate-400">t</span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${textMuted}`}>
              Current period
            </p>
          </div>
        </ShaderCard>

        {/* CARD 2: TOTAL TARGET */}
        <ShaderCard variant="indigo" className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
              TOTAL TARGET
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1F3864]/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-lg">track_changes</span>
            </div>
          </div>

          <div className="mt-3">
            <div className={`font-headline font-black text-3xl sm:text-4xl ${textPrimary}`}>
              14,000 <span className="text-sm font-sans font-bold text-slate-400">t</span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${textMuted}`}>
              Current period
            </p>
          </div>
        </ShaderCard>

        {/* CARD 3: PORTFOLIO PERFORMANCE */}
        <ShaderCard variant="amber" className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
              PORTFOLIO PERFORMANCE
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#D97706]">
              <span className="material-symbols-outlined text-lg">speed</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`font-headline font-black text-3xl sm:text-4xl ${textPrimary}`}>
                91.7%
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-[#D97706] border border-amber-500/30">
                -8.3% gap
              </span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${textMuted}`}>
              Of target
            </p>
          </div>
        </ShaderCard>

        {/* CARD 4: MINES AT RISK */}
        <ShaderCard variant="red" className="p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <span className={`text-[11px] font-black uppercase tracking-wider ${textMuted}`}>
              MINES AT RISK
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#B03A2E]/20 border border-[#B03A2E]/40 flex items-center justify-center text-[#B03A2E]">
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <div className="flex items-baseline gap-3">
              <span className="font-headline font-black text-3xl sm:text-4xl text-[#B03A2E]">
                1
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#B03A2E]/20 text-[#B03A2E] border border-[#B03A2E]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B03A2E] animate-ping" />
                High Risk
              </span>
            </div>
            <p className={`text-[11px] font-semibold mt-1 ${textMuted}`}>
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

            // Risk badge badge styling using strict color guidelines
            let badgeBg = 'bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/40';
            let riskDotColor = 'bg-[#2E7D32]';
            let riskLabel = '🟢 ON TRACK';

            if (isHighRisk) {
              badgeBg = 'bg-[#B03A2E]/20 text-[#B03A2E] border-[#B03A2E]/40';
              riskDotColor = 'bg-[#B03A2E]';
              riskLabel = '🔴 HIGH RISK';
            } else if (isMediumRisk) {
              badgeBg = 'bg-[#B8860B]/20 text-[#B8860B] border-[#B8860B]/40';
              riskDotColor = 'bg-[#B8860B]';
              riskLabel = '🟡 MEDIUM RISK';
            }

            return (
              <div
                key={mine.id}
                className={`p-6 rounded-xl border flex flex-col justify-between space-y-5 transition-all hover:border-white/30 hover:shadow-lg relative ${cardBg}`}
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
                  <div className={`p-3.5 rounded-lg border grid grid-cols-2 gap-3 ${nestedBg}`}>
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

                    <div className="pt-1 border-t border-white/10">
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${textMuted}`}>
                        VARIANCE
                      </span>
                      <span
                        className="font-headline font-black text-sm"
                        style={{ color: mine.riskColor }}
                      >
                        {mine.variance > 0 ? `+${mine.variance}` : mine.variance} t
                      </span>
                    </div>

                    <div className="pt-1 border-t border-white/10">
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
                      <div className="w-full h-2 rounded-full bg-slate-700/40 relative overflow-hidden border border-white/5">
                        {/* Actual bar */}
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(mine.performance, 100)}%`,
                            backgroundColor: mine.riskColor,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-0.5">
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
                        ? 'bg-[#1F3864] hover:bg-[#27467C] text-white border-indigo-400/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/15'
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
                <tr className={`border-b ${borderDivider} ${nestedBg}`}>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    RANK
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    MINE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    PRODUCTION
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    TARGET
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    VARIANCE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    PERFORMANCE
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    RISK
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider ${textMuted}`}>
                    STATUS
                  </th>
                  <th className={`px-4 py-3.5 font-mono text-[10px] font-black uppercase tracking-wider text-right ${textMuted}`}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderDivider}`}>
                {sortedRanking.map((mine, index) => {
                  return (
                    <tr
                      key={mine.id}
                      className="hover:bg-white/5 transition-colors group"
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
                        style={{ color: mine.riskColor }}
                      >
                        {mine.variance > 0 ? `+${mine.variance}` : mine.variance} t
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-black text-xs ${textPrimary}`}>
                            {mine.performance}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
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
                            color: mine.riskColor,
                            backgroundColor: `${mine.riskColor}18`,
                            border: `1px solid ${mine.riskColor}40`,
                          }}
                        >
                          {mine.risk}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold ${
                          mine.status === 'Surplus' ? 'text-[#2E7D32]' : 'text-slate-300'
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
                              : 'bg-white/10 hover:bg-white/20 text-slate-400 border-white/15'
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
      {/* 5. PORTFOLIO RISK DISTRIBUTION & PORTFOLIO INSIGHT */}
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

          <div className={`p-4 rounded-lg border space-y-4 ${nestedBg}`}>
            {/* HIGH RISK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-[#B03A2E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B03A2E]" />
                  HIGH RISK
                </span>
                <span className="font-mono text-white">1 Mine</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#B03A2E] w-[33.3%]" />
              </div>
            </div>

            {/* MEDIUM RISK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-[#B8860B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />
                  MEDIUM RISK
                </span>
                <span className="font-mono text-white">1 Mine</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#B8860B] w-[33.3%]" />
              </div>
            </div>

            {/* LOW RISK / ON TRACK ROW */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2 text-[#2E7D32]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                  LOW / ON TRACK
                </span>
                <span className="font-mono text-white">1 Mine</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#2E7D32] w-[33.3%]" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
            <span>TOTAL PROFILES: 3</span>
            <span className="text-[#B03A2E] font-bold">33% HIGH RISK</span>
          </div>
        </div>

        {/* PORTFOLIO INSIGHT PANEL (7 COLS) */}
        <div className={`lg:col-span-7 p-6 rounded-xl border space-y-4 flex flex-col justify-between ${cardBg}`}>
          <div className="space-y-1">
            <h3 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#D97706] text-base">lightbulb</span>
              PORTFOLIO INSIGHT
            </h3>
            <p className={`text-xs font-medium ${textMuted}`}>
              Aggregated Operational Intelligence & Action Recommendation
            </p>
          </div>

          <div className={`p-4 rounded-lg border space-y-3 bg-[#B03A2E]/10 border-[#B03A2E]/30`}>
            <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-200">
              “1 mine is currently projected below its production target. <strong className="text-white font-bold">Dongri Buzurg</strong> has the largest projected shortfall and requires priority attention.”
            </p>

            <div className="p-3 rounded-md bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#B03A2E]/20 border border-[#B03A2E]/40 flex items-center justify-center text-[#B03A2E] shrink-0">
                  <span className="material-symbols-outlined text-lg">priority_high</span>
                </div>
                <div>
                  <span className="font-headline font-black text-sm text-white uppercase block">
                    DONGRI BUZURG
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    Projected Shortfall: <strong className="text-[#B03A2E]">-900 t</strong>
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

          <div className="text-[11px] text-slate-400 font-mono">
            * Operational recommendation generated from aggregated per-mine telemetry.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. NATIONAL IMPACT SECTION (STRATEGIC CLOSING CONTEXT) */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4 border-t border-white/10">
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
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171C] border border-white/10 text-[9.5px] font-mono font-bold text-slate-400">
            <span className="text-white">NATIONAL PRIORITY</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className="text-white">MOIL DOMESTIC ROLE</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className="text-white">MINE INTELLIGENCE</span>
            <span className="text-[#0E7C7B]">→</span>
            <span className="text-[#D97706]">PRODUCTION DECISIONS</span>
          </div>
        </div>

        {/* Strategic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: INDIA'S MANGANESE IMPORT DEPENDENCY */}
          <div className={`p-6 sm:p-7 rounded-xl border space-y-4 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E7C7B]/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-start justify-between gap-2 border-b pb-3 border-white/10">
                <h3 className="font-headline font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-200">
                  INDIA'S MANGANESE IMPORT DEPENDENCY
                </h3>
                <div className="w-7 h-7 rounded bg-[#0E7C7B]/15 border border-[#0E7C7B]/30 flex items-center justify-center text-[#0E7C7B] shrink-0">
                  <span className="material-symbols-outlined text-base">swap_vert</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-headline font-black text-4xl sm:text-5xl text-[#0E7C7B] tracking-tight">
                  XX%
                </div>
                <span className="inline-block mt-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                  [VERIFIED VALUE PLACEHOLDER]
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300 pt-1">
                “Domestic manganese supply remains strategically important for reducing dependence on imports.”
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                Source: <span className="text-slate-300 font-semibold">[Verified Source / Indian Bureau of Mines Data]</span>
              </span>
            </div>
          </div>

          {/* CARD 2: MOIL'S SHARE OF DOMESTIC PRODUCTION */}
          <div className={`p-6 sm:p-7 rounded-xl border space-y-4 relative overflow-hidden flex flex-col justify-between ${cardBg}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1F3864]/20 rounded-bl-full pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-start justify-between gap-2 border-b pb-3 border-white/10">
                <h3 className="font-headline font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-200">
                  MOIL'S SHARE OF DOMESTIC PRODUCTION
                </h3>
                <div className="w-7 h-7 rounded bg-[#1F3864]/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <span className="material-symbols-outlined text-base">pie_chart</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-headline font-black text-4xl sm:text-5xl text-indigo-300 tracking-tight">
                  XX%
                </div>
                <span className="inline-block mt-1 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                  [VERIFIED VALUE PLACEHOLDER]
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-300 pt-1">
                “MOIL plays a significant role in India's domestic manganese supply.”
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400">
                Source: <span className="text-slate-300 font-semibold">[Verified Source / MOIL Annual Report Data]</span>
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Connection Statement */}
        <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
          <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-3xl mx-auto leading-relaxed">
            “From national resource priorities to mine-level decisions, the platform connects manganese intelligence with actionable production planning.”
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
