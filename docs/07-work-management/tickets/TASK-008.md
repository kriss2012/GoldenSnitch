# TASK-008 — Evidence coverage and confidence tiers

## Metadata
- Epic: EPIC-04
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 60m
- Dependencies: TASK-007
- Related requirements: FR-SCR-001
- Related tests: TEST-003,006

## Objective
Evidence coverage and confidence tiers.

## Context
Supports FR-SCR-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
scoring.py: evidence(); missing ≠ 0; insufficient_evidence status

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
scoring.py: evidence(); missing ≠ 0; insufficient_evidence status

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Missing leadership not zero
- [x] Small sample disclosed
- [x] Tier high requires ≥90% coverage

## Testing Requirements
TEST-003,006

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
