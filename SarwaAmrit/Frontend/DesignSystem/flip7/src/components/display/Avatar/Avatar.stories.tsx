import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Display/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Teal: Story = { args: { label: 'Maya Chen', tone: 'teal', size: 56 } };
export const Gold: Story = { args: { label: 'First Player', tone: 'gold', size: 56 } };
export const Silver: Story = { args: { label: 'Riley Ng', tone: 'silver', size: 64 } };
export const Coral: Story = { args: { label: 'Kai Oka', tone: 'coral', size: 60 } };
