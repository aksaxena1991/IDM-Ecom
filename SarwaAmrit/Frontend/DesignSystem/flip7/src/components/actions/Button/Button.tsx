import React, { forwardRef } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'boom' | 'flip7' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      active = false,
      fullWidth = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classNames = [
      'f7-button',
      `f7-button--${variant}`,
      active ? 'f7-button--active' : '',
      fullWidth ? 'f7-button--full' : '',
      disabled ? 'f7-button--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} type={type} className={classNames} disabled={disabled} {...props}>
        <span className="f7-button-label">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
