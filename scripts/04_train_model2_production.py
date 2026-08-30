import os
import pandas as pd
import numpy as np
import rasterio
import geopandas as gpd
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from model_persistence import evaluate_and_save_model, save_persistence_log, load_persistence_log

def get_grade_distribution():
    # Load Key Evidence to get grade distribution for tie breaking / value calculation
    key_ev = gpd.read_file('data/satellite data and more/Dongri_Buzurg_Key_Evidence.geojson')
    median_grade = key_ev['MnO_pct'].median()
    
    if median_grade <= 25.0:
        return 'Below 25%'
    elif median_grade <= 35.0:
        return '25-35%'
    elif median_grade <= 46.0:
        return '35-46%'
    else:
        return 'Above 46%'

def train_model2():
    print("--- Phase 4: Model 2 Production Forecasting ---")
    proc_dir = 'data/processed'
    
    # Load calibrations
    with open(os.path.join(proc_dir, 'rainfall_scalar.txt'), 'r') as f:
        mean_rain = float(f.read())
        
    ibm_data = pd.read_csv(os.path.join(proc_dir, 'production_calibration.csv'))
    dry_months = ibm_data[ibm_data['Season'] == 'Dry']
    wet_months = ibm_data[ibm_data['Season'] == 'Monsoon']
    
    dry_mean = dry_months['Maharashtra_Mn_Tonnage'].mean()
    wet_mean = wet_months['Maharashtra_Mn_Tonnage'].mean()
    volatility_ratio = wet_mean / dry_mean if dry_mean > 0 else 0.8
    
    with rasterio.open(os.path.join(proc_dir, 'aligned_ndvi_seasonal_delta.tif')) as src:
        ndvi_delta = np.nanmean(src.read(1))
    with rasterio.open(os.path.join(proc_dir, 'aligned_soil_moisture_seasonal_delta.tif')) as src:
        sm_delta = np.nanmean(src.read(1))

    # Scope: FY15-16 to FY17-18
    dates = pd.date_range(start='2015-04-01', end='2018-03-31')
    df = pd.DataFrame({'date': dates})
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)
    df['is_monsoon'] = df['month'].isin([6, 7, 8, 9]).astype(int)
    
    # Fiscal year calculation (April to March)
    df['fy'] = df.apply(lambda row: f"{row['year']}-{str(row['year']+1)[-2:]}" if row['month'] >= 4 else f"{row['year']-1}-{str(row['year'])[-2:]}", axis=1)
    
    # Base synthetic generation
    base_prod = 1000
    np.random.seed(42)
    df['equipment_uptime_pct'] = np.random.uniform(0.7, 1.0, len(df))
    df['blasting_delay_hrs'] = np.random.uniform(0, 4, len(df))
    
    df['rainfall_mm'] = 0.0
    monsoon_idx = df[df['is_monsoon'] == 1].index
    rain_mask = np.random.rand(len(monsoon_idx)) < 0.6
    df.loc[monsoon_idx[rain_mask], 'rainfall_mm'] = np.random.gamma(shape=2.0, scale=mean_rain, size=len(monsoon_idx[rain_mask]))
    
    monsoon_penalty = np.where(df['is_monsoon'] == 1, volatility_ratio, 1.0)
    
    df['true_production_t'] = (
        base_prod 
        * df['equipment_uptime_pct'] 
        * (1 - df['blasting_delay_hrs']/10)
        * monsoon_penalty
        - df['rainfall_mm'] * 5 
    )
    df['true_production_t'] += np.random.normal(0, 50, len(df))
    df['true_production_t'] = df['true_production_t'].clip(lower=0)
    
    # MCDR Ratio Scaling (Correcting the synthetic bounds to audited actuals)
    mcdr = pd.read_csv(os.path.join(proc_dir, 'mcdr_ground_truth.csv'))
    # Use the 252580 for 2015-16
    mcdr_dict = mcdr.set_index('year')['rom_actual_te'].to_dict()
    
    for fy, target_actual in mcdr_dict.items():
        if fy in df['fy'].unique() and not pd.isna(target_actual):
            synth_sum = df.loc[df['fy'] == fy, 'true_production_t'].sum()
            scale_factor = target_actual / synth_sum
            df.loc[df['fy'] == fy, 'true_production_t'] *= scale_factor
            print(f"Scaled FY {fy}: synth sum {synth_sum:.1f} -> target {target_actual} (scale {scale_factor:.4f})")
            
    # Inject Derived Features
    # FY 15-16
    idx_15_16 = df['fy'] == '2015-16'
    df.loc[idx_15_16, 'rom_gross_reported_te'] = 281215
    df.loc[idx_15_16, 'stripping_ratio_miss'] = 2.0  # 1:8 actual vs 1:6 proposed
    df.loc[idx_15_16, 'production_shortfall_pct'] = 0.1965 # (350000 - 281215)/350000
    df.loc[idx_15_16, 'ob_overrun_pct'] = 0.20 # Derived proxy
    
    # FY 16-17
    idx_16_17 = df['fy'] == '2016-17'
    df.loc[idx_16_17, 'rom_gross_reported_te'] = np.nan
    df.loc[idx_16_17, 'stripping_ratio_miss'] = 0.0
    df.loc[idx_16_17, 'production_shortfall_pct'] = 0.0
    df.loc[idx_16_17, 'ob_overrun_pct'] = 0.0
    
    # FY 17-18
    idx_17_18 = df['fy'] == '2017-18'
    df.loc[idx_17_18, 'rom_gross_reported_te'] = np.nan
    df.loc[idx_17_18, 'stripping_ratio_miss'] = 0.0 # 1:11 vs 1:11
    df.loc[idx_17_18, 'production_shortfall_pct'] = 0.2037 # (384000 - 305762)/384000
    df.loc[idx_17_18, 'ob_overrun_pct'] = 0.10 # Derived proxy

    # Fillnas with 0 for safety for training
    df['rom_gross_reported_te'] = df['rom_gross_reported_te'].fillna(0)
    df['stripping_ratio_miss'] = df['stripping_ratio_miss'].fillna(0)
    df['production_shortfall_pct'] = df['production_shortfall_pct'].fillna(0)
    df['ob_overrun_pct'] = df['ob_overrun_pct'].fillna(0)
    
    # Lags
    df['lag_1d_production_t'] = df['true_production_t'].shift(1)
    df['lag_7d_mean_production_t'] = df['true_production_t'].rolling(7).mean().shift(1)
    df = df.dropna().reset_index(drop=True)
    
    df['ndvi_seasonal_delta'] = ndvi_delta
    df['soil_moisture_seasonal_delta'] = sm_delta

    grade_tier = get_grade_distribution()
    tier_prices = {'Below 25%': 3000, '25-35%': 6000, '35-46%': 12000, 'Above 46%': 20000}
    price = tier_prices.get(grade_tier, 6000)
    df['daily_value_inr'] = df['true_production_t'] * price
    
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    target = 'true_production_t'
    
    X = df[features]
    y = df[target]
    
    tscv = TimeSeriesSplit(n_splits=5)
    
    # Support warm starting if existing model JSON exists
    model_path = os.path.join(proc_dir, 'model2_xgb.json')
    xgb_params = {'n_estimators': 200, 'learning_rate': 0.1, 'max_depth': 5, 'random_state': 42}
    
    rmse_scores = []
    best_model = None
    
    print("\nTraining Model 2 (XGBoost) with Model Persistence Policy...")
    for train_ix, test_ix in tscv.split(X):
        X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
        y_tr, y_te = y.iloc[train_ix], y.iloc[test_ix]
        
        eval_split = int(len(X_tr) * 0.9)
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
    print(f"TimeSeries CV RMSE: {avg_rmse:.2f}")
    
    # Evaluate and persist
    evaluate_and_save_model('model2_xgb', best_model, avg_rmse, 'RMSE', model_path, minimize=True)
    
    # Note: save_model works for json since we are using XGBoost native format for warm start
    # but the utility saves via joblib. If the utility saved via joblib, the next run would fail xgb_model.
    # Let's explicitly save as json if the utility permitted.
    best_model.get_booster().save_model(model_path) # native xgb
    
    df.to_csv(os.path.join(proc_dir, 'production_training.csv'), index=False)
    print("\n[OK] Model 2 Production Forecasting trained.")

if __name__ == '__main__':
    train_model2()
