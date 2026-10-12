import React from 'react';
import './Icon.css';

export type IconTone = 'teal' | 'gold' | 'coral' | 'sky';
export interface IconProps {
  children: React.ReactNode;
  label?: string;
  tone?: IconTone;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ children, label, tone = 'teal', size = 32, className = '' }) => (
  <span
    className={['f7-icon', `f7-icon--${tone}`, className].filter(Boolean).join(' ')}
    style={{ width: size, height: size, fontSize: size * 0.7 }}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
  >
    {children}
  </span>
);
Icon.displayName = 'Icon';
