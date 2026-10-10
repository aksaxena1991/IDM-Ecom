import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface RadarDimension {
  key: string;
  label: string;
  max?: number;
}

export interface RadarSeries {
  key: string;
  label: string;
  color?: string;
  fillOpacity?: number;
}

export interface RadarChartProps {
  dimensions: RadarDimension[];
  series: RadarSeries[];
  data: {
    [seriesKey: string]: {
      [dimensionKey: string]: number;
    };
  };
  title?: string;
  subtitle?: string;
  size?: number;
  levels?: number;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a series vertex is clicked */
  onVertexClick?: (dimension: RadarDimension, seriesKey: string, value: number) => void;
}

const DEFAULT_COLORS = ['#78716C', '#A8A29E', '#57534E', '#1C1917', '#65A30D'];

/**
 * ThoughtStream RadarChart Component
 *
 * Minimalist SVG Spider / Radar Chart with concentric polygon web,
 * hairline axis spokes, translucent filled series, and floating tooltips.
 */
export const RadarChart: React.FC<RadarChartProps> = ({
  dimensions,
  series,
  data,
  title,
  subtitle,
  size = 360,
  levels = 4,
  showLegend = true,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onVertexClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDimIdx, setHoveredDimIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const center = size / 2;
  const radius = center - 45; // Leave room for dimension labels
  const totalDim = dimensions.length;

  // Calculate coordinates for a point on a spoke
  const getCoordinates = (dimIndex: number, valueRatio: number) => {
    // Start at -90deg (12 o'clock)
    const angle = (Math.PI * 2 * dimIndex) / totalDim - Math.PI / 2;
    const r = radius * Math.max(0, Math.min(1, valueRatio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric polygon web levels
  const levelPolygons = Array.from({ length: levels }, (_, lvlIdx) => {
    const levelRatio = (lvlIdx + 1) / levels;
    const points = dimensions
      .map((_, dimIdx) => {
        const { x, y } = getCoordinates(dimIdx, levelRatio);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  const activeDimension = hoveredDimIdx !== null ? dimensions[hoveredDimIdx] : null;

  const tooltipItems: ChartTooltipItem[] = activeDimension
    ? series.map((s, idx) => {
        const val = data[s.key]?.[activeDimension.key] ?? 0;
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

      <div
        className="ts-chart-canvas-wrapper"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="ts-chart-svg"
          style={{ overflow: 'visible' }}
        >
          {/* Concentric Web Polygons */}
          {levelPolygons.map((pts, i) => (
            <polygon
              key={`level-${i}`}
              points={pts}
              fill="none"
              stroke="var(--ts-border-subtle)"
              strokeWidth={1}
              strokeDasharray={i === levels - 1 ? undefined : '2,2'}
            />
          ))}

          {/* Radial Axis Spokes */}
          {dimensions.map((dim, dimIdx) => {
            const { x, y } = getCoordinates(dimIdx, 1);
            const isHovered = hoveredDimIdx === dimIdx;

            return (
              <g key={`spoke-${dim.key}`}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke={isHovered ? 'var(--ts-text-primary)' : 'var(--ts-border-subtle)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  className="ts-chart-axis-line"
                />

                {/* Dimension Label */}
                {(() => {
                  const labelRadius = radius + 18;
                  const angle = (Math.PI * 2 * dimIdx) / totalDim - Math.PI / 2;
                  const lx = center + labelRadius * Math.cos(angle);
                  const ly = center + labelRadius * Math.sin(angle);

                  let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                  if (Math.cos(angle) > 0.1) textAnchor = 'start';
                  else if (Math.cos(angle) < -0.1) textAnchor = 'end';

                  return (
                    <text
                      x={lx}
                      y={ly + 4}
                      textAnchor={textAnchor}
                      className="ts-chart-axis-tick"
                      style={{
                        fontWeight: isHovered ? 600 : 400,
                        fill: isHovered ? 'var(--ts-text-primary)' : 'var(--ts-text-muted)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredDimIdx(dimIdx);
                          setTooltipPos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDimIdx(null)}
                    >
                      {dim.label}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* Data Series Polygons */}
          {series.map((s, seriesIdx) => {
            const color = s.color || DEFAULT_COLORS[seriesIdx % DEFAULT_COLORS.length];
            const fillOpacity = s.fillOpacity ?? 0.25;

            const seriesData = data[s.key] || {};
            const polygonPoints = dimensions
              .map((dim, dimIdx) => {
                const val = seriesData[dim.key] ?? 0;
                const max = dim.max ?? 100;
                const ratio = val / max;
                const { x, y } = getCoordinates(dimIdx, ratio);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <g key={`series-${s.key}`}>
                {/* Translucent Area */}
                <polygon
                  points={polygonPoints}
                  fill={color}
                  fillOpacity={fillOpacity}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* Vertex Points */}
                {dimensions.map((dim, dimIdx) => {
                  const val = seriesData[dim.key] ?? 0;
                  const max = dim.max ?? 100;
                  const ratio = val / max;
                  const { x, y } = getCoordinates(dimIdx, ratio);
                  const isHovered = hoveredDimIdx === dimIdx;

                  return (
                    <circle
                      key={`pt-${dim.key}`}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={1}
                      style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                      onClick={() => onVertexClick?.(dim, s.key, val)}
                      onMouseEnter={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setHoveredDimIdx(dimIdx);
                          setTooltipPos({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredDimIdx(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={activeDimension?.label}
          items={tooltipItems}
          visible={hoveredDimIdx !== null}
        />
      </div>
    </div>
  );
};

RadarChart.displayName = 'RadarChart';
