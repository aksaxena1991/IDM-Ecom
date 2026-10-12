import React from 'react';
import { ChartFrame } from './frame';
import { chartColor } from './palette';

export interface SliceItem {
  label: string;
  value: number;
  color?: string;
}

export interface SliceChartProps {
  data: SliceItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

function slices(data: SliceItem[]) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  return data.map((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const start = angle;
    angle += sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const r = 60;
    const cx = 80;
    const cy = 80;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: chartColor(i, d.color), label: d.label };
  });
}

export const PieChart: React.FC<SliceChartProps> = ({ data, title, subtitle, className }) => (
  <ChartFrame title={title} subtitle={subtitle} legend={data} className={className}>
    <svg viewBox="0 0 160 160" className="f7-chart-svg">
      {slices(data).map((s) => <path key={s.label} d={s.d} fill={s.color} />)}
    </svg>
  </ChartFrame>
);

export const DonutChart: React.FC<SliceChartProps> = ({ data, title, subtitle, className }) => (
  <ChartFrame title={title} subtitle={subtitle} legend={data} className={className}>
    <svg viewBox="0 0 160 160" className="f7-chart-svg">
      {slices(data).map((s) => <path key={s.label} d={s.d} fill={s.color} />)}
      <circle cx="80" cy="80" r="34" fill="#FFFFFF" />
    </svg>
  </ChartFrame>
);

export const RadialChart: React.FC<SliceChartProps> = ({ data, title, subtitle, className }) => (
  <ChartFrame title={title} subtitle={subtitle} legend={data} className={className}>
    <svg viewBox="0 0 200 200" className="f7-chart-svg">
      {data.map((d, i) => {
        const r = 30 + i * 16;
        const pct = Math.min(1, d.value / 100);
        const dash = 2 * Math.PI * r;
        return (
          <circle
            key={d.label}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={chartColor(i, d.color)}
            strokeWidth="10"
            strokeDasharray={`${dash * pct} ${dash}`}
            transform="rotate(-90 100 100)"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  </ChartFrame>
);

export const GaugeChart: React.FC<{ value: number; max?: number; title?: string; subtitle?: string; className?: string }> = ({
  value,
  max = 100,
  title,
  subtitle,
  className,
}) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = Math.PI * 70;
  return (
    <ChartFrame title={title} subtitle={subtitle} className={className}>
      <svg viewBox="0 0 200 120" className="f7-chart-svg">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E8F6F5" strokeWidth="16" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#FFD23F" strokeWidth="16" strokeDasharray={`${dash * pct} ${dash}`} strokeLinecap="round" />
        <text x="100" y="96" textAnchor="middle" fontWeight="800" fontSize="22" fill="#1E8C86">{value}</text>
      </svg>
    </ChartFrame>
  );
};

export const RadarChart: React.FC<SliceChartProps> = ({ data, title, subtitle, className }) => {
  const cx = 90;
  const cy = 90;
  const r = 60;
  const pts = data.map((d, i) => {
    const a = -Math.PI / 2 + (i / data.length) * Math.PI * 2;
    const rr = r * Math.min(1, d.value / 100);
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  });
  return (
    <ChartFrame title={title} subtitle={subtitle} legend={data} className={className}>
      <svg viewBox="0 0 180 180" className="f7-chart-svg">
        <polygon points={data.map((_, i) => {
          const a = -Math.PI / 2 + (i / data.length) * Math.PI * 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(' ')} fill="none" stroke="#3CC4BD" />
        <polygon points={pts.join(' ')} fill="#FFD23F55" stroke="#FFD23F" />
      </svg>
    </ChartFrame>
  );
};

PieChart.displayName = 'PieChart';
DonutChart.displayName = 'DonutChart';
