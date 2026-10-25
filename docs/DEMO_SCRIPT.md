# ScoutIQ — 5-Minute Executive Walkthrough & Demo Script

This script provides an exact 5-minute click-path and API verification demonstration of all **14 unique features** in ScoutIQ.

---

## Prerequisites
- Backend running at `http://localhost:8000` (`make backend` or `python run.py`)
- Frontend running at `http://localhost:5173` (`make frontend` or `npm run dev`)

---

## 1. Minute 0:00–1:00 — Live Rankings & IGL Intelligence (Features 1–2)

### UI Click-Path:
1. Navigate to **Player Database** (`http://localhost:5173/players`).
2. Notice the persistent **ScoutIQ Talent Explorer** table showing live Bayesian rankings with 80% credible lower bounds `[Final_LB, Score]`.
3. Switch presets from **Balanced** to **Economy-Focused**; watch the table re-rank dynamically.
4. Click **"IGL Intel"** on any In-Game Leader.
5. In the modal, view the **8-axis tactical radar**, side splits (Attack vs Defense Call Win Delta), and click **"Pivotal Macro Decisions & WPA Timeline"** to inspect round-by-round Win Probability Added (`+0.18`, `-0.09`).

### CLI / curl equivalent:
```bash
# 50-Player live ranking with balanced preset
curl -s "http://localhost:8000/api/rankings?game=valorant&limit=10" | jq

# 8-Axis IGL Breakdown
curl -s "http://localhost:8000/api/igl/ply_valorant_001/breakdown" | jq

# IGL Decision timeline with WPA
curl -s "http://localhost:8000/api/igl/ply_valorant_001/decisions?limit=5" | jq
```

---

## 2. Minute 1:00–2:00 — Multi-Roster Chemistry & Synergy (Features 3–4)

### UI Click-Path:
1. Navigate to **Rosters** (`http://localhost:5173/rosters`).
2. Select **"Phase 5 Sentinels Core"**.
3. View the **Roster Health Index (RHI = 84.2)** and pairwise chemistry matrix with complementarity badges (`TACTICAL_SPEARHEAD`, `DEFENSIVE_ANCHOR`).
4. Click **"Diagnose Roster Gaps"** to view weakest slots and missing tactical attributes.

### CLI / curl equivalent:
```bash
# Evaluate roster synergy and RHI
curl -s "http://localhost:8000/api/rosters/1/synergy" | jq

# Gap Diagnosis & recommended solutions
curl -s "http://localhost:8000/api/rosters/1/diagnosis" | jq
```

---

## 3. Minute 2:00–3:00 — Multi-Objective Recommendations & Additive "Why A over B" (Features 5–7)

### UI Click-Path:
1. Navigate to **Scouting Recommendations** (`http://localhost:5173/scouting`).
2. Run recommendation for an open **IGL** vacancy under **$250,000**.
3. Select two candidates and click **"Head-to-Head Comparison"**.
4. Inspect the strictly additive waterfall table:
   $$\Delta = \Delta_{Fit} + \Delta_{Synergy} + \Delta_{Trajectory} + \Delta_{Value} + \Delta_{Risk}$$
   Sum of component differences equals the overall delta to $< 10^{-6}$ precision.

### CLI / curl equivalent:
```bash
# Multi-objective recommendation run
curl -X POST "http://localhost:8000/api/recommendations" \
     -H "Content-Type: application/json" \
     -d '{"roster_id": 1, "target_role": "IGL", "max_budget": 250000}' | jq

# Additive Head-to-Head Comparison
curl -s "http://localhost:8000/api/recommendations/head-to-head?cand_a=ply_valorant_001&cand_b=ply_valorant_002&role=IGL" | jq
```

---

## 4. Minute 3:00–4:00 — Counterfactual Simulation, Hidden Gems & Hype Detector (Features 8–10)

### UI Click-Path:
1. In the Roster view, click **"Simulate Roster Swap"**.
2. Select starter out, candidate in, and click **"Run 5,000 Monte Carlo Rounds"**.
3. View the expected win rate delta with the 95% Confidence Interval.
4. Navigate to **Hidden Gems** to view candidates with the highest positive $(ExpectedSalary - AskSalary)$ surplus.
5. Inspect the **Stat-Padder & Hype Detector** tab to catch inflated damage in lost rounds.

### CLI / curl equivalent:
```bash
# Counterfactual Monte Carlo Simulation (5,000 iterations)
curl -X POST "http://localhost:8000/api/simulator/counterfactual" \
     -H "Content-Type: application/json" \
     -d '{"roster_id": 1, "player_out_id": "ply_valorant_002", "candidate_in_id": "ply_valorant_007", "n_simulations": 5000}' | jq

# Hidden Gem Finder (Surplus value regression)
curl -s "http://localhost:8000/api/scouting/hidden-gems?game=valorant&limit=5" | jq

# Stat-Padder & Small-Sample Hype Detector
curl -s "http://localhost:8000/api/scouting/stat-padders-and-hype?game=valorant&limit=5" | jq
```

---

## 5. Minute 4:00–5:00 — ILP Optimizer, NL Search & Bias Audit (Features 11–14)

### UI Click-Path:
1. Open the **Budget Optimizer**: input `$600,000` annual budget; watch PuLP/SciPy MILP solve the optimal roster in $< 0.15$s.
2. In the global search bar, type:
   `"Aggressive duelist in EMEA under $180k with high opening duel win rate"`
   and observe automatic structured query translation.
3. Open **Fairness Audit** to view Cohen's d across regions confirming $|d| \le 0.18$.
4. Generate and download a printable **Executive Scouting Report**.

### CLI / curl equivalent:
```bash
# PuLP / MILP Optimal Roster Construction
curl -X POST "http://localhost:8000/api/optimizer/roster" \
     -H "Content-Type: application/json" \
     -d '{"game": "valorant", "budget_usd": 600000, "target_roles": ["IGL", "Duelist", "Initiator", "Controller", "Sentinel"]}' | jq

# Natural-Language Scouting Search with structured filter parser
curl -X POST "http://localhost:8000/api/search/nl" \
     -H "Content-Type: application/json" \
     -d '{"query": "Aggressive duelist in EMEA under $180k", "game": "valorant"}' | jq

# Regional Fairness & Bias Audit (Cohen's d)
curl -s "http://localhost:8000/api/audit/fairness?game=valorant" | jq

# Academy Pipeline Readiness Score
curl -s "http://localhost:8000/api/talent/pipeline-readiness?game=valorant&limit=5" | jq
```
