import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface ConnectionHub {
  id: string;
  label: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface ConnectionLink {
  from: string; // Hub id
  to: string;   // Hub id
  label?: string;
  value?: number;
  color?: string;
}

export interface ConnectionMapChartProps {
  hubs: ConnectionHub[];
  connections: ConnectionLink[];
  title?: string;
  subtitle?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a curved connection arc is clicked */
  onConnectionClick?: (connection: ConnectionLink) => void;
  /** Callback fired when a network hub node is clicked */
  onHubClick?: (hub: ConnectionHub) => void;
}

const DEFAULT_LINK_COLOR = '#78716C';

/**
 * ThoughtStream ConnectionMapChart Component
 *
 * Minimalist pure SVG connection network map with curved quadratic bezier arcs,
 * 0px hub nodes, flow volume tracking, and tooltips.
 */
export const ConnectionMapChart: React.FC<ConnectionMapChartProps> = ({
  hubs,
  connections,
  title,
  subtitle,
  height = 320,
  valueFormatter = (v) => v.toLocaleString(),
  borderless = false,
  className = '',
  style,
  onConnectionClick,
  onHubClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLink, setHoveredLink] = useState<{
    link: ConnectionLink;
    fromHub: ConnectionHub;
    toHub: ConnectionHub;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const width = 640;
  const padding = 40;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const hubMap = new Map<string, ConnectionHub>();
  hubs.forEach((h) => hubMap.set(h.id, h));

  const getSvgCoord = (pctX: number, pctY: number) => ({
    x: padding + (pctX / 100) * innerW,
    y: padding + (pctY / 100) * innerH,
  });

  const tooltipItems: ChartTooltipItem[] = hoveredLink
    ? [
        {
          label: 'Route',
          value: `${hoveredLink.fromHub.label} → ${hoveredLink.toHub.label}`,
          color: hoveredLink.link.color || DEFAULT_LINK_COLOR,
        },
        ...(hoveredLink.link.value !== undefined
          ? [
              {
                label: 'Flow / Traffic',
                value: hoveredLink.link.value,
                formattedValue: valueFormatter(hoveredLink.link.value),
                color: hoveredLink.link.color || DEFAULT_LINK_COLOR,
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
          {/* Gridlines */}
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

          {/* Arcs linking hubs */}
          {connections.map((link, idx) => {
            const fromHub = hubMap.get(link.from);
            const toHub = hubMap.get(link.to);
            if (!fromHub || !toHub) return null;

            const p1 = getSvgCoord(fromHub.x, fromHub.y);
            const p2 = getSvgCoord(toHub.x, toHub.y);

            // Compute curved control point
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const arcLift = Math.min(60, dist * 0.28);
            const cpX = midX;
            const cpY = midY - arcLift;

            const pathD = `M ${p1.x} ${p1.y} Q ${cpX} ${cpY} ${p2.x} ${p2.y}`;
            const color = link.color || DEFAULT_LINK_COLOR;
            const isHovered =
              hoveredLink?.link.from === link.from && hoveredLink?.link.to === link.to;

            return (
              <path
                key={`link-${idx}`}
                d={pathD}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={isHovered ? 1 : 0.65}
                className="ts-chart-map-arc"
                style={{ cursor: onConnectionClick ? 'pointer' : undefined }}
                onClick={() => onConnectionClick?.(link)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredLink({ link, fromHub, toHub });
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
                onMouseLeave={() => setHoveredLink(null)}
              />
            );
          })}

          {/* Hub Nodes */}
          {hubs.map((hub) => {
            const pt = getSvgCoord(hub.x, hub.y);

            return (
              <g
                key={hub.id}
                style={{ cursor: onHubClick ? 'pointer' : undefined }}
                onClick={() => onHubClick?.(hub)}
              >
                {/* Hub Outer Ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={8}
                  fill="var(--ts-color-bg)"
                  stroke="#1C1917"
                  strokeWidth={1.5}
                />
                {/* Hub Center Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill="#1C1917"
                />

                {/* Hub Label */}
                <text
                  x={pt.x}
                  y={pt.y + 18}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                  style={{ fontWeight: 600, fill: 'var(--ts-color-text-primary)' }}
                >
                  {hub.label}
                </text>
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={hoveredLink?.link.label || 'Connection Flow'}
          items={tooltipItems}
          visible={hoveredLink !== null}
        />
      </div>
    </div>
  );
};

ConnectionMapChart.displayName = 'ConnectionMapChart';
