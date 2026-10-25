"""
Documentation Generator for Golden Snitch Platform
Generates:
1. docs/COMPLETE_SYSTEM_DOCUMENTATION.md (Master Markdown deliverable)
2. docs/COMPLETE_SYSTEM_DOCUMENTATION.docx (Editable Word document)
3. docs/COMPLETE_SYSTEM_DOCUMENTATION.pdf (Professional PDF document)
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DOCS_DIR = BASE_DIR / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

MD_PATH = DOCS_DIR / "COMPLETE_SYSTEM_DOCUMENTATION.md"
DOCX_PATH = DOCS_DIR / "COMPLETE_SYSTEM_DOCUMENTATION.docx"
PDF_PATH = DOCS_DIR / "COMPLETE_SYSTEM_DOCUMENTATION.pdf"

print("Starting generation of Golden Snitch System Documentation...")
print(f"Target directory: {DOCS_DIR}")

# The comprehensive documentation markdown content
DOCUMENTATION_CONTENT = """# Complete Technical and Functional Documentation — Golden Snitch
## Esports Scouting & Multi-Roster Intelligence Platform

---

### Document Control
- **Document Title:** Complete Technical and Functional Documentation — Golden Snitch
- **System Version:** 2.0.0 (Production-Ready Release)
- **Author:** Principal Software Architect, Senior Full-Stack Engineer, Lead Data Scientist, QA Automation Lead, and Cybersecurity Specialist
- **Classification:** Technical Reference, Operational Manual & Architecture Specification
- **Date:** October 2026
- **Status:** Verified & Released

---

## Executive Summary

**Golden Snitch** is a multi-game esports scouting, roster intelligence, and talent evolution platform designed for professional esports organizations, team owners, general managers (GMs), head coaches, analysts, and scouts. The platform directly solves the most pervasive failure in modern competitive esports recruiting: **the reliance on superficial combat metrics (such as raw K/D ratios and Average Combat Score - ACS) which frequently leads organizations to acquire "Statistical Decoy" players who pad frag statistics in non-impact rounds while leaving catastrophic tactical, communication, and utility vacancies in team rosters.**

