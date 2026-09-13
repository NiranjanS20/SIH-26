import re
import os

filepath = 'scripts/10_train_model1_pooled.py'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add filter_sitapatore_layer
filter_sitapatore = """
def filter_sitapatore_layer(gdf, bounds, crs):
    if gdf.empty:
        return gdf
    if gdf.crs != crs:
        gdf = gdf.to_crs(crs)
        
    # Exclude Tirodi/Dongri
    if 'mine_name' in gdf.columns:
        gdf = gdf[~gdf['mine_name'].str.contains('Tirodi|Dongri', case=False, na=False)]
    
    min_x, max_x, min_y, max_y = bounds
    # Add ~5km buffer. In degrees (approx) 5km is ~0.045
    buffer_deg = 0.045
    
    # Fast spatial filter
    filtered = gdf.cx[min_x - buffer_deg:max_x + buffer_deg, min_y - buffer_deg:max_y + buffer_deg]
    return filtered
"""

content = content.replace("def process_tirodi():", filter_sitapatore + "\ndef process_tirodi():")

# 2. Add process_sitapatore()
process_sitapatore = """
def process_sitapatore():
    print("\\n--- Processing Sitapatore ---")
    new_data_dir = 'data/new data'
    
    # Rasters
    rasters = {
        'ndvi_monsoon': os.path.join(new_data_dir, 'sitapatore_ndvi_monsoon.tif'),
        'ndvi_dry': os.path.join(new_data_dir, 'sitapatore_ndvi_dry.tif'),
        'lst_monsoon': os.path.join(new_data_dir, 'sitapatore_lst_monsoon.tif'),
        'lst_summer': os.path.join(new_data_dir, 'sitapatore_lst_summer.tif'),
        'soil_moisture_monsoon': os.path.join(new_data_dir, 'sitapatore_soil_moisture_monsoon.tif'),
        'soil_moisture_dry': os.path.join(new_data_dir, 'sitapatore_soil_moisture_dry.tif'),
        'iron_oxide_index': os.path.join(new_data_dir, 'sitapatore_iron_oxide_index.tif'),
        'clay_index': os.path.join(new_data_dir, 'sitapatore_clay_index.tif'),
        'ndvi_current': os.path.join(new_data_dir, 'sitapatore_ndvi_annual_2025.tif'),
        'lst_current': os.path.join(new_data_dir, 'sitapatore_lst_annual_2025.tif'),
        'slope': os.path.join(new_data_dir, 'sitapatore_slope.tif'),
        'elevation': os.path.join(new_data_dir, 'sitapatore_elevation.tif'),
        'soil_moisture_current': os.path.join(new_data_dir, 'sitapatore_soil_moisture_annual_2025.tif')
    }
    
    min_x, max_x, min_y, max_y = get_raster_bounds(rasters['elevation'])
    bounds = (min_x, max_x, min_y, max_y)
    
    # Filter GPKG Layers
    geopackage = os.path.join(new_data_dir, 'Balaghat_Geoscience_Compiled.gpkg')
    
    import fiona
    layers = fiona.listlayers(geopackage)
    
    import geopandas as gpd
    import pandas as pd
    import numpy as np
    from scipy.spatial import cKDTree
    
    litho_raw = gpd.read_file(geopackage, layer='lithology_district')
    litho = filter_sitapatore_layer(litho_raw, bounds, litho_raw.crs)
    print(f"[Audit] lithology_district: {len(litho_raw)} -> {len(litho)} retained")
    
    # Geochem
    geochem_gdfs = []
    for l in ['stream_sediments_district', 'soil_c_horizon_district', 'soil_regolith_district']:
        if l in layers:
            raw = gpd.read_file(geopackage, layer=l)
            flt = filter_sitapatore_layer(raw, bounds, litho_raw.crs)
            geochem_gdfs.append(flt)
            print(f"[Audit] {l}: {len(raw)} -> {len(flt)} retained")
    geochem = pd.concat(geochem_gdfs, ignore_index=True)
    geochem_coords = np.array([(g.x, g.y) for g in geochem.geometry])
    geochem_mno = geochem['mno'].values
    tree_geochem = cKDTree(geochem_coords) if len(geochem) > 0 else None
    print(f"[Audit] Total geochemistry points for Sitapatore: {len(geochem)}")
    
    # Geophysics & Structure
    mag_raw = gpd.read_file(geopackage, layer='magnetic_near_mines')
    mag = filter_sitapatore_layer(mag_raw, bounds, litho_raw.crs)
    grav_raw = gpd.read_file(geopackage, layer='gravity_near_mines')
    grav = filter_sitapatore_layer(grav_raw, bounds, litho_raw.crs)
    fault_raw = gpd.read_file(geopackage, layer='fault_district')
    fault = filter_sitapatore_layer(fault_raw, bounds, litho_raw.crs)
    shear_raw = gpd.read_file(geopackage, layer='shear_zone_district')
    shear = filter_sitapatore_layer(shear_raw, bounds, litho_raw.crs)
    
    # Background + Key points
    bg_gdf = generate_random_points(min_x, max_x, min_y, max_y, 1000, litho.crs)
    
    # Spatial join to litho for gondite label
    bg_gdf = gpd.sjoin(bg_gdf, litho[['is_gondite_mn_ore', 'geometry']], how='left', predicate='intersects')
    bg_gdf['is_gondite_mn_ore'] = bg_gdf['is_gondite_mn_ore'].fillna(0).astype(int)
    
    bg_gdf['MnO_pct'] = 0.0
    bg_gdf['sample_weight'] = 1.0
    
    # Geochem proxy
    if tree_geochem is not None:
        dists, idxs = tree_geochem.query([(g.x, g.y) for g in bg_gdf.geometry], k=1)
        bg_gdf['mno_geochem_proxy'] = geochem_mno[idxs]
    else:
        bg_gdf['mno_geochem_proxy'] = 0.0
    
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
    bg_gdf['site_id'] = 'sitapatore'
    
    print(f"Sitapatore labeled points: {len(bg_gdf)}")
    
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
"""

content = content.replace("def main():", process_sitapatore + "\ndef main():")

# 3. Modify main()
content = content.replace("df_dongri = process_dongri_buzurg()", "df_dongri = process_dongri_buzurg()\n    df_sitapatore = process_sitapatore()")
content = content.replace("pooled_df = pd.concat([df_dongri, df_tirodi], ignore_index=True)", "pooled_df = pd.concat([df_dongri, df_tirodi, df_sitapatore], ignore_index=True)")

with open(filepath, 'w') as f:
    f.write(content)

print("Patch applied.")
