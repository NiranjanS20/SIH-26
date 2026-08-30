import os
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import Affine
from rasterio.warp import calculate_default_transform, reproject
import numpy as np

def align_rasters():
    print("--- Phase 2: Multi-tier Raster Alignment ---")
    data_dir = 'data/satellite data and more'
    new_data_dir = 'data/new data'
    out_dir = 'data/processed'
    os.makedirs(out_dir, exist_ok=True)
    
    # Tier B Baseline reference (30m)
    ref_path = os.path.join(data_dir, 'dongri_buzurg_elevation.tif')
    
    with rasterio.open(ref_path) as ref_src:
        ref_meta = ref_src.meta.copy()
        ref_crs = ref_src.crs
        ref_transform = ref_src.transform
        ref_width = ref_src.width
        ref_height = ref_src.height
        print(f"Reference Grid (Tier B): 30m, {ref_width}x{ref_height}, {ref_crs}")

        def process_and_save(src_path, out_name, resampling_method=Resampling.nearest, mask_nan=False):
            with rasterio.open(src_path) as src:
                # Use src.read(out_shape=...) which natively handles resampling
                data = src.read(
                    out_shape=(src.count, ref_height, ref_width),
                    resampling=resampling_method
                )
                
                # If Tier A has NaNs (like NDVI), apply to the 30m cell
                if mask_nan:
                    nodata_val = ref_meta.get('nodata')
                    if nodata_val is None:
                        nodata_val = -9999.0
                        ref_meta['nodata'] = nodata_val
                    data = np.where(np.isnan(data), nodata_val, data).astype(ref_meta['dtype'])
                
                out_path = os.path.join(out_dir, out_name)
                with rasterio.open(out_path, 'w', **ref_meta) as dst:
                    dst.write(data)
                print(f"Processed: {out_name} (Resampling: {resampling_method.name})")
                return data[0], out_path

        # Process Tier B (Direct Alignment)
        process_and_save(os.path.join(data_dir, 'dongri_buzurg_lst.tif'), 'aligned_lst.tif')
        process_and_save(os.path.join(data_dir, 'dongri_buzurg_slope.tif'), 'aligned_slope.tif')
        process_and_save(os.path.join(data_dir, 'dongri_buzurg_soil_moisture_proxy.tif'), 'aligned_soil_moisture_proxy.tif')

        # Tier B Seasonal
        lst_monsoon, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_lst_monsoon.tif'), 'aligned_lst_monsoon.tif')
        lst_summer, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_lst_summer.tif'), 'aligned_lst_summer.tif')
        
        sm_monsoon, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_soil_moisture_monsoon.tif'), 'aligned_soil_moisture_monsoon.tif')
        sm_dry, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_soil_moisture_dry.tif'), 'aligned_soil_moisture_dry.tif')
        
        # Calculate Seasonal Deltas (Tier B)
        lst_range = lst_summer - lst_monsoon
        sm_delta = sm_monsoon - sm_dry
        
        with rasterio.open(os.path.join(out_dir, 'aligned_lst_seasonal_range.tif'), 'w', **ref_meta) as dst: dst.write(lst_range, 1)
        with rasterio.open(os.path.join(out_dir, 'aligned_soil_moisture_seasonal_delta.tif'), 'w', **ref_meta) as dst: dst.write(sm_delta, 1)

        # Process Tier A (Downsample using Average)
        process_and_save(os.path.join(data_dir, 'dongri_buzurg_ndvi.tif'), 'aligned_ndvi.tif', Resampling.average, True)
        process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_iron_oxide_index.tif'), 'aligned_iron_oxide_index.tif', Resampling.average)
        process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_clay_index.tif'), 'aligned_clay_index.tif', Resampling.average)
        
        ndvi_monsoon, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_ndvi_monsoon.tif'), 'aligned_ndvi_monsoon.tif', Resampling.average, True)
        ndvi_dry, _ = process_and_save(os.path.join(new_data_dir, 'dongri_buzurg_ndvi_dry.tif'), 'aligned_ndvi_dry.tif', Resampling.average, True)
        
        # Calculate NDVI delta
        ndvi_delta = ndvi_monsoon - ndvi_dry
        with rasterio.open(os.path.join(out_dir, 'aligned_ndvi_seasonal_delta.tif'), 'w', **ref_meta) as dst: dst.write(ndvi_delta, 1)

    # Tier C - Rainfall mean
    with rasterio.open(os.path.join(new_data_dir, 'dongri_buzurg_rainfall_mean.tif')) as src:
        rain_val = src.read(1)
        mean_rain = np.nanmean(rain_val)
        print(f"Tier C Rainfall Mean: {mean_rain:.2f} mm/day")
        # Save as a simple text file for Model 2 calibration
        with open(os.path.join(out_dir, 'rainfall_scalar.txt'), 'w') as f:
            f.write(str(mean_rain))

    print("\n[OK] All multi-tier alignments completed successfully.")

if __name__ == '__main__':
    align_rasters()
