import type { Meta, StoryObj } from '@storybook/react-vite';

import { AnswerTile } from './AnswerTile.js';

const meta: Meta<typeof AnswerTile> = {
  title: 'SkyLearn/Answer Tile',
  component: AnswerTile,
};

export default meta;

type Story = StoryObj<typeof AnswerTile>;

export const Default: Story = {
  args: { label: '6 × 4 = 24' },
};

export const Correct: Story = {
  args: { label: '6 × 4 = 24', state: 'correct' },
};

export const Incorrect: Story = {
  args: {
    label: '6 × 4 = 20',
    state: 'incorrect',
    showWhyHref: '#',
  },
};
