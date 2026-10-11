export const colors = {
  brand: {
    primary: '#2BA8A2',
    primaryLight: '#3CC4BD',
    primaryDark: '#1E8C86',
    primaryBg: '#E8F6F5',
    accent: '#FFD23F',
    accentLight: '#FFE47A',
    accentDark: '#E6B800',
    coral: '#EF6C4A',
    coralLight: '#FF8A6A',
    coralDark: '#D45233',
    cream: '#FFF8E7',
    sky: '#5DADE2',
  },
  surface: {
    base: '#EFF8F7',
    card: '#FFFFFF',
    cream: '#FFF8E7',
  },
  semantic: {
    success: '#27AE60',
    error: '#E74C3C',
    info: '#5DADE2',
    warning: '#EF6C4A',
  },
} as const;

export type Colors = typeof colors;
