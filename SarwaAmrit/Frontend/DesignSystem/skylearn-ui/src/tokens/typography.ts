export const typography = {
  fontFamily: {
    display: '"Hubot Sans", "Nunito", "Quicksand", system-ui, sans-serif',
    body: '"Atkinson Hyperlegible", "Nunito Sans", "Inter", system-ui, sans-serif',
    reading: '"Lexend Deca", "Source Serif 4", Georgia, serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  scale: {
    hero: { size: 56, lineHeight: 60, weight: 700 },
    h1: { size: 40, lineHeight: 48, weight: 700 },
    h2: { size: 32, lineHeight: 40, weight: 700 },
    h3: { size: 24, lineHeight: 32, weight: 600 },
    h4: { size: 19, lineHeight: 28, weight: 600 },
    bodyLarge: { size: 20, lineHeight: 32, weight: 400 },
    body: { size: 18, lineHeight: 28, weight: 400 },
    small: { size: 16, lineHeight: 24, weight: 400 },
    caption: { size: 14, lineHeight: 20, weight: 400 },
    score: { size: 56, lineHeight: 56, weight: 700 },
  },
  letterSpacingBody: '0.01em',
} as const;

export type TypographyScaleKey = keyof typeof typography.scale;
export type TypographyTokens = typeof typography;
