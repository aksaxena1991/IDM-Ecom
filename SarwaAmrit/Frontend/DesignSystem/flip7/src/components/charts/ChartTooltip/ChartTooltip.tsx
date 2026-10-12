import React from 'react';
import '../Charts.css';

export interface ChartTooltipItem {
  label: string;
  formattedValue: string;
  color: string;
}

export interface ChartTooltipProps {
  x: number;
  y: number;
  title?: React.ReactNode;
  items: ChartTooltipItem[];
  visible?: boolean;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ x, y, title, items, visible = true }) => {
  if (!visible || items.length === 0) return null;
  return (
    <div className="f7-chart-tip" style={{ left: x + 8, top: y + 8 }}>
      {title && <div>{title}</div>}
      {items.map((item) => (
        <div key={item.label}>
          <span className="f7-chart-swatch" style={{ background: item.color }} />
          {item.label}: {item.formattedValue}
        </div>
      ))}
    </div>
  );
};
ChartTooltip.displayName = 'ChartTooltip';
