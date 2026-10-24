# Benchmark (measured 2026-10-24)
Method: in-process FastAPI TestClient (no network, no browser), single sandbox machine, SQLite temp DB, `POST /api/scouting/recommendations` (IGL, roster 1). These are **sandbox timings, not production SLO evidence**.

| Scenario | Candidates ranked | Runs | median | p95 | max |
|---|---:|---:|---:|---:|---:|
| Seeded demo (120 players) | 21 | 100 | 23 ms | 37 ms | 52 ms |
| +1,000 imported IGL players (import: 1000 accepted) | 1021 | 20 | 448 ms | 527 ms | 549 ms |

Targets: NFR-001 p95 < 1.5 s (demo dataset); ranking < 2 s at 1,000 records. Result: met / met in this environment.
