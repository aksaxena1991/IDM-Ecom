# SarwaAmrit

Workspace layout for the identity and inventory platform.

```
SarwaAmrit/
├── Backend/
│   ├── IMS-BE/                        # Node catalog API (:8010) + optional Django service
│   └── SSO-BE/
├── Frontend/
│   ├── DesignSystem/
│   │   └── thoughtstream-ui/   # @thoughtstream/ui
│   ├── DesignSystem/thoughtstream-ui/
│   ├── Shell-Base-FE/          # nn_base auth + ops dashboard
│   ├── IDM-FE/
│   └── IMS-FE/
├── .gitignore
└── README.md
```

| Path | Role |
|------|------|
| `Backend/SSO-BE` | SSO / identity API |
| `Backend/IMS-BE` | Inventory / product catalog API (Node + Prisma, :8010) |
| `Frontend/DesignSystem/thoughtstream-ui` | Shared design system (`@thoughtstream/ui`) |
| `Frontend/Shell-Base-FE` | Base remote (`nn_base`) — auth + ops dashboard (:3001) |
| `Frontend/IDM-FE` | Identity portal remote (feature-sliced React app) |
| `Frontend/IMS-FE` | Inventory remote (feature-sliced React app, port 3002) |
