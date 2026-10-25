# Golden Snitch — Architecture & System Design
**Production System Architecture Specification**

---

## 1. Executive Overview

**Golden Snitch** is a multi-tier esports talent intelligence, candidate evaluation, and multi-roster simulation platform built for professional teams, scouts, coaches, analysts, and competitors.

### High-Level Topology

```
┌────────────────────────────────────────────────────────┐
│                   Web & Mobile Clients                 │
│        (Vite + React 18 + TypeScript + Tailwind)       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Production Backend                 │
│  - JWT Bearer Authentication & Real-Time Revocation    │
│  - Role-Based Access Control (RBAC)                    │
│  - Rate Limiting Middleware (Slowapi + IP LeakyBucket) │
│  - Correlation ID & Audit Logging                      │
│  - Health Check Subsystem (/health, /api/v1/health)    │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  SQLite / PostgreSQL Engine  │  │   Telemetry Provider Layer   │
│  - ACID Transactions         │  │  - BaseEsportsProvider       │
│  - Foreign Key Enforcements  │  │  - HenrikValorantProvider    │
│  - Persistent Schema V2      │  │  - SteamCS2Provider          │
│  - Anonymized GDPR Deletion  │  │  - ProviderManager           │
└──────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Frontend Application (`/frontend`)
- **Framework**: React 18 with TypeScript and Vite 5.
- **Styling**: Tailwind CSS tailored to the **Golden Snitch** Bright Gamified Violet design system (`#090014`, `#140026`, `#620a96`, `#5662f6`, `#9b30ff`, `#d187ff`).
- **State Management**: Context-based authentication state (`AuthContext.tsx`) and reactive service layers.
- **Routing**: `react-router-dom` with strict public/protected route segregation:
  - Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/p/:slug`, `/players/:game/:handle`, `/reports/shared/:shareToken`, `/terms`, `/privacy`.
  - Protected routes: `/dashboard`, `/scouting`, `/players`, `/compare`, `/rosters`, `/synergy`, `/watchlist`, `/reports`, `/organization`, `/data-sources`, `/settings`.

### 2.2 Backend Application (`/backend/app`)
- **Framework**: FastAPI (Python 3.13 / ASGI).
- **Security Middleware**: CORS security, Token revocation checks, PBKDF2-HMAC-SHA256 password hashing with salt generation.
- **Provider Architecture**:
  - `BaseEsportsProvider`: Abstract interface for live telemetry ingestion.
  - `HenrikValorantProvider`: Direct Riot Games / HenrikDev Valorant API integration.
  - `SteamCS2Provider`: Valve Steam Web API and Counter-Strike 2 Premier telemetry adapter.
  - `ProviderManager`: Central coordinator managing fallbacks, rate limits, and health status.

### 2.3 Database Layer (`backend/app/db.py`)
Autorun migrations and normalized schema:
- `users`: Credentials, salt, organization, role.
- `players`: Core candidate attributes, primary role, availability, salary, buyout.
- `external_providers`: Live provider status, rate limits, health checks.
- `player_identities`: Cross-game PUUIDs, SteamIDs, and provider linkages.
- `public_profiles`: Public dossiers, verification badges, social links, recruit status.
- `profile_claims`: Player identity claiming, verification codes, dispute audit history.
- `organizations`: Esports organizations, tags, slugs.
- `organization_members`: Role assignments (`ROLE_OWNER`, `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_COACH`, `ROLE_SCOUT`, `ROLE_ANALYST`, `ROLE_PLAYER`, `ROLE_MEMBER`).
- `organization_invitations`: Secure high-entropy tokenized team invitations.
- `shared_reports`: Cryptographic revocable sharing URLs for scouting evaluations.
- `data_correction_requests`: Formal disputes regarding stats, affiliation, and identity.
- `watchlists` (`watchlist_entries`): Multi-stage candidate tracking.
- `annotations`: Immutable certified scouting annotations with SHA256 checksums.
- `recommendation_audits`: Reproducible mathematical scoring snapshots.

---

## 3. Communication Contracts

1. **All JSON Responses**: Follow standardized RFC-compliant error structures:
   ```json
   {
     "error": {
       "code": "ERROR_CODE",
       "message": "Human-readable explanation",
       "details": {}
     }
   }
   ```
2. **Stateless JWT with Database-Backed Revocation**:
   - Access tokens have 24-hour expiration.
   - Immediate logout or password change hashes the token and stores it in `revoked_tokens`.
   - Deleted accounts invalidate all issued tokens at the gateway level.
