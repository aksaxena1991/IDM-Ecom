import type { Meta, StoryObj } from '@storybook/react-vite';

import { BigFriendlyButton } from './BigFriendlyButton.js';

const meta: Meta<typeof BigFriendlyButton> = {
  title: 'SkyLearn/Big Friendly Button',
  component: BigFriendlyButton,
};

export default meta;

type Story = StoryObj<typeof BigFriendlyButton>;

export const Primary: Story = {
  args: { children: 'Start lesson' },
};

export const FullWidth: Story = {
  args: { children: 'Keep going!', fullWidth: true },
};
