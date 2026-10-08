# SSO Portal (React + TypeScript)

Frontend for the custom SSO backend: login (SSO or email/password), register, and a dashboard that shows the signed-in user from `/oauth2/userinfo`.

## Prerequisites

1. SSO backend running on `http://localhost:8000`
2. Demo OIDC app seeded with redirect `http://localhost:3000/callback`

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Auth flows

- **Continue with SSO** — OIDC Authorization Code + PKCE against the backend
- **Email / password** — `POST /login/json` (sets SSO session), then the same OIDC redirect to obtain tokens
- **Register** — `POST /signup/json`, then OIDC redirect
- **Dashboard** — loads claims from `GET /oauth2/userinfo`

## Config

See `.env`:

| Variable | Default |
|----------|---------|
| `VITE_SSO_BASE_URL` | `http://localhost:8000` |
| `VITE_OIDC_CLIENT_ID` | `demo-oidc-app` |
| `VITE_OIDC_REDIRECT_URI` | `http://localhost:3000/callback` |
