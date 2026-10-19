# IMS-BE (Node + TypeScript)

Inventory management API — product catalog (categories and products schema via Prisma).

## Stack

- Node.js 20+
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
docker compose up -d postgres
npm run db:migrate
npm run dev
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
