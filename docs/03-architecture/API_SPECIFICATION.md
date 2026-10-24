# API specification (API-001)
Machine-readable contract: `openapi.json` (exported from FastAPI by `scripts/build_docs.py`); live docs at `/docs`. Errors use `{"error":{"code","message","details"}}`.

| Method & path | Purpose | Key validation / errors |
|---|---|---|
| GET `/api/health` | liveness, player count, synthetic flag | — |
| GET `/api/games` | titles, squad templates, metrics, role weights | — |
| GET `/api/players?game&role&q&free_agent&sort&limit&offset` | search | 422 UNKNOWN_GAME, INVALID_SORT; limit 1–200 |
| GET `/api/players/{id}` | profile + role percentiles | 404 PLAYER_NOT_FOUND |
| POST `/api/players/import?dry_run` | CSV body (`text/csv`) | 413 FILE_TOO_LARGE/TOO_MANY_ROWS, 422 MISSING_COLUMNS/INVALID_ENCODING; row errors in summary |
| GET `/api/rosters` · POST `/api/rosters` | list / create `{name,game}` | 409 ROSTER_EXISTS, 422 UNKNOWN_GAME |
| GET `/api/rosters/{id}` | members, squad state, profile, weak dimensions, needs | 404 ROSTER_NOT_FOUND |
| POST `/api/rosters/{id}/members` `{player_id,slot_role?}` | assign | 409 SLOT_FULL / PLAYER_ALREADY_ROSTERED, 422 CROSS_GAME_MEMBER / INVALID_SLOT |
| DELETE `/api/rosters/{id}/members/{player_id}` | remove | 404 MEMBER_NOT_FOUND |
| POST `/api/scouting/recommendations` | rank candidates (+fit) | 422 INVALID_ROLE / INVALID_WEIGHTS / INVALID_FOCUS / INVALID_SORT |
| GET `/api/scouting/recommendations/{id}` | stored result | 404 RECOMMENDATION_NOT_FOUND |
| POST `/api/scouting/compare` `{roster_id,role,player_ids[2..5]}` | side-by-side, matrix, trade-offs | 422 CROSS_GAME_COMPARISON / NOT_ELIGIBLE / DUPLICATE_IDS |
| GET `/api/analytics/rosters` | unified multi-title dashboard data | — |

Per-roster gap analysis is returned by `GET /api/rosters/{id}`; candidate fit is embedded in each recommendation/compare candidate (`fit`). Player history is in `GET /api/players/{id}`.

## Example: IGL scouting (live output of the seeded demo)
See `docs/04-intelligence-engine/WORKED_EXAMPLE.md` for real response values. Request:
```json
{"roster_id": 1, "role": "IGL", "top_n": 5, "sort": "role_score"}
```
Response fields per candidate: `rank, player_id, name, role_score, status, confidence{index,tier,evidence_coverage,sample_factor,provenance_factor,note}, components[{dimension,weight,score,coverage,weighted_points,metrics[{metric,raw,percentile,direction,provenance}]}], strengths, weaknesses, caveats, why_above_next, fit{fit_score,components,weights,coverage_before,coverage_after,roster_profile_before/after,profile_delta,explanation,disclaimer}, fit_rank`.
