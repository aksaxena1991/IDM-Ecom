import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? (label ? `f7-input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <label className={['f7-field', className].filter(Boolean).join(' ')} htmlFor={inputId}>
        {label && <span className="f7-field-label">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={['f7-input', error ? 'f7-input--error' : ''].filter(Boolean).join(' ')}
          {...props}
        />
        {error ? (
          <span className="f7-field-hint f7-field-hint--error">{error}</span>
        ) : hint ? (
          <span className="f7-field-hint">{hint}</span>
        ) : null}
      </label>
    );
  }
);

Input.displayName = 'Input';
