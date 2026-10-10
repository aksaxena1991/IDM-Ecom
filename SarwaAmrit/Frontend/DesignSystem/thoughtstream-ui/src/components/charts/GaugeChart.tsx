import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface GaugeZone {
  label: string;
  from: number;
  to: number;
  color: string;
}

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  zones?: GaugeZone[];
  title?: string;
  subtitle?: string;
  unit?: string;
  size?: number;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when the gauge is clicked */
  onGaugeClick?: (value: number) => void;
}

const DEFAULT_ZONES: GaugeZone[] = [
  { label: 'Low', from: 0, to: 33, color: '#A8A29E' },
  { label: 'Optimal', from: 33, to: 66, color: '#57534E' },
  { label: 'High', from: 66, to: 100, color: '#1C1917' },
];

/**
 * ThoughtStream GaugeChart Component
 *
 * Minimalist pure SVG semicircular gauge with threshold arc segments,
 * hairline pointer needle, center metric display, and tooltips.
 */
export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  zones = DEFAULT_ZONES,
  title,
  subtitle,
  unit = '',
  size = 280,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onGaugeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const width = size;
  const height = size * 0.65;
  const cx = width / 2;
  const cy = height - 20;
  const radius = Math.min(cx - 24, cy - 10);
  const strokeWidth = 14;

  const boundedVal = Math.min(max, Math.max(min, value));
  const valFraction = (boundedVal - min) / (max - min || 1);

  // Gauge spans 180 degrees: from Math.PI (180deg - left) to 0 (0deg - right)
  const needleAngle = Math.PI * (1 - valFraction);

  // Needle tip
  const needleLength = radius - 8;
  const nx = cx - needleLength * Math.cos(needleAngle);
  const ny = cy - needleLength * Math.sin(needleAngle);

  // Active zone
  const currentZone = zones.find((z) => boundedVal >= z.from && boundedVal <= z.to) || zones[0];

  const tooltipItems: ChartTooltipItem[] = [
    {
      label: 'Value',
      value: `${valueFormatter(boundedVal)}${unit ? ' ' + unit : ''}`,
      color: currentZone?.color || '#1C1917',
    },
    ...(currentZone
      ? [
          {
            label: 'Zone',
            value: currentZone.label,
            color: currentZone.color,
          },
        ]
      : []),
  ];

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
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          style={{ overflow: 'visible', cursor: onGaugeClick ? 'pointer' : undefined }}
          onClick={() => onGaugeClick?.(boundedVal)}
          onMouseEnter={(e) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setIsHovered(true);
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
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="var(--ts-border-subtle)"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />

          {/* Zones Arcs */}
          {zones.map((zone, idx) => {
            const zStartRatio = Math.max(0, Math.min(1, (zone.from - min) / (max - min || 1)));
            const zEndRatio = Math.max(0, Math.min(1, (zone.to - min) / (max - min || 1)));

            const a1 = Math.PI * (1 - zStartRatio);
            const a2 = Math.PI * (1 - zEndRatio);

            const zx1 = cx - radius * Math.cos(a1);
            const zy1 = cy - radius * Math.sin(a1);
            const zx2 = cx - radius * Math.cos(a2);
            const zy2 = cy - radius * Math.sin(a2);

            const path = `M ${zx1} ${zy1} A ${radius} ${radius} 0 0 1 ${zx2} ${zy2}`;

            return (
              <path
                key={`zone-${idx}`}
                d={path}
                fill="none"
                stroke={zone.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                opacity={0.85}
              />
            );
          })}

          {/* Min & Max Ticks */}
          <text
            x={cx - radius}
            y={cy + 16}
            textAnchor="middle"
            className="ts-chart-axis-tick"
          >
            {valueFormatter(min)}
          </text>
          <text
            x={cx + radius}
            y={cy + 16}
            textAnchor="middle"
            className="ts-chart-axis-tick"
          >
            {valueFormatter(max)}
          </text>

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="var(--ts-color-text-primary)"
            strokeWidth={2}
            className="ts-chart-gauge-needle"
          />

          {/* Pivot Center Pin (0px square or flat hub) */}
          <rect
            x={cx - 4}
            y={cy - 4}
            width={8}
            height={8}
            fill="var(--ts-color-text-primary)"
          />

          {/* Central Metric Value */}
          <text
            x={cx}
            y={cy - 24}
            textAnchor="middle"
            style={{
              fontFamily: 'var(--ts-font-mono)',
              fontSize: '22px',
              fontWeight: 700,
              fill: 'var(--ts-color-text-primary)',
            }}
          >
            {valueFormatter(boundedVal)}
            {unit && <tspan style={{ fontSize: '13px', fontWeight: 400 }}> {unit}</tspan>}
          </text>
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={title || 'Gauge Reading'}
          items={tooltipItems}
          visible={isHovered}
        />
      </div>
    </div>
  );
};

GaugeChart.displayName = 'GaugeChart';
