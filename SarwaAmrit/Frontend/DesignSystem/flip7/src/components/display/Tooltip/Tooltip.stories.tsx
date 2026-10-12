import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../../actions/Button';
const meta: Meta<typeof Tooltip> = { title: 'Display/Tooltip', component: Tooltip, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tooltip>;
export const Default: Story = {
  render: () => (
    <Tooltip content="Lock this round">
      <Button>Hover me</Button>
    </Tooltip>
  ),
};
