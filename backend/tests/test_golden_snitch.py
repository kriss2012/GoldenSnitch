"""Automated test suite verifying all Golden Snitch PRD requirements:
- Authentication & RBAC (F14)
- Exact PRD §10.3 Worked Example: Mirage (Fit 74.8) vs Voltz (Fit 49.3) (F3, F4, F7)
- Status partitioning: Ranked, Provisional (sample < 100), Unranked (anchor missing) (F4)
- CSV Ingestion, bound validation, and SHA-256 integrity (F1, F15)
- Immutable recommendation snapshot & audit recomputation (F8)
- Multi-candidate side-by-side comparison (F10)
"""

def test_auth_login_and_roles(client):
    """Test F14: JWT Authentication and Role-Based Access Control."""
    # 1. Valid login as Maya (GM)
    r = client.post("/api/auth/login", json={"username": "maya", "password": "admin123"})
    assert r.status_code == 200
    j = r.json()
    assert j["user"]["role"] == "ROLE_GM"
    assert "access_token" in j
    token = j["access_token"]

    # 2. Check /api/auth/me with Bearer token
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"}).json()
    assert me["user"]["username"] == "maya"
    assert me["permissions"]["can_approve_signings"] is True

    # 3. Valid login as Arjun (Scout)
    r_scout = client.post("/api/auth/login", json={"username": "arjun", "password": "scout123"})
    assert r_scout.json()["user"]["role"] == "ROLE_SCOUT"

    # 4. Invalid credentials rejected with 401
    bad = client.post("/api/auth/login", json={"username": "maya", "password": "wrongpassword"})
    assert bad.status_code == 401

def test_prd_worked_example_mirage_vs_voltz(client):
    """Test F7 & §10.3: Valorant Controller Vacancy on Sentinels.
    Mirage covers the incumbent's Utility gap (Fit 74.8), beating Decoy Voltz (Fit 49.3).
    """
    # Query Sentinels roster (id 4) Controller vacancy
    r = client.get("/api/rankings", params={"game": "valorant", "role": "Controller", "vacancy_id": 7})
    assert r.status_code == 200
    j = r.json()
    
    # Check ranked list has Mirage
    handles = [c["handle"] for c in j["ranked"]]
    assert "Mirage" in handles

    # Verify Fit endpoint for Mirage (VAL-002)
    fit_mirage = client.post("/api/rosters/4/fit", json={"candidate_id": "VAL-002", "role": "Controller"}).json()
    assert abs(fit_mirage["fit"] - 74.8) <= 0.5
    
    # Verify Fit endpoint for Voltz (VAL-003)
    fit_voltz = client.post("/api/rosters/4/fit", json={"candidate_id": "VAL-003", "role": "Controller"}).json()
    assert abs(fit_voltz["fit"] - 49.3) <= 0.5

    # Verification: Golden Snitch puts Mirage ahead of Voltz despite Voltz's higher raw ACS
    assert fit_mirage["fit"] > fit_voltz["fit"]

def test_status_partitioning_ranked_provisional_unranked(client):
    """Test F4 & §9: Ranked, Provisional (sample < 100 rounds), Unranked (anchor missing)."""
    r = client.get("/api/rankings", params={"game": "valorant", "role": "Controller"}).json()
    
    # Ranked: Mirage has 310 rounds and anchor ACS present
    assert any(c["handle"] == "Mirage" for c in r["ranked"])

    # Provisional: Nova has sample of 62 rounds (< 100 minimum)
    prov_handles = [c["handle"] for c in r["provisional"]]
    assert "Nova" in prov_handles
    nova = next(c for c in r["provisional"] if c["handle"] == "Nova")
    assert nova["reason"] == "sample_below_minimum"

    # Unranked: Echo lacks anchor metric 'acs'
    unranked_handles = [c["handle"] for c in r["unranked"]]
    assert "Echo" in unranked_handles
    echo = next(c for c in r["unranked"] if c["handle"] == "Echo")
    assert echo["reason"] == "anchor_metric_missing"

