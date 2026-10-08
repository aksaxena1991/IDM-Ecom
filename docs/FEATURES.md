# IDM-Ecom SSO — Feature Catalog

Complete list of product features for the **SSO backend** and **SSO Portal** (React frontend).

| App | Default URL | Docs |
|-----|-------------|------|
| Backend API | http://localhost:8000 | [Backend user manual](../backend/docs/USER_MANUAL.md) |
| Frontend portal | http://localhost:3000 | [Frontend user manual](../frontend/docs/USER_MANUAL.md) |
| Interactive API | http://localhost:8000/docs | OpenAPI / Swagger |
| Client integration | — | [CLIENT_INTEGRATION_GUIDE](../backend/docs/CLIENT_INTEGRATION_GUIDE.md) |
| Database tables | — | [DATABASE_TABLES](../backend/docs/DATABASE_TABLES.md) |

---

## 1. Authentication & sessions

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| Email / password login | Yes (`/login`, `/login/json`) | Yes (Login page) | Argon2id; tenant slug (default `demo`) |
| Hosted HTML login / signup | Yes (`/login`, `/signup`) | — | Browser forms on SSO host |
| JSON signup API | Yes (`/signup/json`) | Yes (Register) | Creates user; assigns default `user` role |
| OIDC Authorization Code + PKCE | Yes | Yes (SSO button + callback) | ES256 tokens |
| OIDC discovery & JWKS | Yes | Used by SPA | `/.well-known/*` |
| Refresh token rotation | Yes | Yes (silent refresh) | Reuse detection revokes family |
| Userinfo endpoint | Yes | Dashboard | Roles, permissions, attributes |
| Cookie SSO session | Yes (Postgres + Redis) | Cookie for session APIs | Idle + absolute expiry |
| Single logout | Yes (`/session/logout`) | Sign out | Revokes session / tokens |
| Login rate limit / lockout | Yes | Surfaces errors | Redis-backed |

---

## 2. Multi-factor authentication (MFA)

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| TOTP enroll | Yes | Security page | Returns secret + `otpauth://` URI |
| TOTP verify | Yes | Security page | Marks MFA / step-up on session |
| MFA at password login | Yes | Login MFA field | When factor enrolled |
| Admin step-up MFA | Yes | Modal on admin writes | Required for POST/PUT/PATCH/DELETE within 15 minutes |

---

## 3. Federation protocols

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| OIDC IdP (authorize / token / userinfo) | Yes | Acts as OIDC client (demo app) | PKCE required for public clients |
| SAML IdP SSO | Yes (`/saml/sso`) | — | SP- and IdP-initiated paths |
| SAML metadata | Yes (`/saml/metadata/{tenant}`) | — | Per-tenant metadata |
| Assertion anti-replay | Yes | — | `saml_assertion_replays` |
| `app:access` on federation | Yes | — | RBAC + ABAC + PBAC before tokens / assertion |

---

## 4. Access control (RBAC + ABAC + PBAC)

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| Multi-role RBAC | Yes | Roles + Users pages | Users may hold many roles |
| Role permissions | Yes | Roles page | e.g. `admin:access`, `apps:write` |
| Assign roles to users | Yes | Users → Roles | `PUT /v1/users/{id}/roles` |
| System roles | Yes (seed) | Listed as “system” | `admin`, `user` not deletable |
| ABAC user attributes | Yes | Users → Attributes | e.g. `department`, `clearance` |
| ABAC app attributes | Yes | Apps → Attributes | e.g. `sensitivity` |
| PBAC policies | Yes | Policies page | Deny-overrides combining algorithm |
| Access dry-run | Yes | Evaluate page | `POST /v1/access/evaluate` |
| Roles / permissions in tokens | Yes | Dashboard display | Claims + userinfo |

**Decision order on `app:access`:** load subject (roles, permissions, attrs) → load resource attrs → evaluate enabled policies → deny-overrides.

---

## 5. Application management

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| List / create / patch apps | Yes | Apps page | OIDC (and API supports SAML config) |
| Redirect URI validation | Yes | Create form | No wildcards |
| Enable / disable app | Yes | Apps page | `status` |
| App assignments (user/group) | Yes (API) | — | Entitlement registry |
| Resource attributes per app | Yes | Apps page | ABAC |

---

## 6. Directory & provisioning

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| User search (admin) | Yes | Users page | Cursor pagination |
| Groups & memberships | Yes | Shown on Dashboard | Claims `groups` |
| SCIM 2.0 Users / Groups | Yes | — | Bearer `scim_tokens` |
| Session revoke on deactivate | Yes | — | SCIM deactivate path |
| Sync cursors (stub) | Yes | — | `GET/PUT /v1/sync-cursors` |

---

## 7. Admin console & audit

| Feature | Backend | Frontend | Notes |
|---------|---------|----------|-------|
| Admin authorization | Yes | AdminRoute + nav | `is_admin` or `admin:access` |
| Admin rate limit | Yes | — | Per-admin Redis limit |
| Audit event stream | Yes | Audit page | JSON list |
| Audit CSV export | Yes | Audit page | `format=csv` |
| Health / readiness | Yes | — | `/healthz`, `/readyz` |

---

## 8. Portal UX (frontend-only product features)

| Feature | Route | Who |
|---------|-------|-----|
| Sign in (SSO or password) | `/login` | Everyone |
| Register | `/register` | Everyone |
| OIDC callback | `/callback` | After SSO |
| Dashboard (profile, RBAC, ABAC, session) | `/dashboard` | Signed-in users |
| Security (TOTP) | `/security` | Signed-in users |
| Admin Apps | `/admin/apps` | Admins |
| Admin Users | `/admin/users` | Admins |
| Admin Roles | `/admin/roles` | Admins |
| Admin Policies | `/admin/policies` | Admins |
| Access evaluate | `/admin/access` | Admins |
| Audit | `/admin/audit` | Admins |
| MFA step-up modal | Overlay | Admins on write |

---

## 9. Platform & operations

| Feature | Description |
|---------|-------------|
| Modular monolith | FastAPI routers: auth, SAML, session, admin, access, roles, SCIM |
| PostgreSQL 16 | System of record |
| Redis 7 | Sessions cache, auth codes, rate limits, revocation |
| Alembic | Migrations `001` → `003` |
| Demo seed | Tenant, admin, apps, roles, sample policies |
| Optional workers | Audit writer, retention job |
| CORS | Configurable for SPA origin `:3000` |
| RFC 7807 errors | Problem Details JSON |

---

## Related manuals

- [Frontend user manual](../frontend/docs/USER_MANUAL.md) — how to use the portal screens
- [Backend user manual](../backend/docs/USER_MANUAL.md) — how to run and operate the API
- [Client integration guide](../backend/docs/CLIENT_INTEGRATION_GUIDE.md) — integrate your own apps
- [Database tables](../backend/docs/DATABASE_TABLES.md) — what each table stores
