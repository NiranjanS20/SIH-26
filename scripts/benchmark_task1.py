import os
import time
import geopandas as gpd
import rasterio
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.svm import SVC, SVR
from lightgbm import LGBMClassifier, LGBMRegressor
from sklearn.model_selection import StratifiedKFold, KFold, RandomizedSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
from scipy.spatial import cKDTree

def extract_features_at_points(raster_dict, points_gdf):
    results = {k: [] for k in raster_dict.keys()}
    coords = [(geom.x, geom.y) for geom in points_gdf.geometry]
    
    for feat_name, path in raster_dict.items():
        with rasterio.open(path) as src:
            data = src.read(1)
            t = src.transform
            a, c, e, f = t.a, t.c, t.e, t.f
            
            for x, y in coords:
                try:
                    col = int(np.floor((x - c) / a))
                    row = int(np.floor((y - f) / e))
                    if 0 <= row < src.height and 0 <= col < src.width:
                        val = data[row, col]
                        if val == src.nodata:
                            val = np.nan
                        results[feat_name].append(val)
                    else:
                        results[feat_name].append(np.nan)
                except Exception:
                    results[feat_name].append(np.nan)
    return results

def load_data():
    data_dir = 'data/satellite data and more'
    proc_dir = 'data/processed'
    
    key_ev = gpd.read_file(os.path.join(data_dir, 'Dongri_Buzurg_Key_Evidence.geojson'))
    key_ev['geometry'] = key_ev.geometry.centroid
    
    geopackage = os.path.join(data_dir, 'Dongri_Buzurg_Geoscience_Compiled.gpkg')
    litho = gpd.read_file(geopackage, layer='lithology_near_mine')
    
    soil_c = gpd.read_file(geopackage, layer='soil_c_horizon_near_mine')
    soil_r = gpd.read_file(geopackage, layer='soil_regolith_near_mine')
    stream = gpd.read_file(geopackage, layer='stream_sediments_near_mine')
    geochem = pd.concat([soil_c, soil_r, stream], ignore_index=True)
    geochem_coords = np.array([(g.x, g.y) for g in geochem.geometry])
    geochem_mno = geochem['mno'].values
    tree = cKDTree(geochem_coords)
    
    with rasterio.open(os.path.join(proc_dir, 'aligned_ndvi.tif')) as src:
        t = src.transform
        left = t.c
        right = t.c + t.a * src.width
        top = t.f
        bottom = t.f + t.e * src.height
        
    np.random.seed(42)
    n_background = 1000
    min_y, max_y = min(bottom, top), max(bottom, top)
    min_x, max_x = min(left, right), max(left, right)
    
    bg_x = np.random.uniform(min_x, max_x, n_background)
    bg_y = np.random.uniform(min_y, max_y, n_background)
    bg_gdf = gpd.GeoDataFrame(geometry=gpd.points_from_xy(bg_x, bg_y), crs=litho.crs)
    bg_gdf['MnO_pct'] = 0.0 
    bg_gdf['is_gondite_mn_ore'] = 0
    
    key_ev_clean = key_ev[['geometry', 'MnO_pct']].copy()
    key_ev_clean['is_gondite_mn_ore'] = 1
    
    train_points = pd.concat([key_ev_clean, bg_gdf], ignore_index=True)
    
    dists, idxs = tree.query([(g.x, g.y) for g in train_points.geometry], k=1)
    train_points['mno_geochem_proxy'] = geochem_mno[idxs]
    
    v2_rasters = {
        'ndvi_current': os.path.join(proc_dir, 'aligned_ndvi.tif'),
        'lst_current': os.path.join(proc_dir, 'aligned_lst.tif'),
        'slope': os.path.join(proc_dir, 'aligned_slope.tif'),
        'elevation': os.path.join(data_dir, 'dongri_buzurg_elevation.tif'),
        'soil_moisture_current': os.path.join(proc_dir, 'aligned_soil_moisture_proxy.tif')
    }
    v3_rasters = {
        'ndvi_monsoon': os.path.join(proc_dir, 'aligned_ndvi_monsoon.tif'),
        'ndvi_dry': os.path.join(proc_dir, 'aligned_ndvi_dry.tif'),
        'ndvi_seasonal_delta': os.path.join(proc_dir, 'aligned_ndvi_seasonal_delta.tif'),
        'lst_monsoon': os.path.join(proc_dir, 'aligned_lst_monsoon.tif'),
        'lst_summer': os.path.join(proc_dir, 'aligned_lst_summer.tif'),
        'lst_seasonal_range': os.path.join(proc_dir, 'aligned_lst_seasonal_range.tif'),
        'soil_moisture_monsoon': os.path.join(proc_dir, 'aligned_soil_moisture_monsoon.tif'),
        'soil_moisture_dry': os.path.join(proc_dir, 'aligned_soil_moisture_dry.tif'),
        'soil_moisture_seasonal_delta': os.path.join(proc_dir, 'aligned_soil_moisture_seasonal_delta.tif'),
        'iron_oxide_index': os.path.join(proc_dir, 'aligned_iron_oxide_index.tif'),
        'clay_index': os.path.join(proc_dir, 'aligned_clay_index.tif')
    }
    
    all_rasters = {**v2_rasters, **v3_rasters}
    extracted = extract_features_at_points(all_rasters, train_points)
    for k, v in extracted.items():
        train_points[k] = v
        
    train_points['is_gondite_mn_ore'] = train_points['is_gondite_mn_ore'].fillna(0).astype(int)
    train_points['MnO_pct'] = train_points['MnO_pct'].fillna(0.0)
    train_points['mno_geochem_proxy'] = train_points['mno_geochem_proxy'].fillna(0.0)
    
    train_points = train_points.dropna(subset=list(all_rasters.keys()))
    v3_features = list(all_rasters.keys()) + ['mno_geochem_proxy']
    
    return train_points[v3_features], train_points['is_gondite_mn_ore'], train_points['MnO_pct']


