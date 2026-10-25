"""Deterministic role-specific scoring engine (SCORE-001..005).
Implements bounded group scoring for Valorant/CS2 (PRD §9) and percentile scoring for TAC/ARENA.
No randomness, no network, no LLM in scoring calculations.
"""
from bisect import bisect_left, bisect_right
from statistics import pstdev, mean
from .catalog import *

def derive_history_metrics(history):
    """history: list of ratings (oldest first). Returns (rating_stdev|None, slope|None)."""
    if len(history) < MIN_HISTORY:
        return None, None
    n = len(history); xs = range(n); mx = (n - 1) / 2; my = mean(history)
    denom = sum((x - mx) ** 2 for x in xs)
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, history)) / denom if denom else 0.0
    return round(pstdev(history), 4), round(slope, 5)

def trend_label(slope):
    if slope is None: return "insufficient_data"
    return "improving" if slope > 0.01 else "declining" if slope < -0.01 else "stable"

def build_index(pool, game):
    """Sorted value lists per metric over the normalization pool."""
    idx = {}
    metrics_to_index = set()
    if game in DIMENSIONS:
        metrics_to_index.update(m for d in DIMENSIONS[game].values() for m, _ in d)
    if game in GAME_METRICS:
        metrics_to_index.update(GAME_METRICS[game])
    for metric in metrics_to_index:
        idx[metric] = sorted(p["metrics"][metric] for p in pool if p["metrics"].get(metric) is not None)
    return idx

def percentile(value, sorted_vals, direction):
    n = len(sorted_vals)
    if n == 0: return None
    p = (bisect_left(sorted_vals, value) + 0.5 * (bisect_right(sorted_vals, value) - bisect_left(sorted_vals, value))) / n * 100
    return round(p if direction > 0 else 100 - p, 2)

def calculate_metric_score_bounded(value, lower, upper, direction):
    """PRD §9: Bounded normalization formula S = clip((v - lower)/(upper - lower), 0, 1) * 100"""
    if value is None:
        return None
    span = upper - lower
    if span <= 0:
        norm = 1.0 if value >= upper else 0.0
    else:
        norm = max(0.0, min(1.0, (value - lower) / span))
    score = norm * 100.0 if direction > 0 else (1.0 - norm) * 100.0
    return round(score, 2)

def dimension_scores(player, index, game):
    """Per-dimension or per-group score with full metric detail."""
    # 1. If game has explicit ROLE_PROFILES (Valorant / CS2)
    role = player.get("role", player.get("primary_role"))
    norm_game = normalize_game_name(game)
    p_metrics = player.get("metrics", {})
    p_prov = player.get("provenance", {})
    if (norm_game, role) in ROLE_PROFILES:
        prof = ROLE_PROFILES[(norm_game, role)]
        groups = {}
        for metric, (group, direction, lo, hi, weight, is_anchor) in prof.items():
            raw = p_metrics.get(metric)
            score = calculate_metric_score_bounded(raw, lo, hi, direction) if raw is not None else None
            groups.setdefault(group, []).append({
                "metric": metric, "raw": raw, "score": score,
                "percentile": score,  # compatibility mapping
                "weight": weight, "is_anchor": is_anchor,
                "direction": "higher_is_better" if direction > 0 else "lower_is_better",
                "provenance": p_prov.get(metric) if raw is not None else None,
            })
        out = {}
        for group, items in groups.items():
            valid_scores = [x["score"] for x in items if x["score"] is not None]
            weights = [x["weight"] for x in items if x["score"] is not None]
            g_score = round(sum(s * w for s, w in zip(valid_scores, weights)) / sum(weights), 2) if weights else None
            out[group] = {
                "score": g_score,
                "coverage": len(valid_scores) / len(items),
                "metrics": items,
            }
        return out

    # 2. Compatibility path for TAC and ARENA
    out = {}
    dims = DIMENSIONS.get(norm_game, DIMENSIONS.get(game, {}))
    for dim, metrics in dims.items():
        det = []
        for m, d in metrics:
            raw = p_metrics.get(m)
            pct = percentile(raw, index.get(m, []), d) if (raw is not None and m in index) else None
            det.append({
                "metric": m, "raw": raw, "percentile": pct, "score": pct,
                "direction": "higher_is_better" if d > 0 else "lower_is_better",
                "provenance": p_prov.get(m) if raw is not None else None,
            })
        have = [x["percentile"] for x in det if x["percentile"] is not None]
        out[dim] = {"score": round(mean(have), 2) if have else None, "coverage": len(have) / len(det) if det else 0.0, "metrics": det}
    return out

