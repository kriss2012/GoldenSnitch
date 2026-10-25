# Golden Snitch — Live Esports Data & Public Intelligence Audit

**Document Code:** AUD-LIVE-001  
**Author:** Principal Full-Stack & Esports Data Architect  
**Scope:** Real Esports Data Providers, Identity Resolution, Public Profiles, Profile Claims, Organization Portals, and Verification Architecture  

---

## 1. What Already Works

1. **Authentication & Session Security:**
   - Full JWT session lifecycle with PBKDF2-HMAC-SHA256 password hashing.
   - Database-level session revocation (`revoked_tokens` table) on logout.
   - Client IP sliding-window rate limiting on login (blocking brute-force after 10 failed attempts with HTTP 429).
   - React `<ProtectedRoute>` route guard.
2. **Notification Engine:**
   - Persistent SQLite `notifications` table indexed on `(user_id, is_read, created_at)`.
   - Complete notification endpoints (`GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`, etc.).
   - Frontend `<NotificationDropdown />` with unread count badge, deep linking, and mobile viewport protection.
3. **Scouting Intelligence & Parity:**
   - Deterministic role-specific scoring in `backend/app/scoring.py` and `backend/app/fit.py`.
   - PRD §10.3 case study exact match (Mirage Fit 74.8 vs Voltz 49.3 for Sentinels Controller).
   - Immutable decision snapshot store (`recommendations` table).
   - Interactive zero-variance audit viewer on `/reports`.
4. **Data Ingestion & Verification:**
   - Multi-layer CSV validation with formula injection defense (`=`, `+`, `-`, `@` sanitization).
   - Bound checking on raw metrics, "Missing $\ne$ 0" policy, and SHA-256 dataset provenance.
5. **Quality Gate Baseline:**
   - 36 passing Pytest unit/integration tests (`backend/tests/`).
   - 44 passing frontend verification checks (`frontend/scripts/verify-frontend.js`).
   - 0 Ruff linter errors, production build passing cleanly.

---

## 2. What Currently Relies on Mock or Seeded Data

1. **Player Database & Match Telemetry:**
   - Initial pool of 141 competitive players is generated from deterministic seeded synthetic generators (`synthetic = 1`) and sample tournament match logs.
   - External provider identities (e.g. Riot PUUID, SteamID64, PandaScore player ID) are not yet linked to players.
2. **Player Profiles & Sharing:**
   - Profile URLs (`/players/:playerId`) are currently locked behind `<ProtectedRoute>` and cannot be viewed by external scouts or the public without signing in.
   - Social metadata (Open Graph, Twitter card preview) is missing.
   - No public slugs or sharing privacy settings (`public`, `unlisted`, `private`).
3. **Profile Ownership & Claims:**
   - No mechanism currently exists for real esports players to claim their imported profile, verify ownership (via account code verification or manual review), or edit self-reported details.
4. **Organizations & Teams:**
   - Rosters exist (`rosters` table), but parent esports organizations with invitation links, ownership transfers, and multi-tier organizational permissions (`owner`, `manager`, `coach`, `scout`, `player`) are not yet fully implemented.
5. **Live Provider Synchronization:**
   - Synchronization jobs and live external API connectors (e.g. HenrikDev Valorant API, Steam CS2 API, PandaScore, Liquipedia) need a modular provider layer with provenance tracking.

---

## 3. Legitimate Real Esports Data Sources & Capabilities

