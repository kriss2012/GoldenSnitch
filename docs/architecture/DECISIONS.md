# Golden Snitch — Architecture Decision Records (ADRs)

**Document Code:** ADR-2026-001  
**Project:** Golden Snitch (ScoutGrid v2.0)  
**Standard:** Lightweight ADR Format  

---

## ADR 01: Database & Persistence Layer
- **Status:** Accepted
- **Decision:** Use SQLite via direct parameterized Python database access (`backend/app/db.py`) with explicit schema definitions, indexing, and foreign key enforcement.
- **Rationale:** Minimizes operational overhead for MVP and local development while ensuring strict transaction safety and referential integrity. All queries utilize parameterized SQL (`?`) to prevent SQL injection.
- **Consequences:** Zero-downtime backups are supported via Python's `sqlite3.Connection.backup()` API (`scripts/backup_db.py`). For horizontal multi-region production, schema can be transitioned to PostgreSQL via SQLAlchemy.

---

## ADR 02: Authentication & Session Strategy
- **Status:** Accepted
- **Decision:** RFC 7519 signed JSON Web Tokens (JWT) using HMAC-SHA256, combined with server-side database token revocation (`revoked_tokens` table) and PBKDF2-HMAC-SHA256 password hashing.
- **Rationale:** Provides stateless token verification across micro-requests while maintaining enterprise security guarantees: on `/logout`, the token hash is permanently revoked in SQLite, immediately rejecting subsequent requests.
- **Consequences:** Client stores token in memory and synchronized localStorage (`gs_token`), injected via `Authorization: Bearer <token>`.

---

## ADR 03: Security & Rate Limiting Strategy
- **Status:** Accepted
- **Decision:** Sliding-window client-IP rate limiting on authentication routes (`POST /api/v1/auth/login`).
- **Rationale:** Protects against credential-stuffing and brute-force dictionary attacks.
- **Consequences:** Limits failed attempts to a maximum of 10 within a 60-second window before returning HTTP `429 Too Many Requests` (`RATE_LIMIT_EXCEEDED`).

---

## ADR 04: Notification Architecture
- **Status:** Accepted
- **Decision:** Persistent SQLite storage (`notifications` table) tied to specific recipient `user_id`, paired with an event-driven dispatcher and REST polling/re-validation in React.
- **Rationale:** Ensures notifications belong strictly to individual users, cannot be viewed or marked read by unauthorized users, persist across page refreshes, and link directly to relevant resources.
- **Consequences:** Notification creation occurs synchronously within state-changing API transactions (shortlist, roster change, vacancy creation).

---

## ADR 05: Deterministic Scouting Intelligence & Parity
- **Status:** Accepted
- **Decision:** Backend is the authoritative source for talent indexing, role scoring, and vacancy fit calculations.
- **Rationale:** Guarantees that the frontend does not invent scores or diverge from the PRD §10.3 case study benchmark (Mirage Fit 74.8 vs Voltz Decoy 49.3 for Sentinels Controller).
- **Consequences:** Candidate evaluations produce immutable recommendation snapshots (`REC-xxxxxxxxxx`) stored in the `recommendations` table for reproducible zero-variance audit trails.

---

## ADR 06: Data Ingestion & Sanitization
- **Status:** Accepted
- **Decision:** Multi-layer CSV ingestion pipeline with formula injection defense and cryptographic provenance hashing.
- **Rationale:** Protects downstream spreadsheet users from formula injection attacks (`=`, `+`, `-`, `@`) and enforces the "Missing $\ne$ 0" policy.
- **Consequences:** Ingested datasets record their SHA-256 hash in `data_sources` and individual player rows are tagged with source provenance (`csv_import`).
