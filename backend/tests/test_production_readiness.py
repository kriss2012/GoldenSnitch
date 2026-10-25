"""Production Readiness, Health Monitoring, User Rights & Data Dispute Tests (PRD-PROD-001).
Tests health check endpoints, self-service password change, GDPR data export,
account deletion, and data correction/dispute workflows.
"""
import pytest
from app.auth import create_access_token, User

@pytest.fixture
def gm_headers():
    user = User(id="USR-001", username="maya", name="General Manager", role="ROLE_GM", organization="Logic Legend Esports")
    token = create_access_token(user)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def scout_headers():
    user = User(id="USR-003", username="arjun", name="Talent Scout", role="ROLE_SCOUT", organization="Logic Legend Esports")
    token = create_access_token(user)
    return {"Authorization": f"Bearer {token}"}

def test_system_health_check(client):
    """Test /health and /api/v1/health operational status."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["database"] == "connected"
    assert "providers" in data
    assert len(data["providers"]) >= 2
    assert data["version"] == "2.0.0"

    v1_res = client.get("/api/v1/health")
    assert v1_res.status_code == 200
    assert v1_res.json()["database"] == "connected"

def test_change_password_workflow(client, gm_headers):
    """Test user changing password with current password verification."""
    # 1. Invalid current password fails with 400
    bad_payload = {
        "current_password": "wrongpassword999",
        "new_password": "newSecurePassword2026!"
    }
    bad_res = client.post("/api/v1/auth/change-password", json=bad_payload, headers=gm_headers)
    assert bad_res.status_code == 400
    assert bad_res.json()["error"]["code"] == "INVALID_PASSWORD"

    # 2. Too short new password fails with 422
    short_payload = {
        "current_password": "admin123",
        "new_password": "123"
    }
    short_res = client.post("/api/v1/auth/change-password", json=short_payload, headers=gm_headers)
    assert short_res.status_code == 422

    # 3. Valid password change succeeds
    valid_payload = {
        "current_password": "admin123",
        "new_password": "newSecurePassword2026!"
    }
    res = client.post("/api/v1/auth/change-password", json=valid_payload, headers=gm_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    # 4. Login with old password fails
    old_login = client.post("/api/auth/login", json={"username": "maya", "password": "admin123"})
    assert old_login.status_code == 401

    # 5. Login with new password succeeds
    new_login = client.post("/api/auth/login", json={"username": "maya", "password": "newSecurePassword2026!"})
    assert new_login.status_code == 200

def test_gdpr_user_data_export(client, gm_headers):
    """Test user exporting their full personal data bundle."""
    res = client.get("/api/v1/users/me/export", headers=gm_headers)
    assert res.status_code == 200
    data = res.json()
    assert "export" in data
    exp = data["export"]
    assert exp["username"] == "maya"
    assert "watchlist" in exp
    assert "scouting_annotations" in exp
    assert "profile_claims" in exp
    assert "correction_requests" in exp

def test_data_correction_and_dispute_workflow(client, scout_headers, gm_headers):
    """Test submitting and resolving a data correction / dispute request."""
    # 1. Scout submits data correction request for Mirage (VAL-002)
    payload = {
        "issue_type": "incorrect_stats",
        "description": "Round 14 ACS shows 240 instead of 255 from official tournament log.",
        "evidence_url": "https://vlr.gg/match/12345/sentinels-vs-leviatan"
    }
    submit_res = client.post("/api/v1/players/VAL-002/correction-requests", json=payload, headers=scout_headers)
    assert submit_res.status_code == 200
    req_id = submit_res.json()["request_id"]
    assert submit_res.json()["status"] == "pending"

    # 2. Non-GM attempting to list all dispute requests should be 403 Forbidden
    forbidden_list = client.get("/api/v1/correction-requests", headers=scout_headers)
    assert forbidden_list.status_code == 403

    # 3. GM lists all pending dispute requests
    gm_list = client.get("/api/v1/correction-requests", headers=gm_headers)
    assert gm_list.status_code == 200
    assert any(r["id"] == req_id for r in gm_list.json()["requests"])

    # 4. GM resolves the dispute
    resolve_res = client.patch(f"/api/v1/correction-requests/{req_id}", json={"status": "resolved"}, headers=gm_headers)
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"

def test_user_account_deletion_workflow(client):
    """Test creating a temporary user, then deleting their account and verifying cleanup."""
    # 1. Register temporary user
    reg = client.post("/api/auth/register", json={
        "username": "tempuser",
        "name": "Temporary User",
        "password": "Password123!",
        "role": "ROLE_SCOUT",
        "organization": "Test Org"
    })
    assert reg.status_code in (200, 201)
    token = reg.json()["access_token"]
    temp_headers = {"Authorization": f"Bearer {token}"}

    # 2. Delete own account
    del_res = client.delete("/api/v1/users/me", headers=temp_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "ok"

    # 3. Attempting to use the deleted account token should fail (token revoked / user removed)
    check_res = client.get("/api/v1/users/me/export", headers=temp_headers)
    assert check_res.status_code == 401
