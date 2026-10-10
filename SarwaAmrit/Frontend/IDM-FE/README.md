# Sarwa Amrit IDM (React + TypeScript)

Frontend for the custom SSO backend.

| Doc | Link |
|-----|------|
| **Frontend user manual** | [docs/USER_MANUAL.md](docs/USER_MANUAL.md) |
| Feature catalog | [../docs/FEATURES.md](../docs/FEATURES.md) |
| Client integration guide | [../backend/docs/CLIENT_INTEGRATION_GUIDE.md](../backend/docs/CLIENT_INTEGRATION_GUIDE.md) |
| Docs index | [../docs/README.md](../docs/README.md) |

## Layout

Feature modules live under `src/features/` (`auth`, `workspace`, `security`, `admin`). Shared API, JWT, permissions, and theme tokens are in `src/core/`. Shell guards and layout are in `src/components/`.

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

## Run (standalone)

```bash
# Backend on :8000 first
cd ../backend && source .venv/bin/activate
docker compose up -d
uvicorn app.main:app --reload --port 8000

# Frontend
cd ../IDM-FE
npm install
npm run dev
```

Open http://localhost:3000

## Micro frontend

This app is a Module Federation **remote** (`idm`) and can also run standalone.

| Surface | URL |
|---------|-----|
| Standalone / remote entry | http://localhost:3000 (`/remoteEntry.js`) |
| Host shell | http://localhost:3003 |

Exposed modules: `idm/IdmRoot`, `idm/App`, `idm/AppRoutes`, `idm/LoginPage`, `idm/RegisterPage`, `idm/DashboardPage`, `idm/AppLayout`, `idm/AuthProvider`.

Hosts that share React can render `idm/IdmRoot` inside their own router.
Hosts that do not share React (typical Vite 8 + React 19 setup) should call `idm/mount`:

```ts
const { mount } = await import('idm/mount')
const unmount = mount(document.getElementById('idm-root')!)
```

```bash
# Terminal 1 — IDM remote
cd IDM-FE && npm run dev

# Terminal 2 — host shell
cd ../shell && npm install && npm run dev
```

Open http://localhost:3003 to load IDM through the shell.

Anubhav Saxena (from backend seed): see backend README.

## Config

| Variable | Default |
|----------|---------|
| `VITE_SSO_BASE_URL` | `http://localhost:8000` |
| `VITE_OIDC_CLIENT_ID` | `idm-oidc-app` |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:3000/callback` |
| `VITE_OIDC_SCOPE` | `openid profile email groups admin` |
