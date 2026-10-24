# TASK-001 — Project skeleton, dependencies, lint config

## Metadata
- Epic: EPIC-01
- Priority: P0
- Status: IMPLEMENTED
- Owner role: Backend/analytics engineer
- Estimated duration: 30m
- Dependencies: none
- Related requirements: NFR-006
- Related tests: ruff check (clean)

## Objective
Project skeleton, dependencies, lint config.

## Context
Supports NFR-006; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
backend/ (FastAPI), frontend/, scripts/, pyproject.toml, requirements.txt

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
backend/ (FastAPI), frontend/, scripts/, pyproject.toml, requirements.txt

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [ ] Repo layout exists
- [ ] `ruff check .` passes
- [ ] App starts with uvicorn

## Testing Requirements
ruff check (clean)

## Definition of Done
Not yet satisfied: implemented but no automated or browser test evidence.

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
