import React, { useState, useRef, useEffect, useId } from 'react';
import './Multiselect.css';
import { ChevronDown, X, Check, Search } from 'lucide-react';

export interface MultiselectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface MultiselectProps {
  /** List of selectable items */
  options: MultiselectOption[];
  /** Controlled selected array of values */
  value?: string[];
  /** Initial selected values */
  defaultValue?: string[];
  /** Callback fired when selected values change */
  onChange?: (values: string[]) => void;
  /** Placeholder when no values are selected */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Validation error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field flag */
  required?: boolean;
  /** Enable embedded search filter (default true) */
  searchable?: boolean;
  /** Show button to clear all selected values */
  clearable?: boolean;
  /** Custom wrapper class */
  className?: string;
  id?: string;
}

/**
 * ThoughtStream Multiselect Component
 *
 * Implements tag chips, 0px border radius, sharp geometric checkboxes,
 * flat appearance, and calm stone palette.
 */
export const Multiselect: React.FC<MultiselectProps> = ({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Select items...',
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  searchable = true,
  clearable = true,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helperId = `${selectId}-helper`;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = value !== undefined ? value : internalValue;
  const isError = Boolean(error);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const toggleOption = (optValue: string) => {
    let next: string[];
    if (selectedValues.includes(optValue)) {
      next = selectedValues.filter((v) => v !== optValue);
    } else {
      next = [...selectedValues, optValue];
    }

    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const removeTag = (optValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedValues.filter((v) => v !== optValue);
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value === undefined) {
      setInternalValue([]);
    }
    onChange?.([]);
  };

  return (
    <div
      ref={containerRef}
      className={`ts-multiselect-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={selectId} className="ts-multiselect-label">
          {label}
          {required && <span className="ts-multiselect-required" aria-hidden="true">*</span>}
        </label>
      )}

      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-describedby={helperText || error ? helperId : undefined}
        tabIndex={disabled ? -1 : 0}
        className={[
          'ts-multiselect-trigger',
          isOpen ? 'ts-multiselect-trigger--open' : '',
          isError ? 'ts-multiselect-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <div className="ts-multiselect-tags">
          {selectedValues.length === 0 ? (
            <span className="ts-multiselect-placeholder">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const opt = options.find((o) => o.value === val);
              const labelText = opt ? opt.label : val;
              return (
                <span key={val} className="ts-multiselect-tag">
                  <span>{labelText}</span>
                  {!disabled && (
                    <button
                      type="button"
                      aria-label={`Remove ${labelText}`}
                      className="ts-multiselect-tag-remove"
                      onClick={(e) => removeTag(val, e)}
                    >
                      <X size={13} />
                    </button>
                  )}
                </span>
              );
            })
          )}
        </div>

        <span className="ts-multiselect-icon-group">
          {clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              className="ts-multiselect-clear-btn"
              onClick={clearAll}
              aria-label="Clear all selections"
            >
              <X size={15} />
            </button>
          )}
          <span
            className={`ts-multiselect-chevron ${isOpen ? 'ts-multiselect-chevron--open' : ''}`}
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </span>
        </span>
      </div>

      {isOpen && (
        <div className="ts-multiselect-menu" role="listbox" aria-multiselectable="true">
          {searchable && (
            <div className="ts-multiselect-search-container">
              <Search size={14} color="var(--ts-color-text-tertiary)" />
              <input
                ref={searchInputRef}
                type="text"
                className="ts-multiselect-search-input"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="ts-multiselect-empty">No matching options found.</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={[
                    'ts-multiselect-option',
                    isSelected ? 'ts-multiselect-option--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(opt.value);
                  }}
                >
                  <span
                    className={`ts-multiselect-checkbox-box ${
                      isSelected ? 'ts-multiselect-checkbox-box--checked' : ''
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <Check size={12} color="var(--ts-color-bg)" strokeWidth={3} />
                    )}
                  </span>

                  <span>{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-multiselect-helper ${isError ? 'ts-multiselect-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

Multiselect.displayName = 'Multiselect';
