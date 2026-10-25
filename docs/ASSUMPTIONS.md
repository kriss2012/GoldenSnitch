# ScoutIQ — Engineering Assumptions & Methodological Defaults

**Date:** 2026-10-25  
**Version:** 1.0.0-phase1  
**Status:** Active  

This document logs all explicit defaults, architectural decisions, and domain assumptions made across the ScoutIQ platform in accordance with Section 0 of the Master Build Prompt.

---

## 1. Multi-Title Scope & Role Taxonomies

1. **Title Coverage**:
   - Four competitive games are supported:
     - **Valorant** (Round-based FPS): 5v5, MR12 format (24 regulation rounds + overtime). Roles: IGL, Duelist, Initiator, Controller, Sentinel, Flex.
     - **Counter-Strike 2** (Round-based FPS): 5v5, MR12 format. Roles: IGL, Entry, AWPer, Lurker, Support, Rifler/Anchor.
     - **League of Legends** (Event/Objective-based MOBA): 5v5 Summoner's Rift. Roles: Top, Jungle, Mid, ADC, Support. Jungle and Support are designated shot-caller eligible.
     - **Dota 2** (Event/Objective-based MOBA): 5v5. Positions 1 (Carry), 2 (Mid), 3 (Offlane), 4 (Soft Support), 5 (Hard Support / Captain). Soft and Hard Supports are designated draft and shot-caller eligible.

2. **Config-Driven Architecture**:
   - No role weights or metric formulas are hardcoded in application logic.
   - All weights are loaded from `configs/games/<game>.yaml`. Every role configuration strictly validates that metric weights sum to $1.00 \pm 10^{-7}$ and defines at least 6 distinct metrics.

---

## 2. In-Game Leader (IGL) Causality & Scoring Philosophy

1. **Non-Fragging Impact**:
   - In competitive esports, top tier IGLs rarely lead their teams in kills or damage (ADR/ACS). Evaluating IGLs on personal fragging produces distorted rankings.
   - The flagship IGL Impact Score allocates only **7%** to personal firepower (FP) and measures that firepower strictly **against peer IGLs**, not against entry duelists or star AWPers.
   - The remaining **93%** is derived from tactical decision-making, round outcomes, and team coordination:
     - Call Win Delta (CWD): 22%
     - Mid-Round Adaptation (MRA): 20%
     - Economy Management (ECO): 15%
     - Conversion Discipline (CONV): 10%
     - Team Coordination (COORD): 13%
     - Late-Round Decisions (LRD): 8%
     - Consistency (CON): 5%

2. **Mid-Round Adaptation (MRA)**:
   - Evaluated exclusively on rounds where `plan_switched_mid_round = true`.
   - Measured as the win delta relative to the win probability at the exact switch timestamp ($t_{\text{switch}}$).

---

## 3. Communication Proxy Disclaimer

1. **Data Authenticity & Ethical Guardrails**:
   - Public match data dumps and public APIs rarely provide raw voice comms audio.
   - The `comms_proxy` table records call density and call-to-action latency simulated or derived from in-game ping and event pacing.
   - **Mandatory UX Rule**: In the UI and exported scouting reports, all comms metrics are explicitly stamped with:
     > *"Simulated communication proxy for decision-support only. Not a substitute for live scrim trials or voice comm evaluations."*

---

## 4. Normalization, Sample Sizes & Bayesian Shrinkage

1. **Bayesian Shrinkage Formula**:
   $$\text{shrunk\_P} = \frac{n \cdot P + k \cdot 50}{n + k}$$
   - Prior mean: 50th percentile (league average).
   - Shrinkage factor $k = 12$ maps (configurable per metric).
   - Confidence $C = \frac{n}{n + k}$.

2. **Lower Bound Credible Ranking ($Final_{LB}$)**:
   - For risk-averse organizations, $Final_{LB}$ discounts shrunk percentiles using an 80% credible lower bound:
     $$\text{LB} = \text{shrunk\_P} - 1.28 \cdot \frac{\sigma}{\sqrt{n + k}}$$
   - Prevents small-sample hype prospects from falsely ranking above proven veterans.

---

## 5. Offline & Deterministic Fallbacks

1. **LLM Layer**:
   - ScoutIQ operates completely offline without external cloud dependencies.
   - If `ANTHROPIC_API_KEY` is not present, deterministic template engines produce exact, fact-grounded "Why A over B" reports and scouting dossiers.
   - When an LLM is active, the strict numeric verifier extracts every number in the generated text; if any number is not present in the input JSON, the response is discarded and the deterministic template is used.

---

## 6. Database Storage & Persistence

1. **SQLite in WAL Mode**:
   - Embedded SQLite database configured with `PRAGMA journal_mode=WAL`, `PRAGMA synchronous=NORMAL`, and foreign key enforcement.
   - Provides sub-millisecond local reads and ACID transactions suitable for fast local scouting simulations, with PostgreSQL compatibility supported via standard SQLAlchemy/DDL mappings.
