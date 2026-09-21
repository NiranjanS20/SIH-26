import os
import sys
import rasterio
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box
import joblib
from scipy.stats import pearsonr
import shap

from sklearn.ensemble import RandomForestClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.cluster import KMeans

# Define AOI for Balaghat Underground
AOI_BOUNDS = (80.198, 21.823, 80.256, 21.877)  # minx, miny, maxx, maxy
BUFFER_DEGREES = 5 / 111.0  # roughly 5km

def load_raster(path):
    with rasterio.open(path) as src:
        data = src.read(1)
        nodata = src.nodata
        if nodata is not None:
            data = np.where(data == nodata, np.nan, data)
        return data, src.transform, src.crs

def extract_features(data_dir):
    print("--- Loading Features ---")
    
    paths = {
        'ndvi': 'balaghat_ndvi_annual_context.tif',
        'lst': 'balaghat_lst_annual_context.tif',
        'soil_moisture': 'balaghat_soil_moisture_annual_context.tif',
        'slope': 'balaghat_slope.tif',
        'elevation': 'balaghat_elevation.tif',
        's1_vv_early': 'balaghat_s1_vv_early_2021_22.tif',
        's1_vv_recent': 'balaghat_s1_vv_recent_2024_25.tif',
        'subsidence_proxy': 'balaghat_subsidence_proxy_change.tif'
    }
    
    features = {}
    transform = None
    shape = None
    for name, filename in paths.items():
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Missing raster {filename}")
            continue
        data, t, _ = load_raster(filepath)
        features[name] = data
        if transform is None:
            transform = t
            shape = data.shape

    return features, transform, shape

def check_correlation(features):
    print("\n--- Checking s1_vv_change vs subsidence_proxy_change correlation ---")
    if 's1_vv_early' in features and 's1_vv_recent' in features and 'subsidence_proxy' in features:
        s1_vv_change = features['s1_vv_recent'] - features['s1_vv_early']
        features['s1_vv_change'] = s1_vv_change
        
        valid_mask = ~np.isnan(s1_vv_change) & ~np.isnan(features['subsidence_proxy'])
        
        if np.sum(valid_mask) > 10:
            v1 = s1_vv_change[valid_mask]
            v2 = features['subsidence_proxy'][valid_mask]
            corr, p = pearsonr(v1, v2)
            print(f"Correlation: {corr:.4f} (p-value: {p:.4e})")
            if abs(corr) > 0.3:
                print("-> Correlation is significant. Layers capture related surface phenomena.")
            else:
                print("-> Correlation is weak.")
        else:
            print("Not enough valid pixels.")
    else:
        print("Required layers not found.")

def extract_labels(data_dir):
    print("\n--- Auditing Labels within 5km Buffer ---")
    gpkg_path = os.path.join(data_dir, 'Balaghat_Geoscience_Compiled.gpkg')
    
    if not os.path.exists(gpkg_path):
        print("Geopackage not found.")
        return None
    
    minx, miny, maxx, maxy = AOI_BOUNDS
    buffered_box = box(minx - BUFFER_DEGREES, miny - BUFFER_DEGREES, 
                       maxx + BUFFER_DEGREES, maxy + BUFFER_DEGREES)
    
    labels = []
    try:
        import fiona
        layer_names = fiona.listlayers(gpkg_path)
        for layer in layer_names:
            try:
                gdf = gpd.read_file(gpkg_path, layer=layer)
                if gdf.crs and gdf.crs.to_epsg() != 4326:
                    gdf = gdf.to_crs(epsg=4326)
                intersecting = gdf[gdf.geometry.intersects(buffered_box)]
                if len(intersecting) > 0:
                    print(f"Found {len(intersecting)} items in layer '{layer}'.")
                    labels.append(intersecting)
            except Exception as e:
                pass
    except Exception as e:
        print(f"Error reading Geopackage: {e}")
        
    total_labels = sum(len(l) for l in labels) if labels else 0
    print(f"Total labeled points within buffer: {total_labels}")
    
    if total_labels < 20:
        print("Insufficient labels found. Proceeding with unsupervised fallback.")
        return None
    else:
        print("Sufficient labels found.")
        return pd.concat(labels, ignore_index=True)

