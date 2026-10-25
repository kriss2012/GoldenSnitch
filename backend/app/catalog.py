"""Metric catalog, game configurations, and role profiles (SCORE-001, DATA-001).
All bounds and weights are configured hypotheses for Golden Snitch.
"""

# Supported Games and Squad Templates (5 slots per roster)
GAMES = {
    "TAC": {
        "code": "TAC",
        "name": "Tactical Shooter (synthetic)",
        "squad": {"IGL": 1, "ENTRY": 2, "SUPPORT": 2},
        "roles": ["IGL", "ENTRY", "SUPPORT"],
    },
    "ARENA": {
        "code": "ARENA",
        "name": "Arena MOBA (synthetic)",
        "squad": {"SHOTCALLER": 1, "CARRY": 2, "SUPPORT": 2},
        "roles": ["SHOTCALLER", "CARRY", "SUPPORT"],
    },
    "valorant": {
        "code": "valorant",
        "name": "Valorant",
        "squad": {"IGL": 1, "Duelist": 1, "Initiator": 1, "Controller": 1, "Sentinel": 1},
        "roles": ["IGL", "Duelist", "Initiator", "Controller", "Sentinel"],
    },
    "cs2": {
        "code": "cs2",
        "name": "Counter-Strike 2",
        "squad": {"Entry Fragger": 1, "AWPer": 1, "Support": 2, "Lurker": 1},
        "roles": ["Entry Fragger", "AWPer", "Support", "Lurker"],
    },
    "lol": {
        "code": "lol",
        "name": "League of Legends",
        "squad": {"Top": 1, "Jungle": 1, "Mid": 1, "ADC": 1, "Support": 1},
        "roles": ["Top", "Jungle", "Mid", "ADC", "Support"],
    },
    "dota2": {
        "code": "dota2",
        "name": "Dota 2",
        "squad": {"Carry": 1, "Mid": 1, "Offlane": 1, "SoftSupport": 1, "HardSupport": 1},
        "roles": ["Carry", "Mid", "Offlane", "SoftSupport", "HardSupport", "Support4", "HardSupport5"],
    },
}

# Role Metric Profiles for Golden Snitch (Valorant & CS2):
# Each metric has: (group, direction, lower_bound, upper_bound, weight, is_anchor)
# direction: +1 higher is better, -1 lower is better
ROLE_PROFILES = {
    ("valorant", "Controller"): {
        "acs": ("Firepower", 1, 150.0, 300.0, 0.30, True),
        "round_win_rate": ("Objective", 1, 40.0, 65.0, 0.30, False),
        "assists_per_round": ("Utility", 1, 0.20, 0.60, 0.20, False),
        "first_death_rate": ("Survivability", -1, 0.05, 0.20, 0.20, False),
    },
    ("valorant", "Duelist"): {
        "first_kill_rate": ("Firepower", 1, 0.10, 0.25, 0.35, True),
        "damage_per_round": ("Firepower", 1, 130.0, 180.0, 0.25, False),
        "kast_pct": ("Survivability", 1, 60.0, 80.0, 0.20, False),
        "round_win_rate": ("Objective", 1, 45.0, 65.0, 0.20, False),
    },
    ("valorant", "Initiator"): {
        "assists_per_round": ("Utility", 1, 0.25, 0.65, 0.30, True),
        "flash_assists_per_round": ("Utility", 1, 0.10, 0.35, 0.25, False),
        "acs": ("Firepower", 1, 150.0, 250.0, 0.25, False),
        "kast_pct": ("Survivability", 1, 65.0, 85.0, 0.20, False),
    },
    ("valorant", "Sentinel"): {
        "kast_pct": ("Survivability", 1, 65.0, 85.0, 0.30, True),
        "site_hold_success": ("Objective", 1, 50.0, 80.0, 0.25, False),
        "clutch_win_rate": ("Utility", 1, 15.0, 40.0, 0.25, False),
        "first_death_rate": ("Survivability", -1, 0.05, 0.18, 0.20, False),
    },
    ("valorant", "IGL"): {
        "round_win_rate": ("Objective", 1, 40.0, 65.0, 0.35, True),
        "assists_per_round": ("Utility", 1, 0.20, 0.60, 0.25, False),
        "acs": ("Firepower", 1, 140.0, 260.0, 0.20, False),
        "kast_pct": ("Survivability", 1, 60.0, 85.0, 0.20, False),
    },
    ("cs2", "Entry Fragger"): {
        "opening_duel_success": ("Firepower", 1, 35.0, 65.0, 0.30, True),
        "damage_per_round": ("Firepower", 1, 60.0, 95.0, 0.25, False),
        "kast_pct": ("Survivability", 1, 60.0, 80.0, 0.20, False),
        "opening_deaths_per_round": ("Survivability", -1, 0.08, 0.20, 0.15, False),
        "flash_assists_per_round": ("Utility", 1, 0.05, 0.25, 0.10, False),
    },
    ("cs2", "AWPer"): {
        "awp_kills_per_round": ("Firepower", 1, 0.30, 0.90, 0.35, True),
        "opening_duel_success": ("Firepower", 1, 45.0, 75.0, 0.25, False),
        "damage_per_round": ("Firepower", 1, 65.0, 100.0, 0.20, False),
        "round_win_rate": ("Objective", 1, 45.0, 65.0, 0.20, False),
    },
    ("cs2", "Support"): {
        "flash_assists_per_round": ("Utility", 1, 0.08, 0.30, 0.35, True),
        "trade_kill_rate": ("Utility", 1, 15.0, 35.0, 0.25, False),
        "kast_pct": ("Survivability", 1, 65.0, 85.0, 0.25, False),
        "utility_damage_per_round": ("Objective", 1, 10.0, 35.0, 0.15, False),
    },
    ("cs2", "Lurker"): {
        "clutch_win_rate": ("Firepower", 1, 15.0, 45.0, 0.30, True),
        "damage_per_round": ("Firepower", 1, 65.0, 95.0, 0.25, False),
        "survival_rate": ("Survivability", 1, 30.0, 55.0, 0.25, False),
        "round_win_rate": ("Objective", 1, 45.0, 65.0, 0.20, False),
    },
}

