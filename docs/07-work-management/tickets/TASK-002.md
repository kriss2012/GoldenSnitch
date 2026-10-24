# TASK-002 — Game/role/metric catalog and weight validation

## Metadata
- Epic: EPIC-01
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-001
- Related requirements: FR-IGL-003
- Related tests: TEST-002

## Objective
Game/role/metric catalog and weight validation.

## Context
Supports FR-IGL-003; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
backend/app/catalog.py: GAMES, DIMENSIONS, ROLE_WEIGHTS, METRIC_RANGES, validate_weights

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
backend/app/catalog.py: GAMES, DIMENSIONS, ROLE_WEIGHTS, METRIC_RANGES, validate_weights

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Every profile sums to 1.0
- [x] IGL profile equals the specified 25/20/15/15/10/10/5
- [x] Unknown dimensions rejected

## Testing Requirements
TEST-002

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
