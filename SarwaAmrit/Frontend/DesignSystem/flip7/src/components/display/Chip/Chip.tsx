import React, { forwardRef } from 'react';
import './Chip.css';

export type ChipVariant = 'filter' | 'status';
export type ChipTone = 'gold' | 'teal' | 'coral' | 'sky' | 'success' | 'error';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  tone?: ChipTone;
  selected?: boolean;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ variant = 'filter', tone = 'teal', selected, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={['f7-chip', `f7-chip--${variant}`, `f7-chip--${tone}`, selected ? 'is-on' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
);
Chip.displayName = 'Chip';
