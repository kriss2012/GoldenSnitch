# TASK-003 — SQLite schema and player loader

## Metadata
- Epic: EPIC-01
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-001
- Related requirements: FR-PLR-002
- Related tests: TEST-015,019

## Objective
SQLite schema and player loader.

## Context
Supports FR-PLR-002; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
backend/app/db.py with FK constraints, UNIQUE(game,name), UNIQUE(player_id) on membership

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
backend/app/db.py with FK constraints, UNIQUE(game,name), UNIQUE(player_id) on membership

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Schema created idempotently
- [x] Loader derives rating_stdev/trend from history

## Testing Requirements
TEST-015,019

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
