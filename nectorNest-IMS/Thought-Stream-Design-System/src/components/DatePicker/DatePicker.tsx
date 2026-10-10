import React, { useState, useRef, useEffect, useId } from 'react';
import './DatePicker.css';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../Button';

export interface DatePreset {
  label: string;
  date: Date;
}

export interface DatePickerProps {
  /** Currently selected Date */
  value?: Date | null;
  /** Initial selected Date */
  defaultValue?: Date | null;
  /** Callback fired when a date is selected or cleared */
  onChange?: (date: Date | null) => void;
  /** Form field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Explanatory helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required flag */
  required?: boolean;
  /** Allow clearing selected date */
  clearable?: boolean;
  /** Render calendar directly inline without popover */
  inline?: boolean;
  /** Custom date formatter */
  formatDate?: (date: Date) => string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Custom function to disable specific dates */
  isDateDisabled?: (date: Date) => boolean;
  /** Optional quick preset options */
  presets?: DatePreset[];
  className?: string;
  id?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const defaultFormatDate = (d: Date): string => {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * ThoughtStream DatePicker Component
 *
 * Provides a minimal, distraction-free date picker with 0px geometry,
 * hairline borders, popover calendar, presets, and inline mode.
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = 'Select date...',
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = true,
  inline = false,
  formatDate = defaultFormatDate,
  minDate,
  maxDate,
  isDateDisabled,
  presets,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const pickerId = id || generatedId;
  const helperId = `${pickerId}-helper`;

  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value !== undefined ? value : internalDate;
  const isError = Boolean(error);

  // Month navigation view state
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());

  // Keep viewDate updated when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  // Click outside to dismiss popover
  useEffect(() => {
    if (inline || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, inline]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: Date) => {
    if (value === undefined) {
      setInternalDate(day);
    }
    onChange?.(day);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value === undefined) {
      setInternalDate(null);
    }
    onChange?.(null);
  };

  const handleSelectToday = () => {
    const today = new Date();
    if (value === undefined) {
      setInternalDate(today);
    }
    setViewDate(today);
    onChange?.(today);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const handleSelectPreset = (presetDate: Date) => {
    if (value === undefined) {
      setInternalDate(presetDate);
    }
    setViewDate(presetDate);
    onChange?.(presetDate);
    if (!inline) {
      setIsOpen(false);
    }
  };

  // Build grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const today = new Date();

  // Render Calendar Grid content
  const renderCalendarContent = () => (
    <div className={`ts-calendar-card ${inline ? 'ts-calendar-card--inline' : ''}`.trim()}>
      <div className="ts-calendar-header">
        <h4 className="ts-calendar-month-year">
          {MONTH_NAMES[month]} {year}
        </h4>

        <div className="ts-calendar-nav-group">
          <button
            type="button"
            aria-label="Previous month"
            className="ts-calendar-nav-btn"
            onClick={handlePrevMonth}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="ts-calendar-nav-btn"
            onClick={handleNextMonth}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="ts-calendar-weekdays" aria-hidden="true">
        {WEEKDAY_NAMES.map((d) => (
          <div key={d} className="ts-calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="ts-calendar-grid" role="grid">
        {days.map(({ date, isCurrentMonth }) => {
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);

          let dayDisabled = disabled;
          if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
            dayDisabled = true;
          }
          if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
            dayDisabled = true;
          }
          if (isDateDisabled && isDateDisabled(date)) {
            dayDisabled = true;
          }

          const classNames = [
            'ts-calendar-day',
            !isCurrentMonth ? 'ts-calendar-day--adjacent' : '',
            isToday ? 'ts-calendar-day--today' : '',
            isSelected ? 'ts-calendar-day--selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              disabled={dayDisabled}
              className={classNames}
              onClick={() => handleSelectDay(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {presets && presets.length > 0 && (
        <div className="ts-datepicker-presets">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="ts-datepicker-preset-btn"
              onClick={() => handleSelectPreset(p.date)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="ts-datepicker-footer">
        <Button variant="ghost" size="small" onClick={handleSelectToday}>
          Today
        </Button>
        {clearable && selectedDate && (
          <Button variant="ghost" size="small" onClick={() => handleClear()}>
            Clear
          </Button>
        )}
        {!inline && (
          <Button variant="secondary" size="small" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className={`ts-datepicker-wrapper ${className}`.trim()} ref={containerRef}>
        {label && (
          <label className="ts-datepicker-label">
            {label}
            {required && <span className="ts-datepicker-required" aria-hidden="true">*</span>}
          </label>
        )}
        {renderCalendarContent()}
        {(error || helperText) && (
          <span className={`ts-datepicker-helper ${isError ? 'ts-datepicker-helper--error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ts-datepicker-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={pickerId} className="ts-datepicker-label">
          {label}
          {required && <span className="ts-datepicker-required" aria-hidden="true">*</span>}
        </label>
      )}

      <button
        id={pickerId}
        type="button"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-describedby={helperText || error ? helperId : undefined}
        disabled={disabled}
        className={[
          'ts-datepicker-trigger',
          isOpen ? 'ts-datepicker-trigger--open' : '',
          isError ? 'ts-datepicker-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="ts-datepicker-trigger-left">
          <span className="ts-datepicker-icon" aria-hidden="true">
            <CalendarIcon size={18} />
          </span>
          {selectedDate ? (
            <span>{formatDate(selectedDate)}</span>
          ) : (
            <span className="ts-datepicker-placeholder">{placeholder}</span>
          )}
        </span>

        <span className="ts-datepicker-trigger-right">
          {clearable && selectedDate && !disabled && (
            <button
              type="button"
              className="ts-datepicker-clear-btn"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <X size={15} />
            </button>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="ts-datepicker-popover">
          {renderCalendarContent()}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-datepicker-helper ${isError ? 'ts-datepicker-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