def test_csv_import_with_sha256_and_security(client):
    """Test F1 & F15: CSV Ingestion with bound checking, formula sanitization, and SHA-256 hash."""
    CSV_TEST = (
        "player_handle,game,role,rounds_played,acs,round_win_rate,assists_per_round,first_death_rate\n"
        "Valid_Player,valorant,Controller,250,230,55,0.45,0.10\n"
        "=Cmd_Injection,valorant,Controller,200,210,50,0.30,0.12\n"  # formula injection stripped
        "Bad_Rounds,valorant,Controller,-5,200,50,0.30,0.12\n"       # negative rounds rejected
        "Bad_ACS,valorant,Controller,200,999,50,0.30,0.12\n"         # out of bounds rejected
    )
    # Test dry run
    r_dry = client.post("/api/imports?dry_run=true", content=CSV_TEST, headers={"content-type": "text/csv"}).json()
    assert r_dry["dry_run"] is True
    assert "dataset_sha256" in r_dry
    assert len(r_dry["dataset_sha256"]) == 64
    assert r_dry["accepted"] == 2
    assert r_dry["rejected"] == 2

    # Test commit
    r_commit = client.post("/api/imports", content=CSV_TEST, headers={"content-type": "text/csv"}).json()
    assert r_commit["accepted"] == 2
    
    # Verify formula-injected name was sanitized
    p = client.get("/api/players", params={"q": "Cmd_Injection"}).json()
    assert p["total"] == 1
    assert p["items"][0]["name"] == "Cmd_Injection"

def test_immutable_recommendation_and_audit(client):
    """Test F8: Saving and retrieving recommendation snapshot for 100% reproducible recomputation."""
    body = {"roster_id": 4, "role": "Controller", "top_n": 5, "sort": "fit_score"}
    rec = client.post("/api/recommendations", json=body).json()
    rec_id = rec["id"]
    assert rec_id.startswith("REC-")
    
    # Fetch persisted recommendation
    fetched = client.get(f"/api/recommendations/{rec_id}").json()
    assert fetched["id"] == rec_id
    assert fetched["candidates"][0]["player_id"] == rec["candidates"][0]["player_id"]
    assert fetched["candidates"][0]["fit"]["fit_score"] == rec["candidates"][0]["fit"]["fit_score"]

def test_compare_three_candidates(client):
    """Test F10: Side-by-side comparison of up to 3 candidates."""
    comp_body = {
        "roster_id": 4,
        "role": "Controller",
        "player_ids": ["VAL-002", "VAL-003", "VAL-004"]
    }
    r = client.post("/api/rosters/4/compare", json=comp_body).json()
    assert len(r["trade_offs"]) == 3
    assert "matrix" in r
    assert set(r["matrix"]["Firepower"].keys()) == {"VAL-002", "VAL-003", "VAL-004"}

def test_player_matches_telemetry(client):
    """Test PS4: Realistic competitive match history logs with situational events."""
    r = client.get("/api/players/VAL-002/matches").json()
    assert r["count"] >= 5
    assert "matches" in r
    m0 = r["matches"][0]
    assert "tournament" in m0
    assert "map_name" in m0
    assert "opponent" in m0
    assert "situational_event" in m0
    assert len(m0["situational_event"]) > 10

def test_roster_synergy_and_simulation(client):
    """Test PS4: Multi-roster synergy evaluation and interactive candidate swap simulation."""
    syn = client.get("/api/rosters/4/synergy").json()
    assert "squad_synergy_index" in syn
    assert syn["budget_cap_k"] == 1500

    # Simulate Mirage vs Voltz
    sim_mirage = client.post("/api/rosters/4/simulate", json={"candidate_id": "VAL-002"}).json()
    sim_voltz = client.post("/api/rosters/4/simulate", json={"candidate_id": "VAL-003"}).json()

    # Mirage must provide a significantly higher synergy boost than Voltz
    assert sim_mirage["synergy_delta"] > sim_voltz["synergy_delta"]
    assert "Mirage" in sim_mirage["tactical_verdict"]

def test_igl_leaderboard(client):
    """Test PS4: In-Game Leaderboard ranks top shot-callers across game titles."""
    res = client.get("/api/analytics/igl-leaderboard").json()
    assert res["total"] >= 3
    top_names = [x["name"] for x in res["leaderboard"]]
    assert any("Mirage" in n or "Boaster" in n or "karrigan" in n for n in top_names)

