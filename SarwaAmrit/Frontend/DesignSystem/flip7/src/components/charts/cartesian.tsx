import React from 'react';
import { ChartFrame } from './frame';
import { chartColor } from './palette';

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface XYChartProps {
  data: Array<{ label: string; [key: string]: string | number }>;
  series: ChartSeries[];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
}

const W = 360;
const H = 180;
const L = 36;
const B = 28;

function bounds(data: XYChartProps['data'], series: ChartSeries[]) {
  let max = 1;
  series.forEach((s) => data.forEach((d) => { max = Math.max(max, Number(d[s.key] ?? 0)); }));
  return max;
}

function xOf(i: number, n: number) {
  return L + (n <= 1 ? (W - L - 12) / 2 : (i / (n - 1)) * (W - L - 12));
}

export const LineChart: React.FC<XYChartProps> = ({ data, series, title, subtitle, className }) => {
  const max = bounds(data, series);
  return (
    <ChartFrame title={title} subtitle={subtitle} legend={series} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="f7-chart-svg">
        {series.map((s, si) => {
          const pts = data.map((d, i) => `${xOf(i, data.length)},${H - B - (Number(d[s.key] ?? 0) / max) * (H - B - 16)}`).join(' ');
          return <polyline key={s.key} fill="none" stroke={chartColor(si, s.color)} strokeWidth="3" points={pts} />;
        })}
        {data.map((d, i) => (
          <text key={d.label} x={xOf(i, data.length)} y={H - 8} textAnchor="middle" fontSize="10" fill="#2BA8A2">{d.label}</text>
        ))}
      </svg>
    </ChartFrame>
  );
};

export const AreaChart: React.FC<XYChartProps> = ({ data, series, title, subtitle, className }) => {
  const max = bounds(data, series);
  const s = series[0];
  const line = data.map((d, i) => `${xOf(i, data.length)},${H - B - (Number(d[s?.key] ?? 0) / max) * (H - B - 16)}`);
  const path = `M ${L},${H - B} L ${line.join(' L ')} L ${xOf(data.length - 1, data.length)},${H - B} Z`;
  return (
    <ChartFrame title={title} subtitle={subtitle} legend={series} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="f7-chart-svg">
        <path d={path} fill="#2BA8A233" stroke="#2BA8A2" strokeWidth="3" />
      </svg>
    </ChartFrame>
  );
};

export const RangeAreaChart: React.FC<XYChartProps> = (props) => <AreaChart {...props} />;

export const BarChart: React.FC<XYChartProps> = ({ data, series, title, subtitle, className }) => {
  const max = bounds(data, series);
  const groupW = (W - L - 12) / data.length;
  return (
    <ChartFrame title={title} subtitle={subtitle} legend={series} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="f7-chart-svg">
        {data.map((d, i) =>
          series.map((s, si) => {
            const bw = groupW / series.length - 4;
            const h = (Number(d[s.key] ?? 0) / max) * (H - B - 16);
            const x = L + i * groupW + si * (bw + 2);
            return <rect key={`${d.label}-${s.key}`} x={x} y={H - B - h} width={bw} height={h} rx="4" fill={chartColor(si, s.color)} />;
          })
        )}
      </svg>
    </ChartFrame>
  );
};

export const HistogramChart: React.FC<XYChartProps> = (props) => <BarChart {...props} />;

export const ScatterPlotChart: React.FC<XYChartProps> = ({ data, series, title, subtitle, className }) => {
  const max = bounds(data, series);
  return (
    <ChartFrame title={title} subtitle={subtitle} legend={series} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="f7-chart-svg">
        {series.map((s, si) =>
          data.map((d, i) => (
            <circle
              key={`${s.key}-${i}`}
              cx={xOf(i, data.length)}
              cy={H - B - (Number(d[s.key] ?? 0) / max) * (H - B - 16)}
              r="5"
              fill={chartColor(si, s.color)}
            />
          ))
        )}
      </svg>
    </ChartFrame>
  );
};

export interface CandlePoint {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const CandleChart: React.FC<{ data: CandlePoint[]; title?: string; subtitle?: string; className?: string }> = ({
  data,
  title,
  subtitle,
  className,
}) => {
  const max = Math.max(...data.map((d) => d.high), 1);
  return (
    <ChartFrame title={title} subtitle={subtitle} className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="f7-chart-svg">
        {data.map((d, i) => {
          const x = xOf(i, data.length);
          const y = (v: number) => H - B - (v / max) * (H - B - 16);
          const up = d.close >= d.open;
          return (
            <g key={d.label}>
              <line x1={x} x2={x} y1={y(d.high)} y2={y(d.low)} stroke="#1E8C86" strokeWidth="2" />
              <rect x={x - 6} y={y(Math.max(d.open, d.close))} width="12" height={Math.max(4, Math.abs(y(d.open) - y(d.close)))} fill={up ? '#2BA8A2' : '#EF6C4A'} rx="2" />
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
};

LineChart.displayName = 'LineChart';
AreaChart.displayName = 'AreaChart';
BarChart.displayName = 'BarChart';
