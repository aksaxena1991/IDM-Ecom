# SSO Backend (FastAPI)

Modular-monolith SSO backend implementing OIDC, SAML, SCIM, MFA, admin API, audit logging, and attribute/policy access control (ABAC and PBAC).

**Client integration guide (web / mobile / Electron / Polymer):** [docs/CLIENT_INTEGRATION_GUIDE.md](docs/CLIENT_INTEGRATION_GUIDE.md)

**React SPA (sibling app):** see [`../frontend/README.md`](../frontend/README.md) — login (SSO + email/password), register, dashboard.

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

| Item | Value |
|------|-------|
| Admin email | `aksaxena1991@gmail` |
| Password | `@Admin2026` |
| OIDC client_id | `demo-oidc-app` |
| Redirect URI | `http://localhost:3000/callback` |
| SCIM token | `scim-demo-token-change-me` |

## Access control (ABAC and PBAC)

Subject attributes live on the user (`department`, `clearance`, and any other key you set). Resource attributes live on the application (`sensitivity`, `owner_department`). Built-in subject fields (`email`, `is_admin`, `groups`, `status`) and environment fields (`hour`, `weekday`) are available in policies without being stored.

Policies are data. On `app:access` (OIDC authorize, token issue, and SAML SSO) the engine loads enabled policies for the tenant and applies **deny-overrides**:

- No enabled policy targets the action: allow (existing tenants keep working).
- A matching deny wins over any allow.
- Otherwise a matching allow grants access.
- If policies exist for the action and none match: deny (`No access policy allows this request`).

Demo seed creates:

1. **`allow-active-users`** (priority 1) — baseline allow for `subject.status == active`
2. **`deny-restricted-without-clearance`** (priority 100) — deny when app `sensitivity=restricted` and `clearance < 3`
3. **`allow-admin-or-owning-department`** (priority 10) — allow admins or matching department

It also sets the admin's department to `engineering` with clearance `5`, and marks demo apps `sensitivity=internal`, `owner_department=engineering`.

If login/authorize fails with **No access policy allows this request**, either disable/remove tenant policies for `app:access`, or ensure an allow policy matches (re-run `python scripts/seed.py` to add `allow-active-users`).

```http
PUT /v1/users/{user_id}/attributes
Authorization: Bearer <admin access token>

{ "attributes": { "department": "engineering", "clearance": 3 } }
```

```http
POST /v1/policies
Authorization: Bearer <admin access token>

{
  "name": "finance-only",
  "effect": "allow",
  "priority": 10,
  "actions": ["app:access"],
  "resource_match": { "client_id": "demo-oidc-app" },
  "conditions": {
    "all": [{ "attr": "subject.department", "op": "eq", "value": "finance" }]
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
