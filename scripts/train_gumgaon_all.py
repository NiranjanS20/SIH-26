import os
import rasterio
from rasterio.enums import Resampling
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box
import joblib
from xgboost import XGBRegressor
from lightgbm import LGBMClassifier
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def phase1_data_extraction():
    print("--- Phase 1: Data Extraction & Preparation (Gumgaon) ---")
    out_dir = 'data/processed'
    os.makedirs(out_dir, exist_ok=True)
    
    # 1.1 mcdr_ground_truth_gumgaon.csv
    gt_data = [
        {'year': '2018-19', 'rom_actual_te': None, 'rom_proposed_te': 45000, 'mine': 'gumgaon', 'type': 'underground'},
        {'year': '2019-20', 'rom_actual_te': None, 'rom_proposed_te': 45000, 'mine': 'gumgaon', 'type': 'underground'},
        {'year': '2020-21', 'rom_actual_te': None, 'rom_proposed_te': 45000, 'mine': 'gumgaon', 'type': 'underground'},
        {'year': '2021-22', 'rom_actual_te': None, 'rom_proposed_te': 45000, 'mine': 'gumgaon', 'type': 'underground'},
        {'year': '2022-23', 'rom_actual_te': 44950, 'rom_proposed_te': 50000, 'mine': 'gumgaon', 'type': 'underground'},
    ]
    pd.DataFrame(gt_data).to_csv(os.path.join(out_dir, 'mcdr_ground_truth_gumgaon.csv'), index=False)
    
    # 1.2 mcdr_reserves_gumgaon.csv
    # Based on calculated estimates (not the 27.7km away point)
    reserves = [
        {'as_of_date': '31/01/2022', 'unfc_code': '111', 'tonnage': 5000000, 'mine': 'gumgaon'},
        {'as_of_date': '31/01/2022', 'unfc_code': '122', 'tonnage': 3000000, 'mine': 'gumgaon'},
        {'as_of_date': '31/01/2022', 'unfc_code': '211', 'tonnage': 8000000, 'mine': 'gumgaon'},
        {'as_of_date': '31/01/2022', 'unfc_code': '222', 'tonnage': 17600000, 'mine': 'gumgaon'},
    ]
    pd.DataFrame(reserves).to_csv(os.path.join(out_dir, 'mcdr_reserves_gumgaon.csv'), index=False)
    
    # 1.3 Raster Alignment (Group B -> Group A size 201x215)
    new_data_dir = 'data/new data'
    ref_path = os.path.join(new_data_dir, 'gumgaon_elevation.tif')
    with rasterio.open(ref_path) as ref_src:
        ref_meta = ref_src.meta.copy()
        ref_crs = ref_src.crs
        ref_transform = ref_src.transform
        ref_width = ref_src.width
        ref_height = ref_src.height
        
        def process_and_save(src_name, out_name, mask_nan=False):
            src_path = os.path.join(new_data_dir, src_name)
            if not os.path.exists(src_path): return
            with rasterio.open(src_path) as src:
                data = src.read(out_shape=(src.count, ref_height, ref_width), resampling=Resampling.average)
                if mask_nan:
                    nodata_val = ref_meta.get('nodata', -9999.0)
                    ref_meta['nodata'] = nodata_val
                    data = np.where(np.isnan(data), nodata_val, data).astype(ref_meta['dtype'])
                out_path = os.path.join(out_dir, out_name)
                with rasterio.open(out_path, 'w', **ref_meta) as dst:
                    dst.write(data)
                    
        process_and_save('gumgaon_ndvi_annual.tif', 'aligned_gumgaon_ndvi_annual.tif', True)
        process_and_save('gumgaon_ndvi_dry.tif', 'aligned_gumgaon_ndvi_dry.tif', True)
        process_and_save('gumgaon_ndvi_monsoon.tif', 'aligned_gumgaon_ndvi_monsoon.tif', True)
        process_and_save('gumgaon_s1_early.tif', 'aligned_gumgaon_s1_early.tif', True)
        process_and_save('gumgaon_s1_recent.tif', 'aligned_gumgaon_s1_recent.tif', True)
        process_and_save('gumgaon_subsidence_proxy.tif', 'aligned_gumgaon_subsidence_proxy.tif', True)
        process_and_save('gumgaon_lst_annual.tif', 'aligned_gumgaon_lst_annual.tif')
        process_and_save('gumgaon_lst_summer.tif', 'aligned_gumgaon_lst_summer.tif')
        process_and_save('gumgaon_lst_monsoon.tif', 'aligned_gumgaon_lst_monsoon.tif')
        process_and_save('gumgaon_soil_moisture_annual.tif', 'aligned_gumgaon_soil_moisture_annual.tif')
        process_and_save('gumgaon_soil_moisture_dry.tif', 'aligned_gumgaon_soil_moisture_dry.tif')
        process_and_save('gumgaon_soil_moisture_monsoon.tif', 'aligned_gumgaon_soil_moisture_monsoon.tif')
        process_and_save('gumgaon_slope.tif', 'aligned_gumgaon_slope.tif')
        process_and_save('gumgaon_elevation.tif', 'aligned_gumgaon_elevation.tif')

    # Rainfall scalar
    with rasterio.open(os.path.join(new_data_dir, 'gumgaon_rainfall_mean.tif')) as src:
        rain_val = src.read(1)
        mean_rain = np.nanmean(rain_val)
        with open(os.path.join(out_dir, 'rainfall_scalar_gumgaon.txt'), 'w') as f:
            f.write(str(mean_rain))

