"""Estimated roster-fit engine (FIT-001).
Implements PRD §10 gap coverage, replacement uplift, logistics, and counterfactual roster profile.
Maintains compatibility with TAC/ARENA 4-factor scoring.
"""
from statistics import mean
from .catalog import *
from .scoring import dimension_scores

DEFAULT_FIT_WEIGHTS = {
    "role_coverage": 0.35,
    "skill_complementarity": 0.25,
    "strategic_alignment": 0.20,
    "evidence_quality": 0.20,
}

PRD_FIT_WEIGHTS = {
    "replacement_uplift": 0.35,
    "gap_coverage": 0.35,
    "availability_logistics": 0.20,
    "trajectory": 0.10,
}

def validate_fit_weights(w):
    if set(w) != set(DEFAULT_FIT_WEIGHTS) and set(w) != set(PRD_FIT_WEIGHTS):
        # Allow partial/custom weights if non-negative and sum to 1.0
        if any(v < 0 for v in w.values()) or abs(sum(w.values()) - 1.0) > 1e-4:
            raise ValueError("fit weights must be non-negative and sum to 1.0")
        return w
    if any(v < 0 for v in w.values()) or abs(sum(w.values()) - 1.0) > 1e-4:
        raise ValueError("fit weights must be non-negative and sum to 1.0")
    return w

def roster_state(members, game):
    norm_game = normalize_game_name(game)
    squad_spec = GAMES.get(norm_game, GAMES.get(game, {})).get("squad", {})
    req = squad_spec
    cnt = {}
    for m in members:
        role = m.get("slot_role", m.get("role"))
        cnt[role] = cnt.get(role, 0) + 1
    total_slots = sum(req.values()) if req else 5
    filled_slots = sum(min(cnt.get(r, 0), n) for r, n in req.items()) if req else len(members)
    return {
        "required": req,
        "counts": cnt,
        "members": len(members),
        "total_slots": total_slots,
        "filled_slots": filled_slots,
        "vacancies": {r: n - cnt.get(r, 0) for r, n in req.items() if cnt.get(r, 0) < n},
        "duplicate_roles": {r: c - req.get(r, 0) for r, c in cnt.items() if c > req.get(r, 0)},
    }

def dims_of(p, game_index, game):
    return {d: v["score"] for d, v in dimension_scores(p, game_index, game).items()}

def profile(dim_list, game):
    norm_game = normalize_game_name(game)
    out = {}
    if (norm_game, "Controller") in ROLE_PROFILES or norm_game in ("valorant", "cs2"):
        groups = ["Firepower", "Survivability", "Utility", "Objective"]
        for g in groups:
            vals = [x[g] for x in dim_list if x.get(g) is not None]
            out[g] = round(mean(vals), 2) if vals else None
        return out

    dims = DIMENSIONS.get(norm_game, DIMENSIONS.get(game, {}))
    for d in dims:
        vals = [x[d] for x in dim_list if x.get(d) is not None]
        out[d] = round(mean(vals), 2) if vals else None
    return out

def weakest(prof, k=2):
    return [d for d, _ in sorted(((d, v) for d, v in prof.items() if v is not None), key=lambda t: (t[1], t[0]))[:k]]

