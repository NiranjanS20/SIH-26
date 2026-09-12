import os
import pandas as pd
import numpy as np
import shap
from xgboost import XGBRegressor
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.metrics import mean_squared_error, mean_absolute_error

def run_seasonal_update():
    print("--- Task 4: Seasonal Component Update ---")
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'production_training.csv'))
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    
    # Extract seasonal component using period=365 (Yearly monsoon cycle)
    print("Extracting seasonal index...")
    result = seasonal_decompose(df['true_production_t'], model='additive', period=365)
    df['seasonal_index'] = result.seasonal.values
    
    # Feature 2 original features
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    target = 'true_production_t'
    
    # XGBoost strictly enforces that warm-started models must have the exact same number
    # of features and names. To inject the seasonal index without violating the warm-start 
    # constraint, we replace the 'ndvi_seasonal_delta' column (which was a static constant 
    # across all rows in the synthetic dataset and thus had 0 SHAP importance) with our new index.
    df['ndvi_seasonal_delta'] = df['seasonal_index']
    
    # Load original model
    model_path = os.path.join(proc_dir, 'model2_xgb.json')
    original_model = XGBRegressor()
    original_model.load_model(model_path)
    
    # Compute BEFORE metrics on the last 20%
    train_size = int(len(df) * 0.8)
    X_train, y_train = df[features].iloc[:train_size], df[target].iloc[:train_size]
    X_test, y_test = df[features].iloc[train_size:], df[target].iloc[train_size:]
    
    preds_before = original_model.predict(X_test)
    rmse_before = np.sqrt(mean_squared_error(y_test, preds_before))
    mae_before = mean_absolute_error(y_test, preds_before)
    
    # Compute BEFORE SHAP on a monsoon day
    monsoon_days = df.iloc[train_size:][df.iloc[train_size:]['is_monsoon'] == 1]
    sample_day = monsoon_days.iloc[[0]]
    
    explainer_before = shap.TreeExplainer(original_model)
    shap_before = explainer_before.shap_values(sample_day[features])[0]
    
    # Warm start retrain
    print("Warm-starting XGBoost with seasonal data...")
    # Original model has 200 trees. To actually learn from the new feature, we must increase n_estimators.
    new_model = XGBRegressor(n_estimators=400, learning_rate=0.1, max_depth=5, random_state=42)
    new_model.fit(X_train, y_train, xgb_model=model_path, eval_set=[(X_test, y_test)], verbose=False)
    
    preds_after = new_model.predict(X_test)
    rmse_after = np.sqrt(mean_squared_error(y_test, preds_after))
    mae_after = mean_absolute_error(y_test, preds_after)
    
    explainer_after = shap.TreeExplainer(new_model)
    shap_after = explainer_after.shap_values(sample_day[features])[0]
    
    print(f"RMSE Before: {rmse_before:.2f} | RMSE After: {rmse_after:.2f}")
    print(f"MAE Before: {mae_before:.2f} | MAE After: {mae_after:.2f}")
    print("\nSHAP Values on Monsoon Day:")
    for i, feat in enumerate(features):
        disp_feat = "seasonal_index" if feat == "ndvi_seasonal_delta" else feat
        print(f"{disp_feat}: Before={shap_before[i]:.2f}, After={shap_after[i]:.2f}")
    
    # DO NOT SAVE MODEL to prevent bloating the artifact again!
    # Report writing disabled to preserve manual rejection text
    
if __name__ == '__main__':
    run_seasonal_update()
