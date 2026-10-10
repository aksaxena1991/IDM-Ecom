import React, { forwardRef } from 'react';
import './Chip.css';

export type ChipVariant = 'filter' | 'status';
export type StatusChipTone = 'success' | 'warning' | 'error' | 'info';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Filter chip (interactive tag) or status chip (badge indicator) */
  variant?: ChipVariant;
  /** Semantic tone for status chips */
  tone?: StatusChipTone;
  /** Active / selected state for filter chips */
  selected?: boolean;
  /** Optional icon rendered beside text */
  icon?: React.ReactNode;
}

/**
 * ThoughtStream Chip Component
 *
 * Implements sharp geometric edges (0px border-radius), crisp typography,
 * and specific pastel semantic tints for status indications.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      children,
      variant = 'filter',
      tone = 'info',
      selected = false,
      icon,
      disabled = false,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const isFilter = variant === 'filter';

    const classes = [
      'ts-chip',
      isFilter ? 'ts-chip--filter' : 'ts-chip--status',
      isFilter && selected ? 'ts-chip--selected' : '',
      !isFilter ? `ts-chip--status-${tone}` : '',
      disabled ? 'ts-chip--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        aria-pressed={isFilter ? selected : undefined}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="ts-chip-icon">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }
);

Chip.displayName = 'Chip';
