import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface DonutChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartItem[];
  title?: string;
  subtitle?: string;
  size?: number;
  innerRadiusRatio?: number; // default 0.65
  showLegend?: boolean;
  centerMetric?: {
    value?: string | number;
    label?: string;
  };
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a donut slice is clicked */
  onSliceClick?: (slice: DonutChartItem, index: number) => void;
}

const DEFAULT_COLORS = ['#1C1917', '#44403C', '#78716C', '#A8A29E', '#D6D3D1', '#57534E'];

/**
 * ThoughtStream DonutChart Component
 *
 * Minimalist pure SVG donut chart with central metric readout,
 * hairline borders, slice hover tracking, and monospace metric tooltips.
 */
export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  subtitle,
  size = 280,
  innerRadiusRatio = 0.65,
  showLegend = true,
  centerMetric,
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
  const outerRadius = center - 20;
  const innerRadius = outerRadius * Math.min(0.85, Math.max(0.3, innerRadiusRatio));

  const total = data.reduce((acc, item) => acc + Math.max(0, item.value), 0);

  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, idx) => {
    const value = Math.max(0, item.value);
    const fraction = total > 0 ? value / total : 0;
    const sliceAngle = fraction * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const ox1 = center + outerRadius * Math.cos(startAngle);
    const oy1 = center + outerRadius * Math.sin(startAngle);
    const ox2 = center + outerRadius * Math.cos(endAngle);
    const oy2 = center + outerRadius * Math.sin(endAngle);

    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(startAngle);
    const iy2 = center + innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let path = '';
    if (sliceAngle >= 2 * Math.PI - 0.0001) {
      path = `M ${center} ${center - outerRadius}
              A ${outerRadius} ${outerRadius} 0 1 1 ${center - 0.01} ${center - outerRadius}
              M ${center} ${center - innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 0 ${center - 0.01} ${center - innerRadius}
              Z`;
    } else {
      path = `M ${ox1} ${oy1}
              A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}
              L ${ix1} ${iy1}
              A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
              Z`;
    }

    const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';

    return {
      ...item,
      path,
      color,
      pct,
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
              <path
                key={slice.label + idx}
                d={slice.path}
                fill={slice.color}
                stroke="var(--ts-color-bg)"
                strokeWidth={1.5}
                className="ts-chart-slice"
                opacity={isHovered ? 0.88 : 1}
                onClick={() => onSliceClick?.(slice, idx)}
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
              />
            );
          })}

          {/* Central Metric */}
          <g style={{ pointerEvents: 'none' }}>
            <text
              x={center}
              y={center - 2}
              textAnchor="middle"
              style={{
                fontFamily: 'var(--ts-font-mono)',
                fontSize: '18px',
                fontWeight: 600,
                fill: 'var(--ts-color-text-primary)',
              }}
            >
              {activeSlice
                ? valueFormatter(activeSlice.value)
                : centerMetric?.value !== undefined
                ? String(centerMetric.value)
                : valueFormatter(total)}
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
                fill: 'var(--ts-color-text-tertiary)',
              }}
            >
              {activeSlice
                ? activeSlice.label
                : centerMetric?.label || 'Total'}
            </text>
          </g>
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
                    color: 'var(--ts-color-text-tertiary)',
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

DonutChart.displayName = 'DonutChart';
