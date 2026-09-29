import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { WhatIfSimulateResponse } from '../types/whatif';

interface WhatIfSensitivityEChartProps {
  result: WhatIfSimulateResponse;
  themeMode?: 'dark' | 'light';
}

export const WhatIfSensitivityEChart: React.FC<WhatIfSensitivityEChartProps> = ({
  result,
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

    const delta = result.baseline_comparison.delta_tons;
    
    // Create approximate sensitivity bars based on the single total delta,
    // assuming proportional impact for visualization. In a real app,
    // we would call a backend sensitivity endpoint or run multiple simulations.
    // For MVP, we will show the overall delta.
    
    const isPositive = delta >= 0;
    const color = isPositive ? '#10B981' : '#EF4444'; // Emerald for positive, Red for negative

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animationDuration: 700,
      title: {
        text: 'Variance vs. Typical Day (Baseline)',
        left: 'center',
        top: 0,
        textStyle: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 12,
          fontWeight: 'normal',
        }
      },
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
          const val = params[0].value as number;
          const sign = val > 0 ? '+' : '';
          return `<div style="font-weight:bold;margin-bottom:3px;">Total Output Delta</div>
            <div style="color:${color};">● ${sign}${val.toFixed(1)} tons</div>`;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '20%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        position: 'top',
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'category',
        data: ['Total Delta'],
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
          name: 'Delta',
          type: 'bar',
          data: [
            {
              value: delta,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(
                  isPositive ? 0 : 1, 0, isPositive ? 1 : 0, 0, [
                  { offset: 0, color: color },
                  { offset: 1, color: color + '88' },
                ]),
                borderRadius: isPositive ? [0, 4, 4, 0] : [4, 0, 0, 4],
              },
            }
          ],
          barWidth: 24,
          label: {
            show: true,
            position: isPositive ? 'right' : 'left',
            formatter: (params) => {
              const val = params.value as number;
              return (val > 0 ? '+' : '') + val.toFixed(1) + ' t';
            },
            color: isDark ? '#F8FAFC' : '#0F172A',
            fontWeight: 'bold',
            fontSize: 12,
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
  }, [result, isDark]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-32" />;
};
