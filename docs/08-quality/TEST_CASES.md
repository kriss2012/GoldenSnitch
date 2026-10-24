# Test cases (TEST-xxx) — executed 2026-10-24

Command: `cd backend && python -m pytest -q` → exit code 0; summary: `20 passed in 1.26s`. Results below are parsed from the real run (JUnit XML). Frontend/E2E tests: **not written** (see readiness report).

## TEST-001 — ranking reproducible
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: identical data+weights -> identical ranking and scores.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t001_ranking_reproducible`

## TEST-002 — weights sum to 100 percent
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: every role profile sums to 1.0; IGL matches the specified profile.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t002_weights_sum_to_100_percent`

## TEST-003 — missing leadership is not zero
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: missing leadership data => component None, coverage reduced, confidence not high, never scored 0.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t003_missing_leadership_is_not_zero`

## TEST-004 — cross game isolation
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: incompatible titles are never compared or mixed on a roster.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t004_cross_game_isolation`

## TEST-005 — csv invalid and duplicates
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: invalid rows rejected with reasons, duplicates skipped, valid rows stored.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t005_csv_invalid_and_duplicates`

## TEST-006 — small sample flagged
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: small samples lower the sample factor and are disclosed.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t006_small_sample_flagged`

## TEST-007 — roster membership constraints
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: slot-full, duplicate membership, invalid slot are rejected.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t007_roster_membership_constraints`

## TEST-008 — compare three candidates
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: comparison of 3 candidates returns matrix + trade-offs; <2 ids rejected.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t008_compare_three_candidates`

## TEST-009 — role coverage improves
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: filling the vacancy raises coverage; a role with no vacancy gets role_coverage 0.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t009_role_coverage_improves`

## TEST-010 — api errors structured
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: errors are structured JSON with codes, no stack traces.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t010_api_errors_structured`

## TEST-011 — empty dataset
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: empty database: no crash, empty candidate list.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t011_empty_dataset`

## TEST-012 — kd does not decide igl rank
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: the top-K/D fragger with weak decision data does not win the IGL ranking.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t012_kd_does_not_decide_igl_rank`

## TEST-013 — custom weights validated
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: invalid weight sets rejected; valid custom weights change scores.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t013_custom_weights_validated`

## TEST-014 — inverse metric and ties
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: lower-is-better metrics invert; ties get mid-rank percentile; history derivations.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t014_inverse_metric_and_ties`

## TEST-015 — seed dataset shape
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: >=100 synthetic players over two games; all flagged synthetic.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t015_seed_dataset_shape`

## TEST-016 — fit formula recomputable
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: FitScore equals 0.35*RC + 0.25*SC + 0.20*SA + 0.20*EQ from returned components.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t016_fit_formula_recomputable`

## TEST-017 — import dry run does not store
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: dry_run reports but stores nothing.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t017_import_dry_run_does_not_store`

## TEST-018 — score breakdown reproducible by hand
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: role_score == sum(weight*component)/sum(weights of available components) from the response.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t018_score_breakdown_reproducible_by_hand`

## TEST-019 — recommendation persisted and roster analytics
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: stored recommendation retrievable; unified analytics lists rosters from both games.
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t019_recommendation_persisted_and_roster_analytics`

## TEST-020 — oversized upload rejected before parsing
- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)
- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)
- Priority: P0
- Expected / pass criteria: CSV larger than 1 MB is rejected with 413 (SEC-001).
- Actual result: **PASSED** (2026-10-24)
- Evidence: `backend/tests/test_engine_and_api.py::test_t020_oversized_upload_rejected_before_parsing`
