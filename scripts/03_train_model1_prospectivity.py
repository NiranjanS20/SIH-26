import os
import geopandas as gpd
import rasterio
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import StratifiedKFold, KFold, RandomizedSearchCV
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error
from scipy.spatial import cKDTree
import joblib
from model_persistence import evaluate_and_save_model, save_persistence_log, load_persistence_log

def extract_features_at_points(raster_dict, points_gdf):
    # raster_dict: {feature_name: path}
    # returns dict of {feature_name: array_of_values}
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

def train_model1():
    print("--- Phase 3: Model 1 Prospectivity Training ---")
    data_dir = 'data/satellite data and more'
    proc_dir = 'data/processed'
    
    # 1. Load targets (Grade polygons)
    key_ev = gpd.read_file(os.path.join(data_dir, 'Dongri_Buzurg_Key_Evidence.geojson'))
    # Represent polygons by their centroids for point-based extraction
    key_ev['geometry'] = key_ev.geometry.centroid
    
    # We also need a background of non-ore points to train a classifier.
    # We will sample random points in the extent, but first let's load geology
    geopackage = os.path.join(data_dir, 'Dongri_Buzurg_Geoscience_Compiled.gpkg')
    litho = gpd.read_file(geopackage, layer='lithology_near_mine')
    
    # Get geochem points for distance weighting
    soil_c = gpd.read_file(geopackage, layer='soil_c_horizon_near_mine')
    soil_r = gpd.read_file(geopackage, layer='soil_regolith_near_mine')
    stream = gpd.read_file(geopackage, layer='stream_sediments_near_mine')
    geochem = pd.concat([soil_c, soil_r, stream], ignore_index=True)
    geochem_coords = np.array([(g.x, g.y) for g in geochem.geometry])
    geochem_mno = geochem['mno'].values
    tree = cKDTree(geochem_coords)
    
    # Generate background points for binary classification
    # Use raster bounds to ensure we sample where we have data
    with rasterio.open(os.path.join(proc_dir, 'aligned_ndvi.tif')) as src:
        # Calculate bounds manually to avoid rasterio Affine bug
        t = src.transform
        left = t.c
        right = t.c + t.a * src.width
        top = t.f
        bottom = t.f + t.e * src.height
        
    np.random.seed(42)
    n_background = 1000
    # y is bottom to top (bottom < top usually, but raster might be top-down where e is negative)
    min_y, max_y = min(bottom, top), max(bottom, top)
    min_x, max_x = min(left, right), max(left, right)
    
    bg_x = np.random.uniform(min_x, max_x, n_background)
    bg_y = np.random.uniform(min_y, max_y, n_background)
    bg_gdf = gpd.GeoDataFrame(geometry=gpd.points_from_xy(bg_x, bg_y), crs=litho.crs)
    # Background has ~0 MnO and is generally non-ore
    bg_gdf['MnO_pct'] = 0.0 
    bg_gdf['is_gondite_mn_ore'] = 0
    
    # Combine ore points (Key Evidence) and background
    key_ev_clean = key_ev[['geometry', 'MnO_pct']].copy()
    # Key Evidence points are definitely ore
    key_ev_clean['is_gondite_mn_ore'] = 1
    
    train_points = pd.concat([key_ev_clean, bg_gdf], ignore_index=True)
    
    # Calculate geochem proxy
    dists, idxs = tree.query([(g.x, g.y) for g in train_points.geometry], k=1)
    train_points['mno_geochem_proxy'] = geochem_mno[idxs]
    
    # Extract Raster Features
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
        
    print("\nMissing values before dropna:")
    print(train_points.isna().sum())
    
    # Fill NAs in classification targets if sjoin failed
    train_points['is_gondite_mn_ore'] = train_points['is_gondite_mn_ore'].fillna(0).astype(int)
    train_points['MnO_pct'] = train_points['MnO_pct'].fillna(0.0)
    train_points['mno_geochem_proxy'] = train_points['mno_geochem_proxy'].fillna(0.0)
    
    # Drop rows where raster features are NaN
    train_points = train_points.dropna(subset=list(all_rasters.keys()))
    
    print("\nRows remaining after dropna on rasters:", len(train_points))
    
    v2_features = list(v2_rasters.keys()) + ['mno_geochem_proxy']
    v3_features = list(all_rasters.keys()) + ['mno_geochem_proxy']
    
    # --- Multicollinearity Check ---
    print("\n[Multicollinearity Check]")
    corr_vars = ['iron_oxide_index', 'clay_index', 'is_gondite_mn_ore']
    corr_matrix = train_points[corr_vars].corr()
    print(corr_matrix)
    
    # Target
    y_class = train_points['is_gondite_mn_ore']
    y_reg = train_points['MnO_pct']
    
    def evaluate_classifier(features, name):
        X = train_points[features]
        # Nested CV for unbiased evaluation
        outer_cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        inner_cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
        
        accs, f1s = [], []
        best_models = []
        
        for train_ix, test_ix in outer_cv.split(X, y_class):
            X_tr, X_te = X.iloc[train_ix], X.iloc[test_ix]
            y_tr, y_te = y_class.iloc[train_ix], y_class.iloc[test_ix]
            
            clf = RandomForestClassifier(class_weight='balanced', random_state=42)
            param_dist = {'n_estimators': [50, 100], 'max_depth': [3, 5, 10, None]}
            search = RandomizedSearchCV(clf, param_dist, n_iter=5, cv=inner_cv, scoring='f1', random_state=42, n_jobs=-1)
            search.fit(X_tr, y_tr)
            
            best_model = search.best_estimator_
            best_models.append(best_model)
            preds = best_model.predict(X_te)
            accs.append(accuracy_score(y_te, preds))
            f1s.append(f1_score(y_te, preds))
            
        print(f"\n{name} Classifier Metrics (Nested CV):")
        print(f"Accuracy: {np.mean(accs):.4f} +/- {np.std(accs):.4f}")
        print(f"F1 Score: {np.mean(f1s):.4f} +/- {np.std(f1s):.4f}")
        
        # Fit final model on all data
        final_clf = RandomForestClassifier(class_weight='balanced', random_state=42)
        search_final = RandomizedSearchCV(final_clf, param_dist, n_iter=5, cv=outer_cv, scoring='f1', random_state=42, n_jobs=-1)
        search_final.fit(X, y_class)
        return search_final.best_estimator_, np.mean(accs), np.mean(f1s)
        
    print("\nEvaluating V2 Baseline (Original Features)")
    _, v2_acc, v2_f1 = evaluate_classifier(v2_features, "V2 Baseline")
    
    print("\nEvaluating V3 (Multi-temporal + Indices)")
    v3_clf, v3_acc, v3_f1 = evaluate_classifier(v3_features, "V3 Expanded")
    
    # Save best model using persistence framework
    clf_path = os.path.join(proc_dir, 'model1_clf.joblib')
    evaluate_and_save_model('model1_clf', v3_clf, v3_f1, 'F1', clf_path, minimize=False)
    
    # --- UNFC Reserve Plausibility Check ---
    print("\n[UNFC Reserve Plausibility Check]")
    # Generate a uniform grid to estimate total predicted ore area
    grid_x = np.linspace(min_x, max_x, 100)
    grid_y = np.linspace(min_y, max_y, 100)
    xx, yy = np.meshgrid(grid_x, grid_y)
    grid_points = gpd.GeoDataFrame(geometry=gpd.points_from_xy(xx.flatten(), yy.flatten()), crs=litho.crs)
    grid_extracted = extract_features_at_points(all_rasters, grid_points)
    for k, v in grid_extracted.items():
        grid_points[k] = v
        
    grid_coords = np.array([(g.x, g.y) for g in grid_points.geometry])
    dists, idxs = tree.query(grid_coords, k=1)
    grid_points['mno_geochem_proxy'] = geochem_mno[idxs]
    
    grid_clean = grid_points.dropna(subset=v3_features)
    if not grid_clean.empty:
        preds = v3_clf.predict(grid_clean[v3_features]) # predict on features
        ore_fraction = np.mean(preds)
        
        # Calculate total area in m^2 (assuming raster crs is projected, or rough degree conversion)
        # Using bounding box area for rough proportion
        # Note: If CRS is EPSG:4326, 1 degree ~ 111km. We use a rough factor if degrees.
        # Dongri Buzurg area ~ 0.5 sq km = 500,000 m^2. For robustness, we assume 111,000 m per degree if unprojected.
        dx = (max_x - min_x) * (111000 if litho.crs and litho.crs.is_geographic else 1)
        dy = (max_y - min_y) * (111000 if litho.crs and litho.crs.is_geographic else 1)
        total_area_m2 = dx * dy
        
        predicted_area_m2 = total_area_m2 * ore_fraction
        
        # [TODO MOIL CONTACT: Confirm density and thickness]
        avg_ore_thickness_m = 10.0 # placeholder
        bulk_density_t_m3 = 2.5 # placeholder
        
        predicted_tonnage = predicted_area_m2 * avg_ore_thickness_m * bulk_density_t_m3
        unfc_reserves_t = 3.76 * 1e6 # 3.76 MT from MCDR
        
        reserve_plausibility_ratio = predicted_tonnage / unfc_reserves_t
        print(f"Predicted Area: {predicted_area_m2:.2f} m^2")
        print(f"Predicted Tonnage (approx): {predicted_tonnage / 1e6:.2f} MT")
        print(f"UNFC Ground Truth Reserves: 3.76 MT")
        print(f"Reserve Plausibility Ratio: {reserve_plausibility_ratio:.4f}")
        
        # Log to persistence log
        log_data = load_persistence_log()
        log_data['model1_unfc_check'] = {
            'predicted_tonnage': predicted_tonnage,
            'reserve_plausibility_ratio': reserve_plausibility_ratio
        }
        save_persistence_log(log_data)
    
    # Feature importances
    importances = pd.Series(v3_clf.feature_importances_, index=v3_features).sort_values(ascending=False)
    print("\nV3 Feature Importances:")
    print(importances.head(10))

    # Evaluate Regressor similarly...
    print("\nTraining V3 Regressor...")
    X_reg = train_points[v3_features]
    outer_cv_reg = KFold(n_splits=5, shuffle=True, random_state=42)
    inner_cv_reg = KFold(n_splits=3, shuffle=True, random_state=42)
    
    r2s = []
    for train_ix, test_ix in outer_cv_reg.split(X_reg):
        X_tr, X_te = X_reg.iloc[train_ix], X_reg.iloc[test_ix]
        y_tr, y_te = y_reg.iloc[train_ix], y_reg.iloc[test_ix]
        
        reg = RandomForestRegressor(random_state=42)
        param_dist = {'n_estimators': [50, 100], 'max_depth': [3, 5, 10, None]}
        search = RandomizedSearchCV(reg, param_dist, n_iter=5, cv=inner_cv_reg, scoring='r2', random_state=42, n_jobs=-1)
        search.fit(X_tr, y_tr)
        
        preds = search.best_estimator_.predict(X_te)
        r2s.append(r2_score(y_te, preds))
        
    print(f"V3 Regressor R2 (Nested CV): {np.mean(r2s):.4f}")
    
    # We use RMSE for regression evaluation to match the persistence policy minimization rule
    final_reg = RandomForestRegressor(random_state=42)
    search_final_reg = RandomizedSearchCV(final_reg, param_dist, n_iter=5, cv=outer_cv_reg, scoring='neg_root_mean_squared_error', random_state=42, n_jobs=-1)
    search_final_reg.fit(X_reg, y_reg)
    
    best_reg_rmse = -search_final_reg.best_score_
    print(f"V3 Regressor Best RMSE: {best_reg_rmse:.4f}")
    
    reg_path = os.path.join(proc_dir, 'model1_reg.joblib')
    evaluate_and_save_model('model1_reg', search_final_reg.best_estimator_, best_reg_rmse, 'RMSE', reg_path, minimize=True)

    print("\n[OK] Model 1 Prospectivity models trained and saved.")

if __name__ == '__main__':
    train_model1()
