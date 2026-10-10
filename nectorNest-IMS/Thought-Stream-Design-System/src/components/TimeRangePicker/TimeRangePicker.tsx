import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import './TimeRangePicker.css';
import { Clock, X } from 'lucide-react';
import { Button } from '../Button';

export interface TimeRange {
  start: string | null;
  end: string | null;
}

export interface TimeRangePreset {
  label: string;
  range: TimeRange;
}

export interface TimeRangePickerProps {
  /** Selected time range */
  value?: TimeRange | null;
  /** Initial selected time range */
  defaultValue?: TimeRange | null;
  /** Callback fired when time range changes */
  onChange?: (range: TimeRange) => void;
  /** Time format: 12-hour AM/PM or 24-hour military notation */
  format?: '12h' | '24h';
  /** Minute step intervals (e.g. 5, 10, 15, 30) */
  minuteStep?: number;
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
  /** Allow clearing selected time range */
  clearable?: boolean;
  /** Render time selector directly inline without popover */
  inline?: boolean;
  /** Quick range presets */
  presets?: TimeRangePreset[];
  className?: string;
  id?: string;
}

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const parseTime = (timeStr: string | null, format: '12h' | '24h') => {
  if (!timeStr) {
    return { hour: null, minute: null, period: 'AM' as 'AM' | 'PM' };
  }
  if (format === '24h') {
    const parts = timeStr.split(':');
    return {
      hour: parts[0] || null,
      minute: parts[1] || null,
      period: 'AM' as const,
    };
  } else {
    const [timePart, periodPart] = timeStr.split(' ');
    const [h, m] = (timePart || '').split(':');
    return {
      hour: h || null,
      minute: m || null,
      period: (periodPart?.toUpperCase() === 'PM' ? 'PM' : 'AM') as 'AM' | 'PM',
    };
  }
};

const getDefaultPresets = (format: '12h' | '24h'): TimeRangePreset[] => {
  if (format === '24h') {
    return [
      { label: 'Morning', range: { start: '09:00', end: '12:00' } },
      { label: 'Afternoon', range: { start: '13:00', end: '17:00' } },
      { label: 'Full Day', range: { start: '09:00', end: '17:00' } },
      { label: 'Evening', range: { start: '18:00', end: '21:00' } },
    ];
  }

  return [
    { label: 'Morning', range: { start: '09:00 AM', end: '12:00 PM' } },
    { label: 'Afternoon', range: { start: '01:00 PM', end: '05:00 PM' } },
    { label: 'Full Day', range: { start: '09:00 AM', end: '05:00 PM' } },
    { label: 'Evening', range: { start: '06:00 PM', end: '09:00 PM' } },
  ];
};

/**
 * ThoughtStream TimeRangePicker Component
 *
 * Provides a dual-column start and end time selector with 0px geometry,
 * hairline borders, monospace typography, and quick focus window presets.
 */
