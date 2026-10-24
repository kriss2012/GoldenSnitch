# Functional and non-functional requirements
Tests live in `backend/tests/test_engine_and_api.py`. UI behaviour (FR-UI) has a manual checklist only.

| ID | Pri | Requirement (shall) | Acceptance criteria | Test |
|---|---|---|---|---|
| FR-PLR-001 | P0 | List/filter players by game, role (primary or secondary), name, free-agent status | filters combine; total returned; limit ≤200 | TEST-015, 005 |
| FR-PLR-002 | P0 | Player profile: metrics, provenance, history, trend, role percentiles, missing metrics | game-specific metrics only | TEST-004 |
| FR-IMP-001 | P0 | CSV import with validation, duplicate detection, dry-run, error report | bad rows rejected with row/field/reason; ≤1 MB, ≤5000 rows | TEST-005, 017, 020 |
| FR-IGL-001 | P0 | Rank eligible free agents for the roster's game and chosen role | other-game/ineligible excluded; deterministic | TEST-001, 012 |
| FR-IGL-002 | P0 | Return score, components, weights, normalised metrics, coverage, sample size, strengths, weaknesses, caveats, why-above-next | score recomputable from response | TEST-018, 003, 006 |
| FR-IGL-003 | P0 | Custom weights accepted; unknown keys or sum ≠ 1 rejected | 422 INVALID_WEIGHTS | TEST-013, 002 |
| FR-SCR-001 | P0 | Missing metrics never zero; <60% weighted coverage ⇒ `insufficient_evidence`, unranked | | TEST-003 |
| FR-SCR-002 | P0 | Persist and re-fetch recommendations | GET equals original | TEST-019 |
| FR-ROS-001 | P0 | Create rosters per title | duplicate name 409 | TEST-010 |
| FR-ROS-002 | P0 | Add/remove members within squad template; one roster per player; same game | SLOT_FULL, PLAYER_ALREADY_ROSTERED, CROSS_GAME_MEMBER | TEST-004, 007 |
| FR-ROS-003 | P0 | Unified analytics across rosters/titles (within-game percentiles) | both games listed | TEST-019 |
| FR-FIT-001 | P0 | FitScore = 0.35·RC + 0.25·SC + 0.20·SA + 0.20·EQ, before/after coverage, profile delta, labelled *estimated* | recomputable; no vacancy ⇒ RC=0 | TEST-009, 016 |
| FR-CMP-001 | P0 | Compare 2–5 candidates; reject cross-game/ineligible | matrix + trade-offs | TEST-004, 008 |
| FR-ERR-001 | P0 | Structured errors, no stack traces; empty data handled | | TEST-010, 011 |
| FR-UI-001 | P0 | UI wired to API: squads, players, scout (why/compare/add), import; loading/empty/error states | manual checklist | **not run in a browser** |
| NFR-001 | P0 | p95 ranking <1.5 s on 120 players | timed | sandbox p95 27 ms; see BENCHMARK.md |
| NFR-002 | P0 | Reproducible ranking | | TEST-001 |
| NFR-003 | P0 | ≥100 synthetic players in 2 titles, labelled | | TEST-015 |
| NFR-004 | P0 | Parameterised SQL; upload limits | | TEST-020, code review |
| NFR-005 | P0 | Every ranked candidate carries a breakdown | | TEST-018 |
| NFR-006 | P0 | No paid service required | | by construction |
