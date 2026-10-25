"""
Phase 8 Validation Tests (Section 14 — Phase 8 Checkpoint)
Verifies:
1. Feature 8: PuLP Budget Optimizer (Integer Linear Programming).
2. Feature 9: Meta-Shift Sensitivity Simulator.
3. Feature 10: Workload & Fatigue Risk Monitor.
4. Feature 11: Scouting Report Generator (Executive Markdown Dossier).
5. Feature 12: Natural-Language Scouting Search with Structured Filter Parser.
6. Feature 13: Fairness & Bias Audit (Cohen's d across regions).
7. Feature 14: Academy-to-Main Pipeline Readiness Score.
"""

import pytest
from starlette.testclient import TestClient
try:
    from backend.app.main import app
except ImportError:
    from app.main import app

client = TestClient(app)


def test_feature_8_pulp_budget_optimizer():
    """Verifies PuLP integer linear program finds optimal roster within budget."""
    res = client.post("/api/optimizer/roster", json={
        "game": "valorant",
        "budget_usd": 650000.0,
        "target_roles": ["IGL", "Duelist", "Initiator", "Controller", "Sentinel"]
    })
    assert res.status_code == 200
    data = res.json()

    assert data["status"] in ("Optimal", "Infeasible_Budget")
    if data["status"] == "Optimal":
        assert data["roster_size"] == 5
        assert data["total_salary_spent"] <= 650000.0
        assert data["budget_slack"] >= 0.0
        assert data["average_score"] > 50.0

        # Verify each role is represented exactly once
        roles_chosen = [m["role"] for m in data["selected_roster"]]
        assert len(set(roles_chosen)) == 5


def test_feature_9_meta_shift_simulator():
    """Verifies meta shift simulation on roster scores."""
    # Create test roster
    c_res = client.post("/api/rosters", json={"name": "Phase 8 Meta Squad", "game": "valorant"})
    rid = c_res.json()["id"]

    # Add 2 members
    p_res = client.get("/api/rankings?game=valorant&limit=2")
    players = p_res.json()["rankings"]
    client.post(f"/api/rosters/{rid}/members", json={"player_id": players[0]["player_id"], "slot_role": "IGL"})
    client.post(f"/api/rosters/{rid}/members", json={"player_id": players[1]["player_id"], "slot_role": "Duelist"})

    res = client.post("/api/simulation/meta-shift", json={
        "game": "valorant",
        "roster_id": rid,
        "weight_adjustments": {
            "utility_reliance": 0.20,
            "aggression": -0.15
        }
    })
    assert res.status_code == 200
    data = res.json()

    assert data["roster_id"] == rid
    assert "baseline_roster_score" in data
    assert "meta_shifted_roster_score" in data
    assert "overall_roster_delta" in data
    assert "player_impacts" in data
    assert len(data["player_impacts"]) == 2


def test_feature_10_workload_and_fatigue_monitor():
    """Verifies workload and fatigue calculation."""
    p_res = client.get("/api/rankings?game=valorant&limit=1")
    pid = p_res.json()["rankings"][0]["player_id"]

    res = client.get(f"/api/players/{pid}/workload?game=valorant")
    assert res.status_code == 200
    data = res.json()

    assert data["player_id"] == pid
    assert "fatigue_score" in data
    assert 0.0 <= data["fatigue_score"] <= 100.0
    assert "form_drop_probability" in data
    assert 0.0 <= data["form_drop_probability"] <= 1.0
    assert data["workload_status"] in ("CRITICAL_FATIGUE", "ELEVATED_FATIGUE", "OPTIMAL_CONDITION")


def test_feature_11_scouting_report_generator():
    """Verifies executive markdown dossier generation."""
    p_res = client.get("/api/rankings?game=valorant&limit=1")
    pid = p_res.json()["rankings"][0]["player_id"]

    res = client.post("/api/reports/scouting", json={
        "player_id": pid,
        "game": "valorant"
    })
    assert res.status_code == 200
    data = res.json()

    assert data["player_id"] == pid
    assert "markdown_report" in data
    report = data["markdown_report"]
    assert "SCOUTIQ EXECUTIVE TALENT DOSSIER" in report
    assert "Executive Summary & Credible Metric Bounds" in report
    assert "Financial & Contract Terms" in report


def test_feature_12_natural_language_search():
    """Verifies free-text scouting query parsing into structured filters."""
    res = client.post("/api/search/nl", json={
        "query": "Aggressive duelist in EMEA under $180k with high opening duel win rate",
        "game": "valorant"
    })
    assert res.status_code == 200
    data = res.json()

    assert "parsed_filters" in data
    filters = data["parsed_filters"]
    assert filters["role"] == "Duelist"
    assert filters["region"] == "EMEA"
    assert filters["max_salary"] == 180000
    assert "results" in data


def test_feature_13_fairness_and_bias_audit():
    """Verifies Cohen's d demographic parity across regions."""
    res = client.get("/api/audit/fairness?game=valorant")
    assert res.status_code == 200
    data = res.json()

    assert data["audit_verdict"] == "PASSED_FAIRNESS_STANDARD"
    assert "regional_comparisons" in data
    for comp in data["regional_comparisons"]:
        assert "cohens_d" in comp
        assert "bias_verdict" in comp


def test_feature_14_academy_pipeline_readiness():
    """Verifies Academy/T2 prospect call-up readiness scoring."""
    res = client.get("/api/talent/pipeline-readiness?game=valorant&limit=10")
    assert res.status_code == 200
    data = res.json()

    assert "prospects" in data
    if data["prospects"]:
        first = data["prospects"][0]
        assert "pipeline_readiness_score" in first
        assert 0.0 <= first["pipeline_readiness_score"] <= 100.0
        assert "t1_projected_rating" in first
        assert first["status"] in ("READY_FOR_CALLUP", "DEVELOPING_PROSPECT", "ACADEMY_STABLE")
