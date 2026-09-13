import os
import json
import numpy as np
import pandas as pd
import geopandas as gpd
import rasterio
from rasterio.features import geometry_mask
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV, GroupKFold
from sklearn.metrics import accuracy_score, f1_score, r2_score, mean_squared_error
from scipy.spatial import cKDTree
import joblib
from model_persistence import evaluate_and_save_model

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

def get_raster_bounds(path):
    with rasterio.open(path) as src:
        t = src.transform
        left = t.c
        right = t.c + t.a * src.width
        top = t.f
        bottom = t.f + t.e * src.height
    return min(left, right), max(left, right), min(bottom, top), max(bottom, top)

def generate_random_points(min_x, max_x, min_y, max_y, n_points, crs):
    np.random.seed(42)
    bg_x = np.random.uniform(min_x, max_x, n_points)
    bg_y = np.random.uniform(min_y, max_y, n_points)
    return gpd.GeoDataFrame(geometry=gpd.points_from_xy(bg_x, bg_y), crs=crs)

def process_dongri_buzurg():
    print("--- Processing Dongri Buzurg ---")
    data_dir = 'data/satellite data and more'
    proc_dir = 'data/processed'
    
    # Rasters
    rasters = {
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
        'clay_index': os.path.join(proc_dir, 'aligned_clay_index.tif'),
        'ndvi_current': os.path.join(proc_dir, 'aligned_ndvi.tif'),
        'lst_current': os.path.join(proc_dir, 'aligned_lst.tif'),
        'slope': os.path.join(proc_dir, 'aligned_slope.tif'),
        'elevation': os.path.join(data_dir, 'dongri_buzurg_elevation.tif'),
        'soil_moisture_current': os.path.join(proc_dir, 'aligned_soil_moisture_proxy.tif')
    }
    
    min_x, max_x, min_y, max_y = get_raster_bounds(rasters['ndvi_current'])
    
    # Ground truth
    geopackage = os.path.join(data_dir, 'Dongri_Buzurg_Geoscience_Compiled.gpkg')
    litho = gpd.read_file(geopackage, layer='lithology_near_mine')
    key_ev = gpd.read_file(os.path.join(data_dir, 'Dongri_Buzurg_Key_Evidence.geojson'))
    key_ev['geometry'] = key_ev.geometry.centroid
    key_ev_clean = key_ev[['geometry', 'MnO_pct']].copy()
    key_ev_clean['is_gondite_mn_ore'] = 1
    
    bg_gdf = generate_random_points(min_x, max_x, min_y, max_y, 1000, litho.crs)
    bg_gdf['MnO_pct'] = 0.0 
    bg_gdf['is_gondite_mn_ore'] = 0
    
    train_points = pd.concat([key_ev_clean, bg_gdf], ignore_index=True)
    
    # Geochem
    soil_c = gpd.read_file(geopackage, layer='soil_c_horizon_near_mine')
    soil_r = gpd.read_file(geopackage, layer='soil_regolith_near_mine')
    stream = gpd.read_file(geopackage, layer='stream_sediments_near_mine')
    geochem = pd.concat([soil_c, soil_r, stream], ignore_index=True)
    geochem_coords = np.array([(g.x, g.y) for g in geochem.geometry])
    geochem_mno = geochem['mno'].values
    tree = cKDTree(geochem_coords)
    dists, idxs = tree.query([(g.x, g.y) for g in train_points.geometry], k=1)
    train_points['mno_geochem_proxy'] = geochem_mno[idxs]
    
    # Extract features
    extracted = extract_features_at_points(rasters, train_points)
    for k, v in extracted.items():
        train_points[k] = v
        
    train_points['is_gondite_mn_ore'] = train_points['is_gondite_mn_ore'].fillna(0).astype(int)
    train_points['MnO_pct'] = train_points['MnO_pct'].fillna(0.0)
    train_points['mno_geochem_proxy'] = train_points['mno_geochem_proxy'].fillna(0.0)
    train_points = train_points.dropna(subset=list(rasters.keys()))
    
    train_points['site_id'] = 'dongri_buzurg'
    train_points['sample_weight'] = 1.0
    
    print(f"Dongri Buzurg labeled points: {len(train_points)}")
    return train_points

