"""Unit & Integration tests for the Esports Cognitive & Performance Assessment Suite."""
from starlette.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def create_sample_attempt():
    payload = {
        "player_id": "ply_valorant_001",
        "assessment_type": "reaction_time",
        "input_method": "mouse",
        "configuration": {"trials_required": 5}
    }
    res = client.post("/api/cognitive/attempts/start", json=payload)
    assert res.status_code == 200
    data = res.json()
    return data["id"]


def test_start_cognitive_attempt():
    aid = create_sample_attempt()
    assert aid.startswith("ATT-REA-")


def test_record_telemetry_event():
    attempt_id = create_sample_attempt()
    event_payload = {
        "event_type": "stimulus_presented",
        "event_timestamp": 12450.5,
        "event_payload": {"trial_index": 1, "delay_ms": 2350}
    }
    res = client.post(f"/api/cognitive/attempts/{attempt_id}/event", json=event_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["attempt_id"] == attempt_id
    assert data["event_type"] == "stimulus_presented"


def test_finalize_reaction_time_attempt():
    attempt_id = create_sample_attempt()
    raw_results = {
        "trials": [210.5, 195.0, 225.4, 202.1, 208.0],
        "false_starts": 1
    }
    res = client.post(
        f"/api/cognitive/attempts/{attempt_id}/finalize",
        json={"raw_results": raw_results, "input_method": "mouse"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert data["primary_metric"] == "median_rt_ms"
    assert data["primary_value"] == 208.0
    computed = data["computed_results"]
    assert computed["median_rt_ms"] == 208.0
    assert computed["fastest_rt_ms"] == 195.0
    assert computed["false_starts"] == 1
    assert computed["valid_trials"] == 5

    # Test idempotency (cannot finalize twice)
    res_duplicate = client.post(
        f"/api/cognitive/attempts/{attempt_id}/finalize",
        json={"raw_results": raw_results}
    )
    assert res_duplicate.status_code == 409


def test_sequence_memory_assessment():
    start_res = client.post("/api/cognitive/attempts/start", json={
        "player_id": "ply_valorant_001",
        "assessment_type": "sequence_memory",
        "input_method": "mouse"
    })
    attempt_id = start_res.json()["id"]

    raw = {
        "highest_level_completed": 8,
        "total_successful_rounds": 8,
        "total_correct_inputs": 44,
        "total_incorrect_inputs": 1,
        "total_time_ms": 18500.0
    }
    res = client.post(f"/api/cognitive/attempts/{attempt_id}/finalize", json={"raw_results": raw})
    assert res.status_code == 200
    data = res.json()
    assert data["primary_metric"] == "highest_level_completed"
    assert data["primary_value"] == 8.0
    assert data["computed_results"]["accuracy_pct"] == round(44 / 45 * 100, 2)


def test_aim_trainer_assessment():
    start_res = client.post("/api/cognitive/attempts/start", json={
        "player_id": "ply_valorant_001",
        "assessment_type": "aim_trainer",
        "input_method": "mouse"
    })
    attempt_id = start_res.json()["id"]

    raw = {
        "target_times": [410.0, 390.0, 430.0, 380.0, 400.0] * 6, # 30 targets
        "targets_hit": 30,
        "missed_clicks": 3,
        "total_completion_time_ms": 12060.0
    }
    res = client.post(f"/api/cognitive/attempts/{attempt_id}/finalize", json={"raw_results": raw})
    assert res.status_code == 200
    data = res.json()
    assert data["primary_metric"] == "avg_time_per_target_ms"
    assert data["computed_results"]["targets_hit"] == 30
    assert data["computed_results"]["missed_clicks"] == 3
    assert data["computed_results"]["accuracy_pct"] == round(30 / 33 * 100, 2)
    assert data["computed_results"]["targets_per_second"] > 0


def test_visual_memory_assessment():
    start_res = client.post("/api/cognitive/attempts/start", json={
        "player_id": "ply_valorant_001",
        "assessment_type": "visual_memory",
        "input_method": "mouse"
    })
    attempt_id = start_res.json()["id"]

    raw = {
        "highest_level_completed": 9,
        "total_correct_tiles": 35,
        "total_incorrect_tiles": 2,
        "total_missed_tiles": 3,
        "total_response_time_ms": 14200.0
    }
    res = client.post(f"/api/cognitive/attempts/{attempt_id}/finalize", json={"raw_results": raw})
    assert res.status_code == 200
    data = res.json()
    assert data["primary_metric"] == "highest_level_completed"
    assert data["computed_results"]["precision"] > 0.90
    assert data["computed_results"]["recall"] > 0.90
    assert data["computed_results"]["f1_score"] > 0.90


def test_personal_bests_and_performance_report():
    # Fetch personal bests
    bests_res = client.get("/api/cognitive/players/ply_valorant_001/personal-bests")
    assert bests_res.status_code == 200
    bests = bests_res.json()["personal_bests"]
    assert "reaction_time" in bests
    assert "sequence_memory" in bests
    assert "aim_trainer" in bests
    assert "visual_memory" in bests

    # Fetch full report
    report_res = client.get("/api/cognitive/players/ply_valorant_001/report")
    assert report_res.status_code == 200
    rep = report_res.json()
    assert rep["completion_percentage"] == 100.0
    assert rep["assessments_completed"] == 4
    assert rep["experimental_composite_index"] is not None
    assert len(rep["strengths"]) > 0
