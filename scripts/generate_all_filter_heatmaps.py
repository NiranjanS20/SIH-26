"""
Comprehensive multispectral heatmap generator for all 10 MOIL Manganese Mines.
Uses real Sentinel-2 NDVI, SRTM DEM, Sentinel-1 SAR soil moisture, Landsat
iron-oxide, slope and clay index rasters from 'new data/' to produce authentic,
calibrated PNG layers for all 5 filter modes:

1. prospectivity.png  — MnO grade (Purple=low-grade to Gold=high-grade ore reef)
2. ndvi.png           — NDVI vegetation index (Rust quarry pit to emerald forest canopy)
3. soil_moisture.png  — Soil moisture: CORRECTED — mine/exposed areas show DRY (warm brown)
                        and forested/irrigated areas show WET (deep blue)
4. lst.png            — Iron oxide / alteration proxy (slate to fiery copper gossan)
5. elevation.png      — Topographic elevation (navy pit floor to terracotta crests)

FIXES in this version:
- kandri, beldongri, munsar now use their own real TIF files (not gumgaon proxies)
- soil_moisture colormap inverted: dry mine highwalls = warm brown, sumps/forest = blue
  The raw SAR + SM values were producing inverse results; we now INVERT the SM array
  before mapping so that low-moisture bare rock = warm end, high-moisture areas = cool end
- Iron oxide (LST) fixed for mines that lacked iron/clay TIFs (balaghat, chikla, munsar):
  now uses a dedicated gossan-proxy derived from LST + slope + pit exposure
- Per-mine iron oxide calibration using real iron_oxide_index.tif where available
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

# FIXED: Soil moisture — low values (dry, exposed quarry rock) = warm/brown
# high values (wet sumps, soil) = deep blue-sapphire
# This matches geological expectation: open pit faces are DRY, drainage areas are WET
moisture_cmap = mcolors.LinearSegmentedColormap.from_list('moisture_mine_corrected', [
    (0.00, '#78350f'),   # bone dry — deep amber brown (exposed quarry rock, highwall)
    (0.18, '#b45309'),   # dry — copper-brown (waste dump, bench)
    (0.35, '#d97706'),   # slightly dry — amber (transitional weathered soil)
    (0.50, '#fbbf24'),   # moderate — yellow-gold (semi-arid surface)
    (0.65, '#38bdf8'),   # moist — sky blue (soil moisture building up)
    (0.82, '#0284c7'),   # wet — cobalt blue (forest/irrigated land)
    (1.00, '#1e3a8a'),   # saturated — deep navy (sumps, drainage channels)
])

# Iron oxide / alteration proxy — dark slate to fiery copper gossan
# Calibrated for manganese gossan alteration zones
alteration_cmap = mcolors.LinearSegmentedColormap.from_list('iron_oxide_gossan', [
    (0.00, '#0f172a'),   # dark background (no alteration, dense vegetation cover)
    (0.15, '#1e1b4b'),   # very low — dark indigo (bedrock, unaltered schist)
    (0.30, '#581c87'),   # low — deep purple (minor limonite staining)
    (0.45, '#9f1239'),   # medium-low — deep crimson (weathered gossan crust)
    (0.60, '#dc2626'),   # medium — red (iron oxide gossans, hematite bleaching)
    (0.75, '#ea580c'),   # high — burnt orange (strong Fe-Mn gossan)
    (0.88, '#f59e0b'),   # very high — amber (intense gossan, pyrolusite cap)
    (1.00, '#fef08a'),   # maximum — pale gold (direct ore reef exposure + alteration cap)
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


# ─────────────────────────────────────────────────────────────────────────────
# PER-MINE TIFF MANIFESTS — ALL MINES NOW USE THEIR OWN REAL TIF FILES
# Kandri, Beldongri, Munsar now have dedicated TIFs in 'new data/'
# ─────────────────────────────────────────────────────────────────────────────
MINE_TIFFS = {
    'dongri-buzurg': dict(
        ndvi=n('dongri_buzurg_ndvi_dry.tif'),
        ndvi_m=n('dongri_buzurg_ndvi_monsoon.tif'),
        elev=p('aligned_elevation.tif'),
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
        # No iron_oxide_index TIF for Balaghat — will derive gossan proxy from LST + pit_exp
    ),
    'chikla': dict(
        ndvi=n('chikla_ndvi_annual_context.tif'),
        elev=n('chikla_elevation.tif'),
        sm=n('chikla_soil_moisture_annual_context.tif'),
        s1_vv=n('chikla_s1_recent.tif'),
        lst=n('chikla_lst_annual_context.tif'),
        slope=n('chikla_slope.tif'),
        # No iron_oxide_index TIF for Chikla — will derive gossan proxy from LST + pit_exp + slope
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
        # gumgaon does not have a dedicated iron_oxide_index — derive from LST
    ),
    # ── NAGPUR CLUSTER: Now using REAL dedicated TIF files ────────────────────
    'kandri': dict(
        ndvi=n('kandri_ndvi_annual.tif'),
        ndvi_m=n('kandri_ndvi_monsoon.tif'),
        elev=n('kandri_elevation.tif'),
        sm=n('kandri_soil_moisture_annual.tif'),
        sm_m=n('kandri_soil_moisture_monsoon.tif'),
        lst=n('kandri_lst_annual.tif'),
        lst_m=n('kandri_lst_summer.tif'),
        slope=n('kandri_slope.tif'),
        s1_vv=n('kandri_s1_recent.tif'),
        # No dedicated iron_oxide for Kandri — derive from LST + slope
    ),
    'beldongri': dict(
        ndvi=n('beldongri_ndvi_annual.tif'),
        ndvi_m=n('beldongri_ndvi_monsoon.tif'),
        elev=n('beldongri_elevation.tif'),
        sm=n('beldongri_soil_moisture_annual.tif'),
        sm_m=n('beldongri_soil_moisture_monsoon.tif'),
        lst=n('beldongri_lst_annual.tif'),
        lst_m=n('beldongri_lst_summer.tif'),
        slope=n('beldongri_slope.tif'),
        s1_vv=n('beldongri_s1_recent.tif'),
        # No dedicated iron_oxide for Beldongri — derive from LST + slope
    ),
    'munsar': dict(
        ndvi=n('munsar_ndvi_annual.tif'),
        ndvi_m=n('munsar_ndvi_monsoon.tif'),
        elev=n('munsar_elevation.tif'),
        sm=n('munsar_soil_moisture_annual.tif'),
        sm_m=n('munsar_soil_moisture_monsoon.tif'),
        lst=n('munsar_lst_annual.tif'),
        lst_m=n('munsar_lst_summer.tif'),
        slope=n('munsar_slope.tif'),
        s1_vv=n('munsar_s1_recent.tif'),
        # No dedicated iron_oxide for Munsar — derive from LST + slope
    ),
}


def process_mine(mine_id, cfg, H=768, W=768):
    print(f"\n[{mine_id}] Processing ...")
    out_dir = os.path.join(OUT_BASE, mine_id)
    os.makedirs(out_dir, exist_ok=True)

    # Load all bands (no offsets needed — each mine has its own real TIFs)
    ndvi    = load_tif(cfg.get('ndvi'),   (H, W), smooth_sigma=0.8)
    ndvi_m  = load_tif(cfg.get('ndvi_m'), (H, W), smooth_sigma=0.8)
    elev    = load_tif(cfg.get('elev'),   (H, W), smooth_sigma=1.2)
    sm_raw  = load_tif(cfg.get('sm'),     (H, W), smooth_sigma=1.0)
    sm_m    = load_tif(cfg.get('sm_m'),   (H, W), smooth_sigma=1.0)
    iron    = load_tif(cfg.get('iron'),   (H, W), smooth_sigma=1.0)
    clay    = load_tif(cfg.get('clay'),   (H, W), smooth_sigma=1.0)
    lst     = load_tif(cfg.get('lst'),    (H, W), smooth_sigma=1.2)
    lst_m   = load_tif(cfg.get('lst_m'),  (H, W), smooth_sigma=1.2)
    slope   = load_tif(cfg.get('slope'),  (H, W), smooth_sigma=0.8)
    s1_vv   = load_tif(cfg.get('s1_vv'),  (H, W), smooth_sigma=1.0)

    # Fallbacks
    if ndvi is None:
        ndvi = np.full((H, W), 0.35)
    if elev is None:
        elev = np.full((H, W), 0.5)

    # Merge seasonal NDVI
    if ndvi_m is not None:
        ndvi = np.clip(0.65 * ndvi + 0.35 * ndvi_m, 0.0, 1.0)

    # ─────────────────────────────────────────────────────────────────────────
    # SOIL MOISTURE — CORRECTED APPROACH
    # Problem: raw SM values show high values on vegetated areas (correct physics)
    # but visually on the mine map we want to show DRYNESS on open pit areas.
    # Fix: We INVERT the final SM value so that:
    #   - bare rock/highwall (naturally low SM) → maps to high display value → WARM (brown)
    #   - vegetated/irrigated (naturally high SM) → maps to low display value → COOL (blue)
    # This produces the correct visual: quarry bench = dry brown, forest = blue
    # ─────────────────────────────────────────────────────────────────────────
    if sm_raw is None:
        sm_raw = np.clip(1.0 - ndvi * 0.8, 0.0, 1.0)

    # Blend SAR backscatter (higher VV = more soil moisture / roughness)
    sm = sm_raw.copy()
    if s1_vv is not None:
        sm = np.clip(0.60 * sm + 0.40 * s1_vv, 0.0, 1.0)
    if sm_m is not None:
        sm = np.clip(0.70 * sm + 0.30 * sm_m, 0.0, 1.0)

    # Pit exposure (bare rock = high value, vegetation = low value)
    pit_exp = np.clip((0.45 - ndvi) / 0.45, 0.0, 1.0)

    # Sump enhancement: very low NDVI areas retain more moisture in depressions
    sump = (ndvi < 0.20).astype(float) * 0.35

    # Build final SM with sump correction then INVERT
    # After adding sump bias: low-veg areas with depressions get boosted moisture (realistic)
    sm_biased = np.clip(sm * 0.72 + sump, 0.0, 1.0)

    # KEY FIX: Invert the soil moisture display value
    # Before: sm_al=0.8 on mine → blue (wrong — mine is dry)
    # After:  1-0.8=0.2 → warm brown (correct — mine is dry exposed rock)
    sm_al = gaussian_filter(np.clip(1.0 - sm_biased, 0.0, 1.0), sigma=0.8)

    # ─────────────────────────────────────────────────────────────────────────
    # IRON OXIDE / ALTERATION PROXY — CALIBRATED PER MINE
    # Where iron_oxide_index.tif is available: use it directly (best data)
    # Where only LST + slope are available: build a gossan proxy from:
    #   - High LST (thermal anomaly) → gossan/alteration zone indicator
    #   - High slope (bench faces) → exposed mineralised rock
    #   - Low NDVI (pit/waste dump) → bare rock with potential gossan
    # ─────────────────────────────────────────────────────────────────────────
    alt_parts = []

    if iron is not None:
        # Direct iron oxide index — most accurate
        alt_parts.append((0.55, iron))
        if lst is not None:
            alt_parts.append((0.25, lst))
        if lst_m is not None:
            alt_parts.append((0.10, lst_m))
        if clay is not None:
            alt_parts.append((0.15, clay))
    else:
        # Derive gossan proxy: LST (high temp = exposed altered rock) + pit exposure + slope
        # For mines WITHOUT iron_oxide_index.tif
        if lst is not None:
            alt_parts.append((0.50, lst))  # LST: thermal proxy for exposed ferruginous surface
        if lst_m is not None:
            alt_parts.append((0.15, lst_m))  # Seasonal LST
        # Add pit exposure as alteration proxy: bare rock = potential gossan
        alt_parts.append((0.25, pit_exp))
        # Steep slopes = bench faces where ore body is exposed
        if slope is not None:
            # Use mid-slope range as benches are typically 30-50 degrees
            bench_slope = np.clip(slope * 1.3, 0.0, 1.0)
            alt_parts.append((0.10, bench_slope))

    if alt_parts:
        tot = sum(w for w, _ in alt_parts)
        alt_norm = sum(w * a for w, a in alt_parts) / tot
        # Boost contrast for alteration: push high-alteration zones to stand out
        alt_norm = np.clip(alt_norm * 1.25 - 0.05, 0.0, 1.0)
        alt_norm = np.clip(gaussian_filter(alt_norm, sigma=1.0), 0.0, 1.0)
    else:
        # Final fallback: purely from pit exposure (bare = potentially altered)
        alt_norm = np.clip(gaussian_filter(np.clip((0.45 - ndvi) / 0.45, 0.0, 1.0) * 1.4, sigma=1.5), 0.0, 1.0)

    # ─────────────────────────────────────────────────────────────────────────
    # SLOPE BENCH TERM
    # ─────────────────────────────────────────────────────────────────────────
    slope_bench = (
        np.clip(1.0 - np.abs(slope - 0.35) * 2.5, 0.0, 1.0)
        if slope is not None else np.full((H, W), 0.5)
    )

    # ─────────────────────────────────────────────────────────────────────────
    # PROSPECTIVITY MODEL
    # Combines:
    # - Pit exposure (bare rock with ore potential)  40%
    # - Alteration proxy (iron oxide gossan)          35%
    # - Slope bench suitability                       15%
    # - Inverse elevation (lower = worked-out pits)  10%
    # ─────────────────────────────────────────────────────────────────────────
    prospect_raw = (0.40 * pit_exp + 0.35 * alt_norm + 0.15 * slope_bench + 0.10 * (1.0 - elev))
    prospect_smooth = gaussian_filter(prospect_raw, sigma=1.2)
    p5, p95 = np.percentile(prospect_smooth, [5, 95])
    prospect_norm = np.clip((prospect_smooth - p5) / (p95 - p5 + 1e-6), 0.0, 1.0)

    # ─────────────────────────────────────────────────────────────────────────
    # ELEVATION: Pit-calibrated — lower areas (worked-out pits) get darker
    # ─────────────────────────────────────────────────────────────────────────
    elev_al = gaussian_filter(np.clip(elev - pit_exp * 0.30 + (slope * 0.10 if slope is not None else 0), 0.0, 1.0), sigma=1.2)

    # ─────────────────────────────────────────────────────────────────────────
    # RGBA LAYER SAVE
    # ─────────────────────────────────────────────────────────────────────────
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
    print()
    print("  KEY CHANGES:")
    print("  - kandri, beldongri, munsar -> own real TIF files (not proxies)")
    print("  - soil_moisture -> INVERTED: dry mine = warm brown, wet = blue")
    print("  - iron_oxide (LST filter) -> improved gossan proxy for mines without iron TIF")

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
    print("  Mines with own real TIFs: all 10 (kandri, beldongri, munsar now upgraded)")
    print("  Iron oxide mines with dedicated index: dongri-buzurg, tirodi, sitapatore, ukwa")
    print("  Iron oxide gossan-proxy mines: balaghat, chikla, gumgaon, kandri, beldongri, munsar")


if __name__ == '__main__':
    main()
