"""
Phase 2 Validation Tests: Data Layer, Latent Simulator & Ingestion Adapters
Verifies:
1. >= 600 players generated across 4 titles.
2. >= 60 teams across competitive tiers.
3. >= 15,000 maps/games with round-level telemetry.
4. Ground-truth table is strictly populated and separate.
5. Ingestion adapters (PandaScore, Riot, OpenDota, CSV).
6. GET /api/ingest/status data quality reporting.
"""

from app.db import connect
from adapters.api_adapters import PandaScoreAdapter, RiotGamesAdapter, OpenDotaAdapter
from adapters.csv_adapter import CSVDatasetAdapter


def test_universe_data_scale():
    conn = connect()
    players_count = conn.execute("SELECT COUNT(*) FROM players").fetchone()[0]
    teams_count = conn.execute("SELECT COUNT(*) FROM teams").fetchone()[0]
    maps_count = conn.execute("SELECT COUNT(*) FROM maps_or_games").fetchone()[0]
    rounds_count = conn.execute("SELECT COUNT(*) FROM rounds").fetchone()[0]
    gt_count = conn.execute("SELECT COUNT(*) FROM _ground_truth").fetchone()[0]
    contracts_count = conn.execute("SELECT COUNT(*) FROM contracts").fetchone()[0]

    assert players_count >= 600, f"Expected >= 600 players, got {players_count}"
    assert teams_count >= 60, f"Expected >= 60 teams, got {teams_count}"
    assert maps_count >= 15000, f"Expected >= 15000 maps, got {maps_count}"
    assert rounds_count >= 100000, f"Expected >= 100000 rounds, got {rounds_count}"
    assert gt_count >= 600, f"Expected >= 600 ground truth rows, got {gt_count}"
    assert contracts_count >= 600, f"Expected >= 600 contracts, got {contracts_count}"


def test_round_telemetry_and_plan_switches():
    conn = connect()
    # Verify rounds contain mid-round plan switches and timestamps
    switched_rounds = conn.execute(
        "SELECT COUNT(*), AVG(switch_time_s) FROM rounds WHERE plan_switched_mid_round = 1"
    ).fetchone()
    
    count, avg_time = switched_rounds
    assert count > 1000, f"Expected > 1000 rounds with plan switches, got {count}"
    assert 20.0 <= avg_time <= 75.0, f"Expected mean switch time between 20-75s, got {avg_time}"


def test_traps_present_in_ground_truth():
    conn = connect()
    archetypes = {
        row[0] for row in conn.execute("SELECT DISTINCT archetype FROM _ground_truth").fetchall()
    }
    expected_archetypes = {
        "veteran_igl", "frag_duelist", "stat_padder",
        "small_sample_hype", "declining_veteran", "young_prospect", "undervalued_gem"
    }
    assert expected_archetypes.issubset(archetypes), f"Missing trap archetypes: {expected_archetypes - archetypes}"


def test_api_adapters_behavior():
    # PandaScore
    ps = PandaScoreAdapter()
    assert ps.get_source_name() == "pandascore_api"
    res_ps = ps.ingest(None)
    assert res_ps.data_quality_flag == "NOT_CONFIGURED"

    # Riot Games
    riot = RiotGamesAdapter()
    assert riot.get_source_name() == "riot_games_api"
    res_riot = riot.ingest(None)
    assert res_riot.data_quality_flag == "NOT_CONFIGURED"

    # OpenDota
    dota = OpenDotaAdapter()
    assert dota.get_source_name() == "opendota_api"
    res_dota = dota.ingest(None)
    assert res_dota.data_quality_flag == "NOT_CONFIGURED"


def test_csv_dataset_adapter():
    conn = connect()
    csv_sample = (
        "player_id,handle,game,role,kills,deaths,assists,adr,kast,team_name\n"
        "CSV-001,KaggleStar,valorant,IGL,18,12,6,142.5,0.76,KaggleEsports\n"
        "CSV-002,KaggleSniper,cs2,AWPer,22,10,2,155.0,0.81,KaggleEsports\n"
    )
    adapter = CSVDatasetAdapter()
    res = adapter.ingest(conn, csv_content=csv_sample)
    assert res.records_ingested == 2
    assert res.data_quality_flag == "VALID"
    assert "file_sha256" in res.details


def test_ingest_status_endpoint(client):
    # Verify initial status on test client
    res = client.get("/api/ingest/status")
    assert res.status_code == 200
    data = res.json()
    assert data["database"] == "connected"
    assert "simulated" in data["adapters"]
    assert "pandascore" in data["adapters"]

    # Trigger small simulation on test client DB
    sim_res = client.post("/api/ingest/simulate", json={"players": 24, "maps": 48, "seed": 42})
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["status"] == "success"
    assert sim_data["result"]["maps"] >= 48

    # Verify updated status reflects simulated records
    res2 = client.get("/api/ingest/status")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["maps"] >= 48
    assert data2["players"] >= 24

