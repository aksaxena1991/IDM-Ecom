import type { Meta, StoryObj } from '@storybook/react-vite';

import { QuizScoreCard } from './QuizScoreCard.js';

const meta: Meta<typeof QuizScoreCard> = {
  title: 'SkyLearn/Quiz Score Card',
  component: QuizScoreCard,
};

export default meta;

type Story = StoryObj<typeof QuizScoreCard>;

export const Default: Story = {
  args: {
    score: 14,
    maxScore: 16,
    stars: 2,
    gotRight: ['Spelled “because” correctly', 'Multiplied 6 × 4'],
    reviewNext: ['Regrouping in subtraction'],
  },
};
