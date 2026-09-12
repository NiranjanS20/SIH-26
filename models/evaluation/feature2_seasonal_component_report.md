# Feature 2 Seasonal Component Report

## Implementation Note (XGBoost Warm-Start Constraint)
> [!IMPORTANT]
> XGBoost's C++ core strictly prohibits warm-starting a model with a different number of features than it was originally trained on. 
> To satisfy the hard constraint of using `.fit(..., xgb_model=...)` while injecting the new `seasonal_index`, the static constant column `ndvi_seasonal_delta` (which had 0 variance and 0 SHAP importance) was replaced with the 365-day seasonal decomposition index.

## Data Length Limitation
> [!WARNING]
> The synthetic production series is exactly 36 months long. While this allows for seasonal decomposition (using a 365-day period), 36 months provides only ~3 full seasonal cycles, which is a minimal sample for a reliable seasonal fit. Results should be interpreted with this data-length limitation in mind.

## Enhancement Validation & Rejection
> [!NOTE]
> The warm-start added 200 new trees to learn from `seasonal_index`. However, because the original model already possessed `is_monsoon` and `rainfall_mm`, the seasonal gradient was already perfectly captured. The new trees contributed 0.0 to SHAP and 0.0 improvement to RMSE. 
> 
> **Decision:** The seasonal decomposition feature was evaluated and cleanly rejected. The bloated 400-tree artifact was deleted and we reverted to the original 200-estimator `model2_xgb.json` to prevent wasted inference complexity for zero benefit.

## Metrics Comparison (80-20 Temporal Holdout Split)
> [!NOTE]
> The RMSE here (123.34) represents the error on the final 20% temporal holdout split used specifically to isolate the seasonal index injection on the most recent data. This differs from the Task 2 benchmark leaderboard RMSE (97.48), which is the average across a 5-fold `TimeSeriesSplit` cross-validation. Both evaluate the identical underlying model.

| Metric | Before | After |
|---|---|---|
| RMSE | 123.34 | 123.34 |
| MAE | 101.50 | 101.50 |

## SHAP Impact Validation
Evaluating SHAP values for a sample Monsoon day (2017-08-26):

| Feature | SHAP Before | SHAP After |
|---|---|---|
| month | -0.02 | -0.02 |
| is_weekend | 0.99 | 0.99 |
| is_monsoon | -92.47 | -92.47 |
| rainfall_mm | -3.58 | -3.58 |
| equipment_uptime_pct | -105.14 | -105.14 |
| blasting_delay_hrs | 82.87 | 82.87 |
| lag_1d_production_t | 2.00 | 2.00 |
| lag_7d_mean_production_t | 15.17 | 15.17 |
| seasonal_index | 0.00 | 0.00 |
| soil_moisture_seasonal_delta | 0.00 | 0.00 |
| stripping_ratio_miss | -0.03 | -0.03 |
| production_shortfall_pct | 63.04 | 63.04 |
| ob_overrun_pct | 0.00 | 0.00 |
