import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import './TimePicker.css';
import { Clock, X } from 'lucide-react';
import { Button } from '../Button';

export interface TimePreset {
  label: string;
  value: string;
}

export interface TimePickerProps {
  /** Selected time formatted string (e.g. "09:30 AM" or "14:30") */
  value?: string | null;
  /** Initial selected time string */
  defaultValue?: string | null;
  /** Callback fired when time changes */
  onChange?: (time: string | null) => void;
  /** Time format: 12-hour with AM/PM or 24-hour military notation */
  format?: '12h' | '24h';
  /** Minute step interval (e.g. 1, 5, 10, 15, 30) */
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
  /** Allow clearing selected time */
  clearable?: boolean;
  /** Render time selector directly inline without popover */
  inline?: boolean;
  /** Optional quick preset shortcuts */
  presets?: TimePreset[];
  className?: string;
  id?: string;
}

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const getCurrentTimeString = (format: '12h' | '24h', minuteStep: number = 5): string => {
  const now = new Date();
  const rawMinutes = now.getMinutes();
  const roundedMinutes = Math.round(rawMinutes / minuteStep) * minuteStep;
  const clampedMinutes = roundedMinutes >= 60 ? 55 : roundedMinutes;

  if (format === '24h') {
    return `${pad(now.getHours())}:${pad(clampedMinutes)}`;
  } else {
    const hours24 = now.getHours();
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${pad(hours12)}:${pad(clampedMinutes)} ${period}`;
  }
};

/**
 * ThoughtStream TimePicker Component
 *
 * Provides a minimal, tabular time picker with 0px geometry,
 * hairline borders, monospace typography, column selectors, and quick presets.
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  defaultValue = null,
  onChange,
  format = '12h',
  minuteStep = 5,
  label,
  placeholder = 'Select time...',
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

  const [internalTime, setInternalTime] = useState<string | null>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTime = value !== undefined ? value : internalTime;
  const isError = Boolean(error);

  // Parse hours, minutes, period from selectedTime
  const parsedTime = useMemo(() => {
    if (!selectedTime) {
      return { hour: null, minute: null, period: 'AM' as 'AM' | 'PM' };
    }
    if (format === '24h') {
      const parts = selectedTime.split(':');
      return {
        hour: parts[0] || null,
        minute: parts[1] || null,
        period: 'AM' as const,
      };
    } else {
      const [timePart, periodPart] = selectedTime.split(' ');
      const [h, m] = (timePart || '').split(':');
      return {
        hour: h || null,
        minute: m || null,
        period: (periodPart?.toUpperCase() === 'PM' ? 'PM' : 'AM') as 'AM' | 'PM',
      };
    }
  }, [selectedTime, format]);

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

  // Generate selectable options
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

  const handleTimePartSelect = (
    newHour: string | null,
    newMinute: string | null,
    newPeriod: 'AM' | 'PM'
  ) => {
    const h = newHour ?? parsedTime.hour ?? (format === '24h' ? '12' : '12');
    const m = newMinute ?? parsedTime.minute ?? '00';
    const p = newPeriod;

    let result = '';
    if (format === '24h') {
      result = `${h}:${m}`;
    } else {
      result = `${h}:${m} ${p}`;
    }

    if (value === undefined) {
      setInternalTime(result);
    }
    onChange?.(result);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value === undefined) {
      setInternalTime(null);
    }
    onChange?.(null);
  };

  const handleSelectNow = () => {
    const nowStr = getCurrentTimeString(format, minuteStep);
    if (value === undefined) {
      setInternalTime(nowStr);
    }
    onChange?.(nowStr);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const handleSelectPreset = (presetVal: string) => {
    if (value === undefined) {
      setInternalTime(presetVal);
    }
    onChange?.(presetVal);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const renderPickerCard = () => (
    <div className={`ts-timepicker-card ${inline ? 'ts-timepicker-card--inline' : ''}`.trim()}>
      {presets && presets.length > 0 && (
        <div className="ts-timepicker-presets">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="ts-timepicker-preset-btn"
              onClick={() => handleSelectPreset(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="ts-timepicker-columns">
        {/* Hours Column */}
        <div className="ts-timepicker-column">
          <div className="ts-timepicker-col-header">HH</div>
          <ul className="ts-timepicker-list" role="listbox" aria-label="Hour">
            {hoursList.map((h) => {
              const isSelected = parsedTime.hour === h;
              return (
                <li key={h} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`ts-timepicker-cell ${isSelected ? 'ts-timepicker-cell--selected' : ''}`}
                    onClick={() => handleTimePartSelect(h, parsedTime.minute, parsedTime.period)}
                  >
                    {h}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Minutes Column */}
        <div className="ts-timepicker-column">
          <div className="ts-timepicker-col-header">MM</div>
          <ul className="ts-timepicker-list" role="listbox" aria-label="Minute">
            {minutesList.map((m) => {
              const isSelected = parsedTime.minute === m;
              return (
                <li key={m} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={`ts-timepicker-cell ${isSelected ? 'ts-timepicker-cell--selected' : ''}`}
                    onClick={() => handleTimePartSelect(parsedTime.hour, m, parsedTime.period)}
                  >
                    {m}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Period Column (12h mode only) */}
        {format === '12h' && (
          <div className="ts-timepicker-column">
            <div className="ts-timepicker-col-header">AM/PM</div>
            <ul className="ts-timepicker-list" role="listbox" aria-label="Period">
              {periodsList.map((p) => {
                const isSelected = parsedTime.period === p;
                return (
                  <li key={p} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`ts-timepicker-cell ${isSelected ? 'ts-timepicker-cell--selected' : ''}`}
                      onClick={() => handleTimePartSelect(parsedTime.hour, parsedTime.minute, p)}
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

      <div className="ts-timepicker-footer">
        <Button variant="ghost" size="small" onClick={handleSelectNow}>
          Now
        </Button>
        {clearable && selectedTime && (
          <Button variant="ghost" size="small" onClick={() => handleClear()}>
            Clear
          </Button>
        )}
        {!inline && (
          <Button variant="secondary" size="small" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className={`ts-timepicker-wrapper ${className}`.trim()} ref={containerRef}>
        {label && (
          <label className="ts-timepicker-label">
            {label}
            {required && <span className="ts-timepicker-required" aria-hidden="true">*</span>}
          </label>
        )}
        {renderPickerCard()}
        {(error || helperText) && (
          <span className={`ts-timepicker-helper ${isError ? 'ts-timepicker-helper--error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ts-timepicker-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={pickerId} className="ts-timepicker-label">
          {label}
          {required && <span className="ts-timepicker-required" aria-hidden="true">*</span>}
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
          'ts-timepicker-trigger',
          isOpen ? 'ts-timepicker-trigger--open' : '',
          isError ? 'ts-timepicker-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="ts-timepicker-trigger-left">
          <span className="ts-timepicker-icon" aria-hidden="true">
            <Clock size={18} />
          </span>
          {selectedTime ? (
            <span>{selectedTime}</span>
          ) : (
            <span className="ts-timepicker-placeholder">{placeholder}</span>
          )}
        </span>

        <span className="ts-timepicker-trigger-right">
          {clearable && selectedTime && !disabled && (
            <button
              type="button"
              className="ts-timepicker-clear-btn"
              onClick={handleClear}
              aria-label="Clear time"
            >
              <X size={15} />
            </button>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="ts-timepicker-popover">
          {renderPickerCard()}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-timepicker-helper ${isError ? 'ts-timepicker-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

TimePicker.displayName = 'TimePicker';
