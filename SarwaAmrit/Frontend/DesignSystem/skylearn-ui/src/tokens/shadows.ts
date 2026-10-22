export const shadows = {
  card: '0 1px 0 var(--sl-color-outline)',
  cardHover: '0 8px 24px rgba(15, 23, 42, 0.06)',
  lessonActive: '0 12px 32px rgba(59, 130, 246, 0.15)',
  badgeGlow: '0 0 24px rgba(252, 211, 77, 0.4)',
  modal: '0 24px 48px rgba(15, 23, 42, 0.12)',
  skyHover: '0 8px 24px rgba(59, 130, 246, 0.12)',
} as const;

export type Shadows = typeof shadows;
