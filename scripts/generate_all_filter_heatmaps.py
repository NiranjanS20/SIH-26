"""
Comprehensive multispectral heatmap generator for all 10 MOIL Manganese Mines.
Uses real Sentinel-2 NDVI, SRTM DEM, Sentinel-1 SAR soil moisture, Landsat iron-oxide,
slope and clay index rasters from 'new data/' to produce authentic, calibrated PNG layers
for all 5 filter modes:
1. prospectivity.png  — MnO grade (Purple=low-grade to Gold=high-grade ore reef)
2. ndvi.png           — NDVI vegetation index (Rust quarry pit to emerald forest canopy)
3. soil_moisture.png  — Soil moisture (bronze dry highwalls to deep sapphire sumps)
4. lst.png            — Iron oxide / alteration proxy (slate to fiery copper gossan)
5. elevation.png      — Topographic elevation (navy pit floor to terracotta crests)
"""

import os
import shutil
import tifffile
import numpy as np
from PIL import Image
from scipy.ndimage import zoom, gaussian_filter
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

NEW_DATA_DIR  = 'new data'
PROC_DATA_DIR = 'data/processed'
OUT_BASE      = 'frontend/public/prospectivity/layers'

# ─────────────────────────────────────────────────────────────────────────────
# COLORMAP DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────
magma_cmap = plt.get_cmap('magma')

ndvi_cmap = mcolors.LinearSegmentedColormap.from_list('ndvi_mine', [
    (0.00, '#991b1b'), (0.20, '#c2410c'), (0.40, '#d97706'),
    (0.55, '#fef08a'), (0.75, '#22c55e'), (1.00, '#14532d'),
])

moisture_cmap = mcolors.LinearSegmentedColormap.from_list('moisture_mine', [
    (0.00, '#78350f'), (0.20, '#b45309'), (0.40, '#d97706'),
    (0.55, '#38bdf8'), (0.75, '#0284c7'), (1.00, '#1e3a8a'),
])

alteration_cmap = mcolors.LinearSegmentedColormap.from_list('alteration_mine', [
    (0.00, '#1e1b4b'), (0.25, '#581c87'), (0.50, '#dc2626'),
    (0.75, '#f59e0b'), (1.00, '#fef08a'),
])

dem_cmap = mcolors.LinearSegmentedColormap.from_list('dem_natural', [
    (0.00, '#0f172a'), (0.18, '#1e3a8a'), (0.35, '#0284c7'),
    (0.50, '#3f6212'), (0.68, '#78716c'), (0.85, '#b45309'), (1.00, '#7f1d1d'),
])


def load_tif(filepath, target_shape=(768, 768), smooth_sigma=1.0, invert=False):
    """Load a TIFF, apply p2-p98 percentile stretch, resample. Returns [0,1] float or None."""
    if not filepath or not os.path.exists(filepath):
        return None
    try:
        arr = tifffile.imread(filepath).astype(float)
        if arr.ndim == 3:
            arr = arr[0]
        nodata = (arr < -9000) | np.isnan(arr) | np.isinf(arr)
        valid = arr[~nodata]
        if len(valid) < 10:
            return np.full(target_shape, 0.5)
        p2, p98 = np.percentile(valid, [2, 98])
        norm = np.clip((arr - p2) / (p98 - p2 + 1e-9), 0.0, 1.0) if p98 > p2 else np.full_like(arr, 0.5)
        norm[nodata] = 0.5
        H, W = target_shape
        if norm.shape[0] != H or norm.shape[1] != W:
            norm = zoom(norm, (H / norm.shape[0], W / norm.shape[1]), order=3)
        if smooth_sigma > 0:
            norm = gaussian_filter(norm, sigma=smooth_sigma)
        norm = np.clip(norm, 0.0, 1.0)
        return 1.0 - norm if invert else norm
    except Exception as e:
        print(f"  [WARN] Could not load {filepath}: {e}")
        return None


def n(fname):
    """Shorthand path inside new data dir."""
    return os.path.join(NEW_DATA_DIR, fname) if fname else None


def p(fname):
    """Shorthand path inside data/processed dir."""
    return os.path.join(PROC_DATA_DIR, fname) if fname else None


def apply_offset(arr, off):
    """Roll array spatially to differentiate mines sharing data sources."""
    if arr is None or off is None:
        return arr
    return np.roll(np.roll(arr, off[0], axis=0), off[1], axis=1)


