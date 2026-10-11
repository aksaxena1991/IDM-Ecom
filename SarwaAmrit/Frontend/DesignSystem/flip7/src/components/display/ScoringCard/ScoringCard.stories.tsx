import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScoringCard } from './ScoringCard';
import { CounterButton } from '../../actions/CounterButton';
import { Button } from '../../actions/Button';

const meta: Meta<typeof ScoringCard> = {
  title: 'Display/ScoringCard',
  component: ScoringCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'White scoring items with a 6rpx left accent. Default teal, highlighted gold, BOOM coral pulse.',
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
type Story = StoryObj<typeof ScoringCard>;

export const Default: Story = {
  args: { title: 'Maya', score: 12, meta: '3 cards in play' },
};

export const Highlighted: Story = {
  args: { state: 'highlighted', title: 'First player', score: 21, meta: 'Leading the table' },
};

export const BoomActive: Story = {
  args: { state: 'boom', title: 'Kai', score: 0, meta: 'BOOM — bust' },
};

export const WithCounters: Story = {
  render: () => (
    <ScoringCard
      title="Riley"
      score={9}
      actions={
        <>
          <CounterButton variant="minus" />
          <CounterButton variant="plus" />
        </>
      }
    />
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ScoringCard title="Maya" score={12} meta="In play" />
      <ScoringCard state="highlighted" title="First player" score={21} meta="Gold highlight" />
      <ScoringCard
        state="boom"
        title="Kai"
        score={0}
        meta="Bust"
        actions={<Button variant="boom" active>BOOM</Button>}
      />
    </div>
  ),
};
