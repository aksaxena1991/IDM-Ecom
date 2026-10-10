# IMS-FE — Inventory micro-frontend

NectorNest inventory remote (`nn_ims`) built with React + TypeScript + Vite Module Federation and `@thoughtstream/ui`.

## Directory layout

```text
IMS-FE/src/
├── core/styles/ims.css
├── features/
│   ├── shell/pages/ImsShell.tsx
│   ├── catalog/pages/CatalogPage.tsx
│   ├── stock/pages/StockPage.tsx
│   ├── receiving/pages/ReceivingPage.tsx
│   └── adjustments/pages/AdjustmentsPage.tsx
├── App.tsx
├── main.tsx
└── index.ts
```

## Run

```bash
cd SarwaAmrit/Frontend/IMS-FE
npm install
npm run dev        # http://127.0.0.1:3002
npm run typecheck
npm run build
```

## Federation exposes

| Expose | Path |
|--------|------|
| `nn_ims/App` | `./src/App.tsx` |
| `nn_ims/ImsShell` | `./src/features/shell/pages/ImsShell.tsx` |
| `nn_ims/CatalogPage` | `./src/features/catalog/pages/CatalogPage.tsx` |
| `nn_ims/StockPage` | `./src/features/stock/pages/StockPage.tsx` |
| `nn_ims/ReceivingPage` | `./src/features/receiving/pages/ReceivingPage.tsx` |
| `nn_ims/AdjustmentsPage` | `./src/features/adjustments/pages/AdjustmentsPage.tsx` |

Remote entry (after build/preview): `http://127.0.0.1:3002/assets/remoteEntry.js`
