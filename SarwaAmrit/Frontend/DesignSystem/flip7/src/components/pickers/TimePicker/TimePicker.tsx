import React, { useId, useState } from 'react';
import './TimePicker.css';

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  defaultValue = '19:00',
  onChange,
  label,
  helperText,
  disabled,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <label className={['f7-time', className].filter(Boolean).join(' ')} htmlFor={id || generatedId}>
      {label && <span className="f7-picker-label">{label}</span>}
      <input
        id={id || generatedId}
        type="time"
        className="f7-surface-control f7-time-input"
        value={current}
        disabled={disabled}
        onChange={(e) => {
          if (value === undefined) setInternal(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      {helperText && <span className="f7-picker-helper">{helperText}</span>}
    </label>
  );
};
TimePicker.displayName = 'TimePicker';
