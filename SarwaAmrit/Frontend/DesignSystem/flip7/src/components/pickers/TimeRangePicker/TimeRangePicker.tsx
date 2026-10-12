import React, { useState } from 'react';
import { TimePicker } from '../TimePicker';
import './TimeRangePicker.css';

export interface TimeRange {
  start: string;
  end: string;
}

export interface TimeRangePickerProps {
  value?: TimeRange;
  defaultValue?: TimeRange;
  onChange?: (range: TimeRange) => void;
  label?: string;
  className?: string;
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  defaultValue = { start: '19:00', end: '22:00' },
  onChange,
  label,
  className = '',
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const update = (next: TimeRange) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return (
    <div className={['f7-timerange', className].filter(Boolean).join(' ')}>
      {label && <div className="f7-picker-label">{label}</div>}
      <div className="f7-timerange-row">
        <TimePicker label="Start" value={current.start} onChange={(start) => update({ ...current, start })} />
        <TimePicker label="End" value={current.end} onChange={(end) => update({ ...current, end })} />
      </div>
    </div>
  );
};
TimeRangePicker.displayName = 'TimeRangePicker';
