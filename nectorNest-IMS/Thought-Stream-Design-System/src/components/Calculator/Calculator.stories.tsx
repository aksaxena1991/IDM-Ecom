import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Calculator, CalculatorHistoryItem } from './Calculator';

const meta: Meta<typeof Calculator> = {
  title: 'Components/Calculator',
  component: Calculator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Calculator>;

export const Default: Story = {
  render: () => {
    const [lastResult, setLastResult] = useState<string>('0');

    const handleCalc = (result: number, item: CalculatorHistoryItem) => {
      setLastResult(`${item.expression} ${result}`);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <Calculator onCalculate={handleCalc} />
        <span style={{ fontSize: '12px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Last Output: {lastResult}
        </span>
      </div>
    );
  },
};

export const WithPreloadedHistoryTape: Story = {
  render: () => {
    const sampleHistory: CalculatorHistoryItem[] = [
      { id: '1', expression: '680 ÷ 12 =', result: '56.66' },
      { id: '2', expression: '16 × 1.618 =', result: '25.888' },
      { id: '3', expression: '1024 × 768 =', result: '786432' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <Calculator
          defaultHistory={sampleHistory}
          defaultValue="786432"
        />
        <span style={{ fontSize: '12px', color: 'var(--ts-color-text-tertiary)' }}>
          Click "History" at top to view and recall calculation tape items.
        </span>
      </div>
    );
  },
};
