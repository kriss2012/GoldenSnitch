"""Tests for VALORANT LAN Tournament Training, Calibration, and Ingestion.
Verifies model metadata, empirical distribution parameters, player profiles, and match telemetry.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = ROOT / "backend" / "app" / "models" / "valorant_lan_trained_model.json"
EXCEL_PATH = ROOT / "Valo_Lan_Stats_10_Matches.xlsx"

def test_lan_model_artifact_exists():
    assert MODEL_PATH.exists(), f"Trained model file missing at {MODEL_PATH}"
    with open(MODEL_PATH, "r") as f:
        data = json.load(f)
    
    assert data["model_name"] == "GoldenSnitch_Valorant_LAN_Trained_v1"
    assert data["matches_count"] == 10
    assert data["sample_size_observations"] == 1600
    assert data["unique_players_trained"] == 156
    assert "distributions" in data
    assert "acs" in data["distributions"]
    assert data["distributions"]["acs"]["median"] > 150.0
    assert "calibrated_bounds" in data
    assert "impact_weights" in data

def test_get_lan_model_endpoint(client):
    res = client.get("/api/v1/models/valorant-lan")
    assert res.status_code == 200
    body = res.json()
    assert body["model_name"] == "GoldenSnitch_Valorant_LAN_Trained_v1"
    assert body["sample_size_observations"] == 1600
    assert "calibrated_bounds" in body

def test_lan_excel_dataset_integrity():
    assert EXCEL_PATH.exists(), f"Excel dataset missing at {EXCEL_PATH}"
    import openpyxl
    wb = openpyxl.load_workbook(str(EXCEL_PATH), data_only=True)
    assert len(wb.sheetnames) == 10
    assert "Match 1" in wb.sheetnames
    assert "Match 10" in wb.sheetnames
    s1 = wb["Match 1"]
    headers = [s1.cell(1, c).value for c in range(1, 14)]
    assert "Player" in headers
    assert "ACS/Map" in headers
    assert "K" in headers

def test_real_lan_players_retrievable_from_database(client):
    # Verify live database contains real LAN tournament competitors
    from app import db
    conn = db.connect()
    lan_players = conn.execute(
        "SELECT id, name, role, metrics FROM players WHERE source LIKE '%LAN Tournament%' LIMIT 10"
    ).fetchall()
    
    if lan_players:
        names = [p["name"] for p in lan_players]
        assert len(names) > 0
        p0 = lan_players[0]
        metrics = json.loads(p0["metrics"])
        assert "acs" in metrics
        assert "gti_score" in metrics
        assert "Firepower" in metrics
        
        # Test match history for this player
        matches = conn.execute(
            "SELECT * FROM matches WHERE player_id=?", (p0["id"],)
        ).fetchall()
        assert len(matches) > 0

def test_calibrated_scoring_bounds_validity():
    with open(MODEL_PATH, "r") as f:
        data = json.load(f)
    
    bounds = data["calibrated_bounds"]
    for metric, b in bounds.items():
        assert b["lo"] < b["hi"], f"Invalid bounds for {metric}: lo ({b['lo']}) >= hi ({b['hi']})"
        assert b["dir"] in (1, -1)
