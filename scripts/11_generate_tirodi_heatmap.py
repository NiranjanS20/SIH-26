import os
import pandas as pd
import geopandas as gpd
import rasterio
import matplotlib.pyplot as plt

def generate_tirodi_heatmap():
    print("--- Generating Tirodi Heatmap ---")
    data_dir = 'data/new data'
    output_path = 'frontend/public/tirodi_heatmap.png'
    
    geopackage = os.path.join(data_dir, 'Balaghat_Geoscience_Compiled.gpkg')
    
    # Read metallogenic points
    metal_raw = gpd.read_file(geopackage, layer='metallogenic_points')
    
    # Use Tirodi NDVI as the base for the "heatmap" simulation
    ndvi_path = os.path.join(data_dir, 'tirodi_ndvi_annual_2025.tif')
    
    with rasterio.open(ndvi_path) as src:
        t = src.transform
        left = t.c
        right = t.c + t.a * src.width
        top = t.f
        bottom = t.f + t.e * src.height
        extent = [left, right, min(bottom, top), max(bottom, top)]
        
        # We only want to plot points within this extent
        bounds = (min(left, right), max(left, right), min(bottom, top), max(bottom, top))
        
        # Read the data and simulate a prospectivity heatmap
        ndvi_data = src.read(1)
        # Assuming higher NDVI in some areas might correlate, let's just plot it with a hot colormap
        
    plt.figure(figsize=(10, 8))
    # We use a magma colormap to simulate prospectivity heat
    plt.imshow(ndvi_data, extent=extent, cmap='magma', alpha=0.7)
    
    # Filter points within bounds
    metal_filtered = metal_raw.cx[bounds[0]:bounds[1], bounds[2]:bounds[3]]
    
    # Plot metallogenic points
    if not metal_filtered.empty:
        metal_filtered.plot(ax=plt.gca(), color='cyan', markersize=40, label='Metallogenic Occurrences', marker='*')
        plt.legend()
        
    plt.title("Tirodi Prospectivity Heatmap Simulation")
    plt.axis('off') # Remove axes for cleaner UI integration
    plt.tight_layout()
    plt.savefig(output_path, transparent=True, bbox_inches='tight', pad_inches=0)
    plt.close()
    
    print(f"[OK] Heatmap generated at {output_path}")

if __name__ == '__main__':
    generate_tirodi_heatmap()
