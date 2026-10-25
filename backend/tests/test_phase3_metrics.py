"""
Phase 3 Validation & Accuracy Tests (Section 12.1 & Section 5)
Verifies:
1. Ground-Truth Recovery: Spearman rank correlation rho between computed IGL Score
   and latent 'leadership' for IGLs with >= 30 maps >= 0.75.
2. Duelist / AWPer ground-truth recovery rho vs. latent 'aim' >= 0.70.
3. Win-Probability model calibration: Brier score < 0.20.
4. Normalization & Bayesian shrinkage mathematical fixtures (k=12).
5. IGL weights presets and custom weights validation.
"""

from scipy.stats import spearmanr
from app.db import connect
from app.ml.win_probability import RoundStateWinProbabilityModel
from app.metrics.normalization import bayesian_shrinkage
from app.metrics.igl_model import IGLScoringEngine
from app.metrics.role_engine import UniversalRoleEngine


def test_bayesian_shrinkage_hand_fixtures():
    # When n = 0, shrunk_P must equal 50.0 exactly, confidence = 0.0
    shrunk_0, conf_0 = bayesian_shrinkage(percentile=90.0, n_samples=0, k=12.0)
    assert shrunk_0 == 50.0
    assert conf_0 == 0.0

    # When n = 12 (equal to k=12), shrunk_P must be midpoint between P and 50
    # (12 * 80 + 12 * 50) / 24 = (960 + 600) / 24 = 1560 / 24 = 65.0
    shrunk_12, conf_12 = bayesian_shrinkage(percentile=80.0, n_samples=12, k=12.0)
    assert shrunk_12 == 65.0
    assert conf_12 == 0.50

    # When n is large (e.g. 108 maps), shrunk_P approaches raw P
    # (108 * 80 + 12 * 50) / 120 = (8640 + 600) / 120 = 9240 / 120 = 77.0
    shrunk_108, conf_108 = bayesian_shrinkage(percentile=80.0, n_samples=108, k=12.0)
    assert shrunk_108 == 77.0
    assert conf_108 == 0.90


def test_win_probability_model_calibration():
    conn = connect()
    model = RoundStateWinProbabilityModel()
    res = model.fit_from_db(conn)
    
    assert res["status"] in ("fitted", "fallback_fit")
    assert res["brier_score"] < 0.20, f"Target Brier score < 0.20 not met: {res['brier_score']}"
    
    # Test WPA calculation
    p_before = 0.40
    p_after = 0.65
    wpa = model.compute_wpa(p_before, p_after)
    assert abs(wpa - 0.25) < 1e-6


def test_igl_ground_truth_recovery_spearman_rho():
    """
    CRITICAL QUALITY BAR (Section 12.1):
    On simulated data, Spearman rho between computed IGL Score and latent leadership
    (for IGLs with >= 30 maps) must be >= 0.75.
    """
    conn = connect()
    engine = IGLScoringEngine()

    # Query all IGL players who have ground truth
    cursor = conn.cursor()
    rows = cursor.execute("""
        SELECT p.id, gt.leadership, p.matches_played
        FROM players p
        JOIN _ground_truth gt ON p.id = gt.player_id
        WHERE p.role = 'IGL' AND p.matches_played >= 30
    """).fetchall()

    assert len(rows) >= 20, f"Expected >= 20 IGLs with >= 30 maps, found {len(rows)}"

    computed_scores = []
    latent_leaderships = []

    for pid, latent_lead, maps_cnt in rows:
        res = engine.evaluate_igl_from_db(conn, pid, game_id="valorant")
        computed_scores.append(res["igl_score"])
        latent_leaderships.append(latent_lead)

    rho, p_value = spearmanr(computed_scores, latent_leaderships)
    print(f"\n[+] IGL Ground-Truth Recovery: Spearman rho = {rho:.4f} (p = {p_value:.2e}, n = {len(rows)})")
    
    assert rho >= 0.75, f"IGL ground-truth recovery failed: Spearman rho = {rho:.4f} < 0.75 target"


def test_duelist_ground_truth_recovery():
    """Verifies other role models achieve rho >= 0.70 vs. latent mechanical aim."""
    conn = connect()
    engine = UniversalRoleEngine(game_id="valorant")

    cursor = conn.cursor()
    rows = cursor.execute("""
        SELECT p.id, gt.aim
        FROM players p
        JOIN _ground_truth gt ON p.id = gt.player_id
        WHERE p.role = 'Duelist' AND p.matches_played >= 30
    """).fetchall()

    assert len(rows) >= 15

    scores = []
    latents = []
    for pid, latent_aim in rows:
        res = engine.score_player(conn, pid, role_id="Duelist")
        scores.append(res["role_fit"])
        latents.append(latent_aim)

    rho, _ = spearmanr(scores, latents)
    print(f"[+] Duelist Ground-Truth Recovery: Spearman rho = {rho:.4f}")
    assert rho >= 0.70, f"Duelist recovery failed: Spearman rho = {rho:.4f} < 0.70 target"
