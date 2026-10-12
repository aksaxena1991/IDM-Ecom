import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconX } from '../../../lib/icons';
import './DatePicker.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  inline?: boolean;
  className?: string;
  id?: string;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = 'Pick a date',
  helperText,
  error,
  disabled,
  clearable = true,
  inline,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const [internal, setInternal] = useState<Date | null>(defaultValue);
  const [open, setOpen] = useState(Boolean(inline));
  const [cursor, setCursor] = useState(() => startOfMonth(value ?? defaultValue ?? new Date()));
  const root = useRef<HTMLDivElement>(null);
  const selected = value !== undefined ? value : internal;

  useEffect(() => {
    if (inline || !open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, inline]);

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const startPad = first.getDay();
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const items: Array<Date | null> = [...Array(startPad).fill(null)];
    for (let i = 1; i <= days; i += 1) items.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    return items;
  }, [cursor]);

  const pick = (d: Date | null) => {
    if (value === undefined) setInternal(d);
    onChange?.(d);
    if (!inline) setOpen(false);
  };

  const labelText = selected
    ? `${selected.getDate()} ${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
    : placeholder;

  const calendar = (
    <div className="f7-cal">
      <div className="f7-cal-head">
        <button type="button" className="f7-cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
          <IconChevronLeft />
        </button>
        <strong>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</strong>
        <button type="button" className="f7-cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
          <IconChevronRight />
        </button>
      </div>
      <div className="f7-cal-week">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`${d}${i}`}>{d}</span>)}</div>
      <div className="f7-cal-grid">
        {cells.map((d, i) => {
          const on = d && selected && d.toDateString() === selected.toDateString();
          return (
            <button
              key={i}
              type="button"
              disabled={!d}
              className={['f7-cal-day', on ? 'is-on' : ''].filter(Boolean).join(' ')}
              onClick={() => d && pick(d)}
            >
              {d ? d.getDate() : ''}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={root} className={['f7-datepicker', className].filter(Boolean).join(' ')}>
      {label && <label className="f7-picker-label" htmlFor={id || generatedId}>{label}</label>}
      {!inline && (
        <button
          id={id || generatedId}
          type="button"
          disabled={disabled}
          className="f7-surface-control f7-select-trigger"
          onClick={() => !disabled && setOpen((v) => !v)}
        >
          <span className={selected ? '' : 'f7-placeholder'}>{labelText}</span>
          {clearable && selected ? (
            <span onClick={(e) => { e.stopPropagation(); pick(null); }}><IconX size={14} /></span>
          ) : null}
        </button>
      )}
      {(inline || open) && calendar}
      {(error || helperText) && (
        <span className={['f7-picker-helper', error ? 'f7-picker-helper--error' : ''].filter(Boolean).join(' ')}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};
DatePicker.displayName = 'DatePicker';
