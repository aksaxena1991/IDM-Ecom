import React from 'react';
import './Badge.css';

export type BadgeTone = 'gold' | 'teal' | 'coral' | 'sky' | 'cream';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'gold', className = '' }) => {
  return (
    <span className={['f7-badge', `f7-badge--${tone}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
