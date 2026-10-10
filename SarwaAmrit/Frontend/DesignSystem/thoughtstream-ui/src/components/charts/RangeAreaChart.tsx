import React, { useState, useRef, useId } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface RangeAreaDataPoint {
  label: string;
  min: number;
  max: number;
  median?: number;
}

export interface RangeAreaChartProps {
  data: RangeAreaDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showMedian?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when an active data point is clicked */
  onPointClick?: (point: RangeAreaDataPoint, index: number) => void;
}

const DEFAULT_RANGE_COLOR = '#57534E';

/**
 * ThoughtStream RangeAreaChart Component
 *
 * Minimalist pure SVG confidence band / range area chart with upper/lower bounds,
 * median baseline curve, hairline borders, crosshair tracking, and tooltips.
 */
export const RangeAreaChart: React.FC<RangeAreaChartProps> = ({
  data,
  title,
  subtitle,
  height = 260,
  color = DEFAULT_RANGE_COLOR,
  fillOpacity = 0.2,
  showMedian = true,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onPointClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gradientId = useId();

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  let minVal = Infinity;
  let maxVal = -Infinity;

  data.forEach((d) => {
    if (d.min < minVal) minVal = d.min;
    if (d.max > maxVal) maxVal = d.max;
  });

  if (minVal === Infinity || maxVal === -Infinity) {
    minVal = 0;
    maxVal = 100;
  }

  const spread = maxVal - minVal || 1;
  minVal = Math.floor(minVal - spread * 0.05);
  maxVal = Math.ceil(maxVal + spread * 0.05);

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  // Build the closed band path: forward along max line, backward along min line
  const maxPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.max) }));
  const minPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.min) }));

  const maxPathString = maxPoints.reduce(
    (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );

  const minPathStringReverse = [...minPoints]
    .reverse()
    .reduce((acc, p) => `${acc} L ${p.x} ${p.y}`, '');

  const bandPath = `${maxPathString} ${minPathStringReverse} Z`;

  const medianPath = showMedian
    ? data.reduce((acc, d, idx) => {
        const val = d.median !== undefined ? d.median : (d.min + d.max) / 2;
        return `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`;
      }, '')
    : '';

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) / 4) * (4 - i);
    return { val: Math.round(val), y: getY(val) };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || data.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    const scaleX = chartWidth / rect.width;
    const svgX = relX * scaleX;

    const boundedX = Math.max(paddingLeft, Math.min(paddingLeft + innerWidth, svgX));
    const normalized = (boundedX - paddingLeft) / innerWidth;
    const closestIdx = Math.round(normalized * (data.length - 1));

    setHoverIndex(closestIdx);
    setTooltipPos({ x: relX, y: relY });
  };

  const activeDataPoint = hoverIndex !== null ? data[hoverIndex] : null;

  const tooltipItems: ChartTooltipItem[] = activeDataPoint
    ? [
        {
          label: 'Upper Bound',
          value: activeDataPoint.max,
          formattedValue: valueFormatter(activeDataPoint.max),
          color,
        },
        ...(activeDataPoint.median !== undefined
          ? [
              {
                label: 'Median',
                value: activeDataPoint.median,
                formattedValue: valueFormatter(activeDataPoint.median),
                color: '#1C1917',
              },
            ]
          : []),
        {
          label: 'Lower Bound',
          value: activeDataPoint.min,
          formattedValue: valueFormatter(activeDataPoint.min),
          color,
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

      <div className="ts-chart-canvas-wrapper">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="ts-chart-svg"
          style={{ cursor: onPointClick ? 'pointer' : undefined }}
          onClick={() => {
            if (hoverIndex !== null && data[hoverIndex]) {
              onPointClick?.(data[hoverIndex], hoverIndex);
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.4} />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {yTicks.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={paddingLeft}
              y1={tick.y}
              x2={paddingLeft + innerWidth}
              y2={tick.y}
              className="ts-chart-gridline"
            />
          ))}

          {/* Y Ticks */}
          {yTicks.map((tick, i) => (
            <text
              key={`ytick-${i}`}
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="ts-chart-axis-tick"
            >
              {valueFormatter(tick.val)}
            </text>
          ))}

          {/* X Ticks */}
          {data.map((d, i) => {
            if (data.length > 8 && i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={`xtick-${i}`}
                x={getX(i)}
                y={chartHeight - 10}
                textAnchor="middle"
                className="ts-chart-axis-tick"
              >
                {d.label}
              </text>
            );
          })}

          {/* Band Shading */}
          <path d={bandPath} fill={`url(#${gradientId})`} />

          {/* Upper Bound Stroke */}
          <path
            d={maxPathString}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* Lower Bound Stroke */}
          <path
            d={minPoints.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* Median Line */}
          {showMedian && (
            <path
              d={medianPath}
              fill="none"
              stroke="#1C1917"
              strokeWidth={1.5}
            />
          )}

          {/* Crosshair Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={paddingTop + innerHeight}
              className="ts-chart-crosshair"
            />
          )}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeDataPoint?.label}
          items={tooltipItems}
          visible={hoverIndex !== null}
        />
      </div>
    </div>
  );
};

RangeAreaChart.displayName = 'RangeAreaChart';
