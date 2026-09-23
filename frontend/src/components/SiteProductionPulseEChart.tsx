// ==============================================================================
// SiteProductionPulseEChart.tsx
// Interactive Apache ECharts visualizer for Site Manager Production Pulse,
// Current Mine Bench & Face Velocity Breakdown, and Statutory / DGMS Compliance Radar.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export interface ProductionPulseDataPoint {
  hour: string;
  actualTonsPerHour: number;
  plannedTonsPerHour: number;
  statutoryParTonsPerHour: number;
  dumperTrips: number;
  shovelPayloadIndex: number;
  activeBench: string;
  cadenceStatus: 'ON_TARGET' | 'SURPLUS' | 'DEFICIT';
}

export interface BenchExtractionPulse {
  benchId: string;
  benchName: string;
  zone: string;
  status: string;
  pulsePerHour: number[];
  currentHourlyRate: number;
  targetHourlyRate: number;
  color: string;
}

const DEFAULT_HOURLY_PULSE: Record<string, ProductionPulseDataPoint[]> = {
  'dongri-buzurg': [
    { hour: '08:00', actualTonsPerHour: 480, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 18, shovelPayloadIndex: 92, activeBench: 'Pit Bench 3', cadenceStatus: 'DEFICIT' },
    { hour: '09:00', actualTonsPerHour: 540, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 21, shovelPayloadIndex: 95, activeBench: 'Pit Bench 3', cadenceStatus: 'SURPLUS' },
    { hour: '10:00', actualTonsPerHour: 360, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 14, shovelPayloadIndex: 84, activeBench: 'Pit Bench 3', cadenceStatus: 'DEFICIT' },
    { hour: '11:00', actualTonsPerHour: 280, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 10, shovelPayloadIndex: 78, activeBench: 'Pit Bench 3', cadenceStatus: 'DEFICIT' },
    { hour: '12:00', actualTonsPerHour: 410, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 16, shovelPayloadIndex: 89, activeBench: 'Zone 14 South', cadenceStatus: 'DEFICIT' },
    { hour: '13:00', actualTonsPerHour: 590, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 24, shovelPayloadIndex: 98, activeBench: 'Zone 14 South', cadenceStatus: 'SURPLUS' },
    { hour: '14:00', actualTonsPerHour: 620, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 25, shovelPayloadIndex: 99, activeBench: 'Pit Bench 2', cadenceStatus: 'SURPLUS' },
    { hour: '15:00', actualTonsPerHour: 460, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 17, shovelPayloadIndex: 91, activeBench: 'Pit Bench 2', cadenceStatus: 'DEFICIT' },
    { hour: '16:00', actualTonsPerHour: 570, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 23, shovelPayloadIndex: 96, activeBench: 'Pit Bench 3', cadenceStatus: 'SURPLUS' },
    { hour: '17:00', actualTonsPerHour: 610, plannedTonsPerHour: 520, statutoryParTonsPerHour: 500, dumperTrips: 26, shovelPayloadIndex: 99, activeBench: 'Pit Bench 3', cadenceStatus: 'SURPLUS' },
  ],
  balaghat: [
    { hour: '08:00', actualTonsPerHour: 340, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 14, shovelPayloadIndex: 94, activeBench: 'Bharveli Stope L7', cadenceStatus: 'ON_TARGET' },
    { hour: '09:00', actualTonsPerHour: 360, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 15, shovelPayloadIndex: 96, activeBench: 'Bharveli Stope L7', cadenceStatus: 'SURPLUS' },
    { hour: '10:00', actualTonsPerHour: 350, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 15, shovelPayloadIndex: 95, activeBench: 'Holmes Shaft Stope', cadenceStatus: 'ON_TARGET' },
    { hour: '11:00', actualTonsPerHour: 320, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 13, shovelPayloadIndex: 90, activeBench: 'Holmes Shaft Stope', cadenceStatus: 'DEFICIT' },
    { hour: '12:00', actualTonsPerHour: 370, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 16, shovelPayloadIndex: 97, activeBench: 'Deep Level -12', cadenceStatus: 'SURPLUS' },
    { hour: '13:00', actualTonsPerHour: 380, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 17, shovelPayloadIndex: 98, activeBench: 'Deep Level -12', cadenceStatus: 'SURPLUS' },
    { hour: '14:00', actualTonsPerHour: 340, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 14, shovelPayloadIndex: 93, activeBench: 'Bharveli Stope L7', cadenceStatus: 'DEFICIT' },
    { hour: '15:00', actualTonsPerHour: 365, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 15, shovelPayloadIndex: 95, activeBench: 'Bharveli Stope L7', cadenceStatus: 'SURPLUS' },
    { hour: '16:00', actualTonsPerHour: 375, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 16, shovelPayloadIndex: 97, activeBench: 'Holmes Shaft Stope', cadenceStatus: 'SURPLUS' },
    { hour: '17:00', actualTonsPerHour: 390, plannedTonsPerHour: 350, statutoryParTonsPerHour: 330, dumperTrips: 18, shovelPayloadIndex: 99, activeBench: 'Deep Level -12', cadenceStatus: 'SURPLUS' },
  ],
};

