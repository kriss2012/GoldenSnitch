# UI/UX specification (UI-001)
Dark slate palette (bg #0f1a22, panel #16252f, accent ice-blue #7cc7ff; status colours green/amber/red always paired with text), system font stack with tabular numerals, no decorative motion, visible focus rings, labelled controls, tables scroll horizontally on narrow screens. Contrast not formally audited.
| Screen | Objective / data | Primary action | Loading / empty / error |
|---|---|---|---|
| Squads (executive dashboard + roster overview + multi-title) | coverage, vacancies, within-game profile bars, trend | Scout vacancy | "Loading…" / "No rosters yet…" / API message |
| Title selector | Game filter in Players; roster dropdown implies title in Scout | filter | same |
| Players (directory + profile) | filters; metrics with provenance, sparkline, missing metrics | open profile | "No players match…" |
| Scout (IGL workspace, recommendation details, comparison, gap/fit) | ranked table, evidence tier, fit; Why panel; comparison matrix | Run scouting / Compare / Add | "Ranking candidates…" / "No eligible free agents…" / inline error |
| Import | CSV validate/import with row errors | Import | "Paste CSV text or choose a file first." |
Gap analysis is shown as the roster weak dimensions on Squads and in each candidate's fit panel. A dedicated historical-analytics screen is not built (sparkline + trend label only).
