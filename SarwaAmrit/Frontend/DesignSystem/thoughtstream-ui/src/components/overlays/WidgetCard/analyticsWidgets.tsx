import React from 'react';
import {
  Activity,
  Clock,
  FileText,
  Gauge,
  Lightbulb,
  PieChart,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { WidgetOption } from '../AddWidget';
import { WidgetCard } from './WidgetCard';
import type { WidgetCardProps } from './WidgetCard';
import { WinLossTrendWidget } from './WinLossTrendWidget';

type FrameProps = Pick<
  WidgetCardProps,
  | 'editing'
  | 'onRemove'
  | 'onExpand'
  | 'expanded'
  | 'onDragGripPointerDown'
  | 'onDragGripPointerUp'
>;

export interface AnalyticsWidgetDefinition extends WidgetOption {
  render: (props: FrameProps) => React.ReactNode;
}

const iconProps = { size: 16, strokeWidth: 1.75 as const };

function SummaryCard({
  title,
  subtitle,
  icon,
  value,
  detail,
  ...frame
}: FrameProps & {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  value: string;
  detail: string;
}) {
  return (
    <WidgetCard title={title} subtitle={subtitle} icon={icon} {...frame}>
      <div className="ts-widget-summary">
        <span className="ts-widget-summary-value">{value}</span>
        <span className="ts-widget-summary-detail">{detail}</span>
      </div>
    </WidgetCard>
  );
}

function PipelineHealthWidget(frame: FrameProps) {
  const segments = [
    { label: 'New', value: 15, color: '#44403C' },
    { label: 'Quoted', value: 7, color: '#EAB308' },
    { label: 'Review', value: 10, color: '#7C3AED' },
    { label: 'In progress', value: 14, color: '#D0126C' },
    { label: 'Bound', value: 10, color: '#1E9B57' },
  ];

  return (
    <WidgetCard
      title="Pipeline Health"
      subtitle="Distribution of active opportunities"
      icon={<Activity {...iconProps} />}
      {...frame}
    >
      <div className="ts-widget-pipeline">
        <p className="ts-widget-pipeline-count">56 total opportunities</p>
        <div className="ts-widget-pipeline-bar" aria-hidden="true">
          {segments.map((segment) => (
            <div
              key={segment.label}
              style={{ flex: segment.value, background: segment.color }}
            />
          ))}
        </div>
        <div className="ts-widget-pipeline-legend">
          {segments.map((segment) => (
            <span key={segment.label} style={{ color: segment.color }}>
              {segment.value} {segment.label}
            </span>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

export const analyticsWidgets: AnalyticsWidgetDefinition[] = [
  {
    id: 'submission-performance',
    title: 'Submission Performance',
    description: 'Your submission volume and outcomes',
    icon: <FileText {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Submission Performance"
        subtitle="Your submission volume and outcomes"
        icon={<FileText size={18} strokeWidth={1.75} />}
        value="56"
        detail="Total submissions · 10 bound"
      />
    ),
  },
  {
    id: 'pipeline-health',
    title: 'Pipeline Health',
    description: 'Distribution of active opportunities',
    icon: <Activity {...iconProps} />,
    render: (frame) => <PipelineHealthWidget {...frame} />,
  },
  {
    id: 'win-loss-trend',
    title: 'Win / Loss Trend',
    description: 'Monthly trend of bound vs lost',
    icon: <TrendingUp {...iconProps} />,
    render: (frame) => <WinLossTrendWidget {...frame} />,
  },
  {
    id: 'quote-response-speed',
    title: 'Quote Response Speed',
    description: 'How quickly MGUs respond',
    icon: <Clock {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Quote Response Speed"
        subtitle="How quickly MGUs respond"
        icon={<Clock size={18} strokeWidth={1.75} />}
        value="2.4d"
        detail="Median time to first quote"
      />
    ),
  },
  {
    id: 'smart-insights',
    title: 'Smart Insights',
    description: 'AI-driven tips to improve results',
    icon: <Lightbulb {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Smart Insights"
        subtitle="AI-driven tips to improve results"
        icon={<Lightbulb size={18} strokeWidth={1.75} />}
        value="3"
        detail="Follow-ups most likely to bind this week"
      />
    ),
  },
  {
    id: 'win-metrics',
    title: 'Win Metrics',
    description: 'Bind rate and bound premium',
    icon: <Target {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Win Metrics"
        subtitle="Bind rate and bound premium"
        icon={<Target size={18} strokeWidth={1.75} />}
        value="18%"
        detail="Bind rate across the open period"
      />
    ),
  },
  {
    id: 'your-performance',
    title: 'Your Performance',
    description: 'Speed and efficiency versus peers',
    icon: <Gauge {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Your Performance"
        subtitle="Speed and efficiency versus peers"
        icon={<Gauge size={18} strokeWidth={1.75} />}
        value="64%"
        detail="Faster quote turnaround than peers"
      />
    ),
  },
  {
    id: 'sold-vs-lost',
    title: 'Sold vs Lost',
    description: 'Won, lost, and in-progress outcomes',
    icon: <PieChart {...iconProps} />,
    render: (frame) => (
      <SummaryCard
        {...frame}
        title="Sold vs Lost"
        subtitle="Won, lost, and in-progress outcomes"
        icon={<PieChart size={18} strokeWidth={1.75} />}
        value="10 / 14"
        detail="Bound against lost this period"
      />
    ),
  },
];
