import React from 'react';
import { chartColor } from './palette';
import './Charts.css';

export function ChartFrame({
  title,
  subtitle,
  legend,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  legend?: Array<{ label: string; color?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={['f7-chart', className].filter(Boolean).join(' ')}>
      {title && <h4 className="f7-chart-title">{title}</h4>}
      {subtitle && <p className="f7-chart-sub">{subtitle}</p>}
      {legend && (
        <ul className="f7-chart-legend">
          {legend.map((item, i) => (
            <li key={item.label}>
              <span className="f7-chart-swatch" style={{ background: chartColor(i, item.color) }} />
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div className="f7-chart-canvas">{children}</div>
    </div>
  );
}
