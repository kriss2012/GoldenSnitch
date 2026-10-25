# Real Esports Data Providers Integration Architecture

## 1. Executive Summary & Provider Contract
Golden Snitch implements an extensible, provider-based architecture (`backend/app/providers/`) designed for multi-title esports telemetry ingestion.

### Supported Providers

| Provider Identifier | Service Name | Supported Titles | Telemetry Endpoints | Ingestion Cadence | Rate Limits | Authentication |
|---|---|---|---|---|---|---|
| `henrik_valorant` | HenrikDev Valorant API | Valorant | Match histories, ACS, KAST, ADR, HS%, VCT Champions logs | 15 minutes (or manual) | 30 RPM (Free) / 120 RPM (Authorized) | Optional `VALORANT_API_KEY` |
| `steam_cs2` | Valve Steam Web API | CS2 | Premier rating, ADR, Weapon accuracy, First bullet accuracy, Major match logs | 15 minutes (or manual) | 100 RPM | Optional `STEAM_API_KEY` |
| `pandascore` | PandaScore Esports Feed | Valorant, CS2, LoL | Official match outcomes, team rosters, tournament brackets | Hourly batch | 30 RPM | Optional `PANDASCORE_API_KEY` |
| `liquipedia` | Liquipedia Open API | Valorant, CS2, LoL, Dota 2 | Team transfer history, tournament prize pools | On-demand | 20 RPM | User-Agent attribution |

---

## 2. Capability Matrix & Metric Isolation

Game metrics are isolated per title and never conflated across competitive ecosystems:

### Valorant Supported Telemetry
- **Measured Metrics:**
  - `acs` (Average Combat Score): Directly ingested from match rounds.
  - `kast` (Kill, Assist, Survive, Trade %): Evaluated across competitive rounds.
  - `adr` (Average Damage per Round): Normalized per weapon category.
  - `hs_pct` (Headshot Percentage): Calculated over round hits.
  - `clutch_win_rate` (1vX Clutch Conversion): 1v1 through 1v5 recorded situations.
  - `first_death_rate`: First engagement survivability.
  - `assists_per_round`: Utility assist conversion.
- **Explicitly Unsupported / Excluded:**
  - `voice_comms_sentiment`: Private team audio is proprietary and excluded per publisher privacy terms.
  - `practice_scrim_vods`: Unstreamed scrimmages are confidential organizational assets.

### CS2 Supported Telemetry
- **Measured Metrics:**
  - `damage_per_round` (ADR): Official Valve matchmaking & event logs.
  - `weapon_accuracy`: Rifle, sniper, and pistol split percentages.
  - `first_bullet_accuracy`: Mechanical crosshair placement and opening duel accuracy.
  - `clutch_success_rate`: 1vX post-plant conversions.
  - `trade_efficiency`: 3-second teammate trade engagement window.
- **Explicitly Unsupported / Excluded:**
  - `anti-cheat_heuristics`: Proprietary VAC engine internals.
  - `team_internal_tactics`: Protected in-game leader calling notes.

---

## 3. Data Flow & Provenance Tracking
1. **Search & Discovery:** A scout searches for player handles. The system simultaneously queries local SQLite DB and queries provider adapters (`search_all_providers`).
2. **Deterministic Matching:** Accounts with matching Riot PUUID or SteamID64 are tagged as verified.
3. **Provenance Attribution:** Every imported metric records its `data_source`, `timestamp`, `sample_size`, and whether it was `directly_measured` or `derived`.
4. **Missing Data Policy:** Missing metrics are stored as `null` or excluded from aggregate formulas, never converted into `0`.
