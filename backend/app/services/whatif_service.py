import pandas as pd
from app.services.model_registry import model_registry
import xgboost as xgb

def simulate_whatif(mine_id: str, equipment_pct: float, blasting_delay_days: float, rainfall_mm: float) -> dict:
    """
    Simulates production using XGBoost model2.
    """
    if mine_id == "tirodi":
        model = model_registry.model2_xgb_tirodi
        if not model:
            raise ValueError(f"Model 2 for Tirodi is missing or failed to load. No silent fallback permitted.")
    elif mine_id == "dongri-buzurg":
        model = model_registry.model2_xgb
        if not model:
            raise ValueError("Model 2 for Dongri Buzurg is missing or failed to load.")
    elif mine_id == "sitapatore":
        model = model_registry.model2_xgb_sitapatore
        if not model:
            raise ValueError("Model 2 for Sitapatore is missing or failed to load.")
    else:
        raise ValueError(f"Unsupported mine_id: {mine_id}")
        
    # Standard 13-feature input vector based on training
    # Note: Dongri uses is_weekend, Tirodi and Sitapatore use is_sunday.
    is_weekend_or_sunday = 0
    if mine_id in ["tirodi", "sitapatore"]:
        input_data = {
            'month': [4],
            'is_sunday': [is_weekend_or_sunday],
            'is_monsoon': [0],
            'rainfall_mm': [rainfall_mm],
            'equipment_uptime_pct': [equipment_pct / 100.0],
            'blasting_delay_hrs': [blasting_delay_days * 24],
            'lag_1d_production_t': [348.0],
            'lag_7d_mean_production_t': [348.0],
            'ndvi_seasonal_delta': [0.1],
            'soil_moisture_seasonal_delta': [-0.05],
            'stripping_ratio_miss': [0.0],
            'production_shortfall_pct': [0.0],
            'ob_overrun_pct': [0.0]
        }
    else:
        input_data = {
            'month': [4],
            'is_weekend': [is_weekend_or_sunday],
            'is_monsoon': [0],
            'rainfall_mm': [rainfall_mm],
            'equipment_uptime_pct': [equipment_pct / 100.0],
            'blasting_delay_hrs': [blasting_delay_days * 24],
            'lag_1d_production_t': [1000.0],
            'lag_7d_mean_production_t': [1000.0],
            'ndvi_seasonal_delta': [0.1],
            'soil_moisture_seasonal_delta': [-0.05],
            'stripping_ratio_miss': [0.0],
            'production_shortfall_pct': [0.0],
            'ob_overrun_pct': [0.0]
        }
    
    df = pd.DataFrame(input_data)
    dmatrix = xgb.DMatrix(df)
    pred = model.predict(dmatrix)
    
    # Tirodi Hybrid Production: Add the 9.9 t/day from the 37.09 Ha parcel
    simulated_val = float(pred[0])
    if mine_id == "tirodi":
        simulated_val += 9.9
        
    return {
        "simulated_daily_production_te": simulated_val,
        "inputs_used": input_data
    }
