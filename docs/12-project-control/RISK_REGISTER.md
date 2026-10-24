# Risk register
| ID | Risk | Prob. | Impact | Mitigation | Fallback / status |
|---|---|---|---|---|---|
| RISK-001 | No live API access | High | Med | synthetic seed + CSV adapter boundary | accepted |
| RISK-002 | Missing/inconsistent metrics | High | High | missing ≠ 0, coverage, validation | implemented |
| RISK-003 | Scoring overfit to synthetic data | Med | Med | label synthetic; weights configurable; no accuracy claims | open until real data |
| RISK-004 | UI/API integration defects | Med | High | typed API envelope, syntax check; **E2E missing** | open (TASK-023) |
| RISK-005 | Deployment failure | Med | Med | local runbook, Swagger fallback | not attempted |
| RISK-006 | Misleading confidence | Med | High | tier + coverage + "heuristic" note | implemented |
| RISK-007 | Scope creep | Med | Med | P1/P2 deferred | controlled |
| RISK-008 | Cannot validate chemistry | High | Med | "estimated fit" label + disclaimer | accepted |
| RISK-009 | No access control | High | High for real data | demo only; see threat model | open |
