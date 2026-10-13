# Chat FE — Sarwa Amrit AI Assistant

Standalone React app for the multi-application AI chat platform. Uses **@thoughtstream/ui** and **SSO-BE** (OIDC + PKCE, same pattern as IDM-FE).

## Ports

| Service | URL |
|---------|-----|
| Chat FE | http://127.0.0.1:3003 |
| AI Chatbot API | http://localhost:8100 |
| SSO | http://localhost:8000 |

## Setup

```bash
cd SarwaAmrit/Frontend/Chat-FE
cp .env.example .env
npm install
npm run dev
```

Re-run SSO seed so IDM/IMS OIDC apps allow `http://localhost:3003/callback`:

```bash
cd SarwaAmrit/Backend/SSO-BE
python scripts/seed.py
```

Align chat backend tenant with JWT `tenant_id` after first login:

```bash
cd SarwaAmrit/Backend/AI-Chatbot-BE
SEED_TENANT_ID=<tenant_id_from_token> npm run db:seed
```

## Sign-in flow

1. Set `VITE_OIDC_CLIENT_ID=ai-chat-oidc-app` (default). Re-run SSO seed so this client exists.
2. Choose assistant (**IDM** or **IMS**) — sets chat `application_id` only, not the OIDC client.
3. Password + session cookie, then PKCE token exchange, or **Continue with SSO (PKCE)**.
4. Redirect URI is `${window.location.origin}/callback` (both `localhost` and `127.0.0.1` are seeded).

## Stack

- Vite + React 19 + React Router 7
- ThoughtStream design system (local `file:` dependency)
- Chat API client → `AI-Chatbot-BE`
