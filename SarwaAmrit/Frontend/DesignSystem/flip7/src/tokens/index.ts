import { colors } from './colors';
import { typography } from './typography';
import { spacing, radii, shadows } from './spacing';

export * from './colors';
export * from './typography';
export * from './spacing';

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} as const;

export type Flip7Tokens = typeof tokens;
export default tokens;