def train_unsupervised(features_dict, models_dir):
    print("\n--- Unsupervised Fallback: K-Means Characterization ---")
    keys = ['ndvi', 'lst', 'soil_moisture', 'slope', 'elevation', 's1_vv_change', 'subsidence_proxy']
    available_keys = [k for k in keys if k in features_dict]
    
    stacked = []
    masks = []
    for k in available_keys:
        flat = features_dict[k].flatten()
        stacked.append(flat)
        masks.append(~np.isnan(flat))
        
    min_len = min(len(m) for m in masks)
    masks = [m[:min_len] for m in masks]
    stacked = [s[:min_len] for s in stacked]
        
    valid_mask = np.all(masks, axis=0)
    X = np.column_stack([s[valid_mask] for s in stacked])
    
    if len(X) < 100:
        print("Not enough valid pixels to perform clustering.")
        return
        
    print(f"Training K-Means on {len(X)} pixels with features: {available_keys}...")
    X_mean = X.mean(axis=0)
    X_std = X.std(axis=0)
    X_std[X_std == 0] = 1
    X_scaled = (X - X_mean) / X_std
    
    kmeans = KMeans(n_clusters=3, random_state=42)
    kmeans.fit(X_scaled)
    
    out_path = os.path.join(models_dir, 'model1_balaghat_ug.joblib')
    joblib.dump({
        'model': kmeans,
        'features': available_keys,
        'scaler_mean': X_mean,
        'scaler_std': X_std,
        'type': 'unsupervised'
    }, out_path)
    print(f"Clustering complete. Model saved as {out_path}")

def train_supervised(features_dict, transform, shape, labels_gdf, models_dir):
    print("\n--- Supervised Benchmarking ---")
    import rasterio.features
    from sklearn.ensemble import RandomForestClassifier
    from lightgbm import LGBMClassifier
    from catboost import CatBoostClassifier
    import shap
    
    # Rasterize labels to create y mask
    geom_value = ((geom, 1) for geom in labels_gdf.geometry)
    try:
        y_raster = rasterio.features.rasterize(
            geom_value, out_shape=shape, transform=transform,
            fill=0, all_touched=True, dtype=np.uint8
        )
    except Exception as e:
        print(f"Rasterization failed: {e}. Falling back to unsupervised.")
        train_unsupervised(features_dict, models_dir)
        return

    keys = ['ndvi', 'lst', 'soil_moisture', 'slope', 'elevation', 's1_vv_change', 'subsidence_proxy']
    available_keys = [k for k in keys if k in features_dict]
    
    stacked = []
    masks = []
    for k in available_keys:
        flat = features_dict[k].flatten()
        stacked.append(flat)
        masks.append(~np.isnan(flat))
        
    min_len = min(len(m) for m in masks)
    masks = [m[:min_len] for m in masks]
    stacked = [s[:min_len] for s in stacked]
        
    valid_mask = np.all(masks, axis=0)
    X = np.column_stack([s[valid_mask] for s in stacked])
    
    y_flat = y_raster.flatten()
    y_flat = y_flat[:min_len]
    y = y_flat[valid_mask]
    
    # Ensure there are some positive labels after masking
    if np.sum(y) == 0:
        print("No positive labels overlay valid pixels. Falling back to unsupervised.")
        train_unsupervised(features_dict, models_dir)
        return

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=50, random_state=42),
        'LightGBM': LGBMClassifier(random_state=42, verbose=-1),
        'CatBoost': CatBoostClassifier(iterations=50, random_state=42, verbose=0)
    }
    
    best_score = 0
    best_name = None
    best_model = None
    
    for name, model in models.items():
        try:
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            acc = accuracy_score(y_test, preds)
            print(f"{name} Accuracy: {acc:.4f}")
            if acc >= best_score:
                best_score = acc
                best_name = name
                best_model = model
        except Exception as e:
            print(f"{name} failed: {e}")
            
    if best_name is None:
        print("All models failed.")
        return

    print(f"\nWinning model: {best_name} with accuracy {best_score:.4f}")
    
    print("Generating SHAP values...")
    try:
        explainer = shap.TreeExplainer(best_model)
        # using a small sample for SHAP to avoid slowness
        sample_idx = np.random.choice(X_test.shape[0], min(500, X_test.shape[0]), replace=False)
        shap_values = explainer.shap_values(X_test[sample_idx])
        print("SHAP TreeExplainer run successful.")
    except Exception as e:
        print(f"SHAP error: {e}")
        
    if best_name == 'CatBoost':
        out_path = os.path.join(models_dir, 'model1_balaghat_ug.cbm')
        best_model.save_model(out_path)
    elif best_name == 'LightGBM':
        out_path = os.path.join(models_dir, 'model1_balaghat_ug.pkl')
        joblib.dump(best_model, out_path)
    else:
        out_path = os.path.join(models_dir, 'model1_balaghat_ug.joblib')
        joblib.dump(best_model, out_path)
        
    print(f"Model saved as {out_path}")

def main():
    # Setup paths relative to script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(script_dir, '..', 'data', 'new data'))
    models_dir = os.path.abspath(os.path.join(script_dir, '..', 'models'))
    os.makedirs(models_dir, exist_ok=True)
    
    features, transform, shape = extract_features(data_dir)
    check_correlation(features)
    labels = extract_labels(data_dir)
    
    if labels is None:
        train_unsupervised(features, models_dir)
    else:
        train_supervised(features, transform, shape, labels, models_dir)

if __name__ == '__main__':
    main()