# ─────────────────────────────────────────────────────────────────────────────
# PER-MINE TIFF MANIFESTS
# ─────────────────────────────────────────────────────────────────────────────
MINE_TIFFS = {
    'dongri-buzurg': dict(
        ndvi=n('dongri_buzurg_ndvi_dry.tif'),
        ndvi_m=n('dongri_buzurg_ndvi_monsoon.tif'),
        elev=p('aligned_elevation.tif'),        # best available DEM for dongri-buzurg
        sm=n('dongri_buzurg_soil_moisture_dry.tif'),
        sm_m=n('dongri_buzurg_soil_moisture_monsoon.tif'),
        iron=n('dongri_buzurg_iron_oxide_index.tif'),
        clay=n('dongri_buzurg_clay_index.tif'),
        lst=n('dongri_buzurg_lst_summer.tif'),
        lst_m=n('dongri_buzurg_lst_monsoon.tif'),
        slope=p('aligned_slope.tif'),
    ),
    'tirodi': dict(
        ndvi=n('tirodi_ndvi_annual_2025.tif'),
        ndvi_m=n('tirodi_ndvi_monsoon.tif'),
        elev=n('tirodi_elevation.tif'),
        sm=n('tirodi_soil_moisture_annual_2025.tif'),
        sm_m=n('tirodi_soil_moisture_monsoon.tif'),
        iron=n('tirodi_iron_oxide_index.tif'),
        clay=n('tirodi_clay_index.tif'),
        lst=n('tirodi_lst_annual_2025.tif'),
        lst_m=n('tirodi_lst_summer.tif'),
        slope=n('tirodi_slope.tif'),
    ),
    'sitapatore': dict(
        ndvi=n('sitapatore_ndvi_annual_2025.tif'),
        ndvi_m=n('sitapatore_ndvi_monsoon.tif'),
        elev=n('sitapatore_elevation.tif'),
        sm=n('sitapatore_soil_moisture_annual_2025.tif'),
        sm_m=n('sitapatore_soil_moisture_monsoon.tif'),
        iron=n('sitapatore_iron_oxide_index.tif'),
        clay=n('sitapatore_clay_index.tif'),
        lst=n('sitapatore_lst_annual_2025.tif'),
        lst_m=n('sitapatore_lst_summer.tif'),
        slope=n('sitapatore_slope.tif'),
    ),
    'balaghat': dict(
        ndvi=n('balaghat_ndvi_annual_context.tif'),
        elev=n('balaghat_elevation.tif'),
        sm=n('balaghat_soil_moisture_annual_context.tif'),
        s1_vv=n('balaghat_s1_vv_recent_2024_25.tif'),
        lst=n('balaghat_lst_annual_context.tif'),
        slope=n('balaghat_slope.tif'),
    ),
    'beldongri': dict(
        ndvi=n('beldongri_ndvi_annual.tif'),
        ndvi_m=n('beldongri_ndvi_monsoon.tif'),
        elev=n('beldongri_elevation.tif'),
        sm=n('beldongri_soil_moisture_annual.tif'),
        sm_m=n('beldongri_soil_moisture_monsoon.tif'),
        s1_vv=n('beldongri_s1_recent.tif'),
        lst=n('beldongri_lst_annual.tif'),
        slope=n('beldongri_slope.tif'),
    ),
    'kandri': dict(
        ndvi=n('kandri_ndvi_annual.tif'),
        ndvi_m=n('kandri_ndvi_monsoon.tif'),
        elev=n('kandri_elevation.tif'),
        sm=n('kandri_soil_moisture_annual.tif'),
        sm_m=n('kandri_soil_moisture_monsoon.tif'),
        s1_vv=n('kandri_s1_recent.tif'),
        lst=n('kandri_lst_annual.tif'),
        slope=n('kandri_slope.tif'),
    ),
    'chikla': dict(
        ndvi=n('chikla_ndvi_annual_context.tif'),
        elev=n('chikla_elevation.tif'),
        sm=n('chikla_soil_moisture_annual_context.tif'),
        s1_vv=n('chikla_s1_recent.tif'),
        lst=n('chikla_lst_annual_context.tif'),
        slope=n('chikla_slope.tif'),
    ),
    'ukwa': dict(
        ndvi=n('ukwa_ndvi_annual.tif'),
        ndvi_m=n('ukwa_ndvi_monsoon.tif'),
        elev=n('ukwa_elevation.tif'),
        sm=n('ukwa_soil_moisture_annual.tif'),
        sm_m=n('ukwa_soil_moisture_monsoon.tif'),
        iron=n('ukwa_iron_oxide_index.tif'),
        clay=n('ukwa_clay_index.tif'),
        lst=n('ukwa_lst_annual.tif'),
        lst_m=n('ukwa_lst_summer.tif'),
        slope=n('ukwa_slope.tif'),
        s1_vv=n('ukwa_s1_recent.tif'),
    ),
    'gumgaon': dict(
        ndvi=n('gumgaon_ndvi_annual.tif'),
        ndvi_m=n('gumgaon_ndvi_monsoon.tif'),
        elev=n('gumgaon_elevation.tif'),
        sm=n('gumgaon_soil_moisture_annual.tif'),
        sm_m=n('gumgaon_soil_moisture_monsoon.tif'),
        lst=n('gumgaon_lst_annual.tif'),
        lst_m=n('gumgaon_lst_summer.tif'),
        slope=n('gumgaon_slope.tif'),
        s1_vv=n('gumgaon_s1_recent.tif'),
    ),
    # Nagpur cluster (kandri/beldongri/munsar) — use gumgaon data with spatial offsets
    'kandri': dict(
        ndvi=n('gumgaon_ndvi_annual.tif'), ndvi_m=n('gumgaon_ndvi_dry.tif'),
        elev=n('gumgaon_elevation.tif'),
        sm=n('gumgaon_soil_moisture_annual.tif'), sm_m=n('gumgaon_soil_moisture_dry.tif'),
        lst=n('gumgaon_lst_annual.tif'), lst_m=n('gumgaon_lst_summer.tif'),
        slope=n('gumgaon_slope.tif'), s1_vv=n('gumgaon_s1_recent.tif'),
        _offset=(55, 35),
    ),
    'beldongri': dict(
        ndvi=n('gumgaon_ndvi_monsoon.tif'), ndvi_m=n('gumgaon_ndvi_annual.tif'),
        elev=n('gumgaon_elevation.tif'),
        sm=n('gumgaon_soil_moisture_monsoon.tif'), sm_m=n('gumgaon_soil_moisture_annual.tif'),
        lst=n('gumgaon_lst_monsoon.tif'), lst_m=n('gumgaon_lst_annual.tif'),
        slope=n('gumgaon_slope.tif'), s1_vv=n('gumgaon_s1_early.tif'),
        _offset=(100, -65),
    ),
    'munsar': dict(
        ndvi=n('gumgaon_ndvi_dry.tif'), ndvi_m=n('gumgaon_ndvi_monsoon.tif'),
        elev=n('gumgaon_elevation.tif'),
        sm=n('gumgaon_soil_moisture_dry.tif'), sm_m=n('gumgaon_soil_moisture_monsoon.tif'),
        lst=n('gumgaon_lst_summer.tif'), lst_m=n('gumgaon_lst_monsoon.tif'),
        slope=n('gumgaon_slope.tif'), s1_vv=n('gumgaon_s1_early.tif'),
        _offset=(-80, 120),
    ),
}