def filter_tirodi_layer(gdf, bounds, crs):
    if gdf.empty:
        return gdf
    if gdf.crs != crs:
        gdf = gdf.to_crs(crs)
        
    # Exclude Sitapatore/Sukli
    if 'mine_name' in gdf.columns:
        gdf = gdf[~gdf['mine_name'].str.contains('Sukli|Sitapatore', case=False, na=False)]
    
    min_x, max_x, min_y, max_y = bounds
    # Add ~5km buffer. In degrees (approx) 5km is ~0.045
    buffer_deg = 0.045
    
    # Fast spatial filter
    filtered = gdf.cx[min_x - buffer_deg:max_x + buffer_deg, min_y - buffer_deg:max_y + buffer_deg]
    return filtered

def process_tirodi():
    print("\n--- Processing Tirodi ---")
    new_data_dir = 'data/new data'
    
    # Rasters
    rasters = {
        'ndvi_monsoon': os.path.join(new_data_dir, 'tirodi_ndvi_monsoon.tif'),
        'ndvi_dry': os.path.join(new_data_dir, 'tirodi_ndvi_dry.tif'),
        'lst_monsoon': os.path.join(new_data_dir, 'tirodi_lst_monsoon.tif'),
        'lst_summer': os.path.join(new_data_dir, 'tirodi_lst_summer.tif'),
        'soil_moisture_monsoon': os.path.join(new_data_dir, 'tirodi_soil_moisture_monsoon.tif'),
        'soil_moisture_dry': os.path.join(new_data_dir, 'tirodi_soil_moisture_dry.tif'),
        'iron_oxide_index': os.path.join(new_data_dir, 'tirodi_iron_oxide_index.tif'),
        'clay_index': os.path.join(new_data_dir, 'tirodi_clay_index.tif'),
        'ndvi_current': os.path.join(new_data_dir, 'tirodi_ndvi_annual_2025.tif'),
        'lst_current': os.path.join(new_data_dir, 'tirodi_lst_annual_2025.tif'),
        'slope': os.path.join(new_data_dir, 'tirodi_slope.tif'),
        'elevation': os.path.join(new_data_dir, 'tirodi_elevation.tif'),
        'soil_moisture_current': os.path.join(new_data_dir, 'tirodi_soil_moisture_annual_2025.tif')
    }
    
    min_x, max_x, min_y, max_y = get_raster_bounds(rasters['elevation'])
    bounds = (min_x, max_x, min_y, max_y)
    
    # Filter GPKG Layers
    geopackage = os.path.join(new_data_dir, 'Balaghat_Geoscience_Compiled.gpkg')
    
    import fiona
    layers = fiona.listlayers(geopackage)
    
    litho_raw = gpd.read_file(geopackage, layer='lithology_district')
    litho = filter_tirodi_layer(litho_raw, bounds, litho_raw.crs)
    print(f"[Audit] lithology_district: {len(litho_raw)} -> {len(litho)} retained")
    
    # Geochem
    geochem_gdfs = []
    for l in ['stream_sediments_district', 'soil_c_horizon_district', 'soil_regolith_district']:
        if l in layers:
            raw = gpd.read_file(geopackage, layer=l)
            flt = filter_tirodi_layer(raw, bounds, litho_raw.crs)
            geochem_gdfs.append(flt)
            print(f"[Audit] {l}: {len(raw)} -> {len(flt)} retained")
    geochem = pd.concat(geochem_gdfs, ignore_index=True)
    geochem_coords = np.array([(g.x, g.y) for g in geochem.geometry])
    geochem_mno = geochem['mno'].values
    tree_geochem = cKDTree(geochem_coords)
    
    # Metallogenic points
    metal_raw = gpd.read_file(geopackage, layer='metallogenic_points')
    metal = filter_tirodi_layer(metal_raw, bounds, litho_raw.crs)
    print(f"[Audit] metallogenic_points: {len(metal_raw)} -> {len(metal)} retained")
    
    # Geophysics & Structure
    mag_raw = gpd.read_file(geopackage, layer='magnetic_near_mines')
    mag = filter_tirodi_layer(mag_raw, bounds, litho_raw.crs)
    grav_raw = gpd.read_file(geopackage, layer='gravity_near_mines')
    grav = filter_tirodi_layer(grav_raw, bounds, litho_raw.crs)
    fault_raw = gpd.read_file(geopackage, layer='fault_district')
    fault = filter_tirodi_layer(fault_raw, bounds, litho_raw.crs)
    shear_raw = gpd.read_file(geopackage, layer='shear_zone_district')
    shear = filter_tirodi_layer(shear_raw, bounds, litho_raw.crs)
    
    print(f"[Audit] magnetic_near_mines: {len(mag_raw)} -> {len(mag)} retained")
    print(f"[Audit] gravity_near_mines: {len(grav_raw)} -> {len(grav)} retained")
    print(f"[Audit] fault_district: {len(fault_raw)} -> {len(fault)} retained")
    print(f"[Audit] shear_zone_district: {len(shear_raw)} -> {len(shear)} retained")
    
    # TIRODI Anchor point
    tirodi_point = metal[metal['locality'].str.upper() == 'TIRODI'].iloc[0] if len(metal) > 0 else None
    
    # Background + Key points
    bg_gdf = generate_random_points(min_x, max_x, min_y, max_y, 1000, litho.crs)
    
    # Spatial join to litho for gondite label
    bg_gdf = gpd.sjoin(bg_gdf, litho[['is_gondite_mn_ore', 'geometry']], how='left', predicate='intersects')
    bg_gdf['is_gondite_mn_ore'] = bg_gdf['is_gondite_mn_ore'].fillna(0).astype(int)
    
    # Anchor Point setup (Option A: single nearest cell)
    bg_gdf['MnO_pct'] = 0.0
    bg_gdf['sample_weight'] = 1.0
    
    if tirodi_point is not None:
        anchor_coords = (tirodi_point.geometry.x, tirodi_point.geometry.y)
        bg_coords = np.array([(g.x, g.y) for g in bg_gdf.geometry])
        tree_bg = cKDTree(bg_coords)
        _, closest_idx = tree_bg.query(anchor_coords, k=1)
        
        # Parse grade
        grade_str = tirodi_point['grade']
        grade_val = float(grade_str.replace('%Mn', '').replace('+', '').strip()) if isinstance(grade_str, str) else 48.0
        
        # Override the closest background point to be the anchor
        bg_gdf.loc[closest_idx, 'MnO_pct'] = grade_val
        bg_gdf.loc[closest_idx, 'is_gondite_mn_ore'] = 1
        bg_gdf.loc[closest_idx, 'sample_weight'] = 10.0
        
        # Shift the point exactly to the anchor coordinate for precise raster extraction
        bg_gdf.loc[closest_idx, 'geometry'] = tirodi_point.geometry
        print(f"\n[Anchor] TIRODI metallogenic point (+{grade_val}% Mn) anchored at nearest cell with 10x weight.")
    
    # Geochem proxy
    dists, idxs = tree_geochem.query([(g.x, g.y) for g in bg_gdf.geometry], k=1)
    bg_gdf['mno_geochem_proxy'] = geochem_mno[idxs]
    
    # Extracted rasters
    extracted = extract_features_at_points(rasters, bg_gdf)
    for k, v in extracted.items():
        bg_gdf[k] = v
        
    # Computed features
    bg_gdf['ndvi_seasonal_delta'] = bg_gdf['ndvi_monsoon'] - bg_gdf['ndvi_dry']
    bg_gdf['lst_seasonal_range'] = bg_gdf['lst_summer'] - bg_gdf['lst_monsoon']
    bg_gdf['soil_moisture_seasonal_delta'] = bg_gdf['soil_moisture_monsoon'] - bg_gdf['soil_moisture_dry']
    
    # Drop rows missing raster data
    features_list = list(rasters.keys()) + ['ndvi_seasonal_delta', 'lst_seasonal_range', 'soil_moisture_seasonal_delta']
    bg_gdf = bg_gdf.dropna(subset=features_list)
    bg_gdf['site_id'] = 'tirodi'
    
    print(f"Tirodi labeled points: {len(bg_gdf)}")
    
    # IDW Interpolation function for geophysics
    def idw_interpolate(target_gdf, source_gdf, value_col, k=5, p=2):
        tree = cKDTree([(g.x, g.y) for g in source_gdf.geometry])
        target_coords = [(g.x, g.y) for g in target_gdf.geometry]
        dists, idxs = tree.query(target_coords, k=k)
        dists = np.maximum(dists, 1e-9)
        weights = 1.0 / (dists ** p)
        weights /= weights.sum(axis=1)[:, np.newaxis]
        values = source_gdf[value_col].values[idxs]
        return np.sum(values * weights, axis=1)

    if not mag.empty:
        bg_gdf['magnetic_a'] = idw_interpolate(bg_gdf, mag, 'magnetic_a')
    else:
        bg_gdf['magnetic_a'] = 0.0
        
    if not grav.empty:
        bg_gdf['bouguer_an'] = idw_interpolate(bg_gdf, grav, 'bouguer_an')
    else:
        bg_gdf['bouguer_an'] = 0.0
        
    def distance_to_geom(target_gdf, geom_gdf):
        if geom_gdf.empty:
            return np.zeros(len(target_gdf))
        return target_gdf.geometry.apply(lambda x: geom_gdf.distance(x).min()).values

    bg_gdf['dist_to_fault'] = distance_to_geom(bg_gdf, fault)
    bg_gdf['dist_to_shear'] = distance_to_geom(bg_gdf, shear)
    
    return bg_gdf

