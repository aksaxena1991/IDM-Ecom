import { addons } from 'storybook/manager-api';
import theme from './ThoughtStreamTheme';

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
});
