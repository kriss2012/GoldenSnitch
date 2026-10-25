# Golden Snitch — Esports Scouting & Multi-Roster Intelligence Platform

**Team:** Logic Legend  
**Triwizathon Problem Statement 4:** Esports Scouting & Multi-Roster Intelligence Platform  
**Product Requirements Document:** [GoldenSnitch_PRD_Logic_Legend_v6.md](file:///c:/D%20Drive/scoutgrid/GoldenSnitch_PRD_Logic_Legend_v6.md)

Golden Snitch is a professional esports operations intelligence platform that centralizes scouting decisions across multi-title competitive ecosystems (**Valorant VCT**, **Counter-Strike 2 BLAST/Major**, and developmental talent pipelines). Instead of relying on superficial combat leaderboards or subjective opinions, Golden Snitch ingests match-level telemetry, situational metrics (clutch conversion, eco efficiency, entry dynamics), and role-specific indicators (In-Game Leader shotcalling and mid-round adaptation) to rank and recommend candidate profiles matching specific roster vacancy gaps.

---

## ⚡ 1-Click Startup

### Option A: Windows 1-Click Batch Launcher (Recommended)
Double-click or run:
```cmd
start.bat
# or
run.bat
```
This will:
- Check all prerequisites (Python `.venv`, Node.js, `npm`, `.env`, and dependencies).
- Auto-install missing packages (`npm install`) if needed.
- Free ports `8000` and `5173` to prevent port collision conflicts.
- Launch the **FastAPI Backend** (`http://localhost:8000`) and **Vite Frontend** (`http://localhost:5173`) in dedicated labeled windows.
- Provide a live interactive control dashboard with 1-key actions:
  - `[B]` Open Web App in Browser
  - `[D]` Open Swagger Docs in Browser
  - `[R]` Restart Both Servers
  - `[S]` Stop All Servers
  - `[Q]` Exit Launcher

CLI shortcut arguments are also supported:
```cmd
start.bat backend    # Start backend only
start.bat frontend   # Start frontend only
start.bat stop       # Stop any running servers
start.bat install    # Install/repair pip & npm packages
start.bat test       # Run test suite
```

### Option B: Manual Startup

#### Backend (FastAPI + SQLite + Auth & Notification Engine)
From the repository root:
```bash
# Using project Python virtual environment:
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
```
- **Web Application / API Base:** `http://localhost:8000/`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`
- **Health Verification:** `http://localhost:8000/api/v1/health`

### Frontend (React + Vite + Tailwind CSS + Gamified Bright Violet)
From the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
- **Live Frontend Dev Server:** `http://localhost:5173/`
- **Production Build:** `npm run build` (outputs to `frontend/dist`)

---

## 🛡️ Default User Credentials & RBAC Roles

| User | Role | Password | Primary Responsibility |
|---|---|---|---|
| `maya` | `ROLE_GM` | `admin123` | General Manager: approve signings, manage payroll, audit decision snapshots |
| `dev` | `ROLE_COACH` | `coach123` | Head Coach / Analyst: certified IGL annotations, tactical synergy simulations |
| `arjun` | `ROLE_SCOUT` | `scout123` | Talent Scout: player discovery, candidate shortlists, multi-layer CSV ingestion |

*Note: You can also register a brand-new user on `/register` or perform password recovery workflows on `/forgot-password` and `/reset-password`.*

---

## 🔔 Functional Notification Engine

The platform features a persistent notification center backed by SQLite (`notifications` table):
- **Real-Time Notification Bell & Dropdown:** Unread pill badge, loading/empty/error states, mark individual notification as read, and "Mark all as read".
- **Deep Links:** Notifications link directly to target players (`/players/:id`), rosters (`/rosters`), and candidate scouting recommendations.
- **Event-Driven Triggers:** Automatically creates real notifications upon key operations:
  - Account creation and onboarding
  - Shortlisting candidates to recruitment watchlists (`POST /api/v1/watchlist`)
  - Assigning candidates to roster vacancies (`POST /api/rosters/{id}/members`)
  - Opening new roster vacancies (`DELETE /api/rosters/{id}/members/{pid}`)

---

## 🔑 Authentication & Authorization

- **Session Architecture:** RFC 7519 JSON Web Tokens (JWT) with PBKDF2-HMAC-SHA256 password hashing.
- **Database Revocation (`revoked_tokens`):** Logout immediately hashes and invalidates tokens in SQLite, blocking re-use.
- **Password Reset Lifecycle (`password_resets`):** Time-expiring single-use reset tokens with dev inspection token display and zero password leakage.
- **Role-Based Guards:** Multi-tier permission matrix on backend endpoints and frontend route guards (`<ProtectedRoute>`).

---

## 🎮 Core Capabilities Built for Problem Statement 4

1. **Multi-Game Roster Management:**
   - Centralized multi-title dashboard tracking team composition, contract expiries, player salaries vs $1,500,000 payroll caps, and historical performance trajectories across Valorant and CS2.
2. **Dedicated IGL & Situational Intelligence:**
   - Evaluates vocal captains and shotcallers based on **Shot-calling Impact**, **Mid-Round Decision-Making**, **Tactical Timeout Recovery %**, and certified multi-scout consensus ratings.
3. **Interactive Roster Sandbox & Synergy Simulator:**
   - Live counterfactual simulator allowing GMs and Coaches to test candidate swaps, calculating instant Squad Synergy deltas, predicted round win rate shifts, and before-and-after radar charts.
4. **Authentic Competitive Match Telemetry:**
   - Match logs from premier international tournaments (VCT Masters Madrid, Champions Seoul, PGL Major, IEM Cologne) with map-by-map combat stats and situational event callouts (1vX clutches, entry kills, anti-eco breaks).
5. **PRD §10.3 Worked Example Verification:**
   - Sentinels Controller Vacancy (incumbent Kairo had a severe Utility gap: 35 vs 70 target):
     - **Mirage (#1 by Fit):** Covers Utility gap (80 rating) + Tier-1 IGL calling $\rightarrow$ **Fit Score: 74.8**
     - **Voltz (#2 Decoy):** Highest raw ACS (285), but weak Utility (30) $\rightarrow$ **Fit Score: 49.3**
6. **Data Authenticity & Governance:**
   - Cryptographic SHA-256 dataset hashing, boundary error checking, CSV formula injection defense, "Missing ≠ 0" policy, and immutable decision audit snapshots with zero-variance re-computation.

---

## 🧪 Automated Testing & Verification Gate

```bash
# Run complete backend test suite (62 passing tests across LAN model training, adversarial QA, auth, notifications, scoring engine, PRD worked examples, live telemetry, and production readiness)
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v

# Verify 100% clean code quality (zero lint errors)
.\.venv\Scripts\ruff.exe check backend/app/

# Run complete frontend audit & verification suite (44 passing audit tests)
node frontend/scripts/verify-frontend.js

# Build production frontend bundle
cd frontend && npm run build
```

---

## 🎯 Empirical Model Training & Tournament Telemetry

- **Trained Dataset:** [`Valo_Lan_Stats_10_Matches.xlsx`](Valo_Lan_Stats_10_Matches.xlsx) (10 LAN tournament match sheets, 1,600 match observations, 156 international pro competitors).
- **Trained Model Artifact:** [`backend/app/models/valorant_lan_trained_model.json`](backend/app/models/valorant_lan_trained_model.json).
- **Calibrated Empirical Normalization:**
  - **ACS:** Median `190.6` | p5: `101.4` | p95: `301.1`
  - **K/D Ratio:** Median `0.94` | p5: `0.48` | p95: `1.76`
  - **KDA:** Median `1.29` | p5: `0.70` | p95: `2.29`
  - **Kills / Map:** Median `14.0` | p5: `7.0` | p95: `22.67`
  - **Deaths / Map:** Median `15.0` | p5: `9.67` | p95: `20.50`
  - **Assists / Map:** Median `5.0` | p5: `1.33` | p95: `9.67`
- **Trained Model API:** `GET /api/v1/models/valorant-lan`
- **Re-training & Ingestion Script:** `python scripts/train_valorant_lan_data.py`

---

## 🏆 Autonomous QA System & Release Certification

Comprehensive audit and defect remediation reports are available in [`docs/qa/`](docs/qa/):
- **[QA Master Plan](docs/qa/QA_MASTER_PLAN.md)**: End-to-end testing strategy, safety rules, and operating cycles.
- **[Baseline Results](docs/qa/BASELINE_RESULTS.md)**: Pre-test system inventory and benchmark baselines.
- **[Defect Register](docs/qa/DEFECT_REGISTER.md)**: Traceable register for all 6 discovered defects (DEF-001 through DEF-006) with root causes and closure evidence.
- **[Security Findings](docs/qa/SECURITY_FINDINGS.md)**: Risk-based OWASP security evaluation (SEC-001 through SEC-008).
- **[UI Interaction Matrix](docs/qa/UI_INTERACTION_MATRIX.md)**: Exhaustive component and form interaction audit.
- **[Responsive Test Results](docs/qa/RESPONSIVE_TEST_RESULTS.md)**: Verified 14-viewport responsive matrix (320px–1920px) with 0 unhandled horizontal overflow.
- **[API Test Results](docs/qa/API_TEST_RESULTS.md)**: Complete endpoint contract inventory, HTTP methods, RBAC schemas, and negative test results.
- **[Performance Results](docs/qa/PERFORMANCE_RESULTS.md)**: Response latencies (< 8.5ms median), database concurrency (> 2,400 qps), and Web Vitals.
- **[Accessibility Results](docs/qa/ACCESSIBILITY_RESULTS.md)**: WCAG 2.1 Level AA compliance, color contrast ratios (> 5:1), and modal focus traps.
- **[Release Readiness Certification](docs/qa/RELEASE_READINESS.md)**: Official release scorecard: **CONTROLLED BETA READY / PRODUCTION CANDIDATE**.

---

## 🌐 Live Esports Telemetry & Public Sharing Features

1. **Live Data Providers (`/data-sources`):**
   - **Riot Games / HenrikDev Valorant API:** Ingests live PUUID, Combat ACS, KAST %, ADR, HS %, and VCT match history with rate-limit and cache protection.
   - **Valve Steam CS2 Provider:** Resolves SteamID64, Premier Skill Rating, ADR, and weapon accuracy splits.
   - **Provider Manager:** Tracks provider health, auto-backs off upon rate limits, and preserves last-known telemetry with explicit staleness and provenance metadata.
2. **Public Player Dossiers (`/p/:slug`, `/players/:game/:handle`):**
   - Stable unauthenticated public URLs optimized for player sharing and mobile viewing.
   - Verified badge indicator, claim verification workflow (`ClaimProfileModal`), and voluntary recruitment preferences.
3. **Cryptographically Secure Shareable Reports (`/reports/shared/:shareToken`):**
   - High-entropy share tokens (`secrets.token_urlsafe(32)`) allowing organizations to share scouting dossiers externally.
   - Instant revocation and expiration timestamps.
4. **Professional Organizations & Staff RBAC (`/organization`):**
   - Multi-roster staff management with fine-grained permissions (`ROLE_OWNER`, `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_COACH`, `ROLE_SCOUT`, `ROLE_ANALYST`, `ROLE_PLAYER`).
   - Secure tokenized team invitations with expiration and acceptance workflow.
5. **GDPR Data Rights & Security Settings (`/settings`):**
   - Self-service **Change Password** with server-side validation and immediate token revocation.
   - **Download My Data (JSON)** archive (`GET /api/v1/users/me/export`).
   - **Permanent Account Deletion** (`DELETE /api/v1/users/me`) with cascade cleanup.
6. **Data Dispute & Correction Workflow (`/terms`, `/privacy`):**
   - Formal data correction requests (`POST /api/v1/players/{id}/correction-requests`) for competitors or scouts reporting metric inaccuracies, outdated team affiliations, or impersonation.

---

## 📚 System Documentation Suite

Detailed production specifications and manuals are available in `/docs`:
- **[Production Readiness Audit](docs/production-readiness-audit.md)**: Prioritized defects and completed resolutions.
- **[System Architecture](docs/architecture.md)**: Frontend, backend, database schema, and communication contracts.
- **[Data Providers Manual](docs/data-providers.md)**: API credentials, rate limits, caching, and normalization.
- **[Scouting Methodology](docs/scouting-methodology.md)**: GTI formulas, weight vectors, and sample size confidence.
- **[Security & Privacy](docs/security-and-privacy.md)**: PBKDF2 hashing, JWT revocation, RBAC, and GDPR workflows.
- **[Automated Testing Guide](docs/testing.md)**: Complete test cases and verification procedures.
- **[Production Deployment](docs/deployment.md)**: Hardened Docker, NGINX, and Caddy reverse proxy guides.
- **[Backup & Disaster Recovery](docs/backup-and-recovery.md)**: SQLite online snapshots, restore verification, RPO/RTO.
- **[Operations Runbook](docs/operations-runbook.md)**: Health monitoring (`/health`), alert triage, and admin tasks.
- **[Player Identity & Verification](docs/player-identity-and-verification.md)**: Claim lifecycle, Steam/OAuth workflows.
- **[Public Profiles & Sharing](docs/public-profiles-and-sharing.md)**: Share previews and token revocation.
- **[Organization Permissions](docs/organization-permissions.md)**: Multi-roster access control and invitation lifecycles.

---

## 🐳 Containerization & Reverse Proxy Stacks

The platform provides complete multi-container Docker, NGINX, and Caddy orchestration:

```bash
# 1. Local Unified Stack (Frontend on 3000, Backend on 8000)
docker compose up --build -d

# 2. Production NGINX Reverse Proxy Stack (Edge TLS, rate limiting, gzip)
docker compose -f docker-compose.prod.yml up --build -d

# 3. Production Caddy Stack (Automatic HTTPS & HTTP/3)
docker compose -f docker-compose.caddy.yml up --build -d
```

- **Frontend Application (Nginx SPA):** `http://localhost:3000/`
- **Backend API (FastAPI):** `http://localhost:8000/`

---

## 💾 Zero-Downtime Database Backups

Use Python's native SQLite online backup API to take instant, consistent snapshots of the live database without table locking:

```bash
python scripts/backup_db.py
# Outputs: backups/scoutgrid_backup_YYYYMMDD_HHMMSS.db
```
