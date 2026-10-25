# Golden Snitch — Security, Privacy & Compliance
**Comprehensive Production Security & Data Protection Manual**

---

## 1. Authentication & Session Security

- **Algorithm**: PBKDF2 with SHA-256 and 100,000 iterations.
- **Salt Generation**: 16-byte cryptographically secure random per-user salt (`secrets.token_hex(16)`).
- **Session Tokens**: HMAC-SHA256 signed JSON Web Tokens (JWT) with 24-hour expiration (`exp`), subject claim (`sub`), and username claim.
- **Token Revocation Architecture**:
  - Logout and Password Change explicitly calculate `hashlib.sha256(token.encode()).hexdigest()` and persist to `revoked_tokens`.
  - Every authenticated request verifies that the token hash is not in `revoked_tokens`.
  - Deleted accounts check user existence in `users`; if missing, authentication is immediately rejected with HTTP 401 Unauthorized.
- **Rate Limiting**:
  - `/api/auth/login` and `/api/v1/auth/login`: 5 requests per 60 seconds per IP.
  - `/api/auth/forgot-password`: 3 requests per 60 seconds per IP.
  - `/api/v1/players/{id}/claim`: Rate-limited to prevent brute-force claim submissions.

---

## 2. Authorization & Role-Based Access Control (RBAC)

Access permissions are enforced strictly on the server:
- **`ROLE_OWNER` & `ROLE_ADMIN`**: Full administrative access, organization transfers, member invitations, claim approvals.
- **`ROLE_MANAGER` & `ROLE_COACH`**: Roster mutation, candidate shortlisting, certified annotations, report sharing.
- **`ROLE_SCOUT` & `ROLE_ANALYST`**: Scouting evaluation, live telemetry queries, compare tools, report viewing.
- **`ROLE_PLAYER`**: Profile claiming, bio updates, recruit preference updates.
- **`ROLE_MEMBER`**: Read-only team visibility.

---

## 3. GDPR & Data Subject Rights

Golden Snitch provides full compliance with modern global data privacy standards:
1. **Right of Access & Portability (`GET /api/v1/users/me/export`)**:
   - Exports all stored data in machine-readable JSON format, including account profile, personal watchlists, scouting annotations, submitted claims, and correction requests.
2. **Right to Erasure (`DELETE /api/v1/users/me`)**:
   - Permanently deletes the user record and cleans up relational references in `notifications`, `watchlist_entries`, and `organization_members`.
   - Revokes active tokens and clears client storage.
3. **Data Correction & Dispute Process (`POST /api/v1/players/{id}/correction-requests`)**:
   - Allows users to report inaccurate stats, mismatched identities, or outdated roster affiliations.

---

## 4. Input Sanitization & Attack Prevention

- **SQL Injection**: Prevented via parameterized queries (`?` parameter markers) on all SQLite/PostgreSQL operations.
- **Cross-Site Scripting (XSS)**: All React templates use JSX automatic string escaping; untrusted HTML is never injected via `dangerouslySetInnerHTML`.
- **Insecure Direct Object References (IDOR)**: Roster modifications, private report viewing, and claim reviews verify user organization membership and role ownership server-side.
- **Token Entropy**: Shared report links use 32-byte cryptographic hex tokens (`secrets.token_urlsafe(32)`), preventing URL enumeration.
