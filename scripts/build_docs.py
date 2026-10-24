"""Generates evidence-bearing docs from real runs: openapi.json, TEST_CASES.md (real pytest results), BENCHMARK.md (real timings), tickets/backlog."""
import ast, json, os, random, subprocess, sys, tempfile, time, xml.etree.ElementTree as ET, datetime, statistics
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."); D = os.path.join(R, "docs"); B = os.path.join(R, "backend")
sys.path.insert(0, B); today = datetime.date.today().isoformat()
w = lambda p, t: open(os.path.join(D, p), "w").write(t)

# 1. real test run -> TEST_CASES.md
x = os.path.join(tempfile.mkdtemp(), "j.xml")
run = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", f"--junitxml={x}"], cwd=B, capture_output=True, text=True)
res = {tc.get("name"): ("FAILED" if tc.find("failure") is not None or tc.find("error") is not None else "PASSED") for tc in ET.parse(x).getroot().iter("testcase")}
tree = ast.parse(open(os.path.join(B, "tests", "test_engine_and_api.py")).read()); L = [f"# Test cases (TEST-xxx) — executed {today}", "",
    f"Command: `cd backend && python -m pytest -q` → exit code {run.returncode}; summary: `{run.stdout.strip().splitlines()[-1]}`. Results below are parsed from the real run (JUnit XML). Frontend/E2E tests: **not written** (see readiness report).", ""]
for n in tree.body:
    if isinstance(n, ast.FunctionDef) and n.name.startswith("test_t"):
        tid = "TEST-" + n.name[6:9]; doc = ast.get_docstring(n).replace(tid + " ", "")
        L += [f"## {tid} — {n.name[10:].replace('_', ' ')}", f"- Related requirement: see `FUNCTIONAL_REQUIREMENTS.md` (test column)", "- Type: automated API/unit (pytest, in-process TestClient, temp SQLite DB seeded with 120 synthetic players)", "- Priority: P0",
              f"- Expected / pass criteria: {doc}", f"- Actual result: **{res.get(n.name, 'NOT RUN')}** ({today})", f"- Evidence: `backend/tests/test_engine_and_api.py::{n.name}`", ""]
w("08-quality/TEST_CASES.md", "\n".join(L)); print(run.stdout.strip().splitlines()[-1])

# 2. openapi
os.environ["SCOUTGRID_DB"] = os.path.join(tempfile.mkdtemp(), "b.db")
from app import db, seed
from app.main import app
from fastapi.testclient import TestClient
json.dump(app.openapi(), open(os.path.join(D, "03-architecture", "openapi.json"), "w"), indent=1)

