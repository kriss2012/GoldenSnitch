"""
Phase 5 Validation Tests (Section 14 — Phase 5 Checkpoint)
Verifies:
1. Multi-game roster creation and evaluation across Valorant, CS2, LoL, and Dota 2.
2. Synergy Matrix calculations and overall roster synergy coefficient S_roster in [0.70, 1.30].
3. Roster Health Index (RHI) in [0, 100].
4. Trajectory Engine: Theil-Sen slope, Mann-Kendall trend test, and EWMA series.
5. Automatic Gap Diagnosis: weakest slot, missing tactical attributes, and suggested solutions.
"""

from starlette.testclient import TestClient
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

client = TestClient(app)


def test_trajectory_engine_math():
    from app.metrics.trajectory import compute_theil_sen_slope, compute_mann_kendall_test, compute_ewma

    # Line with slope 2.0
    x = [0.0, 1.0, 2.0, 3.0, 4.0]
    y = [10.0, 12.0, 14.0, 16.0, 18.0]
    slope = compute_theil_sen_slope(x, y)
    assert abs(slope - 2.0) < 1e-6

    # Strictly increasing sequence -> Mann-Kendall should be improving
    mk = compute_mann_kendall_test(y)
    assert mk["trend"] == "improving"
    assert mk["z_score"] > 1.96

    # EWMA verification (alpha = 0.20)
    ewma = compute_ewma([50.0, 60.0, 70.0], alpha=0.20)
    assert ewma[0] == 50.0
    # 0.2 * 60 + 0.8 * 50 = 12 + 40 = 52.0
    assert abs(ewma[1] - 52.0) < 1e-6


def test_create_roster_and_evaluate_synergy_valorant():
    """Checkpoint: Create and evaluate Valorant roster; verify synergy matrix and RHI."""
    # 1. Create Roster
    res = client.post("/api/rosters", json={
        "name": "Phase 5 Sentinels Core",
        "game": "valorant"
    })
    assert res.status_code == 200
    rid = res.json()["id"]

    # 2. Query 5 players from database for Valorant
    rankings_res = client.get("/api/rankings?game=valorant&limit=20")
    assert rankings_res.status_code == 200
    candidates = rankings_res.json()["rankings"]
    assert len(candidates) >= 5

    roles_to_assign = ["IGL", "Duelist", "Initiator", "Controller", "Sentinel"]
    for idx, rname in enumerate(roles_to_assign):
        pid = candidates[idx]["player_id"]
        add_res = client.post(f"/api/rosters/{rid}/members", json={
            "player_id": pid,
            "slot_role": rname
        })
        assert add_res.status_code == 200

    # 3. Evaluate detailed roster view
    roster_res = client.get(f"/api/rosters/{rid}")
    assert roster_res.status_code == 200
    r_data = roster_res.json()
    assert r_data["id"] == rid
    assert r_data["members_count"] == 5
    assert 0.0 <= r_data["roster_health_index"] <= 100.0
    assert 0.70 <= r_data["synergy_coefficient"] <= 1.30

    # 4. Synergy Matrix endpoint
    syn_res = client.get(f"/api/rosters/{rid}/synergy")
    assert syn_res.status_code == 200
    syn_data = syn_res.json()
    assert 0.70 <= syn_data["synergy_coefficient"] <= 1.30
    assert len(syn_data["pairwise_synergy"]) == 10  # 5 * 4 / 2 = 10 pairs
    
    first_pair = syn_data["pairwise_synergy"][0]
    assert "player_a" in first_pair
    assert "player_b" in first_pair
    assert "complementarity" in first_pair
    assert "synergy_score" in first_pair

    # 5. Diagnosis endpoint
    diag_res = client.get(f"/api/rosters/{rid}/diagnosis")
    assert diag_res.status_code == 200
    diag_data = diag_res.json()["diagnosis"]
    assert "weakest_slot" in diag_data
    assert "suggested_solutions" in diag_data

    # 6. Trajectory endpoint
    traj_res = client.get(f"/api/rosters/{rid}/trajectory")
    assert traj_res.status_code == 200
    traj_data = traj_res.json()["trajectory"]
    assert "slope_per_month" in traj_data
    assert "mann_kendall" in traj_data
    assert "trajectory_points" in traj_data
    assert len(traj_data["trajectory_points"]) == 12


def test_multi_game_roster_evaluation():
    """Checkpoint: evaluate rosters across CS2, LoL, and Dota 2."""
    for game in ["cs2", "lol", "dota2"]:
        # Query players for game
        p_res = client.get(f"/api/rankings?game={game}&limit=5")
        assert p_res.status_code == 200
        p_list = p_res.json()["rankings"]
        assert len(p_list) >= 3

        # Create roster
        c_res = client.post("/api/rosters", json={
            "name": f"Test Roster ({game})",
            "game": game
        })
        assert c_res.status_code == 200
        rid = c_res.json()["id"]

        for p in p_list[:3]:
            client.post(f"/api/rosters/{rid}/members", json={
                "player_id": p["player_id"],
                "slot_role": p["role"]
            })

        # Evaluate
        eval_res = client.get(f"/api/rosters/{rid}")
        assert eval_res.status_code == 200
        data = eval_res.json()
        assert data["game"] == game
        assert 0.70 <= data["synergy_coefficient"] <= 1.30
        assert 0.0 <= data["roster_health_index"] <= 100.0