export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  defaultValue = null,
  onChange,
  format = '12h',
  minuteStep = 15,
  label,
  placeholder = 'Select time range...',
  helperText,
  error,
  disabled = false,
  required = false,
  clearable = true,
  inline = false,
  presets,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const pickerId = id || generatedId;
  const helperId = `${pickerId}-helper`;

  const [internalRange, setInternalRange] = useState<TimeRange>(
    defaultValue || { start: null, end: null }
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRange = value !== undefined ? (value || { start: null, end: null }) : internalRange;
  const isError = Boolean(error);

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

  const hoursList = useMemo(() => {
    if (format === '24h') {
      return Array.from({ length: 24 }, (_, i) => pad(i));
    }
    return Array.from({ length: 12 }, (_, i) => pad(i + 1));
  }, [format]);

  const minutesList = useMemo(() => {
    const list: string[] = [];
    const step = Math.max(1, Math.min(60, minuteStep));
    for (let i = 0; i < 60; i += step) {
      list.push(pad(i));
    }
    return list;
  }, [minuteStep]);

  const periodsList: Array<'AM' | 'PM'> = ['AM', 'PM'];

  const startParsed = useMemo(() => parseTime(selectedRange.start, format), [selectedRange.start, format]);
  const endParsed = useMemo(() => parseTime(selectedRange.end, format), [selectedRange.end, format]);

  const handleTimeChange = (
    type: 'start' | 'end',
    newHour: string | null,
    newMinute: string | null,
    newPeriod: 'AM' | 'PM'
  ) => {
    const targetParsed = type === 'start' ? startParsed : endParsed;
    const h = newHour ?? targetParsed.hour ?? '09';
    const m = newMinute ?? targetParsed.minute ?? '00';
    const p = newPeriod;

    let timeStr = '';
    if (format === '24h') {
      timeStr = `${h}:${m}`;
    } else {
      timeStr = `${h}:${m} ${p}`;
    }

    const updated: TimeRange = {
      ...selectedRange,
      [type]: timeStr,
    };

    if (value === undefined) {
      setInternalRange(updated);
    }
    onChange?.(updated);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const empty: TimeRange = { start: null, end: null };
    if (value === undefined) {
      setInternalRange(empty);
    }
    onChange?.(empty);
  };

  const handleSelectPreset = (range: TimeRange) => {
    if (value === undefined) {
      setInternalRange(range);
    }
    onChange?.(range);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const effectivePresets = presets !== undefined ? presets : getDefaultPresets(format);

  const renderSection = (
    type: 'start' | 'end',
    title: string,
    parsed: { hour: string | null; minute: string | null; period: 'AM' | 'PM' },
    currentTimeStr: string | null
  ) => {
    return (
      <div className="ts-timerangepicker-section">
        <div className="ts-timerangepicker-section-header">
          <span>{title}</span>
          <span className="ts-timerangepicker-section-val">{currentTimeStr || '--:--'}</span>
        </div>

        <div className="ts-timerangepicker-columns">
          {/* Hours */}
          <div className="ts-timerangepicker-column">
            <div className="ts-timerangepicker-col-header">HH</div>
            <ul className="ts-timerangepicker-list" role="listbox" aria-label={`${title} hours`}>
              {hoursList.map((h) => {
                const isSelected = parsed.hour === h;
                return (
                  <li key={h} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`ts-timerangepicker-cell ${isSelected ? 'ts-timerangepicker-cell--selected' : ''}`}
                      onClick={() => handleTimeChange(type, h, parsed.minute, parsed.period)}
                    >
                      {h}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Minutes */}
          <div className="ts-timerangepicker-column">
            <div className="ts-timerangepicker-col-header">MM</div>
            <ul className="ts-timerangepicker-list" role="listbox" aria-label={`${title} minutes`}>
              {minutesList.map((m) => {
                const isSelected = parsed.minute === m;
                return (
                  <li key={m} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`ts-timerangepicker-cell ${isSelected ? 'ts-timerangepicker-cell--selected' : ''}`}
                      onClick={() => handleTimeChange(type, parsed.hour, m, parsed.period)}
                    >
                      {m}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* AM / PM (12h mode only) */}
          {format === '12h' && (
            <div className="ts-timerangepicker-column">
              <div className="ts-timerangepicker-col-header">AM/PM</div>
              <ul className="ts-timerangepicker-list" role="listbox" aria-label={`${title} period`}>
                {periodsList.map((p) => {
                  const isSelected = parsed.period === p;
                  return (
                    <li key={p} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        className={`ts-timerangepicker-cell ${isSelected ? 'ts-timerangepicker-cell--selected' : ''}`}
                        onClick={() => handleTimeChange(type, parsed.hour, parsed.minute, p)}
                      >
                        {p}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayText = useMemo(() => {
    if (selectedRange.start && selectedRange.end) {
      return `${selectedRange.start} – ${selectedRange.end}`;
    }
    if (selectedRange.start) {
      return `${selectedRange.start} – ...`;
    }
    return null;
  }, [selectedRange]);

  const renderPickerCard = () => (
    <div className={`ts-timerangepicker-card ${inline ? 'ts-timerangepicker-card--inline' : ''}`.trim()}>
      {effectivePresets.length > 0 && (
        <div className="ts-timerangepicker-presets">
          {effectivePresets.map((p) => (
            <button
              key={p.label}
              type="button"
              className="ts-timerangepicker-preset-btn"
              onClick={() => handleSelectPreset(p.range)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="ts-timerangepicker-body">
        {renderSection('start', 'Start Time', startParsed, selectedRange.start)}
        {renderSection('end', 'End Time', endParsed, selectedRange.end)}
      </div>

      <div className="ts-timerangepicker-footer">
        <span className="ts-timerangepicker-summary">
          {displayText || 'Select start & end times'}
        </span>

        <div className="ts-timerangepicker-footer-actions">
          {clearable && (selectedRange.start || selectedRange.end) && (
            <Button variant="ghost" size="small" onClick={() => handleClear()}>
              Clear
            </Button>
          )}
          {!inline && (
            <Button variant="primary" size="small" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className={`ts-timerangepicker-wrapper ${className}`.trim()} ref={containerRef}>
        {label && (
          <label className="ts-timerangepicker-label">
            {label}
            {required && <span className="ts-timerangepicker-required" aria-hidden="true">*</span>}
          </label>
        )}
        {renderPickerCard()}
        {(error || helperText) && (
          <span className={`ts-timerangepicker-helper ${isError ? 'ts-timerangepicker-helper--error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ts-timerangepicker-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={pickerId} className="ts-timerangepicker-label">
          {label}
          {required && <span className="ts-timerangepicker-required" aria-hidden="true">*</span>}
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
          'ts-timerangepicker-trigger',
          isOpen ? 'ts-timerangepicker-trigger--open' : '',
          isError ? 'ts-timerangepicker-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="ts-timerangepicker-trigger-left">
          <span className="ts-timerangepicker-icon" aria-hidden="true">
            <Clock size={18} />
          </span>
          {displayText ? (
            <span>{displayText}</span>
          ) : (
            <span className="ts-timerangepicker-placeholder">{placeholder}</span>
          )}
        </span>

        <span className="ts-timerangepicker-trigger-right">
          {clearable && (selectedRange.start || selectedRange.end) && !disabled && (
            <button
              type="button"
              className="ts-timerangepicker-clear-btn"
              onClick={handleClear}
              aria-label="Clear time range"
            >
              <X size={15} />
            </button>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="ts-timerangepicker-popover">
          {renderPickerCard()}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-timerangepicker-helper ${isError ? 'ts-timerangepicker-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';
