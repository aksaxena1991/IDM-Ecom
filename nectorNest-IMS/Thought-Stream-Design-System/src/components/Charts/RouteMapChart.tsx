import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface RouteWaypoint {
  id: string;
  label: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  eta?: string;
  status?: 'completed' | 'current' | 'pending';
  details?: string;
}

export interface RouteMapChartProps {
  waypoints: RouteWaypoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  routeColor?: string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a route waypoint is clicked */
  onWaypointClick?: (waypoint: RouteWaypoint, index: number) => void;
}

const DEFAULT_ROUTE_COLOR = '#1C1917';

/**
 * ThoughtStream RouteMapChart Component
 *
 * Minimalist pure SVG route map featuring ordered waypoints,
 * directional trajectory path, coordinate grid, and wayfinding tooltips.
 */
export const RouteMapChart: React.FC<RouteMapChartProps> = ({
  waypoints,
  title,
  subtitle,
  height = 300,
  routeColor = DEFAULT_ROUTE_COLOR,
  borderless = false,
  className = '',
  style,
  onWaypointClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<RouteWaypoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const width = 640;
  const padding = 40;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const getSvgCoord = (pctX: number, pctY: number) => ({
    x: padding + (pctX / 100) * innerW,
    y: padding + (pctY / 100) * innerH,
  });

  // Build route path through sequential waypoints
  const pathD = waypoints.reduce((acc, wp, idx) => {
    const pt = getSvgCoord(wp.x, wp.y);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  const tooltipItems: ChartTooltipItem[] = hoveredPoint
    ? [
        {
          label: 'Waypoint',
          value: hoveredPoint.label,
          color: routeColor,
        },
        ...(hoveredPoint.eta
          ? [
              {
                label: 'ETA',
                value: hoveredPoint.eta,
                color: routeColor,
              },
            ]
          : []),
        ...(hoveredPoint.status
          ? [
              {
                label: 'Status',
                value: hoveredPoint.status.toUpperCase(),
                color: routeColor,
              },
            ]
          : []),
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
          {Array.from({ length: 6 }, (_, i) => {
            const gy = padding + (i / 5) * innerH;
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

          {/* Route Path */}
          <path
            d={pathD}
            fill="none"
            stroke={routeColor}
            strokeWidth={2}
            strokeDasharray="4 4"
          />

          {/* Waypoints */}
          {waypoints.map((wp, idx) => {
            const pt = getSvgCoord(wp.x, wp.y);
            const isHovered = hoveredPoint?.id === wp.id;
            const isCurrent = wp.status === 'current';

            return (
              <g
                key={wp.id}
                className="ts-chart-map-pin"
                onClick={() => onWaypointClick?.(wp, idx)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredPoint(wp);
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
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* 0px Square Pin Node */}
                <rect
                  x={pt.x - (isHovered || isCurrent ? 8 : 6)}
                  y={pt.y - (isHovered || isCurrent ? 8 : 6)}
                  width={isHovered || isCurrent ? 16 : 12}
                  height={isHovered || isCurrent ? 16 : 12}
                  fill={isCurrent ? '#1C1917' : 'var(--ts-color-bg)'}
                  stroke="#1C1917"
                  strokeWidth={1.5}
                />

                {/* Index Number */}
                <text
                  x={pt.x}
                  y={pt.y + 3}
                  textAnchor="middle"
                  fill={isCurrent ? '#FFFFFF' : '#1C1917'}
                  style={{
                    fontFamily: 'var(--ts-font-mono)',
                    fontSize: '9px',
                    fontWeight: 700,
                    pointerEvents: 'none',
                  }}
                >
                  {idx + 1}
                </text>

                {/* Waypoint Label */}
                <text
                  x={pt.x}
                  y={pt.y + 18}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                  style={{
                    fontWeight: isHovered ? 600 : 400,
                    fill: isHovered ? 'var(--ts-color-text-primary)' : 'var(--ts-color-text-secondary)',
                  }}
                >
                  {wp.label}
                </text>
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={hoveredPoint?.label}
          items={tooltipItems}
          visible={hoveredPoint !== null}
        />
      </div>
    </div>
  );
};

RouteMapChart.displayName = 'RouteMapChart';
