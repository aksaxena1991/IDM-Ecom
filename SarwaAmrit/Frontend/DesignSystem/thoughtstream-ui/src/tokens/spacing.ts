export const spacing = {
  baseUnit: '12px',
  scale: {
    1: '12px',
    2: '24px',
    3: '36px',
    4: '48px',
    5: '60px',
    6: '72px',
    8: '96px',
    10: '120px',
  },
  component: {
    paddingSmall: '12px',
    paddingMedium: '24px',
    paddingLarge: '48px',
  },
  section: {
    mobile: '60px',
    tablet: '84px',
    desktop: '120px',
  },
  content: {
    maxReadingWidth: '680px',
  },
} as const;

export const radii = {
  none: '0px',
  small: '0px',
  medium: '0px',
  large: '0px',
  xl: '0px',
  full: '9999px', // Avatars and Radio Buttons only
} as const;

export const shadows = {
  none: 'none',
  focusRing: '0 0 0 2px #FAFAF9, 0 0 0 4px #78716C',
  focusRingError: '0 0 0 2px #FAFAF9, 0 0 0 4px #DC2626',
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Shadows = typeof shadows;
