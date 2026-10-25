# Live Data Synchronization & Operations Guide

## 1. Synchronization Architecture
The platform coordinates asynchronous data ingestion through `backend/app/providers/manager.py` (`ProviderManager`).

### Synchronization Cycle
1. **Periodic Refresh:** Default sync interval is 15 minutes per active provider.
2. **On-Demand Manual Sync:** Authorized organization staff trigger manual ingestion via `POST /api/v1/data-sources/{id}/sync`.
3. **Idempotent Ingestion:** All database inserts utilize `INSERT OR IGNORE` and unique constraints (`external_id + provider_name`), preventing duplicate match or player creation.
4. **Resilience & Fallback:** If an external publisher API returns HTTP 429 (rate-limited) or 503 (service unavailable), Golden Snitch preserves the last known valid snapshot and tags the records with `freshness_status = 'stale'`.

---

## 2. Environment Variables Configuration

| Variable | Description | Default / Example |
|---|---|---|
| `SCOUTGRID_DB` | Path to persistent SQLite database | `data/scoutgrid.db` |
| `SCOUTGRID_SECRET_KEY` | HMAC-SHA256 JWT signing key | `golden_snitch_production_secret_key_2026_logic_legend` |
| `VALORANT_API_KEY` | HenrikDev Riot Games API token | Optional (runs in public community mode if omitted) |
| `STEAM_API_KEY` | Valve Steam Web API key | Optional (runs in public community mode if omitted) |
| `VITE_API_BASE_URL` | Frontend API proxy endpoint | `http://127.0.0.1:8000` |

---

## 3. Operational Monitoring Endpoints
- **Health & Rate-Limit Status:** `GET /api/v1/data-sources/status`
- **Trigger Provider Sync:** `POST /api/v1/data-sources/{provider_id}/sync`
- **Database Backup Script:** `python scripts/backup_db.py`
