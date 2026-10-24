# Deployment runbook (local verified; hosted NOT performed)
Prereqs: Python 3.12, pip. `cd backend && pip install -r requirements.txt && python -m app.seed && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`. Config: `SCOUTGRID_DB` (see `.env.example`). Health: `GET /api/health` → `{"status":"ok","players":120,...}`. Tests: `bash scripts/quality_gate.sh`.
Hosted option (unverified): any host that runs one Python process with a persistent disk for the SQLite file; set `SCOUTGRID_DB` to that disk; run seed once. SQLite on ephemeral disks loses data — re-seed on boot or use the demo fallback.
Rollback: stop process, restore the previous code, delete or restore the DB file, re-run `python -m app.seed` (data is synthetic and reproducible).
Troubleshooting: `no such table` → run the seed (or any API call, which creates the schema); port busy → change `--port`; empty UI lists → seed not run.
Demo fallback: run locally and show the Swagger UI at `/docs` plus `docs/04-intelligence-engine/WORKED_EXAMPLE.md`.
**Release decision:** local demo ready; hosted deployment not attempted; no Docker image provided.
