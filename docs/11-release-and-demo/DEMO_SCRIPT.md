# Demo script (~5 min, live app, synthetic data). Expected values come from `WORKED_EXAMPLE.md` — re-check after any reseed.
1. **Open** `http://localhost:8000/` → Squads. Say: data is synthetic. *Nova Vanguard* (TAC) 80% coverage, IGL open; *Nova Tide* (ARENA) open SHOTCALLER; *Academy* complete. (0:30)
2. Point at within-game profile bars and weak dimensions (decision, consistency for Nova Vanguard). Note ratings are not compared across titles. (0:30)
3. Click **Scout IGL** → **Run scouting**. Rank 1 is Mira_Solace (≈69.9, evidence *medium*, 80% coverage because leadership data is missing); Wren_Flux and Vex_Aurelius follow; Vex has the higher estimated fit. (1:00)
4. **Why** on #1: show weights, raw→percentile, `leadership: missing` (not zero), caveats, why-above-next drivers. (1:00)
5. Tick Mira_Solace, Vex_Aurelius, Dax_Lowsample → **Compare** (small-sample flag on Dax). (0:45)
6. Show Kaito_Strike (top K/D) ranks far lower for IGL — scoring is role-specific. Change roster to *Nova Tide* to show the ARENA profile. (0:45)
7. **Add** the chosen candidate → Squads shows 100% coverage. (0:30)
8. Close: limits — synthetic, simulated annotations, no chemistry data, UI not browser-tested, no auth.
**Claims the demo can support:** deterministic, explained rankings; missing data kept visible; cross-game isolation; sandbox latency numbers in `BENCHMARK.md`. **Do not claim:** predictive accuracy, real chemistry, expert agreement, recruiting ROI, hosted availability.
