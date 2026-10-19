# IMS-BE (Node + TypeScript)

Inventory management API — product catalog (categories and products schema via Prisma).

## Stack

- Node.js **22.12+** or **24+** (Prisma 7; Node 23 is not supported — use `.nvmrc` / `fnm use`)
- Express 5
- PostgreSQL 16
- Prisma 7

## Layout

```text
src/
├── index.ts                 # process entry
├── app.ts                   # Express app + route wiring
├── features/
│   ├── categories/          # vertical slice (live)
│   └── products/            # scaffold (not implemented)
├── infrastructure/database/
└── shared/config/
prisma/
product-catalog-service/     # legacy Django catalog (optional)
```

## Run locally

```bash
cd SarwaAmrit/Backend/IMS-BE
npm install
# If install fails on unsupported Node (e.g. v23): npm install --ignore-scripts && npm run build
docker compose up -d postgres
npm run db:migrate
npm run dev
```

If `db:migrate` reports **drift** (often a leftover `ProductStatus` enum without tables), reset local dev data:

```bash
npm run db:reset   # drops and reapplies migrations — dev only
```

Or remove the orphan object manually:

```bash
docker exec ims-be-postgres-1 psql -U product_catalog -d product_catalog \
  -c 'DROP TYPE IF EXISTS "ProductStatus" CASCADE;'
npm run db:migrate
```

- API: http://127.0.0.1:8010/api/v1/categories
- Health: http://127.0.0.1:8010/healthz
- Readiness: http://127.0.0.1:8010/readyz

Postgres is published on host port **5435** (avoids SSO `5433` and chatbot `5434`).

```bash
npm run build
npm start
```

Copy `.env.example` to `.env` if you need a fresh environment file.

## Quality tooling

TypeScript linting uses **ESLint** (`typescript-eslint`) — the maintained replacement for deprecated TSLint.

```bash
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check (CI)
npm test              # Jest (ESM + ts-jest)
```
