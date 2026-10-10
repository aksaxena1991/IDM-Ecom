import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface CandleDataPoint {
  label: string; // Date or time label
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandleChartProps {
  data: CandleDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  bullishColor?: string; // Up candle
  bearishColor?: string; // Down candle
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a candlestick is clicked */
  onCandleClick?: (candle: CandleDataPoint, index: number) => void;
}

/**
 * ThoughtStream CandleChart Component
 *
 * Minimalist pure SVG candlestick chart for OHLC and volatility data
 * with 0px sharp rectangular bodies, hairline wicks, and tooltips.
 */
export const CandleChart: React.FC<CandleChartProps> = ({
  data,
  title,
  subtitle,
  height = 280,
  bullishColor = '#57534E', // Muted stone/dark grey
  bearishColor = '#1C1917', // Solid black
  valueFormatter = (v) => v.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  borderless = false,
  className = '',
  style,
  onCandleClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = 620;
  const chartHeight = height;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  let minVal = Infinity;
  let maxVal = -Infinity;

  data.forEach((d) => {
    if (d.low < minVal) minVal = d.low;
    if (d.high > maxVal) maxVal = d.high;
  });

  if (minVal === Infinity || maxVal === -Infinity) {
    minVal = 0;
    maxVal = 100;
  }

  // 5% margin
  const spread = maxVal - minVal || 1;
  minVal = Math.floor(minVal - spread * 0.05);
  maxVal = Math.ceil(maxVal + spread * 0.05);

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal);
    return paddingTop + innerHeight - ratio * innerHeight;
  };

  const candleSlotWidth = innerWidth / (data.length || 1);
  const candleBodyWidth = Math.max(3, candleSlotWidth * 0.6);

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) / 4) * (4 - i);
    return { val, y: getY(val) };
  });

  const activePoint = hoveredIdx !== null ? data[hoverIdxSafe(hoveredIdx, data.length)] : null;

  function hoverIdxSafe(idx: number, len: number) {
    return Math.max(0, Math.min(len - 1, idx));
  }

  const tooltipItems: ChartTooltipItem[] = activePoint
    ? [
        {
          label: 'Open',
          value: activePoint.open,
          formattedValue: valueFormatter(activePoint.open),
          color: activePoint.close >= activePoint.open ? bullishColor : bearishColor,
        },
        {
          label: 'High',
          value: activePoint.high,
          formattedValue: valueFormatter(activePoint.high),
          color: activePoint.close >= activePoint.open ? bullishColor : bearishColor,
        },
        {
          label: 'Low',
          value: activePoint.low,
          formattedValue: valueFormatter(activePoint.low),
          color: activePoint.close >= activePoint.open ? bullishColor : bearishColor,
        },
        {
          label: 'Close',
          value: activePoint.close,
          formattedValue: valueFormatter(activePoint.close),
          color: activePoint.close >= activePoint.open ? bullishColor : bearishColor,
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

          {/* Y-Axis Ticks */}
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

          {/* Candlesticks */}
          {data.map((candle, idx) => {
            const isBullish = candle.close >= candle.open;
            const slotCenterX = paddingLeft + idx * candleSlotWidth + candleSlotWidth / 2;
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));
            const bodyColor = isBullish ? bullishColor : bearishColor;

            return (
              <g
                key={`candle-${idx}`}
                className="ts-chart-candle-group"
                style={{ cursor: onCandleClick ? 'pointer' : undefined }}
                onClick={() => onCandleClick?.(candle, idx)}
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
                {/* Wick High to Low */}
                <line
                  x1={slotCenterX}
                  y1={highY}
                  x2={slotCenterX}
                  y2={lowY}
                  stroke={bodyColor}
                  strokeWidth={1}
                  className="ts-chart-candle-wick"
                />

                {/* Candle Body */}
                <rect
                  x={slotCenterX - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={bodyHeight}
                  fill={isBullish ? 'var(--ts-color-bg)' : bodyColor}
                  stroke={bodyColor}
                  strokeWidth={1.5}
                  className="ts-chart-candle-body"
                />

                {/* X-Axis Tick Label */}
                {data.length <= 12 || idx % 2 === 0 ? (
                  <text
                    x={slotCenterX}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="ts-chart-axis-tick"
                  >
                    {candle.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activePoint?.label}
          items={tooltipItems}
          visible={hoveredIdx !== null}
        />
      </div>
    </div>
  );
};

CandleChart.displayName = 'CandleChart';
