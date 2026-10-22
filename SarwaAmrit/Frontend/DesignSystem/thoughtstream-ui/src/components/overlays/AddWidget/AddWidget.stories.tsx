import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Activity,
  Clock,
  FileText,
  Gauge,
  Lightbulb,
  PieChart,
  Target,
  TrendingUp,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AddWidget } from './AddWidget';
import type { WidgetOption } from './AddWidget';
import { Button } from '../../actions/Button';

const analyticsWidgets: WidgetOption[] = [
  {
    id: 'submission-performance',
    title: 'Submission Performance',
    description: 'Your submission volume and outcomes',
    icon: <FileText size={16} strokeWidth={1.75} />,
  },
  {
    id: 'pipeline-health',
    title: 'Pipeline Health',
    description: 'Distribution of active opportunities',
    icon: <Activity size={16} strokeWidth={1.75} />,
  },
  {
    id: 'win-loss-trend',
    title: 'Win / Loss Trend',
    description: 'Monthly trend of bound vs lost',
    icon: <TrendingUp size={16} strokeWidth={1.75} />,
  },
  {
    id: 'quote-response-speed',
    title: 'Quote Response Speed',
    description: 'How quickly MGUs respond',
    icon: <Clock size={16} strokeWidth={1.75} />,
  },
  {
    id: 'smart-insights',
    title: 'Smart Insights',
    description: 'AI-driven tips to improve results',
    icon: <Lightbulb size={16} strokeWidth={1.75} />,
  },
  {
    id: 'win-metrics',
    title: 'Win Metrics',
    description: 'Bind rate and bound premium',
    icon: <Target size={16} strokeWidth={1.75} />,
  },
  {
    id: 'your-performance',
    title: 'Your Performance',
    description: 'Speed and efficiency versus peers',
    icon: <Gauge size={16} strokeWidth={1.75} />,
  },
  {
    id: 'sold-vs-lost',
    title: 'Sold vs Lost',
    description: 'Won, lost, and in-progress outcomes',
    icon: <PieChart size={16} strokeWidth={1.75} />,
  },
];

const allIds = analyticsWidgets.map((widget) => widget.id);

const meta: Meta<typeof AddWidget> = {
  title: 'Components/AddWidget',
  component: AddWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

export const AnalyticsWidgets: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(allIds);
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          gap: 8,
          minHeight: 520,
          padding: '24px 48px',
        }}
      >
        <Button variant="ghost" size="small" leftIcon={<RotateCcw size={14} />}>
          Reset
        </Button>
        <AddWidget
          widgets={analyticsWidgets}
          heading="Analytics Widgets"
          value={selected}
          onChange={setSelected}
          defaultOpen
        />
        <Button variant="secondary" size="small" leftIcon={<Check size={14} />}>
          Done
        </Button>
      </div>
    );
  },
};

export const PartialSelection: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([
      'pipeline-health',
      'win-loss-trend',
    ]);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 520, padding: 24 }}>
        <AddWidget
          widgets={analyticsWidgets}
          heading="Analytics Widgets"
          value={selected}
          onChange={setSelected}
          defaultOpen
        />
      </div>
    );
  },
};

export const EmptyCatalog: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: 200, padding: 24 }}>
      <AddWidget widgets={[]} heading="Analytics Widgets" defaultOpen />
    </div>
  ),
};
