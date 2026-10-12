import React from 'react';
import { ChartFrame } from './frame';
import { chartColor } from './palette';
import type { SliceItem } from './circular';

export const FunnelChart: React.FC<{ data: SliceItem[]; title?: string; subtitle?: string; className?: string }> = ({
  data,
  title,
  subtitle,
  className,
}) => (
  <ChartFrame title={title} subtitle={subtitle} legend={data} className={className}>
    <svg viewBox="0 0 240 180" className="f7-chart-svg">
      {data.map((d, i) => {
        const w = 200 - i * 24;
        const x = (240 - w) / 2;
        return <rect key={d.label} x={x} y={12 + i * 32} width={w} height="24" rx="12" fill={chartColor(i, d.color)} />;
      })}
    </svg>
  </ChartFrame>
);

export interface GanttItem {
  label: string;
  start: number;
  end: number;
  color?: string;
}

export const GanttChart: React.FC<{ data: GanttItem[]; title?: string; className?: string }> = ({ data, title, className }) => (
  <ChartFrame title={title} className={className}>
    <svg viewBox={`0 0 280 ${data.length * 28 + 16}`} className="f7-chart-svg">
      {data.map((d, i) => (
        <g key={d.label}>
          <text x="4" y={20 + i * 28} fontSize="10" fill="#1E8C86">{d.label}</text>
          <rect x={80 + d.start * 1.6} y={8 + i * 28} width={(d.end - d.start) * 1.6} height="16" rx="8" fill={chartColor(i, d.color)} />
        </g>
      ))}
    </svg>
  </ChartFrame>
);

export const HeatMapChart: React.FC<{ rows: string[]; cols: string[]; values: number[][]; title?: string; className?: string }> = ({
  rows,
  cols,
  values,
  title,
  className,
}) => (
  <ChartFrame title={title} className={className}>
    <svg viewBox={`0 0 ${cols.length * 28 + 40} ${rows.length * 28 + 24}`} className="f7-chart-svg">
      {rows.flatMap((row, r) =>
        cols.map((col, c) => {
          const v = values[r]?.[c] ?? 0;
          return <rect key={`${row}-${col}`} x={36 + c * 28} y={8 + r * 28} width="24" height="24" rx="6" fill={`rgba(43,168,162,${0.2 + v * 0.8})`} />;
        })
      )}
    </svg>
  </ChartFrame>
);

export const VennDiagramChart: React.FC<{ sets: SliceItem[]; title?: string; className?: string }> = ({ sets, title, className }) => (
  <ChartFrame title={title} legend={sets} className={className}>
    <svg viewBox="0 0 200 140" className="f7-chart-svg">
      <circle cx="80" cy="70" r="48" fill="#2BA8A266" stroke="#2BA8A2" />
      <circle cx="120" cy="70" r="48" fill="#FFD23F66" stroke="#E6B800" />
    </svg>
  </ChartFrame>
);

export interface TableChartColumn {
  key: string;
  header: string;
}

export function TableChart<T extends Record<string, unknown>>({
  columns,
  data,
  title,
  className = '',
}: {
  columns: TableChartColumn[];
  data: T[];
  title?: string;
  className?: string;
}) {
  return (
    <ChartFrame title={title} className={className}>
      <table className="f7-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>{columns.map((c) => <td key={c.key}>{String(row[c.key] ?? '')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </ChartFrame>
  );
}

FunnelChart.displayName = 'FunnelChart';
GanttChart.displayName = 'GanttChart';
HeatMapChart.displayName = 'HeatMapChart';
VennDiagramChart.displayName = 'VennDiagramChart';
TableChart.displayName = 'TableChart';
