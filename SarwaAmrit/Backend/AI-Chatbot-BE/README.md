# AI Chatbot Platform (Node.js / Express)

Multi-application AI chat backend for SarwaAmrit. Uses **SSO-BE** for OIDC access tokens and enforces **per-application isolation** via registry + token audience matching.

## Phase 1 (current)

- Express + TypeScript API
- PostgreSQL + pgvector schema (migrations)
- SSO JWT validation (JWKS / ES256)
- Application registry (admin) + seeded IDM / IMS apps
- Scoped conversations and messages
- Chat endpoint with **mock** LLM gateway (real providers in Phase 2)
- Audit events for chat and admin actions

## Prerequisites

- Node.js 20+
- Docker (for local Postgres with pgvector)
- Running [SSO-BE](../SSO-BE) on `http://localhost:8000`

## Quick start

```bash
cd SarwaAmrit/Backend/AI-Chatbot-BE
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API base: `http://localhost:8100`

### Health

```bash
curl -s http://localhost:8100/health
```

### Chat (requires SSO access token)

Obtain an access token from IDM-FE login or OIDC token endpoint, then:

```bash
curl -s -X POST http://localhost:8100/api/v1/chat/messages \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"application_id":"idm","message":"How do I assign a role?"}'
```

The token **audience** must match the registered app's `sso_client_id` (e.g. `idm-oidc-app` for `application_id: idm`).

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/chat/messages` | User Bearer |
| GET | `/api/v1/conversations/:id?application_id=` | User Bearer |
| GET | `/api/v1/conversations/:id/messages?application_id=` | User Bearer |
| GET | `/api/v1/applications/:slug/capabilities` | User Bearer |
| POST | `/api/v1/admin/applications` | Admin Bearer |
| PUT | `/api/v1/admin/applications/:id/config` | Admin Bearer |
| GET | `/api/v1/admin/applications` | Admin Bearer |

## Tenant alignment with SSO

Chat `tenants` are separate from SSO DB. For local dev, seed creates a demo tenant UUID. To align JWT `tenant_id` with chat registry rows, re-seed with:

```bash
SEED_TENANT_ID=<uuid-from-sso-token-tenant_id> npm run db:seed
```

## Next phases

- Phase 2: OpenAI / Azure / self-hosted LLM adapters, SSE streaming
- Phase 3: Ingestion workers, embeddings, hybrid RAG
- Phase 4: Tool executor + IDM connectors + embeddable widget
- Phase 5: Observability dashboards, eval suites, production hardening
