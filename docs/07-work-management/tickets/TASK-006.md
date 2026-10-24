# TASK-006 — Player search and profile endpoints

## Metadata
- Epic: EPIC-03
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 60m
- Dependencies: TASK-003
- Related requirements: FR-PLR-001,002
- Related tests: TEST-004,005

## Objective
Player search and profile endpoints.

## Context
Supports FR-PLR-001,002; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
GET /api/players, /api/players/{id}

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
GET /api/players, /api/players/{id}

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Filters combine
- [x] Profile shows provenance and missing metrics

## Testing Requirements
TEST-004,005

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
