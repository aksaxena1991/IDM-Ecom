import React, { useState, useRef, useEffect, useId } from 'react';
import './Select.css';
import { ChevronDown, Check, X, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  /** Array of selectable options */
  options: SelectOption[];
  /** Controlled selected value */
  value?: string;
  /** Initial selected value */
  defaultValue?: string;
  /** Callback fired when an option is selected */
  onChange?: (value: string) => void;
  /** Placeholder text when no option is chosen */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Explanatory helper text */
  helperText?: string;
  /** Validation error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field flag */
  required?: boolean;
  /** Enable embedded search filter */
  searchable?: boolean;
  /** Show button to clear selection */
  clearable?: boolean;
  /** Leading icon before selection value */
  leadingIcon?: React.ReactNode;
  /** Custom wrapper class */
  className?: string;
  id?: string;
}

/**
 * ThoughtStream Select Component
 *
 * Implements 48px height, 0px border radius, hairline stone borders,
 * flat surface, and calm focus rings.
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Select an option...',
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  searchable = false,
  clearable = false,
  leadingIcon,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helperId = `${selectId}-helper`;
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const isError = Boolean(error);

  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Click outside listener
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

  const handleSelect = (optionValue: string) => {
    if (value === undefined) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value === undefined) {
      setInternalValue('');
    }
    onChange?.('');
  };

  return (
    <div
      ref={containerRef}
      className={`ts-select-wrapper ${className}`.trim()}
    >
      {label && (
        <label htmlFor={selectId} className="ts-select-label">
          {label}
          {required && <span className="ts-select-required" aria-hidden="true">*</span>}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-describedby={helperText || error ? helperId : undefined}
        disabled={disabled}
        className={[
          'ts-select-trigger',
          isOpen ? 'ts-select-trigger--open' : '',
          isError ? 'ts-select-trigger--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="ts-select-trigger-content">
          {leadingIcon && (
            <span className="ts-select-leading-icon" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span aria-hidden="true">{selectedOption.icon}</span>
              )}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="ts-select-placeholder">{placeholder}</span>
          )}
        </span>

        <span className="ts-select-icon-group">
          {clearable && selectedValue && (
            <button
              type="button"
              className="ts-select-clear-btn"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <X size={15} />
            </button>
          )}
          <span
            className={`ts-select-chevron ${isOpen ? 'ts-select-chevron--open' : ''}`}
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="ts-select-menu" role="listbox">
          {searchable && (
            <div className="ts-select-search-container">
              <Search size={14} color="var(--ts-color-text-tertiary)" />
              <input
                ref={searchInputRef}
                type="text"
                className="ts-select-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="ts-select-empty">No options found.</div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === selectedValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  className={[
                    'ts-select-option',
                    isSelected ? 'ts-select-option--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="ts-select-option-label">
                    {opt.icon && <span aria-hidden="true">{opt.icon}</span>}
                    <span>{opt.label}</span>
                  </span>

                  {isSelected && (
                    <span className="ts-select-option-checkmark">
                      <Check size={16} />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {(error || helperText) && (
        <span
          id={helperId}
          className={`ts-select-helper ${isError ? 'ts-select-helper--error' : ''}`}
          role={isError ? 'alert' : undefined}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};

Select.displayName = 'Select';
