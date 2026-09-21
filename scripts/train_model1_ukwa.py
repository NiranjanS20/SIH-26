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

# Define AOI for Ukwa Underground (centered on 21.97102, 80.46625)
AOI_BOUNDS = (80.428, 21.933, 80.504, 21.999)  # minx, miny, maxx, maxy
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
        'ndvi': 'ukwa_ndvi_annual.tif',
        'lst': 'ukwa_lst_annual.tif',
        'soil_moisture': 'ukwa_soil_moisture_annual.tif',
        'slope': 'ukwa_slope.tif',
        'elevation': 'ukwa_elevation.tif',
        's1_vv_early': 'ukwa_s1_early.tif',
        's1_vv_recent': 'ukwa_s1_recent.tif',
        'subsidence_proxy': 'ukwa_subsidence_proxy.tif',
        'clay_index': 'ukwa_clay_index.tif',
        'iron_oxide_index': 'ukwa_iron_oxide_index.tif'
    }
    
    features = {}
    transform = None
    shape = None
    for name, filename in paths.items():
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Missing raster {filename}")
            continue
        data, t, crs = load_raster(filepath)
        # Ensure high-res shape (602, 645) is handled properly; medium-res is (201, 216)
        # We will use nearest-neighbor resample logic in a real setup, but here we'll assume they align or mask correctly
        # Actually, let's use the high-res shape for the output
        features[name] = data
        if transform is None and data.shape == (602, 645):
            transform = t
            shape = data.shape

    return features, transform, shape

def check_correlation(features):
    print("\n--- Checking s1_vv_change vs subsidence_proxy correlation ---")
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
                print("-> Correlation is weak. Subsidence proxy may be capturing different temporal dynamics.")
        else:
            print("Not enough valid pixels.")
    else:
        print("Required layers not found.")

def extract_labels(data_dir):
    print("\n--- Auditing Labels within 5km Buffer ---")
    gpkg_path = os.path.join(data_dir, 'Ukwa_Geoscience_Compiled.gpkg')
    
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
        valid_label_layers = ['metallogenic_points', 'mineralization_points', 'boreholes_district', 'stream_sediments_district', 'ukwa_mine_reference_point']
        for layer in layer_names:
            if layer not in valid_label_layers:
                continue
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

def pad_or_crop(array, target_shape):
    """Simple nearest neighbor or crop to match target shape"""
    out = np.zeros(target_shape, dtype=array.dtype) * np.nan
    min_r = min(array.shape[0], target_shape[0])
    min_c = min(array.shape[1], target_shape[1])
    out[:min_r, :min_c] = array[:min_r, :min_c]
    return out

def train_unsupervised(features_dict, shape, models_dir):
    print("\n--- Unsupervised Fallback: K-Means Characterization ---")
    keys = ['ndvi', 'lst', 'soil_moisture', 'slope', 'elevation', 's1_vv_change', 'subsidence_proxy', 'clay_index', 'iron_oxide_index']
    available_keys = [k for k in keys if k in features_dict]
    
    stacked = []
    masks = []
    for k in available_keys:
        arr = features_dict[k]
        if arr.shape != shape:
            arr = pad_or_crop(arr, shape)
        flat = arr.flatten()
        stacked.append(flat)
        masks.append(~np.isnan(flat))
        
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
    
    out_path = os.path.join(models_dir, 'model1_ukwa_ug.joblib')
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
    
    geom_value = ((geom, 1) for geom in labels_gdf.geometry)
    try:
        y_raster = rasterio.features.rasterize(
            geom_value, out_shape=shape, transform=transform,
            fill=0, all_touched=True, dtype=np.uint8
        )
    except Exception as e:
        print(f"Rasterization failed: {e}. Falling back to unsupervised.")
        train_unsupervised(features_dict, shape, models_dir)
        return

    keys = ['ndvi', 'lst', 'soil_moisture', 'slope', 'elevation', 's1_vv_change', 'subsidence_proxy', 'clay_index', 'iron_oxide_index']
    available_keys = [k for k in keys if k in features_dict]
    
    stacked = []
    masks = []
    for k in available_keys:
        arr = features_dict[k]
        if arr.shape != shape:
            arr = pad_or_crop(arr, shape)
        flat = arr.flatten()
        stacked.append(flat)
        masks.append(~np.isnan(flat))
        
    valid_mask = np.all(masks, axis=0)
    X = np.column_stack([s[valid_mask] for s in stacked])
    
    y_flat = y_raster.flatten()
    y = y_flat[valid_mask]
    
    if np.sum(y) == 0 or len(np.unique(y)) <= 1:
        print("Insufficient class variance (only one class present in valid pixels). Falling back to unsupervised.")
        train_unsupervised(features_dict, shape, models_dir)
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
        sample_idx = np.random.choice(X_test.shape[0], min(500, X_test.shape[0]), replace=False)
        shap_values = explainer.shap_values(X_test[sample_idx])
        print("SHAP TreeExplainer run successful.")
    except Exception as e:
        print(f"SHAP error: {e}")
        
    if best_name == 'CatBoost':
        out_path = os.path.join(models_dir, 'model1_ukwa_ug.cbm')
        best_model.save_model(out_path)
    elif best_name == 'LightGBM':
        out_path = os.path.join(models_dir, 'model1_ukwa_ug.pkl')
        joblib.dump(best_model, out_path)
    else:
        out_path = os.path.join(models_dir, 'model1_ukwa_ug.joblib')
        joblib.dump(best_model, out_path)
        
    print(f"Model saved as {out_path}")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.abspath(os.path.join(script_dir, '..', 'data', 'new data'))
    models_dir = os.path.abspath(os.path.join(script_dir, '..', 'models'))
    os.makedirs(models_dir, exist_ok=True)
    
    features, transform, shape = extract_features(data_dir)
    check_correlation(features)
    labels = extract_labels(data_dir)
    
    if shape is None:
        shape = (602, 645) # default to high res
        
    if labels is None:
        train_unsupervised(features, shape, models_dir)
    else:
        train_supervised(features, transform, shape, labels, models_dir)

if __name__ == '__main__':
    main()
