# IDM-FE — Identity portal (React + TypeScript)

Module Federation remote (`idm`) for the SSO / identity backend. Lives under `SarwaAmrit/Frontend/IDM-FE`.

## Directory layout

```text
IDM-FE/src/
├── core/                 # API clients, config, jwt, permissions, theme
├── components/           # Shared shell, route guards, step-up MFA
├── features/
│   ├── auth/             # Login, register, callback, AuthContext, PKCE
│   ├── workspace/        # Dashboard
│   ├── security/         # TOTP / session MFA
│   └── admin/            # apps, users, roles, groups, policies, access, audit
├── App.tsx / AppRoutes.tsx
├── IdmRoot.tsx / bootstrap.tsx / mount.tsx
└── main.tsx
```

## Run (standalone)

```bash
# Backend on :8000 first (e.g. SarwaAmrit/Backend/SSO-BE or repo backend/)
cd SarwaAmrit/Frontend/IDM-FE
npm install
npm run dev
```

Open http://localhost:3000

## Micro frontend

| Surface | URL |
|---------|-----|
| Standalone / remote entry | http://localhost:3000 (`/remoteEntry.js`) |
| Host shell | http://localhost:3003 |

Exposed: `idm/IdmRoot`, `idm/App`, `idm/AppRoutes`, `idm/LoginPage`, `idm/RegisterPage`, `idm/DashboardPage`, `idm/AppLayout`, `idm/AuthProvider`, `idm/mount`.

```bash
cd SarwaAmrit/Frontend/IDM-FE && npm run dev
# host
cd shell && npm run dev
```

## Config

| Variable | Default |
|----------|---------|
| `VITE_SSO_BASE_URL` | `http://localhost:8000` |
| `VITE_OIDC_CLIENT_ID` | `demo-oidc-app` |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:3000/callback` |
| `VITE_OIDC_SCOPE` | `openid profile email groups admin` |

Design system: `@thoughtstream/ui` → `SarwaAmrit/Frontend/DesignSystem/thoughtstream-ui`.
