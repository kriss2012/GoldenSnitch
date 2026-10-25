# Golden Snitch — Production Operations Runbook
**Site Reliability, Monitoring, Alerting & Incident Response Manual**

---

## 1. System Health & Observability Endpoints

The backend exposes standardized operational telemetry endpoints:

- `GET /health` and `GET /api/v1/health`
  - Returns: HTTP 200 with structured JSON:
    ```json
    {
      "status": "healthy",
      "version": "2.0.0",
      "timestamp": 1729778400,
      "services": {
        "database": "connected",
        "cache": "operational",
        "providers": "connected"
      }
    }
    ```
- `GET /api/v1/data-sources/status`
  - Returns individual health, rate-limit headroom, and sync timestamps for Henrik Valorant API and Steam CS2 Provider.

---

## 2. Critical Alert Thresholds & Triage

| Condition | Severity | Immediate Action |
| :--- | :--- | :--- |
| `database != 'connected'` | P1 Critical | Verify disk space and SQLite file permissions; restart database process. |
| `HTTP 5xx error rate > 1%` | P2 High | Inspect logs for unhandled exceptions or upstream provider network timeouts. |
| `Provider Rate Limit Exceeded` | P3 Medium | The provider manager activates exponential backoff; check API quota in dashboard. |
| `Unauthorized Access Spikes` | P2 High | Rate-limiting middleware auto-drops offending IPs; check IP blacklist. |

---

## 3. Routine Administrative Tasks

### 3.1 Managing Data Disputes
1. Access `GET /api/v1/correction-requests?status=pending` (requires `ROLE_ADMIN` or `ROLE_OWNER`).
2. Verify evidence URL (e.g. VLR.gg match log or HLTV match sheet).
3. Resolve request with `PATCH /api/v1/correction-requests/{id}` providing status `resolved` or `rejected` and resolution notes.

### 3.2 Reviewing Player Claim Submissions
1. Fetch pending claims from `GET /api/v1/claims?status=pending`.
2. Verify match token or OAuth link.
3. Approve with `PATCH /api/v1/claims/{id}` (`status: "approved"`).
