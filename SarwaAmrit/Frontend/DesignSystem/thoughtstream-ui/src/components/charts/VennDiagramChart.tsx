import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface VennSetItem {
  key: string;
  label: string;
  value: number;
  color?: string;
}

export interface VennIntersection {
  sets: string[]; // e.g. ['A', 'B']
  label?: string;
  value: number;
}

export interface VennDiagramChartProps {
  sets: VennSetItem[]; // 2 or 3 sets supported
  intersections?: VennIntersection[];
  title?: string;
  subtitle?: string;
  size?: number;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a set circle is clicked */
  onSetClick?: (set: VennSetItem, index: number) => void;
  /** Callback fired when the intersection region is clicked */
  onIntersectionClick?: (intersection: VennIntersection) => void;
}

const DEFAULT_SET_COLORS = ['#1C1917', '#78716C', '#A8A29E'];

/**
 * ThoughtStream VennDiagramChart Component
 *
 * Minimalist pure SVG 2-set and 3-set Venn diagram with translucent intersection
 * shading, hairline set perimeters, monospace set values, and tooltips.
 */
export const VennDiagramChart: React.FC<VennDiagramChartProps> = ({
  sets,
  intersections = [],
  title,
  subtitle,
  size = 320,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onSetClick,
  onIntersectionClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<{
    label: string;
    value: number;
    color: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const center = size / 2;
  const is3Sets = sets.length >= 3;

  // Geometry for 2 sets vs 3 sets
  const radius = is3Sets ? size * 0.28 : size * 0.32;
  const distance = is3Sets ? radius * 0.85 : radius * 0.75;

  const circlePositions = is3Sets
    ? [
        { cx: center, cy: center - distance * 0.65 }, // Top
        { cx: center - distance * 0.866, cy: center + distance * 0.5 }, // Bottom Left
        { cx: center + distance * 0.866, cy: center + distance * 0.5 }, // Bottom Right
      ]
    : [
        { cx: center - distance, cy: center }, // Left
        { cx: center + distance, cy: center }, // Right
      ];

  const tooltipItems: ChartTooltipItem[] = hoveredRegion
    ? [
        {
          label: hoveredRegion.label,
          value: hoveredRegion.value,
          formattedValue: valueFormatter(hoveredRegion.value),
          color: hoveredRegion.color,
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
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          {/* Sets Circles */}
          {sets.slice(0, 3).map((set, idx) => {
            const pos = circlePositions[idx];
            const color = set.color || DEFAULT_SET_COLORS[idx % DEFAULT_SET_COLORS.length];

            return (
              <g key={set.key}>
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={radius}
                  fill={color}
                  fillOpacity={0.18}
                  stroke={color}
                  strokeWidth={1.5}
                  className="ts-chart-venn-circle"
                  onClick={() => onSetClick?.(set, idx)}
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setHoveredRegion({
                        label: set.label,
                        value: set.value,
                        color,
                      });
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
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Set Labels */}
                <text
                  x={pos.cx}
                  y={idx === 0 && is3Sets ? pos.cy - radius + 22 : pos.cy}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'var(--ts-font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    fill: 'var(--ts-color-text-primary)',
                    pointerEvents: 'none',
                  }}
                >
                  {set.label}
                </text>
                <text
                  x={pos.cx}
                  y={idx === 0 && is3Sets ? pos.cy - radius + 36 : pos.cy + 14}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'var(--ts-font-mono)',
                    fontSize: '11px',
                    fill: 'var(--ts-color-text-secondary)',
                    pointerEvents: 'none',
                  }}
                >
                  {valueFormatter(set.value)}
                </text>
              </g>
            );
          })}

          {/* Central Intersection Indicator for 2 or 3 sets */}
          {intersections.length > 0 && (
            <g
              onClick={() => onIntersectionClick?.(intersections[0])}
              onMouseEnter={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                const inter = intersections[0];
                if (rect && inter) {
                  setHoveredRegion({
                    label: inter.label || inter.sets.join(' ∩ '),
                    value: inter.value,
                    color: '#1C1917',
                  });
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseLeave={() => setHoveredRegion(null)}
              style={{ cursor: 'pointer' }}
            >
              <text
                x={center}
                y={center + (is3Sets ? 6 : 4)}
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--ts-font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  fill: 'var(--ts-color-text-primary)',
                }}
              >
                {valueFormatter(intersections[0].value)}
              </text>
            </g>
          )}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title="Set Membership"
          items={tooltipItems}
          visible={hoveredRegion !== null}
        />
      </div>
    </div>
  );
};

VennDiagramChart.displayName = 'VennDiagramChart';
