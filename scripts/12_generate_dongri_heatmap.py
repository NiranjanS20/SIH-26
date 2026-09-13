import os
import geopandas as gpd
import rasterio
import matplotlib.pyplot as plt

def generate_dongri_heatmap():
    print("--- Generating Dongri Buzurg Heatmap ---")
    data_dir = 'data/satellite data and more'
    output_path = 'frontend/public/dongri_heatmap.png'
    
    # Read key evidence points
    key_ev_path = os.path.join(data_dir, 'Dongri_Buzurg_Key_Evidence.geojson')
    metal_raw = gpd.read_file(key_ev_path)
    # The key evidence polygons/points can be plotted as centroids
    metal_raw['geometry'] = metal_raw.geometry.centroid
    
    # Use Dongri NDVI as the base for the "heatmap" simulation
    ndvi_path = os.path.join(data_dir, 'dongri_buzurg_ndvi.tif')
    
    with rasterio.open(ndvi_path) as src:
        t = src.transform
        left = t.c
        right = t.c + t.a * src.width
        top = t.f
        bottom = t.f + t.e * src.height
        extent = [left, right, min(bottom, top), max(bottom, top)]
        
        # We only want to plot points within this extent
        bounds = (min(left, right), max(left, right), min(bottom, top), max(bottom, top))
        
        ndvi_data = src.read(1)
        
    plt.figure(figsize=(10, 8))
    # We use a magma colormap to simulate prospectivity heat, same as Tirodi
    plt.imshow(ndvi_data, extent=extent, cmap='magma', alpha=0.8)
    
    # Filter points within bounds
    metal_filtered = metal_raw.cx[bounds[0]:bounds[1], bounds[2]:bounds[3]]
    
    # Plot metallogenic points
    if not metal_filtered.empty:
        metal_filtered.plot(ax=plt.gca(), color='cyan', markersize=60, label='Key Evidence / Mineralization', marker='*')
        
    plt.axis('off') # Remove axes for cleaner UI integration
    plt.tight_layout()
    plt.savefig(output_path, transparent=True, bbox_inches='tight', pad_inches=0)
    plt.close()
    
    print(f"[OK] Heatmap generated at {output_path}")

if __name__ == '__main__':
    generate_dongri_heatmap()
