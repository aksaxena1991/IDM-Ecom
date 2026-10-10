import { create } from 'storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'ThoughtStream Design System',
  brandUrl: '/',
  brandTarget: '_self',

  // UI colors
  appBg: '#FAFAF9',
  appContentBg: '#FAFAF9',
  appPreviewBg: '#FAFAF9',
  appBorderColor: '#E7E5E4',
  appBorderRadius: 0,

  // Text colors
  textColor: '#1C1917',
  textInverseColor: '#FAFAF9',
  textMutedColor: '#57534E',

  // Toolbar default and active colors
  barTextColor: '#57534E',
  barSelectedColor: '#78716C',
  barHoverColor: '#1C1917',
  barBg: '#F5F5F4',

  // Form colors
  inputBg: '#FAFAF9',
  inputBorder: '#D6D3D1',
  inputTextColor: '#1C1917',
  inputBorderRadius: 0,

  // Typography
  fontBase: "Inter, -apple-system, 'Segoe UI', Helvetica, sans-serif",
  fontCode: "Source Code Pro, 'Fira Code', monospace",
});
