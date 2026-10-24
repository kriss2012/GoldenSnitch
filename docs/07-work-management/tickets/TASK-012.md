# TASK-012 — Candidate comparison endpoint

## Metadata
- Epic: EPIC-05
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 60m
- Dependencies: TASK-010
- Related requirements: FR-CMP-001
- Related tests: TEST-004,008

## Objective
Candidate comparison endpoint.

## Context
Supports FR-CMP-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
POST /api/scouting/compare; matrix; cross-game rejection

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
POST /api/scouting/compare; matrix; cross-game rejection

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] 2–5 ids
- [x] Cross-game 422
- [x] Matrix includes every dimension

## Testing Requirements
TEST-004,008

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
