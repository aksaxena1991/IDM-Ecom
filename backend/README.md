# SSO Backend (FastAPI)

Modular-monolith SSO backend implementing OIDC, SAML, SCIM, MFA, admin API, and audit logging.

**Client integration guide (web / mobile / Electron / Polymer):** [docs/CLIENT_INTEGRATION_GUIDE.md](docs/CLIENT_INTEGRATION_GUIDE.md)

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

## Tests

```bash
pytest -q
```

## Workers (optional)

```bash
python -m app.workers.audit_writer
python -m app.workers.retention
```