const SITE_BENCH_COMPARISONS: Record<string, BenchExtractionPulse[]> = {
  'dongri-buzurg': [
    {
      benchId: 'pb-03',
      benchName: 'Pit Bench 3 (High-Grade Reef Face)',
      zone: 'Zone 14 South Reef',
      status: 'EXTRACTION ACTIVE',
      pulsePerHour: [220, 260, 140, 110, 180, 290, 310, 210, 270, 300],
      currentHourlyRate: 300,
      targetHourlyRate: 250,
      color: '#0E7C7B',
    },
    {
      benchId: 'z-14',
      benchName: 'Zone 14 South Face (Drill & Blast Face)',
      zone: 'South Boundary Highwall',
      status: 'CHARGING COMPLETE',
      pulsePerHour: [110, 120, 110, 80, 120, 150, 160, 120, 150, 160],
      currentHourlyRate: 160,
      targetHourlyRate: 140,
      color: '#3B82F6',
    },
    {
      benchId: 'pb-02',
      benchName: 'Pit Bench 2 (Secondary Loading Face)',
      zone: 'North Highwall Face',
      status: 'HAULAGE ACTIVE',
      pulsePerHour: [100, 110, 80, 60, 80, 100, 105, 90, 100, 105],
      currentHourlyRate: 105,
      targetHourlyRate: 90,
      color: '#10B981',
    },
    {
      benchId: 'crusher-siding',
      benchName: 'Primary Crusher Feed & ROM Pad',
      zone: 'Surface Plant Siding',
      status: 'SIZING & HOPPER FEED',
      pulsePerHour: [50, 50, 30, 30, 30, 50, 45, 40, 50, 45],
      currentHourlyRate: 45,
      targetHourlyRate: 40,
      color: '#F59E0B',
    },
  ],
  balaghat: [
    {
      benchId: 'bharveli-l7',
      benchName: 'Bharveli Stope L7 (Open Stope Face)',
      zone: 'Bharveli Section',
      status: 'EXTRACTION ACTIVE',
      pulsePerHour: [160, 170, 165, 150, 175, 180, 160, 175, 180, 185],
      currentHourlyRate: 185,
      targetHourlyRate: 170,
      color: '#0E7C7B',
    },
    {
      benchId: 'holmes-shaft',
      benchName: 'Holmes Shaft Friction Winder Hoisting',
      zone: 'Central Headframe',
      status: 'HOISTING RUNNING',
      pulsePerHour: [120, 130, 125, 110, 135, 140, 125, 130, 135, 140],
      currentHourlyRate: 140,
      targetHourlyRate: 130,
      color: '#3B82F6',
    },
    {
      benchId: 'deep-l12',
      benchName: 'Deep Level -12 Stope Extraction Block',
      zone: 'Deep Stope Level',
      status: 'DRILLING ACTIVE',
      pulsePerHour: [60, 60, 60, 60, 60, 60, 55, 60, 60, 65],
      currentHourlyRate: 65,
      targetHourlyRate: 50,
      color: '#10B981',
    },
  ],
};

interface SiteProductionPulseEChartProps {
  themeMode?: 'dark' | 'light';
  selectedMineId?: string;
  mineName?: string;
}