# Compatibility mappings for TAC and ARENA
DIMENSIONS = {
    "TAC": {
        "decision": [("decision_quality_score", 1)],
        "leadership": [("leadership_score", 1), ("communication_score", 1)],
        "clutch": [("clutch_success_rate", 1)],
        "objective": [("objective_success_rate", 1)],
        "teamplay": [("trade_success_rate", 1)],
        "consistency": [("rating_stdev", -1)],
        "combat": [("kill_death_ratio", 1), ("damage_per_round", 1)],
    },
    "ARENA": {
        "decision": [("decision_quality_score", 1)],
        "leadership": [("leadership_score", 1), ("communication_score", 1)],
        "clutch": [("comeback_rate", 1)],
        "objective": [("objective_control_rate", 1)],
        "teamplay": [("teamfight_success_rate", 1)],
        "consistency": [("rating_stdev", -1)],
        "combat": [("kda", 1), ("damage_share", 1), ("deaths_per_game", -1)],
    },
}

_IGL = {"decision": 0.25, "leadership": 0.20, "clutch": 0.15, "objective": 0.15, "teamplay": 0.10, "consistency": 0.10, "combat": 0.05}
_FRAG = {"combat": 0.35, "clutch": 0.15, "teamplay": 0.15, "consistency": 0.15, "objective": 0.10, "decision": 0.05, "leadership": 0.05}
_SUP = {"teamplay": 0.30, "objective": 0.20, "decision": 0.15, "leadership": 0.10, "consistency": 0.10, "clutch": 0.10, "combat": 0.05}

# Maintain exact keys for TEST-002
ROLE_WEIGHTS = {
    ("TAC", "IGL"): _IGL, ("TAC", "ENTRY"): _FRAG, ("TAC", "SUPPORT"): _SUP,
    ("ARENA", "SHOTCALLER"): _IGL, ("ARENA", "CARRY"): _FRAG, ("ARENA", "SUPPORT"): _SUP,
}

# Valid numeric bounds for import validation
METRIC_RANGES = {
    "decision_quality_score": (0, 100), "leadership_score": (0, 100), "communication_score": (0, 100),
    "clutch_success_rate": (0, 100), "objective_success_rate": (0, 100), "trade_success_rate": (0, 100),
    "kill_death_ratio": (0, 5), "damage_per_round": (0, 250),
    "comeback_rate": (0, 100), "objective_control_rate": (0, 100), "teamfight_success_rate": (0, 100),
    "kda": (0, 30), "damage_share": (0, 100), "deaths_per_game": (0, 30),
    "acs": (0, 500), "round_win_rate": (0, 100), "assists_per_round": (0, 3),
    "first_death_rate": (0, 1), "first_kill_rate": (0, 1), "kast_pct": (0, 100),
    "site_hold_success": (0, 100), "clutch_win_rate": (0, 100), "flash_assists_per_round": (0, 3),
    "opening_duel_success": (0, 100), "opening_deaths_per_round": (0, 1),
    "awp_kills_per_round": (0, 3), "trade_kill_rate": (0, 100), "utility_damage_per_round": (0, 100),
    "survival_rate": (0, 100), "igl_rating": (1, 5),
}

# Metrics applicable per game
GAME_METRICS = {
    "valorant": sorted({m for (g, r), prof in ROLE_PROFILES.items() if g == "valorant" for m in prof}),
    "cs2": sorted({m for (g, r), prof in ROLE_PROFILES.items() if g == "cs2" for m in prof}),
    "TAC": sorted({m for d in DIMENSIONS["TAC"].values() for m, _ in d if m in METRIC_RANGES}),
    "ARENA": sorted({m for d in DIMENSIONS["ARENA"].values() for m, _ in d if m in METRIC_RANGES}),
}

PROVENANCE_RELIABILITY = {
    "derived": 1.0,
    "annotated": 0.9,
    "simulated": 0.6,
    "csv": 0.9,
    "verified_feed": 1.0,
    "vct_lan_masters_empirical": 1.0,
    "empirical": 1.0,
    "riot_api": 0.95,
    "steam_api": 0.95,
    "henrikdev_api": 0.95,
    "official": 1.0,
}
ANNOTATION_METRICS = {"decision_quality_score", "leadership_score", "communication_score", "igl_rating"}

MIN_POOL = 8
MIN_COVERAGE = 0.60
SAMPLE_FULL = 30
SAMPLE_MIN_ROUNDS = 100
MIN_HISTORY = 5

def normalize_game_name(g: str) -> str:
    g_up = (g or "").strip().lower()
    if g_up in ("valorant", "val"): return "valorant"
    if g_up in ("cs2", "cs", "counter-strike 2", "counterstrike"): return "cs2"
    if (g or "").strip().upper() in ("TAC", "ARENA"): return (g or "").strip().upper()
    return g

def validate_weights(w: dict, dims) -> dict:
    if not w:
        raise ValueError("weights are empty")
    unknown = set(w) - set(dims)
    if unknown:
        raise ValueError(f"unknown dimensions: {sorted(unknown)}")
    if any(v < 0 for v in w.values()):
        raise ValueError("weights must be non-negative")
    if abs(sum(w.values()) - 1.0) > 1e-4:
        raise ValueError(f"weights must sum to 1.0 (got {sum(w.values()):.4f})")
    return w
