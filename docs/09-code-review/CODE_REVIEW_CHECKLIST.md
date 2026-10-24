# Review checklist (tick per change)
**Correctness** ☐ meets ticket AC ☐ edge cases (empty, missing, ties, small n) ☐ formulas match `SCORING_ENGINE_SPEC.md`/`ROSTER_FIT_SPEC.md`.
**Architecture** ☐ scoring only in `scoring.py`/`fit.py`; UI has no scoring logic ☐ catalog is the single source for weights/metrics ☐ API contract unchanged or `API_SPECIFICATION.md` updated.
**Data/security** ☐ inputs validated (type, range, size) ☐ SQL parameterised ☐ uploads size-limited ☐ no secrets in repo ☐ user strings escaped in UI ☐ no stack traces in responses.
**Scoring** ☐ game metrics isolated ☐ missing ≠ 0 ☐ deterministic order incl. tie-break ☐ weights validated ☐ coverage visible ☐ explanations derive from computed numbers.
**Testing** ☐ new/changed behaviour has a test ☐ full suite re-run ☐ test evidence is real output.
**Maintainability** ☐ clear names ☐ no duplicated logic ☐ actionable errors ☐ docs/traceability updated.
