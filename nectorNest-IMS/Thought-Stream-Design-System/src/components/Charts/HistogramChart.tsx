import React, { useState, useRef, useMemo } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface HistogramBin {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface HistogramChartProps {
  data?: number[]; // Raw values to automatically bin
  bins?: HistogramBin[]; // Or explicit pre-calculated bins
  binCount?: number; // Number of bins if passing raw values (default 8)
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  showCurve?: boolean;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a frequency distribution bin is clicked */
  onBinClick?: (bin: HistogramBin, index: number) => void;
}

const DEFAULT_HISTO_COLOR = '#1C1917';

/**
 * ThoughtStream HistogramChart Component
 *
 * Minimalist pure SVG frequency distribution chart with contiguous 0px bars,
 * optional normal distribution curve, hairline ticks, and tooltips.
 */
export const HistogramChart: React.FC<HistogramChartProps> = ({
  data,
  bins: propBins,
  binCount = 8,
  title,
  subtitle,
  height = 260,
  color = DEFAULT_HISTO_COLOR,
  showCurve = false,
  borderless = false,
  className = '',
  style,
  onBinClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const calculatedBins = useMemo<HistogramBin[]>(() => {
    if (propBins && propBins.length > 0) return propBins;
    if (!data || data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / (binCount || 1) || 1;

    const result: HistogramBin[] = Array.from({ length: binCount }, (_, i) => {
      const bMin = min + i * step;
      const bMax = bMin + step;
      return {
        label: `${Math.round(bMin)}–${Math.round(bMax)}`,
        min: bMin,
        max: bMax,
        count: 0,
      };
    });

    data.forEach((val) => {
      let bIdx = Math.floor((val - min) / step);
      if (bIdx >= binCount) bIdx = binCount - 1;
      if (bIdx < 0) bIdx = 0;
      result[bIdx].count++;
    });

    return result;
  }, [data, propBins, binCount]);

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = 600;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxCount = Math.max(...calculatedBins.map((b) => b.count), 1);
  const maxAxis = Math.ceil(maxCount * 1.15);

  const getY = (val: number) => {
    const ratio = val / maxAxis;
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const barWidth = innerWidth / (calculatedBins.length || 1);
  const baselineY = paddingTop + innerHeight;

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxAxis / 4) * (4 - i);
    return { val: Math.round(val), y: getY(val) };
  });

  const activeBin = hoveredIdx !== null ? calculatedBins[hoveredIdx] : null;

  const tooltipItems: ChartTooltipItem[] = activeBin
    ? [
        {
          label: 'Frequency',
          value: activeBin.count,
          formattedValue: `${activeBin.count} occurrences`,
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
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="ts-chart-svg">
          {/* Horizontal Gridlines */}
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

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={paddingLeft + innerWidth}
            y2={baselineY}
            className="ts-chart-axis-line"
          />

          {/* Y Ticks */}
          {yTicks.map((tick, i) => (
            <text
              key={`ytick-${i}`}
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="ts-chart-axis-tick"
            >
              {tick.val}
            </text>
          ))}

          {/* Histogram Contiguous Bars */}
          {calculatedBins.map((bin, idx) => {
            const bx = paddingLeft + idx * barWidth;
            const by = getY(bin.count);
            const bh = baselineY - by;
            const isHovered = hoveredIdx === idx;

            return (
              <g key={`bin-${idx}`}>
                <rect
                  x={bx + 1}
                  y={by}
                  width={Math.max(2, barWidth - 2)}
                  height={Math.max(1, bh)}
                  fill={color}
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={0.5}
                  opacity={isHovered ? 0.85 : 0.95}
                  className="ts-chart-bar"
                  onClick={() => onBinClick?.(bin, idx)}
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

                {/* X-Axis Bin Label */}
                <text
                  x={bx + barWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                >
                  {bin.label}
                </text>
              </g>
            );
          })}

          {/* Optional Normal Distribution Bell Curve */}
          {showCurve && calculatedBins.length > 2 && (
            <path
              d={calculatedBins.reduce((acc, bin, i) => {
                const x = paddingLeft + i * barWidth + barWidth / 2;
                const y = getY(bin.count);
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="var(--ts-color-text-primary)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeBin?.label ? `Bin: ${activeBin.label}` : 'Frequency'}
          items={tooltipItems}
          visible={hoveredIdx !== null}
        />
      </div>
    </div>
  );
};

HistogramChart.displayName = 'HistogramChart';
