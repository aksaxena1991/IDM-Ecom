import React, { useEffect, useId, useRef, useState } from 'react';
import { IconCheck, IconChevronDown, IconX } from '../../../lib/icons';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Select…',
  label,
  helperText,
  error,
  disabled,
  required,
  searchable,
  clearable,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const selected = value !== undefined ? value : internal;
  const current = options.find((o) => o.value === selected);
  const filtered = searchable && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (v: string) => {
    if (value === undefined) setInternal(v);
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div ref={root} className={['f7-select', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="f7-select-label" htmlFor={selectId}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        className={['f7-surface-control', 'f7-select-trigger', error ? 'is-error' : ''].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span>{current ? current.label : <span className="f7-placeholder">{placeholder}</span>}</span>
        <span className="f7-select-icons">
          {clearable && selected ? (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear"
              onClick={(e) => {
                e.stopPropagation();
                pick('');
              }}
            >
              <IconX size={14} />
            </span>
          ) : null}
          <IconChevronDown />
        </span>
      </button>
      {open && (
        <div className="f7-select-menu" role="listbox">
          {searchable && (
            <input
              className="f7-select-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
            />
          )}
          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              disabled={opt.disabled}
              aria-selected={opt.value === selected}
              className={['f7-select-option', opt.value === selected ? 'is-on' : ''].filter(Boolean).join(' ')}
              onClick={() => pick(opt.value)}
            >
              {opt.label}
              {opt.value === selected && <IconCheck />}
            </button>
          ))}
        </div>
      )}
      {(error || helperText) && (
        <span className={['f7-select-helper', error ? 'f7-select-helper--error' : ''].filter(Boolean).join(' ')}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};
Select.displayName = 'Select';
