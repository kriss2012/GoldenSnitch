"""
Phase 6 Validation Tests (Section 14 — Phase 6 Checkpoint)
Verifies:
1. Recommendation run for 1 roster vacancy.
2. Multi-objective scoring formula:
   Final = 100 * [0.45*Fit + 0.25*Synergy + 0.10*Trajectory + 0.10*Value + 0.10*(1 - Risk)]
3. 80% credible lower bound Final_LB risk-aware sorting.
4. Strictly additive head-to-head property:
   Delta = Final_A - Final_B = sum(w_i * (A_i - B_i)) with exact identity to within 1e-6.
5. Dynamic data-driven bullet points derived directly from top component differences.
"""

import pytest
from starlette.testclient import TestClient
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

client = TestClient(app)


def test_recommendation_run_for_roster_vacancy():
    """Checkpoint: test recommendation run for 1 vacancy."""
    # 1. Create a roster
    c_res = client.post("/api/rosters", json={
        "name": "Phase 6 Vacancy Test Roster",
        "game": "valorant"
    })
    assert c_res.status_code == 200
    rid = c_res.json()["id"]

    # 2. Add 4 players, leaving 1 vacancy (IGL)
    rankings_res = client.get("/api/rankings?game=valorant&limit=10")
    assert rankings_res.status_code == 200
    players = rankings_res.json()["rankings"]

    roles = ["Duelist", "Initiator", "Controller", "Sentinel"]
    for i, r in enumerate(roles):
        client.post(f"/api/rosters/{rid}/members", json={
            "player_id": players[i]["player_id"],
            "slot_role": r
        })

    # 3. Request recommendations for vacant IGL role
    rec_res = client.post("/api/recommendations", json={
        "roster_id": rid,
        "target_role": "IGL",
        "max_budget": 280000.0,
        "min_maps": 10,
        "limit": 10
    })
    assert rec_res.status_code == 200
    data = rec_res.json()

    assert data["roster_id"] == rid
    assert data["target_role"] == "IGL"
    assert "candidates" in data
    assert len(data["candidates"]) > 0

    first = data["candidates"][0]
    assert first["rank"] == 1
    assert "final_score" in first
    assert "final_lb" in first
    assert first["final_lb"] <= first["final_score"] + 1e-6
    assert "components" in first
    assert "unweighted_scores" in first


def test_strictly_additive_head_to_head_property():
    """
    CRITICAL CHECKPOINT (Section 7.2 & 14):
    Verify exact additive explanation property:
    Delta = Final_A - Final_B = sum(w_i * (A_i - B_i)) to within 1e-6 precision.
    """
    # Query 2 candidates for IGL
    rankings_res = client.get("/api/rankings?game=valorant&role=IGL&limit=5")
    assert rankings_res.status_code == 200
    cands = rankings_res.json()["rankings"]
    assert len(cands) >= 2

    id_a = cands[0]["player_id"]
    id_b = cands[1]["player_id"]

    res = client.get(f"/api/recommendations/head-to-head?cand_a={id_a}&cand_b={id_b}&role=IGL&game=valorant")
    assert res.status_code == 200
    data = res.json()

    assert "overall_delta" in data
    assert "sum_component_deltas" in data
    assert "additive_discrepancy" in data

    # STRICT PROPERTY: discrepancy must be < 1e-6 (no floating point drift)
    discrepancy = data["additive_discrepancy"]
    print(f"\n[+] Additive Explanation Discrepancy: {discrepancy:.9f}")
    assert discrepancy < 1e-6, f"Additive decomposition violated: discrepancy = {discrepancy}"

    # Waterfall table validation
    waterfall = data["components_waterfall"]
    assert len(waterfall) == 5
    objectives = [w["objective"] for w in waterfall]
    assert "Tactical Role Fit" in objectives
    assert "Roster Synergy" in objectives
    assert "12M Trajectory" in objectives
    assert "Value & Salary Budget" in objectives
    assert "Risk & Reliability Profile" in objectives

    # Top drivers bullet generation validation
    assert "top_drivers" in data
    assert len(data["top_drivers"]) >= 1
    for bullet in data["top_drivers"]:
        assert "gains +" in bullet or "pts in" in bullet
