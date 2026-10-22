import React from 'react';
import './Charts.css';

export interface ChartTooltipItem {
  label: string;
  value: number | string;
  color: string;
  formattedValue?: string;
}

export interface ChartTooltipProps {
  x: number;
  y: number;
  title?: React.ReactNode;
  items: ChartTooltipItem[];
  visible: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SkyLearn ChartTooltip Component
 *
 * Floating tooltip badge with 0px geometry, hairline frame,
 * monospace metric formatting, and series color markers.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  x,
  y,
  title,
  items,
  visible,
  className = '',
  style,
}) => {
  if (!visible || items.length === 0) return null;

  return (
    <div
      className={`sl-chart-tooltip ${className}`.trim()}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        ...style,
      }}
      role="tooltip"
    >
      {title && <div className="sl-chart-tooltip-title">{title}</div>}
      <div className="sl-chart-tooltip-body">
        {items.map((item, idx) => (
          <div key={idx} className="sl-chart-tooltip-row">
            <span className="sl-chart-tooltip-label">
              <span
                className="sl-chart-tooltip-color"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </span>
            <span className="sl-chart-tooltip-value">
              {item.formattedValue !== undefined
                ? item.formattedValue
                : typeof item.value === 'number'
                ? item.value.toLocaleString()
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

ChartTooltip.displayName = 'ChartTooltip';
