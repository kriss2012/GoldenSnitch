"""Reproducible synthetic data generator (seed 1337).
Seeds users, TAC / ARENA rosters (rosters 1-3 for regression compatibility),
and Valorant & CS2 rosters and the PRD §10.3 worked example (Kairo / Mirage / Voltz).
ALL records are labeled synthetic.
"""
import json, random
from . import db
from .auth import DEFAULT_USERS
from .catalog import ANNOTATION_METRICS

def seed(conn, reset=True):
    db.init(conn)
    if reset:
        for t in ("recommendations", "vacancies", "roster_members", "rosters", "annotations", "match_history", "players", "data_sources", "users"):
            try:
                conn.execute(f"DELETE FROM {t}")
            except Exception:
                pass
        try:
            conn.execute("DELETE FROM sqlite_sequence")
        except Exception:
            pass

    # 1. Seed Users (Maya, Dev, Arjun)
    for u in DEFAULT_USERS.values():
        conn.execute(
            "INSERT OR REPLACE INTO users(id, username, name, role, organization, salt, password_hash) VALUES(?,?,?,?,?,?,?)",
            (u["id"], u["username"], u["name"], u["role"], u["organization"], u["salt"], u["hash"])
        )

    # 2. Backward Compatibility: Seed TAC and ARENA players & rosters FIRST (Rosters 1, 2, 3)
    PRE = ["Vex","Kai","Mira","Zed","Nyx","Orin","Talia","Brax","Juno","Rook","Sable","Dax","Lyra","Fenn","Cyra","Holt","Ivo","Pax","Quin","Rhea","Sol","Tarn","Ulla","Veda","Wren","Yara","Zane","Ashe","Bryn","Cole"]
    SUF = ["Strike","Solace","Vale","Halo","Drift","Quill","Ember","Flux","Hex","Lark","Onyx","Pike","Rift","Shade","Tide","Volt"]
    ARCH = {"lead": (68, 70, 50, 62, 55, 55, 40), "frag": (45, 42, 55, 45, 50, 50, 70), "sup": (55, 55, 48, 60, 68, 58, 42)}
    ROLES_LEGACY = {
        "TAC": [("IGL", "lead", 14), ("ENTRY", "frag", 24), ("SUPPORT", "sup", 22)],
        "ARENA": [("SHOTCALLER", "lead", 14), ("CARRY", "frag", 24), ("SUPPORT", "sup", 22)]
    }
    LEAD_ROLE = {"TAC": "IGL", "ARENA": "SHOTCALLER"}
    clip = lambda x, lo=1, hi=99: max(lo, min(hi, x))

    rng = random.Random(1337)
    names = set()
    by_role = {}

    def metrics_for_legacy(game, L):
        n = lambda s=3: rng.gauss(0, s)
        dec, lead, clu, obj, team, cons, comb = L
        m = {"decision_quality_score": clip(dec + n()), "leadership_score": clip(lead + n(4)), "communication_score": clip(lead + n(8))}
        if game == "TAC":
            m |= {"clutch_success_rate": 8 + clu * .5 + n(2), "objective_success_rate": 20 + obj * .7 + n(3), "trade_success_rate": 20 + team * .7 + n(3),
                  "kill_death_ratio": 0.6 + comb / 100 * 1.15 + n(.05), "damage_per_round": 55 + comb * .5 + n(3)}
        else:
            m |= {"comeback_rate": 8 + clu * .5 + n(2), "objective_control_rate": 20 + obj * .7 + n(3), "teamfight_success_rate": 20 + team * .7 + n(3),
                  "kda": 1 + comb * .07 + n(.3), "damage_share": 10 + comb * .3 + n(1.5), "deaths_per_game": max(1.0, 7.5 - comb * .05 + n(.5))}
        return {k: round(v, 2) for k, v in m.items()}

    for game, spec in ROLES_LEGACY.items():
        c = 0
        for role, arch, count in spec:
            for i in range(count):
                c += 1
                pid = f"P-{game}-{c:03d}"
                while True:
                    name = f"{rng.choice(PRE)}_{rng.choice(SUF)}"
                    if (game, name) not in names:
                        names.add((game, name))
                        break
                L = [clip(a + rng.gauss(0, 13)) for a in ARCH[arch]]
                m = metrics_for_legacy(game, L)
                pv = {k: ("annotated" if (k in ANNOTATION_METRICS and rng.random() < .3) else "simulated" if k in ANNOTATION_METRICS else "derived") for k in m}
                if rng.random() < .10:
                    for k in ("leadership_score", "communication_score"):
                        m.pop(k, None)
                        pv.pop(k, None)
                sec = [LEAD_ROLE[game]] if (role != LEAD_ROLE[game] and i < (6 if role in ("ENTRY", "CARRY") else 2)) else []
                matches = rng.randint(12, 120)
                slope = rng.uniform(-.025, .025)
                by_role.setdefault((game, role), []).append(dict(id=pid, name=name, game=game, role=role, sec=sec, m=m, pv=pv, matches=matches, L=L, slope=slope))

    OVERRIDES = [
        ("TAC", "ENTRY", 0, "Kaito_Strike", {"secondary": ["IGL"], "kill_death_ratio": 2.1, "damage_per_round": 112, "decision_quality_score": 38, "leadership_score": 41, "communication_score": 52, "matches": 88}),
        ("TAC", "IGL", 0, "Vex_Aurelius", {"decision_quality_score": 88, "leadership_score": 84, "communication_score": 80, "kill_death_ratio": 1.02, "matches": 64, "slope": 0.02}),
        ("TAC", "IGL", 1, "Mira_Solace", {"decision_quality_score": 91, "leadership_score": None, "communication_score": None, "matches": 70}),
        ("TAC", "IGL", 2, "Dax_Lowsample", {"decision_quality_score": 86, "leadership_score": 85, "communication_score": 83, "matches": 7}),
        ("ARENA", "CARRY", 0, "Rex_Frag", {"secondary": ["SHOTCALLER"], "kda": 9.5, "damage_share": 38, "decision_quality_score": 35, "leadership_score": 40, "communication_score": 50, "matches": 90}),
        ("ARENA", "SHOTCALLER", 0, "Juno_Quill", {"decision_quality_score": 89, "leadership_score": 86, "communication_score": 82, "matches": 66, "slope": 0.018}),
        ("ARENA", "SHOTCALLER", 1, "Tali_Ember", {"decision_quality_score": 90, "leadership_score": None, "communication_score": None, "matches": 72}),
    ]

    for game, role, idx, name, patch in OVERRIDES:
        p = by_role[(game, role)][idx]
        p["name"] = name
        for k, v in patch.items():
            if k == "secondary": p["sec"] = v
            elif k == "matches": p["matches"] = v
            elif k == "slope": p["slope"] = v
            elif v is None: p["m"].pop(k, None); p["pv"].pop(k, None)
            else: p["m"][k] = v; p["pv"][k] = "annotated" if k in ANNOTATION_METRICS else "derived"

    for plist in by_role.values():
        for p in plist:
            conn.execute("INSERT OR REPLACE INTO players VALUES(?,?,?,?,?,?,?,?,1,'synthetic_seed_v1','available','en',0)",
                         (p["id"], p["name"], p["game"], p["role"], json.dumps(p["sec"]), p["matches"], json.dumps(p["m"]), json.dumps(p["pv"])))
            L = p["L"]
            base = .85 + .35 * sum(L) / len(L) / 100
            sd = .22 - .16 * L[5] / 100
            n = min(12, p["matches"])
            hr = random.Random(p["id"])
            for i in range(n):
                conn.execute("INSERT OR REPLACE INTO match_history VALUES(?,?,?)",
                             (p["id"], i, round(clip(base + p["slope"] * (i - (n - 1) / 2) + hr.gauss(0, sd), .3, 2.0), 3)))

    # Rosters 1, 2, 3: Must have exact IDs for TEST-001..020
    LEGACY_ROSTERS = [
        (1, "Nova Vanguard", "TAC", {"ENTRY": [8, 9], "SUPPORT": [5, 6]}),
        (2, "Nova Vanguard Academy", "TAC", {"IGL": [10], "ENTRY": [10, 11], "SUPPORT": [7, 8]}),
        (3, "Nova Tide", "ARENA", {"CARRY": [8, 9], "SUPPORT": [5, 6]}),
    ]

    for rid, rname, game, slots in LEGACY_ROSTERS:
        conn.execute("INSERT OR REPLACE INTO rosters(id, name, game) VALUES(?,?,?)", (rid, rname, game))
        for role, idxs in slots.items():
            for i in idxs:
                conn.execute("INSERT OR REPLACE INTO roster_members VALUES(?,?,?)", (rid, by_role[(game, role)][i]["id"], role))

    # 3. Seed Valorant Worked Example & Candidates (PRD §8 & §10.3)
    val_players = [
        {
            "id": "VAL-001", "name": "Kairo", "game": "valorant", "role": "Controller",
            "matches": 240, "availability": "contracted", "lang": "en", "utc": -5,
            "metrics": {
                "acs": 222.0, "round_win_rate": 57.0, "assists_per_round": 0.34, "first_death_rate": 0.101,
                "shotcall_impact": 42.0, "mid_round_decision": 45.0, "clutch_win_rate": 20.0,
                "agent_pool": "Omen, Brimstone", "contract_salary_k": 140, "buyout_usd": "$80,000",
                "scout_summary": "Incumbent controller. Solid baseline combat stats, but severely lacks mid-round utility pacing and retake coordination."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-002", "name": "Mirage", "game": "valorant", "role": "Controller",
            "matches": 310, "availability": "available", "lang": "en", "utc": -5,
            "metrics": {
                "acs": 255.0, "round_win_rate": 56.5, "assists_per_round": 0.52, "first_death_rate": 0.104,
                "shotcall_impact": 84.0, "mid_round_decision": 86.0, "clutch_win_rate": 28.5,
                "agent_pool": "Omen, Astra, Viper", "contract_salary_k": 175, "buyout_usd": "$0 (Free Agent)",
                "scout_summary": "PRD §10.3 Primary Target. Elite utility assist rate (0.52) and certified IGL mid-round shot-calling. Exactly covers Sentinels utility gap (80/70)."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-003", "name": "Voltz", "game": "valorant", "role": "Controller",
            "matches": 280, "availability": "contracted", "lang": "fr", "utc": 1,
            "metrics": {
                "acs": 285.0, "round_win_rate": 57.5, "assists_per_round": 0.32, "first_death_rate": 0.11,
                "shotcall_impact": 28.0, "mid_round_decision": 35.0, "clutch_win_rate": 18.0,
                "agent_pool": "Brimstone, Reyna", "contract_salary_k": 260, "buyout_usd": "$150,000",
                "scout_summary": "PRD §10.3 Statistical Decoy. Inflated raw ACS (285) due to eco-round frags. Very low utility (30/70) and poor comms synergy. Low fit score (49.3)."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-004", "name": "Nova", "game": "valorant", "role": "Controller",
            "matches": 62, "availability": "available", "lang": "en", "utc": -5,
            "metrics": {
                "acs": 235.0, "round_win_rate": 58.0, "assists_per_round": 0.45, "first_death_rate": 0.09,
                "shotcall_impact": 65.0, "mid_round_decision": 62.0, "clutch_win_rate": 22.0,
                "agent_pool": "Viper, Omen", "contract_salary_k": 85, "buyout_usd": "$0 (Free Agent)",
                "scout_summary": "High-potential talent from Collegiate circuit. Classified Provisional (<100 rounds). Promising utility metrics."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-005", "name": "Echo", "game": "valorant", "role": "Controller",
            "matches": 150, "availability": "available", "lang": "en", "utc": 0,
            "metrics": {
                "round_win_rate": 52.0, "assists_per_round": 0.40, "first_death_rate": 0.12,
                "shotcall_impact": 55.0, "mid_round_decision": 50.0, "clutch_win_rate": 21.0,
                "agent_pool": "Astra, Harbor", "contract_salary_k": 90, "buyout_usd": "$0 (Free Agent)",
                "scout_summary": "Unranked candidate: missing mandatory anchor metric 'acs'. Telemetry feed needs recalibration."
            },
            "provenance": {"round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-006", "name": "TenZ_Sim", "game": "valorant", "role": "Duelist",
            "matches": 340, "availability": "contracted", "lang": "en", "utc": -5,
            "metrics": {
                "first_kill_rate": 0.22, "damage_per_round": 168.0, "kast_pct": 74.0, "round_win_rate": 58.0,
                "shotcall_impact": 58.0, "mid_round_decision": 68.0, "clutch_win_rate": 31.0,
                "agent_pool": "Jett, Yoru, Omen", "contract_salary_k": 320, "buyout_usd": "Franchise Player",
                "scout_summary": "Elite opening fragger and mechanical virtuoso. Incredible first kill conversion and fan favorite."
            },
            "provenance": {"first_kill_rate": "derived", "damage_per_round": "derived", "kast_pct": "derived", "round_win_rate": "derived"},
        },
        {
            "id": "VAL-007", "name": "Aspas_Sim", "game": "valorant", "role": "Duelist",
            "matches": 380, "availability": "available", "lang": "pt", "utc": -3,
            "metrics": {
                "first_kill_rate": 0.24, "damage_per_round": 172.0, "kast_pct": 76.0, "round_win_rate": 61.0,
                "shotcall_impact": 62.0, "mid_round_decision": 72.0, "clutch_win_rate": 34.0,
                "agent_pool": "Jett, Raze", "contract_salary_k": 350, "buyout_usd": "$200,000",
                "scout_summary": "Top 1 world duelist. Unmatched consistency across international LANs with 172 ADR."
            },
            "provenance": {"first_kill_rate": "derived", "damage_per_round": "derived", "kast_pct": "derived", "round_win_rate": "derived"},
        },
        {
            "id": "VAL-008", "name": "Chronicle_Sim", "game": "valorant", "role": "Initiator",
            "matches": 310, "availability": "contracted", "lang": "en", "utc": 1,
            "metrics": {
                "assists_per_round": 0.54, "flash_assists_per_round": 0.28, "acs": 215.0, "kast_pct": 78.0,
                "shotcall_impact": 78.0, "mid_round_decision": 88.0, "clutch_win_rate": 29.0,
                "agent_pool": "Sova, Breach, Fade", "contract_salary_k": 280, "buyout_usd": "$180,000",
                "scout_summary": "Most decorated player in VCT history. 3x international trophy winner with peerless utility timing."
            },
            "provenance": {"assists_per_round": "derived", "flash_assists_per_round": "derived", "acs": "derived", "kast_pct": "derived"},
        },
        {
            "id": "VAL-009", "name": "Leo_Sim", "game": "valorant", "role": "Initiator",
            "matches": 290, "availability": "available", "lang": "en", "utc": 1,
            "metrics": {
                "assists_per_round": 0.58, "flash_assists_per_round": 0.32, "acs": 220.0, "kast_pct": 82.0,
                "shotcall_impact": 75.0, "mid_round_decision": 84.0, "clutch_win_rate": 36.0,
                "agent_pool": "Fade, Sova, Gekko", "contract_salary_k": 270, "buyout_usd": "$160,000",
                "scout_summary": "The Swedish fortress. 82% KAST and unrivaled recon dart execution."
            },
            "provenance": {"assists_per_round": "derived", "flash_assists_per_round": "derived", "acs": "derived", "kast_pct": "derived"},
        },
        {
            "id": "VAL-010", "name": "Boaster_Sim", "game": "valorant", "role": "Controller",
            "matches": 350, "availability": "contracted", "lang": "en", "utc": 0,
            "metrics": {
                "acs": 195.0, "round_win_rate": 59.0, "assists_per_round": 0.46, "first_death_rate": 0.088,
                "shotcall_impact": 94.0, "mid_round_decision": 92.0, "clutch_win_rate": 26.0,
                "agent_pool": "Astra, Omen, Viper", "contract_salary_k": 300, "buyout_usd": "Franchise IGL",
                "scout_summary": "World-class IGL. Master tactician with iconic mid-round adaptations and team morale leadership."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-011", "name": "Less_Sim", "game": "valorant", "role": "Sentinel",
            "matches": 320, "availability": "available", "lang": "pt", "utc": -3,
            "metrics": {
                "kast_pct": 79.0, "site_hold_success": 72.0, "clutch_win_rate": 32.0, "first_death_rate": 0.082,
                "shotcall_impact": 70.0, "mid_round_decision": 80.0,
                "agent_pool": "Viper, Killjoy, Cypher", "contract_salary_k": 290, "buyout_usd": "$175,000",
                "scout_summary": "Elite site anchor. Impossible to dislodge on defensive holds with 72% hold success."
            },
            "provenance": {"kast_pct": "derived", "site_hold_success": "derived", "clutch_win_rate": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-012", "name": "Alfajer_Sim", "game": "valorant", "role": "Sentinel",
            "matches": 330, "availability": "contracted", "lang": "tr", "utc": 3,
            "metrics": {
                "kast_pct": 81.0, "site_hold_success": 75.0, "clutch_win_rate": 35.0, "first_death_rate": 0.078,
                "shotcall_impact": 66.0, "mid_round_decision": 76.0,
                "agent_pool": "Killjoy, Cypher, Iso", "contract_salary_k": 310, "buyout_usd": "$190,000",
                "scout_summary": "Top Turkish sentinel. Combines defensive lockdown with 35% clutch round conversion."
            },
            "provenance": {"kast_pct": "derived", "site_hold_success": "derived", "clutch_win_rate": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-013", "name": "valyn_Sim", "game": "valorant", "role": "Controller",
            "matches": 315, "availability": "available", "lang": "en", "utc": -5,
            "metrics": {
                "acs": 218.0, "round_win_rate": 57.8, "assists_per_round": 0.48, "first_death_rate": 0.095,
                "shotcall_impact": 91.0, "mid_round_decision": 90.0, "clutch_win_rate": 27.0,
                "agent_pool": "Omen, Astra, Harbor", "contract_salary_k": 240, "buyout_usd": "$120,000",
                "scout_summary": "Proven Tier-1 IGL controller. Known for tactical discipline and winning Masters qualifications."
            },
            "provenance": {"acs": "derived", "round_win_rate": "derived", "assists_per_round": "derived", "first_death_rate": "derived"},
        },
        {
            "id": "VAL-014", "name": "johnqt_Sim", "game": "valorant", "role": "Sentinel",
            "matches": 305, "availability": "contracted", "lang": "en", "utc": -5,
            "metrics": {
                "kast_pct": 80.0, "site_hold_success": 74.0, "clutch_win_rate": 33.0, "first_death_rate": 0.081,
                "shotcall_impact": 93.0, "mid_round_decision": 92.0,
                "agent_pool": "Cypher, Deadlock", "contract_salary_k": 260, "buyout_usd": "Franchise IGL",
                "scout_summary": "Masters Madrid Champion IGL. Calm, clinical mid-round calls and precise anti-strat execution."
            },
            "provenance": {"kast_pct": "derived", "site_hold_success": "derived", "clutch_win_rate": "derived", "first_death_rate": "derived"},
        },
    ]

    for p in val_players:
        conn.execute(
            "INSERT OR REPLACE INTO players(id, name, game, role, secondary_roles, matches_played, metrics, provenance, synthetic, source, availability, language, utc_offset) "
            "VALUES(?,?,?,?,?,?,?,?,1,'synthetic_seed_val',?,?,?)",
            (p["id"], p["name"], p["game"], p["role"], json.dumps([]), p["matches"], json.dumps(p["metrics"]), json.dumps(p["provenance"]), p["availability"], p["lang"], p["utc"])
        )

    # 4. Seed CS2 Players
    cs2_players = [
        {
            "id": "CS-001", "name": "donk_Sim", "game": "cs2", "role": "Entry Fragger",
            "matches": 290, "availability": "contracted", "lang": "ru", "utc": 3,
            "metrics": {
                "opening_duel_success": 62.0, "damage_per_round": 92.0, "kast_pct": 77.0, "opening_deaths_per_round": 0.11, "flash_assists_per_round": 0.12,
                "shotcall_impact": 52.0, "mid_round_decision": 65.0, "clutch_win_rate": 28.0,
                "agent_pool": "AK-47, M4A1-S", "contract_salary_k": 360, "buyout_usd": "$500,000",
                "scout_summary": "The prodigy. 1.34 tournament rating with unmatched aggression and 92 ADR."
            },
            "provenance": {"opening_duel_success": "derived", "damage_per_round": "derived", "kast_pct": "derived", "opening_deaths_per_round": "derived", "flash_assists_per_round": "derived"},
        },
        {
            "id": "CS-002", "name": "ZywOo_Sim", "game": "cs2", "role": "AWPer",
            "matches": 340, "availability": "contracted", "lang": "fr", "utc": 1,
            "metrics": {
                "awp_kills_per_round": 0.68, "opening_duel_success": 68.0, "damage_per_round": 88.0, "round_win_rate": 60.0,
                "shotcall_impact": 72.0, "mid_round_decision": 88.0, "clutch_win_rate": 42.0,
                "agent_pool": "AWP, AK-47", "contract_salary_k": 400, "buyout_usd": "Franchise AWPer",
                "scout_summary": "The Chosen One. 3x #1 Player in the World. Flawless game sense and 42% clutch conversion."
            },
            "provenance": {"awp_kills_per_round": "derived", "opening_duel_success": "derived", "damage_per_round": "derived", "round_win_rate": "derived"},
        },
        {
            "id": "CS-003", "name": "m0NESY_Sim", "game": "cs2", "role": "AWPer",
            "matches": 310, "availability": "available", "lang": "ru", "utc": 1,
            "metrics": {
                "awp_kills_per_round": 0.72, "opening_duel_success": 66.0, "damage_per_round": 85.0, "round_win_rate": 58.0,
                "shotcall_impact": 68.0, "mid_round_decision": 82.0, "clutch_win_rate": 39.0,
                "agent_pool": "AWP, Desert Eagle", "contract_salary_k": 380, "buyout_usd": "$400,000",
                "scout_summary": "Flashy sniper with lightning-fast flick reactions and elite 1vX clutch capabilities."
            },
            "provenance": {"awp_kills_per_round": "derived", "opening_duel_success": "derived", "damage_per_round": "derived", "round_win_rate": "derived"},
        },
        {
            "id": "CS-004", "name": "b1t_Sim", "game": "cs2", "role": "Entry Fragger",
            "matches": 300, "availability": "available", "lang": "uk", "utc": 2,
            "metrics": {
                "opening_duel_success": 58.0, "damage_per_round": 84.0, "kast_pct": 75.0, "opening_deaths_per_round": 0.12, "flash_assists_per_round": 0.15,
                "shotcall_impact": 56.0, "mid_round_decision": 70.0, "clutch_win_rate": 26.0,
                "agent_pool": "AK-47, M4A4", "contract_salary_k": 260, "buyout_usd": "$220,000",
                "scout_summary": "Major champion with 65% headshot precision. Supreme crosshair placement."
            },
            "provenance": {"opening_duel_success": "derived", "damage_per_round": "derived", "kast_pct": "derived", "opening_deaths_per_round": "derived", "flash_assists_per_round": "derived"},
        },
        {
            "id": "CS-005", "name": "siuhy_Sim", "game": "cs2", "role": "Support",
            "matches": 270, "availability": "available", "lang": "en", "utc": 1,
            "metrics": {
                "flash_assists_per_round": 0.24, "trade_kill_rate": 28.0, "kast_pct": 76.0, "utility_damage_per_round": 26.0,
                "shotcall_impact": 92.0, "mid_round_decision": 91.0, "clutch_win_rate": 30.0,
                "agent_pool": "M4A1-S, Utility Grenades", "contract_salary_k": 250, "buyout_usd": "$190,000",
                "scout_summary": "Elite young IGL/Support. Led multiple underdog rosters to Major finals with tactical innovation."
            },
            "provenance": {"flash_assists_per_round": "derived", "trade_kill_rate": "derived", "kast_pct": "derived", "utility_damage_per_round": "derived"},
        },
        {
            "id": "CS-006", "name": "ropz_Sim", "game": "cs2", "role": "Lurker",
            "matches": 360, "availability": "contracted", "lang": "en", "utc": 2,
            "metrics": {
                "clutch_win_rate": 38.0, "damage_per_round": 84.0, "survival_rate": 48.0, "round_win_rate": 59.0,
                "shotcall_impact": 74.0, "mid_round_decision": 89.0,
                "agent_pool": "AK-47, MP9", "contract_salary_k": 320, "buyout_usd": "$280,000",
                "scout_summary": "Master lurker and theorycrafter. 38% clutch win rate with impeccable timing."
            },
            "provenance": {"clutch_win_rate": "derived", "damage_per_round": "derived", "survival_rate": "derived", "round_win_rate": "derived"},
        },
        {
            "id": "CS-007", "name": "karrigan_Sim", "game": "cs2", "role": "Support",
            "matches": 410, "availability": "contracted", "lang": "en", "utc": 1,
            "metrics": {
                "flash_assists_per_round": 0.28, "trade_kill_rate": 26.0, "kast_pct": 72.0, "utility_damage_per_round": 29.0,
                "shotcall_impact": 96.0, "mid_round_decision": 95.0, "clutch_win_rate": 25.0,
                "agent_pool": "Flashbang, Smoke, M4A1-S", "contract_salary_k": 350, "buyout_usd": "Franchise IGL",
                "scout_summary": "Legendary IGL. Most successful captain in Counter-Strike history with unrivaled mid-round calling."
            },
            "provenance": {"flash_assists_per_round": "derived", "trade_kill_rate": "derived", "kast_pct": "derived", "utility_damage_per_round": "derived"},
        },
    ]

    for p in cs2_players:
        conn.execute(
            "INSERT OR REPLACE INTO players(id, name, game, role, secondary_roles, matches_played, metrics, provenance, synthetic, source, availability, language, utc_offset) "
            "VALUES(?,?,?,?,?,?,?,?,1,'synthetic_seed_cs2',?,?,?)",
            (p["id"], p["name"], p["game"], p["role"], json.dumps([]), p["matches"], json.dumps(p["metrics"]), json.dumps(p["provenance"]), p["availability"], p["lang"], p["utc"])
        )

    # 5. Populate Realistic Competitive Tournament Match Logs (Matches Table)
    TOURNAMENTS_VAL = [
        ("VCT Masters Madrid 2024", "Ascent", "LOUD", "13-11", "W"),
        ("VCT Masters Madrid 2024", "Lotus", "Gen.G", "14-12", "W"),
        ("VCT Americas Stage 1", "Haven", "Paper Rex", "13-9", "W"),
        ("VCT Americas Stage 1", "Bind", "Fnatic", "11-13", "L"),
        ("VCT Champions Seoul 2024", "Sunset", "Team Liquid", "13-8", "W"),
        ("VCT Champions Seoul 2024", "Breeze", "Sentinels", "16-14", "W"),
    ]
    TOURNAMENTS_CS2 = [
        ("PGL Major Copenhagen 2024", "Mirage", "FaZe Clan", "13-11", "W"),
        ("PGL Major Copenhagen 2024", "Inferno", "Natus Vincere", "14-16", "L"),
        ("IEM Cologne 2024", "Nuke", "Team Vitality", "13-8", "W"),
        ("IEM Cologne 2024", "Anubis", "G2 Esports", "13-10", "W"),
        ("BLAST Premier Spring Final", "Ancient", "MOUZ", "16-13", "W"),
        ("ESL Pro League S19", "Dust II", "Team Spirit", "13-9", "W"),
    ]

    HIGHLIGHTS_VAL = [
        "Clutched 1v2 on B site round 21 with smoke line-up (0:03 defuse)",
        "Called A split execute with delayed lurk, caught 2 rotating defenders",
        "Anti-eco 3K with Ghost on Round 3 force-buy",
        "Denied B rush with Viper snakebite + smoke delay (saved 4 rifles)",
        "Opening entry frag on long A + site anchor trade",
        "Mid-round tactical audible on Round 18 after scout pick on C long",
    ]
    HIGHLIGHTS_CS2 = [
        "1v2 post-plant clutch vs 2 rifles on Round 22 with AWP no-scope",
        "Called double fake on A site, baiting 3 rotators into B trap",
        "Desert Eagle 3K on Round 2 eco break to shift economic momentum",
        "Flash assist on banana banana execute yielding opening double kill",
        "Opening entry kill on mid connector + traded site anchor",
        "Tactical timeout called down 8-11, spearheaded 5-0 comeback run",
    ]

    # Seed matches for Valorant players
    for p in val_players:
        m_dict = p["metrics"]
        base_acs = m_dict.get("acs", 220.0)
        shot_imp = m_dict.get("shotcall_impact", 50.0)
        rng_p = random.Random(p["id"])
        for idx, (tourn, map_n, opp, score, res) in enumerate(TOURNAMENTS_VAL):
            k = int(rng_p.gauss(18, 4))
            d = int(rng_p.gauss(14, 3))
            a = int(rng_p.gauss(8, 3))
            r_rating = round(max(0.6, min(1.8, 1.05 + (base_acs - 220) / 150 + rng_p.gauss(0, 0.12))), 2)
            c_score = round(max(100.0, base_acs + rng_p.gauss(0, 25)), 1)
            clutch = 1 if rng_p.random() < 0.35 else 0
            fb = int(rng_p.gauss(2, 1.2))
            conn.execute(
                "INSERT OR REPLACE INTO matches(player_id, match_date, tournament, map_name, opponent, score, result, rating, combat_stat, kills, deaths, assists, clutches_won, first_bloods, shotcall_impact, situational_event) "
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (p["id"], f"2024-0{idx+3}-{10+idx*2}", tourn, map_n, opp, score, res, r_rating, c_score, max(4, k), max(4, d), max(1, a), clutch, max(0, fb), shot_imp, HIGHLIGHTS_VAL[idx % len(HIGHLIGHTS_VAL)])
            )

    # Seed matches for CS2 players
    for p in cs2_players:
        m_dict = p["metrics"]
        base_adr = m_dict.get("damage_per_round", 80.0)
        shot_imp = m_dict.get("shotcall_impact", 50.0)
        rng_p = random.Random(p["id"])
        for idx, (tourn, map_n, opp, score, res) in enumerate(TOURNAMENTS_CS2):
            k = int(rng_p.gauss(19, 4))
            d = int(rng_p.gauss(13, 3))
            a = int(rng_p.gauss(6, 2))
            r_rating = round(max(0.7, min(1.9, 1.10 + (base_adr - 80) / 60 + rng_p.gauss(0, 0.15))), 2)
            c_score = round(max(50.0, base_adr + rng_p.gauss(0, 12)), 1)
            clutch = 1 if rng_p.random() < 0.4 else 0
            fb = int(rng_p.gauss(3, 1.5))
            conn.execute(
                "INSERT OR REPLACE INTO matches(player_id, match_date, tournament, map_name, opponent, score, result, rating, combat_stat, kills, deaths, assists, clutches_won, first_bloods, shotcall_impact, situational_event) "
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (p["id"], f"2024-0{idx+3}-{12+idx*2}", tourn, map_n, opp, score, res, r_rating, c_score, max(4, k), max(4, d), max(1, a), clutch, max(0, fb), shot_imp, HIGHLIGHTS_CS2[idx % len(HIGHLIGHTS_CS2)])
            )

    # 6. Seed Certified IGL Scouter Annotations (Coach Dev + Scout Arjun)
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-002", 4, "Dev Sharma (Head Coach)", "2024-10-18", "Exceptional mid-round utility pacing. Consistently delays enemy B executes by 18+ seconds. Vocal on retakes."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-002", 5, "Arjun Patel (Talent Scout)", "2024-10-20", "Elite macro shot-calling. Demonstrated calm comms during 11-12 decider map on Haven. Perfect fit for Sentinels strategic vacancy."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-003", 2, "Dev Sharma (Head Coach)", "2024-10-15", "Low communication volume. Often takes isolated duels without utility support. Prone to late rotations."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-003", 2, "Arjun Patel (Talent Scout)", "2024-10-16", "Does not shotcall. Relies on instinct rather than set protocols. Comms in French; English comms struggle under high pressure."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-010", 5, "Dev Sharma (Head Coach)", "2024-09-12", "World-class playbook and mid-round audible adjustments."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("VAL-010", 5, "Arjun Patel (Talent Scout)", "2024-09-14", "Unshakeable composure and team morale anchor."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("CS-005", 5, "Dev Sharma (Head Coach)", "2024-08-20", "Incredible tactical mind. Created revolutionary banana control protocols on Inferno."))
    conn.execute("INSERT OR REPLACE INTO annotations(player_id, igl_rating, annotator, date, note) VALUES(?,?,?,?,?)",
                 ("CS-007", 5, "Dev Sharma (Head Coach)", "2024-08-10", "Masterclass T-side mid-round calling. Greatest situational caller in Counter-Strike history."))

    # 7. Seed Rosters & Vacancies for Valorant & CS2 (Rosters 4 and 5)
    conn.execute("INSERT OR REPLACE INTO rosters(id, name, game, target_profile) VALUES(4, 'Sentinels', 'valorant', ?)",
                 (json.dumps({"target_score": 70, "Controller": {"Firepower": 70, "Objective": 70, "Utility": 70, "Survivability": 70}}),))
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(4, 'VAL-006', 'Duelist')")
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(4, 'VAL-008', 'Initiator')")
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(4, 'VAL-011', 'Sentinel')")
    conn.execute("INSERT OR REPLACE INTO vacancies(id, roster_id, role, priority, requirements, status) VALUES(7, 4, 'Controller', 'high', ?, 'open')",
                 (json.dumps({"target_acs": 200, "incumbent": "Kairo"}),))

    conn.execute("INSERT OR REPLACE INTO rosters(id, name, game, target_profile) VALUES(5, 'Fnatic CS2', 'cs2', ?)",
                 (json.dumps({"target_score": 70}),))
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(5, 'CS-002', 'AWPer')")
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(5, 'CS-005', 'Support')")
    conn.execute("INSERT OR REPLACE INTO roster_members VALUES(5, 'CS-006', 'Lurker')")
    conn.execute("INSERT OR REPLACE INTO vacancies(id, roster_id, role, priority, status) VALUES(8, 5, 'Entry Fragger', 'high', 'open')")

    conn.commit()


if __name__ == "__main__":
    c = db.connect()
    seed(c)
    print("Seeded successfully:", c.execute("SELECT COUNT(*) FROM players").fetchone()[0], "players in", db.db_path())
