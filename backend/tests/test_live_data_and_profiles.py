"""Tests for Live Esports Intelligence, Public Profiles, Claim Verification,
Organizations & Permissions, and Shared Scouting Reports (PRD-GOLDEN-002).
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

def test_data_sources_status(client):
    """Test retrieving provider health and telemetry status."""
    res = client.get("/api/v1/data-sources/status")
    assert res.status_code == 200
    data = res.json()
    assert "sources" in data
    assert len(data["sources"]) >= 2
    prov_names = [s["provider"] for s in data["sources"]]
    assert "henrik_valorant" in prov_names
    assert "steam_cs2" in prov_names
    for s in data["sources"]:
        assert s["status"] in ("healthy", "operational", "degraded")
        assert "provenance" in s

def test_data_sources_sync(client, gm_headers):
    """Test triggering telemetry synchronization for a provider."""
    res = client.post("/api/v1/data-sources/henrik_valorant/sync", headers=gm_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert "henrik_valorant" in res.json()["provider"]

    # Invalid provider returns 404
    bad = client.post("/api/v1/data-sources/unknown_provider/sync", headers=gm_headers)
    assert bad.status_code == 404

def test_live_player_search(client):
    """Test unified live search combining local DB and external providers."""
    res = client.get("/api/v1/players/search/live", params={"q": "mirage", "game": "Valorant"})
    assert res.status_code == 200
    data = res.json()
    assert "local_results" in data
    assert "live_results" in data
    assert data["total_found"] >= 1
    # Check Mirage in local results
    local_names = [p["name"].lower() for p in data["local_results"]]
    assert any("mirage" in n for n in local_names)

def test_public_player_profile(client):
    """Test unauthenticated retrieval of public player profile with verified badge."""
    res = client.get("/api/v1/public/players/mirage")
    assert res.status_code == 200
    p = res.json()
    assert p["name"] == "Mirage"
    assert p["slug"] == "mirage"
    assert p["verified_badge"] == 1
    assert "metrics" in p
    assert "provenance" in p
    assert "acs" in p["provenance"]
    assert "external_identities" in p
    assert len(p["external_identities"]) >= 1
    assert p["external_identities"][0]["provider_name"] == "henrik_valorant"

def test_update_player_profile(client, gm_headers):
    """Test authenticated player updating their public bio and social links."""
    update_data = {
        "bio": "Top NA Valorant Controller and certified IGL.",
        "social_links": {"twitter": "@mirage_val", "twitch": "mirage_fps"},
        "is_public": 1,
    }
    res = client.patch("/api/v1/profile", json=update_data, headers=gm_headers)
    assert res.status_code == 200
    assert res.json()["message"] == "Profile updated successfully"

def test_profile_claim_and_review_workflow(client, scout_headers, gm_headers):
    """Test player submitting a verification claim and GM reviewing it."""
    # 1. Scout submits claim for TenZ (VAL-003)
    claim_payload = {
        "verification_method": "riot_oauth",
        "verification_code": "RIOT-AUTH-9921",
        "evidence_text": "Linked Riot Games OAuth token with verified PUUID.",
    }
    submit_res = client.post("/api/v1/players/VAL-003/claim", json=claim_payload, headers=scout_headers)
    assert submit_res.status_code == 200
    claim_id = submit_res.json()["claim_id"]
    assert submit_res.json()["status"] == "pending"

    # 2. GM lists pending claims
    list_res = client.get("/api/v1/claims", headers=gm_headers)
    assert list_res.status_code == 200
    assert any(c["id"] == claim_id for c in list_res.json()["claims"])

    # 3. Non-GM attempting to review should be 403 Forbidden
    forbidden_res = client.patch(f"/api/v1/claims/{claim_id}", json={"status": "approved"}, headers=scout_headers)
    assert forbidden_res.status_code == 403

    # 4. GM approves the claim
    approve_res = client.patch(f"/api/v1/claims/{claim_id}", json={"status": "approved"}, headers=gm_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # 5. Check that TenZ public profile now reflects claimed status
    pub_res = client.get("/api/v1/public/players/tenz")
    assert pub_res.status_code == 200
    assert pub_res.json()["verified_badge"] == 1

def test_organization_and_invitation_lifecycle(client, gm_headers, scout_headers):
    """Test organization creation, invite generation, and member acceptance."""
    # 1. Create new organization
    org_payload = {
        "name": "Cloud9 Operations",
        "slug": "c9-ops",
        "tag": "C9",
        "description": "Championship competitive esports organization.",
    }
    create_res = client.post("/api/v1/organizations", json=org_payload, headers=gm_headers)
    assert create_res.status_code == 200
    org_id = create_res.json()["organization"]["id"]

    # 2. Get organization by slug
    get_res = client.get(f"/api/v1/organizations/{org_id}")
    assert get_res.status_code == 200
    assert get_res.json()["slug"] == "c9-ops"
    assert len(get_res.json()["members"]) >= 1

    # 3. Create invitation for new coach
    inv_payload = {
        "email": "coach@cloud9.gg",
        "role": "coach",
    }
    inv_res = client.post(f"/api/v1/organizations/{org_id}/invitations", json=inv_payload, headers=gm_headers)
    assert inv_res.status_code == 200
    token = inv_res.json()["token"]

    # 4. Inspect invitation unauthenticated
    chk_res = client.get(f"/api/v1/invitations/{token}")
    assert chk_res.status_code == 200
    assert chk_res.json()["role"] == "coach"

    # 5. Accept invitation with scout credentials
    accept_res = client.post(f"/api/v1/invitations/{token}/accept", headers=scout_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["organization_id"] == org_id

def test_shared_scouting_report_lifecycle(client, gm_headers):
    """Test creating a tokenized shareable scouting report, viewing it, and revoking it."""
    # 1. Create shared report for Mirage
    share_payload = {
        "title": "Sentinels Controller Candidate Audit — Mirage",
        "candidate_id": "VAL-002",
        "roster_id": 1,
        "is_public": 1,
        "expires_in_days": 14,
        "payload": {
            "fit_score": 74.8,
            "tactical_archetype": "Anchoring Controller",
            "synergy_delta": 4.2,
            "strengths": ["Site Retention", "Utility Hygiene", "Certified IGL"],
        }
    }
    share_res = client.post("/api/v1/reports/share", json=share_payload, headers=gm_headers)
    assert share_res.status_code == 200
    token = share_res.json()["share_token"]
    assert token is not None

    # 2. View shared report publicly (no auth headers required)
    pub_res = client.get(f"/api/v1/public/reports/{token}")
    assert pub_res.status_code == 200
    rep = pub_res.json()
    assert rep["candidate_name"] == "Mirage"
    assert rep["payload"]["fit_score"] == 74.8

    # 3. Revoke shared report
    revoke_res = client.delete(f"/api/v1/reports/share/{token}", headers=gm_headers)
    assert revoke_res.status_code == 200

    # 4. Attempting to view revoked report should return 404
    after_revoke = client.get(f"/api/v1/public/reports/{token}")
    assert after_revoke.status_code == 404
