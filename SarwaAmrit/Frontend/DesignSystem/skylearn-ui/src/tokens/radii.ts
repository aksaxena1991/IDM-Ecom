export const radii = {
  input: 12,
  chip: 8,
  button: 16,
  card: 20,
  modal: 28,
  pill: 999,
} as const;

export type Radii = typeof radii;
