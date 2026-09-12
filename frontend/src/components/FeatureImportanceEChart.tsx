// ==============================================================================
// MOIL Feature Importance Apache ECharts Component (Explainable AI - XAI)
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { type FeatureImportanceItem } from '../data/mineProductionData';

interface FeatureImportanceEChartProps {
  features: FeatureImportanceItem[];
  themeMode?: 'dark' | 'light';
}

export const FeatureImportanceEChart: React.FC<FeatureImportanceEChartProps> = ({
  features,
  themeMode = 'dark',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const isDark = themeMode === 'dark';

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Sort features ascending so highest weight is at the top of the horizontal bar
    const sorted = [...features].sort((a, b) => a.weightPct - b.weightPct);
    const categoryNames = sorted.map((f) => f.feature);
    const values = sorted.map((f) => f.weightPct);
    const colors = sorted.map((f) => f.color);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animationDuration: 700,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDark ? 'rgba(20, 23, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        textStyle: {
          color: isDark ? '#F8FAFC' : '#0F172A',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const item = sorted[params[0].dataIndex];
          return `<div style="font-weight:bold;margin-bottom:3px;">${item.feature}</div>
            <div style="color:${item.color};">● Weight: <strong>${item.weightPct}%</strong> impact</div>
            <div style="font-size:10px;color:${isDark ? '#94A3B8' : '#64748B'};">Category: ${item.category}</div>`;
        },
      },
      grid: {
        left: '2%',
        right: '12%',
        top: '6%',
        bottom: '4%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        max: 40,
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            type: 'dashed',
          },
        },
        axisLabel: {
          formatter: '{value}%',
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'category',
        data: categoryNames,
        axisLine: { lineStyle: { color: isDark ? '#475569' : '#CBD5E1' } },
        axisTick: { show: false },
        axisLabel: {
          color: isDark ? '#CBD5E1' : '#334155',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: 'Impact Weight',
          type: 'bar',
          data: values.map((val, idx) => ({
            value: val,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: colors[idx] },
                { offset: 1, color: colors[idx] + '66' },
              ]),
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: 16,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: 'bold',
            fontSize: 11,
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
  }, [features, isDark]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-56" />;
};
