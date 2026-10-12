import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from '../../actions/Button';
const meta: Meta<typeof Popover> = { title: 'Overlays/Popover', component: Popover, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Popover>;
export const Default: Story = {
  args: { trigger: <Button variant="ghost">More</Button>, children: 'Freeze, ×2, and Flip7 live here.' },
};
