# Golden Snitch / ScoutGrid — Repository Audit & Root Cause Analysis

**Document Code:** AUD-2026-001  
**Author:** Full-Stack Architecture & Security Team  
**Scope:** Frontend (React + Vite + Tailwind), Backend (FastAPI + SQLite), Authentication, Notifications, and Scoring Engine  

---

## 1. Executive Summary

This repository audit documents the baseline inspection of the Golden Snitch esports intelligence platform prior to final product stabilization. It details the defects identified, their root causes, and the architectural remediations applied across the stack.

---

## 2. Identified Defect Catalog & Root Causes

### Defect 1: Nonfunctional Notification Center (Critical Issue A)
- **Observed Behavior:** Clicking the notification bell in the top navigation bar did nothing. A decorative red dot was hardcoded on the bell.
- **Root Cause:**
  1. Frontend lacked any state management, dropdown UI, or event handlers attached to the bell icon.
  2. Backend lacked a `notifications` table in SQLite.
  3. No notification endpoints (`/api/v1/notifications`, `/unread-count`, etc.) were defined in FastAPI.
  4. Application actions (e.g., candidate shortlisting, roster member assignments) did not dispatch notification creation events.
- **Remediation:**
  1. Created persistent SQLite `notifications` table with foreign key to `users(id)`, indexing on `(user_id, is_read, created_at DESC)`.
  2. Implemented FastAPI endpoints: `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/{id}/read`, `POST /api/v1/notifications/mark-all-read`.
  3. Built `<NotificationDropdown />` component supporting unread count pill badge, loading/empty/error states, optimistic read updates, deep-link navigation, and Android viewport safety.
  4. Hooked notification generation into candidate shortlisting (`/api/v1/watchlist`), candidate assignment (`/api/rosters/{id}/members`), vacancy creation (`remove_member`), and user onboarding.

---

### Defect 2: Missing Authentication Lifecycle (Critical Issue B)
- **Observed Behavior:** The application had no functional login or logout. Route guards were nonexistent; user identity was hardcoded in local state.
- **Root Cause:**
  1. Frontend lacked `/login`, `/register`, `/forgot-password`, `/reset-password` routes and `<ProtectedRoute>` guards.
  2. Backend lacked a user management table, password hashing, and token revocation mechanisms.
  3. No centralized Bearer token management in API requests.
- **Remediation:**
  1. Created SQLite tables: `users`, `revoked_tokens`, and `password_resets`.
  2. Implemented PBKDF2-HMAC-SHA256 password hashing with unique 16-byte random salts.
  3. Built session lifecycle endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`.
  4. Added database token revocation (`revoked_tokens`) blocking session re-use upon logout.
  5. Implemented client IP sliding-window rate limiting on login (blocking brute-force attacks after 10 failed attempts with HTTP 429).
  6. Built React `AuthContext` and wrapped all private views in `<ProtectedRoute>`.

---

### Defect 3: Disconnected Frontend-Backend APIs
- **Observed Behavior:** Several frontend pages operated exclusively against localStorage or static mock data arrays without backend synchronization.
- **Root Cause:** Inconsistent endpoint versioning (`/api/` vs `/api/v1/`) and absence of a centralized HTTP client.
- **Remediation:**
  1. Created centralized `apiClient.ts` handling base URL configuration, Bearer token injection, and structured error parsing.
  2. Aliased backend endpoints across both `/api/` and `/api/v1/`.
  3. Connected Watchlist management to `GET/POST/PATCH /api/v1/watchlist`.
  4. Connected Scouting Decision Sealing to `POST /api/v1/scouting/rank`.
  5. Connected Audit History to `GET /api/recommendations` and `GET /api/recommendations/{id}`.
  6. Connected CSV Data Ingestion to `POST /api/imports`.

---

### Defect 4: Visual Aesthetic & Design Inconsistency
- **Observed Behavior:** Theme had drifted into low-contrast murky black and gold accents rather than an esports broadcast aesthetic.
- **Root Cause:** CSS color tokens were uncurated and lacked neon vibrancy.
- **Remediation:**
  1. Refactored theme tokens to Gamified Bright Violet (`#090014`, `#140026`, `#620a96`, `#5662f6`, `#9b30ff`, `#d187ff`).
  2. Added glow effects, ambient illumination, and responsive Android touch targets.

---

## 3. Test Baseline & Verification Confirmation
- **Pytest Suite:** 36 / 36 tests passing (`backend/tests/`).
- **Code Linter:** 0 Ruff errors (`backend/app/`).
- **Frontend Verification:** 44 / 44 checks passing (`frontend/scripts/verify-frontend.js`).
- **Production Build:** `npm run build` compiled in 3.9s with 0 TypeScript errors.
- **Database Backup:** Verified online zero-downtime backup utility (`scripts/backup_db.py`).
