import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface HeatMapCell {
  x: string | number; // Column key / label
  y: string | number; // Row key / label
  value: number;
}

export interface HeatMapChartProps {
  data: HeatMapCell[];
  xLabels?: string[];
  yLabels?: string[];
  title?: string;
  subtitle?: string;
  height?: number;
  colorRamp?: string[]; // e.g. ['#F5F5F4', '#D6D3D1', '#A8A29E', '#78716C', '#1C1917']
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a heatmap matrix cell is clicked */
  onCellClick?: (cell: HeatMapCell) => void;
}

const DEFAULT_COLOR_RAMP = [
  'var(--ts-color-bg-subtle)',
  '#D6D3D1',
  '#A8A29E',
  '#78716C',
  '#44403C',
  '#1C1917',
];

/**
 * ThoughtStream HeatMapChart Component
 *
 * Minimalist pure SVG 2D intensity matrix chart with 0px sharp rectangular cells,
 * monochrome tonal gradient, coordinate axes, and tooltips.
 */
export const HeatMapChart: React.FC<HeatMapChartProps> = ({
  data,
  xLabels: propXLabels,
  yLabels: propYLabels,
  title,
  subtitle,
  height = 280,
  colorRamp = DEFAULT_COLOR_RAMP,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onCellClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Derive unique x and y labels if not provided
  const xLabels = propXLabels || Array.from(new Set(data.map((d) => String(d.x))));
  const yLabels = propYLabels || Array.from(new Set(data.map((d) => String(d.y))));

  const paddingLeft = 60;
  const paddingBottom = 35;
  const paddingTop = 15;
  const paddingRight = 20;

  const chartWidth = 640;
  const chartHeight = height;

  const gridWidth = chartWidth - paddingLeft - paddingRight;
  const gridHeight = chartHeight - paddingTop - paddingBottom;

  const cellWidth = gridWidth / (xLabels.length || 1);
  const cellHeight = gridHeight / (yLabels.length || 1);

  // Compute min/max
  const values = data.map((d) => d.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;

  // Map coordinate pairs for rapid lookup
  const dataMap = new Map<string, number>();
  data.forEach((d) => {
    dataMap.set(`${d.x}-${d.y}`, d.value);
  });

  const getColor = (val: number) => {
    if (maxVal === minVal) return colorRamp[0];
    const ratio = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
    const index = Math.min(colorRamp.length - 1, Math.floor(ratio * colorRamp.length));
    return colorRamp[index];
  };

  const tooltipItems: ChartTooltipItem[] = hoveredCell
    ? [
        {
          label: `${hoveredCell.y} × ${hoveredCell.x}`,
          value: hoveredCell.value,
          formattedValue: valueFormatter(hoveredCell.value),
          color: getColor(hoveredCell.value),
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
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="ts-chart-svg">
          {/* Y Axis Labels */}
          {yLabels.map((yLab, rowIdx) => {
            const y = paddingTop + rowIdx * cellHeight + cellHeight / 2 + 4;
            return (
              <text
                key={`y-${yLab}`}
                x={paddingLeft - 10}
                y={y}
                textAnchor="end"
                className="ts-chart-axis-tick"
              >
                {yLab}
              </text>
            );
          })}

          {/* X Axis Labels */}
          {xLabels.map((xLab, colIdx) => {
            const x = paddingLeft + colIdx * cellWidth + cellWidth / 2;
            return (
              <text
                key={`x-${xLab}`}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="ts-chart-axis-tick"
              >
                {xLab}
              </text>
            );
          })}

          {/* Matrix Cells */}
          {yLabels.map((yLab, rowIdx) =>
            xLabels.map((xLab, colIdx) => {
              const val = dataMap.get(`${xLab}-${yLab}`) ?? minVal;
              const cellX = paddingLeft + colIdx * cellWidth + 1;
              const cellY = paddingTop + rowIdx * cellHeight + 1;
              const w = Math.max(1, cellWidth - 2);
              const h = Math.max(1, cellHeight - 2);
              const color = getColor(val);

              return (
                <rect
                  key={`cell-${xLab}-${yLab}`}
                  x={cellX}
                  y={cellY}
                  width={w}
                  height={h}
                  fill={color}
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={0.5}
                  className="ts-chart-heatmap-cell"
                  onClick={() => onCellClick?.({ x: xLab, y: yLab, value: val })}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredCell({ x: xLab, y: yLab, value: val });
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
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })
          )}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title="Intensity Reading"
          items={tooltipItems}
          visible={hoveredCell !== null}
        />
      </div>
    </div>
  );
};

HeatMapChart.displayName = 'HeatMapChart';
