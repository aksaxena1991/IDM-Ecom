/**
 * Flip7 type scale. Values are rpx from the mini-program spec;
 * Storybook maps 1rpx = 1px via --f7-rpx.
 */
export const typography = {
  fontFamily: {
    body: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  weight: {
    medium: 500,
    bold: 700,
    extraBold: 800,
  },
  letterSpacing: {
    headline: '5rpx',
    ribbon: '8rpx',
  },
  scale: {
    display: { size: '72rpx', weight: 800, letterSpacing: '5rpx' },
    h1: { size: '48rpx', weight: 800, letterSpacing: '5rpx' },
    h2: { size: '36rpx', weight: 800, letterSpacing: '4rpx' },
    h3: { size: '32rpx', weight: 700, letterSpacing: '4rpx' },
    body: { size: '28rpx', weight: 500, letterSpacing: '0' },
    sm: { size: '24rpx', weight: 500, letterSpacing: '0' },
    xs: { size: '20rpx', weight: 500, letterSpacing: '0' },
  },
} as const;

export type TypographyTokens = typeof typography;
export type TypographyScaleKey = keyof typeof typography.scale;
