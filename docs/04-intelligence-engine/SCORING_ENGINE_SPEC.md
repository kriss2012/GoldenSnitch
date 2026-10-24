# Scoring engine specification (SCORE-001..005)
Implemented in `backend/app/scoring.py`, parameters in `catalog.py`. Deterministic; no randomness, network or LLM.

## Pipeline
1. Select game and role (must have a profile in `ROLE_WEIGHTS`). 2. Eligible pool = players of that game whose primary **or secondary** role equals the role (rostered players stay in the pool so percentiles don't change when rosters change); candidates = pool ∩ free agents. 3. Metrics come from `DIMENSIONS[game]`. 4. **Normalise** each metric to a 0–100 percentile within the pool: `p = (#less + 0.5·#equal)/n·100`; lower-is-better metrics use `100−p` (e.g. `rating_stdev`, `deaths_per_game`). 5. **Dimension score** = mean of the available metric percentiles. 6. **Base score** over available dimensions: `Base = Σ wᵢ·sᵢ / Σ wᵢ` (i ∈ dimensions with data). 7. **Evidence** reported separately. 8. Rank; 9. explanations are computed from the numbers.

Outliers: percentiles are rank-based so extreme values cannot dominate. Pools < 8 are flagged "unstable". Tie-break: score ↓, evidence ↓, player_id ↑.

## Evidence index (heuristic — not a calibrated probability)
`coverage = Σ wᵢ·(metrics present / metrics in dimension)`; `sample = min(1, matches/30)`; `prov = mean(reliability)` with derived 1.0, annotated 0.9, simulated 0.6; `index = 0.5·coverage + 0.3·sample + 0.2·prov`. Tier: **high** if index ≥ 0.8 **and** coverage ≥ 0.9; **medium** if index ≥ 0.6; else **low**. Coverage < 0.60 ⇒ `insufficient_evidence` (listed, unranked). Missing data lowers coverage/tier, never the score. All constants are initial hypotheses.

## Role profiles (weights sum to 1.0; validated by `validate_weights`, TEST-002)
| Dimension | IGL / SHOTCALLER | ENTRY / CARRY | SUPPORT |
|---|---:|---:|---:|
| decision | .25 | .05 | .15 |
| leadership (leadership + communication) | .20 | .05 | .10 |
| clutch | .15 | .15 | .10 |
| objective | .15 | .10 | .20 |
| teamplay (trades / teamfights) | .10 | .15 | .30 |
| consistency (inverse std-dev of last-12 ratings) | .10 | .15 | .10 |
| combat | .05 | .35 | .05 |
Rationale: leaders are valued for decisions/leadership, fraggers for combat and consistency, supports for team-play and objectives. These are hypotheses for a stakeholder to tune, not esports truth.

## Metric catalog (excerpt; full list `GET /api/games`)
| Dimension | TAC metrics | ARENA metrics | Source in demo |
|---|---|---|---|
| decision | decision_quality_score | same | annotation (simulated/annotated) |
| leadership | leadership_score, communication_score | same | annotation |
| clutch | clutch_success_rate | comeback_rate | derived (synthetic) |
| objective | objective_success_rate | objective_control_rate | derived |
| teamplay | trade_success_rate | teamfight_success_rate | derived |
| consistency | rating_stdev ↓ | rating_stdev ↓ | derived from match_history |
| combat | kill_death_ratio, damage_per_round | kda, damage_share, deaths_per_game ↓ | derived |

## IGL measurement definition and limits
Shot-calling/mid-round decision quality is defined as the share of labelled tactical decisions rated "good" by a reviewer, rescaled to 0–100 (`decision_quality_score`); leadership/communication are reviewer ratings. The demo contains **simulated** values (provenance `simulated`/`annotated` flags in seed data) — it does not measure real behaviour. Ordinary match stats cannot establish leadership; K/D is deliberately only 5% of the IGL score.

## Limitations
Percentiles depend on pool composition; small pools are noisy; annotation inputs need inter-rater checks; no validation against real outcomes exists; weights unvalidated.
