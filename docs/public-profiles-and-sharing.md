# Persistent Public Player Profiles & Sharing Architecture

## 1. URL Architecture & Routing

Profiles are accessible via clean, readable, collision-resistant URLs:

- **Public Canonical Slugs:** `/p/:slug` (e.g. `http://localhost:5173/p/mirage`, `http://localhost:5173/p/tenz`)
- **Game-Specific Slugs:** `/players/:game/:handle` (e.g. `/players/valorant/mirage`)
- **Backend API Contract:** `GET /api/v1/public/players/{slug_or_id}`

### Public vs Private Access Boundary
- **Publicly Visible:**
  - Player gamer handle and public bio.
  - Primary game and tactical role.
  - Publicly verified badges.
  - Aggregated performance telemetry (ACS, ADR, KAST, round win rate).
  - High-level leadership index (Certified IGL score, mid-round decision quality).
  - Provenance badges and freshness status.
- **Strictly Protected (Authenticated Only):**
  - Contract financial specifics, buyouts, and payment milestones.
  - Internal scouting notes and candidate shortlists.
  - Private organization roster simulations.
  - User password hashes and API credentials.

---

## 2. Shareability Features
1. **Native Mobile Share API:** Uses `navigator.share` on supported devices with title, summary, and URL.
2. **One-Click Copy Link:** Automatic clipboard fallback with toast confirmation.
3. **Open Graph & Social Metadata:** Includes dynamic title, description, and canonical link for Discord, Twitter/X, and LinkedIn rich link unfurls.
4. **Verified Pro Tick:** Distinctive emerald checkmark indicating cryptographically linked competitive accounts.
