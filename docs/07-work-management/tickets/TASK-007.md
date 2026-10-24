# TASK-007 — Percentile normalisation and dimension scoring

## Metadata
- Epic: EPIC-04
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 90m
- Dependencies: TASK-002
- Related requirements: FR-IGL-001
- Related tests: TEST-014,018

## Objective
Percentile normalisation and dimension scoring.

## Context
Supports FR-IGL-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
scoring.py: build_index, percentile, dimension_scores (inverse metrics, ties)

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
scoring.py: build_index, percentile, dimension_scores (inverse metrics, ties)

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Inverse metrics flipped
- [x] Ties mid-rank
- [x] Score recomputable by hand

## Testing Requirements
TEST-014,018

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