def main():
    print("=== Model 1: Pooled Multi-Site Training ===")
    
    df_dongri = process_dongri_buzurg()
    
    # Calculate derived features for Dongri Buzurg to match Tirodi exactly
    df_dongri['ndvi_seasonal_delta'] = df_dongri['ndvi_monsoon'] - df_dongri['ndvi_dry']
    df_dongri['lst_seasonal_range'] = df_dongri['lst_summer'] - df_dongri['lst_monsoon']
    df_dongri['soil_moisture_seasonal_delta'] = df_dongri['soil_moisture_monsoon'] - df_dongri['soil_moisture_dry']
    
    df_tirodi = process_tirodi()
    
    core_features = [
        'ndvi_monsoon', 'ndvi_dry', 'ndvi_seasonal_delta', 'ndvi_current',
        'lst_monsoon', 'lst_summer', 'lst_seasonal_range', 'lst_current',
        'soil_moisture_monsoon', 'soil_moisture_dry', 'soil_moisture_seasonal_delta', 'soil_moisture_current',
        'iron_oxide_index', 'clay_index', 'slope', 'elevation', 'mno_geochem_proxy'
    ]
    
    # We add site_id as categorical / encoded feature
    pooled_df = pd.concat([df_dongri, df_tirodi], ignore_index=True)
    pooled_df['site_is_tirodi'] = (pooled_df['site_id'] == 'tirodi').astype(int)
    
    train_features = core_features + ['site_is_tirodi']
    
    # Filter NaNs just in case
    pooled_df = pooled_df.dropna(subset=train_features + ['MnO_pct', 'is_gondite_mn_ore'])
    
    X = pooled_df[train_features]
    y_reg = pooled_df['MnO_pct']
    groups = pooled_df['site_id']
    sample_weights = pooled_df['sample_weight']
    
    print("\n--- SENSITIVITY CHECK: Anchor Weighting ---")
    gkf = GroupKFold(n_splits=2)
    
    # We will train two simple models to observe metric shift
    reg_unweighted = RandomForestRegressor(random_state=42, n_estimators=50, max_depth=5)
    reg_weighted = RandomForestRegressor(random_state=42, n_estimators=50, max_depth=5)
    
    rmses_unweighted = []
    rmses_weighted = []
    
    # Because there are only 2 groups, 2-fold group k-fold evaluates each site once as a test set
    for train_idx, test_idx in gkf.split(X, y_reg, groups):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y_reg.iloc[train_idx], y_reg.iloc[test_idx]
        sw_train = sample_weights.iloc[train_idx]
        
        reg_unweighted.fit(X_train, y_train)
        rmses_unweighted.append(np.sqrt(mean_squared_error(y_test, reg_unweighted.predict(X_test))))
        
        reg_weighted.fit(X_train, y_train, sample_weight=sw_train)
        rmses_weighted.append(np.sqrt(mean_squared_error(y_test, reg_weighted.predict(X_test))))
        
    print(f"Grouped CV RMSE (Unweighted): {np.mean(rmses_unweighted):.4f}")
    print(f"Grouped CV RMSE (Weighted 10x): {np.mean(rmses_weighted):.4f}")
    diff = np.mean(rmses_weighted) - np.mean(rmses_unweighted)
    print(f"Shift in RMSE due to weighting: {diff:+.4f} (Small shifts indicate the model naturally supports the point; large shifts mean the point is overriding background noise)")
    
    print("\n--- FINAL POOLED TRAINING ---")
    print(f"Total Pooled Samples: {len(pooled_df)} (Dongri: {len(df_dongri)}, Tirodi: {len(df_tirodi)})")
    if len(df_tirodi) < 40:
        print(">> [CAVEAT] Tirodi sample count is low. Grouped CV metrics evaluating Tirodi as the held-out fold will swing heavily based on a small test set.")
    
    final_reg = RandomForestRegressor(random_state=42, n_estimators=100, max_depth=10)
    final_reg.fit(X, y_reg, sample_weight=sample_weights)
    
    importances = pd.Series(final_reg.feature_importances_, index=train_features).sort_values(ascending=False)
    print("\nPooled Model Feature Importances:")
    print(importances.head(10))
    print(f"-> 'site_is_tirodi' importance: {importances.get('site_is_tirodi', 0):.4f}")
    if importances.get('site_is_tirodi', 0) > 0.05:
        print("   (Model is leaning heavily on site differences, indicating systematic baseline shifts between mines)")
        
    print("\n--- TIRODI EXPLORATORY SUB-ANALYSIS (Geophysics & Structure) ---")
    # Identical CV splits for Tirodi only
    from sklearn.model_selection import KFold
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    df_tirodi['site_is_tirodi'] = 1
    
    X_tirodi_core = df_tirodi[train_features]
    X_tirodi_exploratory = df_tirodi[train_features + ['magnetic_a', 'bouguer_an', 'dist_to_fault', 'dist_to_shear']]
    y_tirodi = df_tirodi['MnO_pct']
    sw_tirodi = df_tirodi['sample_weight']
    
    rmses_core = []
    rmses_exp = []
    
    for train_idx, test_idx in kf.split(X_tirodi_core):
        # We use identical indices to ensure fair comparison
        Xr_train_core, Xr_test_core = X_tirodi_core.iloc[train_idx], X_tirodi_core.iloc[test_idx]
        Xr_train_exp, Xr_test_exp = X_tirodi_exploratory.iloc[train_idx], X_tirodi_exploratory.iloc[test_idx]
        yr_train, yr_test = y_tirodi.iloc[train_idx], y_tirodi.iloc[test_idx]
        swr_train = sw_tirodi.iloc[train_idx]
        
        reg_core = RandomForestRegressor(random_state=42, n_estimators=50)
        reg_core.fit(Xr_train_core, yr_train, sample_weight=swr_train)
        rmses_core.append(np.sqrt(mean_squared_error(yr_test, reg_core.predict(Xr_test_core))))
        
        reg_exp = RandomForestRegressor(random_state=42, n_estimators=50)
        reg_exp.fit(Xr_train_exp, yr_train, sample_weight=swr_train)
        rmses_exp.append(np.sqrt(mean_squared_error(yr_test, reg_exp.predict(Xr_test_exp))))
        
    print(f"Tirodi-Only (Core Features) 5-Fold RMSE: {np.mean(rmses_core):.4f}")
    print(f"Tirodi-Only (Core + Geophysics/Structure) 5-Fold RMSE: {np.mean(rmses_exp):.4f}")
    improvement = np.mean(rmses_core) - np.mean(rmses_exp)
    if improvement > 0:
        print(f"-> Geophysics/Structure IMPROVED prediction by {improvement:.4f} RMSE")
    else:
        print(f"-> Geophysics/Structure did NOT improve prediction (worse by {-improvement:.4f} RMSE)")
        
    # Save model via persistence policy
    reg_path = os.path.join('data/processed', 'model1_pooled_reg.joblib')
    evaluate_and_save_model('model1_reg', final_reg, np.mean(rmses_weighted), 'RMSE', reg_path, minimize=True)
    print("\n[OK] Script Complete")

if __name__ == "__main__":
    main()
