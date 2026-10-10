import { colors, lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, radii, shadows } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export const tokens = {
  colors,
  lightColors,
  darkColors,
  typography,
  spacing,
  radii,
  shadows,
} as const;

export type ThoughtStreamTokens = typeof tokens;
export default tokens;
