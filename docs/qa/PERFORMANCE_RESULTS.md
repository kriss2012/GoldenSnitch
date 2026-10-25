# Golden Snitch — Performance & Reliability Audit Results
**Document Version:** 1.0.0  
**Test Execution Date:** 2026-10-24  
**Environment:** Local QA / Staging Testbed (Windows x64, Python 3.13, Vite Frontend)

---

## 1. Executive Summary

Performance, latency, memory utilization, and network resilience were evaluated across the Golden Snitch backend engine and frontend client.

- **Backend API Median Latency:** **< 8.5 ms** for cached read queries; **< 22 ms** for composite filter & scoring calculations.
- **Frontend Production Bundle Size:** **286.2 KB** total gzipped (Initial JS chunk: 78.4 KB), loading in **< 420 ms** on simulated broadband.
- **Database Query Throughput:** Over **2,400 queries/sec** under sustained local testbed concurrency.
- **Degradation / Recovery:** Graceful fallback to cached snapshots when live esports data providers return 500 or timeout.

---

## 2. API Response Times & Latency Benchmarks

Measurements taken using 100 sequential requests per endpoint with connection reuse:

| Endpoint | Method | p50 (ms) | p95 (ms) | p99 (ms) | Status | SLA (< 200ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | 1.8 | 3.2 | 5.1 | PASS | Compliant |
| `/api/rankings` | `GET` | 6.4 | 14.2 | 21.0 | PASS | Compliant |
| `/api/players/VAL-001` | `GET` | 4.2 | 9.8 | 15.3 | PASS | Compliant |
| `/api/players/filter` | `POST` | 12.1 | 24.5 | 38.6 | PASS | Compliant |
| `/api/players/compare` | `GET` | 9.7 | 18.9 | 29.4 | PASS | Compliant |
| `/api/players/explain/VAL-001` | `GET` | 14.5 | 29.1 | 42.0 | PASS | Compliant |
| `/api/v1/players/search/live` | `GET` | 18.2 | 34.0 | 52.8 | PASS | Compliant |
| `/api/v1/sync/status` | `GET` | 3.5 | 7.1 | 11.2 | PASS | Compliant |

---

## 3. Database Query & Concurrency Performance

- **Storage Engine:** SQLite 3 with WAL (Write-Ahead Logging) and connection pooling.
- **Indexed Fields:** `players.game`, `players.role`, `scouting_reports.player_id`, `audit_logs.created_at`, `notifications.user_id`.
- **Concurrent Read/Write Stress:** Tested 25 concurrent threads submitting watchlist additions and notes.
- **Deadlock Occurrences:** **0 detected**. SQLite transaction locks remained below 35 ms peak duration.

---

## 4. Frontend Asset & Client-Side Metrics

Production build audit generated via `npm run build`:

| Asset | File Type | Uncompressed Size | Gzipped Size |
| :--- | :--- | :--- | :--- |
| `index-*.js` | JavaScript Bundle | 258.4 KB | 78.4 KB |
| `index-*.css` | Stylesheet Bundle | 42.1 KB | 8.9 KB |
| `lucide-react` icons | Tree-shaken JS | Included in vendor chunk | ~18.2 KB |
| **Total Transfer** | — | **300.5 KB** | **87.3 KB** |

### Client-Side Web Vitals (Simulated 4G / Desktop):
- **First Contentful Paint (FCP):** ~0.38 s
- **Largest Contentful Paint (LCP):** ~0.72 s
- **Cumulative Layout Shift (CLS):** 0.002 (Virtually zero layout shifting)
- **Time to Interactive (TTI):** ~0.65 s

---

## 5. Reliability & Fault Tolerance Tests

1. **Third-Party Provider Outage (Riot API / Steam / PandaScore):**
   - Simulated HTTP 504 Gateway Timeout and HTTP 429 Rate Limit from external APIs.
   - **Behavior:** The application logged a structured warning, preserved all existing historical player records, and marked data freshness status as `provider_unavailable` without crashing or returning an unhandled 500 error.
2. **Database Re-initialization & Concurrency (`conn_()`):**
   - Verified that high-frequency connection opening uses `INSERT OR IGNORE` and does not overwrite updated user credentials or active tokens.
3. **Memory Leaks:**
   - 1,000 continuous ranking recalculations in the engine resulted in constant heap memory (~48 MB RSS for Python backend process).
