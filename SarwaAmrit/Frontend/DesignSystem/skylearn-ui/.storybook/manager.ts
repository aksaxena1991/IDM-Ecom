import { addons } from 'storybook/manager-api';
import SkyLearnTheme from './SkyLearnTheme';

addons.setConfig({
  theme: SkyLearnTheme,
  sidebar: { showRoots: true },
});
