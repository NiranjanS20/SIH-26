import pandas as pd
import shap
import joblib
import os
import matplotlib.pyplot as plt

def run_shap():
    print("--- Phase 5: Model 4 SHAP Analysis ---")
    proc_dir = 'data/processed'
    df = pd.read_csv(os.path.join(proc_dir, 'shortfall_data.csv'))
    from xgboost import XGBRegressor
    model = XGBRegressor()
    model.load_model(os.path.join(proc_dir, 'model2_xgb.json'))
        
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct'
    ]
    X = df[features]
    
    explainer = shap.TreeExplainer(model.get_booster())
    shap_values = explainer.shap_values(X)
    
    # Save SHAP Summary
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X, show=False)
    plt.tight_layout()
    plt.savefig(os.path.join(proc_dir, 'shap_summary.png'))
    plt.close()
    
    # Save Feature Importances CSV for Report
    import numpy as np
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_df = pd.DataFrame({'Feature': features, 'Mean_Abs_SHAP': mean_abs_shap})
    shap_df = shap_df.sort_values(by='Mean_Abs_SHAP', ascending=False)
    shap_df.to_csv(os.path.join(proc_dir, 'shap_summary_model2.csv'), index=False)
    
    # High shortfall force plots
    high_risk = df[df['risk_category'] == 'High'].index
    if len(high_risk) > 0:
        sample_indices = high_risk[:3]
        for i, idx in enumerate(sample_indices):
            plt.figure(figsize=(12, 4))
            # SHAP 0.39+ compatible force plot
            shap.force_plot(explainer.expected_value, shap_values[idx,:], X.iloc[idx,:], matplotlib=True, show=False)
            plt.savefig(os.path.join(proc_dir, f'shap_force_plot_{i}.png'), bbox_inches='tight')
            plt.close()
    
    # Save SHAP values to data for Corrective Action script
    df_shap = pd.DataFrame(shap_values, columns=[f"shap_{f}" for f in features])
    df = pd.concat([df, df_shap], axis=1)
    df.to_csv(os.path.join(proc_dir, 'shortfall_data_with_shap.csv'), index=False)
    
    print("\n[OK] Model 4 SHAP Analysis completed. Plots saved.")

if __name__ == '__main__':
    run_shap()
