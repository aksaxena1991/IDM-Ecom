import React from 'react';
import '../overlays.css';

export interface PanelProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, children, className = '' }) => (
  <section className={['f7-panel', className].filter(Boolean).join(' ')}>
    {title && (
      <div className="f7-panel-head">
        <h3 className="f7-panel-title">{title}</h3>
      </div>
    )}
    <div className="f7-panel-body">{children}</div>
  </section>
);
Panel.displayName = 'Panel';
