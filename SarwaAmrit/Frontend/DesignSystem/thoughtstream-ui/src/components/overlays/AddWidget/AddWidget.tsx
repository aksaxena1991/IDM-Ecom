import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Button } from '../../actions/Button';
import './AddWidget.css';

export type AddWidgetPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export interface WidgetOption {
  /** Stable id used in the selected-value array */
  id: string;
  /** Primary label */
  title: string;
  /** Secondary line, truncated when it overflows */
  description?: string;
  /** Leading icon */
  icon?: React.ReactNode;
  /** Prevents toggling this widget */
  disabled?: boolean;
}

export interface AddWidgetProps {
  /** Catalog of widgets the user can show or hide */
  widgets: WidgetOption[];
  /** Controlled list of selected widget ids */
  value?: string[];
  /** Initial selection when uncontrolled */
  defaultValue?: string[];
  /** Fired with the next selected ids. Menu stays open. */
  onChange?: (ids: string[]) => void;
  /** Trigger label */
  triggerLabel?: string;
  /** Uppercase heading inside the menu */
  heading?: string;
  /** Anchor relative to the trigger */
  placement?: AddWidgetPlacement;
  /** Controlled open state */
  isOpen?: boolean;
  /** Initial open state when uncontrolled */
  defaultOpen?: boolean;
  /** Fired when the menu opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger */
  disabled?: boolean;
  className?: string;
}

/**
 * Add Widget menu.
 *
 * A compact trigger opens a catalog of dashboard widgets. Each row shows an
 * icon, title, description, and a check when that widget is on the canvas.
 * Choosing a row toggles it and leaves the menu open.
 */
export const AddWidget: React.FC<AddWidgetProps> = ({
  widgets,
  value,
  defaultValue = [],
  onChange,
  triggerLabel = 'Add Widget',
  heading = 'Widgets',
  placement = 'bottom-end',
  isOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onOpenChangeRef = useRef(onOpenChange);
  const headingId = useId();
  const menuId = useId();

  onChangeRef.current = onChange;
  onOpenChangeRef.current = onOpenChange;

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const selected = value !== undefined ? value : internalValue;

  const setOpen = (next: boolean) => {
    if (isOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChangeRef.current?.(next);
  };

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    if (value === undefined) {
      setInternalValue(next);
    }
    onChangeRef.current?.(next);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isOpen]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      menuRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const moveFocus = (direction: 1 | -1 | 'start' | 'end') => {
    const options = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="option"]:not(:disabled)'
      ) ?? []
    );
    if (options.length === 0) return;

    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex = 0;
    if (direction === 'start') nextIndex = 0;
    else if (direction === 'end') nextIndex = options.length - 1;
    else if (current === -1) nextIndex = direction === 1 ? 0 : options.length - 1;
    else nextIndex = (current + direction + options.length) % options.length;

    options[nextIndex]?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveFocus('start');
    } else if (event.key === 'End') {
      event.preventDefault();
      moveFocus('end');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`ts-add-widget ${className}`.trim()}
    >
      <Button
        variant="secondary"
        size="small"
        disabled={disabled}
        leftIcon={<Plus size={14} strokeWidth={2} />}
        className={open ? 'ts-add-widget-trigger--open' : ''}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
      >
        {triggerLabel}
      </Button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={headingId}
          tabIndex={-1}
          className={`ts-add-widget-menu ts-add-widget-menu--${placement}`}
          onKeyDown={onMenuKeyDown}
        >
          <div id={headingId} className="ts-add-widget-heading">
            {heading}
          </div>

          {widgets.length === 0 ? (
            <div className="ts-add-widget-empty">No widgets available.</div>
          ) : (
            widgets.map((widget) => {
              const isSelected = selected.includes(widget.id);
              return (
                <button
                  key={widget.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={widget.disabled}
                  className={[
                    'ts-add-widget-option',
                    isSelected ? 'ts-add-widget-option--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!widget.disabled) toggle(widget.id);
                  }}
                >
                  <span className="ts-add-widget-icon" aria-hidden="true">
                    {widget.icon}
                  </span>
                  <span className="ts-add-widget-copy">
                    <span className="ts-add-widget-title">{widget.title}</span>
                    {widget.description && (
                      <span className="ts-add-widget-description">
                        {widget.description}
                      </span>
                    )}
                  </span>
                  <span className="ts-add-widget-check" aria-hidden="true">
                    {isSelected && <Check size={16} strokeWidth={2} />}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

AddWidget.displayName = 'AddWidget';
