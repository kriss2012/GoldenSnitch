# TASK-018 — UI: Player directory and profile

## Metadata
- Epic: EPIC-08
- Priority: P0
- Status: IMPLEMENTED
- Owner role: Frontend engineer
- Estimated duration: 60m
- Dependencies: TASK-006
- Related requirements: FR-UI-001
- Related tests: manual checklist (not run)

## Objective
UI: Player directory and profile.

## Context
Supports FR-UI-001; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
players(), profile(), sparkline SVG

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
players(), profile(), sparkline SVG

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Filters
- [ ] Provenance and missing metrics visible

## Testing Requirements
manual checklist (not run)

## Definition of Done
Not yet satisfied: implemented but no automated or browser test evidence.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
