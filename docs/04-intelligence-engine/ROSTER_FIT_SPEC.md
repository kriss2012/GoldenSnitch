# Estimated roster-fit specification (FIT-001)
Implemented in `backend/app/fit.py`. Output is labelled **estimated_roster_fit**. No teammate-interaction data is used, so it is **not** chemistry.

`FitScore = Σ wₖ·cₖ / Σ wₖ` over available components; default `0.35·RC + 0.25·SC + 0.20·SA + 0.20·EQ` (override via `fit_weights`; must sum to 1).
- **RC role coverage (0–100):** if the roster has an open slot for the requested role: 100 for a primary-role candidate, 60 for secondary-role, else 0. If no open slot: 0 (duplicate-role concentration).
- **SC skill complementarity:** roster profile = mean of members' within-game dimension percentiles; weak dimensions = lowest two; SC = candidate's mean percentile on them.
- **SA strategic alignment:** candidate's mean percentile on focus dimensions (default: top-2 weights of the role profile; overridable).
- **EQ evidence quality:** evidence index × 100.
Unavailable components (e.g. empty roster) are dropped and listed in `unavailable_components`; they are not set to zero.
**Counterfactual:** `coverage_before/after`, `roster_profile_before/after`, `profile_delta` (candidate added).
**Presentation:** role score (performance) and fit are separate columns; default sort is role score, optional sort by fit.
**Future (P2) with interaction data:** shared-match win rates, trade/assist patterns, communication annotations, scrim results.
**Limitations:** SC/SA use game-wide percentiles while role score uses role-pool percentiles; weights unvalidated; EQ mixes data quality into "fit" by design (disclosed).
