import type { Meta, StoryObj } from '@storybook/react-vite';
import { Confetti } from './Confetti';

const meta: Meta<typeof Confetti> = {
  title: 'Motion/Confetti',
  component: Confetti,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Confetti>;

export const Victory: Story = {
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 360,
        height: 420,
        margin: '0 auto',
        background: '#2BA8A2',
        borderRadius: 32,
        overflow: 'hidden',
      }}
    >
      <Confetti />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF8E7',
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 4,
        }}
      >
        WINNER
      </div>
    </div>
  ),
};
