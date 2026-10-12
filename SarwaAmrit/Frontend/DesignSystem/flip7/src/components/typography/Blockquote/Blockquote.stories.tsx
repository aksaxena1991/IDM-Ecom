import type { Meta, StoryObj } from '@storybook/react-vite';
import { Blockquote } from './Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Typography/Blockquote',
  component: Blockquote,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Blockquote>;

export const Default: Story = {
  args: {
    children: 'Flip seven unique numbers. Bust, and it is BOOM.',
    attribution: 'Flip7 rules',
  },
};
