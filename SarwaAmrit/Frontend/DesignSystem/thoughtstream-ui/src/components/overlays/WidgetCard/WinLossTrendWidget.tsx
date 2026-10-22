import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { BarChart } from '../../charts/BarChart';
import { WidgetCard } from './WidgetCard';
import type { WidgetCardProps } from './WidgetCard';

const BOUND = '#1E9B57';
const IN_PROGRESS = '#D0126C';
const LOST = '#E03A3A';

const ALL_MONTHS = [
  { label: 'Sep 2026', bound: 0, inProgress: 0, lost: 1 },
  { label: 'Oct 2026', bound: 0, inProgress: 5, lost: 0 },
  { label: 'Nov 2026', bound: 1, inProgress: 7, lost: 1 },
  { label: 'Dec 2026', bound: 3, inProgress: 13, lost: 2 },
  { label: 'Jan 2027', bound: 2, inProgress: 6, lost: 0 },
  { label: 'Feb 2027', bound: 1, inProgress: 5, lost: 0 },
  { label: 'Mar 2027', bound: 3, inProgress: 2, lost: 1 },
];

const RANGE_OPTIONS = [
  { value: 'all', label: 'All months' },
  { value: '3', label: 'Last 3 months' },
];

export type WinLossTrendWidgetProps = Pick<
  WidgetCardProps,
  | 'editing'
  | 'layout'
  | 'onGrow'
  | 'onShrink'
  | 'onRemove'
  | 'onDragGripPointerDown'
  | 'onDragGripPointerUp'
>;

/**
 * Win / Loss Trend widget.
 * Grouped monthly bars for bound, in-progress, and lost opportunities.
 */
export const WinLossTrendWidget: React.FC<WinLossTrendWidgetProps> = ({
  layout,
  ...props
}) => {
  const [range, setRange] = useState('all');
  const data = range === '3' ? ALL_MONTHS.slice(-3) : ALL_MONTHS;
  const chartHeight = Math.max(220, (layout?.rowSpan ?? 1) * 130);

  return (
    <WidgetCard
      layout={layout}
      title="Win / Loss Trend"
      subtitle="Monthly bound vs lost opportunities"
      icon={<TrendingUp size={18} strokeWidth={2} />}
      rangeOptions={RANGE_OPTIONS}
      rangeValue={range}
      onRangeChange={setRange}
      {...props}
    >
      <BarChart
        borderless
        data={data}
        series={[
          { key: 'bound', label: 'Bound', color: BOUND },
          { key: 'inProgress', label: 'In Progress', color: IN_PROGRESS },
          { key: 'lost', label: 'Lost', color: LOST },
        ]}
        height={chartHeight}
        showGrid
        showLegend
        legendPlacement="footer"
        colorLegend
        yMax={15}
        yTickStep={5}
        barRadius={2}
        barStroke={false}
      />
    </WidgetCard>
  );
};

WinLossTrendWidget.displayName = 'WinLossTrendWidget';
