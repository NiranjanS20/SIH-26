import React, { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '../services/apiClient';
import { WhatIfBoundsResponse, WhatIfSimulateResponse } from '../types/whatif';
import { WhatIfSensitivityEChart } from './WhatIfSensitivityEChart';

interface WhatIfSimulatorProps {
  mineId: string;
  mineName: string;
  miningMethod: string;
  themeMode: 'dark' | 'light';
  userRole: 'admin' | 'site_manager' | 'industry_viewer';
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  mineId,
  mineName,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';

  // Theme Classes
  const cardBg = isDark ? 'bg-[#20242D] border-white/10' : 'bg-gradient-to-br from-white via-slate-50/40 to-white border-slate-200/90 shadow-md';
  const nestedBg = isDark ? 'bg-[#14171C] border-white/10' : 'bg-white border-slate-200/90 shadow-xs';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-700 font-medium';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';

  // Bounds State
  const [bounds, setBounds] = useState<WhatIfBoundsResponse | null>(null);
  const [boundsLoading, setBoundsLoading] = useState(true);
  const [boundsError, setBoundsError] = useState<{ message: string; status: number } | null>(null);

  // Current Sliders State
  const [equipmentUptime, setEquipmentUptime] = useState<number>(0);
  const [plantAvailability, setPlantAvailability] = useState<number>(0);
  const [blastingDelay, setBlastingDelay] = useState<number>(0);
  const [rainfall, setRainfall] = useState<number>(0);
  const [targetOverride, setTargetOverride] = useState<number | null>(null);
  const [targetInputText, setTargetInputText] = useState<string>('');

  // Simulation State
  const [result, setResult] = useState<WhatIfSimulateResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [hasUserInput, setHasUserInput] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSimulation = async (
    eq = equipmentUptime,
    pl = plantAvailability,
    bl = blastingDelay,
    ra = rainfall,
    tgt = targetOverride
  ) => {
    if (!bounds) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setSimLoading(true);
    setSimError(null);

    try {
      const data = await apiPost<WhatIfSimulateResponse>(
        `/whatif/${mineId}/simulate`,
        {
          equipment_uptime_pct: eq,
          plant_availability_pct: pl,
          blasting_delay_days: bl,
          rainfall_mm: ra,
          target_tons_per_day_override: tgt,
        },
        abortRef.current.signal
      );
      setResult(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSimError(err.message || 'Simulation failed');
      }
    } finally {
      setSimLoading(false);
    }
  };

  // 1. Fetch Bounds
  useEffect(() => {
    let active = true;
    const fetchBounds = async () => {
      setBoundsLoading(true);
      setBoundsError(null);
      try {
        const data = await apiGet<WhatIfBoundsResponse>(`/whatif/${mineId}/bounds`);
        if (active) {
          setBounds(data);
          // Initialize sliders to medians
          setEquipmentUptime(data.drivers.equipment_uptime_pct.median);
          setPlantAvailability(data.drivers.plant_availability_pct.median);
          setBlastingDelay(data.drivers.blasting_delay_days.median);
          setRainfall(data.drivers.rainfall_mm.median);
          setTargetOverride(null);
          setTargetInputText('');
        }
      } catch (err: any) {
        if (active) {
          setBoundsError({
            message: err.message || 'Failed to load simulator bounds',
            status: err.status || 500,
          });
        }
      } finally {
        if (active) setBoundsLoading(false);
      }
    };
    fetchBounds();
    return () => {
      active = false;
    };
  }, [mineId]);

  // 2. Debounced Simulation — only triggers after user interaction
  useEffect(() => {
    if (!bounds || !hasUserInput) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      runSimulation();
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [equipmentUptime, plantAvailability, blastingDelay, rainfall, targetOverride, hasUserInput, mineId, bounds]);

  // Handlers
  const handleReset = () => {
    if (bounds) {
      const medEq = bounds.drivers.equipment_uptime_pct.median;
      const medPl = bounds.drivers.plant_availability_pct.median;
      const medBl = bounds.drivers.blasting_delay_days.median;
      const medRa = bounds.drivers.rainfall_mm.median;
      setEquipmentUptime(medEq);
      setPlantAvailability(medPl);
      setBlastingDelay(medBl);
      setRainfall(medRa);
      setTargetOverride(null);
      setTargetInputText('');
      setHasUserInput(true);
      runSimulation(medEq, medPl, medBl, medRa, null);
    }
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetInputText(val);
    const num = parseFloat(val);
    if (!isNaN(num) && val.trim() !== '') {
      setTargetOverride(num);
      setHasUserInput(true);
    } else if (val.trim() === '') {
      setTargetOverride(null);
      setHasUserInput(true);
    }
  };

  // Rendering Risk Level
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10';
      case 'moderate': return 'text-amber-500 border-amber-500/40 bg-amber-500/10';
      case 'high': return 'text-red-500 border-red-500/40 bg-red-500/10';
      case 'severe': return 'text-red-700 border-red-700/60 bg-red-700/20 animate-pulse';
      default: return 'text-slate-500 border-slate-500/40 bg-slate-500/10';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return 'check_circle';
      case 'moderate': return 'warning';
      case 'high': return 'error';
      case 'severe': return 'dangerous';
      default: return 'info';
    }
  };

  if (boundsError) {
    if (boundsError.status === 404) {
      return (
        <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-xl animate-in fade-in ${cardBg}`}>
          <span className={`material-symbols-outlined text-5xl mb-4 ${textMuted}`}>construction</span>
          <h2 className={`text-lg font-black uppercase mb-2 ${textPrimary}`}>Model Artifact Missing</h2>
          <p className={`text-sm max-w-md ${textSecondary}`}>
            No trained Model 2 forecasting artifact exists for <strong>{mineName}</strong>. 
            The What-If Simulator requires a real, canonical model to function.
          </p>
          <button className="mt-6 px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold border border-slate-700">
            Contact Admin
          </button>
        </div>
      );
    }
    if (boundsError.status === 403) {
      return (
        <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-xl animate-in fade-in ${cardBg}`}>
          <span className={`material-symbols-outlined text-5xl mb-4 text-red-500`}>lock</span>
          <h2 className={`text-lg font-black uppercase mb-2 ${textPrimary}`}>Access Denied</h2>
          <p className={`text-sm max-w-md ${textSecondary}`}>
            The What-If Simulator is not available for this mine under your current role.
          </p>
        </div>
      );
    }
    return (
      <div className="p-4 rounded bg-red-500/20 border border-red-500/50 text-red-500">
        Error loading bounds: {boundsError.message}
      </div>
    );
  }

  if (boundsLoading || !bounds) {
    return (
      <div className={`p-8 rounded-xl border animate-pulse ${cardBg}`}>
        <div className="h-6 bg-slate-700/30 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="h-10 bg-slate-700/30 rounded w-full"></div>
            <div className="h-10 bg-slate-700/30 rounded w-full"></div>
            <div className="h-10 bg-slate-700/30 rounded w-full"></div>
            <div className="h-10 bg-slate-700/30 rounded w-full"></div>
          </div>
          <div className="h-64 bg-slate-700/30 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Console Header - Deep MOIL Dark Blue */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#002452] text-white shadow-md border border-[#00387A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
            <span className="material-symbols-outlined text-2xl">tune</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                Live What-If Simulator
              </h2>
              <span className="text-[10px] font-mono font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ML INFERENCE
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1 flex items-center gap-1.5">
              <span>{mineName}</span>
              <span className="text-white/30">•</span>
              <span className="font-mono">
                {hasUserInput && result ? 'AI Model 2: Production Forecaster (XGBoost)' : 'XGBoost Time-Series Engine'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Controls */}
        <div className={`p-6 rounded-xl border flex flex-col gap-6 ${cardBg}`}>
          
          <div className="flex justify-between items-center">
            <h3 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
              Operational Drivers
            </h3>
            <button 
              onClick={handleReset}
              className="text-xs flex items-center gap-1 font-bold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              Reset to Medians
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Equipment Uptime */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className={textSecondary}>Equipment Uptime</span>
                <span className="font-mono text-[#0E7C7B]">{equipmentUptime.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={bounds.drivers.equipment_uptime_pct.min}
                max={bounds.drivers.equipment_uptime_pct.max}
                step={0.5}
                value={equipmentUptime}
                onChange={(e) => {
                  setEquipmentUptime(Number(e.target.value));
                  setHasUserInput(true);
                }}
                className="w-full accent-[#0E7C7B] cursor-pointer"
              />
              <div className={`flex justify-between text-[10px] ${textMuted}`}>
                <span>Min: {bounds.drivers.equipment_uptime_pct.min}%</span>
                <span className="text-[#0E7C7B] font-bold">Med: {bounds.drivers.equipment_uptime_pct.median}%</span>
                <span>Max: {bounds.drivers.equipment_uptime_pct.max}%</span>
              </div>
            </div>

            {/* Plant Availability */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className={textSecondary}>Plant Availability</span>
                <span className="font-mono text-[#0E7C7B]">{plantAvailability.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={bounds.drivers.plant_availability_pct.min}
                max={bounds.drivers.plant_availability_pct.max}
                step={0.5}
                value={plantAvailability}
                onChange={(e) => {
                  setPlantAvailability(Number(e.target.value));
                  setHasUserInput(true);
                }}
                className="w-full accent-[#0E7C7B] cursor-pointer"
              />
              <div className={`flex justify-between text-[10px] ${textMuted}`}>
                <span>Min: {bounds.drivers.plant_availability_pct.min}%</span>
                <span className="text-[#0E7C7B] font-bold">Med: {bounds.drivers.plant_availability_pct.median}%</span>
                <span>Max: {bounds.drivers.plant_availability_pct.max}%</span>
              </div>
            </div>

            {/* Blasting Delay */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className={textSecondary}>Blasting Delay</span>
                <span className="font-mono text-amber-600">{blastingDelay.toFixed(1)} days</span>
              </div>
              <input
                type="range"
                min={bounds.drivers.blasting_delay_days.min}
                max={bounds.drivers.blasting_delay_days.max}
                step={1}
                value={blastingDelay}
                onChange={(e) => {
                  setBlastingDelay(Number(e.target.value));
                  setHasUserInput(true);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className={`flex justify-between text-[10px] ${textMuted}`}>
                <span>Min: {bounds.drivers.blasting_delay_days.min}d</span>
                <span className="text-amber-600 font-bold">Med: {bounds.drivers.blasting_delay_days.median}d</span>
                <span>Max: {bounds.drivers.blasting_delay_days.max}d</span>
              </div>
            </div>

            {/* Rainfall */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className={textSecondary}>Rainfall</span>
                <span className="font-mono text-blue-500">{rainfall.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={bounds.drivers.rainfall_mm.min}
                max={bounds.drivers.rainfall_mm.max}
                step={0.5}
                value={rainfall}
                onChange={(e) => {
                  setRainfall(Number(e.target.value));
                  setHasUserInput(true);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold whitespace-nowrap">
                    ⚠ SYNTHETIC PROXY
                  </span>
                </div>
                <div className={`flex gap-3 text-[10px] ${textMuted}`}>
                  <span>Min: {bounds.drivers.rainfall_mm.min}</span>
                  <span className="text-blue-500 font-bold">Med: {bounds.drivers.rainfall_mm.median}</span>
                  <span>Max: {bounds.drivers.rainfall_mm.max}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-500/20 my-2 pt-4">
            <label className={`block text-xs font-bold mb-1 ${textSecondary}`}>
              Target Override (tons/day)
            </label>
            <input 
              type="number"
              value={targetInputText}
              onChange={handleTargetChange}
              placeholder={String(bounds.planned_target_tons_per_day)}
              className={`w-full px-3 py-2 text-sm rounded border ${
                isDark ? 'bg-black/20 border-white/10 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <div className="mt-2 flex items-center gap-1.5">
              {bounds.target_provenance === 'real_documented' ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Real Documented Target
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                  <span className="material-symbols-outlined text-[12px]">info</span>
                  Reserve-Scaled Assumption
                </span>
              )}
            </div>
          </div>

          {/* Explicit Run Simulation Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setHasUserInput(true);
              runSimulation();
            }}
            disabled={simLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-[#0E7C7B] to-[#129A98] hover:brightness-110 active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              {simLoading ? 'autorenew' : 'play_arrow'}
            </span>
            <span>{simLoading ? 'Simulating Scenario...' : 'Run What-If Simulation'}</span>
          </button>

        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="flex flex-col gap-6">
          <div className={`relative p-6 rounded-xl border flex flex-col gap-6 overflow-hidden ${cardBg}`}>
            
            {/* Loading Overlay */}
            {simLoading && (
              <div className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] ${isDark ? 'bg-black/20' : 'bg-white/40'}`}>
                <span className="material-symbols-outlined animate-spin text-[#0E7C7B] text-4xl">autorenew</span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <h3 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
                Simulation Result
              </h3>
              {hasUserInput && result && (
                <span className={`text-[10px] font-mono ${textMuted}`}>
                  ⚡ {result.inference_time_ms}ms
                </span>
              )}
            </div>

            {simError ? (
              <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
                {simError}
              </div>
            ) : hasUserInput && result ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Predicted Output */}
                  <div className={`p-4 rounded-xl border ${nestedBg}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Simulated Output
                    </span>
                    <span className={`font-headline font-black text-3xl block ${textPrimary}`}>
                      {result.predicted_production_tons.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span className="text-lg">t/d</span>
                    </span>
                  </div>

                  {/* Target & Gap */}
                  <div className={`p-4 rounded-xl border ${nestedBg}`}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${textMuted}`}>
                        Target Output
                      </span>
                      <span className={`text-[10px] font-bold ${textSecondary}`}>
                        {result.target_tons.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} t
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className={`font-headline font-black text-xl ${result.gap_tons >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {result.gap_tons >= 0 ? '+' : ''}{result.gap_tons.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} t
                      </span>
                      <span className={`text-xs font-bold ${result.gap_pct >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                        ({result.gap_pct >= 0 ? '+' : ''}{result.gap_pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Baseline Comparison */}
                <div className="flex items-center justify-between border-t border-slate-500/20 pt-4">
                  <div>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
                      Vs. Typical Day (Baseline)
                    </span>
                    <span className={`font-mono text-xs ${textSecondary}`}>
                      Baseline: {result.baseline_comparison.baseline_predicted_tons.toFixed(1)} t
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm block ${result.baseline_comparison.delta_tons >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {result.baseline_comparison.delta_tons >= 0 ? '+' : ''}{result.baseline_comparison.delta_tons.toFixed(1)} t
                    </span>
                    <span className={`text-[10px] font-bold ${result.baseline_comparison.delta_pct >= 0 ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                      {result.baseline_comparison.delta_pct >= 0 ? '+' : ''}{result.baseline_comparison.delta_pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Risk Level */}
                <div className={`p-3 rounded-lg border flex items-center justify-between ${getRiskStyles(result.risk_level)}`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">{getRiskIcon(result.risk_level)}</span>
                    <span className="font-bold text-xs uppercase tracking-widest">
                      Risk: {result.risk_level}
                    </span>
                  </div>
                </div>

              </>
            ) : (
              <div className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center gap-4 ${nestedBg} min-h-[300px]`}>
                <div className="w-12 h-12 rounded-2xl bg-[#0E7C7B]/10 border border-[#0E7C7B]/20 flex items-center justify-center text-[#0E7C7B]">
                  <span className="material-symbols-outlined text-2xl">tune</span>
                </div>
                <div>
                  <h4 className={`font-headline font-black text-sm uppercase tracking-wider ${textPrimary}`}>
                    Awaiting Scenario Input
                  </h4>
                  <p className={`text-xs max-w-xs mt-1.5 leading-relaxed ${textSecondary}`}>
                    Adjust any operational driver on the left or click Run Simulation to compute live production forecasts and shortfall risk.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasUserInput(true);
                    runSimulation();
                  }}
                  className="px-4 py-2 bg-[#0E7C7B] hover:bg-[#0c6b6a] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Simulate with Current Inputs
                </button>
              </div>
            )}
          </div>

          {/* Extrapolation Warning */}
          {hasUserInput && result?.extrapolation_warning && (
            <div className={`p-4 rounded-xl border border-amber-500/50 flex gap-3 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
              <span className="material-symbols-outlined text-amber-500">warning</span>
              <div>
                <h4 className="font-bold text-amber-600 text-sm">Extrapolation Warning</h4>
                <p className={`text-xs mt-1 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  One or more driver values are outside the training data range for this mine. The prediction may be unreliable because tree-based models extrapolate poorly beyond observed data.
                </p>
              </div>
            </div>
          )}

          {/* Sensitivity Chart */}
          {hasUserInput && result && (
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <WhatIfSensitivityEChart result={result} themeMode={themeMode} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
