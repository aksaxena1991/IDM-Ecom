import React, { forwardRef, useId } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={['sl-input-field', error ? 'sl-input-field--error' : '', className].join(' ')}>
        {label ? (
          <label className="sl-input-label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className="sl-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...props}
        />
        {error ? (
          <p className="sl-input-message sl-input-message--error" id={errorId} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="sl-input-message">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
