# TASK-016 — Structured error envelope and empty-data handling

## Metadata
- Epic: EPIC-09
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 30m
- Dependencies: TASK-001
- Related requirements: FR-ERR-001
- Related tests: TEST-010,011

## Objective
Structured error envelope and empty-data handling.

## Context
Supports FR-ERR-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
exception handlers in main.py

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
exception handlers in main.py

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] No stack traces
- [x] Empty DB returns empty list

## Testing Requirements
TEST-010,011

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
