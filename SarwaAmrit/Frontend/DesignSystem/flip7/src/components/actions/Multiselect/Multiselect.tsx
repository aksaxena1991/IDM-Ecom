import React, { useEffect, useId, useRef, useState } from 'react';
import { IconCheck, IconChevronDown, IconX } from '../../../lib/icons';
import './Multiselect.css';

export interface MultiselectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiselectProps {
  options: MultiselectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  id?: string;
}

export const Multiselect: React.FC<MultiselectProps> = ({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Select…',
  label,
  helperText,
  error,
  disabled,
  searchable = true,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const selected = value ?? internal;
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div ref={root} className={['f7-ms', className].filter(Boolean).join(' ')}>
      {label && <label className="f7-ms-label" htmlFor={id || generatedId}>{label}</label>}
      <button
        id={id || generatedId}
        type="button"
        disabled={disabled}
        className="f7-surface-control f7-ms-trigger"
        onClick={() => !disabled && setOpen((v) => !v)}
      >
        <span className="f7-ms-chips">
          {selected.length === 0 && <span className="f7-placeholder">{placeholder}</span>}
          {selected.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span key={v} className="f7-ms-chip">
                {opt?.label ?? v}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                >
                  <IconX size={12} />
                </span>
              </span>
            );
          })}
        </span>
        <IconChevronDown />
      </button>
      {open && (
        <div className="f7-select-menu">
          {searchable && (
            <input className="f7-select-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" />
          )}
          {filtered.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <button key={opt.value} type="button" className={['f7-select-option', on ? 'is-on' : ''].filter(Boolean).join(' ')} onClick={() => toggle(opt.value)}>
                {opt.label}
                {on && <IconCheck />}
              </button>
            );
          })}
        </div>
      )}
      {(error || helperText) && (
        <span className={['f7-ms-helper', error ? 'f7-ms-helper--error' : ''].filter(Boolean).join(' ')}>{error || helperText}</span>
      )}
    </div>
  );
};
Multiselect.displayName = 'Multiselect';
