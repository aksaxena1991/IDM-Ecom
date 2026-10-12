import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LineChart,
  AreaChart,
  BarChart,
  HistogramChart,
  ScatterPlotChart,
  RangeAreaChart,
  CandleChart,
} from './cartesian';
import { PieChart, DonutChart, RadialChart, GaugeChart, RadarChart } from './circular';
import { FunnelChart, GanttChart, HeatMapChart, VennDiagramChart, TableChart } from './specialty';
import { PinMapChart, RouteMapChart, ConnectionMapChart, DensityMapChart } from './maps';
import { ChartTooltip } from './ChartTooltip';

const series = [
  { key: 'maya', label: 'Maya' },
  { key: 'riley', label: 'Riley' },
];
const xy = [
  { label: 'R1', maya: 12, riley: 8 },
  { label: 'R2', maya: 21, riley: 15 },
  { label: 'R3', maya: 14, riley: 19 },
  { label: 'R4', maya: 28, riley: 17 },
];
const slices = [
  { label: 'Maya', value: 47 },
  { label: 'Riley', value: 38 },
  { label: 'Kai', value: 29 },
];
const points = [
  { id: 'a', x: 50, y: 40, label: 'A', value: 6 },
  { id: 'b', x: 110, y: 60, label: 'B', value: 10 },
  { id: 'c', x: 150, y: 90, label: 'C', value: 4 },
];

const meta: Meta = { title: 'Charts/Gallery', parameters: { layout: 'padded' } };
export default meta;
type Story = StoryObj;

const wrap = (node: ReactNode) => <div style={{ width: 360 }}>{node}</div>;

export const Line: Story = { render: () => wrap(<LineChart title="Scores" data={xy} series={series} />) };
export const Area: Story = { render: () => wrap(<AreaChart title="Maya trend" data={xy} series={[series[0]]} />) };
export const RangeArea: Story = { render: () => wrap(<RangeAreaChart title="Range" data={xy} series={[series[0]]} />) };
export const Bar: Story = { render: () => wrap(<BarChart title="By round" data={xy} series={series} />) };
export const Histogram: Story = { render: () => wrap(<HistogramChart title="Buckets" data={xy} series={[series[0]]} />) };
export const Scatter: Story = { render: () => wrap(<ScatterPlotChart title="Spread" data={xy} series={series} />) };
export const Candle: Story = {
  render: () =>
    wrap(
      <CandleChart
        title="Volatility"
        data={[
          { label: 'R1', open: 10, high: 16, low: 8, close: 14 },
          { label: 'R2', open: 14, high: 22, low: 12, close: 13 },
        ]}
      />
    ),
};
export const Pie: Story = { render: () => wrap(<PieChart title="Share" data={slices} />) };
export const Donut: Story = { render: () => wrap(<DonutChart title="Share" data={slices} />) };
export const Radial: Story = { render: () => wrap(<RadialChart title="Skills" data={[{ label: 'Luck', value: 70 }, { label: 'Pace', value: 45 }]} />) };
export const Gauge: Story = { render: () => wrap(<GaugeChart title="To 200" value={146} max={200} />) };
export const Radar: Story = { render: () => wrap(<RadarChart title="Profile" data={[{ label: 'A', value: 80 }, { label: 'B', value: 50 }, { label: 'C', value: 65 }]} />) };
export const Funnel: Story = { render: () => wrap(<FunnelChart title="Hands" data={slices} />) };
export const Gantt: Story = { render: () => wrap(<GanttChart title="Night" data={[{ label: 'Setup', start: 0, end: 20 }, { label: 'Play', start: 20, end: 80 }]} />) };
export const HeatMap: Story = { render: () => wrap(<HeatMapChart title="Heat" rows={['M', 'R']} cols={['1', '2', '3']} values={[[0.2, 0.8, 0.4], [0.6, 0.3, 0.9]]} />) };
export const Venn: Story = { render: () => wrap(<VennDiagramChart title="Overlap" sets={slices.slice(0, 2)} />) };
export const Table: Story = {
  render: () =>
    wrap(
      <TableChart
        title="Standings"
        columns={[{ key: 'name', header: 'Player' }, { key: 'score', header: 'Score' }]}
        data={[{ name: 'Maya', score: 47 }, { name: 'Riley', score: 38 }]}
      />
    ),
};
export const PinMap: Story = { render: () => wrap(<PinMapChart title="Tables" points={points} />) };
export const RouteMap: Story = { render: () => wrap(<RouteMapChart title="Tour" points={points} />) };
export const ConnectionMap: Story = { render: () => wrap(<ConnectionMapChart title="Links" points={points} />) };
export const DensityMap: Story = { render: () => wrap(<DensityMapChart title="Density" points={points} />) };
export const Tooltip: Story = {
  render: () => (
    <div className="f7-chart-canvas" style={{ height: 80, width: 200 }}>
      <ChartTooltip x={20} y={10} title="R3" visible items={[{ label: 'Maya', formattedValue: '14', color: '#2BA8A2' }]} />
    </div>
  ),
};
