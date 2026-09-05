# Backend Recovery Log
## Dongri Buzurg Platform — Recovery from commit 15ddcb7

### Recovery Details

| Field | Value |
|---|---|
| Source commit | `15ddcb7` ("Fix backend imports and variable scopes") |
| Recovery method | Selective `git checkout` — backend/, scripts/, data/processed/ only |
| Merge used? | **No.** Direct file copy via `git checkout <commit> -- <paths>`, zero merge surface |
| src/ touched? | **No.** 10 frontend files diverge between branches — left entirely untouched |
| Conflict markers found? | **None** — verified via `Select-String` grep on all recovered files |
| Pre-commit hook installed? | **Yes** — `.git/hooks/pre-commit` blocks staged files with `<<<<<<<`, `=======`, `>>>>>>>` |

### Stash Review

| Field | Value |
|---|---|
| Stash ref | `stash@{0}` based on `0f392e1` |
| Contents | Minor refactoring: renamed `get_workspace_data` → `get_workspace`, simplified endpoint routes, cleaned src/apiClient.ts |
| Verdict | **Superseded** — all changes already present in `15ddcb7`. No unique content. |

### Artifact Verification Table (Amendment 2)

| Artifact | Type | In git tree? | Loaded successfully? | Notes |
|---|---|---|---|---|
| `model1_clf.joblib` | Model (RF Classifier) | ✅ | ✅ | sklearn version warning (trained 1.9.0, env 1.4.1) |
| `model1_reg.joblib` | Model (RF Regressor) | ✅ | ✅ | Same version warning |
| `model2_xgb.json` | Model (XGBoost Booster) | ✅ | ✅ | Clean load |
| `mcdr_ground_truth.csv` | CSV | ✅ | ✅ | 8 rows |
| `mcdr_reserves.csv` | CSV | ✅ | ✅ | 8 rows |
| `shortfall_data.csv` | CSV | ✅ | ✅ | 1089 rows |
| `shap_summary_model2.csv` | CSV | ✅ | ✅ | 13 features |
| `corrective_actions.csv` | CSV | ✅ | ✅ | 340 rows |
| `production_training.csv` | CSV (optional) | ✅ | ✅ | Confirmed real script output (scripts/04_*.py) |
| `production_calibration.csv` | CSV (optional) | ✅ | ✅ | Confirmed real script output (scripts/01_*.py) |

### MCDR Extraction Script Status

```
git log --all --oneline -- scripts/01a_extract_mcdr_reports.py
```
**Result:** Script IS present in commit `15ddcb7` tree and was recovered via selective checkout.

### Frontend Divergence Check (Amendment 1)

```
git diff main recovery/backend-restore --stat -- src/
```
**10 files diverge:**
- src/apiClient.ts (+49)
- src/components/DongriBuzurgWorkspace.tsx (+457 --)
- src/components/MineSiteVisualizer.tsx (+29 -)
- src/components/OperationalFootprintMap.tsx (+31 -)
- src/components/PortfolioView.tsx (1138 lines changed)
- src/components/ProspectivityView.tsx (866 lines changed)
- src/components/ReserveMappingPage.tsx (+27 -)
- src/components/ui/ShaderCard.tsx (+33 -)
- src/components/ui/binaural-glow-feature-card.tsx (+24 -)
- src/data/reserveMappingData.ts (+12 -)

**Action taken:** `src/` completely excluded from recovery. Task 4 rebuilds frontend API wiring from scratch.

### Root-Cause Fixes Applied

| Problem | Root Cause | Fix Applied |
|---|---|---|
| A: Startup hang | Blocking `requests.get()` before `yield` | Weather moved to `asyncio.create_task()` after model loading; gated behind `WEATHER_ENABLED=False` |
| B: Zombie threads | `requests` library spawns OS thread per call | Replaced with `httpx.AsyncClient` — async-native, zero OS threads |
| C: Conflict markers | Git merge introduces textual conflicts | Pre-commit hook blocks; recovery used selective checkout not merge |
| D: Per-request latency | Re-loading models/data on each request | All models + CSVs pre-loaded into memory at startup; endpoints read from cache |

### Deferred Files (Amendment 3)

The following files have `# DEFERRED` headers and are disconnected from the active import graph:
- `backend/app/core/security.py`
- `backend/app/core/audit.py`  
- `backend/app/core/rate_limit.py`

### Startup Timing

| Event | Duration |
|---|---|
| Model loading (3 models) | ~2s (includes sklearn version warning) |
| CSV loading (7 files) | <1s |
| Workspace precomputation | <1s |
| Total startup to "Application startup complete" | ~3s |
| Health endpoint response | **22.3ms** |
| Workspace endpoint response | **62.9ms** |

### Known Issues

1. **sklearn version mismatch**: Models trained with sklearn 1.9.0, env has 1.4.1.post1. Works but produces warnings. Consider upgrading sklearn or retraining models.
2. **SHAP import extremely slow** (~30s+): `import shap` pulls in heavy dependencies. TreeExplainer moved to lazy initialization via `get_shap_explainer()` to avoid blocking startup.
