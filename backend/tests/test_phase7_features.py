"""
Phase 7 Validation Tests (Section 14 — Phase 7 Checkpoint)
Verifies:
1. Feature 1: Counterfactual Roster Simulator (Monte Carlo >= 5,000 runs, 95% CI).
2. Feature 2: IGL Decision Replay Lab (WPA by tactical call type).
3. Feature 3: Hidden Gem Finder (ExpectedMarketSalary - AskSalary surplus value).
4. Feature 4: Stat-Padder & Small-Sample Hype Detector.
5. Feature 5: Cross-Title Talent Transfer Index.
6. Feature 6: Similar Player Search (k-NN Cosine Similarity).
7. Feature 7: Role-Succession & Depth Planner.
"""

import pytest
from starlette.testclient import TestClient
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_test_roster():
    # Create a Valorant roster with 5 players
    c_res = client.post("/api/rosters", json={"name": "Phase 7 Test Squad", "game": "valorant"})
    rid = c_res.json()["id"]

    p_res = client.get("/api/rankings?game=valorant&limit=10")
    players = p_res.json()["rankings"]

    roles = ["IGL", "Duelist", "Initiator", "Controller", "Sentinel"]
    for i, r in enumerate(roles):
        client.post(f"/api/rosters/{rid}/members", json={
            "player_id": players[i]["player_id"],
            "slot_role": r
        })

    return {
        "roster_id": rid,
        "starter_ids": [players[i]["player_id"] for i in range(5)],
        "alternate_candidate_id": players[6]["player_id"],
        "igl_id": players[0]["player_id"]
    }


def test_feature_1_counterfactual_roster_simulator(setup_test_roster):
    """Verifies counterfactual simulator runs 5000 simulations and computes 95% CI."""
    rid = setup_test_roster["roster_id"]
    p_out = setup_test_roster["starter_ids"][1]  # Swap out duelist
    c_in = setup_test_roster["alternate_candidate_id"]

    res = client.post("/api/simulator/counterfactual", json={
        "roster_id": rid,
        "player_out_id": p_out,
        "candidate_in_id": c_in,
        "n_simulations": 5000
    })
    assert res.status_code == 200
    data = res.json()

    assert data["roster_id"] == rid
    assert data["simulations_run"] == 5000
    assert "baseline" in data
    assert "counterfactual" in data
    assert "win_rate_delta_pct" in data
    assert "confidence_interval_95" in data
    assert len(data["confidence_interval_95"]) == 2
    assert data["confidence_interval_95"][0] <= data["confidence_interval_95"][1]
    assert data["recommendation"] in ("DEFINITE_UPGRADE", "MARGINAL_UPGRADE", "DOWNGRADE_RISK")


def test_feature_2_igl_replay_lab(setup_test_roster):
    """Verifies IGL Decision Replay Lab computes WPA by call type."""
    igl_id = setup_test_roster["igl_id"]
    res = client.get(f"/api/igl/{igl_id}/replay-lab?limit=30")
    assert res.status_code == 200
    data = res.json()

    assert data["player_id"] == igl_id
    assert "total_calls_analyzed" in data
    assert "call_type_effectiveness" in data
    assert "replay_timeline" in data

    if data["replay_timeline"]:
        first = data["replay_timeline"][0]
        assert "p_before" in first
        assert "p_after" in first
        assert "wpa" in first
        assert "call_type" in first


def test_feature_3_hidden_gem_finder():
    """Verifies Hidden Gem Finder identifies surplus value and positive ROI multiples."""
    res = client.get("/api/scouting/hidden-gems?game=valorant&limit=10")
    assert res.status_code == 200
    data = res.json()

    assert data["game"] == "valorant"
    assert "hidden_gems" in data
    if data["hidden_gems"]:
        gem = data["hidden_gems"][0]
        assert gem["surplus_value"] > 0
        assert gem["roi_multiple"] >= 1.0
        assert gem["role_fit"] >= 60.0
        assert "ask_salary" in gem
        assert "expected_market_salary" in gem


def test_feature_4_stat_padder_and_hype_detector():
    """Verifies Stat-Padder and Small-Sample Hype Detector flags."""
    res = client.get("/api/scouting/stat-padders-and-hype?game=valorant&limit=15")
    assert res.status_code == 200
    data = res.json()

    assert data["game"] == "valorant"
    assert "profiles" in data
    if data["profiles"]:
        first = data["profiles"][0]
        assert "risk_flags" in first
        assert len(first["risk_flags"]) > 0
        assert "flag_reasons" in first


def test_feature_5_cross_title_talent_transfer():
    """Verifies cross-title transferable skill vector between CS2 and Valorant."""
    # Find a CS2 player
    p_res = client.get("/api/rankings?game=cs2&limit=1")
    assert p_res.status_code == 200
    cs_player = p_res.json()["rankings"][0]["player_id"]

    res = client.get(f"/api/talent/cross-title-transfer?player_id={cs_player}&source_game=cs2&target_game=valorant")
    assert res.status_code == 200
    data = res.json()

    assert data["source_game"] == "cs2"
    assert data["target_game"] == "valorant"
    assert 0.0 <= data["transfer_readiness_index"] <= 100.0
    assert "vectors" in data
    assert "mechanical_overlap" in data["vectors"]
    assert "estimated_transition_weeks" in data


def test_feature_6_similar_player_search():
    """Verifies cosine distance k-NN similar player search."""
    p_res = client.get("/api/rankings?game=valorant&limit=1")
    assert p_res.status_code == 200
    target_id = p_res.json()["rankings"][0]["player_id"]

    res = client.get(f"/api/players/{target_id}/similar?game=valorant&k=5")
    assert res.status_code == 200
    data = res.json()

    assert data["target_player_id"] == target_id
    assert "similar_players" in data
    assert len(data["similar_players"]) <= 5
    if data["similar_players"]:
        first = data["similar_players"][0]
        assert "similarity_score" in first
        assert 0.0 <= first["similarity_score"] <= 100.0


def test_feature_7_role_succession_and_depth_planner(setup_test_roster):
    """Verifies depth chart and position vulnerability scoring."""
    rid = setup_test_roster["roster_id"]
    res = client.get(f"/api/rosters/{rid}/depth-chart")
    assert res.status_code == 200
    data = res.json()

    assert data["roster_id"] == rid
    assert "depth_chart" in data
    assert len(data["depth_chart"]) == 5  # 5 starting slots
    first = data["depth_chart"][0]
    assert "starter" in first
    assert "succession_pipeline" in first
    assert "vulnerability_score" in first
    assert 0.0 <= first["vulnerability_score"] <= 100.0
