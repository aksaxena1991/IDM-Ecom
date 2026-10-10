import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface PieChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartItem[];
  title?: string;
  subtitle?: string;
  size?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a pie slice is clicked */
  onSliceClick?: (slice: PieChartItem, index: number) => void;
}

const DEFAULT_COLORS = ['#1C1917', '#44403C', '#78716C', '#A8A29E', '#D6D3D1', '#57534E'];

/**
 * ThoughtStream PieChart Component
 *
 * Minimalist pure SVG pie chart with hairline borders,
 * slice hover tracking, and monospace metric tooltips.
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  size = 280,
  showLegend = true,
  showLabels = false,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onSliceClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const center = size / 2;
  const radius = center - 24;

  const total = data.reduce((acc, item) => acc + Math.max(0, item.value), 0);

  // Compute angles
  let currentAngle = -Math.PI / 2; // start at 12 o'clock
  const slices = data.map((item, idx) => {
    const value = Math.max(0, item.value);
    const fraction = total > 0 ? value / total : 0;
    const sliceAngle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;
    currentAngle = endAngle;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path =
      sliceAngle >= 2 * Math.PI - 0.0001
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`
        : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const labelRadius = radius * 0.65;
    const lx = center + labelRadius * Math.cos(midAngle);
    const ly = center + labelRadius * Math.sin(midAngle);

    const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';

    return {
      ...item,
      path,
      color,
      pct,
      lx,
      ly,
      fraction,
    };
  });

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  const tooltipItems: ChartTooltipItem[] = activeSlice
    ? [
        {
          label: activeSlice.label,
          value: activeSlice.value,
          formattedValue: `${valueFormatter(activeSlice.value)} (${activeSlice.pct})`,
          color: activeSlice.color,
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
          {slices.map((slice, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={slice.label + idx}
                onClick={() => onSliceClick?.(slice, idx)}
                style={{ cursor: onSliceClick ? 'pointer' : undefined }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredIdx(idx);
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
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke="var(--ts-color-bg)"
                  strokeWidth={1.5}
                  className="ts-chart-slice"
                  opacity={isHovered ? 0.9 : 1}
                />
                {showLabels && slice.fraction > 0.05 && (
                  <text
                    x={slice.lx}
                    y={slice.ly + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    style={{
                      fontFamily: 'var(--ts-font-mono)',
                      fontSize: '11px',
                      fontWeight: 600,
                      pointerEvents: 'none',
                    }}
                  >
                    {slice.pct}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

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
            {slices.map((slice, idx) => (
              <li
                key={slice.label + idx}
                className="ts-chart-legend-item"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  cursor: 'pointer',
                  opacity: hoveredIdx !== null && hoveredIdx !== idx ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <span className="ts-chart-legend-color" style={{ backgroundColor: slice.color }} />
                <span>{slice.label}</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    paddingLeft: '16px',
                    fontFamily: 'var(--ts-font-mono)',
                    color: 'var(--ts-text-muted)',
                    fontSize: '12px',
                  }}
                >
                  {slice.pct}
                </span>
              </li>
            ))}
          </ul>
        )}

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeSlice?.label}
          items={tooltipItems}
          visible={hoveredIdx !== null}
        />
      </div>
    </div>
  );
};

PieChart.displayName = 'PieChart';
