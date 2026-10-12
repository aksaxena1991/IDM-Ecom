import React, { forwardRef, useId, useState } from 'react';
import './RangeInput.css';

export interface RangeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
  helperText?: string;
  showValue?: boolean;
}

export const RangeInput = forwardRef<HTMLInputElement, RangeInputProps>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue = min,
      onChange,
      label,
      helperText,
      showValue = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    const pct = ((current - min) / (max - min || 1)) * 100;

    return (
      <div className={['f7-range', className].filter(Boolean).join(' ')}>
        {(label || showValue) && (
          <div className="f7-range-head">
            {label && <label className="f7-field-label" htmlFor={id || generatedId}>{label}</label>}
            {showValue && <span className="f7-range-value">{current}</span>}
          </div>
        )}
        <input
          ref={ref}
          id={id || generatedId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          className="f7-range-input"
          style={{ ['--f7-range-pct' as string]: `${pct}%` }}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (value === undefined) setInternal(next);
            onChange?.(next);
          }}
          {...props}
        />
        {helperText && <span className="f7-field-hint">{helperText}</span>}
      </div>
    );
  }
);
RangeInput.displayName = 'RangeInput';
