# TASK-019 — UI: Scouting workspace, why-panel, compare, add

## Metadata
- Epic: EPIC-08
- Priority: P0
- Status: IMPLEMENTED
- Owner role: Frontend engineer
- Estimated duration: 120m
- Dependencies: TASK-010, TASK-012, TASK-015
- Related requirements: FR-UI-001
- Related tests: manual checklist (not run)

## Objective
UI: Scouting workspace, why-panel, compare, add.

## Context
Supports FR-UI-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
scout(), showRec(), why()

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
scout(), showRec(), why()

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Ranked table with evidence tier
- [ ] Breakdown panel
- [ ] Compare 2–5
- [ ] Add to roster

## Testing Requirements
manual checklist (not run)

## Definition of Done
Not yet satisfied: implemented but no automated or browser test evidence.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
