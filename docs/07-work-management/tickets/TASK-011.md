# TASK-011 — Evidence-linked explanations (why above next)

## Metadata
- Epic: EPIC-05
- Priority: P0
- Status: TESTED
- Owner role: Backend/analytics engineer
- Estimated duration: 45m
- Dependencies: TASK-010
- Related requirements: FR-IGL-002
- Related tests: TEST-018

## Objective
Evidence-linked explanations (why above next).

## Context
Supports FR-IGL-002; see `docs/02-requirements/FUNCTIONAL_REQUIREMENTS.md` and the PRD.

## Scope
scoring.explain_vs from component differences only

## Out of Scope
Anything not listed under Scope, authentication, live data feeds, model training.

## Technical Approach
scoring.explain_vs from component differences only

## API/Data Changes
See `docs/03-architecture/API_SPECIFICATION.md` and `SYSTEM_ARCHITECTURE.md`; no changes beyond the Scope above.

## Acceptance Criteria
- [x] Top-3 weighted gaps returned
- [x] No free-text generation

## Testing Requirements
TEST-018

## Definition of Done
Automated tests pass in the recorded run (docs/08-quality/TEST_CASES.md)..

## Risks and Rollback
Regression in dependent endpoints; revert the change and rerun the full pytest suite.
