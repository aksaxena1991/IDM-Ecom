import React, { forwardRef, useId, createContext, useContext } from 'react';
import './RadioButton.css';

export type RadioAlign = 'start' | 'center';
export type RadioOrientation = 'vertical' | 'horizontal';

interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioButtonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text next to the radio */
  label?: React.ReactNode;
  /** Explanatory description beneath the label */
  description?: React.ReactNode;
  /** Vertical alignment of radio relative to label text ('start' or 'center') */
  align?: RadioAlign;
  /** Value identifying this radio when used within a RadioGroup */
  value?: string;
}

/**
 * ThoughtStream Radio Button Component
 *
 * Implements 18px diameter, 9999px full radius (permitted avatar/radio exception),
 * 8px inner dot, and subtle stone borders.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      label,
      description,
      checked,
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
    const groupContext = useContext(RadioGroupContext);

    const isGroupControlled = groupContext && value !== undefined;
    const isChecked = isGroupControlled
      ? groupContext.value === value
      : checked;
    const isDisabled = disabled || groupContext?.disabled;

    const wrapperClasses = [
      'ts-radio-wrapper',
      `ts-radio-wrapper--align-${align}`,
      isDisabled ? 'ts-radio-wrapper--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const circleClasses = [
      'ts-radio-circle',
      isChecked ? 'ts-radio-circle--selected' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (isGroupControlled && value !== undefined) {
        groupContext.onChange?.(value);
      }
    };

    return (
      <label htmlFor={inputId} className={wrapperClasses}>
        <input
          ref={ref}
          id={inputId}
          name={groupContext?.name || props.name}
          type="radio"
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          value={value}
          className="ts-radio-input ts-sr-only"
          {...props}
        />

        <span className={circleClasses} aria-hidden="true">
          {isChecked && <span className="ts-radio-dot" />}
        </span>

        {label && (
          <span className="ts-radio-label">
            {label}
            {description && (
              <span className="ts-radio-description">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  }
);

RadioButton.displayName = 'RadioButton';

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Group heading label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Layout orientation: vertical (default) or horizontal */
  orientation?: RadioOrientation;
  /** Group input name attribute */
  name?: string;
  /** Controlled selected string value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Callback fired when selection changes */
  onChange?: (value: string) => void;
  /** Disable all radio options in group */
  disabled?: boolean;
  /** Mark group as required */
  required?: boolean;
}

/**
 * ThoughtStream RadioGroup Component
 *
 * Coordinates multiple radio buttons with vertical or horizontal alignment,
 * single-selection management, and accessible fieldset semantics.
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  helperText,
  error,
  orientation = 'vertical',
  name,
  value,
  defaultValue = '',
  onChange,
  disabled = false,
  required = false,
  children,
  className = '',
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;
  const isError = Boolean(error);
  const groupId = useId();

  const handleRadioChange = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value: currentValue,
        onChange: handleRadioChange,
        disabled,
      }}
    >
      <div
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        className={`ts-radio-group ${className}`.trim()}
        {...props}
      >
        {label && (
          <span id={`${groupId}-label`} className="ts-radio-group-label">
            {label}
            {required && <span className="ts-radio-group-required" aria-hidden="true">*</span>}
          </span>
        )}

        <div className={`ts-radio-group-items ts-radio-group-items--${orientation}`}>
          {children}
        </div>

        {(error || helperText) && (
          <span
            className={`ts-radio-group-helper ${isError ? 'ts-radio-group-helper--error' : ''}`}
            role={isError ? 'alert' : undefined}
          >
            {error || helperText}
          </span>
        )}
      </div>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = 'RadioGroup';
