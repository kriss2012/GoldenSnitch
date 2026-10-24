# TASK-026 — P1: weights editing UI

## Metadata
- Epic: EPIC-08
- Priority: P1
- Status: DEFERRED
- Owner role: Frontend engineer
- Estimated duration: 60m
- Dependencies: TASK-019
- Related requirements: FR-IGL-003
- Related tests: -

## Objective
P1: weights editing UI.

## Context
Supports FR-IGL-003; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
API already accepts weights

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
API already accepts weights

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Sliders sum to 100%

## Testing Requirements
-

## Definition of Done
Not yet satisfied: work not performed.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
