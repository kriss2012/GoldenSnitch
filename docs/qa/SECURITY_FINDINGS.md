# GOLDEN SNITCH — APPLICATION SECURITY ASSESSMENT & PEN-TEST FINDINGS
**Standard:** OWASP Top 10 API Security Risks / ASVS  
**Assessment Scope:** Authentication, Authorization, Session Management, Injection, IDOR, and Sensitive Data Exposure.

---

## 1. Security Findings Matrix & Retest Results

| Finding ID | Vulnerability Type | OWASP Category | Affected Endpoint | Severity | Remediation Status | Retest Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Broken Object Level Authorization (IDOR) | API1:2023 | `POST /api/v1/organizations/{id}/invitations` | **HIGH** | Resolved | **VERIFIED (HTTP 403 Forbidden enforced)** |
| **SEC-002** | Default User Fallback on Missing Auth Header | API2:2023 | `auth.py:get_current_user` | **HIGH** | Resolved | **VERIFIED (HTTP 401 Unauthorized strictly enforced)** |
| **SEC-003** | Inconsistent Password Complexity Standard | API2:2023 | `POST /api/v1/auth/change-password` | **MEDIUM** | Resolved | **VERIFIED (HTTP 422 for < 8 chars enforced)** |
| **SEC-004** | Password Mutation Overwritten on Init | API2:2023 | `db.py:init` & `conn_()` | **HIGH** | Resolved | **VERIFIED (Password changes persist across requests)** |
| **SEC-005** | Shared Report Revocation Authorization Verification | API1:2023 | `DELETE /api/v1/reports/share/{token}` | **LOW** | Verified Safe | **VERIFIED (Requires creator ownership or GM role)** |
| **SEC-006** | SQL Injection Probing | API8:2023 | All REST endpoints | **CRITICAL** | Safe | **VERIFIED (100% Parameterized queries with SQLite `?`)** |
| **SEC-007** | Stored XSS Probing | API8:2023 | Player notes, annotations, claims | **MEDIUM** | Safe | **VERIFIED (React automatic JSX escaping)** |
| **SEC-008** | Token Algorithm "None" Forgery | API2:2023 | All JWT-protected endpoints | **HIGH** | Safe | **VERIFIED (Strict HS256 verification rejects unsigned tokens)** |

---

## 2. Penetration Testing Evidence

- **Authentication Bypass Test**:
  Executed `test_unauthenticated_requests_strictly_rejected` against 7 sensitive routes without `Authorization` headers. Result: All returned `401 Unauthorized`.
- **Token Tampering Test**:
  Tested forged tokens with manipulated signatures, algorithm `none`, and corrupted payloads. Result: All returned `401 Unauthorized`.
- **IDOR Privilege Escalation Test**:
  Synthetic scout attempted to generate invitation tokens for an organization owned by GM Maya. Result: Rejected with `403 Forbidden` (`code: "FORBIDDEN"`).
- **SQL Injection Test**:
  Tested payloads `' OR '1'='1`, `'; DROP TABLE users; --`, and `VAL-002' UNION SELECT...` across search and ranking filters. Result: Parameterized SQLite safely escaped inputs without errors or data leakage.
