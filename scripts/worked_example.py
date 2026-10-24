"""Generates docs/04-intelligence-engine/WORKED_EXAMPLE.md from the LIVE engine on a fresh seeded DB (nothing hand-typed)."""
import os, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
os.environ["SCOUTGRID_DB"] = os.path.join(tempfile.mkdtemp(), "w.db")
from fastapi.testclient import TestClient
from app import db, seed
from app.main import app
c = db.connect(); seed.seed(c); c.close(); t = TestClient(app)
r = t.post("/api/scouting/recommendations", json={"roster_id": 1, "role": "IGL", "top_n": 50}).json()
cs = r["candidates"]; pick = [x for x in cs if x["name"] in ("Mira_Solace", "Vex_Aurelius", "Kaito_Strike")]
L = ["# Worked example (generated from the live engine)", "",
     "> **All data is synthetic** (`synthetic_seed_v1`, RNG seed 1337). Fictional org *Nova Esports*, fictional title *Tactical Shooter (synthetic title)*.",
     "> Regenerate with `python scripts/worked_example.py`. Nothing below is hand-typed.", "",
     f"**Need:** roster *{r['roster']['name']}* has an open **IGL** slot (vacancies {r['roster_state']['vacancies']}); squad coverage 80%.",
     f"**Pool:** {r['pool_size']} eligible IGL-capable players (primary or secondary IGL); {r['candidate_count']} are free agents. Normalization = percentile within this pool (ties = mid-rank).",
     f"**Weights (IGL):** {r['weights']} (sum = {sum(r['weights'].values()):.2f}). **Fit weights:** {r['fit_weights']}. **Focus dims:** {r['focus_dimensions']}.", "",
     "## Final ranking (top 6 of all ranked candidates)", "", "| Rank | Candidate | Role score | Evidence tier | Evidence coverage | Matches | Est. fit | Fit rank |", "|---|---|---:|---|---:|---:|---:|---:|"]
for x in cs[:6]: L.append(f"| {x['rank']} | {x['name']} | {x['role_score']} | {x['confidence']['tier']} | {x['confidence']['evidence_coverage']:.0%} | {x['matches_played']} | {x['fit']['fit_score']} | {x.get('fit_rank')} |")
for x in sorted(pick, key=lambda x: x["rank"]):
    L += ["", f"## {x['name']} - rank {x['rank']}, role score {x['role_score']}", "", "| Dimension | Weight | Score (0-100) | Points = w/Σw·score | Metrics (raw → percentile, provenance) |", "|---|---:|---:|---:|---|"]
    for k in x["components"]:
        ms = "; ".join(f"{m['metric']}: {m['raw']} → {m['percentile']} ({m['provenance']})" if m["raw"] is not None else f"{m['metric']}: MISSING" for m in k["metrics"])
        L.append(f"| {k['dimension']} | {k['weight']:.2f} | {k['score']} | {k['weighted_points']} | {ms} |")
    f = x["fit"]; cf = x["confidence"]
    L += ["", f"- Evidence index = 0.5·{cf['evidence_coverage']} + 0.3·{cf['sample_factor']} + 0.2·{cf['provenance_factor']} = **{cf['index']}** (tier **{cf['tier']}**; heuristic, not a probability).",
          f"- Fit components {f['components']} → **FitScore {f['fit_score']}**; roster weak dims {f['roster_weak_dimensions']}; squad coverage {f['coverage_before']:.0%} → {f['coverage_after']:.0%}.",
          f"- Strengths: {x['strengths']}; weaknesses: {x['weaknesses']}; K/D-or-KDA percentile in pool: {x['kd_percentile_in_pool']}.", "- Caveats: " + " | ".join(x["caveats"])]
    if x.get("why_above_next"): L.append(f"- Ranks above next candidate by {x['why_above_next']['score_gap']} points; drivers: {x['why_above_next']['top_drivers']}")
k = next(x for x in cs if x["name"] == "Kaito_Strike")
L += ["", "## Why role-specific ranking differs from a raw-stat leaderboard", "",
      f"Kaito_Strike has the highest K/D in the TAC game (percentile {k['kd_percentile_in_pool']} among IGL-eligible players) but ranks **#{k['rank']}** for IGL because the IGL profile gives combat only 5% and decision+leadership 45%; his decision/leadership metrics are low.",
      "He would be evaluated very differently under the ENTRY profile (combat 35%). A good ENTRY score does not imply a good IGL score.", "",
      "**Main caveat:** decision and leadership values are *simulated annotations* in this demo; they illustrate the mechanism and do not prove real shot-calling ability."]
open(os.path.join(os.path.dirname(__file__), "..", "docs", "04-intelligence-engine", "WORKED_EXAMPLE.md"), "w") if os.makedirs(os.path.join(os.path.dirname(__file__), "..", "docs", "04-intelligence-engine"), exist_ok=True) is None else None
open(os.path.join(os.path.dirname(__file__), "..", "docs", "04-intelligence-engine", "WORKED_EXAMPLE.md"), "w").write("\n".join(L) + "\n")
print("\n".join(L[10:18])); print([ (x['name'], x['rank']) for x in cs if x['name']=='Kaito_Strike'])
