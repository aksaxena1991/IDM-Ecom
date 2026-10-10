import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface DensityCluster {
  id: string;
  label: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  density: number; // Intensity value (e.g. 10 to 100)
  radius?: number; // Spread in px
}

export interface DensityMapChartProps {
  clusters: DensityCluster[];
  title?: string;
  subtitle?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a density cluster hotspot is clicked */
  onClusterClick?: (cluster: DensityCluster) => void;
}

const DEFAULT_COLOR = '#1C1917';

/**
 * ThoughtStream DensityMapChart Component
 *
 * Minimalist pure SVG spatial density concentration map with graduated
 * concentric density rings, coordinate framework, and tooltips.
 */
export const DensityMapChart: React.FC<DensityMapChartProps> = ({
  clusters,
  title,
  subtitle,
  height = 320,
  valueFormatter = (v) => `${v.toLocaleString()} pts/km²`,
  borderless = false,
  className = '',
  style,
  onClusterClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCluster, setHoveredCluster] = useState<DensityCluster | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const width = 640;
  const padding = 35;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const getSvgCoord = (pctX: number, pctY: number) => ({
    x: padding + (pctX / 100) * innerW,
    y: padding + (pctY / 100) * innerH,
  });

  const maxDensity = Math.max(...clusters.map((c) => c.density), 100);

  const tooltipItems: ChartTooltipItem[] = hoveredCluster
    ? [
        {
          label: 'Density',
          value: hoveredCluster.density,
          formattedValue: valueFormatter(hoveredCluster.density),
          color: DEFAULT_COLOR,
        },
        {
          label: 'Coordinates',
          value: `(${hoveredCluster.x}%, ${hoveredCluster.y}%)`,
          color: DEFAULT_COLOR,
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

      <div className="ts-chart-canvas-wrapper ts-chart-map-frame">
        <svg viewBox={`0 0 ${width} ${height}`} className="ts-chart-svg">
          {/* Subtle Gridlines */}
          {Array.from({ length: 9 }, (_, i) => {
            const gx = padding + (i / 8) * innerW;
            return (
              <line
                key={`grid-x-${i}`}
                x1={gx}
                y1={padding}
                x2={gx}
                y2={height - padding}
                className="ts-chart-map-gridline"
              />
            );
          })}
          {Array.from({ length: 7 }, (_, i) => {
            const gy = padding + (i / 6) * innerH;
            return (
              <line
                key={`grid-y-${i}`}
                x1={padding}
                y1={gy}
                x2={width - padding}
                y2={gy}
                className="ts-chart-map-gridline"
              />
            );
          })}

          {/* Density Clusters */}
          {clusters.map((cluster) => {
            const pt = getSvgCoord(cluster.x, cluster.y);
            const ratio = Math.min(1, Math.max(0.2, cluster.density / maxDensity));
            const baseR = cluster.radius || 32;
            const r = baseR * ratio;
            const isHovered = hoveredCluster?.id === cluster.id;

            return (
              <g
                key={cluster.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onClusterClick?.(cluster)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredCluster(cluster);
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
                onMouseLeave={() => setHoveredCluster(null)}
              >
                {/* Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={r * 1.5}
                  fill={DEFAULT_COLOR}
                  fillOpacity={0.06}
                  stroke={DEFAULT_COLOR}
                  strokeWidth={0.5}
                  strokeDasharray="2 3"
                />

                {/* Medium Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={r}
                  fill={DEFAULT_COLOR}
                  fillOpacity={0.15}
                  stroke={DEFAULT_COLOR}
                  strokeWidth={0.75}
                />

                {/* Core Hotspot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={Math.max(3, r * 0.45)}
                  fill={DEFAULT_COLOR}
                  fillOpacity={isHovered ? 0.9 : 0.65}
                />

                {/* Cluster Label */}
                <text
                  x={pt.x}
                  y={pt.y + r + 14}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                  style={{
                    fontWeight: isHovered ? 600 : 400,
                    fill: isHovered ? 'var(--ts-color-text-primary)' : 'var(--ts-color-text-secondary)',
                  }}
                >
                  {cluster.label}
                </text>
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={hoveredCluster?.label}
          items={tooltipItems}
          visible={hoveredCluster !== null}
        />
      </div>
    </div>
  );
};

DensityMapChart.displayName = 'DensityMapChart';
