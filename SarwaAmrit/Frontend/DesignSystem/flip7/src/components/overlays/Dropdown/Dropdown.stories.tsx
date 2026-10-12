import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dropdown } from './Dropdown';
import { Button } from '../../actions/Button';
const meta: Meta<typeof Dropdown> = { title: 'Overlays/Dropdown', component: Dropdown, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Dropdown>;
export const Default: Story = {
  args: {
    trigger: <Button variant="ghost">Menu</Button>,
    items: [
      { id: 'new', label: 'New game' },
      { id: 'score', label: 'Score pad' },
    ],
  },
};
