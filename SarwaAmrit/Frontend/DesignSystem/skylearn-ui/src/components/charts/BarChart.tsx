import React, { useState, useRef } from 'react';
import { SKYLEARN_CHART_COLORS } from './chartPalette.js';
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
  /** Where the legend sits. Header matches existing charts; footer centers it under the plot. */
  legendPlacement?: 'header' | 'footer';
  /** Paint each legend label in its series color */
  colorLegend?: boolean;
  showGrid?: boolean;
  /** Fixed top of the Y axis. Omit to scale from the data. */
  yMax?: number;
  /** Even Y-axis steps, such as 5 for 0, 5, 10, 15 */
  yTickStep?: number;
  /** Corner radius of each bar */
  barRadius?: number;
  /** Hairline stroke around each bar */
  barStroke?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a bar is clicked */
  onBarClick?: (dataPoint: { label: string; [key: string]: string | number }, seriesKey: string, groupIndex: number) => void;
}

const DEFAULT_COLORS = [...SKYLEARN_CHART_COLORS];

/**
 * SkyLearn BarChart Component
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
  legendPlacement = 'header',
  colorLegend = false,
  showGrid = true,
  yMax,
  yTickStep,
  barRadius = 0,
  barStroke = true,
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

  let scaleMax = yMax ?? maxVal;
  if (yMax == null) {
    if (scaleMax <= 0) scaleMax = 100;
    scaleMax = Math.ceil(scaleMax * 1.08);
  }
  if (scaleMax <= 0) scaleMax = 1;

  const getY = (val: number) => {
    const ratio = Math.max(0, val) / scaleMax;
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const groupWidth = innerWidth / (data.length || 1);
  const barPadding = 0.25; // 25% spacing between groups
  const usableGroupWidth = groupWidth * (1 - barPadding);
  const singleBarWidth = usableGroupWidth / (series.length || 1);

  const baselineY = paddingTop + innerHeight;

  const yTicks =
    yTickStep && yTickStep > 0
      ? Array.from(
          { length: Math.floor(scaleMax / yTickStep) + 1 },
          (_, i) => {
            const val = Math.round((scaleMax - i * yTickStep) * 1000) / 1000;
            return { val, y: getY(val) };
          }
        ).filter((tick) => tick.val >= 0)
      : Array.from({ length: 5 }, (_, i) => {
          const val = (scaleMax / 4) * (4 - i);
          return { val: Math.round(val), y: getY(val) };
        });

  const activeDataPoint = hoveredBar ? data[hoveredBar.dataIndex] : null;
  const activeSeries = hoveredBar
    ? series.find((s) => s.key === hoveredBar.seriesKey)
    : null;

  const legend = showLegend ? (
    <ul
      className={`sl-chart-legend ${
        legendPlacement === 'footer' ? 'sl-chart-legend--footer' : ''
      }`.trim()}
    >
      {series.map((s, idx) => {
        const color = s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
        return (
          <li key={s.key} className="sl-chart-legend-item">
            <span className="sl-chart-legend-color" style={{ backgroundColor: color }} />
            <span style={colorLegend ? { color } : undefined}>{s.label}</span>
          </li>
        );
      })}
    </ul>
  ) : null;

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
      className={`sl-chart-container ${borderless ? 'sl-chart-container--borderless' : ''} ${className}`.trim()}
      style={style}
    >
      {(title || subtitle || (showLegend && legendPlacement === 'header')) && (
        <div className="sl-chart-header">
          {(title || subtitle) && (
            <div className="sl-chart-title-group">
              {title && <h4 className="sl-chart-title">{title}</h4>}
              {subtitle && <p className="sl-chart-subtitle">{subtitle}</p>}
            </div>
          )}

          {legendPlacement === 'header' && legend}
        </div>
      )}

      <div className="sl-chart-canvas-wrapper">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="sl-chart-svg">
          {/* Horizontal Gridlines */}
          {showGrid &&
            yTicks.map((tick, i) => (
              <line
                key={`grid-${i}`}
                x1={paddingLeft}
                y1={tick.y}
                x2={paddingLeft + innerWidth}
                y2={tick.y}
                className="sl-chart-gridline"
              />
            ))}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={paddingLeft + innerWidth}
            y2={baselineY}
            className="sl-chart-axis-line"
          />

          {/* Y-Axis Ticks */}
          {yTicks.map((tick, i) => (
            <text
              key={`tick-${i}`}
              x={paddingLeft - 8}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              className="sl-chart-axis-tick"
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
                  className="sl-chart-axis-tick"
                >
                  {d.label}
                </text>

                {/* Bars for each series */}
                {series.map((s, seriesIdx) => {
                  const val = Number(d[s.key] ?? 0);
                  if (val <= 0) return null;
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
                      stroke={barStroke ? 'var(--sl-color-outline)' : 'none'}
                      strokeWidth={barStroke ? 1 : 0}
                      rx={barRadius}
                      className="sl-chart-bar"
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
      {legendPlacement === 'footer' && legend}
    </div>
  );
};

BarChart.displayName = 'BarChart';
