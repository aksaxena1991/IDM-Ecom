import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CounterButton } from './CounterButton';

const meta: Meta<typeof CounterButton> = {
  title: 'Actions/CounterButton',
  component: CounterButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '80×80rpx rounded squares. Minus is coral, plus is teal.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CounterButton>;

export const Plus: Story = { args: { variant: 'plus' } };
export const Minus: Story = { args: { variant: 'minus' } };

export const ScoreStepper: Story = {
  render: function Stepper() {
    const [value, setValue] = useState(7);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <CounterButton variant="minus" onClick={() => setValue((n) => Math.max(0, n - 1))} />
        <span className="f7-type-h1" style={{ minWidth: 48, textAlign: 'center' }}>
          {value}
        </span>
        <CounterButton variant="plus" onClick={() => setValue((n) => n + 1)} />
      </div>
    );
  },
};
