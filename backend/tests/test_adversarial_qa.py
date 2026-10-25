"""Aggressive Adversarial QA, Penetration, and Fault-Injection Test Suite.
Tests authentication bypass, IDOR, token forgery, SQL injection resistance,
boundary validation, and RBAC permissions across Golden Snitch endpoints.
"""
import pytest
from starlette.testclient import TestClient
try:
    from backend.app.main import app
    from backend.app import db, auth
except ImportError:
    from app.main import app
    from app import db, auth

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_users():
    c = db.connect()
    # Ensure QA scout exists in database
    c.execute(
        "INSERT OR REPLACE INTO users(id, username, name, role, organization, salt, password_hash) VALUES(?,?,?,?,?,?,?)",
        ("USR-QA-SCOUT", "qa_scout", "QA Scout", "ROLE_SCOUT", "Rival Esports", "salt123", "hash123")
    )
    
    # Generate tokens directly
    gm_user = auth.User(id="USR-001", username="maya", name="General Manager", role="ROLE_GM", organization="Logic Legend Esports")
    scout_user = auth.User(id="USR-QA-SCOUT", username="qa_scout", name="QA Scout", role="ROLE_SCOUT", organization="Rival Esports")
    gm_token = auth.create_access_token(gm_user)
    scout_token = auth.create_access_token(scout_user)
    
    # Create an isolated test org owned by GM
    test_org_id = "ORG-ADVERSARIAL-01"
    existing = c.execute("SELECT id FROM organizations WHERE id=?", (test_org_id,)).fetchone()
    if not existing:
        c.execute(
            "INSERT INTO organizations(id, name, slug, tag, owner_id) VALUES(?, ?, ?, ?, ?)",
            (test_org_id, "Adversarial Test Org", "adversarial-org", "ADV", "USR-001")
        )
        c.execute(
            "INSERT INTO organization_members(id, organization_id, user_id, role) VALUES(?, ?, ?, ?)",
            ("MEM-ADV-01", test_org_id, "USR-001", "owner")
        )
    c.commit()
    c.close()
    
    return {
        "gm_headers": {"Authorization": f"Bearer {gm_token}"},
        "scout_headers": {"Authorization": f"Bearer {scout_token}"},
        "test_org_id": test_org_id
    }

# -------------------------------------------------------------------------
# 1. Unauthenticated Access & Token Rejection Tests
# -------------------------------------------------------------------------

def test_unauthenticated_requests_strictly_rejected():
    """Verify that protected endpoints reject requests lacking Authorization headers with HTTP 401."""
    protected_endpoints = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/users/me/export"),
        ("GET", "/api/v1/watchlist"),
        ("GET", "/api/v1/notifications"),
        ("GET", "/api/v1/organizations"),
        ("POST", "/api/v1/auth/change-password"),
        ("DELETE", "/api/v1/users/me"),
    ]
    for method, path in protected_endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "POST":
            res = client.post(path, json={})
        elif method == "DELETE":
            res = client.delete(path)
        assert res.status_code == 401, f"Expected 401 for {method} {path}, got {res.status_code}"

def test_malformed_and_forged_tokens_rejected():
    """Adversarial token forgery: none algorithm, signature manipulation, garbage strings."""
    garbage_tokens = [
        "not.a.token",
        "Bearer garbage",
        "Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJVU1ItMDAxIiwidXNlcm5hbWUiOiJtYXlhIn0.",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1ItMDAxIn0.invalidsig123",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.corrupted_json.invalidsig",
    ]
    for bad_header in garbage_tokens:
        res = client.get("/api/v1/auth/me", headers={"Authorization": bad_header})
        assert res.status_code == 401

# -------------------------------------------------------------------------
# 2. Broken Object Level Authorization (IDOR) Tests
# -------------------------------------------------------------------------

def test_idor_organization_invitation_prevention(setup_users):
    """User without owner/manager role in target organization cannot generate invitations."""
    scout_headers = setup_users["scout_headers"]
    org_id = setup_users["test_org_id"]
    
    # Arjun (Scout, not a member of test org) attempts to generate an invite
    res = client.post(
        f"/api/v1/organizations/{org_id}/invitations",
        json={"email": "attacker@esports.gg", "role": "admin"},
        headers=scout_headers
    )
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "FORBIDDEN"

def test_scout_cannot_review_claims_or_resolve_disputes(setup_users):
    """Privilege escalation: scout role cannot approve claims or resolve disputes."""
    scout_headers = setup_users["scout_headers"]
    
    # 1. Attempt claim review
    claim_res = client.patch(
        "/api/v1/claims/CLM-NONEXISTENT",
        json={"status": "approved"},
        headers=scout_headers
    )
    assert claim_res.status_code == 403

    # 2. Attempt dispute resolution
    disp_res = client.patch(
        "/api/v1/correction-requests/COR-NONEXISTENT",
        json={"status": "resolved"},
        headers=scout_headers
    )
    assert disp_res.status_code == 403

def test_unauthorized_shared_report_revocation(setup_users):
    """Users cannot revoke report share tokens created by other users."""
    gm_headers = setup_users["gm_headers"]
    scout_headers = setup_users["scout_headers"]
    
    # 1. GM creates a shared report
    share_res = client.post(
        "/api/v1/reports/share",
        json={"title": "Private GM Report", "candidate_id": "VAL-002", "roster_id": 4},
        headers=gm_headers
    )
    assert share_res.status_code == 200
    token = share_res.json()["share_token"]
    
    # 2. Scout attempts to revoke GM's report
    revoke_res = client.delete(f"/api/v1/reports/share/{token}", headers=scout_headers)
    assert revoke_res.status_code == 404  # Not found or unauthorized for that user

# -------------------------------------------------------------------------
# 3. Input Validation, Boundaries & Injection Resistance
# -------------------------------------------------------------------------

def test_sql_injection_resistance():
    """Inject malicious SQL strings into queries, player search, and filters."""
    sqli_payloads = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "VAL-002' UNION SELECT username, password_hash FROM users --",
        "1' ORDER BY 1--+",
    ]
    for payload in sqli_payloads:
        # Search endpoint
        res = client.get("/api/players", params={"q": payload})
        assert res.status_code == 200
        assert isinstance(res.json().get("items"), list)
        
        # Rankings endpoint
        r_rank = client.get("/api/rankings", params={"game": "valorant", "role": payload})
        assert r_rank.status_code in (200, 422)

def test_password_policy_boundary_checks(setup_users):
    """Verify minimum 8 characters password policy."""
    gm_headers = setup_users["gm_headers"]
    
    # 7 characters (boundary failure)
    res_7 = client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "admin123", "new_password": "1234567"},
        headers=gm_headers
    )
    assert res_7.status_code == 422
    assert res_7.json()["error"]["code"] == "PASSWORD_TOO_SHORT"

def test_correction_request_empty_justification_rejected(setup_users):
    """Dispute submission requires non-empty justification."""
    scout_headers = setup_users["scout_headers"]
    
    res = client.post(
        "/api/v1/players/VAL-002/correction-requests",
        json={"issue_type": "incorrect_stats", "justification": "   \n\t  "},
        headers=scout_headers
    )
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "VALIDATION_ERROR"
