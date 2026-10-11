import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Display/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const FirstPlayer: Story = { args: { tone: 'gold', children: '1st' } };
export const Flip7: Story = { args: { tone: 'sky', children: 'Flip7' } };
export const Boom: Story = { args: { tone: 'coral', children: 'BOOM' } };
