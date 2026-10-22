export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  24: 96,
  32: 128,
  containerMax: 1280,
  containerPaddingDesktop: 24,
  containerPaddingMobile: 20,
  gridGapMobile: 20,
  gridGapDesktop: 32,
  section: 48,
  tapMin: 56,
} as const;

export type Spacing = typeof spacing;
