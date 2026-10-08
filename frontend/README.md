# SSO Portal (React + TypeScript)

Frontend for the custom SSO backend.

**Full client integration guide** (web / mobile / Electron / Polymer):  
[../backend/docs/CLIENT_INTEGRATION_GUIDE.md](../backend/docs/CLIENT_INTEGRATION_GUIDE.md)

## Features

- **Login** — SSO (OIDC + PKCE) or email/password (+ MFA code when enrolled)
- **Register** — signup then OIDC token handshake
- **Dashboard** — userinfo profile, groups, RBAC roles/permissions, ABAC attributes, token scopes
- **Security** — TOTP enroll/verify and session MFA status
- **Admin** (users with `is_admin` or permission `admin:access`):
  - Apps (create OIDC app, enable/disable, resource attributes)
  - Users (search, subject attributes, multi-role assignment)
  - Roles (create/edit RBAC roles and permissions)
  - Policies (PBAC CRUD; conditions may use `subject.roles` / attributes)
  - Access evaluate (dry-run `app:access` across RBAC + ABAC + PBAC)
  - Audit log + CSV export
- **MFA step-up modal** — retries admin writes after `challenge: mfa_step_up`

## Run

```bash
# Backend on :8000 first
cd ../backend && source .venv/bin/activate
docker compose up -d
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000

Demo admin (from backend seed): see backend README.

## Config

| Variable | Default |
|----------|---------|
| `VITE_SSO_BASE_URL` | `http://localhost:8000` |
| `VITE_OIDC_CLIENT_ID` | `demo-oidc-app` |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:3000/callback` |
| `VITE_OIDC_SCOPE` | `openid profile email groups admin` |
