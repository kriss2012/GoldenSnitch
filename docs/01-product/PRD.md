# ScoutGrid — Product Requirements Document (PRD-001)
Version 0.1 · Status: MVP implemented, backend tested, UI not browser-tested · Problem Statement 4

## 1. Executive summary
**ScoutGrid** ranks esports recruitment candidates *per role and per game*, explains every score from real calculations, estimates how a candidate fits an existing roster's gaps, and shows all of an organisation's rosters in one view without comparing incompatible game statistics.
- **Problem:** scouting relies on subjective opinion and raw stats (K/D, win rate) that ignore role; multi-title organisations lack a single, structured view.
- **Users:** talent scouts, head coaches/analysts, team managers, general managers.
- **Differentiator (our implementation, no industry-uniqueness claim):** role-weighted percentile scoring, evidence coverage kept separate from performance, roster gap + counterfactual coverage, alternative comparison, game-isolated metrics.
- **MVP (implemented):** 120 synthetic players in 2 titles, CSV import, deterministic IGL/ENTRY/SUPPORT (TAC) and SHOTCALLER/CARRY/SUPPORT (ARENA) scoring, roster management, fit estimate, comparison, multi-game dashboard. No paid API, model training or LLM.
- **Feasibility:** pure-Python deterministic engine, SQLite, one FastAPI service serving a static UI.

## 2. Problem and root-cause analysis
Only the problem statement is treated as given; the rows below are **hypotheses** to validate with real scouts.

| # | Problem | Root cause | Stakeholder | Consequence (hypothesis) | Product response | Indicator |
|---|---|---|---|---|---|---|
| P1 | Over-reliance on raw stats | Public leaderboards expose K/D, win rate | Scout | Fragger recruited as leader | Role-weighted scoring (SCORE-001) | Top-K/D player not auto-ranked #1 for IGL (TEST-012) |
| P2 | Role blindness | Stats not normalised per role | Coach | Mis-scaled comparisons | Percentiles within game+role pool | Pool size shown per query |
| P3 | Weak IGL evaluation | Leadership is not in match logs | Coach | Subjective picks | Annotation-based decision/leadership metrics with provenance | Share of ranked candidates with decision data |
| P4 | Compatibility guesswork | No interaction data | GM | Redundant roles | Gap analysis + estimated fit (not "chemistry") | Coverage before→after |
| P5 | Fragmented multi-title ops | Per-title tools | Team manager | Missed gaps | Unified roster dashboard | Rosters visible in one view |
| P6 | Inconsistent data | Sources differ | Analyst | Silent bad data | CSV validation, missing ≠ 0 | Valid-row rate, missing-metric report |
| P7 | Opaque AI | Black-box ranking | GM | Distrust | Full score breakdown, no LLM in scoring | Every ranked candidate has breakdown (TEST-018) |

## 3. Personas (each tied to an MVP feature)
| Persona | Responsibilities / pain | Current workflow | Desired outcome | Key actions → feature | Success metric |
|---|---|---|---|---|---|
| **Aarav, General Manager** (3 titles) | Budget, roster strategy; can't see gaps across titles | Spreadsheets per title | One view of coverage and weak skills | Squads dashboard → FR-ROS-003 | Gaps identified without opening 3 tools |
| **Dana, Head Coach/Analyst** | Needs evidence a signing fixes a weakness | VOD + opinion | Defensible shortlist | Inspect breakdown, fit → FR-IGL-002, FR-FIT-001 | Shortlist justified by cited metrics |
| **Sam, Talent Scout** | Sifts hundreds of profiles | Manual filters | Ranked, filtered pool | Players search + Scout → FR-PLR-001, FR-IGL-001 | Time to shortlist |
| **Mei, Multi-roster Manager** | Keeps squads staffed | Notes/chats | Add/remove players safely | Roster membership → FR-ROS-002 | Zero invalid assignments (TEST-007) |

