# Codebase Audit Report

## 1. Frontend Inventory
- **Framework & Build Tool:** Vite with React (TypeScript) and potentially TailwindCSS (based on `index.css`). It is located in the root of the project with source in `src/`.
- **Environment Variables:** Since it uses Vite, it relies on `.env` injected via `import.meta.env.VITE_*`. The `vite.config.ts` handles the build step.
- **Routing & Navigation:** Handled in `App.tsx` and `DongriBuzurgWorkspace.tsx`. Features are split into tabs like `overview`, `production-forecast`, `shortfall-diagnosis`, `corrective-actions`, and `alerts`.
- **Components:** Contains a set of complex, data-rich components (`CTASection.tsx`, `Hero.tsx`, `MineDetailModal.tsx`, `MineSelectionPage.tsx`, etc.).
- **Data Shape Expected:** The frontend currently pulls from a highly structured mock JSON defined in `src/data/dongriBuzurgData.ts` (`MineWorkspaceData` interface).
    - It expects `mineInfo`, `operationalSummary`, `production` (with `actual`, `target`, `forecast`, `gap`, `monthlyTrend`), `shortfallRisk`, `accessibleOre`, `gisZones`, `modelInputs`, `riskContributors`, `futureSourceZone`, `recommendation`, and `alerts`.
    - **Contract:** The FastAPI backend endpoints must map specifically to these data shapes to avoid forcing a massive frontend rewrite. We'll use these interfaces to define our Pydantic response models.

## 2. ML / Model Inventory
- **Artifacts:**
  - `model1_clf.joblib`: Model 1 Prospectivity classification model (Random Forest).
  - `model1_reg.joblib`: Model 1 Prospectivity regression model (Random Forest).
  - `model2_xgb.json`: Model 2 Production Forecasting model (XGBoost).
- **Scripts:**
  - `03_train_model1_prospectivity.py`: Generates Model 1 using raster files.
  - `04_train_model2_production.py`: Generates Model 2 using synthetic operational telemetry combined with MCDR historical dispatch numbers.
  - `05_model3_shortfall.py`: Calculates shortfalls, gaps, and categorizes risks (creates `shortfall_data.csv`).
  - `06_model4_shap_analysis.py`: Computes SHAP feature importance for the shortfall (creates `shap_summary_model2.csv`, `shortfall_data_with_shap.csv`).
  - `07_model5_corrective_action.py`: Inverse optimization to compute required parameter changes to close the production gap (creates `corrective_actions.csv`).
- **Status:** Models are up to date and governed by `model_persistence.py`. No redundant artifacts exist.

## 3. Data Inventory
- **Locations & Formats:**
  - GeoSpatial/Rasters: `data/processed/aligned_*.tif` containing variables like NDVI, LST, Soil Moisture, Iron Oxide Index.
  - Tabular Data: `data/processed/` contains `mcdr_ground_truth.csv`, `production_training.csv`, `shortfall_data_with_shap.csv`, and `corrective_actions.csv`.
- **Access Patterns:**
  - Most data is precomputed by the scripts (e.g. `shortfall_data_with_shap.csv` and `corrective_actions.csv`).
  - Live raster processing isn't strictly necessary for fast retrieval endpoints except for specific "What-If" spatial queries, which currently operate primarily on tabular precomputed datasets anyway. Thus, we can serve standard data from the CSVs and Models in memory.

## 4. Existing Backend Scaffold
- **Status:** No existing Python backend scaffold found. The scripts run as standalone Python ETL/Training pipelines. We are starting from a clean slate to build the FastAPI app (`backend/` directory).

## DB Recommendation (Task 3 Decision)
Based on the audit:
- The data is predominantly pre-computed read-only ML outputs and static geographical/telemetry summaries.
- A full PostgreSQL database is unnecessary for this hackathon prototype and would add significant deployment overhead.
- **Decision:** Use an in-memory or static file approach for now. A database is NOT required for the initial API payload delivery, as `data/processed` CSVs and the model files provide all required information directly. We will not use SQLAlchemy or SQLite immediately unless "What-If" scenario saving functionality is mandated later.
