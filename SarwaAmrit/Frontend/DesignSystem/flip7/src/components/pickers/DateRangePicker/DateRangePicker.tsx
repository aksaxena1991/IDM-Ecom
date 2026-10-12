import React, { useState } from 'react';
import { DatePicker } from '../DatePicker';
import './DateRangePicker.css';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  label?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  defaultValue = { start: null, end: null },
  onChange,
  label,
  className = '',
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const update = (next: DateRange) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return (
    <div className={['f7-daterange', className].filter(Boolean).join(' ')}>
      {label && <div className="f7-picker-label">{label}</div>}
      <div className="f7-daterange-row">
        <DatePicker label="From" value={current.start} onChange={(start) => update({ ...current, start })} />
        <DatePicker label="To" value={current.end} onChange={(end) => update({ ...current, end })} />
      </div>
    </div>
  );
};
DateRangePicker.displayName = 'DateRangePicker';