export const SiteProductionPulseEChart: React.FC<SiteProductionPulseEChartProps> = ({
  themeMode = 'dark',
  selectedMineId = 'dongri-buzurg',
  mineName = 'Dongri Buzurg',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [pulseMode, setPulseMode] = useState<'HOURLY_STREAM' | 'BENCH_BREAKDOWN' | 'STATUTORY_RADAR'>('HOURLY_STREAM');

  const isDark = themeMode === 'dark';
  const currentSitePulse = DEFAULT_HOURLY_PULSE[selectedMineId] || DEFAULT_HOURLY_PULSE['dongri-buzurg'];
  const benchList = SITE_BENCH_COMPARISONS[selectedMineId] || SITE_BENCH_COMPARISONS['dongri-buzurg'];

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const hours = currentSitePulse.map(d => d.hour);
    const actualRates = currentSitePulse.map(d => d.actualTonsPerHour);
    const planRates = currentSitePulse.map(d => d.plannedTonsPerHour);
    const parRates = currentSitePulse.map(d => d.statutoryParTonsPerHour);
    const dumperTrips = currentSitePulse.map(d => d.dumperTrips);

    let option: echarts.EChartsOption = {};

    if (pulseMode === 'HOURLY_STREAM') {
      option = {
        backgroundColor: 'transparent',
        animationDuration: 750,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', lineStyle: { color: '#0E7C7B', type: 'dashed' } },
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
          padding: [12, 16],
          textStyle: { color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 12 },
          formatter: (params: any) => {
            if (!Array.isArray(params) || params.length === 0) return '';
            const idx = params[0].dataIndex;
            const item = currentSitePulse[idx];
            const delta = item.actualTonsPerHour - item.plannedTonsPerHour;
            const deltaColor = delta >= 0 ? '#10B981' : '#EF4444';
            const deltaSign = delta >= 0 ? `+${delta}` : `${delta}`;

            return `
              <div style="font-weight:900;font-size:13px;margin-bottom:6px;color:${isDark ? '#FFF' : '#002452'};">
                Shift Hour: <strong>${item.hour}</strong> (${item.activeBench})
              </div>
              <div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:3px;">
                <span>• Extraction Rate:</span>
                <strong style="color:#0E7C7B;">${item.actualTonsPerHour} t/hr</strong>
              </div>
              <div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:3px;">
                <span>• Planned Baseline:</span>
                <strong style="color:#3B82F6;">${item.plannedTonsPerHour} t/hr</strong>
              </div>
              <div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:3px;">
                <span>• Variance / Delta:</span>
                <strong style="color:${deltaColor};">${deltaSign} t/hr (${item.cadenceStatus})</strong>
              </div>
              <div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:3px;">
                <span>• Dumper Turnaround:</span>
                <strong style="color:#F59E0B;">${item.dumperTrips} trips/hr</strong>
              </div>
              <div style="display:flex;justify-content:space-between;gap:14px;">
                <span>• Shovel Payload Index:</span>
                <strong style="color:#10B981;">${item.shovelPayloadIndex}% efficiency</strong>
              </div>
            `;
          },
        },
        legend: {
          data: ['Actual Extraction Rate', 'Planned Target Rate', 'DGMS Statutory PAR', 'Dumper Fleet Turnaround'],
          top: '2%',
          right: '2%',
          textStyle: {
            color: isDark ? '#94A3B8' : '#475569',
            fontSize: 11,
            fontWeight: 600,
          },
        },
        grid: {
          left: '2%',
          right: '3%',
          top: '16%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' } },
          axisLabel: {
            color: isDark ? '#CBD5E1' : '#334155',
            fontSize: 11,
            fontWeight: 600,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: 'Extraction (t/hr)',
            nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, padding: [0, 0, 0, 10] },
            splitLine: {
              lineStyle: {
                color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
                type: 'dashed',
              },
            },
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
          },
          {
            type: 'value',
            name: 'Dumper Trips/hr',
            nameTextStyle: { color: '#F59E0B', fontSize: 11, padding: [0, 10, 0, 0] },
            splitLine: { show: false },
            axisLabel: { color: '#F59E0B', fontSize: 11 },
          },
        ],
        series: [
          {
            name: 'Actual Extraction Rate',
            type: 'line',
            smooth: 0.35,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#0E7C7B' },
            lineStyle: { width: 3.5, color: '#0E7C7B' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(14, 124, 123, 0.45)' },
                { offset: 1, color: 'rgba(14, 124, 123, 0.02)' },
              ]),
            },
            data: actualRates,
          },
          {
            name: 'Planned Target Rate',
            type: 'line',
            smooth: true,
            symbol: 'none',
            itemStyle: { color: '#3B82F6' },
            lineStyle: { width: 2.5, color: '#3B82F6', type: 'dashed' },
            data: planRates,
          },
          {
            name: 'DGMS Statutory PAR',
            type: 'line',
            smooth: false,
            symbol: 'none',
            itemStyle: { color: '#10B981' },
            lineStyle: { width: 2, color: '#10B981', type: 'dotted' },
            data: parRates,
          },
          {
            name: 'Dumper Fleet Turnaround',
            type: 'bar',
            yAxisIndex: 1,
            barWidth: '22%',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.85)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.25)' },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            data: dumperTrips,
          },
        ],
      };
    } else if (pulseMode === 'BENCH_BREAKDOWN') {
      option = {
        backgroundColor: 'transparent',
        animationDuration: 750,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'line', lineStyle: { color: '#94A3B8', type: 'dashed' } },
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
          padding: [10, 14],
          textStyle: { color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 11 },
        },
        legend: {
          data: benchList.map(b => b.benchName),
          top: '2%',
          right: '2%',
          textStyle: { color: isDark ? '#94A3B8' : '#475569', fontSize: 10, fontWeight: 600 },
        },
        grid: {
          left: '2%',
          right: '3%',
          top: '16%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLine: { lineStyle: { color: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)' } },
          axisLabel: { color: isDark ? '#CBD5E1' : '#334155', fontSize: 11, fontWeight: 600 },
        },
        yAxis: {
          type: 'value',
          name: 'Bench Extraction Velocity (t/hr)',
          nameTextStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
          splitLine: {
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
              type: 'dashed',
            },
          },
          axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 },
        },
        series: benchList.map((bench, idx) => ({
          name: bench.benchName,
          type: 'line',
          smooth: 0.35,
          symbol: idx === 0 ? 'circle' : 'none',
          symbolSize: 6,
          lineStyle: {
            width: idx === 0 ? 3.5 : 2,
            color: bench.color,
          },
          itemStyle: { color: bench.color },
          areaStyle: idx === 0
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: `${bench.color}40` },
                  { offset: 1, color: `${bench.color}05` },
                ]),
              }
            : undefined,
          data: bench.pulsePerHour,
        })),
      };
    } else {
      // STATUTORY / DGMS COMPLIANCE RADAR
      option = {
        backgroundColor: 'transparent',
        animationDuration: 750,
        tooltip: {
          trigger: 'item',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
          textStyle: { color: isDark ? '#F8FAFC' : '#0F172A', fontSize: 12 },
        },
        legend: {
          data: [`${mineName} Compliance Index`, 'Statutory Benchmark Minimum'],
          top: '2%',
          right: '4%',
          textStyle: { color: isDark ? '#94A3B8' : '#475569', fontSize: 11, fontWeight: 600 },
        },
        radar: {
          indicator: [
            { name: 'DGMS Bench Slope Safety', max: 100 },
            { name: 'IBM MCDR Mineral Recovery', max: 100 },
            { name: 'Ground Vibration PPV Margin', max: 100 },
            { name: 'CGWB Dewatering Limit', max: 100 },
            { name: 'PM10 Dust Suppression', max: 100 },
            { name: 'Fleet Mechanical Availability', max: 100 },
          ],
          shape: 'polygon',
          splitNumber: 4,
          axisName: {
            color: isDark ? '#CBD5E1' : '#334155',
            fontWeight: 700,
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: isDark
                ? ['rgba(14, 124, 123, 0.05)', 'rgba(14, 124, 123, 0.02)', 'transparent']
                : ['rgba(0, 36, 82, 0.04)', 'rgba(0, 36, 82, 0.01)', 'transparent'],
            },
          },
          axisLine: {
            lineStyle: {
              color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            },
          },
        },
        series: [
          {
            name: 'Statutory Compliance Matrix',
            type: 'radar',
            data: [
              {
                value: [94, 98, 88, 78, 91, 82],
                name: `${mineName} Compliance Index`,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: '#0E7C7B' },
                lineStyle: { width: 3, color: '#0E7C7B' },
                areaStyle: { color: 'rgba(14, 124, 123, 0.35)' },
              },
              {
                value: [85, 80, 80, 70, 75, 80],
                name: 'Statutory Benchmark Minimum',
                symbol: 'none',
                itemStyle: { color: '#EF4444' },
                lineStyle: { width: 2, color: '#EF4444', type: 'dashed' },
              },
            ],
          },
        ],
      };
    }

    chartInstance.current.setOption(option, true);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentSitePulse, pulseMode, isDark, selectedMineId, benchList, mineName]);

  const latestPoint = currentSitePulse[currentSitePulse.length - 1];
  const avgCadence = Math.round(
    currentSitePulse.reduce((sum, d) => sum + d.actualTonsPerHour, 0) / currentSitePulse.length
  );
  const totalDumperTrips = currentSitePulse.reduce((sum, d) => sum + d.dumperTrips, 0);

  return (
    <div className="space-y-4">
      {/* Top Header & Interactive View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-lg">ecg_heart</span>
            <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {mineName} Extraction Pulse & Pit Velocity
            </h4>
          </div>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Live hourly cadence across active working benches of {mineName} vs planned benchmark & statutory par
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#14171C] border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
          <button
            type="button"
            onClick={() => setPulseMode('HOURLY_STREAM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pulseMode === 'HOURLY_STREAM'
                ? 'bg-[#0E7C7B] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hourly Pulse Stream
          </button>
          <button
            type="button"
            onClick={() => setPulseMode('BENCH_BREAKDOWN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pulseMode === 'BENCH_BREAKDOWN'
                ? 'bg-[#0E7C7B] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bench & Zone Breakdown
          </button>
          <button
            type="button"
            onClick={() => setPulseMode('STATUTORY_RADAR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              pulseMode === 'STATUTORY_RADAR'
                ? 'bg-[#0E7C7B] text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statutory Radar
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div className={`rounded-2xl border p-4 sm:p-5 relative ${
        isDark ? 'bg-[#14171C]/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
      }`}>
        <div ref={chartRef} className="w-full h-[320px] sm:h-[360px]" />
      </div>

      {/* Bottom 4 Real-Time Operational Pulse KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">speed</span>
          </div>
          <div className="min-w-0">
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Current Rate
            </span>
            <span className={`font-headline font-black text-lg block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {latestPoint.actualTonsPerHour} t/hr
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-extrabold">
              +{Math.max(0, latestPoint.actualTonsPerHour - latestPoint.plannedTonsPerHour)} t/hr vs Plan
            </span>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">avg_pace</span>
          </div>
          <div className="min-w-0">
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Shift Avg Cadence
            </span>
            <span className={`font-headline font-black text-lg block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {avgCadence} t/hr
            </span>
            <span className={`text-[9px] font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'} font-bold`}>
              Baseline: {latestPoint.plannedTonsPerHour} t/hr
            </span>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">local_shipping</span>
          </div>
          <div className="min-w-0">
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Haul Fleet Turnover
            </span>
            <span className={`font-headline font-black text-lg block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalDumperTrips} Trips
            </span>
            <span className="text-[9px] font-mono text-amber-500 font-bold">
              Avg: {(totalDumperTrips / currentSitePulse.length).toFixed(1)} trips/hr
            </span>
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-[#151922] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">gavel</span>
          </div>
          <div className="min-w-0">
            <span className={`text-[10px] font-bold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Statutory Par Index
            </span>
            <span className={`font-headline font-black text-lg block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              94.2%
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-extrabold">
              DGMS Safety Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Bench Breakdown Quick Summary Pill Strip */}
      {pulseMode === 'BENCH_BREAKDOWN' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Active Mine Benches & Faces:
          </span>
          {benchList.map(bench => (
            <div
              key={bench.benchId}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 border flex items-center gap-1.5 ${
                isDark ? 'bg-[#151922] text-slate-200 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bench.color }} />
              <span>{bench.benchName}</span>
              <span className="text-[10px] font-mono text-emerald-500">({bench.currentHourlyRate} t/h)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
