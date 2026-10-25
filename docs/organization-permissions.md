# Professional Team & Multi-Roster Organization Permissions (RBAC)

## 1. Organization Architecture
Golden Snitch supports multi-roster esports organizations (e.g. Sentinels Operations) competing across multiple titles (VCT Americas, CS2 ESL Pro League, etc.).

### Database Entities
- `organizations`: Root organization record (`id`, `name`, `slug`, `tag`, `description`, `owner_id`).
- `organization_members`: Junction mapping `user_id` to `organization_id` with assigned `role`.
- `organization_invitations`: Secure, expiring invitation tokens (`email`, `role`, `token`, `expires_at`, `status`).

---

## 2. Server-Enforced RBAC Permission Matrix

| Operation / Feature | Owner (GM) | Manager | Head Coach | Talent Scout | Player | Viewer |
|---|---|---|---|---|---|---|
| Create Organization | Yes | No | No | No | No | No |
| Invite Staff Members | Yes | Yes | No | No | No | No |
| Manage Roster Vacancies | Yes | Yes | Yes | No | No | No |
| Run Candidate Fit Engine | Yes | Yes | Yes | Yes | No | No |
| Create Scouting Reports | Yes | Yes | Yes | Yes | No | No |
| Share Public Reports | Yes | Yes | Yes | Yes | No | No |
| View Financial Buyouts | Yes | Yes | No | No | No | No |
| Edit Own Player Profile | Yes | Yes | Yes | Yes | Yes | No |
| Review Profile Claims | Yes | No | No | No | No | No |
| Ingest CSV Datasets | Yes | Yes | Yes | Yes | No | No |

---

## 3. Onboarding & Member Invitation Protocol
1. **Invite Creation:** An owner or manager posts `POST /api/v1/organizations/{id}/invitations` with email and target role.
2. **Secure Token:** A cryptographically random URL-safe token (24 bytes) is generated with a 7-day expiration timestamp.
3. **Acceptance:** The invited user navigates to `/invite/:token` and invokes `POST /api/v1/invitations/{token}/accept`.
4. **Audit Trail:** The membership is recorded in `organization_members`, and an in-app notification is dispatched to the organization owner.
