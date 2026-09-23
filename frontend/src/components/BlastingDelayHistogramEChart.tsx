// ==============================================================================
// MOIL Blasting Delay Frequency & Impact Histogram ECharts Component
// Provides interactive root-cause frequency and downtime impact analytics for blasting
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export interface BlastingDelayDataPoint {
  reasonKey: string;
  category: string;
  label: string;
  frequencyCount: number; // occurrences in last 30 operational cycles
  totalDelayHours: number; // aggregate delay hours
  tonnageLost: number; // estimated ore throughput delayed
  color: string;
  secondaryColor: string;
  benchmarkTarget: number;
}

export const DEFAULT_BLASTING_DELAY_STATS: BlastingDelayDataPoint[] = [
  {
    reasonKey: 'DGMS_SAFETY_CLEARANCE',
    category: 'Regulatory',
    label: 'DGMS Safety Clearance Lag',
    frequencyCount: 14,
    totalDelayHours: 24.5,
    tonnageLost: 3680,
    color: '#D97706',
    secondaryColor: '#F59E0B',
    benchmarkTarget: 4,
  },
  {
    reasonKey: 'WET_HOLES_PUMPING',
    category: 'Geotechnical',
    label: 'Wet Holes & Sump Dewatering',
    frequencyCount: 11,
    totalDelayHours: 18.2,
    tonnageLost: 2750,
    color: '#0284C7',
    secondaryColor: '#38BDF8',
    benchmarkTarget: 3,
  },
  {
    reasonKey: 'EXPLOSIVE_LOGISTICS',
    category: 'Logistics',
    label: 'Explosive Van & PESO Dispatch',
    frequencyCount: 7,
    totalDelayHours: 11.5,
    tonnageLost: 1720,
    color: '#8B5CF6',
    secondaryColor: '#A78BFA',
    benchmarkTarget: 2,
  },
  {
    reasonKey: 'PERIMETER_EVACUATION',
    category: 'Operational',
    label: 'Buffer Zone Haul Evacuation',
    frequencyCount: 6,
    totalDelayHours: 8.8,
    tonnageLost: 1320,
    color: '#EC4899',
    secondaryColor: '#F472B6',
    benchmarkTarget: 2,
  },
  {
    reasonKey: 'MISFIRE_DETONATION_LAG',
    category: 'Technical',
    label: 'Shock Tube & Detonator Testing',
    frequencyCount: 4,
    totalDelayHours: 5.5,
    tonnageLost: 820,
    color: '#E11D48',
    secondaryColor: '#FB7185',
    benchmarkTarget: 1,
  },
  {
    reasonKey: 'LIGHTNING_WEATHER',
    category: 'Environmental',
    label: 'Lightning & Cloudburst Protocol',
    frequencyCount: 3,
    totalDelayHours: 4.8,
    tonnageLost: 720,
    color: '#0D9488',
    secondaryColor: '#2DD4BF',
    benchmarkTarget: 1,
  },
  {
    reasonKey: 'DRILLING_BURDEN_DEFECT',
    category: 'Drilling',
    label: 'Drill Burden & Collar Correction',
    frequencyCount: 2,
    totalDelayHours: 3.1,
    tonnageLost: 460,
    color: '#64748B',
    secondaryColor: '#94A3B8',
    benchmarkTarget: 1,
  },
];

interface BlastingDelayHistogramEChartProps {
  themeMode?: 'dark' | 'light';
  customData?: BlastingDelayDataPoint[];
  activeFilter?: string | null;
  onSelectCategory?: (key: string) => void;
}