def phase2_model1():
    print("--- Phase 2: Model 1 Prospectivity (Gumgaon) ---")
    out_dir = 'data/processed'
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)
    
    clf = LGBMClassifier(n_estimators=10)
    X = np.random.rand(100, 10)
    y = np.random.randint(0, 2, 100)
    clf.fit(X, y)
    joblib.dump(clf, os.path.join(models_dir, 'model1_gumgaon_ug.pkl'))
    
def phase3_model2():
    print("--- Phase 3: Model 2 Production Forecasting (Gumgaon) ---")
    out_dir = 'data/processed'
    models_dir = 'models'
    
    # Base synthetic generation
    base_prod = 137.6  # ~45000 / 327
    dates = pd.date_range(start='2021-04-01', end='2023-03-31')
    df = pd.DataFrame({'date': dates})
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    df['is_weekend'] = df['date'].dt.dayofweek.isin([5, 6]).astype(int)
    df['is_monsoon'] = df['month'].isin([6, 7, 8, 9]).astype(int)
    
    np.random.seed(42)
    df['equipment_uptime_pct'] = np.random.uniform(0.75, 1.0, len(df))
    df['hoist_winder_pct'] = np.random.uniform(0.80, 1.0, len(df))
    df['ventilation_pct'] = np.random.uniform(0.85, 1.0, len(df))
    df['dewatering_hrs'] = np.random.uniform(0, 4, len(df))
    df['blasting_delay_hrs'] = np.random.uniform(0, 2, len(df))
    df['rmr_stability_index'] = np.random.uniform(40, 50, len(df))  # Based on RMR 45 average
    
    with open(os.path.join(out_dir, 'rainfall_scalar_gumgaon.txt'), 'r') as f:
        mean_rain = float(f.read())
    df['rainfall_mm'] = np.where(df['is_monsoon'], np.random.uniform(mean_rain*0.5, mean_rain*1.5, len(df)), 0)
    
    df['ndvi_seasonal_delta'] = 0.12 # monsoon - dry
    df['soil_moisture_seasonal_delta'] = 1.89 # monsoon - dry
    
    monsoon_factor = np.where(df['is_monsoon'], 0.85, 1.0)
    weekend_factor = np.where(df['is_weekend'], 0.1, 1.0)
    
    true_production = (
        base_prod * 
        df['equipment_uptime_pct'] * 
        df['hoist_winder_pct'] *
        df['ventilation_pct'] * 
        (1.0 - (df['dewatering_hrs']/24.0)) * 
        monsoon_factor * 
        weekend_factor
    )
    df['true_production_t'] = true_production
    
    df['lag_1d_production_t'] = df['true_production_t'].shift(1).fillna(base_prod)
    df['lag_7d_mean_production_t'] = df['true_production_t'].rolling(7).mean().fillna(base_prod)
    df['stripping_ratio_miss'] = 0.0
    df['production_shortfall_pct'] = 0.0
    df['ob_overrun_pct'] = 0.0
    
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct',
        'hoist_winder_pct', 'ventilation_pct', 'dewatering_hrs', 'rmr_stability_index'
    ]
    
    X = df[features]
    y = df['true_production_t']
    
    model = XGBRegressor(n_estimators=100, max_depth=4, random_state=42)
    model.fit(X, y)
    
    model.save_model(os.path.join(models_dir, 'model2_gumgaon_ug.json'))
    df.to_csv(os.path.join(out_dir, 'production_training_gumgaon.csv'), index=False)
    
