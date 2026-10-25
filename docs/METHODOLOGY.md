# ScoutIQ — Scoring & Intelligence Methodology

**Version:** 1.0.0-phase1  
**Status:** Active Production Specification  
**Authors:** Senior Staff Engineer, Data Scientist & Esports Analytics Lead  

---

## 1. Overview & Core Philosophy

ScoutIQ is an AI-powered esports scouting, talent discovery, and multi-roster intelligence platform. Its methodology is governed by three non-negotiable principles:

1. **Zero Mock Data**: Every score, badge, trend, and recommendation is computed from granular database telemetry using deterministic, mathematical formulas.
2. **Transparent, Additive Decomposition**: Every ranking can be decomposed into exact component contributions ($\Delta_i = w_i \cdot (A_i - B_i)$). There are no black-box scores.
3. **Role-Contextualized Impact**: Players are evaluated strictly within their role context. In-Game Leaders (IGLs) are judged on strategic calling and round adaptation—not entry fragging.

---

## 2. Metric Normalization & Shrinkage Pipeline (Section 5.1)

For any raw metric $m$, player $p$, game $g$, and role $r$, the computation flows through a 5-stage pipeline:

```
[ Raw Match Telemetry ]
          │
          ▼
1. Per-Unit Rate (per round / per min / per map)
          │
          ▼
2. Opponent & Recency Adjustment:
   w_match = clip(Elo_opp / Elo_league_mean, 0.7, 1.3) × 0.5^(age_days / 120) × Tier_weight
          │
          ▼
3. Role-Peer Percentile P:
   Ranked within peers of same game & role (min 30 peers)
          │
          ▼
4. Bayesian Shrinkage (Small-Sample Control):
   shrunk_P = (n · P + k · 50) / (n + k)    [with k = 12 maps, Confidence C = n / (n + k)]
          │
          ▼
5. Patch Resilience:
   patch_resilience = 1 - |P_current_patch - P_prior_patch| / 100
```

---

## 3. Flagship Model: IGL Impact Score (Section 5.2)

$$\text{IGL\_Score} = 100 \times \sum_{i=1}^8 \left( w_i \times \frac{\text{shrunk\_P}_i}{100} \right) \quad \left(\sum w_i = 1.00\right)$$

### 3.1 The 8 Components

| # | Code | Component Name | Weight | Mathematical Definition & Derivation |
|---|---|---|---|---|
| 1 | `CWD` | **Call Win Delta** | **0.22** | $\text{WinRate}(\text{rounds under executed call}) - \mathbb{E}[\text{WinRate}]$ where expected win rate is predicted by a logistic model based on opening economy differential, side, and opponent Elo. |
| 2 | `MRA` | **Mid-Round Adaptation** | **0.20** | For rounds where $\text{plan\_switched\_mid\_round} = \text{true}$: $\text{WinRate}_{\text{after\_switch}} - P_{\text{win}}(t_{\text{switch}})$, evaluated against the round-state win-probability model at the switch instant. |
| 3 | `ECO` | **Economy Management** | **0.15** | Over eco/force/semi-buy rounds: composite of $0.60 \cdot \Delta\text{Win\%} + 0.25 \cdot \text{SaveCorrectness} + 0.15 \cdot \text{BuySyncRate}$. Penalizes double-force failures; rewards disciplined saves. |
| 4 | `CONV` | **Conversion Discipline** | **0.10** | Unweighted mean of Pistol Round Win Delta, Post-Plant Conversion Delta, and Retake Success Delta vs. expected baseline. |
| 5 | `COORD`| **Team Coordination** | **0.13** | $0.40 \cdot \text{TradeEfficiency} + 0.30 \cdot \text{UtilitySyncRate} + 0.30 \cdot \text{DefaultToExecuteTimingConsistency}$. |
| 6 | `LRD` | **Late-Round Decisions** | **0.08** | In $1\text{v}X$, $2\text{v}X$, or time-pressure states ($<25\text{s}$ remaining): actual round conversion minus expected state win probability. |
| 7 | `FP` | **Personal Firepower** | **0.07** | Percentile of ADR/ACS normalized **strictly against peer IGLs** (never against entry duelists or star AWPers). |
| 8 | `CON` | **Consistency** | **0.05** | $100 \times \text{Percentile}(1 - \text{CV}_{10}(\text{CWD}))$, where $\text{CV}_{10}$ is the coefficient of variation of CWD across the player's last 10 maps. |

