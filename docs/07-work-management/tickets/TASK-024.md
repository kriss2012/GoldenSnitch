# TASK-024 — Hosted deployment

## Metadata
- Epic: EPIC-10
- Priority: P1
- Status: PLANNED
- Owner role: Backend/analytics engineer
- Estimated duration: 60m
- Dependencies: TASK-021
- Related requirements: -
- Related tests: smoke test (not run)

## Objective
Hosted deployment.

## Context
Supports -; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
Run uvicorn on a host; set SCOUTGRID_DB to a persistent volume

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
Run uvicorn on a host; set SCOUTGRID_DB to a persistent volume

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Health check reachable
- [ ] Seed or import data

## Testing Requirements
smoke test (not run)

## Definition of Done
Not yet satisfied: work not performed.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