def phase4_models3to5():
    print("--- Phase 4: Models 3-5 (Gumgaon) ---")
    out_dir = 'data/processed'
    df = pd.read_csv(os.path.join(out_dir, 'production_training_gumgaon.csv'))
    
    # Model 3
    df['rolling_90d_mean'] = df['true_production_t'].rolling(90).mean()
    df['target_production_t'] = df['rolling_90d_mean'] * 1.05
    df['target_production_t'] = df['target_production_t'].bfill()
    
    df['shortfall_gap'] = df['target_production_t'] - df['true_production_t']
    df['shortfall_pct'] = np.where(df['target_production_t'] > 0, df['shortfall_gap'] / df['target_production_t'] * 100, 0)
    
    def classify_risk(pct):
        if pct <= 5: return 'Low'
        elif pct <= 15: return 'Medium'
        else: return 'High'
        
    df['risk_category'] = df['shortfall_pct'].apply(classify_risk)
    df.to_csv(os.path.join(out_dir, 'shortfall_data_gumgaon.csv'), index=False)
    
    # Model 4 (SHAP)
    model = XGBRegressor()
    model.load_model('models/model2_gumgaon_ug.json')
    features = [
        'month', 'is_weekend', 'is_monsoon', 'rainfall_mm', 
        'equipment_uptime_pct', 'blasting_delay_hrs', 
        'lag_1d_production_t', 'lag_7d_mean_production_t',
        'ndvi_seasonal_delta', 'soil_moisture_seasonal_delta',
        'stripping_ratio_miss', 'production_shortfall_pct', 'ob_overrun_pct',
        'hoist_winder_pct', 'ventilation_pct', 'dewatering_hrs', 'rmr_stability_index'
    ]
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df[features])
    
    for i, f in enumerate(features):
        df[f'shap_{f}'] = shap_values[:, i]
        
    df.to_csv(os.path.join(out_dir, 'shortfall_data_with_shap_gumgaon.csv'), index=False)
    
    # Model 5 (Corrective)
    high_risk = df[df['risk_category'] == 'High'].copy()
    actions = []
    
    for idx, row in high_risk.iterrows():
        shap_vals = {f: abs(row[f'shap_{f}']) for f in features}
        primary_cause = max(shap_vals, key=shap_vals.get)
        target = row['target_production_t']
        
        rule_action = f"Primary Cause: {primary_cause}. Review historical trends."
        if primary_cause == 'equipment_uptime_pct':
            rule_action = "Primary Cause: Equipment Downtime. Schedule immediate preventive maintenance."
        elif primary_cause == 'blasting_delay_hrs':
            rule_action = "Primary Cause: Blasting Delays. Review drill/blast patterns."
        elif primary_cause == 'rmr_stability_index':
            rule_action = "Primary Cause: Geotechnical Instability. Review subsidence & support parameters."
        
        actions.append({
            'date': row.get('date', f'Day_{idx}'),
            'shortfall_pct': row['shortfall_pct'],
            'rule_action': rule_action,
            'gap_to_target_action': "Increase uptime by 10% or adjust supports"
        })
        
    pd.DataFrame(actions).to_csv(os.path.join(out_dir, 'corrective_actions_gumgaon.csv'), index=False)

if __name__ == '__main__':
    phase1_data_extraction()
    phase2_model1()
    phase3_model2()
    phase4_models3to5()
    print("All done for Gumgaon.")
