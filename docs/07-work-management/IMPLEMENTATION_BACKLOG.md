# Implementation backlog (generated)

Estimates are planning figures. Status reflects evidence, not code existence: TESTED = automated test executed; IMPLEMENTED = code exists, no executed test.

| Ticket | Epic | Pri | Est | Depends on | Status | Title |
|---|---|---|---|---|---|---|
| [TASK-001](tickets/TASK-001.md) | EPIC-01 | P0 | 30m | - | IMPLEMENTED | Project skeleton, dependencies, lint config |
| [TASK-002](tickets/TASK-002.md) | EPIC-01 | P0 | 45m | 001 | TESTED | Game/role/metric catalog and weight validation |
| [TASK-003](tickets/TASK-003.md) | EPIC-01 | P0 | 45m | 001 | TESTED | SQLite schema and player loader |
| [TASK-004](tickets/TASK-004.md) | EPIC-02 | P0 | 90m | 003 | TESTED | Synthetic seed generator (120 players, 2 titles) |
| [TASK-005](tickets/TASK-005.md) | EPIC-02 | P0 | 90m | 003 | TESTED | CSV import with validation and dry run |
| [TASK-006](tickets/TASK-006.md) | EPIC-03 | P0 | 60m | 003 | TESTED | Player search and profile endpoints |
| [TASK-007](tickets/TASK-007.md) | EPIC-04 | P0 | 90m | 002 | TESTED | Percentile normalisation and dimension scoring |
| [TASK-008](tickets/TASK-008.md) | EPIC-04 | P0 | 60m | 007 | TESTED | Evidence coverage and confidence tiers |
| [TASK-009](tickets/TASK-009.md) | EPIC-04 | P0 | 30m | 002 | TESTED | Custom weights validation |
| [TASK-010](tickets/TASK-010.md) | EPIC-05 | P0 | 90m | 007,008 | TESTED | Recommendation endpoint with persistence |
| [TASK-011](tickets/TASK-011.md) | EPIC-05 | P0 | 45m | 010 | TESTED | Evidence-linked explanations (why above next) |
| [TASK-012](tickets/TASK-012.md) | EPIC-05 | P0 | 60m | 010 | TESTED | Candidate comparison endpoint |
| [TASK-013](tickets/TASK-013.md) | EPIC-06 | P0 | 75m | 003 | TESTED | Roster CRUD and membership constraints |
| [TASK-014](tickets/TASK-014.md) | EPIC-06 | P0 | 45m | 013 | TESTED | Unified multi-title roster analytics |
| [TASK-015](tickets/TASK-015.md) | EPIC-07 | P0 | 90m | 010,013 | TESTED | Estimated roster-fit engine and counterfactual |
| [TASK-016](tickets/TASK-016.md) | EPIC-09 | P0 | 30m | 001 | TESTED | Structured error envelope and empty-data handling |
| [TASK-017](tickets/TASK-017.md) | EPIC-08 | P0 | 60m | 014 | IMPLEMENTED | UI: Squads dashboard |
| [TASK-018](tickets/TASK-018.md) | EPIC-08 | P0 | 60m | 006 | IMPLEMENTED | UI: Player directory and profile |
| [TASK-019](tickets/TASK-019.md) | EPIC-08 | P0 | 120m | 010,012,015 | IMPLEMENTED | UI: Scouting workspace, why-panel, compare, add |
| [TASK-020](tickets/TASK-020.md) | EPIC-08 | P0 | 30m | 005 | IMPLEMENTED | UI: CSV import view |
| [TASK-021](tickets/TASK-021.md) | EPIC-09 | P0 | 45m | 016 | IMPLEMENTED | Quality gates and CI workflow |
| [TASK-022](tickets/TASK-022.md) | EPIC-09 | P0 | 30m | 010 | TESTED | Latency benchmark |
| [TASK-023](tickets/TASK-023.md) | EPIC-09 | P0 | 90m | 019 | PLANNED | Browser end-to-end smoke test |
| [TASK-024](tickets/TASK-024.md) | EPIC-10 | P1 | 60m | 021 | PLANNED | Hosted deployment |
| [TASK-025](tickets/TASK-025.md) | EPIC-10 | P0 | 45m | 019 | PLANNED | Demo rehearsal with timing |
| [TASK-026](tickets/TASK-026.md) | EPIC-08 | P1 | 60m | 019 | DEFERRED | P1: weights editing UI |
| [TASK-027](tickets/TASK-027.md) | EPIC-05 | P1 | 90m | 010 | DEFERRED | P1: saved shortlists and recruitment notes |
| [TASK-028](tickets/TASK-028.md) | EPIC-05 | P1 | 60m | 010 | DEFERRED | P1: downloadable scouting report |

**Critical path:** 001→002→007→008→010→015→019→023→025. **Parallelisable:** 004/005/006 beside 007–009; 013/014 beside 010–012; 017–020 once their API exists. **Solo order:** 001–004, 007–010, 013, 015, 011–012, 014, 016, 005–006, 017–020, 021–022, then 023–025.
**Blocks demo:** 019, 025. **Safe to defer:** 024, 026–028.
