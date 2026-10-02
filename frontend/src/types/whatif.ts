export interface DriverBound {
  min: number;
  median: number;
  max: number;
  unit: string;
  is_rainfall_proxy?: boolean;
}

export interface WhatIfBoundsResponse {
  mine_id: string;
  mining_method: string;
  drivers: {
    equipment_uptime_pct: DriverBound;
    plant_availability_pct: DriverBound;
    blasting_delay_days: DriverBound;
    rainfall_mm: DriverBound;
  };
  planned_target_tons_per_day: number;
  target_provenance: 'real_documented' | 'reserve_scaled_assumption';
}

export interface WhatIfSimulateRequest {
  equipment_uptime_pct: number;
  plant_availability_pct: number;
  blasting_delay_days: number;
  rainfall_mm: number;
  target_tons_per_day_override: number | null;
}

export interface WhatIfSimulateResponse {
  mine_id: string;
  predicted_production_tons: number;
  target_tons: number;
  gap_tons: number;
  gap_pct: number;
  risk_level: 'low' | 'moderate' | 'high' | 'severe';
  baseline_comparison: {
    baseline_predicted_tons: number;
    delta_tons: number;
    delta_pct: number;
  };
  is_rainfall_proxy: boolean;
  model_version: string;
  inference_time_ms: number;
  extrapolation_warning?: boolean;
}
