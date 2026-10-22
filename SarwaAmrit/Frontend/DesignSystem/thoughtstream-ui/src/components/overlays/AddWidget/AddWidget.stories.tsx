import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, RotateCcw } from 'lucide-react';
import { AddWidget } from './AddWidget';
import { Button } from '../../actions/Button';
import { WidgetBoard } from '../WidgetCard';
import type { WidgetLayout } from '../WidgetCard';
import { DEFAULT_WIDGET_LAYOUT } from '../WidgetCard';
import { analyticsWidgets } from '../WidgetCard/analyticsWidgets';

const defaultSelection = ['win-loss-trend'];

const meta: Meta<typeof AddWidget> = {
  title: 'Components/AddWidget',
  component: AddWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

function AnalyticsCanvas({
  initialSelection,
  initialEditing = true,
  menuOpen = false,
}: {
  initialSelection: string[];
  initialEditing?: boolean;
  menuOpen?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [editing, setEditing] = useState(initialEditing);
  const [layouts, setLayouts] = useState<Record<string, WidgetLayout>>({});

  const resetLayouts = () => {
    const next: Record<string, WidgetLayout> = {};
    for (const id of defaultSelection) {
      next[id] = { ...DEFAULT_WIDGET_LAYOUT };
    }
    setLayouts(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 12px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <Button
          variant="ghost"
          size="small"
          leftIcon={<RotateCcw size={14} />}
          onClick={() => {
            setSelected(defaultSelection);
            resetLayouts();
            setEditing(true);
          }}
        >
          Reset
        </Button>
        <AddWidget
          widgets={analyticsWidgets}
          heading="Analytics Widgets"
          value={selected}
          onChange={setSelected}
          defaultOpen={menuOpen}
        />
        <Button
          variant="secondary"
          size="small"
          leftIcon={<Check size={14} />}
          onClick={() => setEditing(false)}
        >
          Done
        </Button>
      </div>

      <WidgetBoard
        columns={4}
        editing={editing}
        layouts={layouts}
        onLayoutsChange={setLayouts}
        items={selected
          .map((id) => analyticsWidgets.find((widget) => widget.id === id))
          .filter((widget): widget is (typeof analyticsWidgets)[number] => Boolean(widget))
          .map((widget) => ({
            id: widget.id,
            layout:
              widget.id === 'win-loss-trend'
                ? { columnSpan: 2, rowSpan: 2 }
                : { columnSpan: 1, rowSpan: 1 },
            content: widget.render({
              onRemove: () => setSelected((current) => current.filter((item) => item !== widget.id)),
            }),
          }))}
        onReorder={setSelected}
      />
    </div>
  );
}

export const AnalyticsWidgets: StoryObj = {
  render: () => <AnalyticsCanvas initialSelection={defaultSelection} />,
};

export const PartialSelection: StoryObj = {
  render: () => (
    <AnalyticsCanvas
      initialSelection={['pipeline-health', 'win-loss-trend']}
      menuOpen
    />
  ),
};

export const EmptyCatalog: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 200, padding: 24 }}>
      <AddWidget widgets={[]} heading="Analytics Widgets" defaultOpen />
    </div>
  ),
};
