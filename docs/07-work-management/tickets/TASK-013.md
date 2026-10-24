# TASK-013 — Roster CRUD and membership constraints

## Metadata
- Epic: EPIC-06
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 75m
- Dependencies: TASK-003
- Related requirements: FR-ROS-001,002
- Related tests: TEST-004,007,010

## Objective
Roster CRUD and membership constraints.

## Context
Supports FR-ROS-001,002; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
rosters + roster_members; squad templates in catalog

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
rosters + roster_members; squad templates in catalog

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Slot-full 409
- [x] One roster per player
- [x] Cross-game 422

## Testing Requirements
TEST-004,007,010

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
