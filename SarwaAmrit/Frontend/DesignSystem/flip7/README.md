# Flip7 Design System

Retro-playful teal-coral-gold React + Storybook library for the Flip7 card-game scoring mini-program. Inspired by the original Flip7 packaging: vintage warmth, tactile game pieces, BounceBox energy, QuizForge competition.

## Run Storybook

```bash
cd SarwaAmrit/Frontend/DesignSystem/flip7
npm install
npm run storybook
```

Storybook serves on [http://localhost:6007](http://localhost:6007).

## Tokens

Storybook maps spec **rpx** to CSS via `--f7-rpx` (`1rpx = 1px` by default). Override with `ThemeProvider` `rpx`.

| Token | Value |
| --- | --- |
| Primary teal | `#2BA8A2` |
| Accent gold | `#FFD23F` |
| Coral | `#EF6C4A` |
| Cream | `#FFF8E7` |
| Sky | `#5DADE2` |
| Surface | `#EFF8F7` |
| Spacing base | `8rpx` |
| Touch minimum | `72rpx` |

Elevation is a **colored glow** system (`shadow-card`, `shadow-accent-glow`, `shadow-coral-glow`, `shadow-teal-glow`, `shadow-sky-glow`). Do not use plain black shadows on interactive controls.

## Components

- **Logo** — fan cards, skewed cream FLIP7 plate, folded ribbon
- **Button** — pill gold CTA, BOOM, Flip7 bonus, ghost
- **CounterButton** — 80×80rpx plus (teal) / minus (coral)
- **ScoringCard** — left-accent states: default / highlighted / BOOM
- **VictoryRanking** — silver 2nd, coral 3rd, default 4th+
- **SectionTitle** — emoji in a view container + dashed rule
- **Confetti / Crown** — victory motion

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run storybook` | Dev Storybook on :6007 |
| `npm run build-storybook` | Static Storybook |
| `npm run build` | Library bundle (`@flip7/ui`) |
| `npm run typecheck` | `tsc --noEmit` |