def benchmark_classification(X, y):
    print(f"\nClass balance in dataset: {y.value_counts().to_dict()}")
    models = {
        'Random Forest (Balanced)': 'RF',
        'Logistic Regression (Balanced)': 'LR',
        'SVM RBF (Balanced)': 'SVM',
        'LightGBM (Balanced)': 'LGBM'
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = []
    
    for name, tag in models.items():
        metrics = {'Accuracy': [], 'Precision': [], 'Recall': [], 'F1': [], 'AUC-ROC': [], 'TrainTime': [], 'InferenceTime_per_zone': []}
        
        for train_ix, test_ix in cv.split(X, y):
            X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
            y_tr, y_te = y.iloc[train_ix], y.iloc[test_ix]
            print(f"  Test is_ore=1: {sum(y_te == 1)}, is_ore=0: {sum(y_te == 0)}")
            
            # Use standard scaler since features have different ranges
            scaler = StandardScaler()
            X_tr_sc = scaler.fit_transform(X_tr)
            X_te_sc = scaler.transform(X_te)
            
            if tag == 'RF':
                model = RandomForestClassifier(class_weight='balanced', random_state=42)
            elif tag == 'LR':
                model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
            elif tag == 'SVM':
                model = SVC(kernel='rbf', probability=True, class_weight='balanced', random_state=42)
            elif tag == 'LGBM':
                model = LGBMClassifier(class_weight='balanced', random_state=42, verbose=-1)
            
            t0 = time.time()
            model.fit(X_tr_sc, y_tr)
            train_t = time.time() - t0
            
            t1 = time.time()
            preds = model.predict(X_te_sc)
            inf_t = time.time() - t1
            probs = model.predict_proba(X_te_sc)[:, 1] if hasattr(model, 'predict_proba') else preds
            
            metrics['Accuracy'].append(accuracy_score(y_te, preds))
            metrics['Precision'].append(precision_score(y_te, preds, zero_division=0))
            metrics['Recall'].append(recall_score(y_te, preds))
            metrics['F1'].append(f1_score(y_te, preds))
            metrics['AUC-ROC'].append(roc_auc_score(y_te, probs))
            metrics['TrainTime'].append(train_t)
            metrics['InferenceTime_per_zone'].append(inf_t / len(y_te) * 1000) # ms per zone
            
        mean_metrics = {k: np.mean(v) for k, v in metrics.items()}
        mean_metrics['Algorithm'] = name
        mean_metrics['Task'] = 'Classification'
        results.append(mean_metrics)
        
    return pd.DataFrame(results)


def benchmark_regression(X, y):
    models = {
        'Random Forest (Default)': 'RF',
        'Ridge Regression (Default)': 'LR',
        'SVR RBF (Default)': 'SVM',
        'LightGBM (Default)': 'LGBM'
    }
    
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    results = []
    
    for name, tag in models.items():
        metrics = {'RMSE': [], 'MAE': [], 'R2': [], 'TrainTime': [], 'InferenceTime_per_zone': []}
        
        for train_ix, test_ix in cv.split(X, y):
            X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
            y_tr, y_te = y.iloc[train_ix], y.iloc[test_ix]
            
            scaler = StandardScaler()
            X_tr_sc = scaler.fit_transform(X_tr)
            X_te_sc = scaler.transform(X_te)
            
            if tag == 'RF':
                model = RandomForestRegressor(random_state=42)
            elif tag == 'LR':
                model = Ridge(random_state=42)
            elif tag == 'SVM':
                model = SVR(kernel='rbf')
            elif tag == 'LGBM':
                model = LGBMRegressor(random_state=42, verbose=-1)
            
            t0 = time.time()
            model.fit(X_tr_sc, y_tr)
            train_t = time.time() - t0
            
            t1 = time.time()
            preds = model.predict(X_te_sc)
            inf_t = time.time() - t1
            
            metrics['RMSE'].append(np.sqrt(mean_squared_error(y_te, preds)))
            metrics['MAE'].append(mean_absolute_error(y_te, preds))
            metrics['R2'].append(r2_score(y_te, preds))
            metrics['TrainTime'].append(train_t)
            metrics['InferenceTime_per_zone'].append(inf_t / len(y_te) * 1000) # ms per zone
            
        mean_metrics = {k: np.mean(v) for k, v in metrics.items()}
        mean_metrics['Algorithm'] = name
        mean_metrics['Task'] = 'Regression'
        results.append(mean_metrics)
        
    return pd.DataFrame(results)

if __name__ == '__main__':
    print("Loading data for Task 1 Benchmarking...")
    X, y_class, y_reg = load_data()
    
    print("Benchmarking Classification (is_ore)...")
    clf_df = benchmark_classification(X, y_class)
    
    print("Benchmarking Regression (MnO_pct)...")
    reg_df = benchmark_regression(X, y_reg)
    
    final_df = pd.concat([clf_df, reg_df], ignore_index=True)
    
    out_path = 'models/benchmarks/feature1_leaderboard.csv'
    final_df.to_csv(out_path, index=False)
    print(f"Saved leaderboard to {out_path}")
