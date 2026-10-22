import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WidgetBoard } from './WidgetBoard';
import { WinLossTrendWidget } from './WinLossTrendWidget';

const meta: Meta<typeof WinLossTrendWidget> = {
  title: 'Components/WidgetCard',
  component: WinLossTrendWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

export const WinLossTrend: StoryObj = {
  render: () => {
    const [visible, setVisible] = useState(true);
    return (
      <div style={{ maxWidth: 1200, padding: '12px 8px 24px' }}>
        <WidgetBoard
          columns={4}
          editing
          items={
            visible
              ? [
                  {
                    id: 'win-loss-trend',
                    layout: { columnSpan: 2, rowSpan: 2 },
                    content: <WinLossTrendWidget onRemove={() => setVisible(false)} />,
                  },
                ]
              : []
          }
        />
      </div>
    );
  },
};
