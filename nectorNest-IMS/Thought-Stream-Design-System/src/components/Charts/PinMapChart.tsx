import React, { useState, useRef } from 'react';
import './Charts.css';
import { ChartTooltip, ChartTooltipItem } from './ChartTooltip';

export interface MapPin {
  id: string;
  label: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  count?: number;
  category?: string;
  color?: string;
}

export interface PinMapChartProps {
  pins: MapPin[];
  title?: string;
  subtitle?: string;
  height?: number;
  borderless?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback fired when a map pin is clicked */
  onPinClick?: (pin: MapPin) => void;
}

const DEFAULT_PIN_COLOR = '#1C1917';

/**
 * ThoughtStream PinMapChart Component
 *
 * Minimalist pure SVG geographic coordinate map with 0px sharp rectangular pins,
 * coordinate framing, and location tooltips.
 */
export const PinMapChart: React.FC<PinMapChartProps> = ({
  pins,
  title,
  subtitle,
  height = 320,
  borderless = false,
  className = '',
  style,
  onPinClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPin, setHoveredPin] = useState<MapPin | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const width = 640;
  const padding = 30;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const getSvgCoord = (pctX: number, pctY: number) => ({
    x: padding + (pctX / 100) * innerW,
    y: padding + (pctY / 100) * innerH,
  });

  const tooltipItems: ChartTooltipItem[] = hoveredPin
    ? [
        {
          label: 'Location',
          value: hoveredPin.label,
          color: hoveredPin.color || DEFAULT_PIN_COLOR,
        },
        ...(hoveredPin.count !== undefined
          ? [
              {
                label: 'Activity',
                value: hoveredPin.count,
                color: hoveredPin.color || DEFAULT_PIN_COLOR,
              },
            ]
          : []),
        ...(hoveredPin.category
          ? [
              {
                label: 'Type',
                value: hoveredPin.category,
                color: hoveredPin.color || DEFAULT_PIN_COLOR,
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
          {/* Subtle World / Region Grid Coordinates */}
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

          {/* Abstract landmass contours */}
          <path
            d="M 120 80 L 220 75 L 240 120 L 180 160 L 110 130 Z"
            fill="var(--ts-border-subtle)"
            opacity={0.3}
          />
          <path
            d="M 320 70 L 480 65 L 530 140 L 440 180 L 340 150 Z"
            fill="var(--ts-border-subtle)"
            opacity={0.3}
          />
          <path
            d="M 170 190 L 230 185 L 210 250 L 160 230 Z"
            fill="var(--ts-border-subtle)"
            opacity={0.3}
          />

          {/* Coordinate boundary ticks */}
          <text x={padding} y={padding - 10} className="ts-chart-axis-tick">
            W 180°
          </text>
          <text x={width - padding} y={padding - 10} textAnchor="end" className="ts-chart-axis-tick">
            E 180°
          </text>

          {/* Pins */}
          {pins.map((pin) => {
            const pt = getSvgCoord(pin.x, pin.y);
            const isHovered = hoveredPin?.id === pin.id;
            const color = pin.color || DEFAULT_PIN_COLOR;

            return (
              <g
                key={pin.id}
                className="ts-chart-map-pin"
                onClick={() => onPinClick?.(pin)}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredPin(pin);
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
                onMouseLeave={() => setHoveredPin(null)}
              >
                {/* Hairline pin stem */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={pt.y - 12}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* Ground anchor pulse */}
                <rect
                  x={pt.x - 2}
                  y={pt.y - 2}
                  width={4}
                  height={4}
                  fill={color}
                />

                {/* Pin head (0px sharp box) */}
                <rect
                  x={pt.x - 6}
                  y={pt.y - 22}
                  width={12}
                  height={10}
                  fill={isHovered ? color : 'var(--ts-color-bg)'}
                  stroke={color}
                  strokeWidth={1.5}
                />

                {/* Pin Count / Dot */}
                {pin.count !== undefined && (
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    textAnchor="middle"
                    fill={isHovered ? '#FFFFFF' : color}
                    style={{
                      fontFamily: 'var(--ts-font-mono)',
                      fontSize: '8px',
                      fontWeight: 700,
                      pointerEvents: 'none',
                    }}
                  >
                    {pin.count}
                  </text>
                )}

                {/* Pin Label */}
                <text
                  x={pt.x}
                  y={pt.y + 14}
                  textAnchor="middle"
                  className="ts-chart-axis-tick"
                  style={{
                    fontWeight: isHovered ? 600 : 400,
                    fill: isHovered ? 'var(--ts-color-text-primary)' : 'var(--ts-color-text-secondary)',
                  }}
                >
                  {pin.label}
                </text>
              </g>
            );
          })}
        </svg>

        <ChartTooltip
          x={tooltipPos.x}
          y={tooltipPos.y}
          title={hoveredPin?.label}
          items={tooltipItems}
          visible={hoveredPin !== null}
        />
      </div>
    </div>
  );
};

PinMapChart.displayName = 'PinMapChart';
