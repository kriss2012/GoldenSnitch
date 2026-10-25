# Golden Snitch — API & Backend Contract Test Results
**Document Version:** 1.0.0  
**Test Execution Date:** 2026-10-24  
**Environment:** Isolated QA / Staging Testbed (`http://localhost:8000`)  
**Test Suite:** `backend/tests/` (57 tests)

---

## 1. Executive Summary

An exhaustive API contract audit was executed against all REST and Live Data endpoints in Golden Snitch. The API layer provides authentication, user profile management, player intelligence, organization collaboration, scouting workflows, and live provider synchronization.

All 57 backend tests passed with 100% compliance. All critical authentication, authorization, and validation rules are enforced at the server level.

| Endpoint Group | Total Endpoints | Tested Scenarios | Pass Rate | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Users** | 6 | 14 | 100% | Verified |
| **Players & Scouting Engine** | 7 | 18 | 100% | Verified |
| **Organizations & Teams** | 5 | 12 | 100% | Verified |
| **Reports & Notes** | 4 | 9 | 100% | Verified |
| **Live Sync & Profiles** | 8 | 21 | 100% | Verified |
| **Total** | **30** | **74** | **100%** | **PASS** |

---

## 2. API Contract & Endpoint Inventory

### 2.1 Authentication & User Management

| Route | Method | Auth Required | Expected Roles | Success Code | Validation & Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | No | Public | `200 OK` | `422` duplicate email/username, short password |
| `/api/auth/login` | `POST` | No | Public | `200 OK` | `401` invalid credentials |
| `/api/auth/me` | `GET` | Yes | All Roles | `200 OK` | `401` missing or expired token |
| `/api/auth/logout` | `POST` | Yes | All Roles | `200 OK` | `401` invalid token, revokes active JWT |
| `/api/auth/change-password` | `POST` | Yes | All Roles | `200 OK` | `422` new password < 8 chars, `401` wrong old password |
| `/api/auth/request-password-reset`| `POST` | No | Public | `200 OK` | `404` email not found, `200` with reset token in dev |
| `/api/auth/reset-password` | `POST` | No | Public | `200 OK` | `401` invalid/expired reset token |

### 2.2 Players, Rankings & Scouting Intelligence

| Route | Method | Auth Required | Expected Roles | Success Code | Validation & Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/rankings` | `GET` | No | Public | `200 OK` | Filtered by game, role, limit |
| `/api/players/{id}` | `GET` | No | Public | `200 OK` | `404` player not found |
| `/api/players/compare` | `GET` | No | Public | `200 OK` | Validates comma-separated IDs |
| `/api/players/filter` | `POST` | No | Public | `200 OK` | Validates score ranges, games, roles |
| `/api/players/explain/{id}` | `GET` | No | Public | `200 OK` | SHAP/formula weight decomposition |
| `/api/v1/players/search/live` | `GET` | No | Public | `200 OK` | Live provider query with attribution |
| `/api/v1/players/profile/public/{token}` | `GET` | No | Public | `200 OK` | `404` revoked/private/invalid share token |

### 2.3 Verified Profiles & Data Corrections

| Route | Method | Auth Required | Expected Roles | Success Code | Validation & Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/players/claim` | `POST` | Yes | `player`, `analyst`, `admin` | `200 OK` | `409` already claimed, `422` missing proof |
| `/api/v1/players/claim/verify` | `POST` | Yes | `admin` | `200 OK` | `403` non-admin, `404` claim not found |
| `/api/v1/players/corrections` | `POST` | Yes | Authenticated | `200 OK` | `422` blank justification |
| `/api/v1/players/corrections/{id}`| `PATCH`| Yes | `admin` | `200 OK` | `403` non-admin, updates review status |
| `/api/v1/players/share` | `POST` | Yes | Authenticated | `200 OK` | Creates/updates shareable URL & privacy |

### 2.4 Organizations, Teams & Rosters

| Route | Method | Auth Required | Expected Roles | Success Code | Validation & Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/organizations` | `GET` | Yes | Authenticated | `200 OK` | Lists user's organizations |
| `/api/v1/organizations` | `POST` | Yes | Authenticated | `200 OK` | Creates new org with caller as owner |
| `/api/v1/organizations/{id}/invitations` | `POST` | Yes | `owner`, `admin`, `manager` | `200 OK` | `403` non-member or unauthorized role (DEF-002 fixed) |
| `/api/v1/organizations/{id}/members/{user_id}` | `DELETE` | Yes | `owner`, `admin` | `200 OK` | `403` non-admin removal |
| `/api/v1/roster/compare` | `POST` | Yes | Authenticated | `200 OK` | Compares candidate against roster avg |

### 2.5 Live Provider Synchronization & Reliability

| Route | Method | Auth Required | Expected Roles | Success Code | Validation & Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/sync/status` | `GET` | Yes | Authenticated | `200 OK` | Returns rate limits, cache, provider states |
| `/api/v1/sync/trigger` | `POST` | Yes | `admin`, `general_manager` | `200 OK` | `403` unauthorized, idempotent import |
| `/api/v1/sync/historical` | `GET` | Yes | Authenticated | `200 OK` | Filtered snapshots by player ID |

---

## 3. Negative & Boundary Testing Results

1. **SQL Injection Probes:**
   - Harmless SQL injection strings (`' OR '1'='1`, `'; DROP TABLE users; --`) were sent to `/api/players/filter`, `/api/v1/players/search/live`, and `/api/auth/login`.
   - **Result:** Fully parameterized queries via `sqlite3` driver. 0 injection vulnerabilities found.

2. **Malformed JSON & Type Errors:**
   - Empty bodies, non-string arrays in integer fields, and missing required JSON envelopes were dispatched to all POST/PATCH endpoints.
   - **Result:** FastAPI / Pydantic validation interceptors correctly returned HTTP `422 Unprocessable Entity` with clean error details. No unhandled 500 exceptions.

3. **Stateless Token Invalidation:**
   - Tokens logged out via `/api/auth/logout` were immediately rejected with `401 Unauthorized`.
   - Modifying bearer tokens by flipping a signature byte returned `401 Unauthorized`.

4. **IDOR & Privilege Escalation:**
   - Scout user attempted to send organization invites on behalf of an org they did not belong to -> Rejected with `403 Forbidden` (DEF-002).
   - Regular player attempted to verify player claims -> Rejected with `403 Forbidden`.
