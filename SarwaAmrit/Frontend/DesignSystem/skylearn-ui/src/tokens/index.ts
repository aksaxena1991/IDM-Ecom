import { colors } from './colors.js';
import { motion } from './motion.js';
import { radii } from './radii.js';
import { shadows } from './shadows.js';
import { spacing } from './spacing.js';
import { typography } from './typography.js';

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  motion,
} as const;

export type SkyLearnTokens = typeof tokens;

export { colors, typography, spacing, radii, shadows, motion };
export type { Colors } from './colors.js';
export type { TypographyTokens, TypographyScaleKey } from './typography.js';
export type { Spacing } from './spacing.js';
export type { Radii } from './radii.js';
export type { Shadows } from './shadows.js';
