# TASK-015 — Estimated roster-fit engine and counterfactual

## Metadata
- Epic: EPIC-07
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 90m
- Dependencies: TASK-010, TASK-013
- Related requirements: FR-FIT-001
- Related tests: TEST-009,016

## Objective
Estimated roster-fit engine and counterfactual.

## Context
Supports FR-FIT-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
fit.py; configurable fit weights; coverage before/after

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
fit.py; configurable fit weights; coverage before/after

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Formula recomputable
- [x] No vacancy ⇒ RC 0
- [x] Disclaimer present

## Testing Requirements
TEST-009,016

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
