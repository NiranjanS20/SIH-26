import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface CustomerViewProps {
  isDark?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  isDark = true,
  onNavigateTab,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Tata Steel');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Next 3 Months');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Theme styling tokens
  const cardBg = isDark ? 'bg-[#20242D] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const nestedBg = isDark ? 'bg-[#14171C] border-white/10' : 'bg-slate-50 border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDark ? 'border-white/10' : 'border-slate-200';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ECharts Supply vs Requirement Area Chart
  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const months = ['Current Month (Aug)', 'Next Month (Sep)', 'Month +2 (Oct)', 'Month +3 (Nov)'];
    const requirement = [6500, 6500, 7000, 6500];
    const availableSupply = [6800, 6600, 5500, 6400];
    const projectedSupply = [6700, 6500, 5300, 6300];

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#181b20' : '#ffffff',
        borderColor: isDark ? '#334155' : '#cbd5e1',
        textStyle: { color: isDark ? '#ffffff' : '#0f172a', fontSize: 12 },
        formatter: (params: any) => {
          let res = `<div style="font-weight: 800; margin-bottom: 4px;">${params[0].name}</div>`;
          params.forEach((item: any) => {
            res += `<div style="display: flex; justify-content: space-between; gap: 16px; margin: 2px 0;">
              <span style="color: ${item.color}">● ${item.seriesName}:</span>
              <span style="font-weight: 800;">${item.value.toLocaleString()} t</span>
            </div>`;
          });
          return res;
        },
      },
      legend: {
        data: ['CUSTOMER REQUIREMENT', 'MOIL AVAILABLE SUPPLY', 'PROJECTED SUPPLY'],
        textStyle: { color: isDark ? '#94a3b8' : '#475569', fontSize: 11, fontWeight: 'bold' },
        top: 0,
        right: 0,
      },
      grid: {
        top: 35,
        left: 45,
        right: 20,
        bottom: 25,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: isDark ? '#334155' : '#cbd5e1' } },
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'bold' },
      },
      yAxis: {
        type: 'value',
        name: 'Tonnes (t)',
        nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', type: 'dashed' } },
        axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
      },
      series: [
        {
          name: 'CUSTOMER REQUIREMENT',
          type: 'line',
          data: requirement,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#38bdf8', type: 'dashed' },
          itemStyle: { color: '#38bdf8' },
        },
        {
          name: 'MOIL AVAILABLE SUPPLY',
          type: 'line',
          data: availableSupply,
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 2.5, color: '#0E7C7B' },
          itemStyle: { color: '#0E7C7B' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(14, 124, 123, 0.35)' },
              { offset: 1, color: 'rgba(14, 124, 123, 0.02)' },
            ]),
          },
        },
        {
          name: 'PROJECTED SUPPLY',
          type: 'line',
          data: projectedSupply,
          smooth: true,
          symbolSize: 6,
          lineStyle: { width: 2.5, color: '#F59E0B' },
          itemStyle: { color: '#F59E0B' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.35)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDark]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#242830] text-white p-4 rounded-xl shadow-2xl border border-amber-500/50 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-amber-400 text-xl shrink-0 mt-0.5">info</span>
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-amber-400">Customer Decision Support</p>
            <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white text-sm cursor-pointer ml-1">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER & CONTROLS BAR */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden shadow-xl ${
        isDark ? 'bg-gradient-to-r from-[#001D42] via-[#002452] to-[#12233D] border-white/15 text-white' : 'bg-gradient-to-r from-[#1F3864] via-[#254A85] to-[#122B54] text-white border-[#1F3864]'
      }`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#0E7C7B]/30 border border-[#0E7C7B]/50 text-emerald-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CUSTOMER SUPPLY VIEW
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
                SIMULATED CUSTOMER PROFILE
              </span>
            </div>
            <h1 className="font-headline font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-none">
              CUSTOMER SUPPLY INTELLIGENCE
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Supply intelligence for downstream manganese buyers.
            </p>
          </div>

          {/* Right Selectors */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-[#001433]/90 px-3.5 py-2 rounded-xl border border-white/20 text-xs font-semibold backdrop-blur-md">
              <span className="text-slate-300 text-[11px] font-mono">CUSTOMER:</span>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                <option value="Tata Steel" className="bg-[#1F3864] text-white">Tata Steel ▼</option>
                <option value="JSW Steel (Demo)" className="bg-[#1F3864] text-white">JSW Steel (Demo)</option>
                <option value="SAIL (Demo)" className="bg-[#1F3864] text-white">SAIL (Demo)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#001433]/90 px-3.5 py-2 rounded-xl border border-white/20 text-xs font-semibold backdrop-blur-md">
              <span className="text-slate-300 text-[11px] font-mono">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer pr-1"
              >
                <option value="Next 3 Months" className="bg-[#1F3864] text-white">Next 3 Months ▼</option>
                <option value="This Month" className="bg-[#1F3864] text-white">This Month</option>
                <option value="Q3 FY26" className="bg-[#1F3864] text-white">Q3 FY26</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CUSTOMER SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black">
              <span className="material-symbols-outlined">factory</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-[#FEA619] tracking-widest uppercase block">
                DOWNSTREAM STEEL CUSTOMER
              </span>
              <h2 className={`font-headline font-black text-2xl uppercase tracking-wider ${textPrimary}`}>
                {selectedCustomer.toUpperCase()}
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 border border-slate-700 px-3 py-1 rounded-full uppercase">
            DEMO DATA PROFILE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">FORECAST SUPPLY</span>
              <span className="material-symbols-outlined text-base text-teal-400">local_shipping</span>
            </div>
            <span className={`font-headline font-black text-3xl sm:text-4xl block ${textPrimary}`}>18,500 t</span>
            <span className="text-xs font-semibold text-emerald-400 block">Next 3 months projected delivery</span>
          </div>

          {/* KPI 2 */}
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">SUPPLY COVERAGE</span>
              <span className="material-symbols-outlined text-base text-blue-400">pie_chart</span>
            </div>
            <span className="font-headline font-black text-3xl sm:text-4xl text-blue-400 block">92%</span>
            <span className="text-xs font-semibold text-slate-300 block">Of projected requirement</span>
          </div>

          {/* KPI 3 */}
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">AVERAGE Mn GRADE</span>
              <span className="material-symbols-outlined text-base text-amber-400">science</span>
            </div>
            <span className="font-headline font-black text-3xl sm:text-4xl text-amber-400 block">44.2%</span>
            <span className="text-xs font-semibold text-amber-300/90 block">Target specification (≥40%)</span>
          </div>

          {/* KPI 4 */}
          <div className={`p-5 rounded-2xl border ${cardBg} space-y-3 relative overflow-hidden`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">SUPPLY RISK</span>
              <span className="material-symbols-outlined text-base text-amber-500">warning</span>
            </div>
            <span className="font-headline font-black text-3xl sm:text-4xl text-amber-400 block">MEDIUM</span>
            <span className="text-xs font-semibold text-amber-300/90 block">1 potential disruption (Oct)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUPPLY VS REQUIREMENT (MAIN VISUAL) */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3 ${borderDivider}`}>
          <div>
            <h2 className={`font-headline font-black text-base uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-[#0E7C7B] text-lg">show_chart</span>
              SUPPLY VS REQUIREMENT
            </h2>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              Comparison of customer modeled requirement against MOIL's projected available supply.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              AUG-SEP: SURPLUS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
              OCT: SHORTFALL
            </span>
          </div>
        </div>

        {/* EChart Container */}
        <div ref={chartRef} className="w-full h-72 sm:h-80" />
      </div>

      {/* ========================================================================= */}
      {/* 3. SUPPLY COVERAGE BARS & HIGHLIGHT */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
          <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
            <span className="material-symbols-outlined text-amber-400 text-base">donut_large</span>
            SUPPLY COVERAGE BREAKDOWN
          </h2>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
            🟡 POTENTIAL SHORTFALL
          </span>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>CUSTOMER REQUIREMENT</span>
            <span className={`font-headline font-black text-2xl sm:text-3xl block mt-1 ${textPrimary}`}>20,000 t</span>
          </div>

          <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>MOIL PROJECTED SUPPLY</span>
            <span className="font-headline font-black text-2xl sm:text-3xl text-teal-400 block mt-1">18,500 t</span>
          </div>

          <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>COVERAGE RATE</span>
            <span className="font-headline font-black text-2xl sm:text-3xl text-blue-400 block mt-1">92%</span>
          </div>

          <div className={`p-4 rounded-xl border text-center ${nestedBg}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${textMuted}`}>SUPPLY GAP</span>
            <span className="font-headline font-black text-2xl sm:text-3xl text-amber-400 block mt-1">1,500 t</span>
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="space-y-3">
          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-amber-400 h-full rounded-full" style={{ width: '92%' }} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className={`text-xs font-semibold ${textSecondary}`}>
              “Projected MOIL supply may cover <strong className="text-amber-400 font-bold">92%</strong> of the customer's requirement for the selected period.”
            </p>
            <button
              onClick={() => showToast("Viewing supply risk details for Tata Steel's October allocation.")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0"
            >
              <span>View Supply Risk</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SOURCE MINE BREAKDOWN & 5. ORE QUALITY PROFILE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SOURCE MINE BREAKDOWN (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4 flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
              <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-teal-400 text-base">domain</span>
                SUPPLY BY MINE
              </h2>
              <span className={`text-[10px] font-mono ${textMuted}`}>3 CONTRIBUTING MINES</span>
            </div>

            <div className="space-y-4">
              {/* Mine 1 */}
              <div className={`p-4 rounded-xl border ${nestedBg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-sm text-white">DONGRI BUZURG</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      🔴 Medium Risk
                    </span>
                  </div>
                  <span className="font-headline font-black text-base text-amber-400">7,500 t</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '40.5%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Expected Availability: Oct 22</span>
                  <span>40.5% of total supply</span>
                </div>
              </div>

              {/* Mine 2 */}
              <div className={`p-4 rounded-xl border ${nestedBg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-sm text-white">CHIKLA</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      🟢 Low Risk
                    </span>
                  </div>
                  <span className="font-headline font-black text-base text-emerald-400">6,200 t</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '33.5%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Expected Availability: Immediate</span>
                  <span>33.5% of total supply</span>
                </div>
              </div>

              {/* Mine 3 */}
              <div className={`p-4 rounded-xl border ${nestedBg} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-sm text-white">BALAGHAT</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      🟡 Medium Risk
                    </span>
                  </div>
                  <span className="font-headline font-black text-base text-blue-400">4,800 t</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '26.0%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Expected Availability: Immediate</span>
                  <span>26.0% of total supply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ORE QUALITY PROFILE (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4 flex flex-col justify-between`}>
          <div>
            <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
              <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-amber-400 text-base">science</span>
                ORE QUALITY PROFILE
              </h2>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                ✓ High Grade Met Ore
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>CHEMICAL SPECIFICATION</span>
                <span className="font-mono text-slate-400">AVAILABLE VS REQUIRED</span>
              </div>

              {/* Spec Rows */}
              {[
                { label: 'Mn Content', avail: '44.2%', req: '≥ 40.0%', pct: 88, status: '✓ Within requirement', color: 'bg-emerald-400' },
                { label: 'Fe Content', avail: '6.8%', req: '≤ 8.0%', pct: 68, status: '✓ Within requirement', color: 'bg-teal-400' },
                { label: 'SiO₂ Content', avail: '7.2%', req: '≤ 9.0%', pct: 72, status: '✓ Within requirement', color: 'bg-blue-400' },
                { label: 'Phosphorus (P)', avail: '0.08%', req: '≤ 0.12%', pct: 60, status: '✓ Within requirement', color: 'bg-purple-400' },
                { label: 'Moisture', avail: '3.5%', req: '≤ 5.0%', pct: 50, status: '✓ Within requirement', color: 'bg-indigo-400' },
              ].map((spec) => (
                <div key={spec.label} className={`p-2.5 rounded-xl border ${nestedBg} space-y-1.5`}>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white">{spec.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono">Available: {spec.avail}</span>
                      <span className="text-slate-400 font-mono">Req: {spec.req}</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${spec.color} rounded-full`} style={{ width: `${spec.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SUPPLY RELIABILITY & 7. SUPPLY RISK FACTORS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SUPPLY RELIABILITY (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-blue-400 text-base">verified</span>
              SUPPLY RELIABILITY
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">HIGH RELIABILITY SCORE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Big Score Card */}
            <div className={`sm:col-span-5 p-5 rounded-2xl border text-center ${nestedBg} space-y-1`}>
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">RELIABILITY INDEX</span>
              <span className="font-headline font-black text-4xl sm:text-5xl text-emerald-400 block drop-shadow-md">92/100</span>
              <span className="text-[11px] font-bold text-slate-300 block">High Fulfillment Rating</span>
            </div>

            {/* Metrics List */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Forecast Reliability:</span>
                <span className="text-emerald-400 font-mono">High (95.2%)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">On-Time Supply Rate:</span>
                <span className="text-emerald-400 font-mono">94.5%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Historical Fulfilment:</span>
                <span className="text-blue-400 font-mono">91.8%</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Production Stability:</span>
                <span className="text-amber-400 font-mono">89.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUPPLY RISK FACTORS (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-amber-400 text-base">error_outline</span>
              SUPPLY RISK FACTORS
            </h2>
            <span className={`text-[10px] font-mono ${textMuted}`}>POTENTIAL DISRUPTION CAUSES</span>
          </div>

          <div className="space-y-2.5">
            {[
              { factor: 'Production shortfall', pct: 38, color: 'bg-amber-500' },
              { factor: 'Equipment downtime', pct: 25, color: 'bg-orange-500' },
              { factor: 'Weather disruption', pct: 18, color: 'bg-blue-500' },
              { factor: 'Blasting delay', pct: 12, color: 'bg-purple-500' },
              { factor: 'Logistics', pct: 7, color: 'bg-slate-400' },
            ].map((item) => (
              <div key={item.factor} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">{item.factor}</span>
                  <span className="font-mono text-amber-400">{item.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. SUPPLY RISK ALERT BANNER & 9. ALTERNATIVE SUPPLY OPTIONS */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Risk Banner */}
        <div className="p-6 rounded-2xl bg-amber-500/15 border border-amber-400/40 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-2xl shrink-0 mt-0.5">warning</span>
              <div>
                <h3 className="font-headline font-black text-lg text-amber-300 uppercase tracking-wider">
                  🟡 SUPPLY RISK ALERT
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-1">
                  Potential <strong>1,500 t</strong> supply gap in October. Primary affected source: <strong>Dongri Buzurg</strong> (Reason: Projected production shortfall).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('shortfall-diagnosis');
                  showToast("Navigating to Dongri Buzurg mine risk diagnosis...");
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                View Mine Risk →
              </button>
              <button
                onClick={() => showToast("Alternative supply sources filtered below.")}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Explore Alternative Supply →
              </button>
            </div>
          </div>
        </div>

        {/* ALTERNATIVE SUPPLY OPTIONS */}
        <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-teal-400 text-base">alt_route</span>
              ALTERNATIVE SUPPLY OPTIONS
            </h2>
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase border border-blue-500/30">
              DECISION-SUPPORT SUGGESTIONS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Primary */}
            <div className={`p-5 rounded-2xl border ${nestedBg} space-y-3 relative opacity-85`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRIMARY SOURCE</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">Medium Risk</span>
              </div>
              <span className="font-headline font-black text-xl text-white block">Dongri Buzurg</span>
              <span className="font-headline font-bold text-2xl text-amber-400 block">7,500 t</span>
              <span className="text-xs text-slate-400 block">Primary allocated lease</span>
            </div>

            {/* Alt 1 */}
            <div className={`p-5 rounded-2xl border border-emerald-500/40 ${nestedBg} space-y-3 relative shadow-lg`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ALTERNATIVE SOURCE 1</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">🟢 Low Risk</span>
              </div>
              <span className="font-headline font-black text-xl text-white block">Chikla Mine</span>
              <span className="font-headline font-bold text-2xl text-emerald-400 block">+ 2,000 t potential</span>
              <span className="text-xs text-emerald-300 font-semibold block">High availability reserve ready</span>
            </div>

            {/* Alt 2 */}
            <div className={`p-5 rounded-2xl border border-blue-500/30 ${nestedBg} space-y-3 relative shadow-lg`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ALTERNATIVE SOURCE 2</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">🟡 Medium Risk</span>
              </div>
              <span className="font-headline font-black text-xl text-white block">Balaghat Mine</span>
              <span className="font-headline font-bold text-2xl text-blue-400 block">+ 1,200 t potential</span>
              <span className="text-xs text-blue-300 font-semibold block">Secondary underground backup</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10. AVAILABILITY CALENDAR & 11. LOGISTICS SNAPSHOT */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* AVAILABILITY CALENDAR (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-amber-400 text-base">calendar_month</span>
              SUPPLY AVAILABILITY TIMELINE
            </h2>
            <span className={`text-[10px] font-mono ${textMuted}`}>NEXT 3 MONTHS</span>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-4 text-xs font-bold text-slate-400 border-b pb-2">
              <span>MINE</span>
              <span className="text-center">AUG</span>
              <span className="text-center">SEP</span>
              <span className="text-center">OCT</span>
            </div>

            {[
              { mine: 'Dongri Buzurg', aug: 'Green', sep: 'Green', oct: 'Amber' },
              { mine: 'Chikla', aug: 'Green', sep: 'Green', oct: 'Green' },
              { mine: 'Balaghat', aug: 'Green', sep: 'Green', oct: 'Amber' },
            ].map((row) => (
              <div key={row.mine} className="grid grid-cols-4 items-center text-xs font-bold py-1">
                <span className="text-white">{row.mine}</span>
                <div className="flex justify-center">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">🟢 Available</span>
                </div>
                <div className="flex justify-center">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">🟢 Available</span>
                </div>
                <div className="flex justify-center">
                  {row.oct === 'Green' ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">🟢 Available</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">🟡 Constraint</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOGISTICS SNAPSHOT (6 COLS) */}
        <div className={`lg:col-span-6 p-6 rounded-2xl border ${cardBg} space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
            <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <span className="material-symbols-outlined text-blue-400 text-base">local_shipping</span>
              LOGISTICS SNAPSHOT
            </h2>
            <span className={`text-[10px] font-mono ${textMuted}`}>TRANSIT TO TATA STEEL</span>
          </div>

          <div className="space-y-3">
            {[
              { mine: 'Dongri Buzurg', dist: '680 km', time: '2-3 days', risk: 'Low Risk', color: 'text-emerald-400' },
              { mine: 'Chikla', dist: '710 km', time: '2-3 days', risk: 'Medium Risk', color: 'text-amber-400' },
              { mine: 'Balaghat', dist: '740 km', time: '3-4 days', risk: 'Low Risk', color: 'text-emerald-400' },
            ].map((log) => (
              <div key={log.mine} className={`p-3 rounded-xl border ${nestedBg} flex items-center justify-between text-xs`}>
                <div>
                  <span className="font-headline font-black text-white block">{log.mine}</span>
                  <span className="text-slate-400 text-[11px]">{log.dist} • {log.time} transit</span>
                </div>
                <span className={`font-bold ${log.color}`}>{log.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. SUSTAINABILITY & RESPONSIBLE SUPPLY */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
        <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
          <h2 className={`font-headline font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
            <span className="material-symbols-outlined text-emerald-400 text-base">eco</span>
            RESPONSIBLE SUPPLY & SUSTAINABILITY
          </h2>
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
            ESG COMPLIANT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ENVIRONMENTAL</span>
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ● Active (ISO 14001)
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MINE COMPLIANCE</span>
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ● Monitored (DGMS)
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SAFETY PERFORMANCE</span>
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ● Zero LTI Record
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ESG REPORTING</span>
            <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ● Verified Available
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 13. CUSTOMER SUPPLY OUTLOOK & 14. ACTIONS */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${cardBg} space-y-6 shadow-2xl`}>
        <div className="space-y-3">
          <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase block">
            EXECUTIVE SUMMARY
          </span>
          <h2 className={`font-headline font-black text-2xl uppercase tracking-wider ${textPrimary}`}>
            CUSTOMER SUPPLY OUTLOOK
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed font-semibold ${textSecondary}`}>
            “MOIL is projected to cover <strong className="text-amber-400 font-bold">92%</strong> of Tata Steel's modeled manganese requirement for the selected period. A potential 1,500 t gap is concentrated around Dongri Buzurg's production risk.”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">PRIMARY RISK</span>
            <span className="font-headline font-black text-base text-amber-400 block">Dongri Buzurg Opencast Mine</span>
          </div>
          <div className={`p-4 rounded-xl border ${nestedBg} space-y-1`}>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">RECOMMENDED RESPONSE</span>
            <span className="font-headline font-black text-base text-emerald-400 block">Consider alternative supply from Chikla</span>
          </div>
        </div>

        {/* 14. CUSTOMER ACTIONS */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase block">
            PROTOTYPE DECISION-SUPPORT ACTIONS
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => showToast("Supply details report generated for Tata Steel.")}
              className="py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Request Supply Details
            </button>
            <button
              onClick={() => showToast("Product Specifications sheet downloaded.")}
              className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              View Product Specifications
            </button>
            <button
              onClick={() => showToast("Filtered to Chikla and Balaghat alternative allocations.")}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Explore Alternative Supply
            </button>
            <button
              onClick={() => showToast("MOIL Downstream Commercial Cell initiated.")}
              className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Contact MOIL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