## 4. User stories (acceptance → tests)
- US-1 As a scout I want to pick a roster and role vacancy so that the engine ranks only eligible free agents. *AC: rostered players excluded (TEST-001, 009).*
- US-2 As a coach I want to see why #1 beats #2 so that I can defend the pick. *AC: top-3 weighted gaps returned (TEST-018).*
- US-3 As an analyst I want missing evidence visible so that I never mistake missing data for weakness. *AC: missing ≠ 0, coverage + caveat (TEST-003).*
- US-4 As a coach I want 2–5 candidates side-by-side so that trade-offs are explicit. *AC: matrix + role score + fit (TEST-008).*
- US-5 As a GM I want to switch titles and compare roster coverage so that I find gaps. *AC: analytics lists both games (TEST-019).*
- US-6 As a scout I want to import a CSV so that my own pool is scored. *AC: invalid/duplicate rows reported (TEST-005, 017, 020).*
- US-7 As a coach I want player trends so that development is visible. *AC: last-12 ratings, slope-based label (TEST-014).*

## 5. Journeys (diagram: `diagrams/scouting-workflow.mmd`)
**A – Scout an IGL.** Start: Squads shows *Nova Vanguard* at 80% coverage, IGL open → *Scout IGL* → system pool-normalises and scores → ranked table with evidence tier and fit → *Why* shows weights, raw→percentile, caveats → tick 3 → *Compare* → *Add*. Empty state: "No eligible free agents…"; error state: API message inline.
**B – Candidate vs roster.** Run scouting for a roster; the fit panel shows role coverage, the roster's weakest dimensions, coverage before→after and a "not measured chemistry" disclaimer. A human decides.
**C – Multiple titles.** Squads lists all rosters with within-game percentile profiles, vacancies and trend; ratings are labelled game-specific.

## 6. Requirements and priority
IDs: `02-requirements/FUNCTIONAL_REQUIREMENTS.md`.
- **P0 (implemented):** all FR-* and NFR-001..006 listed there.
- **P1 (not built):** weights UI (API already accepts `weights`), saved shortlists, notes, report export, richer trend charts.
- **P2 (not built, not claimed):** live APIs, video/replay analysis, natural-language queries, predictive development, scrim analysis, transfer-market intelligence, cross-game normalised comparison.

## 7. Business rules
BR-1 Raw metrics never cross titles. BR-2 Missing ≠ zero. BR-3 Weights sum to 1.0 or are rejected. BR-4 Performance score and evidence index are separate. BR-5 Squad slots follow the title template; one roster per player. BR-6 Synthetic data is always labelled. BR-7 Output is decision support only.

## 8. KPIs (engineering targets unless stated)
| KPI | Calculation | Method | Target | Status |
|---|---|---|---|---|
| Ranking latency | p95 of `POST /recommendations` | 100 timed calls | <1.5 s | measured in sandbox: p95 27 ms (120 players), 542 ms (1,120 players) — see BENCHMARK.md |
| Reproducibility | identical ranking across repeated calls | TEST-001 | 100% | tested |
| Explanation completeness | ranked candidates with breakdown | TEST-018 | 100% | tested (top 8) |
| Valid import rate | accepted / rows_total | import summary | report only | implemented |
| Missing-metric reporting | rows with missing metrics flagged | TEST-003/005 | 100% | tested |
| IGL journey time | seconds from open to shortlist | usability run | ≤3 min | **not measured** |
| Expert agreement, Precision@K | requires blinded labels | — | — | **no labels; no accuracy claim made** |

## 9. Assumptions, risks, out of scope
Assumptions: percentile pools ≥8 are adequate for a demo; reviewers can produce annotation scores. Risks: `12-project-control/RISK_REGISTER.md`. Out of scope: auth, live data, model training, measuring real chemistry.

## 10. Final MVP definition
A user can open the app, browse both titles' pools, filter, pick a roster and vacancy, run scouting, receive a deterministic ranking, inspect scores, compare 2–5 candidates, see estimated fit and missing evidence, add to a roster, and view the multi-game dashboard. **Known gaps:** UI untested in a browser, no auth, no hosted deployment, latency unmeasured (`KNOWN_LIMITATIONS.md`).
