import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface RadialChartItem {
  key: string;
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export interface RadialChartProps {
  data: RadialChartItem[];
  title?: string;
  subtitle?: string;
  height?: number;
  innerRadius?: number;
  ringWidth?: number;
  ringGap?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  centerMetric?: {
    value?: string | number;
    label?: string;
  };
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a concentric ring is clicked */
  onRingClick?: (item: RadialChartItem, index: number) => void;
}

const DEFAULT_COLORS = ['#78716C', '#A8A29E', '#57534E', '#1C1917', '#65A30D'];

/**
 * ThoughtStream RadialChart Component
 *
 * Minimalist SVG Concentric Radial Ring Chart featuring 0px butt caps,
 * hairline borders, central metric display, and interactive tooltips.
 */
export const RadialChart: React.FC<RadialChartProps> = ({
  data,
  title,
  subtitle,
  height = 280,
  innerRadius = 35,
  ringWidth = 14,
  ringGap = 8,
  showLegend = true,
  valueFormatter = (v) => `${v}%`,
  centerMetric,
  borderless = false,
  className = '',
  style,
  onRingClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const size = height;
  const center = size / 2;

  const activeItem = hoveredKey ? data.find((d) => d.key === hoveredKey) : null;

  const tooltipItems: ChartTooltipItem[] = activeItem
    ? [
        {
          label: activeItem.label,
          value: activeItem.value,
          formattedValue: valueFormatter(activeItem.value),
          color:
            activeItem.color ||
            DEFAULT_COLORS[data.indexOf(activeItem) % DEFAULT_COLORS.length],
        },
      ]
    : [];

  return (
    <div
      ref={containerRef}
      className={`ts-chart-container ${borderless ? 'ts-chart-container--borderless' : ''} ${className}`.trim()}
      style={style}
    >
      {(title || subtitle) && (
        <div className="ts-chart-header">
          <div className="ts-chart-title-group">
            {title && <h4 className="ts-chart-title">{title}</h4>}
            {subtitle && <p className="ts-chart-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      <div
        className="ts-chart-canvas-wrapper"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          {data.map((item, idx) => {
            const radius = innerRadius + idx * (ringWidth + ringGap) + ringWidth / 2;
            const circumference = 2 * Math.PI * radius;
            const maxVal = item.max ?? 100;
            const pct = Math.min(1, Math.max(0, item.value / maxVal));
            const strokeDashoffset = circumference * (1 - pct);
            const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const isHovered = hoveredKey === item.key;

            return (
              <g
                key={item.key}
                onClick={() => onRingClick?.(item, idx)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredKey(item.key);
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseMove={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltipPos({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredKey(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Background Ring Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={ringWidth}
                  strokeLinecap="butt"
                />

                {/* Progress Arc (rotated -90deg so it starts at 12 o'clock) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={ringWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${center} ${center})`}
                  opacity={isHovered ? 0.8 : 1}
                  style={{ transition: 'stroke-dashoffset 0.3s ease, opacity 0.15s ease' }}
                />
              </g>
            );
          })}

          {/* Center Metric */}
          {(centerMetric || activeItem) && (
            <g>
              <text
                x={center}
                y={center - 2}
                textAnchor="middle"
                className="ts-chart-center-val"
                style={{
                  fontFamily: 'var(--ts-font-mono)',
                  fontSize: '18px',
                  fontWeight: 600,
                  fill: 'var(--ts-text-primary)',
                }}
              >
                {activeItem
                  ? valueFormatter(activeItem.value)
                  : centerMetric?.value !== undefined
                  ? String(centerMetric.value)
                  : ''}
              </text>
              <text
                x={center}
                y={center + 16}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--ts-font-sans)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fill: 'var(--ts-text-muted)',
                }}
              >
                {activeItem ? activeItem.label : centerMetric?.label || ''}
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        {showLegend && (
          <ul
            className="ts-chart-legend"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingLeft: '16px',
              borderLeft: '1px solid var(--ts-border-subtle)',
            }}
          >
            {data.map((item, idx) => {
              const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
              const isHovered = hoveredKey === item.key;

              return (
                <li
                  key={item.key}
                  className="ts-chart-legend-item"
                  onMouseEnter={() => setHoveredKey(item.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    cursor: 'pointer',
                    opacity: hoveredKey && !isHovered ? 0.4 : 1,
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <span
                    className="ts-chart-legend-color"
                    style={{ backgroundColor: color }}
                  />
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      paddingLeft: '16px',
                      fontFamily: 'var(--ts-font-mono)',
                      color: 'var(--ts-text-muted)',
                      fontSize: '12px',
                    }}
                  >
                    {valueFormatter(item.value)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeItem?.label}
          items={tooltipItems}
          visible={hoveredKey !== null}
        />
      </div>
    </div>
  );
};

RadialChart.displayName = 'RadialChart';
