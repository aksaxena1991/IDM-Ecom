import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface BarChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface BarChartProps {
  data: Array<{
    label: string;
    [key: string]: string | number;
  }>;
  series: BarChartSeries[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a bar is clicked */
  onBarClick?: (dataPoint: { label: string; [key: string]: string | number }, seriesKey: string, groupIndex: number) => void;
}

const DEFAULT_COLORS = ['#78716C', '#A8A29E', '#57534E', '#1C1917', '#65A30D'];

/**
 * ThoughtStream BarChart Component
 *
 * Minimalist SVG Bar Chart featuring sharp 0px corners,
 * hairline borders, grouped multi-series layout, and tooltips.
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  series,
  title,
  subtitle,
  height = 260,
  showLegend = true,
  showGrid = true,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onBarClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBar, setHoveredBar] = useState<{
    dataIndex: number;
    seriesKey: string;
    x: number;
    y: number;
  } | null>(null);

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  let maxVal = -Infinity;
  series.forEach((s) => {
    data.forEach((d) => {
      const val = Number(d[s.key] ?? 0);
      if (val > maxVal) maxVal = val;
    });
  });

  if (maxVal <= 0) maxVal = 100;
  maxVal = Math.ceil(maxVal * 1.08);

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / maxVal;
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const groupWidth = innerWidth / (data.length || 1);
  const barPadding = 0.25; // 25% spacing between groups
  const usableGroupWidth = groupWidth * (1 - barPadding);
  const singleBarWidth = usableGroupWidth / (series.length || 1);

  const baselineY = paddingTop + innerHeight;

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * (4 - i);
    return { val: Math.round(val), y: getY(val) };
  });

  const activeDataPoint = hoveredBar ? data[hoveredBar.dataIndex] : null;
  const activeSeries = hoveredBar
    ? series.find((s) => s.key === hoveredBar.seriesKey)
    : null;

  const tooltipItems: ChartTooltipItem[] =
    activeDataPoint && activeSeries
      ? [
          {
            label: activeSeries.label,
            value: Number(activeDataPoint[activeSeries.key] ?? 0),
            formattedValue: valueFormatter(
              Number(activeDataPoint[activeSeries.key] ?? 0)
            ),
            color:
              activeSeries.color ||
              DEFAULT_COLORS[
                series.indexOf(activeSeries) % DEFAULT_COLORS.length
              ],
          },
        ]
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
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="ts-chart-svg">
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

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={paddingLeft + innerWidth}
            y2={baselineY}
            className="ts-chart-axis-line"
          />

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

          {/* X-Axis Ticks & Bars */}
          {data.map((d, groupIdx) => {
            const groupX = paddingLeft + groupIdx * groupWidth + (groupWidth * barPadding) / 2;

            return (
              <g key={`group-${groupIdx}`}>
                {/* X-Axis Label */}
                <text
                  x={groupX + usableGroupWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                >
                  {d.label}
                </text>

                {/* Bars for each series */}
                {series.map((s, seriesIdx) => {
                  const val = Number(d[s.key] ?? 0);
                  const barX = groupX + seriesIdx * singleBarWidth;
                  const barY = getY(val);
                  const barHeight = baselineY - barY;
                  const color = s.color || DEFAULT_COLORS[seriesIdx % DEFAULT_COLORS.length];

                  const isHovered =
                    hoveredBar?.dataIndex === groupIdx &&
                    hoveredBar?.seriesKey === s.key;

                  return (
                    <rect
                      key={`bar-${groupIdx}-${s.key}`}
                      x={barX}
                      y={barY}
                      width={Math.max(2, singleBarWidth - 2)}
                      height={Math.max(1, barHeight)}
                      fill={color}
                      stroke="var(--ts-border-subtle)"
                      strokeWidth={1}
                      rx={0}
                      className="ts-chart-bar"
                      opacity={isHovered ? 0.85 : 1}
                      onClick={() => onBarClick?.(d, s.key, groupIdx)}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredBar({
                            dataIndex: groupIdx,
                            seriesKey: s.key,
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={hoveredBar?.x ?? 0}
          y={hoveredBar?.y ?? 0}
          title={activeDataPoint?.label}
          items={tooltipItems}
          visible={hoveredBar !== null}
        />
      </div>
    </div>
  );
};

BarChart.displayName = 'BarChart';
