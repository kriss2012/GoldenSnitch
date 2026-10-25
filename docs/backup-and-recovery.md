# Golden Snitch — Backup, Disaster Recovery & Data Integrity Runbook

---

## 1. Backup Strategy

Golden Snitch persists all operational state, player dossiers, watchlists, annotations, organizations, and claims within SQLite / PostgreSQL.

### 1.1 Automated Snapshot Schedule
- **Hourly Incremental Backup**: Online SQLite VACUUM INTO snapshots.
- **Daily Full Archive**: Full encrypted database dump pushed to secure offsite object storage (AWS S3 with Object Lock or Cloudflare R2).
- **Retention Policy**:
  - Hourly snapshots: Retained for 48 hours.
  - Daily archives: Retained for 30 days.
  - Monthly archives: Retained for 12 months.

### 1.2 Performing a Hot Backup (SQLite Online Backup API)
```bash
# Non-blocking online snapshot using SQLite VACUUM INTO
sqlite3 scoutgrid.db "VACUUM INTO 'backups/scoutgrid_backup_$(date +%Y%m%d_%H%M%S).db';"
```

---

## 2. Recovery Procedures

### 2.1 Database Restore from Snapshot
1. Gracefully stop the backend service:
   ```bash
   systemctl stop goldensnitch-backend
   ```
2. Move current corrupt database file to quarantined directory:
   ```bash
   mv scoutgrid.db scoutgrid.db.corrupt.$(date +%s)
   ```
3. Restore from verified snapshot:
   ```bash
   cp backups/scoutgrid_backup_20261024_190000.db scoutgrid.db
   ```
4. Run SQLite integrity check:
   ```bash
   sqlite3 scoutgrid.db "PRAGMA integrity_check;"
   # Expected output: ok
   ```
5. Restart backend service and verify operational health check:
   ```bash
   systemctl start goldensnitch-backend
   curl -I http://127.0.0.1:8000/health
   # Expected HTTP 200 OK
   ```

---

## 3. Disaster Recovery Objectives

- **Recovery Point Objective (RPO)**: Maximum 1 hour data loss.
- **Recovery Time Objective (RTO)**: Full service restoration within 15 minutes.
