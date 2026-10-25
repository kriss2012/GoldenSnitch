"""
Test ScoutIQ Core Schema (Section 4.2)
Verifies that all core tables, indexes, and constraints exist in SQLite.
"""

from app.db import connect, init


def test_core_schema_tables_exist():
    conn = connect()
    init(conn)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cursor.fetchall()}

    expected_tables = [
        "games",
        "organizations",
        "players",
        "teams",
        "rosters",
        "roster_slots",
        "contracts",
        "matches",
        "maps_or_games",
        "rounds",
        "round_events",
        "player_map_stats",
        "objective_events",
        "comms_proxy",
        "player_metric_snapshots",
        "scores",
        "recommendations",
        "pipeline_stages",
        "audit_log",
        "_ground_truth",
    ]

    for table in expected_tables:
        assert table in tables, f"Expected table '{table}' to be created in database"


def test_ground_truth_table_columns():
    conn = connect()
    init(conn)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(_ground_truth)")
    cols = {row[1] for row in cursor.fetchall()}

    expected_cols = {
        "player_id", "aim", "game_sense", "consistency", "clutch",
        "leadership", "adaptability", "comms", "form_trend", "age_curve",
        "hidden_potential", "archetype"
    }
    assert expected_cols.issubset(cols), f"Missing latent columns in _ground_truth: {expected_cols - cols}"


def test_game_roles_endpoint(client):
    res = client.get("/api/games/valorant/roles")
    assert res.status_code == 200
    data = res.json()
    assert data["game_id"] == "valorant"
    assert len(data["roles"]) >= 5
    role_ids = {r["id"] for r in data["roles"]}
    assert "IGL" in role_ids
    assert "Duelist" in role_ids


def test_methodology_endpoint(client):
    res = client.get("/api/methodology")
    assert res.status_code == 200
    data = res.json()
    assert "methodology_markdown" in data
    assert "active_configs" in data
    assert len(data["active_configs"]) >= 4

