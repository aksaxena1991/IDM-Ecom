import type { Meta, StoryObj } from '@storybook/react-vite';

import { BigFriendlyButton } from '../../actions/BigFriendlyButton/BigFriendlyButton.js';
import { EmptyState } from './EmptyState.js';

const meta: Meta<typeof EmptyState> = {
  title: 'SkyLearn/Empty state',
  component: EmptyState,
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    action: <BigFriendlyButton>Pick a lesson</BigFriendlyButton>,
  },
};
