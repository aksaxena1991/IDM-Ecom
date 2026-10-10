import React, { forwardRef, useEffect, useRef, useId, createContext, useContext } from 'react';
import './Checkbox.css';

export type CheckboxAlign = 'start' | 'center';
export type CheckboxOrientation = 'vertical' | 'horizontal';

interface CheckboxGroupContextValue {
  name?: string;
  values?: string[];
  onChange?: (value: string, checked: boolean) => void;
  disabled?: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label displayed next to the checkbox */
  label?: React.ReactNode;
  /** Secondary subtitle / description below label */
  description?: React.ReactNode;
  /** Partial selection state for parent checkboxes */
  indeterminate?: boolean;
  /** Vertical alignment of checkbox relative to label ('start' or 'center') */
  align?: CheckboxAlign;
  /** Value identifying this checkbox when used in CheckboxGroup */
  value?: string;
}

/**
 * ThoughtStream Checkbox Component
 *
 * Implements 18px size, 0px border-radius, #D6D3D1 border,
 * #78716C checked state, dual-layer focus rings, and vertical/horizontal alignment.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      checked,
      indeterminate = false,
      disabled = false,
      align = 'start',
      value,
      className = '',
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const innerRef = useRef<HTMLInputElement>(null);
    const groupContext = useContext(CheckboxGroupContext);

    // If within a CheckboxGroup, determine checked and disabled states
    const isGroupControlled = groupContext && value !== undefined;
    const isChecked = isGroupControlled
      ? groupContext.values?.includes(value) ?? checked
      : checked;
    const isDisabled = disabled || groupContext?.disabled;

    // Synchronize indeterminate property on DOM node
    useEffect(() => {
      const target = (ref && 'current' in ref ? ref.current : innerRef.current) as HTMLInputElement | null;
      if (target) {
        target.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const wrapperClasses = [
      'ts-checkbox-wrapper',
      `ts-checkbox-wrapper--align-${align}`,
      isDisabled ? 'ts-checkbox-wrapper--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const boxClasses = [
      'ts-checkbox-box',
      isChecked ? 'ts-checkbox-box--checked' : '',
      indeterminate ? 'ts-checkbox-box--indeterminate' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (isGroupControlled && value !== undefined) {
        groupContext.onChange?.(value, e.target.checked);
      }
    };

    return (
      <label htmlFor={inputId} className={wrapperClasses}>
        <input
          ref={ref || innerRef}
          id={inputId}
          name={groupContext?.name || props.name}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          value={value}
          className="ts-checkbox-input ts-sr-only"
          {...props}
        />

        <span className={boxClasses} aria-hidden="true">
          {isChecked && !indeterminate && (
            <svg
              className="ts-checkbox-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {indeterminate && <span className="ts-checkbox-dash" />}
        </span>

        {label && (
          <span className="ts-checkbox-label">
            {label}
            {description && (
              <span className="ts-checkbox-description">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Group heading label */
  label?: string;
  /** Helper text or error message */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Layout orientation: vertical (default) or horizontal */
  orientation?: CheckboxOrientation;
  /** Name attribute shared across checkboxes */
  name?: string;
  /** Selected string values */
  value?: string[];
  /** Default selected values */
  defaultValue?: string[];
  /** Callback fired when selections change */
  onChange?: (values: string[]) => void;
  /** Disable all checkboxes in group */
  disabled?: boolean;
  /** Mark group as required */
  required?: boolean;
}

/**
 * ThoughtStream CheckboxGroup Component
 *
 * Lays out multiple checkboxes vertically or horizontally with shared name and state.
 */
export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  helperText,
  error,
  orientation = 'vertical',
  name,
  value,
  defaultValue = [],
  onChange,
  disabled = false,
  required = false,
  children,
  className = '',
  ...props
}) => {
  const [internalValues, setInternalValues] = React.useState<string[]>(defaultValue);
  const currentValues = value !== undefined ? value : internalValues;
  const isError = Boolean(error);
  const groupId = useId();

  const handleCheckboxChange = (optValue: string, checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...currentValues, optValue];
    } else {
      next = currentValues.filter((v) => v !== optValue);
    }

    if (value === undefined) {
      setInternalValues(next);
    }
    onChange?.(next);
  };

  return (
    <CheckboxGroupContext.Provider
      value={{
        name,
        values: currentValues,
        onChange: handleCheckboxChange,
        disabled,
      }}
    >
      <div
        role="group"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        className={`ts-checkbox-group ${className}`.trim()}
        {...props}
      >
        {label && (
          <span id={`${groupId}-label`} className="ts-checkbox-group-label">
            {label}
            {required && <span className="ts-checkbox-group-required" aria-hidden="true">*</span>}
          </span>
        )}

        <div className={`ts-checkbox-group-items ts-checkbox-group-items--${orientation}`}>
          {children}
        </div>

        {(error || helperText) && (
          <span
            className={`ts-checkbox-group-helper ${isError ? 'ts-checkbox-group-helper--error' : ''}`}
            role={isError ? 'alert' : undefined}
          >
            {error || helperText}
          </span>
        )}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';
