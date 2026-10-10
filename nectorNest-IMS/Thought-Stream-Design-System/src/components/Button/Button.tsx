import React, { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size tier matching ThoughtStream spacing */
  size?: ButtonSize;
  /** Stretch button to full container width */
  fullWidth?: boolean;
  /** Optional icon rendered before the label */
  leftIcon?: React.ReactNode;
  /** Optional icon rendered after the label */
  rightIcon?: React.ReactNode;
  /** Shows a minimal spinner and disables interaction */
  isLoading?: boolean;
}

/**
 * ThoughtStream Button Component
 *
 * Implements sharp geometric edges (0px border-radius), flat surfaces,
 * precise typography (Inter 600), and stone-focused palette states.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClass = {
      small: 'ts-button--sm',
      medium: 'ts-button--md',
      large: 'ts-button--lg',
    }[size];

    const variantClass = {
      primary: 'ts-button--primary',
      secondary: 'ts-button--secondary',
      ghost: 'ts-button--ghost',
      destructive: 'ts-button--destructive',
    }[variant];

    const classNames = [
      'ts-button',
      sizeClass,
      variantClass,
      fullWidth ? 'ts-button--full-width' : '',
      isLoading ? 'ts-button--loading' : '',
      disabled || isLoading ? 'ts-button--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="ts-button-spinner" aria-hidden="true" />
        ) : (
          leftIcon && <span className="ts-button-icon-left">{leftIcon}</span>
        )}
        <span className="ts-button-content">{children}</span>
        {!isLoading && rightIcon && (
          <span className="ts-button-icon-right">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
