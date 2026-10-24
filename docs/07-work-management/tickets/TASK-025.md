# TASK-025 — Demo rehearsal with timing

## Metadata
- Epic: EPIC-10
- Priority: P0
- Status: PLANNED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-019
- Related requirements: -
- Related tests: DEMO_SCRIPT steps

## Objective
Demo rehearsal with timing.

## Context
Supports -; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
Follow 11-release-and-demo/DEMO_SCRIPT.md

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
Follow 11-release-and-demo/DEMO_SCRIPT.md

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Journey completed in ≤5 minutes

## Testing Requirements
DEMO_SCRIPT steps

## Definition of Done
Not yet satisfied: work not performed.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
