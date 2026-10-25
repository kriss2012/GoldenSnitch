# GOLDEN SNITCH — UI INTERACTION & COMPONENT AUDIT MATRIX
**Coverage:** 100% of Primary Application Routes, Interactive Elements, Modals, Forms & State Behaviors

---

## 1. Route & Component Interaction Inventory

| Page / Route | Interactive Controls | Asynchronous Actions | Loading & Error States | Persistence Behavior | Verification Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard (`/dashboard`)** | Game selector pills, Quick shortlists, Roster quick links | Fetches stats, vacancies, and recent match telemetry | Spinner on load, fallback cards on empty | State updates reflected in roster metrics | **PASSED** |
| **Scouting (`/scouting`)** | Role filters, Confidence toggles, Min matches slider, Add to Watchlist | Ingests candidates matching vacancy criteria | Empty candidate state, loading skeletons | Candidate additions persist to SQLite `watchlists` | **PASSED** |
| **Player Database (`/players`)** | Search input (debounced), Game selector, Role filter, Live Provider Search tab | Queries local database and Henrik/Steam APIs | Live feed loading spinner, zero-result state | Provider sync updates cached candidates | **PASSED** |
| **Player Profile (`/players/:id`)** | Animated 48px GTI counter, Shortlist button, Compare button, Dispute Data button | Submits watchlist entries, opens Dispute modal | Loading state, error alert on missing ID | Shortlist persists to database | **PASSED** |
| **Compare (`/compare`)** | Multi-candidate selection dropdowns, Radar chart overlays | Fetches 2-3 player metric sets simultaneously | Clear comparison grid, empty slots | State maintained during active session | **PASSED** |
| **Rosters (`/rosters`)** | Roster vacancy selector, Add/Remove member buttons | Mutates roster composition in database | Salary cap threshold warnings ($1.5M limit) | Relational constraints prevent duplicate assignments | **PASSED** |
| **Synergy Simulator (`/synergy`)** | Counterfactual candidate swap dropdowns | Computes instant squad synergy shift | Instant before-and-after calculation | Simulation mode preserves actual active roster | **PASSED** |
| **Watchlist (`/watchlist`)** | Stage selector (Screening, Trial, Offer, Signed), Notes editor, Remove button | Updates candidate recruitment pipeline | Empty watchlist banner, stage filter pills | Persists to `watchlist_entries` in SQLite | **PASSED** |
| **Shared Report (`/reports/shared/:token`)** | Revoke link button, Print/Export action, Copy link | Fetches shared report payload by token | 404 on revoked/expired token | Token status verified server-side | **PASSED** |
| **Organization (`/organization`)** | Create Org form, Staff invitation form, Role selector | Invites members via email with role assignment | Invitation link generation, copy button | Enforces RBAC permissions on backend | **PASSED** |
| **Data Sources (`/data-sources`)** | Trigger Provider Sync buttons, Health check badges | Ingests live telemetry from external providers | Rate limit badges, sync timestamps | Updates `external_providers` health records | **PASSED** |
| **Settings (`/settings`)** | Change Password form, Export Data button, Delete Account modal | Submits password changes, downloads JSON, deletes user | Modal confirmation required for account deletion | Account deletion permanently cleans up credentials | **PASSED** |
| **Public Profile (`/p/:slug`)** | Share Dossier button, Claim Profile button, Report Dispute button | Opens Claim and Dispute dialogs, copies share URL | Verified badge display, unauthenticated view | Public visibility enforced on server | **PASSED** |
| **Authentication (`/login`, `/register`, `/forgot-password`, `/reset-password`)** | Form validation, password visibility, submit buttons | JWT session generation, password reset tokens | Error alert banner for invalid credentials | Session token stored in local storage, revoked on logout | **PASSED** |

---

## 2. Dialog & Modal Behavior Verification

- **Focus Management**: Modals mount at DOM root via portal/fixed overlays with high z-index (`z-50`).
- **Dismissal Controls**:
  - Close icon button (`aria-label="Close dialog"`).
  - Backdrop overlay click dismisses modal.
  - Keyboard `Escape` key dismisses modal instantly.
- **Form State Reset**: Closing and reopening modals resets input fields and error states to initial clean values.
