# TASK-014 — Unified multi-title roster analytics

## Metadata
- Epic: EPIC-06
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-013
- Related requirements: FR-ROS-003
- Related tests: TEST-019

## Objective
Unified multi-title roster analytics.

## Context
Supports FR-ROS-003; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
GET /api/analytics/rosters (within-game percentiles)

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
GET /api/analytics/rosters (within-game percentiles)

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Both titles listed
- [x] Ratings labelled game-specific

## Testing Requirements
TEST-019

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
