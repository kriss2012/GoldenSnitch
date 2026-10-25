# Golden Snitch — Automated Testing Strategy & Execution
**Quality Assurance, Test Coverage & Verification Guide**

---

## 1. Test Architecture Overview

Golden Snitch implements a multi-layer test suite spanning unit calculations, integration flows, live telemetry mocking, security boundaries, and frontend visual contract verification.

| Test File | Focus Area | Passing Items |
| :--- | :--- | :--- |
| `backend/tests/test_auth_and_notifications.py` | Registration, login, rate limiting, password reset, token revocation, notifications | 7 tests |
| `backend/tests/test_engine_and_api.py` | Talent Index math, sample size confidence flags, cross-game isolation, custom weights | 20 tests |
| `backend/tests/test_golden_snitch.py` | Worked example parity (Mirage 74.8 vs Voltz 49.3), CSV SHA-256 integrity, synergy simulation | 9 tests |
| `backend/tests/test_live_data_and_profiles.py` | Provider adapters, live player search, public dossiers, claim review, report sharing | 8 tests |
| `backend/tests/test_production_readiness.py` | Consolidated health checks, password changes, GDPR export, account deletion, disputes | 5 tests |
| `frontend/scripts/verify-frontend.js` | Palette tokens, font loading, bundle assets, routing contracts, worked example data | 44 checks |

**Total Backend Automated Tests**: 49 / 49 PASSING (100% Pass Rate).  
**Total Frontend Verification Checks**: 44 / 44 PASSING (100% Pass Rate).

---

## 2. Test Execution Commands

### 2.1 Backend Tests
From workspace root:
```bash
# Run all backend test suites
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v

# Run production readiness tests specifically
.\.venv\Scripts\python.exe -m pytest backend/tests/test_production_readiness.py -v

# Run with test coverage report
.\.venv\Scripts\python.exe -m pytest backend/tests/ --cov=backend/app
```

### 2.2 Frontend Build & Design Audit
From workspace root:
```bash
# Verify TypeScript compilation and production bundle build
cd frontend
npm run build

# Run automated design token and contract verification
node scripts/verify-frontend.js
```

---

## 3. Regression Prevention Rules

1. **Deterministic Testing**: All tests run against an isolated SQLite test database initialized per session; tests never mutate development or production state.
2. **Formula Integrity**: `Mirage (VAL-002)` must score ~74.8 on the Sentinels Controller profile with high confidence; `Voltz (VAL-003)` must score ~49.3 with low confidence.
3. **No Fabricated Live Data**: Provider adapters verify authentic response structures and handle missing metrics gracefully without inventing data.
