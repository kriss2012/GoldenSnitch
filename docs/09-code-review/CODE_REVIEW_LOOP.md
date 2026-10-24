# Code review loop
```mermaid
flowchart TD
 A[Pick ticket] --> B[Confirm AC + deps] --> C[Smallest coherent change] --> D[ruff + pytest affected tests]
 D --> E[Review diff vs ticket/spec] --> F[Security + data-integrity pass] --> G[Integration/API tests]
 G --> H[Record findings with severity + file refs] --> I{P0/P1 open?}
 I -- yes --> J[Fix] --> K[Re-run affected tests] --> H
 I -- no --> L[Verify AC] --> M[Update docs + traceability] --> N[Mark ticket only with evidence] --> O[Merge + full regression]
```
Rules: a green build is not proof of correctness; reproduce each finding or document why it is a false positive; never mark TESTED without an executed test; update `REVIEW_FINDINGS_*.md` each round. Quick command: `scripts/quality_gate.sh`.
