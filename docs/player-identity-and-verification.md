# Player Identity Resolution, Claiming & Verification Protocols

## 1. Identity Resolution Architecture
In professional esports, gamer handles change frequently and collisions are common. Golden Snitch guarantees deterministic identity resolution via immutable external identifiers:

```
[ Internal Player Record ]
      |
      +---> `player_id`: "VAL-002"
      |
      +---> `public_slug`: "mirage"
      |
      +---> `player_identities` (1:N)
             |-- Provider: "henrik_valorant", ID: "riot_puuid_mirage_sentinels_002"
             +-- Provider: "steam_cs2",        ID: "76561198012345678"
```

### Identifier Hierarchy
1. **Riot PUUID / SteamID64 (Cryptographic Primary):** Unique across handle changes and region migrations.
2. **Handle#Tagline (Display Level):** Current public identifier subject to cosmetic modification.
3. **Internal UUID:** Persistent database primary key guaranteeing relational stability.

---

## 2. Profile Claim Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Player as Competitive Player
    participant UI as Golden Snitch Frontend
    participant API as FastAPI Backend
    participant DB as SQLite Storage
    actor GM as Org GM / Verifier

    Player->>UI: Selects Profile -> "Claim Profile"
    UI->>UI: Selects Protocol (Riot OAuth / Steam OpenID / Scout Review)
    UI->>UI: Generates Deterministic Token (e.g. VAL-VERIFY-9421)
    Player->>UI: Enters Proof Evidence
    UI->>API: POST /api/v1/players/{id}/claim
    API->>DB: INSERT INTO profile_claims (status='pending')
    API->>DB: INSERT INTO notifications (Applicant Notification)
    API-->>UI: 200 OK (claim_id, status='pending')

    GM->>UI: Opens Admin Claims Dashboard
    UI->>API: GET /api/v1/claims
    API-->>UI: Returns Pending Claims
    GM->>API: PATCH /api/v1/claims/{id} (status='approved')
    API->>DB: UPDATE public_profiles SET verified_badge=1, claimed_by_user_id=applicant_id
    API->>DB: INSERT INTO notifications (Claim Approved Event)
    API-->>UI: 200 OK
```

### Verification Methods
1. **Riot Games OAuth / PUUID Verification:** Verifies account control by matching the authenticated Riot token against the player's PUUID.
2. **Steam OpenID Token Matching:** Verifies Counter-Strike account ownership via Valve OpenID 2.0 handshake.
3. **Manual Scout Review with Code Proof:** For tournament players, places a randomized token (e.g., `VAL-VERIFY-8821`) on their public Twitter/X or tracker profile, audited by an organization GM or scout.
