export const lightColors = {
  brand: {
    primary: '#78716C', // Stone — anchors UI elements, links, icons
    secondary: '#A8A29E', // Sage — supporting accents, dividers
    tertiary: '#1C1917', // Warm Black — emphasis, strong headings
  },
  surface: {
    background: '#FAFAF9', // Warm white page background
    surface: '#F5F5F4', // Card and section backgrounds
    surfaceRaised: '#EFEDEB', // Hover states, subtle callout blocks
  },
  content: {
    textPrimary: '#1C1917', // Body copy, headings
    textSecondary: '#57534E', // Bylines, metadata, captions
    textTertiary: '#A8A29E', // Placeholders, disabled labels
  },
  border: {
    subtle: '#E7E5E4',
    medium: '#D6D3D1',
    strong: '#A8A29E',
  },
  semantic: {
    success: '#65A30D',
    warning: '#CA8A04',
    error: '#DC2626',
    info: '#78716C',
  },
  status: {
    success: {
      background: '#F0FDF4',
      text: '#65A30D',
      border: '#BBF7D0',
    },
    warning: {
      background: '#FEFCE8',
      text: '#CA8A04',
      border: '#FEF08A',
    },
    error: {
      background: '#FEF2F2',
      text: '#DC2626',
      border: '#FECACA',
    },
  },
  button: {
    primary: {
      bg: '#78716C',
      text: '#FAFAF9',
      border: '#78716C',
      hover: '#57534E',
      active: '#44403C',
    },
    secondary: {
      bg: 'transparent',
      text: '#78716C',
      border: '#D6D3D1',
      hover: '#F5F5F4',
      active: '#E7E5E4',
    },
    ghost: {
      bg: 'transparent',
      text: '#78716C',
      border: 'transparent',
      hover: '#F5F5F4',
      active: '#E7E5E4',
    },
    destructive: {
      bg: '#DC2626',
      text: '#FAFAF9',
      border: '#DC2626',
      hover: '#B91C1C',
      active: '#991B1B',
    },
  },
} as const;

export const darkColors = {
  brand: {
    primary: '#A8A29E', // Muted stone for dark backgrounds
    secondary: '#78716C', // Supporting accents
    tertiary: '#FAFAF9', // Warm white — high contrast headings
  },
  surface: {
    background: '#1C1917', // Warm black page background
    surface: '#292524', // Elevated card / section backgrounds
    surfaceRaised: '#36322F', // Hover states, subtle callout blocks
  },
  content: {
    textPrimary: '#FAFAF9', // Body copy, headings
    textSecondary: '#D6D3D1', // Bylines, metadata, captions
    textTertiary: '#78716C', // Placeholders, disabled labels
  },
  border: {
    subtle: '#2E2A27', // Hairline divider in dark
    medium: '#44403C',
    strong: '#78716C',
  },
  semantic: {
    success: '#84CC16',
    warning: '#EAB308',
    error: '#EF4444',
    info: '#A8A29E',
  },
  status: {
    success: {
      background: '#14532D40',
      text: '#86EFAC',
      border: '#166534',
    },
    warning: {
      background: '#713F1240',
      text: '#FDE047',
      border: '#854D0E',
    },
    error: {
      background: '#7F1D1D40',
      text: '#FCA5A5',
      border: '#991B1B',
    },
  },
  button: {
    primary: {
      bg: '#FAFAF9',
      text: '#1C1917',
      border: '#FAFAF9',
      hover: '#E7E5E4',
      active: '#D6D3D1',
    },
    secondary: {
      bg: 'transparent',
      text: '#FAFAF9',
      border: '#44403C',
      hover: '#292524',
      active: '#36322F',
    },
    ghost: {
      bg: 'transparent',
      text: '#FAFAF9',
      border: 'transparent',
      hover: '#292524',
      active: '#36322F',
    },
    destructive: {
      bg: '#DC2626',
      text: '#FAFAF9',
      border: '#DC2626',
      hover: '#B91C1C',
      active: '#991B1B',
    },
  },
} as const;

export const colors = lightColors;

export type Colors = typeof lightColors;
export type DarkColors = typeof darkColors;