| Provider / API | Supported Games | Authentication & Rate Limits | Supported Fields & Metrics | Known Limitations & Gaps | Permitted Use |
|---|---|---|---|---|---|
| **HenrikDev Valorant API** (Unofficial Riot v1/v2/v3) | VALORANT (Americas, EMEA, APAC, KR) | API Key in header (`Authorization: HDEV-...`). Rate limit: 30-120 req/min depending on tier. | PUUID, Riot ID (`name#tag`), Rank/Tier, ELO/MMR, Match History, Map, Combat Score (ACS), Kills, Deaths, Assists, Headshot %, Damage per round, Agent played. | Scrims/custom matches private unless player matches public; rate limited. | Public profile display permitted with attribution; non-commercial / community tier. |
| **Valve Steam Web API / CS2 Match Telemetry** | Counter-Strike 2 | Steam Web API Key (`key=...`). Free tier: 100,000 req/day. | SteamID64, Player Summary, CS2 Game Stats (Total Kills, Headshots, Rounds Won, MVPs, Time Played, Weapon Accuracies). | Live competitive premier match logs require match share codes or tournament demo files (.dem). | Permitted with Steam API attribution. |
| **PandaScore Esports API** | VALORANT, CS2, LoL, Dota 2 | Bearer token. Free tier: 1,000 req/mo. | Professional tournament matches, official team rosters, player handles, tournament tiers (VCT Masters, BLAST Premier, PGL Major). | Broad tournament coverage but strict monthly quota on free tier. | Permitted for esports scouting / analytics. |
| **Liquipedia DB / Open Tournament Archives** | Multi-title | User-Agent required; max 1 req/2 sec. | Verified tournament placements, historical teams, player birthdays, nationalities, career earnings. | Semi-structured wiki telemetry; requires caching to respect rate limits. | Permitted under CC-BY-SA 3.0 with attribution. |

---

## 4. Retrievable vs. Non-Retrievable Metrics

### Retrievable from Live APIs:
- Player identity: Handle, Tag, Platform ID (PUUID, SteamID64), Current Team.
- Core combat metrics: ACS, K/D, Headshot %, KAST, Damage/Round, Assists/Round, First Kills.
- Match context: Date, Tournament/League, Map name, Agent/Hero, Round outcome, Score.
- Verified competitive history: Official roster affiliations, career prize earnings, tournament standings.

### Non-Retrievable (Must Be Handled via Certified Annotations or Derived):
- IGL shot-calling impact and mid-round strategic adaptability (never reported by game APIs; requires multi-scout consensus annotations).
- Team communication harmony and voice comms discipline.
- Internal player salary and contract buyout figures (private trade secrets; strictly self-reported or estimated).

---

## 5. Missing Database Fields, Schemas & APIs

1. **Database Schema Enhancements:**
   - `external_providers`: Store provider configuration, API capabilities, and health status.
   - `player_identities`: Map internal player ID to external provider IDs (`provider_name`, `external_id`, `verified`, `freshness_status`, `last_synced_at`).
   - `profile_claims`: Manage player ownership claim requests (`status: pending/approved/rejected`, `verification_method`, `evidence`, `reviewed_by`).
   - `organizations` & `organization_members`: Manage multi-game esports organizations with roles (`owner`, `manager`, `coach`, `scout`, `player`, `viewer`).
   - `organization_invitations`: Secure invitation tokens with expiry.
   - `shared_reports`: Tokenized share links with revocable access and expiration.
   - `public_profiles`: Slugs, privacy levels (`public`, `unlisted`, `private`), bio, verified badge.
2. **API Endpoints Required:**
   - Live Search: `GET /api/v1/players/search/live` (merges local database with live external lookup).
   - Public Profiles: `GET /api/v1/public/players/{slug_or_id}`.
   - Profile Claims: `POST /api/v1/players/{id}/claim`, `GET /api/v1/claims`, `PATCH /api/v1/claims/{id}`.
   - Organizations: `POST /api/v1/organizations`, `GET /api/v1/organizations/{id}`, `POST /api/v1/organizations/{id}/invitations`.
   - Shared Reports: `POST /api/v1/reports/{id}/share`, `GET /api/v1/public/reports/{share_token}`.
   - Provider Operations & Status: `GET /api/v1/data-sources/status`, `POST /api/v1/data-sources/{id}/sync`.

---

## 6. Risks to Existing User Data & Functionality

- **Risk 1:** Disruption of existing PRD §10.3 case study benchmark (Mirage vs Voltz).  
  *Mitigation:* Retain all existing seeded players, match logs, and decision snapshots. New external records will integrate via canonical models without overwriting seeded demo benchmarks.
- **Risk 2:** SQLite locking during live data synchronization.  
  *Mitigation:* Use short SQLite transactions, indexed lookups, and idempotent upserts.
- **Risk 3:** External API rate limit exhaustion or network latency.  
  *Mitigation:* In-memory caching, exponential backoff, circuit-breaker fallback to last-known good data with `stale` freshness indicator.
- **Risk 4:** Exposing private scouting notes in public profile views.  
  *Mitigation:* Strict schema separation: public profile endpoints will return only public identity, public statistics, and approved highlights. Private scouting notes and salary figures will remain behind authenticated RBAC checks.
