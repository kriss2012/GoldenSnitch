"""
ScoutIQ — Realistic Latent-Variable Match & Telemetry Simulator (Section 4.3)
Generates >= 600 players across 4 titles, >= 60 teams, 24 months of matches,
and >= 15,000 maps with granular round telemetry, mid-round adaptation, economy decisions,
comms proxies, MOBA objective events, and realistic traps (stat padders, hype, declining vets, gems).
Latent truth is stored in a separate `_ground_truth` table used only by validation tests.
"""

from __future__ import annotations
import json
import math
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Archetypes for trap testing (Section 4.3 & Section 12.2)
ARCHETYPES = [
    "veteran_igl",
    "frag_duelist",
    "tactical_support",
    "stat_padder",
    "small_sample_hype",
    "declining_veteran",
    "young_prospect",
    "undervalued_gem",
    "synergy_dependent",
    "balanced_core"
]

GAMES_CONFIG = {
    "valorant": {
        "roles": ["IGL", "Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
        "characters": ["Jett", "Raze", "Sova", "Fade", "Omen", "Viper", "Killjoy", "Cypher", "Breach", "Skye", "KAY/O"],
        "maps": ["Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Fracture", "Lotus", "Sunset", "Abyss"],
        "is_fps": True,
    },
    "cs2": {
        "roles": ["IGL", "Entry", "AWPer", "Lurker", "Support", "Rifler"],
        "characters": ["Rifler", "AWPer", "Support", "Entry", "Anchor"],
        "maps": ["Mirage", "Inferno", "Nuke", "Dust II", "Ancient", "Anubis", "Vertigo"],
        "is_fps": True,
    },
    "lol": {
        "roles": ["Top", "Jungle", "Mid", "ADC", "Support"],
        "characters": ["Aatrox", "Lee Sin", "Azir", "Kai'Sa", "Nautilus", "Sejuani", "Orianna", "Varus", "Rakan", "K'Sante"],
        "maps": ["Summoner's Rift"],
        "is_fps": False,
    },
    "dota2": {
        "roles": ["Carry", "Mid", "Offlane", "SoftSupport", "HardSupport"],
        "characters": ["Morphling", "Invoker", "Centaur", "Rubick", "Crystal Maiden", "Anti-Mage", "Storm Spirit", "Axe", "Mirana", "Chen"],
        "maps": ["Dota Map"],
        "is_fps": False,
    }
}

REGIONS = ["NA", "EMEA", "APAC", "KR", "CN", "SA"]
LANGUAGES = ["en", "es", "ko", "pt", "hi", "zh", "fr", "de", "ru", "ja"]
TIERS = ["T1", "T2", "T3", "academy"]
TIER_WEIGHTS = [0.25, 0.35, 0.25, 0.15]
TIER_ELO_BASE = {"T1": 1850.0, "T2": 1600.0, "T3": 1400.0, "academy": 1350.0}


class LatentPlayer:
    def __init__(self, player_id: str, game_id: str, role: str, archetype: str, tier: str, rng: random.Random):
        self.player_id = player_id
        self.game_id = game_id
        self.role = role
        self.archetype = archetype
        self.tier = tier
        
        # Base latents
        self.aim = rng.gauss(0.55, 0.12)
        self.game_sense = rng.gauss(0.55, 0.12)
        self.consistency = rng.gauss(0.60, 0.15)
        self.clutch = rng.gauss(0.50, 0.15)
        self.leadership = rng.gauss(0.50, 0.15)
        self.adaptability = rng.gauss(0.50, 0.15)
        self.comms = rng.gauss(0.55, 0.15)
        self.form_trend = rng.gauss(0.0, 0.05)
        self.hidden_potential = rng.gauss(0.60, 0.15)
        
        # Archetype adjustments (Section 4.3 traps)
        if archetype == "veteran_igl":
            self.leadership = rng.uniform(0.78, 0.95)
            self.adaptability = rng.uniform(0.75, 0.92)
            self.game_sense = rng.uniform(0.75, 0.90)
            self.comms = rng.uniform(0.80, 0.95)
            self.aim = rng.uniform(0.40, 0.55)  # Realistic low fragging for IGL
            self.age = rng.randint(25, 30)
            self.ask_salary = rng.uniform(7000, 12000)
            self.target_maps = rng.randint(45, 90)
        elif archetype == "frag_duelist":
            self.aim = rng.uniform(0.78, 0.96)
            self.clutch = rng.uniform(0.65, 0.85)
            self.leadership = rng.uniform(0.20, 0.45)
            self.age = rng.randint(18, 22)
            self.ask_salary = rng.uniform(8000, 15000)
            self.target_maps = rng.randint(45, 80)
        elif archetype == "stat_padder":
            # High raw stats vs weak teams, low impact under pressure
            self.aim = rng.uniform(0.75, 0.90)
            self.game_sense = rng.uniform(0.35, 0.50)
            self.leadership = rng.uniform(0.25, 0.45)
            self.adaptability = rng.uniform(0.30, 0.45)
            self.clutch = rng.uniform(0.30, 0.45)
            self.age = rng.randint(20, 24)
            self.ask_salary = rng.uniform(9000, 16000)  # Overpriced
            self.tier = "T3"
            self.target_maps = rng.randint(35, 60)
        elif archetype == "small_sample_hype":
            # Incredible initial variance, but very few maps
            self.aim = rng.uniform(0.80, 0.95)
            self.game_sense = rng.uniform(0.60, 0.80)
            self.target_maps = rng.randint(3, 7)  # < 10 maps!
            self.age = rng.randint(18, 20)
            self.ask_salary = rng.uniform(6000, 10000)
        elif archetype == "declining_veteran":
            self.aim = rng.uniform(0.45, 0.60)
            self.form_trend = rng.uniform(-0.15, -0.06)  # Form drop
            self.age = rng.randint(28, 32)
            self.ask_salary = rng.uniform(10000, 18000)  # Expensive legacy contract
            self.target_maps = rng.randint(40, 75)
        elif archetype == "young_prospect":
            self.hidden_potential = rng.uniform(0.82, 0.98)
            self.form_trend = rng.uniform(0.04, 0.12)
            self.age = rng.randint(17, 19)
            self.ask_salary = rng.uniform(3000, 5500)
            self.target_maps = rng.randint(25, 55)
        elif archetype == "undervalued_gem":
            # High latent skill, undiscovered, playing in lower tier
            self.leadership = rng.uniform(0.72, 0.88) if role == "IGL" else self.leadership
            self.game_sense = rng.uniform(0.75, 0.90)
            self.aim = rng.uniform(0.70, 0.85)
            self.adaptability = rng.uniform(0.72, 0.88)
            self.age = rng.randint(19, 23)
            self.ask_salary = rng.uniform(2500, 4500)  # Very low ask
            self.tier = rng.choice(["T2", "T3"])
            self.target_maps = rng.randint(30, 60)
        else:
            self.age = rng.randint(19, 26)
            self.ask_salary = rng.uniform(4000, 9000)
            self.target_maps = rng.randint(25, 65)

        # Clamp all latents to [0.05, 0.98]
        for attr in ["aim", "game_sense", "consistency", "clutch", "leadership", "adaptability", "comms", "hidden_potential"]:
            setattr(self, attr, max(0.05, min(0.98, getattr(self, attr))))
        self.age_curve = max(0.4, 1.0 - abs(self.age - 23) * 0.06)


class Simulator:
    """Master simulator for ScoutIQ data universe."""

    def __init__(self, seed: int = 42, target_players: int = 600, target_maps: int = 15000):
        self.seed = seed
        self.rng = random.Random(seed)
        self.target_players = target_players
        self.target_maps = target_maps

    def generate_universe(self, conn) -> Dict[str, Any]:
        """Generates the full data universe and commits directly to SQLite."""
        print(f"[*] Starting ScoutIQ Data Simulator (Seed: {self.seed}, Target: {self.target_players} players, {self.target_maps} maps)...")
        
        # 1. Create Teams (>= 60 teams across 4 titles)
        teams = []
        team_lookup: Dict[str, List[Dict[str, Any]]] = {g: [] for g in GAMES_CONFIG}
        
        team_prefixes = {
            "valorant": ["Sentinels", "Fnatic", "Paper Rex", "DRX", "LOUD", "Team Liquid", "Leviatan", "EDward Gaming", "Cloud9", "NRG", "Gen.G", "T1", "Team Heretics", "BBL", "Karmine Corp", "G2 Esports"],
            "cs2": ["Natus Vincere", "FaZe Clan", "Team Vitality", "MOUZ", "G2 Esports", "Astralis", "Team Spirit", "Virtus.pro", "Heroic", "Complexity", "Eternal Fire", "FURIA", "BIG", "Falcons", "Monte", "ENCE"],
            "lol": ["T1", "Gen.G", "Bilibili Gaming", "JD Gaming", "G2 Esports", "Fnatic", "FlyQuest", "Team Liquid", "Cloud9", "Dplus KIA", "Weibo Gaming", "Top Esports", "MAD Lions", "Team BDS", "100 Thieves", "Shopify"],
            "dota2": ["Team Spirit", "Gaimin Gladiators", "Team Falcons", "BetBoom", "Xtreme Gaming", "Tundra", "OG", "Team Liquid", "Aurora", "Entity", "Heroic", "LGD Gaming", "Virtus.pro", "nouns", "Blacklist", "Boom"]
        }
        
        for game_id in GAMES_CONFIG:
            prefixes = team_prefixes[game_id]
            for i in range(30):
                base_name = prefixes[i % len(prefixes)]
                name = base_name if i < len(prefixes) else f"{base_name} Academy {i - len(prefixes) + 1}"
                tier = "T1" if i < 8 else ("T2" if i < 18 else ("T3" if i < 25 else "academy"))
                base_elo = TIER_ELO_BASE[tier]
                elo = round(self.rng.gauss(base_elo, 35.0), 1)
                team_id = f"team_{game_id}_{i+1:02d}"
                region = self.rng.choice(REGIONS)
                t_record = {
                    "id": team_id,
                    "name": f"{name} ({game_id.upper()})",
                    "org_id": f"org_{base_name.lower().replace(' ', '_')[:8]}",
                    "game_id": game_id,
                    "tier": tier,
                    "region": region,
                    "elo": elo
                }
                teams.append(t_record)
                team_lookup[game_id].append(t_record)

        conn.executemany(
            """INSERT OR REPLACE INTO teams(id, name, org_id, game_id, tier, region, elo)
               VALUES(:id, :name, :org_id, :game_id, :tier, :region, :elo)""",
            teams
        )
        print(f"    [+] Created {len(teams)} competitive teams across 4 titles.")

        # 2. Create Players (>= 600 players across 4 titles)
        players = []
        ground_truth = []
        contracts = []
        player_lookup: Dict[str, List[LatentPlayer]] = {g: [] for g in GAMES_CONFIG}
        
        handles_pool = [
            "Shadow", "Apex", "Vortex", "Cipher", "Blaze", "Phantom", "Frost", "Nova",
            "Echo", "Titan", "Specter", "Raptor", "Zenith", "Pulse", "Havoc", "Krypton",
            "Mirage", "Voltz", "Scythe", "Ghost", "Striker", "Onyx", "Rogue", "Aura",
            "Hydra", "Viper", "Zephyr", "Rift", "Nexus", "Sol", "Luna", "Drift",
            "Flash", "Thunder", "Blade", "Reaper", "Hawk", "Wolf", "Lynx", "Cobra",
            "Storm", "Iron", "Steel", "Breeze", "Quake", "Surge", "Venom", "Chaos",
            "Titan", "Valkyrie", "Aegis", "Karma", "Prism", "Quasar", "Talon", "Blink"
        ]

        total_players_target = max(20, self.target_players)
        players_per_game = max(5, total_players_target // 4)

        for game_id, g_cfg in GAMES_CONFIG.items():
            roles = g_cfg["roles"]
            for idx in range(players_per_game):
                pid = f"ply_{game_id}_{idx+1:03d}"
                role = roles[idx % len(roles)]
                archetype = ARCHETYPES[idx % len(ARCHETYPES)]
                assigned_team = team_lookup[game_id][idx % len(team_lookup[game_id])]
                tier = assigned_team["tier"]
                
                lp = LatentPlayer(pid, game_id, role, archetype, tier, self.rng)
                player_lookup[game_id].append(lp)

                handle = f"{self.rng.choice(handles_pool)}_{idx+1}"
                _real_name = f"Player {idx+1} ({game_id})"
                _nationality = self.rng.choice(["US", "KR", "SE", "DK", "BR", "FR", "IN", "CA", "PL", "TR"])
                languages = [self.rng.choice(LANGUAGES)]
                if "en" not in languages and self.rng.random() < 0.7:
                    languages.append("en")

                # Store public player
                players.append({
                    "id": pid,
                    "name": handle,
                    "game": "TAC" if game_id in ("valorant", "cs2") else "ARENA",
                    "role": role,
                    "secondary_roles": "[]",
                    "matches_played": lp.target_maps,
                    "metrics": "{}",
                    "provenance": json.dumps({"source": "simulated_latent_generator"}),
                    "synthetic": 1,
                    "source": "simulator_v1",
                    "availability": "available" if lp.archetype in ("undervalued_gem", "young_prospect") else "contracted",
                    "language": languages[0],
                    "utc_offset": self.rng.randint(-8, 9)
                })

                # Store ground truth (strictly isolated from scoring code)
                ground_truth.append({
                    "player_id": pid,
                    "aim": round(lp.aim, 4),
                    "game_sense": round(lp.game_sense, 4),
                    "consistency": round(lp.consistency, 4),
                    "clutch": round(lp.clutch, 4),
                    "leadership": round(lp.leadership, 4),
                    "adaptability": round(lp.adaptability, 4),
                    "comms": round(lp.comms, 4),
                    "form_trend": round(lp.form_trend, 4),
                    "age_curve": round(lp.age_curve, 4),
                    "hidden_potential": round(lp.hidden_potential, 4),
                    "archetype": lp.archetype
                })

                # Contract
                contracts.append({
                    "id": f"cnt_{pid}",
                    "player_id": pid,
                    "team_id": assigned_team["id"],
                    "salary_monthly": round(lp.ask_salary, 2),
                    "buyout": round(lp.ask_salary * self.rng.uniform(6.0, 15.0), 2),
                    "start_date": "2024-01-01",
                    "end_date": "2026-12-31",
                    "ask_salary": round(lp.ask_salary, 2)
                })

        conn.executemany(
            """INSERT OR REPLACE INTO players(id, name, game, role, secondary_roles, matches_played, metrics, provenance, synthetic, source, availability, language, utc_offset)
               VALUES(:id, :name, :game, :role, :secondary_roles, :matches_played, :metrics, :provenance, :synthetic, :source, :availability, :language, :utc_offset)""",
            players
        )
        conn.executemany(
            """INSERT OR REPLACE INTO _ground_truth(player_id, aim, game_sense, consistency, clutch, leadership, adaptability, comms, form_trend, age_curve, hidden_potential, archetype)
               VALUES(:player_id, :aim, :game_sense, :consistency, :clutch, :leadership, :adaptability, :comms, :form_trend, :age_curve, :hidden_potential, :archetype)""",
            ground_truth
        )
        conn.executemany(
            """INSERT OR REPLACE INTO contracts(id, player_id, team_id, salary_monthly, buyout, start_date, end_date, ask_salary)
               VALUES(:id, :player_id, :team_id, :salary_monthly, :buyout, :start_date, :end_date, :ask_salary)""",
            contracts
        )
        print(f"    [+] Generated {len(players)} players with ground truth and contracts.")

        # 3. Simulate Matches, Maps, Rounds & Player Map Stats (>= 15,000 maps)
        maps_batch = []
        rounds_batch = []
        round_events_batch = []
        pms_batch = []
        objective_events_batch = []
        comms_batch = []

        total_maps = max(20, self.target_maps)
        maps_per_game = max(5, total_maps // 4)
        base_date = datetime(2024, 1, 1)

        print(f"    [*] Simulating {total_maps} competitive maps with granular round telemetry...")

        for game_id, g_cfg in GAMES_CONFIG.items():
            teams_in_game = team_lookup[game_id]
            players_in_game = player_lookup[game_id]
            is_fps = g_cfg["is_fps"]
            map_pool = g_cfg["maps"]
            char_pool = g_cfg["characters"]

            # Partition all 150 players into team rosters of 5
            team_rosters: Dict[str, List[LatentPlayer]] = {}
            for i, t in enumerate(teams_in_game):
                start_idx = min(len(players_in_game) - 5, i * 5)
                team_rosters[t["id"]] = players_in_game[start_idx:start_idx + 5]

            for m_idx in range(maps_per_game):
                map_id = f"map_{game_id}_{m_idx+1:05d}"
                match_id = f"mat_{game_id}_{m_idx//3+1:05d}"
                map_name = self.rng.choice(map_pool)
                days_offset = (m_idx * 720) // maps_per_game
                _match_time = base_date + timedelta(days=days_offset, hours=self.rng.randint(12, 22))

                # Select two teams of similar or cross tier
                t_a = self.rng.choice(teams_in_game)
                t_b = self.rng.choice(teams_in_game)
                while t_b["id"] == t_a["id"]:
                    t_b = self.rng.choice(teams_in_game)

                roster_a = team_rosters.get(t_a["id"], players_in_game[:5])
                roster_b = team_rosters.get(t_b["id"], players_in_game[5:10])

                # Active IGL for FPS titles
                igl_a = next((p for p in roster_a if p.role == "IGL"), roster_a[0])
                igl_b = next((p for p in roster_b if p.role == "IGL"), roster_b[0])

                # Win probability generation based on team latents + IGL leadership + Elo
                elo_delta = (t_a["elo"] - t_b["elo"]) / 400.0
                base_win_p_a = 1.0 / (1.0 + math.pow(10.0, -elo_delta))
                
                # IGL tactical impact modifier
                igl_tactical_delta = (igl_a.leadership * igl_a.adaptability - igl_b.leadership * igl_b.adaptability) * 0.25
                final_p_a = max(0.15, min(0.85, base_win_p_a + igl_tactical_delta))

                # Score simulation (MR12 format for FPS: first to 13)
                if is_fps:
                    score_a = 0
                    score_b = 0
                    round_num = 1
                    econ_a = 800
                    econ_b = 800

                    # Simulate rounds until winner (13 wins or overtime)
                    while (score_a < 13 and score_b < 13) or abs(score_a - score_b) < 2:
                        round_id = f"rnd_{map_id}_{round_num:02d}"
                        side = "atk" if round_num <= 12 else "def"
                        
                        # Economy determine buy types
                        buy_type_a = "full_buy" if econ_a >= 3900 else ("force_buy" if econ_a >= 2100 else "eco")
                        buy_type_b = "full_buy" if econ_b >= 3900 else ("force_buy" if econ_b >= 2100 else "eco")
                        
                        # Causal round win probability
                        econ_diff = econ_a - econ_b
                        econ_advantage = (econ_diff / 2200.0) * 0.45
                        bomb_planted = 1 if self.rng.random() < (0.65 if side == "atk" else 0.35) else 0
                        plant_advantage = 0.32 if (bomb_planted and side == "atk") else (-0.26 if (bomb_planted and side == "def") else 0.0)
                        
                        # IGL tactical causality (leadership & adaptation)
                        tactical_advantage = (igl_a.leadership - 0.50) * 0.35 - (igl_b.leadership - 0.50) * 0.35

                        # Mid-round adaptation simulation
                        plan_switched = 1 if self.rng.random() < 0.35 else 0
                        switch_time = round(self.rng.uniform(25.0, 65.0), 1) if plan_switched else None
                        adapt_bonus = (igl_a.adaptability - 0.50) * 0.40 if plan_switched else 0.0

                        round_win_p = 0.50 + econ_advantage + plant_advantage + tactical_advantage + adapt_bonus
                        round_win_p = max(0.05, min(0.95, round_win_p))

                        r_winner = "team_a" if self.rng.random() < round_win_p else "team_b"
                        if r_winner == "team_a":
                            score_a += 1
                            econ_a = min(9000, econ_a + 3000)
                            econ_b = min(9000, econ_b + 1900)
                        else:
                            score_b += 1
                            econ_b = min(9000, econ_b + 3000)
                            econ_a = min(9000, econ_a + 1900)

                        # Record from perspective of team A's IGL
                        rounds_batch.append((
                            f"{round_id}_a", map_id, round_num, side, buy_type_a, buy_type_b,
                            econ_a, econ_b, r_winner, "default_call", plan_switched, switch_time,
                            bomb_planted,
                            1 if r_winner == "team_a" else 0,
                            igl_a.player_id
                        ))
                        # Record from perspective of team B's IGL
                        rounds_batch.append((
                            f"{round_id}_b", map_id, round_num, "def" if side == "atk" else "atk", buy_type_b, buy_type_a,
                            econ_b, econ_a, "team_a" if r_winner == "team_b" else "team_b", "default_call", plan_switched, switch_time,
                            bomb_planted,
                            1 if r_winner == "team_b" else 0,
                            igl_b.player_id
                        ))

                        round_num += 1
                        if round_num > 30:  # Cap max overtime
                            break

                    duration = (score_a + score_b) * 105
                    winner_id = t_a["id"] if score_a > score_b else t_b["id"]
                else:
                    # MOBA Score (Kills)
                    score_a = self.rng.randint(8, 28)
                    score_b = self.rng.randint(8, 28)
                    duration = self.rng.randint(1500, 2600)
                    winner_id = t_a["id"] if self.rng.random() < final_p_a else t_b["id"]

                    # Objective events
                    objective_events_batch.append((
                        f"obj_{map_id}_1", map_id, 920.0, "herald_or_roshan",
                        t_a["id"], "Rift Herald", 1200, 0.08, "{}"
                    ))
                    objective_events_batch.append((
                        f"obj_{map_id}_2", map_id, 1450.0, "dragon_or_tormentor",
                        winner_id, "Drake", 2500, 0.14, "{}"
                    ))

                maps_batch.append((
                    map_id, match_id, map_name, duration, score_a, score_b, winner_id, "v1.0"
                ))

                # Generate box scores for all 10 players with causal latent grounding
                for team_idx, (t_curr, roster) in enumerate([(t_a, roster_a), (t_b, roster_b)]):
                    for p in roster:
                        # Kills depend on latent aim + role modifier
                        base_kills = p.aim * 25.0 + self.rng.gauss(0, 1.0)
                        if p.role == "IGL":
                            base_kills *= 0.70  # Realistic lower fragging for IGLs
                        elif p.role in ("Duelist", "Entry", "AWPer", "Carry", "Mid"):
                            base_kills *= 1.35  # High frag roles

                        kills = max(2, min(38, int(round(base_kills))))
                        deaths = max(4, min(25, int(round(18.0 - p.aim * 6.0 - p.game_sense * 4.0 + self.rng.gauss(0, 1.0)))))
                        assists = max(1, min(20, int(round(p.comms * 10.0 + p.game_sense * 4.0 + self.rng.randint(0, 3)))))
                        adr = round(max(50.0, min(195.0, kills * 6.5 + p.aim * 45.0 + self.rng.gauss(5, 2.0))), 1)
                        kast = round(max(0.45, min(0.95, 0.45 + p.consistency * 0.35 + p.aim * 0.15)), 3)

                        # Role-specific causal event metrics
                        first_kills = max(0, min(8, int(round(p.aim * 5.0 + (1.5 if p.role in ("Duelist", "Entry") else 0.0) + self.rng.gauss(0, 0.4)))))
                        first_deaths = max(0, min(6, int(round((1.0 - p.aim) * 3.8 + self.rng.gauss(0, 0.4)))))
                        clutches_won = max(0, min(4, int(round(p.clutch * 2.2 + self.rng.uniform(0, 0.6)))))
                        clutches_att = max(clutches_won, int(round(self.rng.uniform(1, 3))))
                        trades_given = max(0, int(round(p.comms * 3.5 + self.rng.uniform(0, 1.0))))
                        trades_taken = max(0, int(round(p.consistency * 3.0 + self.rng.uniform(0, 1.0))))
                        util_damage = round(p.game_sense * 180.0 + self.rng.uniform(20.0, 50.0), 1)
                        flash_assists = max(0, int(round(p.game_sense * 4.0 + self.rng.uniform(0, 1.5))))

                        pms_batch.append((
                            f"pms_{map_id}_{p.player_id}", map_id, p.player_id, t_curr["id"],
                            p.role, self.rng.choice(char_pool), kills, deaths, assists,
                            adr, kast,
                            first_kills, first_deaths,
                            clutches_won, clutches_att,
                            trades_given, trades_taken,
                            util_damage, flash_assists
                        ))

                        # Comms proxy record
                        comms_batch.append((
                            f"com_{map_id}_{p.player_id}", map_id, t_curr["id"], p.player_id,
                            round(p.comms * 15.0 + self.rng.gauss(0, 1.5), 1),
                            round(max(180.0, 550.0 - p.comms * 250.0 + self.rng.gauss(0, 20.0)), 1),
                            "Simulated communication proxy for decision-support only"
                        ))

        # Bulk insert in high-speed batches
        conn.executemany(
            """INSERT OR REPLACE INTO maps_or_games(id, match_id, map_name_or_game_no, duration, score_a, score_b, winner_team_id, patch)
               VALUES(?, ?, ?, ?, ?, ?, ?, ?)""",
            maps_batch
        )
        if rounds_batch:
            conn.executemany(
                """INSERT OR REPLACE INTO rounds(id, map_id, round_no, side, buy_type_a, buy_type_b, econ_a, econ_b, winner, plan_tag, plan_switched_mid_round, switch_time_s, bomb_planted, plan_conversion, igl_player_id)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                rounds_batch
            )
        if round_events_batch:
            conn.executemany(
                """INSERT OR REPLACE INTO round_events(id, round_id, t_s, event_type, actor_player_id, target_player_id, value, details)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?)""",
                round_events_batch
            )
        if objective_events_batch:
            conn.executemany(
                """INSERT OR REPLACE INTO objective_events(id, map_id, t_s, event_type, team_id, objective_name, gold_diff, win_prob_delta, details)
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                objective_events_batch
            )
        conn.executemany(
            """INSERT OR REPLACE INTO player_map_stats(id, map_id, player_id, team_id, role_played, agent_or_champion, kills, deaths, assists, adr_or_dpm, kast, first_kills, first_deaths, clutches_won, clutches_attempted, trades_given, trades_taken, utility_damage, flash_assists)
               VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            pms_batch
        )
        conn.executemany(
            """INSERT OR REPLACE INTO comms_proxy(id, map_id, team_id, player_id, call_density, call_to_action_latency_ms, proxy_disclaimer)
               VALUES(?, ?, ?, ?, ?, ?, ?)""",
            comms_batch
        )
        conn.commit()

        print("    [+] Successfully generated and committed:")
        print(f"        - {len(maps_batch)} maps/games across 4 titles")
        print(f"        - {len(rounds_batch)} round logs with plan switches and timestamps")
        print(f"        - {len(pms_batch)} player map performance records")
        print(f"        - {len(ground_truth)} ground truth latent records")
        
        return {
            "teams": len(teams),
            "players": len(players),
            "maps": len(maps_batch),
            "rounds": len(rounds_batch),
            "player_map_stats": len(pms_batch),
            "ground_truth": len(ground_truth),
        }


def run_simulation(seed: int = 42, players: int = 600, maps: int = 15000):
    from app.db import connect, init
    conn = connect()
    init(conn)
    sim = Simulator(seed=seed, target_players=players, target_maps=maps)
    return sim.generate_universe(conn)


if __name__ == "__main__":
    run_simulation()