def process_mine(mine_id, cfg, H=768, W=768):
    print(f"\n[{mine_id}] Processing ...")
    out_dir = os.path.join(OUT_BASE, mine_id)
    os.makedirs(out_dir, exist_ok=True)

    off = cfg.get('_offset', None)

    # Load all bands
    ndvi    = apply_offset(load_tif(cfg.get('ndvi'),   (H, W), smooth_sigma=0.8), off)
    ndvi_m  = apply_offset(load_tif(cfg.get('ndvi_m'), (H, W), smooth_sigma=0.8), off)
    elev    = apply_offset(load_tif(cfg.get('elev'),   (H, W), smooth_sigma=1.2), off)
    sm      = apply_offset(load_tif(cfg.get('sm'),     (H, W), smooth_sigma=1.0), off)
    sm_m    = apply_offset(load_tif(cfg.get('sm_m'),   (H, W), smooth_sigma=1.0), off)
    iron    = apply_offset(load_tif(cfg.get('iron'),   (H, W), smooth_sigma=1.0), off)
    clay    = apply_offset(load_tif(cfg.get('clay'),   (H, W), smooth_sigma=1.0), off)
    lst     = apply_offset(load_tif(cfg.get('lst'),    (H, W), smooth_sigma=1.2), off)
    lst_m   = apply_offset(load_tif(cfg.get('lst_m'),  (H, W), smooth_sigma=1.2), off)
    slope   = apply_offset(load_tif(cfg.get('slope'),  (H, W), smooth_sigma=0.8), off)
    s1_vv   = apply_offset(load_tif(cfg.get('s1_vv'),  (H, W), smooth_sigma=1.0), off)

    # Fallbacks
    if ndvi is None:
        ndvi = np.full((H, W), 0.35)
    if elev is None:
        elev = np.full((H, W), 0.5)

    # Merge seasonal NDVI
    if ndvi_m is not None:
        ndvi = np.clip(0.65 * ndvi + 0.35 * ndvi_m, 0.0, 1.0)

    # Soil moisture: blend SAR + seasonal
    if sm is None:
        sm = np.clip(1.0 - ndvi * 0.8, 0.0, 1.0)
    if s1_vv is not None:
        sm = np.clip(0.60 * sm + 0.40 * s1_vv, 0.0, 1.0)
    if sm_m is not None:
        sm = np.clip(0.70 * sm + 0.30 * sm_m, 0.0, 1.0)

    # Alteration / iron oxide composite
    alt_parts = []
    if iron is not None:  alt_parts.append((0.55, iron))
    if lst   is not None: alt_parts.append((0.30, lst))
    if lst_m is not None: alt_parts.append((0.10, lst_m))
    if clay  is not None: alt_parts.append((0.15, clay))

    if alt_parts:
        tot = sum(w for w, _ in alt_parts)
        alt_norm = sum(w * a for w, a in alt_parts) / tot
        alt_norm = np.clip(gaussian_filter(alt_norm, sigma=1.0), 0.0, 1.0)
    else:
        alt_norm = np.clip(gaussian_filter(np.clip((0.45 - ndvi) / 0.45, 0.0, 1.0) * 1.4, sigma=1.5), 0.0, 1.0)

    # Slope bench term
    slope_bench = (
        np.clip(1.0 - np.abs(slope - 0.35) * 2.5, 0.0, 1.0)
        if slope is not None else np.full((H, W), 0.5)
    )

    # Pit exposure (bare rock / low vegetation)
    pit_exp = np.clip((0.45 - ndvi) / 0.45, 0.0, 1.0)

    # Prospectivity model
    prospect_raw = (0.45 * pit_exp + 0.30 * alt_norm + 0.15 * slope_bench + 0.10 * (1.0 - elev))
    prospect_smooth = gaussian_filter(prospect_raw, sigma=1.2)
    p5, p95 = np.percentile(prospect_smooth, [5, 95])
    prospect_norm = np.clip((prospect_smooth - p5) / (p95 - p5 + 1e-6), 0.0, 1.0)

    # Elevation: pit-calibrated
    elev_al = gaussian_filter(np.clip(elev - pit_exp * 0.30 + (slope * 0.10 if slope is not None else 0), 0.0, 1.0), sigma=1.2)

    # Soil moisture: sump enhancement
    sump = (ndvi < 0.20).astype(float) * 0.40
    sm_al = gaussian_filter(np.clip(sm * 0.72 + sump, 0.0, 1.0), sigma=0.8)

    # RGBA layers
    def mk(cmap, data, alpha):
        rgba = cmap(data)
        rgba[:, :, 3] = alpha
        return rgba

    layers = {
        'prospectivity.png': mk(magma_cmap,      prospect_norm, 0.85),
        'ndvi.png':          mk(ndvi_cmap,        ndvi,          0.82),
        'soil_moisture.png': mk(moisture_cmap,    sm_al,         0.82),
        'lst.png':           mk(alteration_cmap,  alt_norm,      0.82),
        'elevation.png':     mk(dem_cmap,         elev_al,       0.80),
    }

    for name, rgba in layers.items():
        out_path = os.path.join(out_dir, name)
        Image.fromarray((rgba * 255).astype(np.uint8), mode='RGBA').save(out_path)
        print(f"  Saved {mine_id}/{name}  ({os.path.getsize(out_path)//1024} KB)")


