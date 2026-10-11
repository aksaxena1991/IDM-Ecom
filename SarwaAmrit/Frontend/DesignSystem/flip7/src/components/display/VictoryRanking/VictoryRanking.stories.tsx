import type { Meta, StoryObj } from '@storybook/react-vite';
import { VictoryRanking } from './VictoryRanking';

const meta: Meta<typeof VictoryRanking> = {
  title: 'Display/VictoryRanking',
  component: VictoryRanking,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Podium treatment: gold winner, silver 2nd (64rpx avatar), coral 3rd (60rpx), default 4th+.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VictoryRanking>;

export const Podium: Story = {
  args: {
    players: [
      { name: 'Maya', score: 47, place: 1 },
      { name: 'Riley', score: 38, place: 2 },
      { name: 'Kai', score: 29, place: 3 },
      { name: 'Jordan', score: 18, place: 4 },
    ],
  },
};
