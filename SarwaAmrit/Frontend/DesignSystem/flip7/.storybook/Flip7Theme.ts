import { create } from 'storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'Flip7 Design System',
  brandUrl: '/',
  brandTarget: '_self',

  appBg: '#EFF8F7',
  appContentBg: '#FFF8E7',
  appPreviewBg: '#EFF8F7',
  appBorderColor: '#2BA8A2',
  appBorderRadius: 16,

  textColor: '#1E8C86',
  textInverseColor: '#FFF8E7',
  textMutedColor: '#2BA8A2',

  barTextColor: '#1E8C86',
  barSelectedColor: '#EF6C4A',
  barHoverColor: '#D45233',
  barBg: '#E8F6F5',

  inputBg: '#FFF8E7',
  inputBorder: '#2BA8A2',
  inputTextColor: '#1E8C86',
  inputBorderRadius: 16,

  colorPrimary: '#2BA8A2',
  colorSecondary: '#EF6C4A',

  fontBase: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontCode: "ui-monospace, 'SF Mono', Menlo, monospace",
});
