import React, { forwardRef } from 'react';
import './CounterButton.css';

export type CounterButtonVariant = 'plus' | 'minus';

export interface CounterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CounterButtonVariant;
}

export const CounterButton = forwardRef<HTMLButtonElement, CounterButtonProps>(
  ({ variant = 'plus', className = '', type = 'button', children, ...props }, ref) => {
    const label = children ?? (variant === 'plus' ? '+' : '−');
    const classNames = ['f7-counter', `f7-counter--${variant}`, className].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        aria-label={variant === 'plus' ? 'Increase' : 'Decrease'}
        {...props}
      >
        <span aria-hidden="true">{label}</span>
      </button>
    );
  }
);

CounterButton.displayName = 'CounterButton';