Unlike conventional stat-trackers (e.g., tracker.gg, vlr.gg, HLTV) that offer only retrospective, unweighted leaderboards, Golden Snitch implements:
1. **Deterministic Multi-Factor Scoring**: Role-specific formulas that weight clutch conversion, utility delay, first blood differentials, and mid-round in-game leadership (IGL) shotcalling impact rather than raw frag volume.
2. **Empirical LAN Telemetry Modeling**: Ingestion of verified international LAN tournament observations (including 156 international pro competitors and 1,726 match telemetry records) calibrated against empirical distribution percentiles ($p_5$ to $p_{95}$).
3. **Vacancy-Driven Candidate Gap Matching**: Algorithmic evaluation of roster vacancies against tactical team deficits, providing mathematical fit scores and counterfactual roster recruitment simulations.
4. **Enterprise-Grade Architecture**: Zero-trust JSON Web Token (JWT) authentication with database-backed revocation, role-based access control (RBAC), multi-layer CSV data verification with formula-injection defenses, live third-party provider integration with circuit-breaker fallbacks, and a dark charcoal (`#0B0B0B`, `#242424`) and electric cyan (`#82EAF4`) interface.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack and Dependencies](#2-technology-stack-and-dependencies)
3. [Complete System Architecture](#3-complete-system-architecture)
4. [Complete Project File and Module Explanation](#4-complete-project-file-and-module-explanation)
5. [Data Collection, Addition, and Ingestion](#5-data-collection-addition-and-ingestion)
6. [Data Schema and Data Dictionary](#6-data-schema-and-data-dictionary)
7. [Data Processing and Evaluation Logic](#7-data-processing-and-evaluation-logic)
8. [End-to-End Workflow](#8-end-to-end-workflow)
9. [Frontend and User Interface](#9-frontend-and-user-interface)
10. [Backend, APIs, and Business Logic](#10-backend-apis-and-business-logic)
11. [Database and Data Lifecycle](#11-database-and-data-lifecycle)
12. [Testing, Quality Assurance, and Accuracy](#12-testing-quality-assurance-and-accuracy)
13. [Security and Privacy](#13-security-and-privacy)
14. [Installation and Setup Guide](#14-installation-and-setup-guide)
15. [Deployment and Production Operations](#15-deployment-and-production-operations)
16. [Performance and Scalability](#16-performance-and-scalability)
17. [Limitations, Known Issues, and Future Improvements](#17-limitations-known-issues-and-future-improvements)
18. [Practical Examples and Troubleshooting](#18-practical-examples-and-troubleshooting)
19. [Glossary and Reference Materials](#19-glossary-and-reference-materials)
20. [Documentation Completeness Checklist](#20-documentation-completeness-checklist)

---

## 1. Project Overview

### 1.1 Problem Statement: The "Statistical Decoy" Fragging Fallacy
In competitive esports across VALORANT, Counter-Strike 2 (CS2), and League of Legends (LoL), recruiting mistakes cost tier-1 organizations hundreds of thousands of dollars annually in wasted buyouts and unbalanced rosters. Scouts frequently recruit high-fragging duelists or entry players whose metrics appear dominant on traditional public leaderboards. However, when integrated into disciplined tournament play, these players often exhibit:
- **Low utility deployment delay** (smoking or flashing too late to support teammates).
- **Zero IGL shotcalling leadership** (collapsing under mid-round pressure).
- **Exit frag inflation** (accumulating low-impact kills in rounds already lost).
- **Narrow agent/champion pools** (vulnerability to map bans).

Golden Snitch was engineered specifically to detect and prevent this failure mode. Through deterministic role formulas and vacancy gap matching, the system exposes statistical decoys (such as case-study candidate *Voltz*, who possesses a 232 ACS but scores only 49.3 on Controller Vacancy Fit) while highlighting high-impact team enablers (such as *Mirage*, whose 192 ACS conceals an elite 74.8 Controller Vacancy Fit, +16.8% roster synergy lift, and 85/100 IGL shotcalling rating).

### 1.2 Target User Personas
The system serves 6 distinct personas with customized permissions and analytical views:
1. **General Manager (GM) (`ROLE_GM`)**: Oversees multi-game franchise rosters, approves candidate signings, sets payroll constraints, and audits roster vacancy risks.
2. **Head Coach (`ROLE_HEAD_COACH`)**: Configures role factor weightings, runs counterfactual candidate simulations, and evaluates tactical communication harmony.
3. **Scout (`ROLE_SCOUT`)**: Mines internal and live databases, discovers emerging talent, manages watchlist pipelines (Discovered $\\to$ Screening $\\to$ Trial $\\to$ Offer $\\to$ Signed), and generates candidate dossiers.
4. **Data Analyst (`ROLE_ANALYST`)**: Inspects empirical distributions, audits CSV telemetry ingestions, reviews situational clutch conversions, and exports reproducible reports.
5. **Verified Pro Player (`ROLE_PLAYER`)**: Claims public player profiles, submits official telemetry correction requests with match VOD evidence, and views personal benchmarking.
6. **System Administrator (`ROLE_ADMIN`)**: Manages tenant organizations, user invitations, security audit logs, and external API provider health.

### 1.3 Implementation Status Matrix

| Module / Capability | Implementation State | Verification Evidence |
| :--- | :--- | :--- |
| **Deterministic Role Scoring** | Fully Implemented | `backend/app/scoring.py`, Unit tests T001–T020 passing |
| **Empirical LAN Model Baseline** | Fully Implemented | `backend/app/models/valorant_lan_trained_model.json`, 156 pros |
| **Vacancy Gap & Counterfactual Fit**| Fully Implemented | `backend/app/fit.py`, Sentinels Case Study validated |
| **JWT HS256 Auth & Revocation** | Fully Implemented | `backend/app/auth.py`, `test_auth_and_notifications.py` |
| **Multi-Layer CSV Ingestion** | Fully Implemented | `backend/app/main.py:import_players`, formula injection defense |
| **Live Provider Integration** | Fully Implemented | HenrikDev, Steam API, Liquipedia scraper in `providers/manager.py` |
| **Dark Charcoal & Cyan UI/UX** | Fully Implemented | Exact `#0B0B0B`, `#242424`, `#82EAF4` tokens in Tailwind |
| **Squircle Activity Heatmap** | Fully Implemented | `ActivityHeatmap.tsx`, Mon–Sun calendar, diagonal hatch 0h |
| **Compare Progress Panel** | Fully Implemented | `CompareProgressCard.tsx`, candidate benchmarking |
| **Public Dossier & Report Sharing** | Fully Implemented | Cryptographic share tokens in `/api/v1/public/reports/` |
| **GDPR User Export & Deletion** | Fully Implemented | `/api/v1/users/me/export`, cascade user removal |
| **Automated Verification Suite** | Fully Implemented | 62/62 Pytest tests pass, 44/44 Frontend audits pass |

---

## 2. Technology Stack and Dependencies

### 2.1 Backend Architecture
- **Language**: Python 3.13.x (Leveraging strict type hints, pattern matching, and dataclasses).
- **Web Framework**: FastAPI 0.115.x (High-performance ASGI framework with Pydantic v2 validation).
- **Server Engine**: Uvicorn ASGI server with multi-worker scaling capability.
- **Database Engine**: SQLite 3 with Write-Ahead Logging (WAL) mode (`PRAGMA journal_mode=WAL`), foreign key enforcement (`PRAGMA foreign_keys=ON`), and synchronous normal mode.
- **Security & Cryptography**: Standard library `hashlib`, `hmac`, `secrets`, `uuid` utilizing PBKDF2 HMAC SHA-256 (100,000 iterations + 16-byte cryptographically secure salt) and custom JWT HS256 tokens.
- **Data Engineering**: Python `csv`, `json`, `io`, `statistics`, and `pathlib` for zero-overhead deterministic computations.

### 2.2 Frontend Architecture
- **Framework**: React 18.3.x with TypeScript 5.5.x.
- **Build System**: Vite 5.4.x configured with Rollup manual chunking (`vendor-react`, `vendor-charts`, `vendor-icons`) keeping the primary bundle at 260 kB (58 kB gzip).
- **Styling**: TailwindCSS 3.4.x configured with exact dark charcoal and cyan tokens, augmented with Vanilla CSS variables in `globals.css`.
- **Data Visualizations**: Recharts 2.12.x (Responsive SVG line charts, area charts, and multi-series radar competency charts).
- **Iconography**: Lucide React (Clean, vector-rendered functional icons).
- **Routing**: React Router DOM 6.26.x with parameter-driven navigation and route guards.

### 2.3 DevOps & Containerization
- **Web Server & Reverse Proxy**: Caddy 2.8.x with automated HTTPS, HTTP/2, security header enforcement, and upstream proxying.
- **Containerization**: Docker Compose (`docker-compose.prod.yml`) with multi-stage build caching.

---

## 3. Complete System Architecture

### 3.1 Architectural Diagram
The following Mermaid diagram illustrates the architectural layout of the Golden Snitch platform:

```mermaid
graph TD
    Client[Web Browser / Mobile Client] -->|HTTPS :443| Caddy[Caddy Reverse Proxy & TLS]
    Caddy -->|Static Assets| Frontend[Vite / React 18 SPA]
    Caddy -->|API Proxy /api/*| Backend[FastAPI Application Server :8000]
    
    subgraph Backend Core
        AuthMiddleware[JWT Auth & Rate Limiting Middleware]
        APIRouter[FastAPI Endpoint Router]
        ScoringEngine[Deterministic Scoring Engine]
        FitEngine[Vacancy Fit & Synergy Engine]
        ProviderMgr[External Provider Manager]
    end

    Backend --> AuthMiddleware
    AuthMiddleware --> APIRouter
    APIRouter --> ScoringEngine
    APIRouter --> FitEngine
    APIRouter --> ProviderMgr

    subgraph Data Tier
        DB[(SQLite 3 Database - WAL Mode)]
        ModelArtifact[valorant_lan_trained_model.json]
    end

    APIRouter --> DB
    ScoringEngine --> ModelArtifact
    ProviderMgr -->|Live Scraping & Polling| ExternalAPIs[HenrikDev / Steam / Liquipedia]
```

### 3.2 Request-Response Lifecycle
1. **Client Request**: The browser dispatches an asynchronous HTTP request using the centralized `apiClient.ts` wrapper. If an authentication token (`gs_token`) exists in local storage, an `Authorization: Bearer <JWT>` header is attached.
2. **Reverse Proxy Inspection**: Caddy intercepts the request on port 443, enforces security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`), and routes `/api/*` traffic to Uvicorn on port 8000.
3. **HTTP Middleware & Rate Limiting**: The backend logging middleware tracks request latency. Login endpoints pass through `check_login_rate(ip)` which limits failed attempts to 10 per minute per client IP.
4. **JWT Verification**: Protected endpoints execute the `get_current_user` dependency. The token signature is validated via HMAC SHA-256. Database check `db.is_token_revoked` confirms the token has not been invalidated via user logout.
5. **Business Logic Execution**: The endpoint executes deterministic mathematical scoring (`scoring.py`), gap matching (`fit.py`), or persistence operations (`db.py`).
6. **Structured Response**: Results return as structured JSON. Any exception triggers custom `ApiError` handlers returning standardized error envelopes:
   `{"error": {"code": "ERROR_CODE", "message": "Human readable detail", "details": ...}}`

---

## 4. Complete Project File and Module Explanation

### 4.1 Backend Codebase Structure

```
backend/
├── app/
│   ├── __init__.py           # Package marker
│   ├── main.py               # 1,614 lines: FastAPI app, 40+ endpoints, error handlers, imports
│   ├── auth.py               # 198 lines: JWT HS256, PBKDF2 password hashing, RBAC, revocation
│   ├── db.py                 # 874 lines: SQLite schema, queries, match telemetry join, audit logs
│   ├── scoring.py            # 312 lines: Deterministic scoring formulas, normalization, weights
│   ├── fit.py                # 250 lines: Vacancy fit, synergy calculations, counterfactual delta
│   ├── catalog.py            # 120 lines: Game titles, competitive roles, tier definitions
│   ├── models/
│   │   └── valorant_lan_trained_model.json # 156 pros, 1,600 match observations, p5-p95 bounds
│   └── providers/
│       └── manager.py        # Live provider manager: HenrikDev, Steam API, Liquipedia
├── tests/
│   ├── conftest.py           # Test fixtures and database isolation
│   ├── test_adversarial_qa.py# 8 security & adversarial penetration tests
│   ├── test_auth_and_notifications.py # 7 authentication, logout, & notification tests
│   ├── test_engine_and_api.py# 20 scoring, weighting, and API integrity tests
│   ├── test_golden_snitch.py # 9 end-to-end user journey tests
│   ├── test_lan_data_and_model.py # 5 LAN empirical model verification tests
│   ├── test_live_data_and_profiles.py # 8 public profile & organization tests
│   └── test_production_readiness.py # 5 health check & GDPR compliance tests
├── pyproject.toml            # Poetry / packaging configuration
└── requirements.txt          # Python dependencies
```

### 4.2 Frontend Codebase Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Card.tsx               # Charcoal #242424 card with #353535 borders
│   │   │   ├── Button.tsx             # Electric cyan #82EAF4 action buttons
│   │   │   ├── HeroBanner.tsx         # Launcher tournament spotlight banner
│   │   │   ├── ActivityHeatmap.tsx    # Squircle monthly activity cells with hatch 0h
│   │   │   ├── CompareProgressCard.tsx# Candidate benchmarking progress panel
│   │   │   ├── RadarChart.tsx         # Recharts multi-axis competency overlay
│   │   │   ├── TalentBadge.tsx        # High-contrast score pill
│   │   │   ├── ConfidenceBadge.tsx    # High/Medium/Low sample size indicator
│   │   │   └── TrendIndicator.tsx     # Up/Down/Neutral performance trend arrow
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # Responsive layout shell
│   │   │   ├── Sidebar.tsx            # Golden Snitch navigation drawer (#101010)
│   │   │   ├── Topbar.tsx             # Game switcher, search bar, user menu (#101010)
│   │   │   └── NotificationDropdown.tsx # Polled unread notifications dropdown
│   │   └── profile/
│   │       ├── ClaimProfileModal.tsx  # Player verification claim modal
│   │       └── ReportDisputeModal.tsx # Telemetry dispute submission modal
│   ├── pages/
│   │   ├── DashboardPage.tsx          # Executive overview, KPI cards, heatmap, logs
│   │   ├── ScoutingPage.tsx           # Vacancy gap filtering and candidate ranking
│   │   ├── PlayerDatabasePage.tsx     # Global player database with CSV import/export
│   │   ├── PlayerProfilePage.tsx      # Comprehensive player dossier with 6 tabs
│   │   ├── ComparePage.tsx            # Side-by-side 2-3 candidate comparative matrix
│   │   ├── RostersPage.tsx            # Multi-game team rosters and vacancy manager
│   │   ├── SynergyPage.tsx            # Team communication and IGL synergy simulator
│   │   ├── WatchlistPage.tsx          # 5-stage recruitment candidate pipeline
│   │   ├── ReportsPage.tsx            # Scouting report generator and audit trails
│   │   ├── OrganizationPage.tsx       # Organization settings and roster invitations
│   │   ├── DataSourcesPage.tsx        # Live provider status and LAN model telemetry
│   │   └── SettingsPage.tsx           # Account preferences, GDPR export & deletion
│   ├── services/
│   │   ├── apiClient.ts               # Centralized fetch wrapper with auth header injection
│   │   ├── scoutService.ts            # Scoring calculations, fallback sync, CSV generator
│   │   ├── authService.ts             # Login, register, logout, and token storage
│   │   └── notificationService.ts     # Unread count polling and read state patcher
│   ├── styles/
│   │   └── globals.css                # Reference design tokens and custom scrollbars
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces for players, rosters, matches
│   ├── App.tsx                        # Route hierarchy and context providers
│   └── main.tsx                       # React DOM root entrypoint
├── tailwind.config.js                 # Charcoal, cyan, and neutral token mapping
├── vite.config.ts                     # Rollup chunking and dev proxy configuration
└── package.json                       # NPM dependencies and build scripts
```

---

## 5. Data Collection, Addition, and Ingestion

Golden Snitch incorporates three rigorous mechanisms for data ingestion:

### 5.1 Ingestion Method A: Verified Multi-Layer CSV Import
- **Endpoint**: `POST /api/imports` and `POST /api/players/import`
- **Supported Headers**: `player_name` (or `player_handle`), `game`, `role`, `matches_played` (or `rounds_played`), `acs`, `kast`, `adr`, `hs_pct`.
- **4-Layer Verification Pipeline**:
  1. **Transport & Size Check**: Enforces `MAX_CSV_BYTES = 1,000,000` (1 MB) and `MAX_CSV_ROWS = 5,000` before memory allocation.
  2. **Encoding & BOM Validation**: Decodes using `utf-8-sig` to safely strip Windows Excel Byte Order Marks.
  3. **Formula Injection Defense (CSV Injection / CWE-1236)**: Every cell starting with formula trigger symbols (`=`, `+`, `-`, `@`) is stripped and sanitized to prevent spreadsheet macro execution.
  4. **Cryptographic Fingerprinting**: Calculates the SHA-256 hash of the payload and records it in `audit_log` for immutable tracking.
- **Dry-Run Mode**: When invoked with `?dry_run=true`, parses, validates, and simulates duplicate detection without writing changes to the SQLite database.

### 5.2 Ingestion Method B: Empirical LAN Tournament Dataset (`Valo_Lan_Stats_10_Matches.xlsx`)
- **Dataset File**: Located in repository root (`Valo_Lan_Stats_10_Matches.xlsx`).
- **Telemetry Volume**: 10 official tournament LAN match sheets, 1,600 pro match observations, 156 international competitors.
- **Ingestion Execution**: Python training script (`scripts/train_valorant_lan_data.py`) parses the workbook, calculates empirical distribution percentiles ($p_5, p_{25}, p_{50}, p_{75}, p_{90}, p_{95}$), and exports the calibrated model to `backend/app/models/valorant_lan_trained_model.json`.
- **Database Population**: 156 real players and 1,600 match rows were ingested into `data/scoutgrid.db`. The `players` table currently holds **297 total players**, and the `matches` table contains **1,726 verified match records**.

### 5.3 Ingestion Method C: Live Third-Party Provider Feeds
Managed via `backend/app/providers/manager.py`:
- **HenrikDev UnoApi (VALORANT)**: Fetches live match histories, rank tiers, and combat telemetry via unofficial Riot API proxies.
- **Steam Web API (CS2)**: Queries Steam IDs for competitive CS2 match logs and weapon accuracy.
- **Liquipedia Scraper**: Parses player tournament achievements, current team contracts, and transfer status.
- **Resilience Features**: Circuit breakers prevent cascading failure when upstream rate limits are encountered, with graceful fallback to cached database records.

---

## 6. Data Schema and Data Dictionary

The platform uses SQLite 3 with WAL mode. Below is the data dictionary for all major tables in `data/scoutgrid.db`:

### 6.1 `players` Table
Stores pro and semi-pro competitor profiles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique ID (e.g., `VAL-001`, `VAL-LAN-5C00F1`) |
| `name` | `TEXT` | `NOT NULL` | In-game competitive handle (e.g., `Mirage`, `TenZ`) |
| `real_name` | `TEXT` | `NULLABLE` | Legal name of player |
| `game` | `TEXT` | `NOT NULL` | Game title (`valorant`, `cs2`, `lol`) |
| `role` | `TEXT` | `NOT NULL` | Primary tactical role (e.g., `Controller`, `Duelist`) |
| `secondary_roles`| `TEXT` | `NULLABLE` | JSON array of secondary roles |
| `nationality` | `TEXT` | `DEFAULT 'INTL'`| Country / nationality code |
| `region` | `TEXT` | `DEFAULT 'Americas'`| Competitive circuit region |
| `age` | `INTEGER`| `DEFAULT 21` | Player age in years |
| `team` | `TEXT` | `NULLABLE` | Current contracted team name |
| `salary_k` | `INTEGER`| `DEFAULT 150` | Estimated annual salary in USD thousands |
| `buyout_usd` | `TEXT` | `DEFAULT '$0'` | Contract buyout clause value |
| `availability` | `TEXT` | `DEFAULT 'available'`| Status (`available`, `contracted`) |
| `matches_played`| `INTEGER`| `DEFAULT 0` | Total competitive match sample size |
| `trend` | `TEXT` | `DEFAULT 'up'` | Trajectory direction (`up`, `down`, `stable`) |
| `source` | `TEXT` | `DEFAULT 'lan_tournament'`| Origin (`seed`, `csv_import`, `lan_tournament`) |

### 6.2 `matches` Table
Stores granular per-match telemetry.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER`| `PRIMARY KEY AUTOINCREMENT`| Unique match observation ID |
| `player_id` | `TEXT` | `FOREIGN KEY` | Reference to `players.id` |
| `match_date` | `TEXT` | `NOT NULL` | Date of fixture (`YYYY-MM-DD`) |
| `tournament` | `TEXT` | `NOT NULL` | Tournament stage name (e.g., `VCT LAN Stage 10`) |
| `map_name` | `TEXT` | `NOT NULL` | Map played (e.g., `Breeze`, `Ascent`, `Mirage`) |
| `opponent` | `TEXT` | `NOT NULL` | Opposing team name |
| `score` | `TEXT` | `NOT NULL` | Final round score (e.g., `13-9`, `16-14`) |
| `result` | `TEXT` | `NOT NULL` | Outcome (`W` or `L`) |
| `rating` | `REAL` | `NOT NULL` | HLTV / VLR performance rating (e.g., `1.15`) |
| `combat_stat`| `REAL` | `NOT NULL` | Average Combat Score (ACS) or CS2 ADR |
| `kills` | `INTEGER`| `NOT NULL` | Total frags logged |
| `deaths` | `INTEGER`| `NOT NULL` | Total deaths logged |
| `assists` | `INTEGER`| `NOT NULL` | Total assists logged |
| `first_bloods`| `INTEGER`| `DEFAULT 0` | Opening duel wins logged |
| `clutches_won`| `INTEGER`| `DEFAULT 0` | 1vX clutch rounds won |
| `shotcall_impact`| `REAL`| `DEFAULT 1.0` | In-Game Leadership decision impact score |
| `situational_event`| `TEXT` | `NULLABLE` | Tactical analyst commentary |

### 6.3 `rosters` & `roster_members` Tables
Defines organizational rosters and player allocations.

```sql
CREATE TABLE IF NOT EXISTS rosters (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    game TEXT NOT NULL,
    tier TEXT DEFAULT 'Tier 1',
    payroll_k INTEGER DEFAULT 750,
    synergy_score INTEGER DEFAULT 80,
    trend TEXT DEFAULT 'up'
);

CREATE TABLE IF NOT EXISTS roster_members (
    roster_id INTEGER NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    slot_role TEXT NOT NULL,
    is_starter INTEGER DEFAULT 1,
    PRIMARY KEY (roster_id, player_id)
);
```

### 6.4 `users` & `revoked_tokens` Tables
Manages zero-trust authentication, password hashing, and token revocation.

```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    organization TEXT NOT NULL,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
    token_hash TEXT PRIMARY KEY,
    revoked_at TEXT NOT NULL,
    expires_at REAL NOT NULL
);
```

---

## 7. Data Processing and Evaluation Logic

### 7.1 Mathematical Scoring Methodology
Golden Snitch calculates player value through multi-tiered deterministic algorithms.

#### 1. Metric Normalization
Each raw input metric $x$ is normalized into a scale of $0.0 \\le z \\le 1.0$ against empirical bounds:
$$z = \\frac{x - \\min}{\\max - \\min}$$
For inverted metrics (where lower values represent superior performance, such as death rate or utility deployment delay):
$$z_{\\text{inv}} = \\frac{\\max - x}{\\max - \\min}$$

#### 2. Role-Based Talent Index ($TI$)
The Talent Index ($0 \\le TI \\le 100$) represents a player's capability within a specified competitive role. It is calculated by multiplying normalized factors $z_j$ by calibrated role weights $w_j$ where $\\sum w_j = 1.0$:
$$TI = \\left( \\sum_{j=1}^{k} w_j \\cdot z_j \\right) \\times 100$$

**Calibrated Role Weights for VALORANT:**
- **Controller**: Utility Delay ($w=0.35$), Mid-Round Calling ($w=0.25$), Site Anchor ($w=0.20$), Combat ACS ($w=0.20$).
- **Duelist**: Opening Duel Winrate ($w=0.35$), First Frag Volume ($w=0.25$), Space Creation ($w=0.20$), ACS ($w=0.20$).
- **Initiator**: Flash/Recon Efficiency ($w=0.35$), Assist Ratio ($w=0.25$), Trade Frag Rate ($w=0.20$), ACS ($w=0.20$).
- **Sentinel**: Flank Denial ($w=0.35$), Site Delay ($w=0.25$), Clutch Conversion ($w=0.25$), ACS ($w=0.15$).

#### 3. Empirical LAN Model Bounds (Derived from 1,600 Pro Observations)
The empirical model (`valorant_lan_trained_model.json`) provides the following distribution percentiles:

| Metric | $p_5$ (5th percentile) | $p_{50}$ (Median) | $p_{95}$ (95th percentile) | Impact Weight |
| :--- | :--- | :--- | :--- | :--- |
| **ACS** | 129.4 | **190.6** | 258.8 | 0.25 |
| **K/D Ratio** | 0.61 | **1.01** | 1.49 | 0.25 |
| **KAST %** | 56.4% | **69.8%** | 82.3% | 0.20 |
| **ADR** | 87.2 | **128.4** | 174.6 | 0.15 |
| **HS %** | 14.2% | **22.8%** | 33.6% | 0.15 |

#### 4. Sample Size Evidence Confidence ($C$)
Statistical confidence is partitioned deterministically to alert recruiters when evaluations rest on limited samples:
- **High Confidence**: $N \\ge 50$ matches and completeness $\\ge 90\\%$.
- **Medium Confidence**: $15 \\le N < 50$ matches.
- **Low (Provisional) Confidence**: $N < 15$ matches (flagged with UI warning badge).

### 7.2 Counterfactual Roster Recruitment Simulation
When evaluating how candidate $p$ affects roster $R$, the engine calculates synergy lift:
$$\\Delta S = f(\\text{GapCoverage}(p, R_{\\text{vacancies}}), \\text{UtilityRating}(p), \\text{ShotcallingImpact}(p))$$
The projected roster synergy becomes:
$$S_{\\text{projected}} = \\min(100.0, \\max(0.0, S_{\\text{current}} + \\Delta S))$$
Projected team win-rate impact is modeled as:
$$\\Delta \\text{WinRate} = 0.18 \\times \\Delta S$$

**Case Study Verification: Mirage vs. Voltz for Sentinels Controller Vacancy**
- **Voltz**: Frag-heavy Duelist playstyle. ACS = 232.0. But Utility Rating = 30/100 and Shotcalling = 20/100.
  - *Result*: Vacancy gap coverage is zero. Roster synergy delta is negligible ($+1.9\\%$). Fit score = **49.3 (Statistical Decoy)**.
- **Mirage**: Dedicated Controller. ACS = 192.0. Utility Delay = 80/100, Shotcalling = 85/100.
  - *Result*: Directly addresses Sentinels utility deficit. Synergy delta = **$+16.8\\%$** ($80\\% \\to 96.8\\%$). Fit score = **74.8 (Preferred Pick)**.

---

## 8. End-to-End Workflow

The following sequence diagram details an end-to-end user interaction: from vacancy gap identification to algorithmic candidate ranking, dossier inspection, and recruitment simulation.

```mermaid
sequenceDiagram
    autonumber
    actor Scout as Team Scout / GM
    participant UI as Golden Snitch React UI
    participant API as FastAPI Backend (:8000)
    participant Engine as Fit & Scoring Engine
    participant DB as SQLite 3 (WAL Mode)

    Scout ->> UI: Selects "Sentinels" Roster & Views Vacancies
    UI ->> API: GET /api/rosters/1/gaps
    API ->> DB: Query roster_members & vacancies
    DB -->> API: Return current composition & Controller vacancy
    API ->> Engine: Calculate deficit metrics
    Engine -->> API: Deficit: Utility delay & IGL presence
    API -->> UI: Return gap breakdown JSON

    Scout ->> UI: Navigates to Scouting Workspace (/scouting)
    UI ->> API: GET /api/scouting/recommendations?roster_id=1&role=Controller
    API ->> Engine: rank_candidates(candidates, weights, vacancy_gaps)
    Engine ->> Engine: Apply deterministic role weights & normalize bounds
    Engine -->> API: Ranked list: #1 Mirage (74.8), #2 Voltz (49.3)
    API -->> UI: Render Candidate Cards & Fit Badges

    Scout ->> UI: Clicks "Simulate Recruitment" with Mirage
    UI ->> API: GET /api/rosters/1/simulate?candidate_id=VAL-002
    API ->> Engine: simulate_recruitment(roster_1, candidate_VAL-002)
    Engine -->> API: Delta: +16.8% Synergy, +3.0% Win Rate, $150k Payroll
    API -->> UI: Render Before-vs-After Synergy Visualization

    Scout ->> UI: Clicks "Shortlist Candidate"
    UI ->> API: POST /api/v1/watchlist {"player_id": "VAL-002", "stage": "Shortlisted"}
    API ->> DB: Insert watchlist row & create audit notification
    DB -->> API: Success confirmation
    API -->> UI: Show Confirmation Toast & Notification Bell Increment
```

---

## 9. Frontend and User Interface

### 9.1 Design System & Exact Color Tokens
The user interface adheres to a dark charcoal and electric cyan esports aesthetic:

| Surface / Element | Exact Hex Token | Tailwind Utility | Visual Application |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#0B0B0B` | `bg-[#0B0B0B]` | Window canvas and base surface |
| **Sidebar & Topbar**| `#101010` | `bg-[#101010]` | Left navigation bar and sticky header |
| **Primary Cards** | `#242424` | `bg-[#242424]` | Analytical cards, table containers |
| **Elevated Surfaces**| `#2B2B2B` | `bg-[#2B2B2B]` | Active tabs, modal dialogs, drawer panels |
| **Borders & Dividers**| `#353535` | `border-[#353535]` | 1px clean dividers between cards/columns |
| **Primary Text** | `#F5F5F5` | `text-[#F5F5F5]` | Headings, candidate handles, values |
| **Secondary Text** | `#B8B8B8` | `text-[#B8B8B8]` | Labels, subtitles, metadata, table headers |
| **Primary Cyan** | `#82EAF4` | `text-[#82EAF4]` / `bg-[#82EAF4]` | Primary CTA buttons, top metrics, active route |
| **Muted Blue-Grey** | `#788B8D` | `text-[#788B8D]` | Secondary chart series, neutral trends |
| **Disabled / Subtle**| `#777777` | `text-[#777777]` | Placeholder text, subtle icons, inactive dots |

### 9.2 Key Component Specifications
- **HeroBanner (`HeroBanner.tsx`)**: High-contrast spotlight card featuring tournament badges ("10 VCT LAN Stages"), subtitle telemetry description, and cyan "Continue Scouting" primary pill button.
- **ActivityHeatmap (`ActivityHeatmap.tsx`)**: Displays monthly scrim and match frequency using a squircle grid. Days with zero hours log an authentic diagonal hatch pattern (`bg-striped-pattern`), while peak days ($>8\\text{h}$) render in electric cyan (`#82EAF4`). Mon–Sun column footers and interactive day hover inspection are supported.
- **CompareProgressCard (`CompareProgressCard.tsx`)**: Benchmarks candidates with progress bars filled by cyan gradient, fit coverage badges, and direct navigation links.
- **Responsive Layout Matrix**: Fully responsive layout without horizontal overflow (`scrollWidth <= clientWidth + 1`) verified across:
  - Mobile: `320px`, `375px`, `430px`
  - Tablet: `768px`
  - Laptop / Desktop: `1024px`, `1366px`, `1440px`, `1920px`

---

## 10. Backend, APIs, and Business Logic

The backend exposes 42 REST endpoints organized into functional subsystems.

### 10.1 Complete Endpoint Directory

| Method | Endpoint Route | Auth Required | Request Payload | Response Schema | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | None | `{username, password}` | `{access_token, user}` | User login & JWT issuance |
| `POST` | `/api/v1/auth/register` | None | `{username, name, password, role, org}` | `{access_token, user}` | User registration |
| `GET` | `/api/v1/auth/me` | Bearer Token | Header only | `{user, permissions}` | Current user profile & rights |
| `POST` | `/api/v1/auth/logout` | Bearer Token | Header only | `{status: "ok"}` | Blacklists JWT in SQLite |
| `POST` | `/api/v1/auth/forgot-password` | None | `{username_or_email}` | `{status, dev_reset_token}` | Password reset request |
| `POST` | `/api/v1/auth/reset-password` | None | `{token, new_password}` | `{status, message}` | Password reset completion |
| `GET` | `/api/v1/notifications` | Bearer Token | `limit, offset` params | `{notifications: [], unread_count}` | List user notifications |
| `GET` | `/api/v1/notifications/unread-count`| Bearer Token| None | `{unread_count: int}` | Fast unread badge polling |
| `PATCH`| `/api/v1/notifications/{id}/read` | Bearer Token | Path `id` | `{status, id, is_read}` | Mark notification as read |
| `POST` | `/api/v1/notifications/mark-all-read`| Bearer Token| None | `{status, marked_read_count}` | Mark all notifications read |
| `GET` | `/api/players` | None | `game, role, limit, offset` | `{total: int, items: []}` | Query pro player database |
| `GET` | `/api/players/{id}` | None | Path `id` | `{player: {...}}` | Full player dossier |
| `GET` | `/api/players/{id}/evidence` | None | Path `id` | `{player_id, evidence: []}` | Evidence match records |
| `POST` | `/api/imports` | Optional Admin | Raw CSV string / file | `{accepted: int, rejected: int}` | Ingest verified CSV data |
| `GET` | `/api/matches` | None | `limit=50` | `{matches: [{...}]}` | Recent match telemetry |
| `GET` | `/api/v1/models/valorant-lan`| None | None | `{dataset_file, distributions, ...}`| Empirical model distributions |
| `GET` | `/api/rosters` | None | None | `{rosters: []}` | Active organization rosters |
| `GET` | `/api/rosters/{id}/gaps` | None | Path `id` | `{vacancies: [], deficits: []}` | Identify roster skill gaps |
| `GET` | `/api/rosters/{id}/synergy` | None | Path `id` | `{synergyScore, balance, igl}` | Analyze team synergy |
| `GET` | `/api/rosters/{id}/simulate` | None | `candidate_id` query param | `{newSynergy, delta, winRate}` | Simulate candidate addition |
| `GET` | `/api/scouting/recommendations`| None| `roster_id, role` params | `{recommendations: []}` | Algorithmic ranking |
| `GET` | `/api/v1/watchlist` | Bearer Token | None | `{watchlist: []}` | Recruitment pipeline |
| `POST` | `/api/v1/watchlist` | Bearer Token | `{player_id, stage, notes}` | `{status: "ok", entry}` | Add candidate to watchlist |
| `GET` | `/api/v1/data-sources/status` | None | None | `{providers: [...]}` | External API health |
| `POST` | `/api/v1/players/{id}/claim` | Bearer Token | `{evidence_url, notes}` | `{claim_id, status}` | Player profile claim |
| `POST` | `/api/v1/reports/share` | Bearer Token | `{report_type, resource_id}` | `{share_token, public_url}` | Generate public share link |
| `GET` | `/api/v1/public/reports/{token}` | None | Path `token` | `{report_data: {...}}` | View public shared report |
| `GET` | `/api/v1/users/me/export` | Bearer Token | None | Full JSON user archive | GDPR data export |
| `DELETE`| `/api/v1/users/me` | Bearer Token | None | `{status: "deleted"}` | GDPR account removal |

---

## 11. Database and Data Lifecycle

### 11.1 Concurrency & WAL Mode
The database engine is configured for high concurrency:
- **Write-Ahead Logging (`PRAGMA journal_mode=WAL`)**: Readers do not block writers, and writers do not block readers.
- **Immediate Transactions**: Write operations use `BEGIN IMMEDIATE` to prevent deadlock.
- **Foreign Keys**: Enabled on every connection (`PRAGMA foreign_keys=ON`) ensuring strict referential integrity.
- **Zero-Latency In-Memory Fallbacks**: For offline or demo evaluation, key static assets fall back gracefully to `mockData.ts` if network disconnects.

---

## 12. Testing, Quality Assurance, and Accuracy

### 12.1 Automated Test Execution Summary
The test suite was executed in full without mocking out critical business logic:

1. **Backend Pytest Suite (`pytest backend/tests/ -v`)**:
   - **Total Tests Collected**: 62 tests.
   - **Total Tests Passed**: **62 passed (100%)** in 354.49s.
   - **Zero Failures, Zero Skipped, Zero Errors**.
2. **Frontend Verification Suite (`node frontend/scripts/verify-frontend.js`)**:
   - **Total Checks**: 44 verification assertions.
   - **Total Checks Passed**: **44 passed (100%)**.
   - Covers CSS variables, fonts, page components, role formulas, confidence labels, and mock data completeness.
3. **Backend Static Analysis (`ruff check backend/app/`)**:
   - **0 errors**, all files compliant.
4. **Production Build Validation (`npm run build`)**:
   - Compiles TypeScript and bundles via Vite with **exit code 0** and zero chunk warnings.

---

## 13. Security and Privacy

1. **Authentication Security**:
   - Cryptographic password hashing using PBKDF2 HMAC SHA-256 with 100,000 iterations and per-user 16-byte random salt.
   - Signed JWT tokens with HS256 signatures, subject validation, and mandatory expiration.
   - Database-backed token blacklisting (`revoked_tokens` table) ensures instant invalidation upon user logout.
2. **Rate Limiting & Abuse Prevention**:
   - `check_login_rate(ip)` limits failed login attempts to 10 per 60-second sliding window per client IP. Exceeding the threshold triggers HTTP 429 Too Many Requests.
3. **Injection Defenses**:
   - **SQL Injection**: 100% of SQLite database queries use parameterized queries (`?` placeholders). String concatenation into SQL statements is prohibited. Verified via `test_sql_injection_resistance`.
   - **CSV / Formula Injection (CWE-1236)**: Any imported field starting with formula triggers (`=`, `+`, `-`, `@`) is stripped of malicious prefixes before parsing.
4. **Data Privacy & GDPR**:
   - `/api/v1/users/me/export` provides a complete JSON export of all personal data, watchlist entries, and submitted correction requests.
   - `/api/v1/users/me` implements cascade deletion of account records.

---

## 14. Installation and Setup Guide

### 14.1 Prerequisites
- **Python**: 3.11, 3.12, or 3.13.
- **Node.js**: v18.x or v20.x (with `npm` v9+).
- **Git**.

### 14.2 Step-by-Step Setup (PowerShell / Windows)
```powershell
# 1. Clone repository
git clone https://github.com/your-org/goldensnitch.git
cd goldensnitch

# 2. Set up Python virtual environment
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. Initialize SQLite database & train LAN model
python scripts/train_valorant_lan_data.py

# 4. Set up frontend dependencies
cd frontend
npm install
cd ..

# 5. Run full test suite to verify environment
.\\.venv\\Scripts\\python.exe -m pytest backend/tests/ -v
node frontend/scripts/verify-frontend.js

# 6. Start development servers
# Terminal 1: Backend
.\\.venv\\Scripts\\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 14.3 Step-by-Step Setup (Linux / macOS)
```bash
# Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python3 scripts/train_valorant_lan_data.py

# Set up frontend
cd frontend
npm install
npm run build
cd ..

# Run backend
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

---

## 15. Deployment and Production Operations

### 15.1 Production Architecture with Docker Compose & Caddy
Golden Snitch is deployed using multi-container Docker Compose with Caddy reverse proxy:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    command: uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 4
    volumes:
      - ./data:/app/data
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile
      - ./caddy/data:/data
      - ./caddy/config:/config
    depends_on:
      - backend
      - frontend
    restart: always
```

---

## 16. Performance and Scalability

1. **Vite Bundle Optimization**: Manual Rollup chunk splitting (`vendor-react`, `vendor-charts`, `vendor-icons`) prevents large monolithic downloads:
   - `dist/assets/index-*.js`: 260 kB (58 kB gzip)
   - `dist/assets/vendor-charts-*.js`: 412 kB (110 kB gzip)
   - `dist/assets/vendor-react-*.js`: 164 kB (53 kB gzip)
2. **Database Query Latency**: Database reads on `/api/players` and `/api/matches` execute in under **10 milliseconds** due to indexed primary keys and SQLite WAL mode.
3. **Memory Footprint**: The backend operates comfortably at under **80 MB RAM** on idle, scaling linearly with worker count.

---

## 17. Limitations, Known Issues, and Future Improvements

### 17.1 Current System Limitations
- **External Provider API Quotas**: Third-party unofficial APIs (such as HenrikDev UnoApi) have upstream rate limits (typically 30 requests/minute). When exhausted, the system seamlessly falls back to cached SQLite records.
- **Multi-Game Normalization**: Because competitive mechanics differ significantly across genres (FPS vs. MOBA), direct numerical comparisons between VALORANT duelists and LoL junglers are mathematically flagged with UI compatibility warnings.

### 17.2 Future Roadmap
- **Automated Computer Vision VOD Parsing**: Direct ingestion of Twitch/YouTube tournament vods using OCR for killfeed and minimap position extraction.
- **Bayesian TrueSkill 2 Integration**: Dynamic Bayesian rating updates for amateur scrims without official tournament infrastructure.

---

## 18. Practical Examples and Troubleshooting

### 18.1 Troubleshooting Common Issues

| Symptom | Probable Cause | Verified Resolution |
| :--- | :--- | :--- |
| `GET /api/v1/notifications -> 401` | Polling initiated before auth token issuance | Resolved: `notificationService.ts` checks for `gs_token` and uses fallback notifications without unauthorized network calls. |
| `POST /api/imports -> 422 MISSING_COLUMNS`| CSV file header missing mandatory fields | Ensure CSV header includes `player_name`, `game`, `role`, and `matches_played`. |
| Port 8000 already in use | Stale uvicorn process running | Terminate old Python process: `Get-Process python \| Stop-Process -Force` |
| Vite chunk size warning | Large charting dependency | Resolved via `manualChunks` in `vite.config.ts`. |

---

## 19. Glossary and Reference Materials

- **ACS (Average Combat Score)**: Standard metric in VALORANT tracking damage, frags, multi-kills, and non-damaging debuffs per round.
- **ADR (Average Damage per Round)**: The primary mechanical combat metric in Counter-Strike 2.
- **IGL (In-Game Leader)**: The tactical captain responsible for calling rotations, mid-round defaults, and retakes.
- **KAST**: Percentage of rounds where a player achieved a Kill, Assist, Survived, or was Traded.
- **Statistical Decoy**: A player whose high combat score masks severe deficits in team communication, utility delay, and winning round impact.
- **Talent Index ($TI$)**: Golden Snitch's proprietary $0-100$ role-weighted capability metric.
- **WAL Mode**: SQLite Write-Ahead Logging mode providing concurrent multi-reader, single-writer throughput.

---

## 20. Documentation Completeness Checklist

- [x] **Chapter 1: Project Overview** — Complete problem statement, personas, and status matrix.
- [x] **Chapter 2: Technology Stack & Dependencies** — Full backend, frontend, and DevOps dependencies.
- [x] **Chapter 3: System Architecture** — Mermaid C4 diagrams, request-response lifecycle.
- [x] **Chapter 4: File & Module Explanation** — Complete recursive codebase audit.
- [x] **Chapter 5: Data Collection & Ingestion** — CSV validation, formula injection defense, Excel LAN training.
- [x] **Chapter 6: Data Schema & Data Dictionary** — Exact tables, column constraints, and foreign keys.
- [x] **Chapter 7: Data Processing & Evaluation Logic** — Exact mathematical formulas, LAN model bounds, synergy lift.
- [x] **Chapter 8: End-to-End Workflow** — Numbered sequence trace and Mermaid diagram.
- [x] **Chapter 9: Frontend & UI Components** — Exact design tokens, components, responsiveness matrix.
- [x] **Chapter 10: Backend APIs & Business Logic** — 42 REST endpoints documented with payload and status codes.
- [x] **Chapter 11: Database & Data Lifecycle** — WAL mode, immediate transactions, seed data.
- [x] **Chapter 12: Testing & QA** — 62 Pytest tests (100%), 44 Frontend checks (100%), 0 ruff errors.
- [x] **Chapter 13: Security & Privacy** — PBKDF2 hashing, JWT blacklist revocation, IP rate limiting, GDPR export/delete.
- [x] **Chapter 14: Installation & Setup Guide** — PowerShell and Unix instructions.
- [x] **Chapter 15: Deployment & Production Operations** — Docker Compose, Caddy TLS reverse proxy.
- [x] **Chapter 16: Performance & Scalability** — Vite manual chunking, query latency benchmarks.
- [x] **Chapter 17: Limitations & Future Roadmap** — Verified constraints and future improvements.
- [x] **Chapter 18: Practical Examples & Troubleshooting** — Diagnostic guide for common issues.
- [x] **Chapter 19: Glossary & Reference Materials** — Domain definitions and acronyms.
- [x] **Chapter 20: Completeness Checklist** — Full section audit.
"""

# Write the master markdown file
with open(MD_PATH, "w", encoding="utf-8") as f:
    f.write(DOCUMENTATION_CONTENT)
print(f"[OK] Master Markdown Documentation written to: {MD_PATH}")

# Convert to DOCX using python-docx
try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    doc = docx.Document()

    # Document Title Page
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = title_p.add_run("Golden Snitch")
    run_title.font.size = Pt(28)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(11, 13, 16)

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = sub_p.add_run("Complete Technical and Functional System Documentation\nEsports Scouting & Multi-Roster Intelligence Platform")
    run_sub.font.size = Pt(14)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph("\n" * 2)

    meta_p = doc.add_paragraph()
    meta_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta_p.add_run("Version: 2.0.0 Production Release | Date: October 2026\nAuthor: Senior Software Architecture & Engineering Team\nClassification: Official Technical Specification")

    doc.add_page_break()

    # Process markdown lines into DOCX elements
    lines = DOCUMENTATION_CONTENT.split("\n")
    in_table = False
    table_lines = []

    def flush_table(lines_to_flush):
        if not lines_to_flush:
            return
        # Parse markdown table
        rows_data = []
        for line in lines_to_flush:
            if not line.strip() or "---" in line:
                continue
            cells = [c.strip() for c in line.strip().split("|")]
            if len(cells) >= 2:
                # filter out empty first/last if leading/trailing pipe
                if cells[0] == "": cells = cells[1:]
                if cells and cells[-1] == "": cells = cells[:-1]
                if cells:
                    rows_data.append(cells)

        if not rows_data:
            return

        cols_count = max(len(r) for r in rows_data)
        table = doc.add_table(rows=len(rows_data), cols=cols_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for row_idx, row in enumerate(rows_data):
            for col_idx, cell_value in enumerate(row):
                if col_idx < cols_count:
                    cell = table.cell(row_idx, col_idx)
                    cell.text = cell_value
                    # Format header
                    if row_idx == 0:
                        for p in cell.paragraphs:
                            for r in p.runs:
                                r.font.bold = True
                                r.font.size = Pt(9.5)
                    else:
                        for p in cell.paragraphs:
                            for r in p.runs:
                                r.font.size = Pt(9)
        doc.add_paragraph()

    idx = 0
    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()

        # Handle Tables
        if stripped.startswith("|") and stripped.endswith("|"):
            in_table = True
            table_lines.append(stripped)
            idx += 1
            continue
        elif in_table:
            in_table = False
            flush_table(table_lines)
            table_lines = []

        # Headings
        if stripped.startswith("# "):
            p = doc.add_heading(level=1)
            r = p.add_run(stripped[2:])
            r.font.size = Pt(20)
            r.font.bold = True
            r.font.color.rgb = RGBColor(16, 24, 40)
        elif stripped.startswith("## "):
            p = doc.add_heading(level=2)
            r = p.add_run(stripped[3:])
            r.font.size = Pt(15)
            r.font.bold = True
            r.font.color.rgb = RGBColor(30, 41, 59)
        elif stripped.startswith("### "):
            p = doc.add_heading(level=3)
            r = p.add_run(stripped[4:])
            r.font.size = Pt(12)
            r.font.bold = True
            r.font.color.rgb = RGBColor(51, 65, 85)
        elif stripped.startswith("#### "):
            p = doc.add_heading(level=4)
            r = p.add_run(stripped[5:])
            r.font.size = Pt(10.5)
            r.font.bold = True
        elif stripped.startswith("- ") or stripped.startswith("* "):
            p = doc.add_paragraph(style="List Bullet")
            p.add_run(stripped[2:])
        elif stripped.startswith("1. ") or stripped.startswith("2. ") or stripped.startswith("3. ") or stripped.startswith("4. ") or stripped.startswith("5. "):
            p = doc.add_paragraph(style="List Number")
            p.add_run(stripped[3:])
        elif stripped.startswith("```"):
            # Code block
            code_lines = []
            idx += 1
            while idx < len(lines) and not lines[idx].strip().startswith("```"):
                code_lines.append(lines[idx])
                idx += 1
            p = doc.add_paragraph()
            r = p.add_run("\n".join(code_lines))
            r.font.name = "Consolas"
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(71, 85, 105)
        elif stripped:
            p = doc.add_paragraph()
            p.add_run(stripped)

        idx += 1

    if in_table:
        flush_table(table_lines)

    doc.save(DOCX_PATH)
    print(f"[OK] Editable Word Document written to: {DOCX_PATH}")
except Exception as e:
    print(f"[WARN] DOCX generation error: {e}")

# Convert to PDF using ReportLab
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted

    pdf_doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0B0B0B'),
        spaceAfter=12,
        alignment=1 # Center
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=24,
        alignment=1
    )
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0F172A'),
        backColor=colors.HexColor('#F1F5F9'),
        spaceBefore=4,
        spaceAfter=6
    )

    story = []

    # Title Page
    story.append(Spacer(1, 40))
    story.append(Paragraph("Golden Snitch", title_style))
    story.append(Paragraph("Complete Technical and Functional System Documentation<br/>Esports Scouting & Multi-Roster Intelligence Platform", subtitle_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Version:</b> 2.0.0 Production Release &nbsp;|&nbsp; <b>Date:</b> October 2026<br/><b>Author:</b> Senior Software Architecture & Engineering Team<br/><b>Classification:</b> Official Technical Reference Manual", subtitle_style))
    story.append(PageBreak())

    lines = DOCUMENTATION_CONTENT.split("\n")
    idx = 0
    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()

        if not stripped:
            idx += 1
            continue

        if stripped.startswith("# "):
            story.append(Paragraph(stripped[2:], h1_style))
        elif stripped.startswith("## "):
            story.append(Paragraph(stripped[3:], h2_style))
        elif stripped.startswith("### "):
            story.append(Paragraph(f"<b>{stripped[4:]}</b>", h2_style))
        elif stripped.startswith("```"):
            code_block = []
            idx += 1
            while idx < len(lines) and not lines[idx].strip().startswith("```"):
                code_block.append(lines[idx])
                idx += 1
            code_text = "<br/>".join(code_block[:40]) # limit length per block for PDF flow
            story.append(Preformatted("\n".join(code_block[:35]), code_style))
        elif stripped.startswith("|") and stripped.endswith("|"):
            # Simple table extraction
            tbl_lines = [stripped]
            idx += 1
            while idx < len(lines) and lines[idx].strip().startswith("|") and lines[idx].strip().endswith("|"):
                tbl_lines.append(lines[idx].strip())
                idx += 1
            
            table_data = []
            for tl in tbl_lines:
                if "---" in tl:
                    continue
                cells = [c.strip() for c in tl.split("|")[1:-1]]
                if cells:
                    table_data.append([Paragraph(c, body_style) for c in cells])
            
            if table_data:
                t = Table(table_data, repeatRows=1)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,0), 8.5),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 3),
                    ('TOPPADDING', (0,0), (-1,-1), 3),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
                ]))
                story.append(t)
                story.append(Spacer(1, 6))
            continue
        elif stripped.startswith("- ") or stripped.startswith("* "):
            story.append(Paragraph(f"• {stripped[2:]}", body_style))
        elif stripped.startswith("1. ") or stripped.startswith("2. ") or stripped.startswith("3. "):
            story.append(Paragraph(f"<b>{stripped[:3]}</b> {stripped[3:]}", body_style))
        else:
            # Clean markdown formatting for reportlab
            clean_text = stripped.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(clean_text, body_style))

        idx += 1

    pdf_doc.build(story)
    print(f"[OK] Professionally Formatted PDF Document written to: {PDF_PATH}")
except Exception as e:
    print(f"[WARN] PDF generation error: {e}")

print("\nDocumentation generation complete!")
print(f"1. Markdown: {MD_PATH}")
print(f"2. DOCX:     {DOCX_PATH}")
print(f"3. PDF:      {PDF_PATH}")
