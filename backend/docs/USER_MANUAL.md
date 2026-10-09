# SSO Backend — Feature User Manual

Operator and developer guide for the **FastAPI SSO backend** (http://localhost:8000).

For the product feature matrix see [docs/FEATURES.md](../../docs/FEATURES.md).  
For integrating external clients see [CLIENT_INTEGRATION_GUIDE.md](./CLIENT_INTEGRATION_GUIDE.md).

---

## 1. What this backend does

The SSO service is a modular monolith that provides:

- **Identity** — tenants, users, password auth (Argon2id), groups
- **OIDC IdP** — Authorization Code + PKCE, refresh rotation, userinfo, JWKS (ES256)
- **SAML IdP** — SSO + metadata + assertion anti-replay
- **Sessions** — Postgres SoR + Redis cache, logout, MFA / admin step-up
- **Access control** — RBAC (multi-role) + ABAC (attributes) + PBAC (policies)
- **Admin API** — apps, users, roles, policies, evaluate, audit, sync cursors
- **SCIM 2.0** — Users / Groups provisioning
- **Observability basics** — health, readiness, audit stream, optional workers

---

## 2. Quick start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

docker compose up -d          # Postgres :5433, Redis :6379
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

| URL | Purpose |
|-----|---------|
| http://localhost:8000/docs | Interactive OpenAPI |
| http://localhost:8000/healthz | Liveness |
| http://localhost:8000/readyz | Readiness |
| http://localhost:8000/login | Hosted login HTML |
| http://localhost:8000/signup | Hosted signup HTML |
| http://localhost:8000/.well-known/openid-configuration | OIDC discovery |

### Demo seed credentials

Configured via env when running `python scripts/seed.py` (see `.env.example`):

| Item | Env | Default |
|------|-----|---------|
| Admin email | `SEED_ADMIN_EMAIL` | `admin@example.com` |
| Password | `SEED_ADMIN_PASSWORD` | `ChangeMe-Admin-2026!` |
| SCIM bearer | `SEED_SCIM_TOKEN` | `scim-demo-token-change-me` |
| Tenant slug | — | `demo` |
| OIDC client_id | — | `demo-oidc-app` |
| Redirect URI | — | `http://localhost:3000/callback` |
| SAML client_id | — | `demo-saml-app` |
| Seeded roles | — | `admin`, `user`, `app_operator` |

Password and SCIM token are printed only when `SEED_PRINT_SECRETS=1`. Metrics: `GET /metrics` with `Authorization: Bearer $METRICS_TOKEN`.

---

## 3. Feature manuals by area

### 3.1 Hosted login & signup

| Endpoint | Method | Use |
|----------|--------|-----|
| `/login` | GET/POST | HTML form login (sets session cookie) |
| `/login/json` | POST | API login for SPA / scripts |
| `/signup` | GET/POST | HTML signup |
| `/signup/json` | POST | API signup |

**JSON login body:**

```json
{
  "email": "user@example.com",
  "password": "secret",
  "tenant_slug": "demo",
  "mfa_code": "123456"
}
```

**Behavior notes:**

- Passwords hashed with Argon2id.
- Failed logins are rate-limited / lockable via Redis.
- If TOTP is enrolled, MFA code is required.
- Signup assigns the system **`user`** role when present.
- Successful login creates a **session** (cookie name from settings).

---

### 3.2 OIDC (OpenID Connect)

| Endpoint | Use |
|----------|-----|
| `GET /.well-known/openid-configuration` | Discovery |
| `GET /.well-known/jwks.json` | Public signing keys |
| `GET /oauth2/authorize` | Authorization Code + PKCE |
| `POST /oauth2/token` | Code exchange / refresh |
| `GET /oauth2/userinfo` | Identity claims |

**Happy path:**

1. Client generates PKCE verifier/challenge and `state`.
2. Redirect user to `/oauth2/authorize` with `client_id`, `redirect_uri`, `code_challenge`, `scope`.
3. User authenticates (session); backend checks **`app:access`**.
4. Redirect with `code` → client posts to `/oauth2/token`.
5. Receive `access_token`, `id_token`, `refresh_token`.
6. Call `/oauth2/userinfo` with Bearer access token.

**Claims of interest:** `sub`, `email`, `name`, `groups`, `roles`, `permissions`, `attributes`, `tenant_id`, `is_admin`, `sid`, `scope`.

**Denial:** If PBAC denies `app:access`, authorize/token fails with `access_denied` (not a credential error).

---

### 3.3 Sessions & logout

| Endpoint | Use |
|----------|-----|
| `GET /session/me` | Session metadata (cookie) |
| `POST /session/logout` | Single logout |

Sessions track idle expiry, absolute expiry, `mfa_verified_at`, and `admin_step_up_at`.

---

### 3.4 MFA (TOTP)

| Endpoint | Use |
|----------|-----|
| `POST /mfa/totp/enroll` | Start enrollment (session required) |
| `POST /mfa/totp/verify` | Confirm code; refresh MFA / step-up |

**Admin step-up:** Any admin **write** (POST/PUT/PATCH/DELETE on `/v1/*`) requires `admin_step_up_at` within the last **15 minutes**. Otherwise response is `401` with `challenge: mfa_step_up`.

---

### 3.5 SAML

| Endpoint | Use |
|----------|-----|
| `GET /saml/metadata/{tenant_slug}` | IdP metadata |
| `GET` / `POST /saml/sso` | SAML SSO |

Register apps with `protocol: "saml"` and config keys such as `acs_url`, `entity_id`, `audience`.  
`app:access` (assignments → RBAC/ABAC/PBAC) applies before issuing assertions. Assertion IDs are cached in Redis (`sso:saml:replay:*`) and also written to `saml_assertion_replays` for durability.

---

### 3.6 RBAC (roles)

Admins create roles; users may hold **many** roles.

| Endpoint | Use |
|----------|-----|
| `GET /v1/roles` | List roles |
| `POST /v1/roles` | Create role + permissions |
| `GET /v1/roles/{id}` | Get one |
| `PATCH /v1/roles/{id}` | Update description / permissions |
| `DELETE /v1/roles/{id}` | Delete (non-system only) |
| `GET /v1/users/{id}/roles` | Roles on a user |
| `PUT /v1/users/{id}/roles` | Replace role assignments |

**Create role:**

```http
POST /v1/roles
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "name": "finance_ops",
  "description": "Finance operators",
  "permissions": ["reports:read", "apps:read"]
}
```

**Assign roles:**

```http
PUT /v1/users/{user_id}/roles
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{ "role_ids": ["<uuid>", "<uuid>"] }
```

**Admin gate:** `users.is_admin` **or** permission `admin:access` (usually via role `admin`).

Role names and permissions appear in tokens/userinfo and as `subject.roles` / `subject.permissions` in policy evaluation.

---

### 3.7 ABAC (attributes)

| Endpoint | Use |
|----------|-----|
| `GET` / `PUT /v1/users/{id}/attributes` | Subject attributes |
| `GET` / `PUT /v1/apps/{id}/attributes` | Resource attributes |

```http
PUT /v1/users/{user_id}/attributes
Authorization: Bearer <admin_access_token>

{ "attributes": { "department": "engineering", "clearance": 3 } }
```

Custom keys are exposed on userinfo as `attributes` and in policies as `subject.<key>` / `resource.<key>`.

Built-ins (not stored in attribute tables): `email`, `is_admin`, `groups`, `roles`, `permissions`, `status`.

---

### 3.8 PBAC (policies)

| Endpoint | Use |
|----------|-----|
| `GET /v1/policies` | List |
| `POST /v1/policies` | Create |
| `PATCH /v1/policies/{id}` | Update |
| `DELETE /v1/policies/{id}` | Delete |
| `POST /v1/access/evaluate` | Dry-run decision |

**Combining algorithm (deny-overrides):**

1. No enabled policy for the action → **allow**
2. Matching **deny** wins
3. Else matching **allow**
4. Else **deny** (“No access policy allows this request”)

**Example — allow by role:**

```json
{
  "name": "operators-only",
  "effect": "allow",
  "priority": 20,
  "enabled": true,
  "actions": ["app:access"],
  "resource_match": { "client_id": "demo-oidc-app" },
  "conditions": {
    "all": [
      { "attr": "subject.roles", "op": "contains", "value": "app_operator" }
    ]
  }
}
```

**Operators:** `eq`, `neq`, `in`, `not_in`, `contains`, `gte`, `lte`, `gt`, `lt`, `exists`, `starts_with`  
**Paths:** `subject.*`, `resource.*`, `environment.hour`, `environment.weekday`

**Dry-run:**

```http
POST /v1/access/evaluate
Authorization: Bearer <admin_access_token>

{
  "user_id": "<uuid>",
  "client_id": "demo-oidc-app",
  "action": "app:access"
}
```

---

### 3.9 Applications (admin)

| Endpoint | Use |
|----------|-----|
| `GET /v1/apps` | List |
| `POST /v1/apps` | Create OIDC/SAML app |
| `PATCH /v1/apps/{id}` | Update name/status/config |
| `PUT /v1/apps/{id}/assignments` | Set user/group assignments |

OIDC apps need `redirect_uris` (no wildcards). SAML apps need ACS / entity / audience in `config`.

---

### 3.10 Users & audit (admin)

| Endpoint | Use |
|----------|-----|
| `GET /v1/users` | Cursor-paginated search (`q`, `page_size`, `cursor`) |
| `GET /v1/audit-events` | Audit stream (`format=csv` for export) |

All admin writes are audited (e.g. `role.create`, `user.roles.set`, `user.attributes.set`).

**Auth for `/v1/*`:** Bearer access token for an admin principal. Prefer scope including `admin` when using the portal client.

---

### 3.11 SCIM provisioning

Base path: `/scim/v2`  
Auth: `Authorization: Bearer <scim_token>` (from `SEED_SCIM_TOKEN` / `POST /v1/scim-tokens`)

| Resource | Operations |
|----------|------------|
| `/Users` | List, create, get, put, patch, delete |
| `/Groups` | List, create, get |

Deactivating a user should revoke active sessions.

---

### 3.12 Sync cursors (stub)

| Endpoint | Use |
|----------|-----|
| `GET /v1/sync-cursors` | List resume tokens |
| `PUT /v1/sync-cursors/{source}` | Upsert `last_token` for a source |

Used as a hook for incremental directory sync jobs.

---

### 3.13 Health & workers

| Endpoint | Use |
|----------|-----|
| `GET /healthz` | Process up |
| `GET /readyz` | Dependencies ready |

Optional:

```bash
python -m app.workers.audit_writer
python -m app.workers.retention
```

---

## 4. Access control cheat sheet

| Layer | Configure via | Evaluated as |
|-------|---------------|--------------|
| RBAC | `/v1/roles`, `/v1/users/{id}/roles` | `subject.roles`, `subject.permissions` |
| ABAC | `/v1/users/{id}/attributes`, `/v1/apps/{id}/attributes` | `subject.*` / `resource.*` custom keys |
| PBAC | `/v1/policies` | Deny-overrides over the above + environment |

**When is `app:access` checked?** OIDC authorize, token issue (incl. refresh), SAML SSO.

**If users cannot log into apps after enabling policies:** ensure an allow policy matches (seed `allow-active-users`), or re-run `python scripts/seed.py`.

---

## 5. Typical operator workflows

### Register a new OIDC client for your product

1. `POST /v1/apps` with name, `protocol: "oidc"`, redirect URIs.
2. Optionally set resource attributes.
3. Point your app at discovery URL and new `client_id`.
4. Dry-run evaluate for a test user.

### Create a custom role and gate an app

1. `POST /v1/roles` with permissions.
2. `PUT /v1/users/{id}/roles` with that role id.
3. `POST /v1/policies` with `subject.roles` `contains` your role name.
4. `POST /v1/access/evaluate` to verify.

### Promote an admin without the `is_admin` flag

1. Assign role `admin` (includes `admin:access`), or any role with `admin:access`.
2. User obtains a new access token.
3. Admin APIs succeed (writes still need MFA step-up).

---

## 6. Tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Access-control and RBAC coverage live under `tests/test_access_control.py` and `tests/test_rbac.py`.

---

## 7. Related docs

| Doc | Location |
|-----|----------|
| Feature catalog | [docs/FEATURES.md](../../docs/FEATURES.md) |
| Frontend user manual | [frontend/docs/USER_MANUAL.md](../../frontend/docs/USER_MANUAL.md) |
| Client integration | [CLIENT_INTEGRATION_GUIDE.md](./CLIENT_INTEGRATION_GUIDE.md) |
| Database tables | [DATABASE_TABLES.md](./DATABASE_TABLES.md) |
| Database schema (columns) | [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| Backend README | [../README.md](../README.md) |
