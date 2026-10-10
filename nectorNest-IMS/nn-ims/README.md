# nn-ims

NectorNest **Inventory Management System** micro-frontend.

Built with **React + TypeScript + Vite**, Module Federation (`remoteEntry.js`), and the **`@thoughtstream/ui`** design system (`Thought-Stream-Design-System`).

## Scripts

```bash
npm install
npm run dev        # http://127.0.0.1:3002
npm run build
npm run preview    # serves federation build on :3002
npm run typecheck
```

## Federation exposes

| Expose | Path |
| --- | --- |
| `nn_ims/App` | `./src/App.tsx` |
| `nn_ims/ImsShell` | `./src/pages/ImsShell.tsx` |
| `nn_ims/CatalogPage` | `./src/pages/CatalogPage.tsx` |
| `nn_ims/StockPage` | `./src/pages/StockPage.tsx` |
| `nn_ims/ReceivingPage` | `./src/pages/ReceivingPage.tsx` |
| `nn_ims/AdjustmentsPage` | `./src/pages/AdjustmentsPage.tsx` |

Remote entry (after build/preview): `http://127.0.0.1:3002/assets/remoteEntry.js`

## Design system

`@thoughtstream/ui` is linked via `file:../Thought-Stream-Design-System` and aliased to source in `vite.config.ts` / `tsconfig.json` (same pattern as `nn-base`).
