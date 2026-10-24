import json
from conftest import pid
from app.catalog import ROLE_WEIGHTS, DIMENSIONS, validate_weights
from app.scoring import percentile, derive_history_metrics, trend_label

def rec(c, **kw):
    body = {"roster_id": 1, "role": "IGL", "top_n": 50}; body.update(kw)
    return c.post("/api/scouting/recommendations", json=body)

def test_t001_ranking_reproducible(client):
    """TEST-001 identical data+weights -> identical ranking and scores."""
    strip = lambda r: [(c["player_id"], c["rank"], c["role_score"], c["fit"]["fit_score"]) for c in r.json()["candidates"]]
    assert strip(rec(client)) == strip(rec(client)) and len(strip(rec(client))) > 5

def test_t002_weights_sum_to_100_percent():
    """TEST-002 every role profile sums to 1.0; IGL matches the specified profile."""
    for (g, _), w in ROLE_WEIGHTS.items(): validate_weights(w, DIMENSIONS[g]); assert abs(sum(w.values()) - 1) < 1e-9
    assert ROLE_WEIGHTS[("TAC", "IGL")] == {"decision": .25, "leadership": .20, "clutch": .15, "objective": .15, "teamplay": .10, "consistency": .10, "combat": .05}

def test_t003_missing_leadership_is_not_zero(client):
    """TEST-003 missing leadership data => component None, coverage reduced, confidence not high, never scored 0."""
    c = next(x for x in rec(client).json()["candidates"] if x["name"] == "Mira_Solace")
    lead = next(k for k in c["components"] if k["dimension"] == "leadership")
    assert lead["score"] is None and lead["coverage"] == 0 and c["role_score"] > 0
    assert c["confidence"]["evidence_coverage"] == 0.8 and c["confidence"]["tier"] != "high"
    assert any("Missing metrics" in v for v in c["caveats"])

def test_t004_cross_game_isolation(client):
    """TEST-004 incompatible titles are never compared or mixed on a roster."""
    r = client.post("/api/scouting/compare", json={"roster_id": 1, "role": "IGL", "player_ids": [pid(client, "Vex_Aurelius"), pid(client, "Juno_Quill")]})
    assert r.status_code == 422 and r.json()["error"]["code"] == "CROSS_GAME_COMPARISON"
    r = client.post("/api/rosters/1/members", json={"player_id": pid(client, "Juno_Quill")})
    assert r.json()["error"]["code"] == "CROSS_GAME_MEMBER"
    tac = client.get("/api/players/" + pid(client, "Vex_Aurelius")).json()
    assert "kda" not in tac["metrics"] and "kill_death_ratio" in tac["metrics"]

CSV = ("player_name,game,role,matches_played,secondary_roles,decision_quality_score,leadership_score,kill_death_ratio,kda\n"
       "Imp_One,TAC,IGL,40,,80,75,1.1,\n"          # valid (kda ignored? blank)
       "Imp_Two,TAC,IGL,x,,80,75,1.1,\n"            # bad matches
       "Imp_Three,TAC,JUNGLE,10,,80,75,1.1,\n"      # bad role
       "Imp_Four,TAC,IGL,10,,180,75,1.1,\n"         # out of range
       "Imp_One,TAC,IGL,40,,80,75,1.1,\n"           # duplicate
       "Imp_Five,ARENA,CARRY,25,,,,,6.5\n")         # valid, sparse
def test_t005_csv_invalid_and_duplicates(client):
    """TEST-005 invalid rows rejected with reasons, duplicates skipped, valid rows stored."""
    r = client.post("/api/players/import", content=CSV, headers={"content-type": "text/csv"}).json()
    assert (r["rows_total"], r["accepted"], r["rejected"], r["duplicates"]) == (6, 2, 3, 1)
    assert {e["field"] for e in r["errors"]} >= {"matches_played", "role", "decision_quality_score", "player_name"}
    assert client.get("/api/players", params={"q": "Imp_"}).json()["total"] == 2
    bad = client.post("/api/players/import", content="a,b\n1,2\n", headers={"content-type": "text/csv"})
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "MISSING_COLUMNS"

