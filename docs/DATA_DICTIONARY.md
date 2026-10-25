# ScoutIQ — Data Dictionary

**Version:** 1.0.0-phase1  
**Target Engine:** SQLite 3 / PostgreSQL 15+  
**Scope:** Core ScoutIQ Schema (Section 4.2)

---

## 1. Entity Relationship Overview

The schema is partitioned into:
- **Taxonomy & Metadata**: `games`, `organizations`, `teams`
- **Roster & Contract Management**: `rosters`, `roster_slots`, `contracts`, `pipeline_stages`
- **Telemetry & Match Data**: `matches`, `maps_or_games`, `rounds`, `round_events`, `player_map_stats`, `objective_events`, `comms_proxy`
- **Intelligence & Analytics**: `player_metric_snapshots`, `scores`, `recommendations`, `audit_log`, `_ground_truth`

---

## 2. Table Specifications

### 2.1 `teams`
Stores competitive esports teams across game titles and tiers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique identifier (e.g., `TEAM-SEN`, `TEAM-FNC`). |
| `name` | `TEXT` | `NOT NULL` | Display team name. |
| `org_id` | `TEXT` | | Foreign key to parent organization. |
| `game_id` | `TEXT` | `NOT NULL` | Game identifier (`valorant`, `cs2`, `lol`, `dota2`). |
| `tier` | `TEXT` | `NOT NULL CHECK IN ('T1', 'T2', 'T3', 'academy')` | Competitive tier. |
| `region` | `TEXT` | `NOT NULL` | Competitive region (e.g., `NA`, `EMEA`, `APAC`, `KR`). |
| `elo` | `REAL` | `NOT NULL DEFAULT 1500.0` | Current competitive Elo rating. |
| `created_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Registration timestamp. |

---

### 2.2 `roster_slots`
Assigns players to specific slots within a roster.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Slot identifier. |
| `roster_id` | `TEXT` | `NOT NULL` | Target roster identifier. |
| `player_id` | `TEXT` | `NOT NULL` | Assigned player identifier. |
| `role` | `TEXT` | `NOT NULL` | Role played (e.g., `IGL`, `Duelist`, `Jungle`). |
| `is_starter` | `INTEGER` | `NOT NULL DEFAULT 1` | `1` for active starter, `0` for substitute/reserve. |
| `join_date` | `TEXT` | `NOT NULL` | Roster joining date. |
| `leave_date` | `TEXT` | | Departure date (null if currently active). |

---

### 2.3 `contracts`
Tracks player compensation, buyouts, and contract expiration.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Contract identifier. |
| `player_id` | `TEXT` | `NOT NULL` | Associated player. |
| `team_id` | `TEXT` | | Current team holding the contract. |
| `salary_monthly` | `REAL` | `NOT NULL DEFAULT 0.0` | Active monthly salary in USD. |
| `buyout` | `REAL` | `NOT NULL DEFAULT 0.0` | Contract release buyout in USD. |
| `start_date` | `TEXT` | | Contract start date (ISO-8601). |
| `end_date` | `TEXT` | | Contract expiry date (ISO-8601). |
| `ask_salary` | `REAL` | `NOT NULL DEFAULT 0.0` | Candidate's requested monthly salary. |

---

### 2.4 `maps_or_games`
Represents an individual map or match game played within a competitive series.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique map identifier. |
| `match_id` | `TEXT` | `NOT NULL` | Parent match/series identifier. |
| `map_name_or_game_no` | `TEXT` | `NOT NULL` | Map name (e.g., `Haven`, `Mirage`) or game number (`Game 1`). |
| `duration` | `INTEGER` | `NOT NULL DEFAULT 0` | Duration in seconds. |
| `score_a` | `INTEGER` | `NOT NULL DEFAULT 0` | Final score of Team A. |
| `score_b` | `INTEGER` | `NOT NULL DEFAULT 0` | Final score of Team B. |
| `winner_team_id` | `TEXT` | | Winning team identifier. |
| `patch` | `TEXT` | | Game patch version during the match. |

---

### 2.5 `rounds` (FPS Titles: Valorant / CS2)
Round-by-round telemetry capturing strategic plans and mid-round adaptations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Round identifier. |
| `map_id` | `TEXT` | `NOT NULL REFERENCES maps_or_games(id)` | Parent map. |
| `round_no` | `INTEGER` | `NOT NULL` | Round number (1, 2, ...). |
| `side` | `TEXT` | `NOT NULL CHECK IN ('atk', 'def', 'ct', 't')` | Starting team side. |
| `buy_type_a` | `TEXT` | `NOT NULL` | Economy category (`full_buy`, `force_buy`, `eco`, `semi_eco`). |
| `buy_type_b` | `TEXT` | `NOT NULL` | Opponent economy category. |
| `econ_a` | `INTEGER` | `NOT NULL DEFAULT 0` | Total team bank/equipment value. |
| `econ_b` | `INTEGER` | `NOT NULL DEFAULT 0` | Opponent bank/equipment value. |
| `winner` | `TEXT` | `NOT NULL` | Round winner (`team_a` or `team_b`). |
| `plan_tag` | `TEXT` | `NOT NULL DEFAULT 'default'` | Opening tactical call tag (e.g., `A_split`, `C_fast_push`). |
| `plan_switched_mid_round` | `INTEGER` | `NOT NULL DEFAULT 0` | `1` if call was changed mid-round, `0` otherwise. |
| `switch_time_s` | `REAL` | | Clock timestamp when plan was pivoted. |
| `bomb_planted` | `INTEGER` | `NOT NULL DEFAULT 0` | `1` if spike/c4 was successfully planted. |
| `plan_conversion` | `INTEGER` | `NOT NULL DEFAULT 0` | `1` if round was won following plan execution. |
| `igl_player_id` | `TEXT` | | Player ID of active in-game leader. |

---

### 2.6 `round_events`
Micro-events occurring during round execution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Event identifier. |
| `round_id` | `TEXT` | `NOT NULL REFERENCES rounds(id)` | Parent round. |
| `t_s` | `REAL` | `NOT NULL` | Timestamp within round in seconds. |
| `event_type` | `TEXT` | `NOT NULL` | `kill`, `assist`, `utility_detonate`, `plan_pivot`, `plant`. |
| `actor_player_id` | `TEXT` | | Player performing the action. |
| `target_player_id` | `TEXT` | | Player affected by the action. |
| `value` | `REAL` | `DEFAULT 0.0` | Numerical metric (damage, blind duration, WPA). |
| `details` | `TEXT` | `DEFAULT '{}'` | JSON payload with weapon, location coordinates, ability. |

---

### 2.7 `player_map_stats`
Aggregated map-level box-score and advanced telemetry per player.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Record identifier. |
| `map_id` | `TEXT` | `NOT NULL REFERENCES maps_or_games(id)` | Parent map. |
| `player_id` | `TEXT` | `NOT NULL` | Player identifier. |
| `team_id` | `TEXT` | `NOT NULL` | Team identifier. |
| `role_played` | `TEXT` | `NOT NULL` | Role executed during map. |
| `agent_or_champion`| `TEXT` | `NOT NULL` | Character picked. |
| `kills` | `INTEGER`| `NOT NULL DEFAULT 0` | Total kills. |
| `deaths` | `INTEGER`| `NOT NULL DEFAULT 0` | Total deaths. |
| `assists` | `INTEGER`| `NOT NULL DEFAULT 0` | Total assists. |
| `adr_or_dpm` | `REAL` | `NOT NULL DEFAULT 0.0` | Average Damage per Round / Damage per Minute. |
| `kast` | `REAL` | `NOT NULL DEFAULT 0.0` | Kill/Assist/Survive/Trade percentage (0.0 to 1.0). |
| `first_kills` | `INTEGER`| `NOT NULL DEFAULT 0` | Opening duel wins. |
| `first_deaths` | `INTEGER`| `NOT NULL DEFAULT 0` | Opening duel losses. |
| `clutches_won`| `INTEGER`| `NOT NULL DEFAULT 0` | 1vX situations won. |
| `clutches_attempted`| `INTEGER`| `NOT NULL DEFAULT 0` | 1vX situations faced. |
| `trades_given`| `INTEGER`| `NOT NULL DEFAULT 0` | Deaths traded by a teammate within 3 seconds. |
| `trades_taken`| `INTEGER`| `NOT NULL DEFAULT 0` | Revenge frags secured within 3 seconds. |
| `utility_damage`| `REAL` | `NOT NULL DEFAULT 0.0` | Damage caused by abilities/grenades. |
| `flash_assists`| `INTEGER`| `NOT NULL DEFAULT 0` | Kills secured by teammates on blinded targets. |

---

### 2.8 `objective_events` (MOBA Titles: LoL / Dota 2)
Timeline events for objectives, major teamfights, and gold swings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Event identifier. |
| `map_id` | `TEXT` | `NOT NULL REFERENCES maps_or_games(id)` | Parent game. |
| `t_s` | `REAL` | `NOT NULL` | Game time in seconds. |
| `event_type` | `TEXT` | `NOT NULL` | `dragon_slay`, `baron_nashor`, `roshan_kill`, `teamfight`. |
| `team_id` | `TEXT` | `NOT NULL` | Securing team. |
| `objective_name` | `TEXT`| `NOT NULL` | Name of secured objective. |
| `gold_diff` | `INTEGER`| `NOT NULL DEFAULT 0` | Net gold lead at event timestamp. |
| `win_prob_delta`| `REAL` | `NOT NULL DEFAULT 0.0` | Win probability shift caused by event. |

---

### 2.9 `comms_proxy`
Simulated communication density and latency measurements.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Record identifier. |
| `map_id` | `TEXT` | `NOT NULL` | Match map. |
| `team_id` | `TEXT` | `NOT NULL` | Team identifier. |
| `player_id` | `TEXT` | `NOT NULL` | Player identifier. |
| `call_density` | `REAL` | `NOT NULL DEFAULT 0.0` | Estimated shot-calls per minute. |
| `call_to_action_latency_ms` | `REAL` | `NOT NULL DEFAULT 0.0` | Team reaction time following calls. |
| `proxy_disclaimer` | `TEXT` | `NOT NULL` | Mandatory UI and analytical disclaimer. |

---

### 2.10 `player_metric_snapshots`
Stores normalized, opponent-adjusted, and Bayesian-shrunk metric percentiles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Snapshot identifier. |
| `player_id` | `TEXT` | `NOT NULL` | Player evaluated. |
| `as_of_date` | `TEXT` | `NOT NULL` | Snapshot timestamp (ISO-8601). |
| `metric` | `TEXT` | `NOT NULL` | Metric code (e.g., `cwd`, `mra`, `adr`). |
| `raw_value` | `REAL` | `NOT NULL` | Raw computed rate. |
| `percentile` | `REAL` | `NOT NULL` | Role peer percentile (0.0 to 100.0). |
| `shrunk_value` | `REAL` | `NOT NULL` | Bayesian shrunk percentile ($k=12$). |
| `n_samples` | `INTEGER` | `NOT NULL` | Weighted map sample count. |
| `confidence` | `REAL` | `NOT NULL DEFAULT 0.5` | Sample confidence $C = n / (n + k)$. |

---

### 2.11 `scores`
Overall role fit and candidate scores with confidence intervals and risk flags.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Score record identifier. |
| `player_id` | `TEXT` | `NOT NULL` | Player evaluated. |
| `role` | `TEXT` | `NOT NULL` | Role evaluated. |
| `game_id` | `TEXT` | `NOT NULL` | Game title. |
| `as_of_date` | `TEXT` | `NOT NULL` | Evaluation date. |
| `role_fit` | `REAL` | `NOT NULL` | Weighted role model score (0.0 to 100.0). |
| `final_score` | `REAL` | `NOT NULL` | Composite candidate score $Final$. |
| `final_lb` | `REAL` | `NOT NULL` | Conservative lower credible bound $Final_{LB}$. |
| `confidence` | `REAL` | `NOT NULL` | Metric confidence factor (0.0 to 1.0). |
| `risk_flags` | `TEXT` | `NOT NULL DEFAULT '[]'` | JSON list of active risk flags. |
| `sub_scores_json` | `TEXT` | `NOT NULL DEFAULT '{}'` | Decomposed component sub-scores. |
| `version` | `TEXT` | `NOT NULL DEFAULT '1.0.0'`| Engine version stamp. |

---

### 2.12 `_ground_truth` (Validation Only)
Hidden latent variables generated by the synthetic simulator. **Never accessed by production scoring code.**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `player_id` | `TEXT` | `PRIMARY KEY` | Player identifier. |
| `aim` | `REAL` | `NOT NULL` | Latent mechanical aim skill (0.0 to 1.0). |
| `game_sense` | `REAL` | `NOT NULL` | Latent tactical awareness (0.0 to 1.0). |
| `consistency` | `REAL` | `NOT NULL` | Latent match-to-match consistency. |
| `clutch` | `REAL` | `NOT NULL` | Latent high-pressure composure. |
| `leadership` | `REAL` | `NOT NULL` | Latent IGL tactical calling capability. |
| `adaptability` | `REAL` | `NOT NULL` | Latent mid-round recovery ability. |
| `comms` | `REAL` | `NOT NULL` | Latent communication clarity. |
| `form_trend` | `REAL` | `NOT NULL` | Latent performance trajectory slope. |
| `age_curve` | `REAL` | `NOT NULL` | Career maturity modifier. |
| `hidden_potential` | `REAL` | `NOT NULL` | Latent talent ceiling. |
| `archetype` | `TEXT` | `NOT NULL` | `veteran_igl`, `stat_padder`, `young_prospect`, `frag_duelist`, etc. |
