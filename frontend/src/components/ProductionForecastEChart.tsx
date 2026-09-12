// ==============================================================================
// MOIL Production Forecast Apache ECharts Component (Actual vs Predicted + Confidence Band)
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { type MonthDataPoint } from '../data/mineProductionData';

interface ProductionForecastEChartProps {
  data: MonthDataPoint[];
  mineName: string;
  themeMode?: 'dark' | 'light';
}

export const ProductionForecastEChart: React.FC<ProductionForecastEChartProps> = ({
  data,
  mineName,
  themeMode = 'dark',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize ECharts instance
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const categories = data.map((d) => d.label);
    const actualData = data.map((d) => d.actual);
    const targetData = data.map((d) => d.target);
    const forecastData = data.map((d) => d.forecast);

    // Calculate lower confidence base and band height for ECharts stacked area
    const confLowerBase = data.map((d) => d.confidenceLower ?? null);
    const confBandDiff = data.map((d) => {
      if (d.confidenceUpper != null && d.confidenceLower != null) {
        return d.confidenceUpper - d.confidenceLower;
      }
      return null;
    });

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animationDuration: 800,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
            type: 'dashed',
          },
        },
        backgroundColor: isDark ? 'rgba(20, 23, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#0F172A',
          fontSize: 12,
          fontFamily: 'sans-serif',
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const pt = data[idx];

          let html = `<div style="font-weight:bold;margin-bottom:4px;border-bottom:1px solid ${
            isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          };padding-bottom:2px;">${pt.label} • ${mineName}</div>`;

          html += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
            <span style="color:#3B82F6">● Planned Target:</span>
            <strong>${pt.target.toLocaleString()} t</strong>
          </div>`;

          if (pt.actual != null) {
            html += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span style="color:#10B981">● Actual Output:</span>
              <strong style="color:#10B981">${pt.actual.toLocaleString()} t</strong>
            </div>`;
          }

          if (pt.forecast != null) {
            html += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0;">
              <span style="color:#0E7C7B">● AI Forecast:</span>
              <strong style="color:#0E7C7B">${pt.forecast.toLocaleString()} t</strong>
            </div>`;
          }

          if (pt.confidenceLower != null && pt.confidenceUpper != null) {
            html += `<div style="font-size:10px;color:${isDark ? '#94A3B8' : '#64748B'};margin-top:4px;">
              95% Confidence: ${pt.confidenceLower.toLocaleString()} t – ${pt.confidenceUpper.toLocaleString()} t
            </div>`;
          }

          return html;
        },
      },
      legend: {
        data: ['Actual Production', 'Planned Target', 'AI Predicted Forecast', '95% Confidence Band'],
        top: 0,
        right: 10,
        textStyle: {
          color: isDark ? '#CBD5E1' : '#475569',
          fontSize: 11,
          fontWeight: 600,
        },
        icon: 'roundRect',
      },
      grid: {
        left: '2%',
        right: '4%',
        bottom: '8%',
        top: '14%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
        axisLine: {
          lineStyle: { color: isDark ? '#475569' : '#CBD5E1' },
        },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
          fontWeight: 'bold',
        },
      },
      yAxis: {
        type: 'value',
        name: 'Metric Tonnes (t)',
        nameTextStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
          fontWeight: 'bold',
        },
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
          formatter: '{value} t',
        },
      },
      series: [
        // 1. Invisible Confidence Lower Base
        {
          name: 'ConfLower',
          type: 'line',
          data: confLowerBase,
          lineStyle: { opacity: 0 },
          stack: 'confidence-band',
          symbol: 'none',
        },
        // 2. Translucent Confidence Upper Band
        {
          name: '95% Confidence Band',
          type: 'line',
          data: confBandDiff,
          lineStyle: { opacity: 0 },
          areaStyle: {
            color: isDark ? 'rgba(14, 124, 123, 0.25)' : 'rgba(14, 124, 123, 0.18)',
          },
          stack: 'confidence-band',
          symbol: 'none',
        },
        // 3. Planned Target Benchmark
        {
          name: 'Planned Target',
          type: 'line',
          data: targetData,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3B82F6' },
          lineStyle: {
            color: '#3B82F6',
            width: 2.5,
            type: 'dashed',
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.05)',
            },
            data: [
              [
                {
                  name: 'Monsoon IMD Inflow Band',
                  xAxis: 'Jun',
                  itemStyle: {
                    borderWidth: 1,
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderType: 'dashed',
                  },
                  label: {
                    color: '#3B82F6',
                    fontSize: 10,
                    fontWeight: 'bold',
                    position: 'insideTop',
                  },
                },
                {
                  xAxis: 'Sep (Fcst)',
                },
              ],
            ],
          },
        },
        // 4. Actual Historical Production
        {
          name: 'Actual Production',
          type: 'line',
          data: actualData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#10B981',
            borderColor: isDark ? '#12151B' : '#FFFFFF',
            borderWidth: 2,
          },
          lineStyle: {
            color: '#10B981',
            width: 3.5,
            shadowColor: 'rgba(16, 185, 129, 0.4)',
            shadowBlur: 8,
          },
        },
        // 5. AI Predicted Forecast Curve
        {
          name: 'AI Predicted Forecast',
          type: 'line',
          data: forecastData,
          smooth: true,
          symbol: 'diamond',
          symbolSize: 9,
          itemStyle: {
            color: '#0E7C7B',
            borderColor: isDark ? '#12151B' : '#FFFFFF',
            borderWidth: 2,
          },
          lineStyle: {
            color: '#0E7C7B',
            width: 3.5,
            type: 'dotted',
            shadowColor: 'rgba(14, 124, 123, 0.5)',
            shadowBlur: 10,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, mineName, isDark]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-80" />;
};
