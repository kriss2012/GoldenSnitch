# TASK-021 — Quality gates and CI workflow

## Metadata
- Epic: EPIC-09
- Priority: P0
- Status: IMPLEMENTED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-016
- Related requirements: NFR-004
- Related tests: ruff + pytest executed locally; CI workflow never run on a CI service

## Objective
Quality gates and CI workflow.

## Context
Supports NFR-004; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
scripts/quality_gate.sh, .github/workflows/ci.yml

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
scripts/quality_gate.sh, .github/workflows/ci.yml

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Local gate passes
- [ ] CI file present (unverified on CI)

## Testing Requirements
ruff + pytest executed locally; CI workflow never run on a CI service

## Definition of Done
Not yet satisfied: implemented but no automated or browser test evidence.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
