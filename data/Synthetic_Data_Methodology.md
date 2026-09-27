# Synthetic Operational Data — Methodology Note

**File:** `synthetic_operational_data_all_mines.csv`
**Rows:** 10,960 (10 mines × 1,096 days, Jan 1 2023 – Dec 31 2025)
**Columns:** date, mine, mining_method, equipment_uptime_pct, blasting_delay_days, plant_availability_pct, rainfall_mm, seasonality_index (month), planned_target_tons_per_day, actual_production_tons

## Why this exists

No public source has daily equipment, blasting, or plant-availability records for any MOIL mine. This data is generated — but generated with real cause-and-effect structure and calibrated against real figures, not random noise, so a model trained on it learns genuine operational relationships.

## What's real vs. synthetic

| Field | Status | Basis |
|---|---|---|
| `mine`, `mining_method` | Real | Confirmed from your NGDR/lease data for each mine |
| `equipment_uptime_pct`, `blasting_delay_days`, `plant_availability_pct` | Synthetic | No public data exists; generated with realistic ranges and occasional multi-day breakdown/delay events, not pure randomness |
| `rainfall_mm` | Synthetic seasonal pattern | Represents the real monsoon (Jun–Oct) vs. dry season pattern confirmed by your CHIRPS/IMD data. **Recommend replacing with your actual per-mine CHIRPS values for final model training** — this column is a stand-in so the dataset works standalone |
| `planned_target_tons_per_day` | Assumption, reserve-scaled | Dongri Buzurg uses the real MCDR-documented target (350,000 t/year proposal). Other 9 mines' targets are scaled relative to their documented reserve size (Ukwa/Balaghat largest, Beldongri/Gumgaon smallest), checked so the **total across all 10 mines (2.42 million t/year) stays within MOIL's real reported capacity (2.49–3.42 million t/year, FY23–25)** |
| `actual_production_tons` | Synthetic, causally computed | `production = target × equipment_factor × plant_factor × (1 − rainfall_impact) × (1 − blasting_impact) × noise` — calibrated so Dongri Buzurg's synthetic annual output (340,644–355,066 t) matches its real historical range (303,383–390,001 t, from the 2010–15 MCDR report) |

## Key design decisions

**1. Opencast mines are more rainfall-sensitive than underground mines.** This is built into the formula, not incidental: opencast mines use a rainfall-sensitivity multiplier roughly 4.5× higher than underground mines, directly reflecting your project's established finding that surface conditions matter far less for underground extraction. Verified after generation: rainfall-to-production correlation is -0.23 for opencast mines vs. -0.02 for underground mines.

**2. Equipment breakdowns are discrete events, not just daily noise.** 6–10 breakdown events per mine per year, each lasting 2–5 days and dropping uptime to 20–50%, layered on top of an otherwise-healthy 80–100% baseline. This gives the SHAP cause-analysis model something real to detect ("equipment downtime spiked on these specific days"), not just smooth randomness.

**3. Shortfall variance is realistic, not flat.** After calibration, monthly shortfall vs. target ranges from roughly -12% (overachievement) to +18% (shortfall) across mines, with most months landing in a low-risk band and a genuine minority hitting medium/high risk — this is what makes the Feature 3 (Shortfall Prediction) risk classification meaningful rather than arbitrary.

## Honest limitations to state if asked

- The **target tonnage for 9 of 10 mines is an assumption** scaled by relative reserve size, not a document-confirmed figure. Only Dongri Buzurg's target and historical range are real.
- **Rainfall here is a representative seasonal pattern, not the actual per-mine CHIRPS values** you already collected — swap this column in before final training if precision matters for your demo.
- This dataset does **not** capture year-over-year trends (e.g., a mine's output genuinely declining as reserves deplete) — it's built as a stationary 3-year window with seasonal and random variation only.

## How to use it

Load directly with `pandas.read_csv()`. Filter by `mine` for a single-mine model, or use `mining_method` as a categorical feature if training one shared model across all 10 mines. Join with your real geoscience/satellite feature tables (from the compiled GeoPackages) on the `mine` column to build a complete per-mine training set for Feature 2 (Production Forecasting).
