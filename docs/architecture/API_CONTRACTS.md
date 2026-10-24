# Golden Snitch — API Contracts & Endpoint Specification

**Version:** 2.0.0  
**Base URL:** `http://127.0.0.1:8000` (or configured `VITE_API_BASE_URL`)  
**Prefix:** `/api/v1` (with `/api` backward-compatible aliases)  

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
- **Description:** Registers a new scout or staff account.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "username": "arjun_scout",
    "name": "Arjun Mehta",
    "password": "Password123!",
    "role": "ROLE_SCOUT",
    "organization": "Sentinels Operations"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`
  - `409 Conflict`: Username already registered (`DUPLICATE_USERNAME`).
  - `422 Unprocessable Entity`: Validation failure.

### `POST /api/v1/auth/login`
- **Description:** Authenticates user and issues access token. Rate-limited to 10 failed attempts/min per IP.
- **Access:** Public
- **Request Body:** `{ "username": "maya", "password": "admin123" }`
- **Responses:**
  - `200 OK`: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`
  - `401 Unauthorized`: Invalid credentials (`INVALID_CREDENTIALS`).
  - `429 Too Many Requests`: Rate limit exceeded (`RATE_LIMIT_EXCEEDED`).

### `GET /api/v1/auth/me`
- **Description:** Returns the authenticated user's profile and RBAC permissions.
- **Access:** Authenticated (Bearer)
- **Response:**
  ```json
  {
    "user": { "id": "USR-001", "username": "maya", "name": "Maya Lin", "role": "ROLE_GM", "organization": "Sentinels Esports" },
    "permissions": { "can_approve_signings": true, "can_annotate_igl": true, "can_import_csv": true, "can_manage_rosters": true }
  }
  ```

### `POST /api/v1/auth/logout`
- **Description:** Revokes current token in database, invalidating the session.
- **Access:** Authenticated (Bearer)
- **Response:** `200 OK`: `{ "status": "ok", "message": "Successfully logged out and session revoked" }`

---

## 2. Notification Endpoints

### `GET /api/v1/notifications`
- **Description:** Returns paginated notifications belonging to the authenticated user.
- **Access:** Authenticated (Bearer)
- **Query Parameters:** `limit=50`, `offset=0`
- **Response:**
  ```json
  {
    "notifications": [
      {
        "id": "notif_8a12bc",
        "user_id": "USR-001",
        "type": "watchlist",
        "title": "Candidate Shortlisted",
        "message": "Mirage (Controller) added to recruitment pipeline under 'Trial Requested'.",
        "resource_type": "player",
        "resource_id": "VAL-002",
        "is_read": 0,
        "created_at": 1792837200
      }
    ],
    "unread_count": 1,
    "total": 1
  }
  ```

### `GET /api/v1/notifications/unread-count`
- **Description:** Returns unread notification count for badge rendering.
- **Access:** Authenticated (Bearer)
- **Response:** `200 OK`: `{ "unread_count": 1 }`

### `PATCH /api/v1/notifications/{id}/read`
- **Description:** Marks a single notification as read.
- **Access:** Authenticated (Bearer)
- **Response:** `200 OK`: `{ "status": "ok", "id": "notif_8a12bc", "is_read": true }`

### `POST /api/v1/notifications/mark-all-read`
- **Description:** Marks all notifications for user as read.
- **Access:** Authenticated (Bearer)
- **Response:** `200 OK`: `{ "status": "ok", "marked_read_count": 1 }`

---

## 3. Scouting Intelligence & Decisions

### `POST /api/v1/scouting/rank`
- **Description:** Evaluates and ranks candidate talent pool against roster vacancy requirements. Seals an immutable decision snapshot in SQLite.
- **Access:** Authenticated / Public (Demo)
- **Request Body:**
  ```json
  {
    "roster_id": 4,
    "role": "Controller",
    "top_n": 10,
    "min_matches": 10
  }
  ```
- **Response:** Returns ranked candidate profiles, fit breakdown, before/after radar profiles, confidence index, and audit decision ID (`REC-xxxxxxxxxx`).

### `GET /api/recommendations`
- **Description:** Returns sealed decision snapshot history for governance audits.
- **Access:** Authenticated (Bearer)

### `GET /api/recommendations/{id}`
- **Description:** Retrieves the complete immutable decision payload for zero-variance recomputation.
- **Access:** Authenticated (Bearer)

---

## 4. Ingestion & Data Authenticity

### `POST /api/imports`
- **Description:** Validates raw CSV telemetry with bound enforcement, formula injection protection, and dataset SHA-256 calculation.
- **Access:** Authenticated (`ROLE_GM`, `ROLE_COACH`, `ROLE_SCOUT`)
- **Query Parameter:** `dry_run=true` or `dry_run=false`
- **Request Body:** Raw CSV string (`Content-Type: text/csv`)
- **Response:**
  ```json
  {
    "dry_run": true,
    "dataset_sha256": "7d1ca4...",
    "rows_total": 3,
    "accepted": 2,
    "rejected": 1,
    "duplicates": 0,
    "errors": [
      { "row": 4, "field": "acs", "message": "out of range 0-450" }
    ],
    "warnings": []
  }
  ```