def evidence(dims, weights, matches):
    cov = sum(w * dims[d]["coverage"] for d, w in weights.items() if d in dims)
    sample = min(1.0, matches / SAMPLE_FULL)
    provs = [PROVENANCE_RELIABILITY.get(x["provenance"], 0.9) for d in weights if d in dims for x in dims[d]["metrics"] if x.get("provenance")]
    prov = mean(provs) if provs else 0.0
    idx = round(0.5 * cov + 0.3 * sample + 0.2 * prov, 4)
    tier = "high" if (idx >= 0.8 and cov >= 0.9) else "medium" if idx >= 0.6 else "low"
    return {
        "index": idx, "tier": tier, "evidence_coverage": round(cov, 4),
        "sample_factor": round(sample, 4), "provenance_factor": round(prov, 4),
        "note": "Heuristic evidence index based on coverage, sample size, and source provenance.",
    }

def score_player(player, index, game, role, weights=None):
    norm_game = normalize_game_name(game)
    prof = ROLE_PROFILES.get((norm_game, role))
    dims = dimension_scores(player, index, game)

    # If game/role is configured in Golden Snitch ROLE_PROFILES (Valorant / CS2)
    if prof:
        metrics_dict = player.get("metrics", {})
        metric_comps = []
        available_weights = 0.0
        weighted_sum = 0.0
        total_weight = sum(w for _, _, _, _, w, _ in prof.values())
        anchor_metric = None
        anchor_present = False

        for metric, (group, direction, lo, hi, w, is_anchor) in prof.items():
            if is_anchor:
                anchor_metric = metric
            raw = metrics_dict.get(metric)
            if raw is not None:
                if is_anchor:
                    anchor_present = True
                score = calculate_metric_score_bounded(raw, lo, hi, direction)
                weighted_sum += w * score
                available_weights += w
            else:
                score = None
            metric_comps.append({
                "metric": metric, "group": group, "weight": w, "raw": raw, "score": score,
                "direction": "higher_is_better" if direction > 0 else "lower_is_better",
                "is_anchor": is_anchor, "provenance": player["provenance"].get(metric),
            })

        coverage = round(available_weights / total_weight, 3) if total_weight > 0 else 0.0
        role_score = round(weighted_sum / available_weights, 2) if available_weights > 0 else None

        # Group scores
        group_scores = {}
        for grp in ["Firepower", "Survivability", "Utility", "Objective"]:
            in_grp = [c for c in metric_comps if c["group"] == grp]
            have_grp = [c for c in in_grp if c["score"] is not None]
            if have_grp:
                group_scores[grp] = round(sum(c["score"] * c["weight"] for c in have_grp) / sum(c["weight"] for c in have_grp), 2)
            else:
                group_scores[grp] = None

        rounds = player.get("matches_played", 0)  # rounds_played mapped to matches_played
        caveats = []
        status = "ranked"
        reason = None

        if not anchor_present:
            status = "unranked"
            reason = "anchor_metric_missing"
            caveats.append(f"Anchor metric '{anchor_metric}' missing; unranked.")
        elif coverage < MIN_COVERAGE:
            status = "unranked"
            reason = "coverage_below_minimum"
            caveats.append(f"Evidence coverage {coverage:.0%} is below minimum {MIN_COVERAGE:.0%}; unranked.")
        elif rounds < SAMPLE_MIN_ROUNDS:
            status = "provisional"
            reason = "sample_below_minimum"
            caveats.append(f"Sample size ({rounds} rounds) below minimum ({SAMPLE_MIN_ROUNDS}); provisional.")

        ev = evidence(dims, {d: 1.0 / len(dims) for d in dims}, rounds)
        strengths = [grp for grp, s in sorted(group_scores.items(), key=lambda t: -(t[1] or 0)) if s is not None and s >= 70][:2]
        weaknesses = [grp for grp, s in sorted(group_scores.items(), key=lambda t: (t[1] or 100)) if s is not None and s <= 45][:2]

        return {
            "player_id": player["id"], "name": player["name"], "primary_role": player["role"],
            "matches_played": rounds, "role_score": role_score, "status": status, "reason": reason,
            "coverage": coverage, "confidence": ev, "group_scores": group_scores,
            "components": [{"dimension": grp, "score": s, "weight": 0.25} for grp, s in group_scores.items()],
            "metric_components": metric_comps, "strengths": strengths, "weaknesses": weaknesses,
            "caveats": caveats, "kd_percentile_in_pool": group_scores.get("Firepower"),
            "anchor_metric": anchor_metric, "anchor_present": anchor_present,
        }

    # TAC and ARENA compatibility path
    w = weights or ROLE_WEIGHTS.get((norm_game, role), {})
    avail = {d: wt for d, wt in w.items() if dims.get(d, {}).get("score") is not None and wt > 0}
    wsum = sum(avail.values())
    base = sum(wt * dims[d]["score"] for d, wt in avail.items()) / wsum if wsum else None
    ev = evidence(dims, {d: wt for d, wt in w.items() if wt > 0}, player["matches_played"])
    comps = []
    for d, wt in w.items():
        s = dims.get(d, {}).get("score")
        cov = dims.get(d, {}).get("coverage", 0.0)
        comps.append({
            "dimension": d, "weight": wt, "score": s, "coverage": round(cov, 3),
            "weighted_points": round(wt / wsum * s, 3) if (s is not None and wsum) else None,
            "metrics": dims.get(d, {}).get("metrics", []),
        })
    missing = [x["metric"] for c in comps for x in c["metrics"] if x["raw"] is None]
    caveats = []
    if missing: caveats.append(f"Missing metrics (not treated as zero): {', '.join(missing)}")
    if player["matches_played"] < SAMPLE_FULL: caveats.append(f"Small sample: {player['matches_played']} matches (< {SAMPLE_FULL})")
    if any(x.get("provenance") == "simulated" for c in comps for x in c["metrics"]):
        caveats.append("Some inputs are simulated demonstration values, not measured behaviour.")
    status = "ranked" if ev["evidence_coverage"] >= MIN_COVERAGE and base is not None else "insufficient_evidence"
    if status != "ranked": caveats.append(f"Evidence coverage {ev['evidence_coverage']:.0%} is below {MIN_COVERAGE:.0%}; not ranked.")
    strengths = [c["dimension"] for c in sorted([c for c in comps if c["score"] is not None and c["score"] >= 70], key=lambda c: -c["weight"] * c["score"])][:3]
    weaknesses = [c["dimension"] for c in sorted([c for c in comps if c["score"] is not None and c["score"] <= 40], key=lambda c: -c["weight"] * (100 - c["score"]))][:3]
    return {
        "player_id": player["id"], "name": player["name"], "primary_role": player["role"],
        "matches_played": player["matches_played"], "role_score": round(base, 2) if base is not None else None,
        "status": status, "confidence": ev, "components": comps, "strengths": strengths, "weaknesses": weaknesses,
        "caveats": caveats,
        "kd_percentile_in_pool": next((x["percentile"] for c in comps if c["dimension"] == "combat" for x in c["metrics"] if x["metric"] in ("kill_death_ratio", "kda")), None),
    }

