# ThoughtStream UI (`@thoughtstream/ui`)

> **Minimal, zen, distraction-free React design system and component library.**

Built for contemplative reading experiences, minimalist personal blogs, newsletters, and calm web applications.

---

## ✦ Design Philosophy

- **Generous White Space:** Margins and line heights are calibrated to let thoughts settle without claustrophobic density.
- **Sharp Geometric Restraint (0px Border Radius):** All buttons, cards, inputs, and chips feature crisp `0px` corners. Only avatars and radio button glyphs use circular rounding.
- **Flat Surface Hierarchy:** No drop shadows. Visual separation is accomplished exclusively through fine hairline borders (`#E7E5E4`, `#D6D3D1`) and subtle background shifts (`#FAFAF9` Warm White, `#F5F5F4` Surface).
- **Literary Typography:** Headings rendered in *Libre Baskerville*, body and UI copy in *Inter*, and code in *Source Code Pro*.
- **Optimal Reading Measure:** Text containers are naturally bounded to `680px` for optimal eye tracking and reading ease.

---

## 📦 Installation into Your Application

ThoughtStream components are packaged as standard ESM and CommonJS modules with complete TypeScript types and CSS.

```bash
# Using npm
npm install @thoughtstream/ui

# Using pnpm
pnpm add @thoughtstream/ui

# Using yarn
yarn add @thoughtstream/ui
```

### 1. Import Styles

Include the single stylesheet once at the root of your application (e.g. `main.tsx`, `index.tsx`, `_app.tsx`, or `app/layout.tsx`):

```tsx
import '@thoughtstream/ui/styles.css';
```

### 2. (Optional) Wrap with ThemeProvider

You can support **Light Theme**, **Dark Theme (Night Reading)**, and **System preference**:

```tsx
import { ThemeProvider } from '@thoughtstream/ui';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <YourAppContent />
    </ThemeProvider>
  );
}
```

Or toggle manually with the hook:

```tsx
import { useTheme, Button } from '@thoughtstream/ui';

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <Button variant="secondary" size="small" onClick={toggleTheme}>
      Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
    </Button>
  );
}
```

### 3. Use Components

All components are cleanly exported at root:

```tsx
import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Chip,
  Typography,
  Divider,
  Blockquote,
} from '@thoughtstream/ui';

export function EssayView() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <main style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px' }}>
      <Chip
        variant="filter"
        selected={bookmarked}
        onClick={() => setBookmarked(!bookmarked)}
      >
        {bookmarked ? 'Saved to Library' : 'Bookmark Essay'}
      </Chip>

      <Typography variant="display">The Architecture of Stillness</Typography>
      <Typography variant="body" measure>
        When interfaces remove decorative excess, words regain their native authority.
      </Typography>

      <Blockquote citation="Seneca">
        It is not the man who has too little, but the man who craves more, that is poor.
      </Blockquote>

      <Divider tone="subtle" spacing="large" />

      <Card variant="default">
        <CardHeader>
          <CardTitle>Subscribe to the Monograph</CardTitle>
        </CardHeader>
        <CardBody>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input placeholder="name@domain.com" />
            <Button variant="primary">Subscribe</Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
```

---

## 🎨 Design Tokens

ThoughtStream tokens are available both in TypeScript and as CSS variables:

### TypeScript Token Import:

```ts
import { tokens, colors, typography, spacing, radii, shadows } from '@thoughtstream/ui';

console.log(colors.brand.primary); // #78716C
console.log(spacing.content.maxReadingWidth); // 680px
console.log(radii.none); // 0px
```

### CSS Variables:

```css
.my-custom-container {
  background-color: var(--ts-color-bg); /* #FAFAF9 */
  color: var(--ts-color-text-primary);  /* #1C1917 */
  border: 1px solid var(--ts-border-subtle); /* #E7E5E4 */
  max-width: var(--ts-reading-max-width); /* 680px */
}
```

---

## 🛠 Available Components & Stories

| Component | Description | Design Specs |
|---|---|---|
| **Button** | Primary, Secondary, Ghost, Destructive | Sharp 0px corners, Inter 600, Stone palette |
| **Input** | Clean text input with leading/trailing icons, error, and helper states | 48px height, `#D6D3D1` border, calm double focus ring |
| **Card** | Default and Elevated cards with sub-components (`Header`, `Title`, `Body`, `Footer`) | Flat 0px corners, generous 36px padding |
| **Chip** | Interactive Filter Chips and semantic Status Chips (`success`, `warning`, `error`, `info`) | Sharp border, subtle pastel tints |
| **List** | Editorial list with leading icons, titles, and secondary metadata | 16px vertical padding, subtle hairline borders |
| **Checkbox** | Custom accessible checkbox with check and indeterminate dash states | 18px size, 0px border-radius, `#78716C` fill |
| **RadioButton** | Accessible radio button | 18px size, 9999px full circular rounding (permitted exception) |
| **Tooltip** | Accessible hover tooltips with sharp geometric arrow | `#1C1917` warm black, 300ms enter delay, 0ms exit |
| **Typography** | 9-level type scale (`display`, `headline`, `subhead`, `bodyLarge`, `body`, `bodySmall`, `caption`, `overline`, `code`) | Libre Baskerville + Inter + Source Code Pro |
| **Avatar** | Author profile images & initials | 9999px full circle rounding (permitted exception) |
| **Divider** | Hairline section and paragraph separators | 1px hairline in subtle, medium, or strong stone |
| **Blockquote** | Editorial pull quote | Libre Baskerville italic, 2px stone left border |
| **Panel (Iterative)** | Collapsible / sequential step panels (`PanelGroup`, `Panel`) | Numeric chapter markers, 0px border radius, hairline borders |
| **Modal** | Accessible dialogs (`Modal`, `ModalHeader`, `ModalTitle`, `ModalBody`, `ModalFooter`) | Sharp 0px corners, flat surface, warm backdrop blur, Escape listener |
| **Popover** | Floating anchored card for rich filters and quick setting surfaces | Multiple placements, click-outside & Escape dismissal |
| **Dropdown** | Action menu with icons, shortcuts, separators, and destructive options | Flat plane, 0px corners, subtle stone hover |
| **Select** | Single option combobox with optional search and clear actions | 48px height, 0px radius, stone border, calm double focus ring |
| **Multiselect** | Multi-tag selector with filter chips, search input, and checkboxes | Tag removals, 0px checkmarks, clear-all action |

---

## 🚀 Running Storybook Locally

To launch the interactive Storybook catalog with all components and reading experience templates:

```bash
# Start local Storybook development server on port 6006
npm run storybook
```

To build a static production bundle of the Storybook:

```bash
npm run build-storybook
```

To build the distributable library package (`dist/`):

```bash
npm run build:lib
```

---

## 📄 License

MIT © ThoughtStream
