# GOLDEN SNITCH — DEFECT REGISTER & REMEDIATION LOG
**System:** Golden Snitch Esports Intelligence Platform  
**Audit Protocol:** BREAK → REPRODUCE → DIAGNOSE → FIX → TEST → REGRESSION TEST → REPEAT  
**Current Status:** All 6 Identified Defects Resolved & Verified  

---

## 1. Defect Master Log

| Defect ID | Severity | Category | Component | Status | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | High | Security / Auth | `auth.py:get_current_user` | `VERIFIED_RESOLVED` | Unauthenticated requests without Authorization header fell back to Maya Lin (ROLE_GM). Fixed by strictly raising HTTP 401 when header is missing. |
| **DEF-002** | High | Security / IDOR | `main.py:invite_to_org` | `VERIFIED_RESOLVED` | Any authenticated user could generate invitations for organizations they do not own or manage. Fixed by enforcing membership and admin role checks. |
| **DEF-003** | Medium | Validation / Policy | `main.py:change_password` | `VERIFIED_RESOLVED` | Backend password length check allowed 6 chars, inconsistent with 8-char security policy. Fixed to enforce minimum 8 characters. |
| **DEF-004** | High | Auth / Persistence | `db.py:init` & `auth.py` | `VERIFIED_RESOLVED` | Database seeding overwritten with stale static password hashes on every request in `conn_()`, preventing password changes from persisting and blocking Arjun's login. Fixed with verified dynamic hashes and `INSERT OR IGNORE`. |
| **DEF-005** | Medium | UI / A11y | `ClaimProfileModal` & `ReportDisputeModal` | `VERIFIED_RESOLVED` | Modals lacked keyboard Escape key listeners, outside click dismissal, and accessible dialog ARIA attributes. Fixed by adding keyboard event listeners, backdrop clicks, and ARIA attributes. |
| **DEF-006** | Low | Data Sanitization | `main.py:submit_correction_request` | `VERIFIED_RESOLVED` | Empty or whitespace-only dispute justifications were accepted without validation. Fixed with strict 422 validation on empty descriptions. |

---

## 2. Detailed Remediation Details

### DEF-001: Unauthenticated Access Fallback Loophole
- **Discovery**: In `backend/app/auth.py`, `get_current_user` fell back to returning `User(id="USR-001", username="maya", ...)` when `authorization` was `None`.
- **Root Cause**: Early testing demo stub left in production dependency.
- **Fix**: Replaced demo fallback with `raise HTTPException(status_code=401, detail="Authentication credentials were not provided")`.
- **Regression Test**: Added `test_unauthenticated_requests_strictly_rejected` in `backend/tests/test_adversarial_qa.py` verifying 7 protected endpoints reject unauthenticated access.
- **Verification**: PASSED.

### DEF-002: Insecure Direct Object Reference (IDOR) on Org Invitations
- **Discovery**: `POST /api/v1/organizations/{id}/invitations` allowed any authenticated user to create an invite for any organization ID.
- **Root Cause**: Missing authorization check on caller's relationship to the organization.
- **Fix**: Added check querying `organization_members` verifying user has `ROLE_GM`, `ROLE_ADMIN`, or organization role `owner`/`admin`/`manager`. Otherwise raises HTTP 403 Forbidden.
- **Regression Test**: Added `test_idor_organization_invitation_prevention` in `backend/tests/test_adversarial_qa.py`.
- **Verification**: PASSED.

### DEF-003: Inconsistent Password Length Boundary
- **Discovery**: `POST /api/v1/auth/change-password` accepted 6-character passwords while frontend and security policy required 8+.
- **Root Cause**: Legacy threshold `< 6`.
- **Fix**: Updated length check to `< 8` returning structured code `PASSWORD_TOO_SHORT`.
- **Regression Test**: Added `test_password_policy_boundary_checks` in `backend/tests/test_adversarial_qa.py`.
- **Verification**: PASSED.

### DEF-004: Password Change Mutation Wiped by Connection Initializer
- **Discovery**: Changing a user's password was immediately reverted on subsequent requests, and Arjun Patel's default login failed.
- **Root Cause**: `conn_()` in `main.py` invoked `db.init(conn)` on every request, which executed `ON CONFLICT DO UPDATE` with hardcoded static hashes from an older iteration round.
- **Fix**: Switched to `INSERT OR IGNORE` in `db.init(conn)` using dynamically computed PBKDF2 hashes, preserving user password mutations.
- **Regression Test**: Full suite regression across `test_change_password_workflow` and `test_password_reset_flow`.
- **Verification**: PASSED (Both tests now succeed).

### DEF-005: Modal Keyboard Navigation & Dialog Accessibility Barrier
- **Discovery**: `ClaimProfileModal` and `ReportDisputeModal` did not respond to `Escape` key presses, could not be dismissed by clicking the overlay, and lacked `role="dialog"`.
- **Root Cause**: Missing keyboard listener in React component lifecycle.
- **Fix**: Added `useEffect` listening for `keydown` with `Escape` key detection, backdrop overlay click handler, `role="dialog"`, `aria-modal="true"`, and `aria-label` on dismiss buttons.
- **Verification**: Frontend build passed, verified with 0 compiler errors.

### DEF-006: Whitespace-Only Data Dispute Submissions
- **Discovery**: `POST /api/v1/players/{id}/correction-requests` accepted submissions containing only spaces or newlines.
- **Root Cause**: Missing `.strip()` validation check.
- **Fix**: Validated that stripped justification is non-empty, raising HTTP 422 `VALIDATION_ERROR` when empty.
- **Regression Test**: Added `test_correction_request_empty_justification_rejected` in `backend/tests/test_adversarial_qa.py`.
- **Verification**: PASSED.
