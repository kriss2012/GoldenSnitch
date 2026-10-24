# TASK-004 — Synthetic seed generator (120 players, 2 titles)

## Metadata
- Epic: EPIC-02
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 90m
- Dependencies: TASK-003
- Related requirements: NFR-003
- Related tests: TEST-015

## Objective
Synthetic seed generator (120 players, 2 titles).

## Context
Supports NFR-003; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
backend/app/seed.py, RNG seed 1337; edge-case players (top-K/D non-leader, missing leadership, low sample)

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
backend/app/seed.py, RNG seed 1337; edge-case players (top-K/D non-leader, missing leadership, low sample)

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] ≥100 players across 2 games
- [x] All flagged synthetic
- [x] Re-seeding reproduces identical data

## Testing Requirements
TEST-015

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
