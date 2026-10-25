# Automated Testing & Production Deployment Guide

## 1. Automated Test Suites & Verification

### Running All Backend Tests (44 Tests, 100% Pass Rate)
```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

Test coverage includes:
- `test_auth_and_notifications.py`: JWT lifecycle, PBKDF2 password hashing, rate limiting, and SQLite notifications.
- `test_engine_and_api.py`: Reproducible ranking, role coverage, CSV upload formula protection, and structured errors.
- `test_golden_snitch.py`: PRD worked example (Mirage 74.8 vs Voltz 49.3), status partitioning, roster synergy simulation, and IGL leaderboard.
- `test_live_data_and_profiles.py`: Live provider status & sync, unauthenticated public profiles, profile claim & review workflow, organization invitations lifecycle, and shared scouting report token creation & revocation.

### Running Frontend Compilation & Audit Verification
```powershell
# 1. Type check and production build
cd frontend
npm run build

# 2. Design system and route audit test (44 passing assertions)
node scripts/verify-frontend.js
```

---

## 2. End-to-End Verification Scenarios

### Scenario A: Real Player Discovery
1. Navigate to `/players` and switch to "Live Provider Search".
2. Type `Mirage` or `Aspas`.
3. Verify that the returned profile includes verified badge, data provider, and honest provenance.
4. Click "Public Dossier" to open `/p/mirage` in a new window without authentication.

### Scenario B: Player Profile Ownership & Claim
1. Open `/p/tenz` or any unverified pro player.
2. Click "Claim Profile".
3. Select verification protocol (Riot OAuth / Steam OpenID / Scout Review).
4. Submit evidence text and verify that the claim registers as pending.
5. In the backend or GM portal, approve the claim; observe that the verified badge updates to emerald.

### Scenario C: Team Manager Workflow
1. Open `/organization` to view Sentinels Operations.
2. Click "Invite Staff", enter `analyst@sentinels.gg` with role `Coach`.
3. Copy the generated onboarding link and verify that the invite token is stored in the database.
4. Open `/reports`, click "Share Public Report" to generate a tokenized shareable link `/reports/shared/:token`.

### Scenario D: Data Reliability & Stale-Data Recovery
1. Open `/data-sources` to audit live telemetry feeds.
2. Click "Sync Now" on `henrik_valorant`; verify that the synchronization event triggers an in-app notification.
3. Observe latency and rate limit allocations without UI freeze.

### Scenario E: Regression
1. Verify login (`admin123` for `maya`), logout, and token revocation.
2. Verify Sentinels Controller fit score (Mirage: 74.8, Voltz: 49.3).
3. Verify all notification center badges.