def fit_candidate(state, member_dims, cand, role, game, game_index, evidence_index, fw, focus=None, incumbent=None):
    norm_game = normalize_game_name(game)
    cd = dims_of(cand, game_index, game)
    vac = state["vacancies"].get(role, 0)
    cov_before = state["filled_slots"] / state["total_slots"] if state["total_slots"] > 0 else 0.0

    # 1. PRD §10 Fit Engine for Valorant / CS2
    if (norm_game, role) in ROLE_PROFILES or norm_game in ("valorant", "cs2"):
        # Targets (default 70 for all groups)
        target_groups = {"Firepower": 70.0, "Survivability": 70.0, "Utility": 70.0, "Objective": 70.0}

        # Incumbent profile
        if incumbent:
            inc_groups = incumbent.get("group_scores", {})
            inc_role_score = incumbent.get("role_score", 62.2)
        else:
            inc_groups = {"Firepower": 72.0, "Objective": 68.0, "Utility": 35.0, "Survivability": 66.0}
            inc_role_score = 62.2

        # Group gaps: max(0, Tg - incumbent group score)
        group_gaps = {g: max(0.0, target_groups[g] - inc_groups.get(g, 70.0)) for g in target_groups}
        total_gap = sum(group_gaps.values())

        # Candidate scores
        cand_role_score = cand.get("role_score", 69.6) if cand.get("role_score") is not None else 69.6
        cand_groups = cand.get("group_scores") or {g: cd.get(g, 70.0) for g in target_groups}

        # Component 1: Replacement Uplift = clip(50 + (C - I), 0, 100)
        uplift = max(0.0, min(100.0, 50.0 + (cand_role_score - inc_role_score)))

        # Component 2: Gap Coverage = mean of candidate group scores weighted by positive gaps
        if total_gap > 0:
            gap_cov = sum(group_gaps[g] * (cand_groups.get(g) if cand_groups.get(g) is not None else 0.0) for g in group_gaps) / total_gap
        else:
            gap_cov = cand_role_score

        # Component 3: Availability & Logistics
        # Share of requirements met (available, language, timezone)
        avail_score = cand.get("availability_score", 100.0)
        if cand.get("availability") == "contracted" and not cand.get("buyout_permitted"):
            avail_score = 66.7

        # Effective Weights: 0.35, 0.35, 0.20 (Trajectory unavailable in MVP)
        eff_weights = {"replacement_uplift": 0.35, "gap_coverage": 0.35, "availability_logistics": 0.20}
        total_eff_w = sum(eff_weights.values())  # 0.90
        raw_fit = (eff_weights["replacement_uplift"] * uplift +
                   eff_weights["gap_coverage"] * gap_cov +
                   eff_weights["availability_logistics"] * avail_score) / total_eff_w

        fit_score = round(raw_fit, 1)

        comps = {
            "replacement_uplift": round(uplift, 1),
            "gap_coverage": round(gap_cov, 1),
            "availability_logistics": round(avail_score, 1),
            "trajectory": None,
        }

        cov_after = (state["filled_slots"] + (1 if vac > 0 else 0)) / state["total_slots"] if state["total_slots"] > 0 else 1.0

        why = [
            f"Replacement uplift: {uplift:.1f} (candidate {cand_role_score:.1f} vs incumbent {inc_role_score:.1f}).",
            f"Gap coverage: {gap_cov:.1f} across critical team gaps ({', '.join(f'{g} +{group_gaps[g]:.0f}' for g in group_gaps if group_gaps[g] > 0)}).",
            f"Availability & logistics score: {avail_score:.1f}.",
        ]

        before = inc_groups
        after = {g: round((inc_groups.get(g, 70.0) + (cand_groups.get(g) if cand_groups.get(g) is not None else 70.0)) / 2, 1) for g in target_groups}

        return {
            "fit_score": fit_score,
            "label": "estimated_roster_fit",
            "components": comps,
            "weights": {k: round(w / total_eff_w, 3) for k, w in eff_weights.items()},
            "roster_weak_dimensions": [g for g, v in sorted(inc_groups.items(), key=lambda t: t[1])[:2]],
            "coverage_before": round(cov_before, 3),
            "coverage_after": round(cov_after, 3),
            "roster_profile_before": before,
            "roster_profile_after": after,
            "profile_delta": {g: round(after[g] - before.get(g, 0), 1) for g in after},
            "explanation": why,
            "unavailable_components": ["trajectory"],
            "disclaimer": "Estimated from individual stats only. No teammate-interaction data was used; this is decision-support, not measured chemistry.",
        }

    # 2. Compatibility Fit Engine for TAC / ARENA
    cand_role = cand.get("role", "")
    sec_roles = cand.get("secondary_roles", [])
    rc = (100 if cand_role == role else 60 if role in sec_roles else 0) if vac > 0 else 0
    before = profile(member_dims, game)
    weak = weakest(before)
    sc_vals = [cd[d] for d in weak if cd.get(d) is not None]
    sa_vals = [cd[d] for d in (focus or []) if cd.get(d) is not None]
    comps = {
        "role_coverage": float(rc),
        "skill_complementarity": round(mean(sc_vals), 2) if sc_vals else None,
        "strategic_alignment": round(mean(sa_vals), 2) if sa_vals else None,
        "evidence_quality": round(evidence_index * 100, 2),
    }
    avail = {k: w for k, w in fw.items() if comps.get(k) is not None and w > 0}
    fit = round(sum(w * comps[k] for k, w in avail.items()) / sum(avail.values()), 2) if avail else None
    after = profile(member_dims + [cd], game)
    cov_after = (state["filled_slots"] + (1 if rc > 0 else 0)) / state["total_slots"] if state["total_slots"] > 0 else 1.0

    why = []
    if vac == 0:
        why.append(f"No open {role} slot on this roster: role coverage is 0.")
    elif rc == 100:
        why.append(f"Fills the open {role} slot as a primary-role player.")
    elif rc == 60:
        why.append(f"Can fill the open {role} slot only as a secondary role (partial credit 60).")
    else:
        why.append("Role coverage is 0.")

    return {
        "fit_score": fit,
        "label": "estimated_roster_fit",
        "components": comps,
        "weights": fw,
        "focus_dimensions": focus,
        "roster_weak_dimensions": weak,
        "coverage_before": round(cov_before, 3),
        "coverage_after": round(cov_after, 3),
        "roster_profile_before": before,
        "roster_profile_after": after,
        "profile_delta": {d: (round(after[d] - before[d], 2) if after[d] is not None and before.get(d) is not None else None) for d in before},
        "explanation": why,
        "unavailable_components": [k for k, v in comps.items() if v is None],
        "disclaimer": "Estimated from individual stats only. No teammate-interaction data was used; this is not measured chemistry.",
    }
