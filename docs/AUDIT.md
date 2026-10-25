# ScoutIQ Platform Audit & Gap Analysis

**Date:** 2026-10-25  
**Version:** 1.0.0-phase1  
**Auditor:** Senior Staff Engineer, Data Scientist & Esports Analyst  
**Scope:** Complete codebase audit against the Master Build Prompt (ScoutIQ AI Esports Scouting & Multi-Roster Intelligence Platform).

---

## 1. Executive Summary

The existing repository (previously known as *ScoutGrid / Golden Snitch*) contains a functioning proof-of-concept esports analytics web application with an authenticated FastAPI backend, SQLite database, and React 18 / Vite / Tailwind frontend. It features authentic LAN Excel data ingestion for Valorant, an authentication system with cookie session and Bearer token support, basic player comparison, roster viewing, and 63 passing unit/adversarial backend tests.

However, against the production-grade **ScoutIQ** specification, the codebase requires major structural modernization:
1. **Config-Driven Architecture**: Game roles, metric weights, and definitions are currently hardcoded in Python modules (`catalog.py`, `scoring.py`) rather than versioned YAML config files (`configs/games/*.yaml`).
2. **Data Scale & Schema Granularity**: The current database has ~25 seeded players and basic match telemetry. The spec requires ≥ 600 players across 4 game titles (Valorant, CS2, LoL, Dota 2), ≥ 15,000 maps/games, round-level event logs, plan switches, mid-round adaptation timestamps, comms proxies, and a separate latent `_ground_truth` table.
3. **Metric & Win-Probability Engine**: The current IGL scoring is a simplified composite rather than the required 8-component model (CWD, MRA, ECO, CONV, COORD, LRD, FP, CON) backed by calibrated logistic/LightGBM win-probability models with Brier score tracking.
4. **Differentiation & Intelligence Features**: The counterfactual Monte Carlo match simulator, IGL Decision Replay Lab with WPA, PuLP/OR-Tools budget optimizer, hidden gem detector, and additive head-to-head explanation engine need to be built and integrated.

---

## 2. Current Codebase Structure

```
scoutgrid/
├── backend/
│   ├── app/
│   │   ├── auth.py                  # Token creation, password hashing, session tokens
│   │   ├── auth_routes.py           # Login, register, logout, session verification
│   │   ├── catalog.py               # Hardcoded games & roles catalog
│   │   ├── db.py                    # SQLite connection, DDL table creation, queries
│   │   ├── fit.py                   # Fit calculation (PRD worked example logic)
│   │   ├── main.py                  # Monolithic FastAPI app (endpoints, routes, middleware)
│   │   ├── scoring.py               # Basic role formulas, confidence, percentile ranks
│   │   ├── security.py              # Cryptographic helpers
│   │   ├── seed.py                  # 25 seed players, teams, match telemetry
│   │   ├── models/                  # Pydantic request/response schemas
│   │   └── providers/               # Grid, PandaScore, Riot API mock/stubs
│   ├── tests/
│   │   ├── test_adversarial_qa.py   # Security, IDOR, SQL injection tests (8 tests)
│   │   ├── test_auth_and_notifications.py # Auth lifecycle, rate limits, cookies (8 tests)
│   │   ├── test_engine_and_api.py   # Metric weights, ranking, CSV tests (20 tests)
│   │   ├── test_golden_snitch.py    # PRD worked example, CSV import (9 tests)
│   │   ├── test_lan_data_and_model.py # Real LAN Excel import & calibration (5 tests)
│   │   ├── test_live_data_and_profiles.py # Data sources, orgs, claims (8 tests)
│   │   └── test_production_readiness.py # Health, GDPR, disputes (5 tests)
├── frontend/
│   ├── src/
│   │   ├── auth/                    # AuthContext, ProtectedRoute, deduplicated session checks
│   │   ├── components/              # Layout, Sidebar, Topbar, MetricCards, Modals
│   │   ├── data/mockData.ts         # 800+ lines fallback mock data for offline mode
│   │   ├── pages/                   # Dashboard, Scouting, Database, Compare, Rosters, etc.
│   │   ├── services/                # API client, authService, esportsIntelligenceService
│   │   └── utils/                   # Formatting and client-side scoring logic
├── data/
│   ├── scoutgrid.db                 # SQLite database
│   └── seed_players.csv             # Raw CSV dataset
├── docs/                            # Comprehensive Markdown & PDF architecture docs
├── docker-compose.yml               # Backend + frontend container config
└── run.py                           # Development entrypoint
```

---

## 3. What Works, What is Fake/Hardcoded, and What is Broken

