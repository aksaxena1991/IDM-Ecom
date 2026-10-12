import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';
const meta: Meta<typeof Tabs> = { title: 'Navigation/Tabs', component: Tabs, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tabs>;
export const Default: Story = {
  args: {
    items: [
      { id: 'round', label: 'Round', content: 'Score this hand.' },
      { id: 'total', label: 'Totals', content: 'Running scores.' },
    ],
  },
};
