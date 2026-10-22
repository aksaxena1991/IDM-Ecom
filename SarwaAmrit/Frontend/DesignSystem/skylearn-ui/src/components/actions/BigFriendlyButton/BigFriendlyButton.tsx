import React, { forwardRef } from 'react';
import './BigFriendlyButton.css';

export interface BigFriendlyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export const BigFriendlyButton = forwardRef<HTMLButtonElement, BigFriendlyButtonProps>(
  ({ children, fullWidth = false, className = '', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={[
          'sl-big-button',
          fullWidth ? 'sl-big-button--full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </button>
    );
  },
);

BigFriendlyButton.displayName = 'BigFriendlyButton';
