# Threat model and privacy (SEC-001)
Scope: single-user demo, synthetic data, **no authentication**. Do not load private organisational data until access control exists.
| Threat | Entry | Impact | Mitigation (implemented) | Verification | Residual risk |
|---|---|---|---|---|---|
| Oversized/malicious CSV | `/api/players/import` | memory/CPU | 1 MB + 5,000-row caps; UTF-8 only; name regex; numeric range checks | TEST-005, 020 | chunked upload w/o Content-Length read fully (RF-001) |
| CSV formula injection | exported/pasted CSV later opened in spreadsheet | user-side | names restricted to `[\w .'-]` (no `=+@` lead chars) | review | no export feature yet |
| SQL injection | all endpoints | data loss | parameterised queries only (`?`), table names constant | code review | low |
| XSS | UI rendering of names/errors | session hijack | `esc()` on all user-controlled strings | review (RF-003) | UI untested in browser |
| Unauthorised access to scouting data | any endpoint | leak | **not mitigated** (demo only). Needed before real data: auth, per-org roles, TLS, audit log | — | high for real use |
| CORS abuse | browser | cross-origin calls | same-origin UI; no CORS middleware enabled | review | — |
| Exposed secrets | repo | credential leak | no secrets required; `.env.example` only | grep | low |
| Unsafe logging | uvicorn logs | PII leak | no player PII stored; generic 500s | review | — |
| Dependency vulnerabilities | pip | RCE | pinned minimums only; **no audit run** | — | unknown |
| Tampered scoring input / wrong deletion | API | wrong ranking | weights validated; metric ranges validated; recommendation stored; delete only roster membership | TEST-013 | no authz |
| Misleading outputs | UI/API | bad hire | evidence tier, caveats, "estimated fit", "synthetic" banners; no autonomous decisions | review | users may over-trust numbers |
**Privacy/ethics:** demo players are fictional; real use should minimise personal data (gamertag, role, match stats), avoid inferring personal traits, note historical-data bias (role meta shifts, team strength confounds), and keep humans responsible for hiring.