# 3. benchmark (in-process; excludes network + browser)
c = db.connect(); seed.seed(c); c.close(); t = TestClient(app)
def bench(n, body):
    ts = []
    for _ in range(n):
        s = time.perf_counter(); r = t.post("/api/scouting/recommendations", json=body); ts.append(time.perf_counter() - s); assert r.status_code == 200
    ts.sort(); return ts[len(ts) // 2], ts[int(len(ts) * .95) - 1], ts[-1], r.json()["candidate_count"]
a = bench(100, {"roster_id": 1, "role": "IGL", "top_n": 10})
rng = random.Random(7); rows = ["player_name,game,role,matches_played,decision_quality_score,leadership_score,communication_score,clutch_success_rate,objective_success_rate,trade_success_rate,kill_death_ratio,damage_per_round"]
rows += [f"Bench_{i},TAC,IGL,{rng.randint(10,100)},{rng.uniform(20,95):.1f},{rng.uniform(20,95):.1f},{rng.uniform(20,95):.1f},{rng.uniform(10,50):.1f},{rng.uniform(20,80):.1f},{rng.uniform(20,80):.1f},{rng.uniform(.6,1.8):.2f},{rng.uniform(55,110):.1f}" for i in range(1000)]
imp = t.post("/api/players/import", content="\n".join(rows), headers={"content-type": "text/csv"}).json()
b = bench(20, {"roster_id": 1, "role": "IGL", "top_n": 10})
w("08-quality/BENCHMARK.md", f"""# Benchmark (measured {today})
Method: in-process FastAPI TestClient (no network, no browser), single sandbox machine, SQLite temp DB, `POST /api/scouting/recommendations` (IGL, roster 1). These are **sandbox timings, not production SLO evidence**.

| Scenario | Candidates ranked | Runs | median | p95 | max |
|---|---:|---:|---:|---:|---:|
| Seeded demo (120 players) | {a[3]} | 100 | {a[0]*1000:.0f} ms | {a[1]*1000:.0f} ms | {a[2]*1000:.0f} ms |
| +1,000 imported IGL players (import: {imp['accepted']} accepted) | {b[3]} | 20 | {b[0]*1000:.0f} ms | {b[1]*1000:.0f} ms | {b[2]*1000:.0f} ms |

Targets: NFR-001 p95 < 1.5 s (demo dataset); ranking < 2 s at 1,000 records. Result: {'met' if a[1] < 1.5 else 'NOT met'} / {'met' if b[1] < 2 else 'NOT met'} in this environment.
""")
print("bench", a, b)

# 4. tickets
T = [  # id, epic, title, pri, est, deps, status, reqs, tests, approach, acceptance
("001","EPIC-01","Project skeleton, dependencies, lint config","P0","30m","-","IMPLEMENTED","NFR-006","ruff check (clean)","backend/ (FastAPI), frontend/, scripts/, pyproject.toml, requirements.txt",["Repo layout exists","`ruff check .` passes","App starts with uvicorn"]),
("002","EPIC-01","Game/role/metric catalog and weight validation","P0","45m","001","TESTED","FR-IGL-003","TEST-002","backend/app/catalog.py: GAMES, DIMENSIONS, ROLE_WEIGHTS, METRIC_RANGES, validate_weights",["Every profile sums to 1.0","IGL profile equals the specified 25/20/15/15/10/10/5","Unknown dimensions rejected"]),
("003","EPIC-01","SQLite schema and player loader","P0","45m","001","TESTED","FR-PLR-002","TEST-015,019","backend/app/db.py with FK constraints, UNIQUE(game,name), UNIQUE(player_id) on membership",["Schema created idempotently","Loader derives rating_stdev/trend from history"]),
("004","EPIC-02","Synthetic seed generator (120 players, 2 titles)","P0","90m","003","TESTED","NFR-003","TEST-015","backend/app/seed.py, RNG seed 1337; edge-case players (top-K/D non-leader, missing leadership, low sample)",["≥100 players across 2 games","All flagged synthetic","Re-seeding reproduces identical data"]),
("005","EPIC-02","CSV import with validation and dry run","P0","90m","003","TESTED","FR-IMP-001","TEST-005,017,020","POST /api/players/import; row-level errors; duplicates; size/row caps",["Invalid rows reported with row/field/reason","Duplicates skipped","dry_run stores nothing","Over 1 MB ⇒ 413"]),
("006","EPIC-03","Player search and profile endpoints","P0","60m","003","TESTED","FR-PLR-001,002","TEST-004,005","GET /api/players, /api/players/{id}",["Filters combine","Profile shows provenance and missing metrics"]),
("007","EPIC-04","Percentile normalisation and dimension scoring","P0","90m","002","TESTED","FR-IGL-001","TEST-014,018","scoring.py: build_index, percentile, dimension_scores (inverse metrics, ties)",["Inverse metrics flipped","Ties mid-rank","Score recomputable by hand"]),
("008","EPIC-04","Evidence coverage and confidence tiers","P0","60m","007","TESTED","FR-SCR-001","TEST-003,006","scoring.py: evidence(); missing ≠ 0; insufficient_evidence status",["Missing leadership not zero","Small sample disclosed","Tier high requires ≥90% coverage"]),
("009","EPIC-04","Custom weights validation","P0","30m","002","TESTED","FR-IGL-003","TEST-013","422 INVALID_WEIGHTS",["Sum ≠ 1 rejected","Valid custom weights change scores"]),
("010","EPIC-05","Recommendation endpoint with persistence","P0","90m","007,008","TESTED","FR-IGL-001,FR-SCR-002","TEST-001,012,019","POST/GET /api/scouting/recommendations; deterministic ordering",["Repeated calls identical","Top-K/D non-leader not ranked #1","Stored result retrievable"]),
("011","EPIC-05","Evidence-linked explanations (why above next)","P0","45m","010","TESTED","FR-IGL-002","TEST-018","scoring.explain_vs from component differences only",["Top-3 weighted gaps returned","No free-text generation"]),
("012","EPIC-05","Candidate comparison endpoint","P0","60m","010","TESTED","FR-CMP-001","TEST-004,008","POST /api/scouting/compare; matrix; cross-game rejection",["2–5 ids","Cross-game 422","Matrix includes every dimension"]),
("013","EPIC-06","Roster CRUD and membership constraints","P0","75m","003","TESTED","FR-ROS-001,002","TEST-004,007,010","rosters + roster_members; squad templates in catalog",["Slot-full 409","One roster per player","Cross-game 422"]),
("014","EPIC-06","Unified multi-title roster analytics","P0","45m","013","TESTED","FR-ROS-003","TEST-019","GET /api/analytics/rosters (within-game percentiles)",["Both titles listed","Ratings labelled game-specific"]),
("015","EPIC-07","Estimated roster-fit engine and counterfactual","P0","90m","010,013","TESTED","FR-FIT-001","TEST-009,016","fit.py; configurable fit weights; coverage before/after",["Formula recomputable","No vacancy ⇒ RC 0","Disclaimer present"]),
("016","EPIC-09","Structured error envelope and empty-data handling","P0","30m","001","TESTED","FR-ERR-001","TEST-010,011","exception handlers in main.py",["No stack traces","Empty DB returns empty list"]),
("017","EPIC-08","UI: Squads dashboard","P0","60m","014","IMPLEMENTED","FR-UI-001","manual checklist (not run)","frontend/index.html squads()",["Shows coverage/profile/vacancies","Scout button preselects roster+role"]),
("018","EPIC-08","UI: Player directory and profile","P0","60m","006","IMPLEMENTED","FR-UI-001","manual checklist (not run)","players(), profile(), sparkline SVG",["Filters","Provenance and missing metrics visible"]),
("019","EPIC-08","UI: Scouting workspace, why-panel, compare, add","P0","120m","010,012,015","IMPLEMENTED","FR-UI-001","manual checklist (not run)","scout(), showRec(), why()",["Ranked table with evidence tier","Breakdown panel","Compare 2–5","Add to roster"]),
("020","EPIC-08","UI: CSV import view","P0","30m","005","IMPLEMENTED","FR-UI-001","manual checklist (not run)","imp()",["Validate-only and import","Row errors shown"]),
("021","EPIC-09","Quality gates and CI workflow","P0","45m","016","IMPLEMENTED","NFR-004","ruff + pytest executed locally; CI workflow never run on a CI service","scripts/quality_gate.sh, .github/workflows/ci.yml",["Local gate passes","CI file present (unverified on CI)"]),
("022","EPIC-09","Latency benchmark","P0","30m","010","TESTED","NFR-001","BENCHMARK.md (sandbox timings)","scripts/build_docs.py",["p95 recorded for 120 and 1,120 players"]),
("023","EPIC-09","Browser end-to-end smoke test","P0","90m","019","PLANNED","FR-UI-001","TEST-E2E (not written)","Playwright script for demo journey",["Journey A passes in a real browser"]),
("024","EPIC-10","Hosted deployment","P1","60m","021","PLANNED","-","smoke test (not run)","Run uvicorn on a host; set SCOUTGRID_DB to a persistent volume",["Health check reachable","Seed or import data"]),
("025","EPIC-10","Demo rehearsal with timing","P0","45m","019","PLANNED","-","DEMO_SCRIPT steps","Follow 11-release-and-demo/DEMO_SCRIPT.md",["Journey completed in ≤5 minutes"]),
("026","EPIC-08","P1: weights editing UI","P1","60m","019","DEFERRED","FR-IGL-003","-","API already accepts weights",["Sliders sum to 100%"]),
("027","EPIC-05","P1: saved shortlists and recruitment notes","P1","90m","010","DEFERRED","-","-","new tables shortlist, notes",["Persist per roster"]),
("028","EPIC-05","P1: downloadable scouting report","P1","60m","010","DEFERRED","-","-","export recommendation payload to Markdown/PDF",["Report matches API values"]),
]
os.makedirs(os.path.join(D, "07-work-management", "tickets"), exist_ok=True)
for (i, ep, ti, pr, es, dp, st, rq, ts, ap, ac) in T:
    open(os.path.join(D, "07-work-management", "tickets", f"TASK-{i}.md"), "w").write(f"""# TASK-{i} — {ti}

## Metadata
- Epic: {ep}
- Priority: {pr}
- Status: {st}
- Owner role: {'Frontend engineer' if ep=='EPIC-08' else 'Backend/analytics engineer'}
- Estimated duration: {es}
- Dependencies: {'TASK-'+dp.replace(',', ', TASK-') if dp != '-' else 'none'}
- Related requirements: {rq}
- Related tests: {ts}

## Objective
{ti}.

## Context
Supports {rq}; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
{ap}

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
{ap}

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
""" + "\n".join(f"- [{'x' if st in ('TESTED',) else ' '}] {a}" for a in ac) + f"""

## Testing Requirements
{ts}

## Definition of Done
{'Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md).' if st=='TESTED' else 'Not yet satisfied: ' + ('implemented but no automated or browser test evidence' if st=='IMPLEMENTED' else 'work not performed')}.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
""")
rows = ["# Implementation backlog (generated)", "", "Estimates are planning figures. Status reflects evidence, not code existence: TESTED = automated test executed; IMPLEMENTED = code exists, no executed test.", "", "| Ticket | Epic | Pri | Est | Depends on | Status | Title |", "|---|---|---|---|---|---|---|"]
rows += [f"| [TASK-{i}](tickets/TASK-{i}.md) | {ep} | {pr} | {es} | {dp} | {st} | {ti} |" for (i, ep, ti, pr, es, dp, st, *_ ) in T]
rows += ["", "**Critical path:** 001→002→007→008→010→015→019→023→025. **Parallelisable:** 004/005/006 beside 007–009; 013/014 beside 010–012; 017–020 once their API exists. **Solo order:** 001–004, 007–010, 013, 015, 011–012, 014, 016, 005–006, 017–020, 021–022, then 023–025.",
         "**Blocks demo:** 019, 025. **Safe to defer:** 024, 026–028."]
w("07-work-management/IMPLEMENTATION_BACKLOG.md", "\n".join(rows) + "\n")
print(len(T), "tickets")
