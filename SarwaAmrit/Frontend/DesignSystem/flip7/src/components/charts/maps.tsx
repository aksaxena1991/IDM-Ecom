import React from 'react';
import { ChartFrame } from './frame';
import { chartColor } from './palette';

export interface MapPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  value?: number;
}

const Board: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg viewBox="0 0 200 140" className="f7-chart-svg">
    <rect x="8" y="8" width="184" height="124" rx="20" fill="#E8F6F5" />
    <ellipse cx="100" cy="70" rx="70" ry="42" fill="#2BA8A2" opacity="0.35" />
    {children}
  </svg>
);

export const PinMapChart: React.FC<{ points: MapPoint[]; title?: string; className?: string }> = ({ points, title, className }) => (
  <ChartFrame title={title} className={className}>
    <Board>
      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r="6" fill={chartColor(i)} stroke="#1E8C86" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill="#1E8C86">{p.label}</text>
        </g>
      ))}
    </Board>
  </ChartFrame>
);

export const RouteMapChart: React.FC<{ points: MapPoint[]; title?: string; className?: string }> = ({ points, title, className }) => (
  <ChartFrame title={title} className={className}>
    <Board>
      <polyline fill="none" stroke="#FFD23F" strokeWidth="3" points={points.map((p) => `${p.x},${p.y}`).join(' ')} />
      {points.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="5" fill="#EF6C4A" />)}
    </Board>
  </ChartFrame>
);

export const ConnectionMapChart: React.FC<{ points: MapPoint[]; links?: Array<[number, number]>; title?: string; className?: string }> = ({
  points,
  links,
  title,
  className,
}) => {
  const edges = links ?? points.slice(1).map((_, i) => [0, i + 1] as [number, number]);
  return (
    <ChartFrame title={title} className={className}>
      <Board>
        {edges.map(([a, b], i) => (
          <line key={i} x1={points[a]?.x} y1={points[a]?.y} x2={points[b]?.x} y2={points[b]?.y} stroke="#5DADE2" strokeWidth="2" />
        ))}
        {points.map((p, i) => <circle key={p.id} cx={p.x} cy={p.y} r="6" fill={chartColor(i)} />)}
      </Board>
    </ChartFrame>
  );
};

export const DensityMapChart: React.FC<{ points: MapPoint[]; title?: string; className?: string }> = ({ points, title, className }) => (
  <ChartFrame title={title} className={className}>
    <Board>
      {points.map((p) => (
        <circle key={p.id} cx={p.x} cy={p.y} r={8 + (p.value ?? 4)} fill="#EF6C4A55" stroke="#D45233" />
      ))}
    </Board>
  </ChartFrame>
);

PinMapChart.displayName = 'PinMapChart';
RouteMapChart.displayName = 'RouteMapChart';
ConnectionMapChart.displayName = 'ConnectionMapChart';
DensityMapChart.displayName = 'DensityMapChart';
