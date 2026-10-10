import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface FunnelStage {
  key: string;
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  subtitle?: string;
  height?: number;
  showConversionRates?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a funnel stage is clicked */
  onStageClick?: (stage: FunnelStage, index: number) => void;
}

const DEFAULT_COLORS = ['#1C1917', '#44403C', '#57534E', '#78716C', '#A8A29E', '#D6D3D1'];

/**
 * ThoughtStream FunnelChart Component
 *
 * Minimalist pure SVG conversion funnel chart with trapezoid stages,
 * conversion/drop-off metric badges, hairline dividers, and tooltips.
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({
  stages,
  title,
  subtitle,
  height = 320,
  showConversionRates = true,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onStageClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const chartWidth = 600;
  const chartHeight = height;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 20;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const stageCount = stages.length;
  const stageHeight = innerHeight / (stageCount || 1);

  const maxValue = stages.length > 0 ? stages[0].value : 1;

  const stageGeometries = stages.map((stage, idx) => {
    const topVal = stage.value;
    const nextVal = idx < stageCount - 1 ? stages[idx + 1].value : stage.value * 0.7;

    const topRatio = Math.max(0.15, Math.min(1, topVal / (maxValue || 1)));
    const botRatio = Math.max(0.1, Math.min(1, nextVal / (maxValue || 1)));

    const topW = innerWidth * topRatio;
    const botW = innerWidth * botRatio;

    const topX1 = chartWidth / 2 - topW / 2;
    const topX2 = chartWidth / 2 + topW / 2;
    const botX1 = chartWidth / 2 - botW / 2;
    const botX2 = chartWidth / 2 + botW / 2;

    const y1 = paddingTop + idx * stageHeight;
    const y2 = y1 + stageHeight - 4; // 4px vertical gap

    const path = `M ${topX1} ${y1} L ${topX2} ${y1} L ${botX2} ${y2} L ${botX1} ${y2} Z`;

    const prevVal = idx > 0 ? stages[idx - 1].value : stage.value;
    const conversionPct = prevVal > 0 ? ((stage.value / prevVal) * 100).toFixed(1) + '%' : '100%';
    const overallPct = maxValue > 0 ? ((stage.value / maxValue) * 100).toFixed(1) + '%' : '100%';
    const color = stage.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

    return {
      ...stage,
      path,
      centerY: (y1 + y2) / 2,
      conversionPct,
      overallPct,
      color,
    };
  });

  const activeStage = hoveredIdx !== null ? stageGeometries[hoveredIdx] : null;

  const tooltipItems: ChartTooltipItem[] = activeStage
    ? [
        {
          label: 'Count',
          value: activeStage.value,
          formattedValue: valueFormatter(activeStage.value),
          color: activeStage.color,
        },
        {
          label: 'Stage Conversion',
          value: activeStage.conversionPct,
          color: activeStage.color,
        },
        {
          label: 'Total Retention',
          value: activeStage.overallPct,
          color: activeStage.color,
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
          {stageGeometries.map((geo, idx) => {
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={geo.key}
                className="ts-chart-funnel-step"
                onClick={() => onStageClick?.(geo, idx)}
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
                {/* Stage Polygon */}
                <path
                  d={geo.path}
                  fill={geo.color}
                  stroke="var(--ts-border-subtle)"
                  strokeWidth={1}
                  opacity={isHovered ? 0.9 : 1}
                />

                {/* Stage Label & Value */}
                <text
                  x={chartWidth / 2}
                  y={geo.centerY - 2}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  style={{
                    fontFamily: 'var(--ts-font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    pointerEvents: 'none',
                  }}
                >
                  {geo.label}
                </text>
                <text
                  x={chartWidth / 2}
                  y={geo.centerY + 14}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  style={{
                    fontFamily: 'var(--ts-font-mono)',
                    fontSize: '11px',
                    opacity: 0.85,
                    pointerEvents: 'none',
                  }}
                >
                  {valueFormatter(geo.value)} ({geo.overallPct})
                </text>

                {/* Conversion Badge on the right */}
                {showConversionRates && idx > 0 && (
                  <text
                    x={chartWidth - 24}
                    y={geo.centerY + 4}
                    textAnchor="end"
                    className="ts-chart-axis-tick"
                    style={{ fontWeight: 500 }}
                  >
                    ↓ {geo.conversionPct}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeStage?.label}
          items={tooltipItems}
          visible={hoveredIdx !== null}
        />
      </div>
    </div>
  );
};

FunnelChart.displayName = 'FunnelChart';
