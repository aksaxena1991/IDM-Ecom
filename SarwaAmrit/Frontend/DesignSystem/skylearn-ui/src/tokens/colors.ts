const lightSurfaces = {
  background: '#FFFFFF',
  DEFAULT: '#F8FAFC',
  elevated: '#FFFFFF',
  sunken: '#F1F5F9',
} as const;

const lightInk = {
  DEFAULT: '#0F172A',
  muted: '#475569',
  subtle: '#94A3B8',
  faint: '#CBD5E1',
} as const;

const brand = {
  sky: {
    DEFAULT: '#3B82F6',
    bright: '#60A5FA',
    deep: '#1D4ED8',
    soft: '#DBEAFE',
  },
  sun: {
    DEFAULT: '#FBBF24',
    bright: '#FCD34D',
    deep: '#D97706',
    soft: '#FEF3C7',
  },
  leaf: {
    DEFAULT: '#22C55E',
    soft: '#DCFCE7',
    deep: '#16A34A',
  },
  coral: {
    DEFAULT: '#F87171',
    soft: '#FEE2E2',
  },
  berry: {
    DEFAULT: '#A855F7',
    soft: '#F3E8FF',
  },
} as const;

export const colors = {
  ...brand,
  surface: lightSurfaces,
  ink: lightInk,
  outline: {
    DEFAULT: '#E2E8F0',
    strong: '#94A3B8',
  },
} as const;

/** Resolved token values for `data-color-scheme="dark"` (see theme-dark.css). */
export const colorsDark = {
  sky: {
    DEFAULT: '#60A5FA',
    bright: '#93C5FD',
    deep: '#3B82F6',
    soft: '#1E3A8A',
  },
  sun: brand.sun,
  leaf: {
    DEFAULT: '#4ADE80',
    soft: '#14532D',
    deep: '#22C55E',
  },
  coral: {
    DEFAULT: '#FCA5A5',
    soft: '#450A0A',
  },
  berry: {
    DEFAULT: '#C084FC',
    soft: '#3B0764',
  },
  surface: {
    background: '#0B1220',
    DEFAULT: '#141C2E',
    elevated: '#1A2438',
    sunken: '#0F172A',
  },
  ink: {
    DEFAULT: '#F1F5F9',
    muted: '#CBD5E1',
    subtle: '#94A3B8',
    faint: '#64748B',
  },
  outline: {
    DEFAULT: '#334155',
    strong: '#64748B',
  },
} as const;

export const colorSchemes = {
  light: colors,
  dark: colorsDark,
} as const;

export type Colors = typeof colors;
export type ColorsDark = typeof colorsDark;
