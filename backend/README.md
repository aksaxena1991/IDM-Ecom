# SSO Backend (FastAPI)

Modular-monolith SSO backend implementing OIDC, SAML, SCIM, MFA, admin API, audit logging, and RBAC / ABAC / PBAC access control.

| Doc | Link |
|-----|------|
| **Backend user manual** | [docs/USER_MANUAL.md](docs/USER_MANUAL.md) |
| Feature catalog | [../docs/FEATURES.md](../docs/FEATURES.md) |
| Client integration guide | [docs/CLIENT_INTEGRATION_GUIDE.md](docs/CLIENT_INTEGRATION_GUIDE.md) |
| Database tables | [docs/DATABASE_TABLES.md](docs/DATABASE_TABLES.md) |
| Database schema | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) |
| Frontend portal | [../frontend/README.md](../frontend/README.md) · [user manual](../frontend/docs/USER_MANUAL.md) |
| Docs index | [../docs/README.md](../docs/README.md) |

## Stack

- Python 3.12+ / FastAPI
- PostgreSQL 16
- Redis 7
- Alembic migrations

## Quick start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

docker compose up -d   # Postgres on localhost:5433, Redis on 6379
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Login: http://localhost:8000/login
- Sign up: http://localhost:8000/signup
- Health: http://localhost:8000/healthz
- OIDC discovery: http://localhost:8000/.well-known/openid-configuration

### Demo credentials

Set via env before `python scripts/seed.py` (see `.env.example`). Defaults:

| Item | Env | Default |
|------|-----|---------|
| Admin email | `SEED_ADMIN_EMAIL` | `aksaxena1991@gmail.com` |
| Password | `SEED_ADMIN_PASSWORD` | `ChangeMe-Admin-2026!` |
| SCIM token | `SEED_SCIM_TOKEN` | `scim-demo-token-change-me` |
| OIDC client_id | — | `demo-oidc-app` |
| Redirect URI | — | `http://localhost:3000/callback` |

Secrets are not printed unless `SEED_PRINT_SECRETS=1`. Metrics scrape: `Authorization: Bearer $METRICS_TOKEN`.

## Access control (RBAC, ABAC, and PBAC)

| Layer | Storage | Runtime subject fields |
|-------|---------|------------------------|
| **RBAC** | `roles`, `role_permissions`, `user_roles` | `subject.roles`, `subject.permissions` |
| **ABAC** | `user_attributes`, `resource_attributes` | custom keys + built-ins |
| **PBAC** | `access_policies` | deny-overrides over the above |

Admins create roles (`POST /v1/roles`) and assign many roles per user (`PUT /v1/users/{id}/roles`). Signup assigns the system `user` role when present. Permission `admin:access` (via the `admin` role) grants admin API access alongside `users.is_admin`.

Subject attributes live on the user (`department`, `clearance`, …). Resource attributes live on the application (`sensitivity`, `owner_department`). Built-ins: `email`, `is_admin`, `groups`, `roles`, `permissions`, `status`; environment: `hour`, `weekday`.

On `app:access` the engine applies **deny-overrides**:

- No enabled policy for the action → **deny**
- Matching deny wins; else matching allow; else deny

Demo seed creates roles `admin`, `user`, `app_operator` and policies:

1. **`allow-active-users`** — baseline for active users
2. **`deny-restricted-without-clearance`** — ABAC deny on restricted apps
3. **`allow-admin-or-owning-department`** — admin flag/role/permission or department match
4. **`allow-app-operator-role`** — RBAC role `app_operator`

If authorize fails with **No access policy allows this request**, re-run `python scripts/seed.py` or add a matching allow policy.

```http
POST /v1/roles
Authorization: Bearer <admin access token>

{ "name": "finance_ops", "permissions": ["reports:read"] }
```

```http
PUT /v1/users/{user_id}/roles
Authorization: Bearer <admin access token>

{ "role_ids": ["<role-uuid>"] }
```

```http
POST /v1/policies
Authorization: Bearer <admin access token>

{
  "name": "finance-role-only",
  "effect": "allow",
  "priority": 10,
  "actions": ["app:access"],
  "resource_match": { "client_id": "demo-oidc-app" },
  "conditions": {
    "all": [{ "attr": "subject.roles", "op": "contains", "value": "finance_ops" }]
  }
}
```

Dry-run a decision with `POST /v1/access/evaluate` and `{ "user_id", "client_id", "action": "app:access" }`.

## Tests

```bash
pytest -q
```

## Workers (optional)

```bash
python -m app.workers.audit_writer
python -m app.workers.retention
```
