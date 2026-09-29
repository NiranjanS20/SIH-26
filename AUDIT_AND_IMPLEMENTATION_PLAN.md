# MOIL Platform — Comprehensive Audit & Implementation Plan
# SIH 26009

*Document generated from multi-agent codebase analysis. No files were modified during analysis. This document consolidates findings and recommended fixes.*

---

## Table of Contents

1. [Comprehensive Audit](#1-comprehensive-audit)
2. [Implementation Plan](#2-implementation-plan)
3. [Execution Order & Dependencies](#3-execution-order--dependencies)
4. [Risk Mitigation](#4-risk-mitigation)
5. [Success Criteria](#5-success-criteria)

---

## 1. Comprehensive Audit

### Audit Scope
- **Repository:** `SIH-26` (Smart India Hackathon 26009)
- **Stack:** React 19 + Vite + TypeScript (frontend) · FastAPI + SQLAlchemy 2.0 async + Alembic (backend) · XGBoost / RandomForest / SHAP (ML)
- **Scale:** ~90 source files · backend ~4k LOC · frontend ~20.5k LOC · scripts ~3.5k LOC
- **Status:** Analysis performed read-only; zero file modifications

### Audit Findings Summary

| Severity | Count | Description |
|---|---|---|
| CRITICAL | 12 | App cannot start; security vulnerabilities; privilege escalation |
| HIGH | 38 | Broken features; security holes; data corruption; SQL injection risks |
| MEDIUM | 47 | Maintainability issues; correctness problems; performance concerns |
| LOW | 22 | Hygiene; documentation; minor edge cases |
| **TOTAL** | **119** | |

### Audit Categories (with key findings)

#### 1. Blocking Issues (App Cannot Start)
- **B1:** `ImportError` in `deps.py:2` — imports `get_current_user` which `auth.py` does not define
- **B2:** Frontend `tsconfig.json` references missing `tsconfig.app.json` and `tsconfig.node.json`
- **B3:** `enable_postgis.py` contains `DROP SCHEMA public CASCADE` — destroys entire database

#### 2. Authentication & Authorization (20 findings)
- **A1:** `JWT_SECRET` hardcoded in `config.py:11` — forgeable admin tokens
- **A2:** `?dev=true` in `authService.ts:69` fabricates a site_manager session from URL
- **A3:** `?token=` in `authService.ts:55` plants a session via crafted link
- **A4:** Plaintext password comparison in `auth.py:52` — no hashing, no salt
- **A5:** `require_role` checks only `role` claim — **no mine scoping**; site_manager reads all 12 mines
- **A6:** Two `require_role` implementations with incompatible signatures (`deps.py` varargs vs `security.py` list)
- **A7:** `GET /reports/{report_id}` unauthenticated — enumerates report IDs + returns server filesystem paths
- **A8:** `StaticFiles` mount on `DATA_DIR` serves model artifacts + raw CSVs anonymously
- **A9:** DB superuser password `Jaya98765!` in two scripts
- **A10:** Rate limiting not wired; `core/rate_limit.py` would `AttributeError` on import

#### 3. Input Validation / Injection Risks (11 findings)
- **V1/V2:** Raw SQL with f-string interpolation in `data_admin.py` and `data_industry.py` — **SQL injection**
- **V3:** Bare `except Exception → HTTPException(500, detail=str(e))` in `whatif.py` — leaks internals
- **V4:** Same pattern in `prospectivity.py:151`
- **V5:** Global handler returns `str(exc)` — 3 incompatible error contracts
- **V8:** `model1_pooled_reg.predict([[4 features]])` into 18-feature model — always throws → hardcoded 41.5

#### 4. Secrets & Credential Exposure (7 findings)
- **S1:** `JWT_SECRET` hardcoded (see A1)
- **S2:** Hardcoded DB superuser password `Jaya98765!` in `apply_rls.py:5` and `enable_postgis.py:7`
- **S3:** `enable_postgis.py:10` — `DROP SCHEMA public CASCADE`

#### 5. Error Handling Problems (14 findings)
- **E1:** Global handler returns `str(exc)` — leaks internals on every 500
- **E2/E3:** Bare `except Exception` in `whatif.py` and `prospectivity.py` — bypasses global Envelope, leaks errors
- **E4:** Gemini fallback returns hardcoded 3-paragraph text presented as real
- **E5:** WeasyPrint unavailable → 68-byte dummy PDF + still marks report `generated`

#### 6. Database / Schema / Migration Issues (13 findings)
- **D1:** `downgrade()` drops 6 GiST indexes `upgrade()` never creates → `alembic downgrade` crashes
- **D2:** Zero CHECK constraints in migration — 11 defined in models are absent
- **D3:** ~25 column/table references in reporting SQL don't exist in migrated schema
- **D4:** Seeder CSV path `../data/satellite data and more/synthetic_operational_data_all_mines.csv` does not exist
- **D5:** `migrate_csv_to_db.py` prints "completed" but loads zero rows into `production_records`

#### 7. ML / Model Serving Bugs (10 findings)
- **M1:** 4 features passed to 18-feature `RandomForestRegressor` → always throws → returns hardcoded 41.5
- **M2:** `whatif` Dongri branch omits `ob_overrun_pct` (13 of 14 features)
- **M3:** `+9.9` t/day magic post-hoc offset for Tirodi
- **M4:** `model_persistence.py:29` gates overwrite on `model_name` not path — `model1_reg` used by two different models
- **M5:** `admin.py:57-130` hardcoded metrics contradict `persistence_log.json` it reads

#### 8. Data Provenance & Integrity (5 findings)
- **P1:** `01_extract_ibm_pdf_data.py:27` self-describes as "mock parser" — only 1 real month
- **P2:** `final_report.md:9-10` claims "Accuracy ~97.6%, F1 ~0.97–0.98" — actual logged F1 = 0.0114
- **P3:** `admin.py:64,76,88,112` hardcoded metrics contradict the log it reads

#### 9. Frontend Architecture Problems (15 findings)
- **F1:** No router library — `useState` string route from `?route=`; no `pushState`/`popstate`
- **F2:** RBAC guard checks only auth presence, not role — `admin-control-center` accessible to any logged-in user
- **F3:** Role logic duplicated 4× (App.tsx:95, 104; LoginPage.tsx:27; Navbar.tsx:27)
- **F7:** Five overlapping frontend mine datasets with conflicting numbers (e.g., Dongri: 38600/45000 vs 4100/5000)
- **F7:** `MineWorkspace.tsx` = 5,899 lines — monolith with 5 API effects, fake AI, duplicated comments

#### 10. Dependencies Risks (10 findings)
- **DEP1:** `backend/requirements.txt` missing declarations: `sqlalchemy`, `asyncpg`, `alembic`, `geoalchemy2`, etc.
- **DEP2:** No version pin on `scikit-learn` — `recovery_log.md:93` records 1.9.0 vs 1.4.1 skew
- **DEP7:** Two map libraries shipped simultaneously: `maplibre-gl` + `leaflet` + `react-leaflet`

#### 11. Dead / Duplicated Code (14 findings)
- **DD1:** `core/audit.py` — `HashChainAuditMiddleware` never registered
- **DD2:** `core/rate_limit.py` — never called; would crash on import
- **DD5:** `models/` artifacts never loaded by backend (registry points at `data/processed/`)
- **DD11:** Six root `model*/shortfall*` files — stale UTF-16 forks

#### 12. Testing Gaps (8 findings)
- **T1:** `tests/conftest.py` — no fixtures; no `client`, no `db`, no overrides
- **T2:** `test_routes.py:3` imports `app.main` — raises `ImportError`; lifespan never runs for first 7 tests
- **T3:** `test_gemini_interpret_endpoint` indented inside another function — never collected
- **T4:** Tautology assertions (`status in [200, 404]`)

#### 13. Bad API Design (14 findings)
- **API1:** `prospectivity_router` mounted twice — duplicate routes
- **API2:** Health endpoint returns bare dict — not `Envelope`
- **API3:** `/auth/me` returns stub — no JWT validation
- **API4:** 8 of 12 routers return bare dicts — not `Envelope`; client `apiGet` returns `undefined`
- **API10:** `GET /reports/{report_id}` return type changes based on auth status

#### 14. Scalability Problems (7 findings)
- **SC1:** `workspace_service.py` unbounded in-memory cache — never invalidated, no TTL
- **SC2:** Matplotlib runs on event loop — blocks all other requests during report generation
- **SC4:** Eager SHAP explainer — 200+ MB, 2-5s boot; multiplies memory with horizontal scaling

#### 15. Maintainability Issues (10 findings)
- **MA1:** `workspace_service.py` 1,212 lines — one function 1,186 of them with 10 copy-pasted mine literals
- **MA2:** `MineWorkspace.tsx` 5,899 lines — monolith with 5 API effects, fake AI, duplicated comments
- **MA4:** `admin.py` 85% literal dicts — hardcoded portfolio, model cards, system health

#### 16. Configuration / Environment (7 findings)
- **CF1:** `config.py:30` `env_file = ".env"` resolved against CWD, not file location
- **CF2:** `extra = 'ignore'` — typo'd env vars fail silently to defaults

#### 17. Edge Cases & Minor Issues (10 findings)
- **EC1:** Report IDs `RPT-{MINE}-{timestamp}` — second-granularity; collision risk
- **EC9:** Five native `alert()` calls in `MineWorkspace` — blocks UI thread

#### 18. Cleanup Items (8 findings)
- **CL1:** Delete dead backend code: `audit.py`, `rate_limit.py`, `deps.py`, etc.
- **CL2:** Delete dead frontend code: `apiClient.ts`, `App.css`, `lib/utils.ts`, 15/22 `ui/` components
- **CL4:** Fix `.gitignore:49` — `data/processed/` (directory) excluded; negations at 68-70 are inert

---

## 2. Implementation Plan

### Group 1: Critical Fixes (Blocking / App Cannot Run)
| # | Item | Files | Approach | Verification |
|---|------|-------|----------|------------|
| C1 | Fix `ImportError` in `deps.py` | `deps.py:2`, `auth.py:65` | Rename `get_current_user_info` → `get_current_user` in `auth.py` | `uvicorn app.main:app` starts |
| C2 | Fix frontend build | Create `tsconfig.app.json` + `tsconfig.node.json` | Copy from Vite+React TS template | `cd frontend && npm run build` succeeds |
| C3 | Fix `enable_postgis.py` destructive `DROP SCHEMA` | `enable_postgis.py:10-11` | Add `--confirm`/`--yes` flag; separate extension creation | Re-run script — no error; extension created |

#### 3. Security Fixes
| # | Item | Files | Approach | Verification |
|---|------|-------|----------|------------|
| S1 | Remove hardcoded `JWT_SECRET` | `config.py:11`, `.env.example:4` | Make required env var; fail startup if default | Start without `.env` → crash with message; start with valid secret → works |
| S2 | Remove frontend auth bypasses | `authService.ts:55-61`, `:69-77` | Delete `?token=` and `?dev=true` blocks | `?dev=true` no longer logs in |
| S3 | Implement mine-scoping in `require_role` | `core/security.py:27-37`, `auth.py:48` | Add `assigned_mine_id` to JWT; create `require_role_scoped`; apply to all `/mines/{id}/*` routes | Login as `sitemanager` → `GET /mines/kandri/workspace` → 403; `GET /mines/dongri-buzurg/workspace` → 200 |
| S4 | Add auth to unauthenticated endpoints | `prospectivity.py:47,118`, `reporting/routes.py:206` | Add `Depends(require_role(...))` | Unauthenticated → 401; authenticated wrong role → 403 |
| S5 | Protect static file mount | `main.py:121-122` | Mount `StaticFiles` behind auth or move artifacts elsewhere | `GET /static/model1_clf.joblib` → 401/403 |
| S6 | Remove hardcoded DB credentials | `apply_rls.py:5`, `enable_postgis.py:7`, `db/session.py:6` | Require `DATABASE_URL` env var only | Scripts fail without env var; clear error with it |
| S7 | Fix `atob` JWT decode | `authService.ts:23` | Use `atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))` | Valid JWT with `-`/`_` decodes without error |
| S8 | Add rate limiting to `/auth/login` | `requirements.txt`, `rate_limit.py`, `main.py` | Add `RATE_LIMIT_PER_MINUTE` to Settings; register `SlowAPIMiddleware`; add `@limiter.limit("10/minute")` | 11 rapid attempts → 429 on 11th |

#### 4. Correctness Fixes
| # | Item | Files | Approach | Verification |
|---|------|-------|----------|------------|
| CR1 | Fix reporting SQL | `data_admin.py`, `data_industry.py` | Rewrite all queries using SQLAlchemy `text()` with bound parameters; map to actual schema columns | Report endpoint → `status='generated'`; PDF downloads and renders |
| CR2 | Fix migration indexes + constraints | `cf51136d1430_init_db.py` | Add `create_index(..., postgresql_using='gist')` for 4 spatial indexes; add `create_check_constraint()` for 11 constraints; remove invalid drops from `downgrade()` | `alembic upgrade head` → indexes + constraints exist; `alembic downgrade base` → succeeds |
| CR3 | Align model feature vectors | `prospectivity.py:136`, `model_registry.py:20-21` | Retrain `model1_pooled_reg` on 4 features the API sends | `POST /mines/model-predict` → real prediction (not hardcoded 41.5); `engine: "model1_pooled_reg"` |
| CR4 | Fix `whatif` feature mismatch | `whatif_service.py:44-58` | Add `ob_overrun_pct` to Dongri feature dict with default 0.0 | `POST /whatif/dongri-buzurg/simulate` → prediction varies when feature changes |
| CR5 | Fix `persistence_log.json` key collision | `model_persistence.py:29`, `03_train.py:281`, `10_train.py:556` | Namespace keys: `model1_dongri_reg`, `model1_pooled_reg`, `model1_dongri_clf` | `GET /admin/model-governance` shows distinct entries with correct metrics |
| CR6 | Fix admin hardcoded metrics | `admin.py:57-130` | Delete hardcoded `models_info` block; render dynamically from `persistence_log.json` | Admin metrics match log; `system-health` shows real Python version |
| CR7 | Fix seeder silent no-op | `migrate_csv_to_db.py:54-57` | Raise `FileNotFoundError` if CSV missing; or transform existing `production_training.csv` | Seeder produces rows matching `mines` count |
| CR8 | Fix report ID collisions | `reporting/routes.py:167,191` | Change format to `RPT-{TYPE}-{UUID4}` | Rapid POST 10x → all 10 reports have unique IDs |
| CR9 | Implement report download endpoint | `reporting/routes.py:216`, `main.py` | Add `GET /reports/download/{report_id}` → `FileResponse` with auth check | Generate report → download URL → returns PDF with correct `Content-Type` |

#### 5. Performance Improvements
| # | Item | Files | Approach | Verification |
|---|----|-------|----------|------------|
| P1 | Run matplotlib in executor | `charts.py` (all 7 renderers) | Wrap each `render_*` in `loop.run_in_executor(None, _render_sync, ...)` | Load test: 5 concurrent report generations → no request timeout |
| P2 | Lazy-load SHAP explainer | `model_registry.py:70-76`, `cause_analysis.py:11` | Move to `@property` or `get_shap_explainer()` that initializes on first access | Boot time reduced by 2-5s; first `/cause-analysis` works; subsequent fast |
| P3 | Remove eager weather background task | `main.py:62-64`, `weather_service.py` | Delete `weather_background_loop` and task creation | Boot faster; no weather task in logs |
| P4 | Fix `GZipMiddleware` over-compression | `main.py:105` | Add `minimum_size=500`; exclude `/static` | Response headers show `content-encoding: gzip` only for >500 byte JSON |

#### 6. Architecture Improvements
| # | Item | Files | Approach | Verification |
|---|----|-------|----------|------------|
| AR1 | Extract `workspace_service` data to config | `workspace_service.py`, new `data/workspace_config.yaml` | Move 10 mine literals to YAML; `precompute_workspace_data()` reads YAML + merges CSV values | `GET /mines/{id}/workspace` returns identical JSON before/after (diff test) |
| AR3 | Consolidate frontend mine data | `minesData.ts` (canonical); delete `mineProductionData.ts`, `dongriBuzurgData.ts`, `mineIntelligenceData.ts`, `reserveMappingData.ts` | Pick single source; update all imports; fetch rich data from API instead | Search for deleted files → zero results |
| AR4 | Unify `PORTFOLIO_MINES_DATA` | `AdminControlCenter.tsx:148`, `PortfolioView.tsx:53`, new `data/portfolioData.ts` | Move to shared module; both components import from there | Both pages show identical numbers |
| AR5 | Replace fake AI diagnosis | `MineWorkspace.tsx:380-529` | Remove `handleRunDiagnosis` fake `setTimeout`; call real API endpoints | Click "Run Diagnosis" → shows real SHAP contributors + corrective actions |
| AR6 | Add React Router | `package.json` (add `react-router-dom`); `App.tsx` (rewrite routing); `Navbar.tsx` (use `Link`/`NavLink`) | Replace `useState` route with `<BrowserRouter><Routes><Route...>`; add `404` fallback | Browser back/forward works; direct URL to `/workspace/dongri-buzurg` works |
| AR7 | Fix API response contracts | All 12 router files + `apiClient.ts` | Ensure every endpoint returns `Envelope[T]` with `response_model`; update client to handle only Envelope | `apiGet<T>` never returns `undefined`; OpenAPI shows consistent schemas |
| AR8 | Migrate SQLAlchemy to `DeclarativeBase` | `models/base.py` + all model files | Replace `as_declarative` + `declared_attr` with `class Base(DeclarativeBase)` | `alembic check` passes; models import without deprecation warnings |

#### 7. Testing
| # | Item | Files | Approach | Verification |
|---|----|-------|----------|------------|
| T1 | Add pytest fixtures | `tests/conftest.py` | Add: `event_loop`, `async_client` (httpx.ASGITransport), `test_settings`, `mock_registries` | `pytest backend/tests/ -v` collects and runs all tests |
| T2 | Fix `test_routes.py` | `test_routes.py` | Use `async_client` fixture; unindent `test_gemini_interpret_endpoint`; replace tautology assertions; add `client_with_lifespan` fixture | All tests pass in < 30s (with mocks); integration subset passes with real lifespan |
| T3 | Add endpoint coverage | `test_routes.py` (extend); new `test_reporting.py`; new `test_models.py` | Write tests for all 5 model endpoints, all 3 admin endpoints, all 4 reporting endpoints, DB layer | Coverage: `pytest --cov=app --cov-report=term-missing` → >80% on routers, >60% overall |
| T4 | Fix `test_no_silent_fallback.py` | `test_no_silent_fallback.py:24` | Assert exception type + error code, not literal message | Test passes; message change doesn't break it |
| T5 | Remove `test_shutdown.py` from pytest | Rename to `scripts/manual_shutdown_test.py` | | `pytest backend/tests/` doesn't spawn uvicorn |
| T6 | Add CI config | `.github/workflows/ci.yml` (new) | GitHub Actions: lint (ruff), type-check (pyright/mypy), test (pytest), build frontend | Push → CI passes |

#### 8. Cleanup
| # | Item | Files | Approach | Verification |
|---|----|-------|----------|------------|
| CL1 | Delete dead backend code | `audit.py`, `rate_limit.py`, `deps.py`, `data_admin.py:123-135`, `templates/admin_aggregate_report.html`, `model_registry.py:78-82`, `services/weather_service.py`, `api/v1/prospectivity.py:12-15`, `schemas/responses.py:11-19` | Delete each; remove imports | `grep -r "audit\|rate_limit\|set_rls_context\|fetch_admin_aggregate\|get_shap_explainer\|weather_background_loop\|BoreholeIntercept\|ErrorResponse"` → no results |
| CL2 | Delete dead frontend code | `apiClient.ts`, `App.css`, `lib/utils.ts`, `ManganeseHotspotMap.tsx`, `ReserveMappingPage.tsx`, `IndiaMap.tsx`, 15/22 `ui/` components | Delete 21 files; remove from barrel exports | `npm run build` succeeds; no "module not found" errors |
| CL4 | Fix `.gitignore` negations | `.gitignore:49,68-70` | Change line 49 from `data/processed/` → `data/processed/*`; add `!models/*.pkl`, `!models/*.cbm`, `!models/*.json` | `git add data/processed/model1_clf.joblib` works without `-f` |
| CL5 | Remove duplicate prospectivity mount | `router.py:19-20` | Keep only one mount (prefer `/mines`) | OpenAPI shows 3 prospectivity paths, not 6 |
| CL6 | Remove duplicate `package.json` root | Root `package.json` | Delete | Only `frontend/` has package |

---

## 3. Execution Order & Dependencies

```
Week 1 (Critical + Security)
├─ C1, C2, C3, C4  → App runs, builds
├─ S1, S2, S3, S4, S5, S6, S7, S8  → Auth secure

Week 2 (Correctness)
├─ CR1, CR2  → Reports work, DB valid
├─ CR3, CR4  → ML endpoints work
├─ CR5, CR6, CR7, CR8, CR9  → Data integrity

Week 3 (Architecture + Performance)
├─ P1, P2, P3, P4  → Perf
├─ AR1, AR3, AR4, AR5, AR7  → Code quality (AR2, AR6, AR8 are larger, can defer)

Week 4 (Testing + Cleanup)
├─ T1-T6  → Test suite
├─ CL1-CL8  → Hygiene
```

---

## 4. Risk Mitigation

| Risk | Mitigation |
|---|---|
| **CR1/CR2 rewrite breaks reports** | Write integration tests against real Postgres (testcontainers) *before* refactoring; snapshot current (broken) output |
| **AR2/AR6 large frontend refactor** | Do incrementally behind feature flags; extract one tab at a time; keep old component as fallback |
| **S3 mine-scoping breaks existing tokens** | Deploy with token rotation: invalidate all sessions on deploy (change `JWT_SECRET`), force re-login |
| **Migration edit (CR2) on production** | Never edit applied migration; create new revision; test `upgrade` + `downgrade` on staging clone first |
| **Model retrain (CR3) changes predictions** | Keep old model artifact; A/B test new vs old on sample inputs before switching |

---

## 5. Success Criteria (Definition of Done)

1. `uvicorn app.main:app` starts cleanly; `npm run build` succeeds.
2. All 19 API endpoints return `Envelope[T]` with correct auth/scoping.
3. `site_manager` can only access their assigned mine; `admin` sees all; `industry_viewer` only industry dashboard.
4. Report generation: POST → `status=generated` → PDF downloads → renders correctly.
5. `GET /admin/model-governance` shows metrics from `persistence_log.json` (not hardcoded).
6. `pytest backend/tests/` passes in <60s with >80% router coverage.
7. No hardcoded secrets; no auth bypasses; no SQL injection vectors.
8. Frontend: React Router works; no `alert()`; single mine data source; fake AI removed.
9. Repo clean: no dead code, no duplicate files, `.gitignore` effective.

---