### 3.1 What Works Cleanly (To Preserve & Reuse)
- **Authentication & Authorization**: Argon2id password hashing, cookie session management (`gs_session`), Bearer token support, CSRF mitigation headers, login rate limiting.
- **Frontend Design System**: Dark theme palette (`#0B0B0B`, `#242424`, `#82EAF4`, `#F5B83D`), typography, Lucide icon system, responsive layouts.
- **LAN Excel Ingestion**: Real parser for `Valo_Lan_Stats_10_Matches.xlsx` with statistical calibration.
- **Test Infrastructure**: Pytest suite of 63 tests running in < 8s with zero failures.
- **Static Assets**: Scalable vector logo (`/logo.svg`), hero banners, and favicon.

### 3.2 What is Fake or Hardcoded (To Refactor / Replace)
- **Role & Metric Taxonomies**: Embedded directly in Python code (`catalog.py`, `scoring.py`) with hardcoded weights. Must be moved to versioned YAML configs (`configs/games/<game>.yaml`).
- **Data Scale**: Only 25 players and ~10 LAN matches exist in SQLite. Must be expanded to ≥ 600 players across 4 titles with 15,000+ maps.
- **Candidate Fit Explanation**: Uses static heuristic string templates rather than exact additive decompositions ($\Delta_i = w_i \cdot (A_i - B_i)$).
- **Client Fallback Data**: `frontend/src/data/mockData.ts` contains hardcoded numbers used when backend API is disconnected. In accordance with Section 0 ("No fake outputs"), all data displayed must be computed from the database.
- **Cross-Game Roster Health**: Roster Health Index (RHI) is currently a superficial average rather than the formula: $0.35 \cdot \text{role} + 0.25 \cdot \text{synergy} + 0.20 \cdot \text{trajectory} + 0.10 \cdot \text{depth} + 0.10 \cdot \text{stability}$.

### 3.3 What is Broken or Missing
- **No `configs/` Directory**: Missing versioned game configurations for Valorant, CS2, LoL, and Dota 2.
- **No `simulator/`**: Missing the latent-variable synthetic match and round generator with hidden ground truth.
- **No Calibrated Win-Probability Models**: Missing round-state logistic/LightGBM model with Brier score tracking.
- **Missing Unique Features**: Counterfactual Monte Carlo simulator, IGL Decision Replay Lab, PuLP/OR-Tools Budget Optimizer, Transferability Index, Natural Language Search parser.
- **No Standard `Makefile`**: Missing standardized developer interface (`make dev`, `make test`, `make lint`).

---

## 4. Gap Table Mapping

