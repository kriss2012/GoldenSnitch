# Worked example (generated from the live engine)

> **All data is synthetic** (`synthetic_seed_v1`, RNG seed 1337). Fictional org *Nova Esports*, fictional title *Tactical Shooter (synthetic title)*.
> Regenerate with `python scripts/worked_example.py`. Nothing below is hand-typed.

**Need:** roster *Nova Vanguard* has an open **IGL** slot (vacancies {'IGL': 1}); squad coverage 80%.
**Pool:** 22 eligible IGL-capable players (primary or secondary IGL); 21 are free agents. Normalization = percentile within this pool (ties = mid-rank).
**Weights (IGL):** {'decision': 0.25, 'leadership': 0.2, 'clutch': 0.15, 'objective': 0.15, 'teamplay': 0.1, 'consistency': 0.1, 'combat': 0.05} (sum = 1.00). **Fit weights:** {'role_coverage': 0.35, 'skill_complementarity': 0.25, 'strategic_alignment': 0.2, 'evidence_quality': 0.2}. **Focus dims:** ['decision', 'leadership'].

## Final ranking (top 6 of all ranked candidates)

| Rank | Candidate | Role score | Evidence tier | Evidence coverage | Matches | Est. fit | Fit rank |
|---|---|---:|---|---:|---:|---:|---:|
| 1 | Mira_Solace | 69.89 | medium | 80% | 70 | 89.86 | 3 |
| 2 | Wren_Flux | 66.62 | high | 100% | 54 | 86.58 | 6 |
| 3 | Vex_Aurelius | 64.46 | high | 100% | 64 | 92.16 | 2 |
| 4 | Pax_Hex | 64.01 | high | 100% | 69 | 64.58 | 14 |
| 5 | Quin_Halo | 63.58 | high | 100% | 42 | 87.12 | 5 |
| 6 | Dax_Lowsample | 61.53 | medium | 100% | 7 | 82.36 | 7 |

## Mira_Solace - rank 1, role score 69.89

| Dimension | Weight | Score (0-100) | Points = w/Σw·score | Metrics (raw → percentile, provenance) |
|---|---:|---:|---:|---|
| decision | 0.25 | 97.73 | 30.541 | decision_quality_score: 91 → 97.73 (annotated) |
| leadership | 0.20 | None | None | leadership_score: MISSING; communication_score: MISSING |
| clutch | 0.15 | 34.09 | 6.392 | clutch_success_rate: 30.29 → 34.09 (derived) |
| objective | 0.15 | 97.73 | 18.324 | objective_success_rate: 82.39 → 97.73 (derived) |
| teamplay | 0.10 | 38.64 | 4.83 | trade_success_rate: 55.73 → 38.64 (derived) |
| consistency | 0.10 | 47.73 | 5.966 | rating_stdev: 0.1434 → 47.73 (derived) |
| combat | 0.05 | 61.36 | 3.835 | kill_death_ratio: 1.22 → 70.45 (derived); damage_per_round: 81.5 → 52.27 (derived) |

- Evidence index = 0.5·0.8 + 0.3·1.0 + 0.2·0.9857 = **0.8971** (tier **medium**; heuristic, not a probability).
- Fit components {'role_coverage': 100.0, 'skill_complementarity': 68.34, 'strategic_alignment': 99.17, 'evidence_quality': 89.71} → **FitScore 89.86**; roster weak dims ['decision', 'consistency']; squad coverage 80% → 100%.
- Strengths: ['decision', 'objective']; weaknesses: ['clutch', 'teamplay']; K/D-or-KDA percentile in pool: 70.45.
- Caveats: Missing metrics (not treated as zero): leadership_score, communication_score
- Ranks above next candidate by 3.27 points; drivers: [{'dimension': 'decision', 'weighted_gap': 12.5, 'this': 97.73, 'other': 47.73, 'weight': 0.25}, {'dimension': 'teamplay', 'weighted_gap': -5.91, 'this': 38.64, 'other': 97.73, 'weight': 0.1}, {'dimension': 'objective', 'weighted_gap': 4.77, 'this': 97.73, 'other': 65.91, 'weight': 0.15}]

## Vex_Aurelius - rank 3, role score 64.46

