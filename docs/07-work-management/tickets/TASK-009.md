# TASK-009 — Custom weights validation

## Metadata
- Epic: EPIC-04
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 30m
- Dependencies: TASK-002
- Related requirements: FR-IGL-003
- Related tests: TEST-013

## Objective
Custom weights validation.

## Context
Supports FR-IGL-003; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
422 INVALID_WEIGHTS

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
422 INVALID_WEIGHTS

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Sum ≠ 1 rejected
- [x] Valid custom weights change scores

## Testing Requirements
TEST-013

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
