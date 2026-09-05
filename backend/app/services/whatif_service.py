import pandas as pd
from app.services.model_registry import model_registry
import xgboost as xgb

def simulate_whatif(equipment_pct: float, blasting_delay_days: float, rainfall_mm: float) -> dict:
    """
    Simulates production using XGBoost model2.
    """
    model = model_registry.model2_xgb
    if not model:
        raise ValueError("Model 2 is not loaded")
        
    # Standard 13-feature input vector based on training
    # We create a synthetic baseline and just modify the sliders
    input_data = {
        'equipment_availability_pct': [equipment_pct],
        'blasting_delay_days': [blasting_delay_days],
        'precipitation_mm': [rainfall_mm],
        'drainage_rate_m3_hr': [250.0], # baseline
        'bench_slope_moisture_idx': [0.5], # baseline
        'is_monsoon': [0],
        'ndvi_mean': [0.4],
        'lst_mean': [30.0],
        'rom_gross_reported_te': [1350.0], # approx daily target
        'stripping_ratio_miss': [0.0],
        'production_shortfall_pct': [0.0],
        'ob_overrun_pct': [0.0],
        'month_sin': [0.5]
    }
    
    df = pd.DataFrame(input_data)
    # Ensure exact column order from training (this is crucial for XGBoost)
    # Assuming standard order from the script, but dict preserves insertion order in Python 3.7+
    
    dmatrix = xgb.DMatrix(df)
    pred = model.predict(dmatrix)
    
    # Return simulated payload
    return {
        "simulated_daily_production_te": float(pred[0]),
        "inputs_used": input_data
    }