| Dimension | Weight | Score (0-100) | Points = w/Σw·score | Metrics (raw → percentile, provenance) |
|---|---:|---:|---:|---|
| decision | 0.25 | 93.18 | 23.295 | decision_quality_score: 88 → 93.18 (annotated) |
| leadership | 0.20 | 84.21 | 16.842 | leadership_score: 84 → 81.58 (annotated); communication_score: 80 → 86.84 (annotated) |
| clutch | 0.15 | 47.73 | 7.159 | clutch_success_rate: 35.17 → 47.73 (derived) |
| objective | 0.15 | 47.73 | 7.159 | objective_success_rate: 53.16 → 47.73 (derived) |
| teamplay | 0.10 | 6.82 | 0.682 | trade_success_rate: 49.01 → 6.82 (derived) |
| consistency | 0.10 | 65.91 | 6.591 | rating_stdev: 0.129 → 65.91 (derived) |
| combat | 0.05 | 54.55 | 2.728 | kill_death_ratio: 1.02 → 34.09 (derived); damage_per_round: 84.36 → 75.0 (derived) |

- Evidence index = 0.5·1.0 + 0.3·1.0 + 0.2·0.9667 = **0.9933** (tier **high**; heuristic, not a probability).
- Fit components {'role_coverage': 100.0, 'skill_complementarity': 73.34, 'strategic_alignment': 94.81, 'evidence_quality': 99.33} → **FitScore 92.16**; roster weak dims ['decision', 'consistency']; squad coverage 80% → 100%.
- Strengths: ['decision', 'leadership']; weaknesses: ['teamplay']; K/D-or-KDA percentile in pool: 34.09.
- Caveats: 
- Ranks above next candidate by 0.45 points; drivers: [{'dimension': 'decision', 'weighted_gap': 13.64, 'this': 93.18, 'other': 38.64, 'weight': 0.25}, {'dimension': 'teamplay', 'weighted_gap': -6.82, 'this': 6.82, 'other': 75.0, 'weight': 0.1}, {'dimension': 'clutch', 'weighted_gap': -6.14, 'this': 47.73, 'other': 88.64, 'weight': 0.15}]

## Kaito_Strike - rank 15, role score 40.03

| Dimension | Weight | Score (0-100) | Points = w/Σw·score | Metrics (raw → percentile, provenance) |
|---|---:|---:|---:|---|
| decision | 0.25 | 15.91 | 3.978 | decision_quality_score: 38 → 15.91 (annotated) |
| leadership | 0.20 | 26.31 | 5.262 | leadership_score: 41 → 13.16 (annotated); communication_score: 52 → 39.47 (annotated) |
| clutch | 0.15 | 70.45 | 10.568 | clutch_success_rate: 37.89 → 70.45 (derived) |
| objective | 0.15 | 56.82 | 8.523 | objective_success_rate: 57.46 → 56.82 (derived) |
| teamplay | 0.10 | 61.36 | 6.136 | trade_success_rate: 63.79 → 61.36 (derived) |
| consistency | 0.10 | 6.82 | 0.682 | rating_stdev: 0.1881 → 6.82 (derived) |
| combat | 0.05 | 97.73 | 4.887 | kill_death_ratio: 2.1 → 97.73 (derived); damage_per_round: 112 → 97.73 (derived) |

- Evidence index = 0.5·1.0 + 0.3·1.0 + 0.2·0.9667 = **0.9933** (tier **high**; heuristic, not a probability).
- Fit components {'role_coverage': 60.0, 'skill_complementarity': 15.0, 'strategic_alignment': 27.88, 'evidence_quality': 99.33} → **FitScore 50.19**; roster weak dims ['decision', 'consistency']; squad coverage 80% → 100%.
- Strengths: ['clutch', 'combat']; weaknesses: ['decision', 'leadership', 'consistency']; K/D-or-KDA percentile in pool: 97.73.
- Caveats: 
- Ranks above next candidate by 1.29 points; drivers: [{'dimension': 'consistency', 'weighted_gap': -6.82, 'this': 6.82, 'other': 75.0, 'weight': 0.1}, {'dimension': 'objective', 'weighted_gap': 4.77, 'this': 56.82, 'other': 25.0, 'weight': 0.15}, {'dimension': 'decision', 'weighted_gap': -4.55, 'this': 15.91, 'other': 34.09, 'weight': 0.25}]

## Why role-specific ranking differs from a raw-stat leaderboard

Kaito_Strike has the highest K/D in the TAC game (percentile 97.73 among IGL-eligible players) but ranks **#15** for IGL because the IGL profile gives combat only 5% and decision+leadership 45%; his decision/leadership metrics are low.
He would be evaluated very differently under the ENTRY profile (combat 35%). A good ENTRY score does not imply a good IGL score.

**Main caveat:** decision and leadership values are *simulated annotations* in this demo; they illustrate the mechanism and do not prove real shot-calling ability.
