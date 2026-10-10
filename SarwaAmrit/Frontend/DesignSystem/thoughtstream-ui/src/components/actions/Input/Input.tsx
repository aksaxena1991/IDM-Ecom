import React, { forwardRef, useId } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional field label above input */
  label?: string;
  /** Explanatory helper text below input */
  helperText?: string;
  /** Error message: shifts border to #DC2626 and announces state */
  error?: string;
  /** Icon displayed at the left side of the input field */
  leadingIcon?: React.ReactNode;
  /** Icon displayed at the right side of the input field */
  trailingIcon?: React.ReactNode;
  /** Additional container styling class */
  containerClassName?: string;
}

/**
 * ThoughtStream Input Component
 *
 * Implements 48px height, 0px border radius, #D6D3D1 border,
 * calm focus rings, and clear error / helper feedback.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      required,
      id,
      disabled,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const isError = Boolean(error);

    const inputClasses = [
      'ts-input',
      isError ? 'ts-input--error' : '',
      leadingIcon ? 'ts-input--with-leading' : '',
      trailingIcon ? 'ts-input--with-trailing' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`ts-input-wrapper ${containerClassName}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="ts-input-label">
            {label}
            {required && <span className="ts-input-required" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="ts-input-container">
          {leadingIcon && (
            <span className="ts-input-icon ts-input-icon--leading" aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={isError}
            aria-describedby={helperText || error ? helperId : undefined}
            className={inputClasses}
            {...props}
          />

          {trailingIcon && (
            <span className="ts-input-icon ts-input-icon--trailing" aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>

        {(error || helperText) && (
          <span
            id={helperId}
            className={`ts-input-helper ${isError ? 'ts-input-helper--error' : ''}`}
            role={isError ? 'alert' : undefined}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
