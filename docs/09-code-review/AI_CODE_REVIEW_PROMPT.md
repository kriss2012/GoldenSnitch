# AI code-review prompt (paste and fill)
```
You are reviewing a change to ScoutGrid (FastAPI + SQLite + deterministic scoring). Review ONLY the material provided below; if something is not provided, say "not inspected".
Ticket: {TICKET_ID}
Acceptance criteria: {AC}
Spec IDs: {FR/SCORE/FIT/API/SEC IDs}
Architecture constraints: scoring only in scoring.py/fit.py; metrics never compared across games; missing != 0; no LLM in scoring; parameterised SQL; weights sum to 1.
Diff / changed files: {DIFF}
Test results (real output): {TEST_OUTPUT}

Return:
1. Findings ordered P0→P3. For each: severity, file:line (only if visible in the diff - never invent), why it matters, whether CONFIRMED defect or POTENTIAL risk, reproduction steps, minimal fix, regression test required, doc/contract change needed.
2. Checks against each acceptance criterion (met / not met / cannot tell).
3. Final status: APPROVE | REQUEST_CHANGES | BLOCKED (BLOCKED if you cannot inspect needed code or test evidence is missing).
Do not invent test results or line numbers.
```