def test_t006_small_sample_flagged(client):
    """TEST-006 small samples lower the sample factor and are disclosed."""
    c = next(x for x in rec(client).json()["candidates"] if x["name"] == "Dax_Lowsample")
    assert c["confidence"]["sample_factor"] < 0.3 and any("Small sample" in v for v in c["caveats"])

def test_t007_roster_membership_constraints(client):
    """TEST-007 slot-full, duplicate membership, invalid slot are rejected."""
    code = lambda r: r.json()["error"]["code"]
    iglish = pid(client, "Vex_Aurelius")
    assert client.post("/api/rosters/1/members", json={"player_id": iglish, "slot_role": "ENTRY"}).status_code == 422  # invalid slot
    assert client.post("/api/rosters/2/members", json={"player_id": iglish}).json()["error"]["code"] == "SLOT_FULL"  # academy has an IGL
    assert client.post("/api/rosters/1/members", json={"player_id": iglish}).status_code == 201
    assert code(client.post("/api/rosters/1/members", json={"player_id": iglish})) == "PLAYER_ALREADY_ROSTERED"
    assert code(client.post("/api/rosters/1/members", json={"player_id": pid(client, "Mira_Solace")})) == "SLOT_FULL"
    assert client.get("/api/rosters/1").json()["state"]["vacancies"] == {}

def test_t008_compare_three_candidates(client):
    """TEST-008 comparison of 3 candidates returns matrix + trade-offs; <2 ids rejected."""
    ids = [pid(client, n) for n in ("Vex_Aurelius", "Mira_Solace", "Dax_Lowsample")]
    r = client.post("/api/scouting/compare", json={"roster_id": 1, "role": "IGL", "player_ids": ids}).json()
    assert [c["player_id"] for c in r["candidates"]] and set(r["matrix"]["decision"]) == set(ids) and len(r["trade_offs"]) == 3
    assert client.post("/api/scouting/compare", json={"roster_id": 1, "role": "IGL", "player_ids": ids[:1]}).status_code == 422

def test_t009_role_coverage_improves(client):
    """TEST-009 filling the vacancy raises coverage; a role with no vacancy gets role_coverage 0."""
    top = rec(client).json()["candidates"][0]["fit"]
    assert top["coverage_before"] == 0.8 and top["coverage_after"] == 1.0 and top["components"]["role_coverage"] == 100
    full = rec(client, roster_id=2).json()["candidates"][0]["fit"]
    assert full["components"]["role_coverage"] == 0 and full["coverage_after"] == full["coverage_before"]

def test_t010_api_errors_structured(client):
    """TEST-010 errors are structured JSON with codes, no stack traces."""
    r = client.get("/api/rosters/999"); j = r.json()
    assert r.status_code == 404 and j["error"]["code"] == "ROSTER_NOT_FOUND" and "Traceback" not in json.dumps(j)
    assert client.post("/api/scouting/recommendations", json={"role": "IGL"}).json()["error"]["code"] == "VALIDATION_ERROR"
    assert rec(client, role="ENTRYX").json()["error"]["code"] == "INVALID_ROLE"

def test_t011_empty_dataset(empty_client):
    """TEST-011 empty database: no crash, empty candidate list."""
    assert empty_client.get("/api/players").json()["total"] == 0
    rid = empty_client.post("/api/rosters", json={"name": "Blank", "game": "TAC"}).json()["id"]
    r = empty_client.post("/api/scouting/recommendations", json={"roster_id": rid, "role": "IGL"}).json()
    assert r["candidates"] == [] and r["pool_size"] == 0 and any("unstable" in n for n in r["notes"])

def test_t012_kd_does_not_decide_igl_rank(client):
    """TEST-012 the top-K/D fragger with weak decision data does not win the IGL ranking."""
    cs = rec(client).json()["candidates"]; k = next(c for c in cs if c["name"] == "Kaito_Strike")
    assert k["kd_percentile_in_pool"] >= 95 and k["rank"] > 5 and "combat" not in k["weaknesses"]

