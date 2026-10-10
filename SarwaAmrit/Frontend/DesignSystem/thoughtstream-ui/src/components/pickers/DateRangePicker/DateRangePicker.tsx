import React, { useState, useRef, useEffect, useId } from 'react';
import './DateRangePicker.css';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../actions/Button';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  label: string;
  range: DateRange;
}

export interface DateRangePickerProps {
  /** Selected date range */
  value?: DateRange | null;
  /** Initial selected date range */
  defaultValue?: DateRange | null;
  /** Callback fired when date range changes */
  onChange?: (range: DateRange) => void;
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
  /** Allow clearing selected range */
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
  /** Quick range presets */
  presets?: DateRangePreset[];
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

const isSameDay = (d1: Date | null, d2: Date | null) => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isBetween = (target: Date, d1: Date, d2: Date) => {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const start = new Date(
    Math.min(d1.getTime(), d2.getTime())
  );
  const end = new Date(
    Math.max(d1.getTime(), d2.getTime())
  );
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t > s && t < e;
};

const defaultFormatDate = (d: Date): string => {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDefaultPresets = (): DateRangePreset[] => {
  const today = new Date();

  const last7DaysStart = new Date(today);
  last7DaysStart.setDate(today.getDate() - 6);

  const last14DaysStart = new Date(today);
  last14DaysStart.setDate(today.getDate() - 13);

  const last30DaysStart = new Date(today);
  last30DaysStart.setDate(today.getDate() - 29);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return [
    { label: 'Today', range: { start: today, end: today } },
    { label: 'Last 7 Days', range: { start: last7DaysStart, end: today } },
    { label: 'Last 14 Days', range: { start: last14DaysStart, end: today } },
    { label: 'Last 30 Days', range: { start: last30DaysStart, end: today } },
    { label: 'This Month', range: { start: thisMonthStart, end: today } },
  ];
};

/**
 * ThoughtStream DateRangePicker Component
 *
 * Implements two-month calendar grid, interval hover preview,
 * 0px geometry, quick presets, and distraction-free date ranges.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = 'Select date range...',
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

  const [internalRange, setInternalRange] = useState<DateRange>(
    defaultValue || { start: null, end: null }
  );
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRange = value !== undefined ? (value || { start: null, end: null }) : internalRange;
  const isError = Boolean(error);

  // Active view date: represents the left month
  const [viewDate, setViewDate] = useState<Date>(() => {
    return selectedRange.start || new Date();
  });

  // Click outside listener
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

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    const { start, end } = selectedRange;

    let newRange: DateRange;

    if (!start || (start && end)) {
      // Start fresh range
      newRange = { start: date, end: null };
    } else {
      // Complete range
      if (date < start) {
        newRange = { start: date, end: start };
      } else {
        newRange = { start, end: date };
      }
    }

    if (value === undefined) {
      setInternalRange(newRange);
    }
    onChange?.(newRange);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const emptyRange: DateRange = { start: null, end: null };
    if (value === undefined) {
      setInternalRange(emptyRange);
    }
    onChange?.(emptyRange);
  };

  const handleSelectPreset = (range: DateRange) => {
    if (value === undefined) {
      setInternalRange(range);
    }
    if (range.start) {
      setViewDate(range.start);
    }
    onChange?.(range);
    if (!inline) {
      setIsOpen(false);
    }
  };

  // Build calendar month days
  const buildMonthDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
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

    return days;
  };

  const leftYear = viewDate.getFullYear();
  const leftMonth = viewDate.getMonth();

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = (leftMonth + 1) % 12;

  const leftDays = buildMonthDays(leftYear, leftMonth);
  const rightDays = buildMonthDays(rightYear, rightMonth);

  const today = new Date();

  const effectivePresets = presets !== undefined ? presets : getDefaultPresets();

  const renderMonth = (
    year: number,
    month: number,
    days: Array<{ date: Date; isCurrentMonth: boolean }>,
    showPrev: boolean,
    showNext: boolean
  ) => {
    return (
      <div className="ts-daterangepicker-month">
        <div className="ts-daterangepicker-month-header">
          {showPrev ? (
            <button
              type="button"
              className="ts-daterange-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}

          <h4 className="ts-daterangepicker-month-title">
            {MONTH_NAMES[month]} {year}
          </h4>

          {showNext ? (
            <button
              type="button"
              className="ts-daterange-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          ) : (
            <div style={{ width: 28 }} />
          )}
        </div>

        <div className="ts-daterangepicker-weekdays" aria-hidden="true">
          {WEEKDAY_NAMES.map((d) => (
            <div key={d} className="ts-daterangepicker-weekday">
              {d}
            </div>
          ))}
        </div>

        <div className="ts-daterangepicker-grid" role="grid">
          {days.map(({ date, isCurrentMonth }) => {
            const isStart = isSameDay(date, selectedRange.start);
            const isEnd = isSameDay(date, selectedRange.end);
            const isToday = isSameDay(date, today);

            let inRange = false;
            if (selectedRange.start && selectedRange.end) {
              inRange = isBetween(date, selectedRange.start, selectedRange.end);
            }

            let inHoverRange = false;
            if (selectedRange.start && !selectedRange.end && hoverDate) {
              inHoverRange = isBetween(date, selectedRange.start, hoverDate);
            }

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
              'ts-daterangepicker-day',
              !isCurrentMonth ? 'ts-daterangepicker-day--adjacent' : '',
              isToday ? 'ts-daterangepicker-day--today' : '',
              isStart ? 'ts-daterangepicker-day--start' : '',
              isEnd ? 'ts-daterangepicker-day--end' : '',
              inRange ? 'ts-daterangepicker-day--in-range' : '',
              inHoverRange ? 'ts-daterangepicker-day--hover-range' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={date.toISOString()}
                type="button"
                role="gridcell"
                disabled={dayDisabled}
                className={classNames}
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => selectedRange.start && !selectedRange.end && setHoverDate(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const formattedDisplay = () => {
    if (selectedRange.start && selectedRange.end) {
      return `${formatDate(selectedRange.start)} – ${formatDate(selectedRange.end)}`;
    }
    if (selectedRange.start) {
      return `${formatDate(selectedRange.start)} – ...`;
    }
    return null;
  };

  const getSummaryText = () => {
    if (selectedRange.start && selectedRange.end) {
      const diffTime = Math.abs(selectedRange.end.getTime() - selectedRange.start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return `${diffDays} day${diffDays === 1 ? '' : 's'} selected`;
    }
    if (selectedRange.start) {
      return 'Select end date';
    }
    return 'Select start date';
  };

  const renderPickerCard = () => (
    <div
      className={`ts-daterangepicker-card ${inline ? 'ts-daterangepicker-card--inline' : ''}`.trim()}
      onMouseLeave={() => setHoverDate(null)}
    >
      {effectivePresets.length > 0 && (
        <div className="ts-daterangepicker-presets">
          {effectivePresets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="ts-daterangepicker-preset-btn"
              onClick={() => handleSelectPreset(p.range)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="ts-daterangepicker-months">
        {renderMonth(leftYear, leftMonth, leftDays, true, false)}
        {renderMonth(rightYear, rightMonth, rightDays, false, true)}
      </div>

      <div className="ts-daterangepicker-footer">
        <span className="ts-daterangepicker-summary">{getSummaryText()}</span>

        <div className="ts-daterangepicker-footer-actions">
          {clearable && (selectedRange.start || selectedRange.end) && (
            <Button variant="ghost" size="small" onClick={() => handleClear()}>
              Clear
            </Button>
          )}
          {!inline && (
            <Button
              variant="primary"
              size="small"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className={`ts-daterangepicker-wrapper ${className}`.trim()} ref={containerRef}>
        {label && (
          <label className="ts-daterangepicker-label">
            {label}
            {required && <span className="ts-daterangepicker-required" aria-hidden="true">*</span>}
          </label>
        )}
        {renderPickerCard()}
        {(error || helperText) && (
          <span className={`ts-daterangepicker-helper ${isError ? 'ts-daterangepicker-helper--error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }

  const displayText = formattedDisplay();

  return (
    <div
      ref={containerRef}
      className={`ts-daterangepicker-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={pickerId} className="ts-daterangepicker-label">
          {label}
          {required && <span className="ts-daterangepicker-required" aria-hidden="true">*</span>}
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
          'ts-daterangepicker-trigger',
          isOpen ? 'ts-daterangepicker-trigger--open' : '',
          isError ? 'ts-daterangepicker-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="ts-daterangepicker-trigger-left">
          <span className="ts-daterangepicker-icon" aria-hidden="true">
            <CalendarIcon size={18} />
          </span>
          {displayText ? (
            <span className="ts-daterangepicker-range-text">{displayText}</span>
          ) : (
            <span className="ts-daterangepicker-placeholder">{placeholder}</span>
          )}
        </span>

        <span className="ts-daterangepicker-trigger-right">
          {clearable && (selectedRange.start || selectedRange.end) && !disabled && (
            <button
              type="button"
              className="ts-daterangepicker-clear-btn"
              onClick={handleClear}
              aria-label="Clear date range"
            >
              <X size={15} />
            </button>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="ts-daterangepicker-popover">
          {renderPickerCard()}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-daterangepicker-helper ${isError ? 'ts-daterangepicker-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
