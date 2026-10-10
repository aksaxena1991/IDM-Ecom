import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface ScatterPoint {
  id?: string;
  x: number;
  y: number;
  label?: string;
  category?: string;
  color?: string;
  size?: number; // Radius in px (default 4)
}

export interface ScatterPlotChartProps {
  data: ScatterPoint[];
  title?: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showTrendline?: boolean;
  valueFormatterX?: (value: number) => string;
  valueFormatterY?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a scatter point is clicked */
  onPointClick?: (point: ScatterPoint, index: number) => void;
}

const DEFAULT_POINT_COLOR = '#1C1917';

/**
 * ThoughtStream ScatterPlotChart Component
 *
 * Minimalist pure SVG X/Y scatter coordinate chart with optional trendline,
 * category styling, hairline axes, and tooltips.
 */
export const ScatterPlotChart: React.FC<ScatterPlotChartProps> = ({
  data,
  title,
  subtitle,
  xLabel,
  yLabel,
  height = 300,
  showTrendline = true,
  valueFormatterX = (v) => v.toLocaleString(),
  valueFormatterY = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onPointClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = 620;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const xVals = data.map((d) => d.x);
  const yVals = data.map((d) => d.y);

  let minX = xVals.length > 0 ? Math.min(...xVals) : 0;
  let maxX = xVals.length > 0 ? Math.max(...xVals) : 100;
  let minY = yVals.length > 0 ? Math.min(...yVals) : 0;
  let maxY = yVals.length > 0 ? Math.max(...yVals) : 100;

  const xMargin = (maxX - minX) * 0.08 || 1;
  const yMargin = (maxY - minY) * 0.08 || 1;

  minX = Math.floor(minX - xMargin);
  maxX = Math.ceil(maxX + xMargin);
  minY = Math.floor(minY - yMargin);
  maxY = Math.ceil(maxY + yMargin);

  const getSvgX = (x: number) => {
    const ratio = (x - minX) / (maxX - minX || 1);
    return paddingLeft + ratio * innerWidth;
  };

  const getSvgY = (y: number) => {
    const ratio = (y - minY) / (maxY - minY || 1);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  // Compute Linear Regression Trendline (y = slope * x + intercept)
  let trendline = null;
  if (showTrendline && data.length >= 2) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    data.forEach((p) => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumXX += p.x * p.x;
    });

    const denom = n * sumXX - sumX * sumX;
    if (denom !== 0) {
      const slope = (n * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / n;

      const x1 = minX;
      const y1 = slope * x1 + intercept;
      const x2 = maxX;
      const y2 = slope * x2 + intercept;

      trendline = {
        x1: getSvgX(x1),
        y1: getSvgY(y1),
        x2: getSvgX(x2),
        y2: getSvgY(y2),
      };
    }
  }

  const xTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minX + ((maxX - minX) / 4) * i;
    return { val, x: getSvgX(val) };
  });

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minY + ((maxY - minY) / 4) * (4 - i);
    return { val, y: getSvgY(val) };
  });

  const tooltipItems: ChartTooltipItem[] = hoveredPoint
    ? [
        {
          label: xLabel || 'X',
          value: hoveredPoint.x,
          formattedValue: valueFormatterX(hoveredPoint.x),
          color: hoveredPoint.color || DEFAULT_POINT_COLOR,
        },
        {
          label: yLabel || 'Y',
          value: hoveredPoint.y,
          formattedValue: valueFormatterY(hoveredPoint.y),
          color: hoveredPoint.color || DEFAULT_POINT_COLOR,
        },
        ...(hoveredPoint.category
          ? [
              {
                label: 'Category',
                value: hoveredPoint.category,
                color: hoveredPoint.color || DEFAULT_POINT_COLOR,
              },
            ]
          : []),
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
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="ts-chart-svg">
          {/* Gridlines */}
          {yTicks.map((tick, i) => (
            <line
              key={`gridy-${i}`}
              x1={paddingLeft}
              y1={tick.y}
              x2={paddingLeft + innerWidth}
              y2={tick.y}
              className="ts-chart-gridline"
            />
          ))}

          {/* Y Axis Ticks */}
          {yTicks.map((tick, i) => (
            <text
              key={`ytick-${i}`}
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="ts-chart-axis-tick"
            >
              {valueFormatterY(tick.val)}
            </text>
          ))}

          {/* X Axis Ticks */}
          {xTicks.map((tick, i) => (
            <text
              key={`xtick-${i}`}
              x={tick.x}
              y={chartHeight - 12}
              textAnchor="middle"
              className="ts-chart-axis-tick"
            >
              {valueFormatterX(tick.val)}
            </text>
          ))}

          {/* Trendline */}
          {trendline && (
            <line
              x1={trendline.x1}
              y1={trendline.y1}
              x2={trendline.x2}
              y2={trendline.y2}
              className="ts-chart-trendline"
            />
          )}

          {/* Scatter Points */}
          {data.map((point, idx) => {
            const px = getSvgX(point.x);
            const py = getSvgY(point.y);
            const r = point.size || 4;
            const color = point.color || DEFAULT_POINT_COLOR;
            const isHovered = hoveredPoint === point;

            return (
              <circle
                key={`pt-${idx}`}
                cx={px}
                cy={py}
                r={isHovered ? r + 2.5 : r}
                fill={color}
                stroke="var(--ts-color-bg)"
                strokeWidth={1.5}
                className="ts-chart-scatter-point"
                onClick={() => onPointClick?.(point, idx)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredPoint(point);
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
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={hoveredPoint?.label || 'Data Coordinate'}
          items={tooltipItems}
          visible={hoveredPoint !== null}
        />
      </div>
    </div>
  );
};

ScatterPlotChart.displayName = 'ScatterPlotChart';
