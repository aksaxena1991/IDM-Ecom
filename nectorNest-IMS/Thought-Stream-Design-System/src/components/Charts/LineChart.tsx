import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface LineChartSeries {
  key: string;
  label: string;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export interface LineChartProps {
  data: Array<{
    label: string;
    [key: string]: string | number;
  }>;
  series: LineChartSeries[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  curve?: 'linear' | 'smooth';
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a data point circle is clicked */
  onPointClick?: (point: { label: string; [key: string]: string | number }, seriesKey: string, index: number) => void;
}

const DEFAULT_COLORS = ['#78716C', '#A8A29E', '#57534E', '#1C1917', '#65A30D'];

/**
 * ThoughtStream LineChart Component
 *
 * Minimalist, high-precision SVG line chart with hairline borders,
 * monospace axes, crosshair tracking, and floating tooltips.
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 260,
  showLegend = true,
  showGrid = true,
  curve = 'linear',
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onPointClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dimensions
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Compute min / max values
  let minVal = Infinity;
  let maxVal = -Infinity;

  series.forEach((s) => {
    data.forEach((d) => {
      const val = Number(d[s.key] ?? 0);
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    });
  });

  if (minVal === Infinity) minVal = 0;
  if (maxVal === -Infinity) maxVal = 100;
  if (minVal > 0) minVal = 0; // baseline at 0
  if (maxVal === minVal) maxVal += 10;

  // Add 10% breathing room to max
  maxVal = Math.ceil(maxVal * 1.05);

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + innerWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * innerWidth;
  };

  // Generate SVG Path
  const generatePath = (key: string): string => {
    if (data.length === 0) return '';

    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(Number(d[key] ?? 0)),
    }));

    if (curve === 'smooth' && points.length > 2) {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return path;
    }

    return points.reduce(
      (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
      ''
    );
  };

  // Y-axis tick intervals (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) / 4) * (4 - i);
    return { val: Math.round(val), y: getY(val) };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || data.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    // Convert to SVG coord space
    const scaleX = chartWidth / rect.width;
    const svgX = relX * scaleX;

    const boundedX = Math.max(paddingLeft, Math.min(paddingLeft + innerWidth, svgX));
    const normalized = (boundedX - paddingLeft) / innerWidth;
    const closestIdx = Math.round(normalized * (data.length - 1));

    setHoverIndex(closestIdx);
    setTooltipPos({ x: relX, y: relY });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeDataPoint = hoverIndex !== null ? data[hoverIndex] : null;

  const tooltipItems: ChartTooltipItem[] = activeDataPoint
    ? series.map((s, idx) => {
        const val = Number(activeDataPoint[s.key] ?? 0);
        return {
          label: s.label,
          value: val,
          formattedValue: valueFormatter(val),
          color: s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        };
      })
    : [];

  return (
    <div
      ref={containerRef}
      className={`ts-chart-container ${borderless ? 'ts-chart-container--borderless' : ''} ${className}`.trim()}
      style={style}
    >
      {(title || subtitle || showLegend) && (
        <div className="ts-chart-header">
          {(title || subtitle) && (
            <div className="ts-chart-title-group">
              {title && <h4 className="ts-chart-title">{title}</h4>}
              {subtitle && <p className="ts-chart-subtitle">{subtitle}</p>}
            </div>
          )}

          {showLegend && (
            <ul className="ts-chart-legend">
              {series.map((s, idx) => (
                <li key={s.key} className="ts-chart-legend-item">
                  <span
                    className="ts-chart-legend-color"
                    style={{ backgroundColor: s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }}
                  />
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="ts-chart-canvas-wrapper">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="ts-chart-svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal Gridlines */}
          {showGrid &&
            yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={paddingLeft}
                y1={tick.y}
                x2={paddingLeft + innerWidth}
                y2={tick.y}
                className="ts-chart-gridline"
              />
            ))}

          {/* Y-Axis Ticks */}
          {yTicks.map((tick, i) => (
            <text
              key={`tick-${i}`}
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="ts-chart-axis-tick"
            >
              {valueFormatter(tick.val)}
            </text>
          ))}

          {/* X-Axis Ticks */}
          {data.map((d, i) => {
            // Skip alternate ticks if there are too many items
            if (data.length > 8 && i % 2 !== 0 && i !== data.length - 1) return null;
            const x = getX(i);
            return (
              <text
                key={`x-tick-${i}`}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="ts-chart-axis-tick"
              >
                {d.label}
              </text>
            );
          })}

          {/* Series Lines */}
          {series.map((s, idx) => {
            const color = s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            const strokeWidth = s.strokeWidth || 2;
            const pathData = generatePath(s.key);

            return (
              <g key={s.key}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={s.dashed ? '4 4' : undefined}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />

                {/* Data Points */}
                {data.map((d, i) => {
                  const x = getX(i);
                  const y = getY(Number(d[s.key] ?? 0));
                  const isHovered = hoverIndex === i;

                  return (
                    <circle
                      key={`pt-${i}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 4.5 : 3}
                      stroke={color}
                      style={{ cursor: onPointClick ? 'pointer' : undefined }}
                      onClick={() => onPointClick?.(d, s.key, i)}
                      className={[
                        'ts-chart-point',
                        isHovered ? 'ts-chart-point--active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Active Hover Crosshair Vertical Line */}
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

        {/* Floating Tooltip */}
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

LineChart.displayName = 'LineChart';
