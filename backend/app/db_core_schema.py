"""
ScoutIQ — Core Database Schema DDL (Section 4.2)
Defines round-level, player-map stats, events, comms proxies, objective events,
contracts, rosters, snapshots, scores, pipeline stages, and latent ground truth tables.
"""

CORE_SCHEMA_DDL = """
-- Teams across games and tiers
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  org_id TEXT,
  game_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('T1', 'T2', 'T3', 'academy')),
  region TEXT NOT NULL,
  elo REAL NOT NULL DEFAULT 1500.0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_teams_game_tier ON teams(game_id, tier);

-- Multi-Roster Slots
CREATE TABLE IF NOT EXISTS roster_slots (
  id TEXT PRIMARY KEY,
  roster_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  role TEXT NOT NULL,
  is_starter INTEGER NOT NULL DEFAULT 1,
  join_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leave_date TEXT
);
CREATE INDEX IF NOT EXISTS idx_roster_slots_roster ON roster_slots(roster_id);
CREATE INDEX IF NOT EXISTS idx_roster_slots_player ON roster_slots(player_id);

-- Player Contracts and Market Value
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  team_id TEXT,
  salary_monthly REAL NOT NULL DEFAULT 0.0,
  buyout REAL NOT NULL DEFAULT 0.0,
  start_date TEXT,
  end_date TEXT,
  ask_salary REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contracts_player ON contracts(player_id);

-- Maps or Games within a Match
CREATE TABLE IF NOT EXISTS maps_or_games (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  map_name_or_game_no TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  score_a INTEGER NOT NULL DEFAULT 0,
  score_b INTEGER NOT NULL DEFAULT 0,
  winner_team_id TEXT,
  patch TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maps_match ON maps_or_games(match_id);

-- Round-level telemetry for FPS titles (Valorant / CS2)
CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL REFERENCES maps_or_games(id) ON DELETE CASCADE,
  round_no INTEGER NOT NULL,
  side TEXT NOT NULL CHECK(side IN ('atk', 'def', 'ct', 't')),
  buy_type_a TEXT NOT NULL,
  buy_type_b TEXT NOT NULL,
  econ_a INTEGER NOT NULL DEFAULT 0,
  econ_b INTEGER NOT NULL DEFAULT 0,
  winner TEXT NOT NULL,
  plan_tag TEXT NOT NULL DEFAULT 'default',
  plan_switched_mid_round INTEGER NOT NULL DEFAULT 0,
  switch_time_s REAL DEFAULT NULL,
  bomb_planted INTEGER NOT NULL DEFAULT 0,
  plan_conversion INTEGER NOT NULL DEFAULT 0,
  igl_player_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_rounds_map ON rounds(map_id);
CREATE INDEX IF NOT EXISTS idx_rounds_igl ON rounds(igl_player_id);

-- Round events (kills, utility, plants, shotcalls)
CREATE TABLE IF NOT EXISTS round_events (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  t_s REAL NOT NULL,
  event_type TEXT NOT NULL,
  actor_player_id TEXT,
  target_player_id TEXT,
  value REAL DEFAULT 0.0,
  details TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_round_events_round ON round_events(round_id);
CREATE INDEX IF NOT EXISTS idx_round_events_actor ON round_events(actor_player_id);

-- Aggregated per-map stats per player
CREATE TABLE IF NOT EXISTS player_map_stats (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL REFERENCES maps_or_games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  role_played TEXT NOT NULL,
  agent_or_champion TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  adr_or_dpm REAL NOT NULL DEFAULT 0.0,
  kast REAL NOT NULL DEFAULT 0.0,
  first_kills INTEGER NOT NULL DEFAULT 0,
  first_deaths INTEGER NOT NULL DEFAULT 0,
  clutches_won INTEGER NOT NULL DEFAULT 0,
  clutches_attempted INTEGER NOT NULL DEFAULT 0,
  trades_given INTEGER NOT NULL DEFAULT 0,
  trades_taken INTEGER NOT NULL DEFAULT 0,
  utility_damage REAL NOT NULL DEFAULT 0.0,
  flash_assists INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_pms_player ON player_map_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_pms_map ON player_map_stats(map_id);

-- Objective events for MOBA titles (LoL / Dota 2)
CREATE TABLE IF NOT EXISTS objective_events (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL REFERENCES maps_or_games(id) ON DELETE CASCADE,
  t_s REAL NOT NULL,
  event_type TEXT NOT NULL,
  team_id TEXT NOT NULL,
  objective_name TEXT NOT NULL,
  gold_diff INTEGER NOT NULL DEFAULT 0,
  win_prob_delta REAL NOT NULL DEFAULT 0.0,
  details TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_obj_events_map ON objective_events(map_id);

-- Communication proxy metrics (Simulated proxy — clearly labeled)
CREATE TABLE IF NOT EXISTS comms_proxy (
  id TEXT PRIMARY KEY,
  map_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  player_id TEXT NOT NULL,
  call_density REAL NOT NULL DEFAULT 0.0,
  call_to_action_latency_ms REAL NOT NULL DEFAULT 0.0,
  proxy_disclaimer TEXT NOT NULL DEFAULT 'Simulated communication proxy for decision-support only'
);
CREATE INDEX IF NOT EXISTS idx_comms_player ON comms_proxy(player_id);

-- Metric snapshots with Bayesian shrinkage values
CREATE TABLE IF NOT EXISTS player_metric_snapshots (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  as_of_date TEXT NOT NULL,
  metric TEXT NOT NULL,
  raw_value REAL NOT NULL,
  percentile REAL NOT NULL,
  shrunk_value REAL NOT NULL,
  n_samples INTEGER NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  UNIQUE(player_id, as_of_date, metric)
);
CREATE INDEX IF NOT EXISTS idx_snapshots_player ON player_metric_snapshots(player_id);

-- Evaluated role scores with confidence and risk flags
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  role TEXT NOT NULL,
  game_id TEXT NOT NULL,
  as_of_date TEXT NOT NULL,
  role_fit REAL NOT NULL,
  final_score REAL NOT NULL,
  final_lb REAL NOT NULL,
  confidence REAL NOT NULL,
  risk_flags TEXT NOT NULL DEFAULT '[]',
  sub_scores_json TEXT NOT NULL DEFAULT '{}',
  version TEXT NOT NULL DEFAULT '1.0.0',
  UNIQUE(player_id, role, game_id, as_of_date)
);
CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_game_role ON scores(game_id, role);

-- Scouting pipeline kanban stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  player_id TEXT PRIMARY KEY,
  stage TEXT NOT NULL CHECK(stage IN ('watchlist', 'contacted', 'trial', 'offer', 'signed', 'rejected')),
  notes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Comprehensive system audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  user_id TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Latent ground truth table (USED ONLY BY VALIDATION TESTS)
CREATE TABLE IF NOT EXISTS _ground_truth (
  player_id TEXT PRIMARY KEY,
  aim REAL NOT NULL,
  game_sense REAL NOT NULL,
  consistency REAL NOT NULL,
  clutch REAL NOT NULL,
  leadership REAL NOT NULL,
  adaptability REAL NOT NULL,
  comms REAL NOT NULL,
  form_trend REAL NOT NULL,
  age_curve REAL NOT NULL,
  hidden_potential REAL NOT NULL,
  archetype TEXT NOT NULL
);
"""


def init_core_schema(conn):
    """Executes the core schema DDL."""
    conn.executescript(CORE_SCHEMA_DDL)
