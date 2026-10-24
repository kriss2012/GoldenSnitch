# TASK-005 — CSV import with validation and dry run

## Metadata
- Epic: EPIC-02
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 90m
- Dependencies: TASK-003
- Related requirements: FR-IMP-001
- Related tests: TEST-005,017,020

## Objective
CSV import with validation and dry run.

## Context
Supports FR-IMP-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
POST /api/players/import; row-level errors; duplicates; size/row caps

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
POST /api/players/import; row-level errors; duplicates; size/row caps

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Invalid rows reported with row/field/reason
- [x] Duplicates skipped
- [x] dry_run stores nothing
- [x] Over 1 MB ⇒ 413

## Testing Requirements
TEST-005,017,020

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
