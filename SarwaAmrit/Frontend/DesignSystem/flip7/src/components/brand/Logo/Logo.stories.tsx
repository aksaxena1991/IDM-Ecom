import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Brand/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Setup-page lockup: five fan cards, skewed cream FLIP7 plate, and a retro folded ribbon.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const SetupHeader: Story = {
  args: {
    banner: 'THE CARD GAME',
  },
};

export const ScoreTracker: Story = {
  args: {
    banner: 'SCORE TRACKER',
  },
};

export const Compact: Story = {
  args: {
    banner: 'FLIP7',
    size: 'compact',
  },
};