def eligible_pool(players, game, role):
    norm_game = normalize_game_name(game)
    return [p for p in players if normalize_game_name(p["game"]) == norm_game and (p["role"].lower() == role.lower() or any(r.lower() == role.lower() for r in p.get("secondary_roles", [])))]

def rank(results):
    """Deterministic order: ranked first, score desc, confidence desc, player_id asc."""
    status_order = {"ranked": 0, "provisional": 1, "unranked": 2, "insufficient_evidence": 3}
    ordered = sorted(results, key=lambda r: (status_order.get(r.get("status"), 4), -(r.get("role_score") or 0), -r.get("confidence", {}).get("index", 0), r.get("player_id", "")))
    pos = 0
    for r in ordered:
        if r.get("status") == "ranked":
            pos += 1
            r["rank"] = pos
        else:
            r["rank"] = None
    return ordered

def explain_vs(a, b):
    """Why a outranks b - derived from component differences only."""
    if a.get("role_score") is None or b.get("role_score") is None: return None
    diffs = []
    comps_a = {c.get("dimension", c.get("group")): c for c in a.get("components", [])}
    comps_b = {c.get("dimension", c.get("group")): c for c in b.get("components", [])}
    for k in set(comps_a) & set(comps_b):
        sa = comps_a[k].get("score")
        sb = comps_b[k].get("score")
        w = comps_a[k].get("weight", 0.25)
        if sa is not None and sb is not None:
            diffs.append((w * (sa - sb), k, sa, sb, w))
    diffs.sort(key=lambda t: -abs(t[0]))
    return {
        "vs_player_id": b["player_id"],
        "score_gap": round(a["role_score"] - b["role_score"], 2),
        "top_drivers": [{"dimension": d, "weighted_gap": round(g, 2), "this": sa, "other": sb, "weight": w} for g, d, sa, sb, w in diffs[:3]],
    }
