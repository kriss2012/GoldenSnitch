"""
Phase 4 Validation Tests (Section 14 — Phase 4 Checkpoint)
Verifies:
1. 50-player ranking query on GET /api/rankings with credible lower bounds and confidence.
2. Dynamic weight adjustment and preset switching via POST /api/rankings.
3. Role, Tier, and Region filtering consistency.
4. IGL deep-dive breakdown on GET /api/igl/{player_id}/breakdown (8-axis radar, side splits, adaptation).
5. IGL timeline of decisions with win-probability added (WPA) on GET /api/igl/{player_id}/decisions.
"""

from starlette.testclient import TestClient
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

client = TestClient(app)


def test_rankings_default_query():
    """Checkpoint: test with 50-player ranking query."""
    res = client.get("/api/rankings?game=valorant&limit=50")
    assert res.status_code == 200
    data = res.json()
    
    assert data["game"] == "valorant"
    assert "rankings" in data
    assert len(data["rankings"]) > 0
    assert len(data["rankings"]) <= 50

    first = data["rankings"][0]
    assert first["rank"] == 1
    assert "player_id" in first
    assert "handle" in first
    assert "overall_score" in first
    assert "final_lb" in first
    assert "confidence" in first
    assert "sub_scores" in first
    assert "contract" in first
    assert first["final_lb"] <= first["overall_score"] + 1e-6


def test_rankings_dynamic_weight_presets():
    """Checkpoint: slider tweak and presets update rankings live."""
    # Balanced preset
    res_bal = client.post("/api/rankings", json={
        "game": "valorant",
        "role": "IGL",
        "preset": "balanced",
        "limit": 10
    })
    assert res_bal.status_code == 200
    bal_rankings = res_bal.json()["rankings"]

    # Economy focused preset
    res_eco = client.post("/api/rankings", json={
        "game": "valorant",
        "role": "IGL",
        "preset": "economy_focused",
        "limit": 10
    })
    assert res_eco.status_code == 200
    eco_rankings = res_eco.json()["rankings"]

    assert len(bal_rankings) > 0
    assert len(eco_rankings) > 0

    # Scores should be computed based on the specific weights
    first_bal = bal_rankings[0]
    assert "overall_score" in first_bal


def test_rankings_filtering():
    """Verify role, tier, and region filters."""
    res = client.get("/api/rankings?game=valorant&role=Duelist&tier=T1&limit=20")
    assert res.status_code == 200
    data = res.json()
    for item in data["rankings"]:
        assert item["role"] == "Duelist"
        assert item["tier"] == "T1"


def test_igl_deep_dive_breakdown():
    """Checkpoint: IGL deep-dive breakdown load."""
    # Find an IGL
    res_list = client.get("/api/rankings?game=valorant&role=IGL&limit=1")
    assert res_list.status_code == 200
    igl_player = res_list.json()["rankings"][0]
    pid = igl_player["player_id"]

    res = client.get(f"/api/igl/{pid}/breakdown?game=valorant")
    assert res.status_code == 200
    data = res.json()

    assert data["player_id"] == pid
    assert "radar" in data
    assert len(data["radar"]) == 8  # 8-axis radar chart
    
    # Verify radar items have metric, value, peer benchmark, and weight
    for axis in data["radar"]:
        assert "metric" in axis
        assert "value" in axis
        assert "peer" in axis
        assert "weight" in axis

    assert "side_splits" in data
    assert "attack_win_rate" in data["side_splits"]
    assert "defense_win_rate" in data["side_splits"]
    assert "call_win_delta_attack" in data["side_splits"]

    assert "adaptation_profile" in data
    assert "mid_round_switch_rate" in data["adaptation_profile"]

    assert "economy_conversion" in data
    assert "force_buy_win_rate" in data["economy_conversion"]


def test_igl_decisions_timeline():
    """Checkpoint: IGL decision timeline with WPA before/after."""
    res_list = client.get("/api/rankings?game=valorant&role=IGL&limit=1")
    pid = res_list.json()["rankings"][0]["player_id"]

    res = client.get(f"/api/igl/{pid}/decisions?limit=25")
    assert res.status_code == 200
    data = res.json()

    assert data["player_id"] == pid
    assert "timeline" in data
    if len(data["timeline"]) > 0:
        decision = data["timeline"][0]
        assert "round_number" in decision
        assert "call_type" in decision
        assert "p_before" in decision
        assert "p_after" in decision
        assert "wpa_delta" in decision
        assert "description" in decision