def test_t013_custom_weights_validated(client):
    """TEST-013 invalid weight sets rejected; valid custom weights change scores."""
    assert rec(client, weights={"decision": .5, "leadership": .6}).json()["error"]["code"] == "INVALID_WEIGHTS"
    assert rec(client, weights={"nonsense": 1.0}).json()["error"]["code"] == "INVALID_WEIGHTS"
    a = rec(client).json()["candidates"][0]["role_score"]
    b = rec(client, weights={"combat": 1.0}).json()["candidates"][0]["role_score"]
    assert a != b

def test_t014_inverse_metric_and_ties():
    """TEST-014 lower-is-better metrics invert; ties get mid-rank percentile; history derivations."""
    vals = [1, 2, 3, 4]
    assert percentile(1, vals, -1) > percentile(4, vals, -1) and percentile(2, [2, 2, 2], 1) == 50.0
    assert derive_history_metrics([1, 1, 1]) == (None, None)
    sd, slope = derive_history_metrics([1.0, 1.1, 1.2, 1.3, 1.4]); assert slope > 0.09 and trend_label(slope) == "improving"

def test_t015_seed_dataset_shape(client):
    """TEST-015 >=100 synthetic players over two games; all flagged synthetic."""
    h = client.get("/api/health").json(); assert h["players"] >= 100 and h["synthetic_data"]
    assert {g["code"] for g in client.get("/api/games").json()} == {"TAC", "ARENA"}
    assert all(p["synthetic"] for p in client.get("/api/players", params={"limit": 200}).json()["items"])

def test_t016_fit_formula_recomputable(client):
    """TEST-016 FitScore equals 0.35*RC + 0.25*SC + 0.20*SA + 0.20*EQ from returned components."""
    for c in rec(client).json()["candidates"][:5]:
        f = c["fit"]; k = f["components"]
        if None in k.values(): continue
        assert abs(f["fit_score"] - (.35 * k["role_coverage"] + .25 * k["skill_complementarity"] + .20 * k["strategic_alignment"] + .20 * k["evidence_quality"])) < 0.02

def test_t017_import_dry_run_does_not_store(client):
    """TEST-017 dry_run reports but stores nothing."""
    r = client.post("/api/players/import?dry_run=true", content=CSV, headers={"content-type": "text/csv"}).json()
    assert r["dry_run"] and r["accepted"] == 2 and client.get("/api/players", params={"q": "Imp_"}).json()["total"] == 0

def test_t018_score_breakdown_reproducible_by_hand(client):
    """TEST-018 role_score == sum(weight*component)/sum(weights of available components) from the response."""
    for c in rec(client).json()["candidates"][:8]:
        av = [(k["weight"], k["score"]) for k in c["components"] if k["score"] is not None]
        assert abs(sum(w * s for w, s in av) / sum(w for w, _ in av) - c["role_score"]) < 0.02

def test_t019_recommendation_persisted_and_roster_analytics(client):
    """TEST-019 stored recommendation retrievable; unified analytics lists rosters from both games."""
    r = rec(client).json(); g = client.get("/api/scouting/recommendations/" + r["id"]).json()
    assert g["candidates"][0]["player_id"] == r["candidates"][0]["player_id"]
    assert {a["game"] for a in client.get("/api/analytics/rosters").json()} == {"TAC", "ARENA"}

def test_t020_oversized_upload_rejected_before_parsing(client):
    """TEST-020 CSV larger than 1 MB is rejected with 413 (SEC-001)."""
    big = "player_name,game,role,matches_played\n" + "A,TAC,IGL,1\n" * 120000
    r = client.post("/api/players/import", content=big, headers={"content-type": "text/csv"})
    assert r.status_code == 413 and r.json()["error"]["code"] == "FILE_TOO_LARGE"
