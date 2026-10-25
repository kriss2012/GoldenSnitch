# Golden Snitch — Production Deployment & Container Guide
**Release Engineering, Multi-Environment Configuration & Reverse Proxy Infrastructure**

---

## 1. Architecture Overview

Golden Snitch utilizes a hardened multi-container architecture for high-availability esports scouting intelligence:

```
                  [ Internet / End Users ]
                             │
              (HTTP/80, HTTPS/443, HTTP-3/QUIC)
                             ▼
              ┌─────────────────────────────┐
              │ Reverse Proxy (Nginx/Caddy) │
              │ - TLS Termination & HTTP/2  │
              │ - Rate Limiting (5r/s auth) │
              │ - Gzip & Static Compression │
              │ - Security & CORS Headers   │
              └──────────────┬──────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Frontend Container    │         │ Backend API Container │
│ - Nginx Alpine        │         │ - Python 3.12-slim    │
│ - SPA Routing         │         │ - FastAPI (2 workers) │
│ - Immutable Assets    │         │ - Strict RBAC & JWT   │
└───────────────────────┘         └───────────┬───────────┘
                                              │
                                              ▼
                                  ┌───────────────────────┐
                                  │ Persistent Storage    │
                                  │ - Docker Volume       │
                                  │ - SQLite 3 (WAL Mode) │
                                  │ - Automated Snapshots │
                                  └───────────────────────┘
```

---

## 2. Container Manifests Inventory

| File | Purpose | Key Hardening Features |
| :--- | :--- | :--- |
| [`backend/Dockerfile`](file:///c:/D%20Drive/scoutgrid/backend/Dockerfile) | Backend API Container | Non-root `scoutgrid` user (UID 1001), healthcheck via `/health`, multi-worker Uvicorn. |
| [`frontend/Dockerfile`](file:///c:/D%20Drive/scoutgrid/frontend/Dockerfile) | Frontend Web Container | Multi-stage build (Node 20 -> Nginx 1.25 Alpine), SPA routing, 1-year asset caching. |
| [`nginx/nginx.conf`](file:///c:/D%20Drive/scoutgrid/nginx/nginx.conf) | Production NGINX Proxy | Rate limiting zones (`api_limit`, `auth_limit`), DoS body limits, gzip compression, security headers. |
| [`caddy/Caddyfile`](file:///c:/D%20Drive/scoutgrid/caddy/Caddyfile) | Production Caddy Proxy | Automatic HTTPS (Let's Encrypt), HTTP/3 QUIC, immutable header caching, clean upstream proxy. |
| [`docker-compose.yml`](file:///c:/D%20Drive/scoutgrid/docker-compose.yml) | Local Full-Stack Compose | Quick-start compose stack for local evaluation (Frontend on 3000, Backend on 8000). |
| [`docker-compose.prod.yml`](file:///c:/D%20Drive/scoutgrid/docker-compose.prod.yml) | Production NGINX Stack | Edge proxy with SSL support, managed data volumes, log rotation (20MB / 5 files). |
| [`docker-compose.caddy.yml`](file:///c:/D%20Drive/scoutgrid/docker-compose.caddy.yml) | Production Caddy Stack | Automatic SSL certificate renewal, HTTP/3 support, zero-configuration TLS. |

---

## 3. Deployment Workflows

### 3.1 Local Stack Execution (Docker Compose)

```bash
# 1. Clone repository and initialize environment
cp .env.example .env

# 2. Build and launch containers in background
docker compose up --build -d

# 3. Verify health and status
docker compose ps
docker compose logs -f backend

# 4. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Health Check: http://localhost:8000/health
```

### 3.2 Production NGINX Reverse Proxy Deployment

```bash
# 1. Prepare production environment file
cp .env.example .env.production
# Edit .env.production with cryptographically secure SCOUTGRID_SECRET_KEY and domain

# 2. Place SSL certificates (if using manual certificates)
mkdir -p certs
# Copy fullchain.pem and privkey.pem to certs/

# 3. Launch production stack
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# 4. Confirm container health status
docker compose -f docker-compose.prod.yml ps
```

### 3.3 Production Caddy Deployment (Zero-Config Automatic SSL)

```bash
# 1. Configure domain in caddy/Caddyfile
# Replace :80 with your domain (e.g., app.goldensnitch.gg)

# 2. Launch Caddy stack
docker compose -f docker-compose.caddy.yml --env-file .env.production up --build -d

# Caddy will automatically request, verify, and renew Let's Encrypt certificates.
```

---

## 4. Operational Monitoring & Maintenance

### 4.1 Automated Database Snapshots

SQLite runs in WAL (Write-Ahead Logging) mode. Backups can be captured live without container downtime:

```bash
# Execute safe live snapshot to host backup directory
docker exec -t scoutgrid-backend sqlite3 /app/data/scoutgrid.db ".backup '/app/data/backup_$(date +%Y%m%d_%H%M%S).db'"
```

### 4.2 Log Rotation & Diagnostics

All containers are configured with JSON-file log limits:
- `max-size: "20m"`
- `max-file: "5"`

To inspect structured logs:
```bash
# Stream backend logs
docker logs -f --tail=100 scoutgrid-backend

# Stream reverse proxy logs
docker logs -f --tail=100 scoutgrid-prod-proxy
```

### 4.3 Zero-Downtime Rollback Procedure

```bash
# If a new version requires rollback:
docker compose -f docker-compose.prod.yml stop backend frontend
docker tag scoutgrid-prod-backend:previous scoutgrid-prod-backend:latest
docker compose -f docker-compose.prod.yml up -d
```
