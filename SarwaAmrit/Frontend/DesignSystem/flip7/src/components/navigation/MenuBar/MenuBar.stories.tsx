import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuBar } from './MenuBar';
const meta: Meta<typeof MenuBar> = { title: 'Navigation/MenuBar', component: MenuBar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof MenuBar>;
export const Default: Story = {
  args: { value: 'play', items: [{ id: 'play', label: 'Play' }, { id: 'stats', label: 'Stats' }] },
};
