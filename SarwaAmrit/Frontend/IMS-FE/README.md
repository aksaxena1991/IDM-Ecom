# Shell-Base-FE

NectorNest base micro-frontend (`nn_base`) — auth + operations dashboard.

Migrated from `nectorNest-IMS/nn-base` into a feature-sliced layout.

## Layout

```text
Shell-Base-FE/src/
├── core/styles/auth.css
├── components/          # AuthLayout, ForgotPasswordModal
├── features/
│   ├── auth/pages/      # LoginPage, SignupPage
│   └── dashboard/       # DashboardPage + screens/*
├── App.tsx
├── main.tsx
└── index.ts
```

## Run

```bash
cd SarwaAmrit/Frontend/Shell-Base-FE
npm install
npm run dev        # http://127.0.0.1:3001
npm run typecheck
npm run build
```

## Federation exposes (`nn_base`)

| Expose | Path |
|--------|------|
| `./App` | `src/App.tsx` |
| `./LoginPage` | `src/features/auth/pages/LoginPage.tsx` |
| `./SignupPage` | `src/features/auth/pages/SignupPage.tsx` |
| `./ForgotPasswordModal` | `src/components/ForgotPasswordModal.tsx` |
| `./AuthLayout` | `src/components/AuthLayout.tsx` |

Design system: `@thoughtstream/ui` → `../DesignSystem/thoughtstream-ui`.