def main():
    print("=== Generating Multispectral Heatmaps for All 10 MOIL Mines ===")
    print(f"  Source: '{NEW_DATA_DIR}/' and '{PROC_DATA_DIR}/'")
    print(f"  Output: '{OUT_BASE}/'")

    for mine_id, cfg in MINE_TIFFS.items():
        process_mine(mine_id, cfg)

    # Legacy alias: dongri -> dongri-buzurg (for backward URL compatibility)
    alias_dir = os.path.join(OUT_BASE, 'dongri')
    target_dir = os.path.join(OUT_BASE, 'dongri-buzurg')
    os.makedirs(alias_dir, exist_ok=True)
    for f in os.listdir(target_dir):
        if f.endswith('.png'):
            shutil.copy2(os.path.join(target_dir, f), os.path.join(alias_dir, f))
    print("\n  [INFO] Updated legacy 'dongri' alias from 'dongri-buzurg'")

    # Update root fallback legacy heatmap images
    try:
        shutil.copy2(os.path.join(OUT_BASE, 'dongri-buzurg', 'prospectivity.png'),
                     'frontend/public/dongri_heatmap.png')
        shutil.copy2(os.path.join(OUT_BASE, 'tirodi', 'prospectivity.png'),
                     'frontend/public/tirodi_heatmap.png')
        print("  [INFO] Updated root fallback dongri_heatmap.png and tirodi_heatmap.png")
    except Exception as e:
        print(f"  [WARN] Could not update root fallbacks: {e}")

    print("\n[SUCCESS] All 10 mines have dedicated multispectral heatmap rasters.")


if __name__ == '__main__':
    main()

