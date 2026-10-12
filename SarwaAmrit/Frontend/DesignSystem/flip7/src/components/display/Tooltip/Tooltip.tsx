import React, { useState } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top', className = '' }) => {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={['f7-tooltip', className].filter(Boolean).join(' ')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && <span role="tooltip" className={`f7-tooltip-bubble f7-tooltip-bubble--${placement}`}>{content}</span>}
    </span>
  );
};
Tooltip.displayName = 'Tooltip';
