import type { Meta, StoryObj } from '@storybook/react-vite';
import { Crown } from './Crown';
import { ScoringCard } from '../../display/ScoringCard';

const meta: Meta<typeof Crown> = {
  title: 'Motion/Crown',
  component: Crown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Crown>;

export const Bounce: Story = {};

export const WinnerCard: Story = {
  render: () => (
    <div className="f7-anim-glow" style={{ width: 320 }}>
      <ScoringCard
        state="highlighted"
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Crown />
            Maya
          </span>
        }
        score={47}
        meta="Table winner"
      />
    </div>
  ),
};
