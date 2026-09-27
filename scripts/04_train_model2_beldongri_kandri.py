import os
import pandas as pd
import numpy as np
import rasterio
from xgboost import XGBRegressor
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error
from model_persistence import evaluate_and_save_model

def get_price(grade='25-35%'):
    tiers = {
        'Below 25%': 2426.68,
        '25-35%': 6023.78,
        '35-46%': 11688.23
    }
    return tiers.get(grade, 6023.78)

def train_for_mine(mine_id):
    print(f"\n--- Training Model 2 Production Forecasting for {mine_id.upper()} ---")
    proc_dir = 'data/processed'
    
    # 1. Load Synthetic Dataset
    synth_file = 'data/satellite data and more/synthetic_operational_data_all_mines.csv'
    if not os.path.exists(synth_file):
        print(f"ERROR: Could not find synthetic dataset at {synth_file}")
        return
        
    df_all = pd.read_csv(synth_file)
    df = df_all[df_all['mine'] == mine_id].copy()
    
    if len(df) == 0:
        print(f"WARNING: No data found for mine '{mine_id}' in synthetic dataset.")
        return
        
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)
    
    # 2. Extract Base Features from Synthetic Data
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_sunday'] = (df['day_of_week'] == 6).astype(int)
    df['is_monsoon'] = df['month'].isin([6, 7, 8, 9]).astype(int)
    
    # In synthetic data, actual_production_tons is the target
    df['true_production_t'] = df['actual_production_tons']
    df.loc[df['is_sunday'] == 1, 'true_production_t'] = 0.0 # Force sundays to 0
    
    # 3. Lags
    df['lag_1d_production_t'] = df['true_production_t'].shift(1)
    df['lag_7d_mean_production_t'] = df['true_production_t'].rolling(7).mean().shift(1)
    
    # 4. Geospatial / Environmental mock-up or actual (if available)
    # The frontend expects these, we'll assign defaults if missing to ensure model compatibility
    df['ndvi_seasonal_delta'] = 0.15 
    df['soil_moisture_seasonal_delta'] = 0.20
    
    # 5. Derived Features (Shortfall, Overrun, Stripping) - assumed 0 for simplification or minor variance
    df['stripping_ratio_miss'] = np.clip(np.random.normal(0, 0.2, len(df)), 0, None)
    df['production_shortfall_pct'] = 0.0 
    df['ob_overrun_pct'] = 0.0 
    
    # Value
    df['daily_value_inr'] = df['true_production_t'] * get_price('25-35%')
    
    # Align column names to what the UI/Backend expects for prediction
    if 'blasting_delay_days' in df.columns and 'blasting_delay_hrs' not in df.columns:
        df['blasting_delay_hrs'] = df['blasting_delay_days'] * 24.0
        
    df = df.dropna().reset_index(drop=True)
    
    features = [
        'month', 'is_sunday', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    target = 'true_production_t'
    
    for col in features:
        if col not in df.columns:
            print(f"Warning: Missing column {col}, filling with 0")
            df[col] = 0.0
            
    X = df[features]
    y = df[target]
    
    tscv = TimeSeriesSplit(n_splits=5)
    
    model_name = f'model2_xgb_{mine_id}'
    model_path = os.path.join(proc_dir, f'{model_name}.json')
    xgb_params = {'n_estimators': 200, 'learning_rate': 0.1, 'max_depth': 5, 'random_state': 42}
    
    rmse_scores = []
    best_model = None
    
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
        
    avg_rmse = np.mean(rmse_scores) if rmse_scores else 0
    print(f"{mine_id} TimeSeries CV RMSE: {avg_rmse:.2f}")
    
    evaluate_and_save_model(model_name, best_model, avg_rmse, 'RMSE', model_path, minimize=True)
    best_model.get_booster().save_model(model_path)
    
    csv_path = os.path.join(proc_dir, f'production_training_{mine_id}.csv')
    df.to_csv(csv_path, index=False)
    print(f"[OK] Model 2 Production Forecasting ({mine_id}) trained and saved to {model_path}.")

def main():
    train_for_mine('Beldongri')
    train_for_mine('Kandri')

if __name__ == '__main__':
    main()
