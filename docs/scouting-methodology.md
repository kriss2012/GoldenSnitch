# Scouting Intelligence & Reproducible Scoring Methodology

## 1. Algorithmic Principles
Golden Snitch scoring separates pure combat execution from strategic squad fit and leadership impact. Every evaluation is deterministic, reproducible, and tied to an immutable algorithm version (`v2.0.0`).

### Core Evaluation Formulas

$$\text{Role Score} = \sum_{i=1}^{k} w_i \times \text{Normalize}(m_i)$$

Where:
- $m_i$ represents candidate metric $i$ (e.g. ACS, Utility assists per round, KAST).
- $w_i$ represents role-specific weights calibrated per competitive title.
- $\text{Normalize}$ clips outliers and standardizes metrics against baseline pro tier distributions.

---

## 2. Vacancy Gap Coverage (PRD §10.3 Worked Example)

When evaluating a candidate against a team vacancy (e.g. Sentinels Controller Vacancy), candidate score evaluates how effectively the player repairs the incumbent deficit:

$$\text{Fit Score} = 0.50 \times \text{Role Score} + 0.35 \times \text{Deficit Coverage} + 0.15 \times \text{Comms Compatibility}$$

### Mirage vs. Voltz Case Study
- **Vacancy:** Sentinels Controller (Incumbent Kairo: Severe utility deficit, 35/100 utility pacing).
- **Mirage (Rank #1 Pick):**
  - Utility Score: $80/100$ (covers gap with surplus).
  - Comms & Leadership: $84/100$ (Certified IGL, English native comms).
  - Final Fit Score: **74.8 / 100** (High Confidence).
- **Voltz (Statistical Decoy):**
  - Inflated raw ACS ($285$ vs $255$), but very low utility assist rate ($0.32$ vs $0.52$).
  - Utility Score: $30/100$ (fails to repair deficit).
  - Comms: French native, struggles with high-pressure mid-round retake calls in English.
  - Final Fit Score: **49.3 / 100** (Flagged as Statistical Decoy).

---

## 3. Evidence & Confidence Separation
- **Measured Data:** Directly imported match statistics.
- **Derived Evaluation:** Algorithmic composite indexes.
- **Evidence Sufficiency:** Sample size thresholds:
  - $\ge 150$ matches: High Confidence.
  - $50 - 149$ matches: Medium Confidence (Provisional).
  - $< 50$ matches: Low Confidence (Warning state).
