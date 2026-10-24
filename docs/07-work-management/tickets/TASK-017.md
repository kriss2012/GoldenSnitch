# TASK-017 — UI: Squads dashboard

## Metadata
- Epic: EPIC-08
- Priority: P0
- Status: IMPLEMENTED
- Owner role: Frontend engineer
- Estimated duration: 60m
- Dependencies: TASK-014
- Related requirements: FR-UI-001
- Related tests: manual checklist (not run)

## Objective
UI: Squads dashboard.

## Context
Supports FR-UI-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
frontend/index.html squads()

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
frontend/index.html squads()

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Shows coverage/profile/vacancies
- [ ] Scout button preselects roster+role

## Testing Requirements
manual checklist (not run)

## Definition of Done
Not yet satisfied: implemented but no automated or browser test evidence.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