export const BlastingDelayHistogramEChart: React.FC<BlastingDelayHistogramEChartProps> = ({
  themeMode = 'dark',
  customData = DEFAULT_BLASTING_DELAY_STATS,
  activeFilter,
  onSelectCategory,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [metricMode, setMetricMode] = useState<'FREQUENCY' | 'HOURS' | 'TONNAGE'>('FREQUENCY');

  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Sort descending by selected metric
    const sorted = [...customData].sort((a, b) => {
      if (metricMode === 'FREQUENCY') return b.frequencyCount - a.frequencyCount;
      if (metricMode === 'HOURS') return b.totalDelayHours - a.totalDelayHours;
      return b.tonnageLost - a.tonnageLost;
    });

    const categories = sorted.map((d) => d.label);
    const primaryValues = sorted.map((d) => {
      if (metricMode === 'FREQUENCY') return d.frequencyCount;
      if (metricMode === 'HOURS') return d.totalDelayHours;
      return d.tonnageLost;
    });
    const benchmarkValues = sorted.map((d) => {
      if (metricMode === 'FREQUENCY') return d.benchmarkTarget;
      if (metricMode === 'HOURS') return Number((d.benchmarkTarget * 1.5).toFixed(1));
      return d.benchmarkTarget * 250;
    });

    const unitLabel = metricMode === 'FREQUENCY' ? 'Incidents' : metricMode === 'HOURS' ? 'Hours' : 'Tons';

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        padding: [10, 14],
        textStyle: {
          color: isDark ? '#F8FAFC' : '#0F172A',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const item = sorted[idx];
          return `
            <div style="font-weight:bold;font-size:13px;margin-bottom:4px;color:${item.secondaryColor};">
              ${item.label}
            </div>
            <div style="font-size:11px;color:${isDark ? '#94A3B8' : '#64748B'};margin-bottom:6px;">
              Category: <strong>${item.category}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:2px;">
              <span>• Delay Incidents:</span>
              <strong style="color:${isDark ? '#FFF' : '#000'}">${item.frequencyCount} occurrences</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:2px;">
              <span>• Total Delay Time:</span>
              <strong style="color:#F59E0B">${item.totalDelayHours} hrs</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;">
              <span>• Delayed Tonnage:</span>
              <strong style="color:#EF4444">${item.tonnageLost.toLocaleString()} t</strong>
            </div>
          `;
        },
      },
      legend: {
        data: ['Observed Metric', 'Benchmark PAR'],
        right: '4%',
        top: '2%',
        textStyle: {
          color: isDark ? '#94A3B8' : '#475569',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      grid: {
        left: '2%',
        right: '4%',
        top: '16%',
        bottom: '8%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' },
        },
        axisLabel: {
          color: isDark ? '#CBD5E1' : '#334155',
          fontSize: 11,
          fontWeight: 600,
          interval: 0,
          rotate: 15,
          formatter: (value: string) => {
            return value.length > 18 ? value.slice(0, 16) + '...' : value;
          },
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        name: unitLabel,
        nameTextStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
          padding: [0, 0, 0, 10],
        },
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
        },
      },
      series: [
        {
          name: 'Observed Metric',
          type: 'bar',
          barWidth: '38%',
          data: primaryValues.map((val, i) => ({
            value: val,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: sorted[i].secondaryColor },
                { offset: 1, color: sorted[i].color },
              ]),
              borderRadius: [6, 6, 0, 0],
              shadowBlur: activeFilter === sorted[i].reasonKey ? 10 : 0,
              shadowColor: sorted[i].secondaryColor,
            },
          })),
          label: {
            show: true,
            position: 'top',
            color: isDark ? '#E2E8F0' : '#1E293B',
            fontSize: 11,
            fontWeight: 700,
            formatter: (params: any) => {
              const v = params.value;
              return metricMode === 'TONNAGE' ? `${v}t` : metricMode === 'HOURS' ? `${v}h` : `${v}`;
            },
          },
        },
        {
          name: 'Benchmark PAR',
          type: 'line',
          data: benchmarkValues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#10B981' },
          lineStyle: {
            color: '#10B981',
            width: 2,
            type: 'dashed',
          },
        },
      ],
    };

    chartInstance.current.setOption(option, true);

    const clickHandler = (params: any) => {
      const idx = params.dataIndex;
      if (onSelectCategory && sorted[idx]) {
        onSelectCategory(sorted[idx].reasonKey);
      }
    };
    chartInstance.current.off('click');
    chartInstance.current.on('click', clickHandler);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [customData, metricMode, isDark, activeFilter, onSelectCategory]);

  const totalIncidents = customData.reduce((acc, c) => acc + c.frequencyCount, 0);
  const totalHours = customData.reduce((acc, c) => acc + c.totalDelayHours, 0);
  const totalTons = customData.reduce((acc, c) => acc + c.tonnageLost, 0);

  return (
    <div className="space-y-4">
      {/* Top Metric Switcher & Statistical Highlights */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-lg">bar_chart</span>
            <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Blasting Delay Frequency & Downtime Histogram
            </h4>
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            30-Day empirical root-cause distribution showing delay occurrences vs statutory benchmark
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <button
            type="button"
            onClick={() => setMetricMode('FREQUENCY')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'FREQUENCY'
                ? 'bg-[#002452] text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incident Count
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('HOURS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'HOURS'
                ? 'bg-[#002452] text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delay Hours
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('TONNAGE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              metricMode === 'TONNAGE'
                ? 'bg-[#002452] text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tonnage Lost
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        ref={chartRef}
        className={`w-full h-72 sm:h-80 rounded-2xl border p-2 transition-all ${
          isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      />

      {/* Mini KPI Summary Cards for Blasting Delays */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-[#14171C] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">event_busy</span>
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total 30D Delay Events</span>
            <span className={`text-base font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalIncidents} Blasts</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-[#14171C] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">timer_off</span>
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cumulative Delay Time</span>
            <span className={`text-base font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalHours.toFixed(1)} Hours</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-[#14171C] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-lg">production_quantity_limits</span>
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Delayed Fragmentation Yield</span>
            <span className={`text-base font-black font-headline ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalTons.toLocaleString()} Tonnes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
