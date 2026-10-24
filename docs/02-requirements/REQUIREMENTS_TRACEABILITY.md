# Traceability: Problem → Persona → Requirement → Ticket → API/module → Test → Evidence
| Problem | Persona | Requirement | Ticket | API / module | Test | Evidence |
|---|---|---|---|---|---|---|
| P1 raw stats | Scout | FR-IGL-001 | TASK-007, 010 | POST /api/scouting/recommendations · scoring.py | TEST-012, 001 | TEST_CASES.md (passed) |
| P3 IGL evaluation | Coach | FR-IGL-002, FR-SCR-001 | TASK-008, 011 | scoring.evidence/explain_vs | TEST-003, 006, 018 | passed |
| P4 compatibility | GM | FR-FIT-001 | TASK-015 | fit.py | TEST-009, 016 | passed |
| P5 multi-title | Manager | FR-ROS-001..003 | TASK-013, 014 | /api/rosters*, /api/analytics/rosters | TEST-004, 007, 019 | passed |
| P6 data quality | Analyst | FR-IMP-001 | TASK-005 | POST /api/players/import | TEST-005, 017, 020 | passed |
| P7 opacity | GM | FR-IGL-003, NFR-005 | TASK-009 | validate_weights | TEST-002, 013, 018 | passed |
| UI usability | all | FR-UI-001 | TASK-017..020 | frontend/index.html | none automated | **no execution evidence** |
Change rule: edits to weights, schema, API or acceptance criteria require updating this table, the affected tickets/tests, and `CHANGELOG.md`.
