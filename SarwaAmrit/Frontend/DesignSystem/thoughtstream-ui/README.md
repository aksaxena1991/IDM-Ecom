# @thoughtstream/ui

ThoughtStream design system — tokens, theme, and component library with Storybook.

## Layout

```text
thoughtstream-ui/src/
├── tokens/
├── styles/          # theme.css, liquid-glass.css, styles.css
├── components/
│   ├── typography/
│   ├── actions/
│   ├── pickers/
│   ├── display/
│   ├── feedback/
│   ├── overlays/
│   ├── navigation/
│   ├── utilities/
│   ├── theme/       # ThemeProvider
│   ├── calendar/    # reserved (internal)
│   └── charts/
├── docs/
│   ├── Overview.mdx
│   └── templates/
├── index.ts
└── styles.css       # package entry (@thoughtstream/ui/styles.css)
```

## Scripts

```bash
cd SarwaAmrit/Frontend/DesignSystem/thoughtstream-ui
npm install
npm run typecheck
npm run build
npm run storybook   # http://localhost:6006
```
