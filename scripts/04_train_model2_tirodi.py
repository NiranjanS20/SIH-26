import os
import pandas as pd
import numpy as np
import rasterio
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
from model_persistence import evaluate_and_save_model

def get_tirodi_price(grade='25-35%'):
    # Tirodi-specific price tiers from MCDR
    tiers = {
        'Below 25%': 2426.68,
        '25-35%': 6023.78,
        '35-46%': 11688.23
    }
    return tiers.get(grade, 6023.78)

def train_model2_tirodi():
    print("--- Phase 4: Model 2 Production Forecasting (TIRODI) ---")
    proc_dir = 'data/processed'
    
    # Load calibrations for environmental data
    with open(os.path.join(proc_dir, 'rainfall_scalar.txt'), 'r') as f:
        mean_rain = float(f.read())
        
    with rasterio.open(os.path.join(proc_dir, 'aligned_ndvi_seasonal_delta.tif')) as src:
        ndvi_delta = np.nanmean(src.read(1))
    with rasterio.open(os.path.join(proc_dir, 'aligned_soil_moisture_seasonal_delta.tif')) as src:
        sm_delta = np.nanmean(src.read(1))

    # Scope: FY22-23 to FY23-24 (Matched to Tirodi's MCDR reports)
    dates = pd.date_range(start='2022-04-01', end='2024-03-31')
    df = pd.DataFrame({'date': dates})
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_sunday'] = (df['day_of_week'] == 6).astype(int)
    df['is_monsoon'] = df['month'].isin([6, 7, 8, 9]).astype(int)
    
    # Fiscal year calculation
    df['fy'] = df.apply(lambda row: f"{row['year']}-{str(row['year']+1)[-2:]}" if row['month'] >= 4 else f"{row['year']-1}-{str(row['year'])[-2:]}", axis=1)
    
    # Tirodi Baseline Calculations
    annual_target = 109000  # ROM from 254.593 Ha lease
    operating_days = 313    # 365 - 52 Sundays
    base_daily_prod = annual_target / operating_days  # ~348 t/day
    
    np.random.seed(42)
    
    # Equipment Fleet: 10 dumpers, 5 shovels
    # Uptime represents fleet capacity utilization
    df['equipment_uptime_pct'] = np.random.uniform(0.7, 1.0, len(df))
    df['blasting_delay_hrs'] = np.random.uniform(0, 4, len(df))
    
    df['rainfall_mm'] = 0.0
    monsoon_idx = df[df['is_monsoon'] == 1].index
    rain_mask = np.random.rand(len(monsoon_idx)) < 0.6
    df.loc[monsoon_idx[rain_mask], 'rainfall_mm'] = np.random.gamma(shape=2.0, scale=mean_rain, size=len(monsoon_idx[rain_mask]))
    
    # Volatility impact of rain on Tirodi's opencast operations
    monsoon_penalty = np.where(df['is_monsoon'] == 1, 0.85, 1.0)
    
    # Production generation
    df['true_production_t'] = (
        base_daily_prod 
        * df['equipment_uptime_pct'] 
        * (1 - df['blasting_delay_hrs']/24)  # Penalty for blasting delays
        * monsoon_penalty
        - df['rainfall_mm'] * 2 
    )
    
    # Zero out Sundays (Weekly day of rest per MCDR)
    df.loc[df['is_sunday'] == 1, 'true_production_t'] = 0.0
    
    # Add noise
    noise_mask = df['is_sunday'] == 0
    df.loc[noise_mask, 'true_production_t'] += np.random.normal(0, 15, noise_mask.sum())
    df['true_production_t'] = df['true_production_t'].clip(lower=0)
    
    # Scale to precisely hit the 109,000 annual target since the MCDR confirms they hit it
    for fy in df['fy'].unique():
        synth_sum = df.loc[df['fy'] == fy, 'true_production_t'].sum()
        scale_factor = annual_target / synth_sum
        df.loc[df['fy'] == fy, 'true_production_t'] *= scale_factor
        print(f"Tirodi Scaled FY {fy}: synth sum {synth_sum:.1f} -> target {annual_target} (scale {scale_factor:.4f})")
    
    # Inject Derived Features (Stripping Ratio is explicitly 1:5 per MCDR)
    df['stripping_ratio_miss'] = np.clip(np.random.normal(0, 0.5, len(df)), 0, None) # Minor misses around 1:5
    df['production_shortfall_pct'] = 0.0 # They hit their target exactly
    df['ob_overrun_pct'] = 0.0 
    
    # Lags
    df['lag_1d_production_t'] = df['true_production_t'].shift(1)
    df['lag_7d_mean_production_t'] = df['true_production_t'].rolling(7).mean().shift(1)
    df = df.dropna().reset_index(drop=True)
    
    df['ndvi_seasonal_delta'] = ndvi_delta
    df['soil_moisture_seasonal_delta'] = sm_delta

    # Calculate Value
    # Using '25-35%' as the median grade assumption for main ROM
    df['daily_value_inr'] = df['true_production_t'] * get_tirodi_price('25-35%')
    
    features = [
        'month', 'is_sunday', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    target = 'true_production_t'
    
    X = df[features]
    y = df[target]
    
    tscv = TimeSeriesSplit(n_splits=5)
    
    # Separate Model Artifact
    model_path = os.path.join(proc_dir, 'model2_xgb_tirodi.json')
    xgb_params = {'n_estimators': 200, 'learning_rate': 0.1, 'max_depth': 5, 'random_state': 42}
    
    rmse_scores = []
    best_model = None
    
    print("\nTraining Model 2 (XGBoost) for Tirodi...")
    for train_ix, test_ix in tscv.split(X):
        X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
        y_tr, y_te = y.iloc[train_ix], y.iloc[test_ix]
        
        eval_split = int(len(X_tr) * 0.9)
        if eval_split == 0:
            continue
            
        X_train_sub, y_train_sub = X_tr.iloc[:eval_split], y_tr.iloc[:eval_split]
        X_eval, y_eval = X_tr.iloc[eval_split:], y_tr.iloc[eval_split:]
        
        xgb = XGBRegressor(**xgb_params, early_stopping_rounds=10)
        
        if os.path.exists(model_path):
            xgb.fit(X_train_sub, y_train_sub, eval_set=[(X_eval, y_eval)], verbose=False, xgb_model=model_path)
        else:
            xgb.fit(X_train_sub, y_train_sub, eval_set=[(X_eval, y_eval)], verbose=False)
            
        preds = xgb.predict(X_te)
        rmse_scores.append(np.sqrt(mean_squared_error(y_te, preds)))
        best_model = xgb 
        
    avg_rmse = np.mean(rmse_scores)
    print(f"Tirodi TimeSeries CV RMSE: {avg_rmse:.2f}")
    
    evaluate_and_save_model('model2_xgb_tirodi', best_model, avg_rmse, 'RMSE', model_path, minimize=True)
    best_model.get_booster().save_model(model_path) # native xgb
    
    df.to_csv(os.path.join(proc_dir, 'production_training_tirodi.csv'), index=False)
    print("\n[OK] Model 2 Production Forecasting (Tirodi) trained and saved.")

if __name__ == '__main__':
    train_model2_tirodi()
