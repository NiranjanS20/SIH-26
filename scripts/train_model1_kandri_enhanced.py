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

# Define AOI for Kandri (centered on 21.417, 79.270)
AOI_BOUNDS = (79.220, 21.360, 79.320, 21.470)

# Geotechnical feature stack (From Enhanced Implementation Plan)
geotechnical_features = {
    'rock_mass_rating': 45,  # From Table 1
    'hangwall_strength_range': (50.4, 80.2),  # MPa
    'footwall_rmr': 42.5,  # Mid-range
    'ore_body_strength_range': (62.74, 123.35),  # High variability!
    'hanging_contact_critical_depth': -450,  # Below this, weak contact stress increases
    'subsidence_risk': 0.0 # From MOIL 2021 report (no subsidence observed due to sand stowing)
}

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
        'ndvi': 'kandri_ndvi_annual.tif',
        'lst': 'kandri_lst_annual.tif',
        'soil_moisture': 'kandri_soil_moisture_annual.tif',
        'slope': 'kandri_slope.tif',
        'elevation': 'kandri_elevation.tif',
        's1_vv_early': 'kandri_s1_early.tif',
        's1_vv_recent': 'kandri_s1_recent.tif',
        'subsidence_proxy': 'kandri_subsidence_proxy.tif'
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
    print("Kandri Model 1 (Prospectivity & Geotech) feature extraction stub complete. Ready for ML integration.")
