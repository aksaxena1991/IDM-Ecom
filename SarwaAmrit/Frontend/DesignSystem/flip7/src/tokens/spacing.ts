export const spacing = {
  baseUnit: '8rpx',
  xs: '8rpx',
  sm: '16rpx',
  md: '24rpx',
  lg: '32rpx',
  xl: '48rpx',
} as const;

export const radii = {
  sm: '8rpx',
  md: '16rpx',
  lg: '24rpx',
  xl: '32rpx',
  round: '999rpx',
} as const;

export const shadows = {
  sm: '0 2rpx 8rpx rgba(0, 0, 0, 0.08)',
  md: '0 4rpx 16rpx rgba(0, 0, 0, 0.12)',
  lg: '0 8rpx 32rpx rgba(0, 0, 0, 0.16)',
  card: '0 4rpx 20rpx rgba(43, 168, 162, 0.10)',
  coralGlow: '0 4rpx 20rpx rgba(239, 108, 74, 0.35)',
  tealGlow: '0 4rpx 20rpx rgba(43, 168, 162, 0.30)',
  accentGlow: '0 4rpx 20rpx rgba(255, 210, 63, 0.40)',
  skyGlow: '0 4rpx 16rpx rgba(93, 173, 226, 0.30)',
  focus: '0 0 0 4rpx rgba(43, 168, 162, 0.15)',
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Shadows = typeof shadows;
