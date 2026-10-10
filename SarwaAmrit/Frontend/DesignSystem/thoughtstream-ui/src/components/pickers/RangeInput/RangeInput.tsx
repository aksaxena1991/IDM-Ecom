import React, { useState, useId, forwardRef } from 'react';
import './RangeInput.css';

export interface RangeMark {
  value: number;
  label: string;
}

export interface RangeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  /** Minimum range value */
  min?: number;
  /** Maximum range value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Controlled value */
  value?: number;
  /** Default uncontrolled value */
  defaultValue?: number;
  /** Value change callback */
  onChange?: (value: number) => void;
  /** Label above range slider */
  label?: string;
  /** Helper text below slider */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Show live formatted value badge */
  showValue?: boolean;
  /** Formatter for the value badge */
  valueFormat?: (val: number) => string;
  /** Optional boundary or milestone marks */
  marks?: RangeMark[];
}

/**
 * ThoughtStream RangeInput Component
 *
 * Implements sharp 0px square thumb (16px x 16px), flat hairline track,
 * stone primary progress fill, and monospace value indicators.
 */
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
      error,
      disabled = false,
      showValue = true,
      valueFormat = (v) => `${v}`,
      marks,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const helperId = `${inputId}-helper`;
    const [internalValue, setInternalValue] = useState<number>(defaultValue);

    const currentValue = value !== undefined ? value : internalValue;
    const isError = Boolean(error);

    // Percentage for track fill and thumb placement
    const percentage = Math.min(
      Math.max(((currentValue - min) / (max - min)) * 100, 0),
      100
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextVal = parseFloat(e.target.value);
      if (value === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
    };

    return (
      <div
        className={[
          'ts-range-wrapper',
          disabled ? 'ts-range-wrapper--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {(label || showValue) && (
          <div className="ts-range-header">
            {label && (
              <label htmlFor={inputId} className="ts-range-label">
                {label}
              </label>
            )}
            {showValue && (
              <span className="ts-range-value-badge" aria-hidden="true">
                {valueFormat(currentValue)}
              </span>
            )}
          </div>
        )}

        <div className="ts-range-container">
          {/* Background Track */}
          <div className="ts-range-track">
            {/* Active Range Fill */}
            <div
              className="ts-range-track-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <input
            ref={ref}
            id={inputId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            disabled={disabled}
            aria-describedby={helperText || error ? helperId : undefined}
            onChange={handleChange}
            className="ts-range-input"
            {...props}
          />

          {/* Visual Custom 0px Sharp Thumb */}
          <div
            className="ts-range-thumb"
            style={{ left: `${percentage}%` }}
            aria-hidden="true"
          />
        </div>

        {marks && marks.length > 0 && (
          <div className="ts-range-marks">
            {marks.map((m) => (
              <span key={m.value} className="ts-range-mark">
                {m.label}
              </span>
            ))}
          </div>
        )}

        {(error || helperText) && (
          <span
            id={helperId}
            className={`ts-range-helper ${isError ? 'ts-range-helper--error' : ''}`}
            role={isError ? 'alert' : undefined}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

RangeInput.displayName = 'RangeInput';