| Section & Requirement | Status | Existing Implementation State | Action Plan for ScoutIQ |
|---|---|---|---|
| **0. Core Rules & Methodology** | **Partial** | Methodology docs exist in `docs/scouting-methodology.md`; formulas partially documented. | Create `docs/METHODOLOGY.md` & `docs/ASSUMPTIONS.md` covering all 4 titles and exact math. |
| **1. Tech Stack** | **Done** | FastAPI, Pydantic v2, SQLite, React, Vite, Tailwind, Pytest. | Add Polars/pandas, SciPy, scikit-learn, PuLP, PyYAML. |
| **2. Existing Codebase Handling** | **Done** | Audited in this document (`docs/AUDIT.md`). | Produce migration plan; proceed to Phase 1 scaffolding. |
| **3. Config-Driven Titles & Roles** | **Missing** | Hardcoded in `catalog.py` and `scoring.py`. | Build `configs/games/{valorant,cs2,lol,dota2}.yaml` and config loader. |
| **4.1 Data Source Adapters** | **Partial** | CSV importer and mock API providers exist in `backend/app/providers/`. | Formalize `DataSourceAdapter` interface (Simulated, CSV, Official API stubs). |
| **4.2 Core Schema** | **Partial** | Tables for players, teams, matches, recommendations exist. | Expand schema for rounds, round events, plan switches, comms proxies, objective events, ground truth. |
| **4.3 Realistic Simulator** | **Missing** | Only static seeds and Excel parser exist. | Implement `backend/simulator/` with latent variable model (600+ players, 15k+ maps). |
| **5.1 Metric Normalization Pipeline** | **Partial** | Basic percentiles and Bayesian shrinkage implemented. | Implement 5-step pipeline: Per-unit rate, opponent adjustment, role peer percentile, shrinkage, patch resilience. |
| **5.2 IGL Impact Score Model** | **Partial** | Simplified IGL score in `scoring.py`. | Implement the exact 8-component IGL model (CWD, MRA, ECO, CONV, COORD, LRD, FP, CON). |
| **5.3 Other Role Models** | **Partial** | Formulas exist for Duelist, Initiator, Controller, Sentinel. | Expand to CS2, LoL, and Dota 2 role models defined in YAML configs. |
| **5.4 Style Vector** | **Missing** | Basic player attributes exist. | Compute 10-dimensional style vector $[0,1]^d$ for synergy modeling. |
| **5.5 Win-Probability Models** | **Missing** | Basic win rate calculation. | Train calibrated round-state and objective-state logistic models (target Brier < 0.20). |
| **5.6 Risk Flags** | **Partial** | `LOW_SAMPLE`, `PROVISIONAL` exist. | Implement all 9 risk flags (`OPPONENT_INFLATED`, `SYNERGY_DEPENDENT`, `FORM_DECLINE`, `PATCH_FRAGILE`, etc.). |
| **6.1 Candidate Final Score & LB** | **Partial** | PRD fit formula implemented. | Implement $Final = 100 \times [0.45F + 0.25S + 0.10T + 0.10V + 0.10(1-Risk)]$ and $Final_{LB}$. |
| **6.2 Hard Filters** | **Done** | Filters by role, tier, region, price. | Retain and connect to multi-title schema. |
| **6.3 "Why A over B" Engine** | **Partial** | Basic comparative text summary. | Implement exact additive decomposition ($\Delta_i$) and deterministic template generation. |
| **6.4 Roster Need Diagnosis** | **Missing** | Heuristic gap checklist. | Implement percentile deficit analysis against tier benchmarks. |
| **7. Squad Synergy Model** | **Partial** | Role coverage and pair chemistry in `synergy_cache`. | Implement exact 6-term synergy formula and pair-level synergy heatmap. |
| **8. Trajectory & Development** | **Partial** | Basic career stats. | Implement EWMA ($\alpha=0.2$), Theil-Sen slope, Mann-Kendall test, and Roster Health Index (RHI). |
| **9.1 Core UI Features (1–10)** | **Done** | Talent explorer, rankings, comparison, rosters, reports, settings exist in React. | Wire existing React pages to new modular backend APIs. |
| **9.2 Unique Features 1–7** | **Missing** | None of the 7 unique features are fully implemented. | Implement Counterfactual Simulator, IGL Replay Lab, Gem Finder, Hype Detector, Transfer Index, Similar Players, Depth Planner. |
| **9.2 Unique Features 8–14** | **Missing** | None implemented. | Implement Budget Optimizer (PuLP), Meta Sensitivity, Fatigue Monitor, Report Generator, NL Search, Bias Audit, Pipeline Readiness. |
| **10. API Specification** | **Partial** | CRUD endpoints for players, recommendations, teams. | Restructure into modular FastAPI routers (`/rankings`, `/igl`, `/rosters`, `/optimizer`, etc.). |
| **11. Project Structure** | **Partial** | Monolithic `main.py` and `db.py`. | Refactor into modular architecture: `app/{core,models,schemas,services,ml,metrics,synergy,recommend,optimizer,reports}`. |
| **12. Validation & Testing** | **Partial** | 63 tests pass. | Add ground truth recovery test ($\rho \ge 0.75$), trap handling, calibration curve, additive decomposition tests. |
| **13. Documentation** | **Partial** | PRD and architectural docs exist. | Add `METHODOLOGY.md`, `DATA_DICTIONARY.md`, `ASSUMPTIONS.md`, `DEMO_SCRIPT.md`. |

---

## 5. Migration & Refactoring Plan

1. **Non-Destructive Modernization**:
   - Keep the existing working database tables and API endpoints accessible to preserve current UI functionality and pass all 63 existing tests.
   - Introduce the modular structure under `backend/app/` with clean service layers.
2. **Configuration Extraction**:
   - Create `configs/games/{valorant,cs2,lol,dota2}.yaml` specifying roles, weights, metrics, and meta pools.
   - Build a robust `ConfigLoader` with Pydantic validation that loads, validates, and serves config data.
3. **Database Schema Scaffolding**:
   - Expand `backend/app/db.py` to create the complete core schema (`rounds`, `round_events`, `comms_proxy`, `objective_events`, `_ground_truth`, etc.) idempotently.
4. **Developer Tooling & Packaging**:
   - Provide a root `Makefile` supporting cross-platform `make dev`, `make test`, `make lint`, and `make build`.
   - Update `docker-compose.yml` to support multi-service orchestration.
5. **Phase-by-Phase Progression**:
   - Proceed sequentially through Section 14 (Phases 1 through 9).
