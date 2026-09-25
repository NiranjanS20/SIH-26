import os
import sys
import rasterio
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import box
import joblib

from sklearn.ensemble import RandomForestClassifier
from lightgbm import LGBMClassifier

# Define AOI for Beldongri (centered on 21.337, 79.289)
AOI_BOUNDS = (79.230, 21.280, 79.340, 21.390)

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
        'ndvi': 'beldongri_ndvi_annual.tif',
        'lst': 'beldongri_lst_annual.tif',
        'soil_moisture': 'beldongri_soil_moisture_annual.tif',
        'slope': 'beldongri_slope.tif',
        'elevation': 'beldongri_elevation.tif',
        's1_vv_early': 'beldongri_s1_early.tif',
        's1_vv_recent': 'beldongri_s1_recent.tif',
        'subsidence_proxy': 'beldongri_subsidence_proxy.tif'
    }
    
    features = {}
    transform = None
    shape = None
    
    for name, filename in paths.items():
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            print(f"Warning: Missing raster {filename}")
            continue
        try:
            data, t, crs = load_raster(filepath)
            features[name] = data
            if transform is None:
                transform = t
                shape = data.shape
        except Exception as e:
            print(f"Error loading {filename}: {e}")
            
    if not features:
        print("No features loaded!")
        sys.exit(1)
        
    return features, transform, shape

if __name__ == '__main__':
    data_dir = r"D:\Personal_Projects\SIH_26009\data\new data"
    features, transform, shape = extract_features(data_dir)
    print("Beldongri feature extraction stub complete. Ready for ML integration.")
