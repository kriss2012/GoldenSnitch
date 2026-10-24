# Review findings — 2026-10-24 — whole MVP, round 1
Reviewer: **the implementing assistant (self-review, not independent; no external or second AI reviewer was used)**. Files inspected: `backend/app/*.py`, `frontend/index.html`, tests. Tests run: `ruff check`, `pytest` (20 passed after fixes), `node --check` on the UI script.
| ID | Sev | Type | Location | Description | Fix / status |
|---|---|---|---|---|---|
| RF-001 | P2 | confirmed | `main.py import_players` | Whole upload was read before the 1 MB check (memory DoS) | **Fixed** (Content-Length pre-check); TEST-020. Chunked uploads without Content-Length still read fully → residual |
| RF-002 | P2 | confirmed (found by smoke test) | `scoring.evidence` | Candidate missing all leadership data (20% weight) was tier "high" | **Fixed** (high requires ≥90% weighted coverage); TEST-003 asserts |
| RF-003 | P3 | confirmed | `frontend/index.html` | Provenance/metric names inserted without escaping (values originate server-side, names validated) | **Fixed** (esc); no automated UI test |
| RF-004 | P3 | potential | `main.py conn_()` | SQLite connections not explicitly closed per request | Open/accepted (CPython refcounting closes them); use a dependency with `yield` if load grows |
| RF-005 | P3 | potential | `add_member` | Slot-capacity check then insert is not atomic; concurrent adds could overfill a slot | Open/accepted for single-user demo; wrap in `BEGIN IMMEDIATE` for multi-user |
| RF-006 | P3 | design | `fit.py` | SC/SA use game-wide percentiles, role score uses role-pool percentiles | Documented in `ROSTER_FIT_SPEC.md` |
| RF-007 | P2 | gap | UI | No browser or E2E tests; UI only syntax-checked | Open — TASK-023 |
| RF-008 | P2 | gap | CI | `.github/workflows/ci.yml` and `quality_gate.sh` — only the script was run locally; the workflow was never executed on a CI service | Open |
Decision: **REQUEST_CHANGES on RF-007/RF-008 before calling the UI "tested"**; backend approved for demo use on synthetic data.
