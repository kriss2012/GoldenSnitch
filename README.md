# Golden Snitch — Esports Scouting & Multi-Roster Intelligence Platform

**Team:** Logic Legend  
**Triwizathon Problem Statement 4:** Esports Scouting & Multi-Roster Intelligence Platform  
**Product Requirements Document:** [GoldenSnitch_PRD_Logic_Legend_v6.md](file:///c:/D%20Drive/scoutgrid/GoldenSnitch_PRD_Logic_Legend_v6.md)

Golden Snitch is a professional esports operations intelligence platform that centralizes scouting decisions across multi-title competitive ecosystems (**Valorant VCT**, **Counter-Strike 2 BLAST/Major**, and developmental talent pipelines). Instead of relying on superficial combat leaderboards or subjective opinions, Golden Snitch ingests match-level telemetry, situational metrics (clutch conversion, eco efficiency, entry dynamics), and role-specific indicators (In-Game Leader shotcalling and mid-round adaptation) to rank and recommend candidate profiles matching specific roster vacancy gaps.

---

## ⚡ 1-Click Startup

### Backend (FastAPI + SQLite + Auth & Notification Engine)
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
# Run complete backend test suite (36 passing tests across auth, rate limiting, notifications, engine, API, and PRD scenarios)
.\.venv\Scripts\python.exe -m pytest backend/tests/

# Verify 100% clean code quality (zero lint errors)
.\.venv\Scripts\ruff.exe check backend/app/

# Run complete frontend audit & verification suite (44 passing audit tests)
node frontend/scripts/verify-frontend.js

# Build production frontend bundle
cd frontend && npm run build
```

---

## 🐳 Containerization & Production Deployment

The platform provides complete multi-container Docker and Docker Compose orchestration:

```bash
# Build and run backend + frontend services with automatic SQLite volume persistence
docker compose up --build -d

# Check service health and logs
docker compose ps
docker compose logs -f
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