---

## 4. Candidate Final Score & Lower Bound (Section 6.1)

For roster $R$ needing role $r$, evaluating candidate $c$:

$$\text{Final} = 100 \times \left[ 0.45 \cdot F + 0.25 \cdot S + 0.10 \cdot T + 0.10 \cdot V + 0.10 \cdot (1 - \text{Risk}) \right]$$

- **$F$ (Role Fit)**: Shrunk role model score / 100.
- **$S$ (Synergy Delta)**: $\text{clip}\left(\frac{\text{Synergy}(R \cup \{c\}) - \text{Synergy}(R_{\text{baseline}})}{\text{Scale}}, 0, 1\right)$.
- **$T$ (Trajectory Index)**: Career trajectory score derived from Theil-Sen trend slope and age curve.
- **$V$ (Market Value)**: $\text{clip}\left(\frac{\text{ExpectedSalary}(c) - \text{AskSalary}(c)}{\text{ExpectedSalary}(c)} \times 0.5 + 0.5, 0, 1\right)$.
- **$\text{Risk}$**: Weighted sum of active risk flags (capped at 1.0).

### Conservative Lower Bound ($\text{Final}_{LB}$)
$$\text{Final}_{LB} = \text{Score computed by replacing each shrunk percentile with its 80\% credible lower bound:}$$
$$P_{LB} = \text{shrunk\_P} - 1.28 \times \frac{\sigma}{\sqrt{n + k}}$$

---

## 5. Squad Synergy Model (Section 7)

$$\text{Synergy}(R) = 100 \times \left( 0.25 \cdot \text{RoleCoverage} + 0.20 \cdot \text{StyleBalance} + 0.20 \cdot \text{Complementarity} + 0.15 \cdot \text{CommsCompat} + 0.10 \cdot \text{HistoryBonus} + 0.10 \cdot \text{PoolFit} \right)$$

1. **RoleCoverage**: Fraction of required role slots filled by players with role score $\ge 60$, plus a $+0.05$ bonus if a qualified secondary caller exists.
2. **StyleBalance**: Penalizes resource clashes (e.g., multiple hyper-aggressive entry fraggers) and rewards complementary pairs (e.g., aggressive entry + high utility anchor).
3. **Complementarity**: Measures how effectively candidate style attributes fill the roster's diagnosed deficits against tier benchmarks.
4. **CommsCompat**: Pairwise shared spoken languages coverage plus communication density compatibility.
5. **HistoryBonus**: Shared past competitive tenure (months) saturating at 12 months with empirical performance uplift.
6. **PoolFit**: Absence of champion/agent overlap clashes and meta-pool coverage for the current patch.

---

## 6. Trajectory & Roster Health Index (Section 8)

- **Slope Estimation**: Theil-Sen robust linear regression of role score over the last 10, 25, and 50 maps.
- **Statistical Significance**: Mann-Kendall trend test with reported $p$-value.
- **Roster Health Index (RHI, 0–100)**:
  $$\text{RHI} = 0.35 \cdot \overline{\text{RoleScore}} + 0.25 \cdot \text{Synergy} + 0.20 \cdot \overline{\text{Trajectory}} + 0.10 \cdot \text{Depth} + 0.10 \cdot \text{ContractStability}$$

---

## 7. Risk Flags Taxonomy (Section 5.6)

1. `LOW_SAMPLE`: Sample size $n < 20$ maps.
2. `OPPONENT_INFLATED`: $\ge 60\%$ of weighted matches played against lower-tier competition.
3. `ROLE_INFLATED`: Performance boosted by off-role farming or non-standard team comps.
4. `SYNERGY_DEPENDENT`: Performance drops $> 15$ percentiles when a specific teammate is absent.
5. `FORM_DECLINE`: Statistically significant negative trajectory slope ($p < 0.10$).
6. `PATCH_FRAGILE`: Patch resilience metric $< 0.60$.
7. `CONTRACT_LOCKED`: Buyout exceeds target organization's allocated budget.
8. `FATIGUE_RISK`: Excessive match workload ($\ge 18$ maps in 14 days) with declining late-map consistency.
9. `DATA_QUALITY`: Low telemetry fidelity or missing round-level annotations.
