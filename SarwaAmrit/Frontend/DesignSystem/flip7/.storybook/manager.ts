import { addons } from 'storybook/manager-api';
import theme from './Flip7Theme';

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
});
