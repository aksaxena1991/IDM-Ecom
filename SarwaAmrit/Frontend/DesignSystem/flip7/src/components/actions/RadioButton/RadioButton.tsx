import React, { forwardRef, useId, createContext, useContext, useState } from 'react';
import './RadioButton.css';

interface GroupCtx {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}
const RadioGroupContext = createContext<GroupCtx | undefined>(undefined);

export interface RadioButtonProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ label, description, checked, disabled, value, className = '', id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const group = useContext(RadioGroupContext);
    const grouped = group && value !== undefined;
    const isChecked = grouped ? group.value === value : checked;
    const isDisabled = disabled || group?.disabled;

    return (
      <label htmlFor={inputId} className={['f7-radio', isDisabled ? 'f7-radio--disabled' : '', className].filter(Boolean).join(' ')}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="f7-sr-only"
          checked={isChecked}
          disabled={isDisabled}
          value={value}
          name={group?.name || props.name}
          onChange={(e) => {
            onChange?.(e);
            if (grouped) group.onChange?.(String(value));
          }}
          {...props}
        />
        <span className={['f7-radio-dot', isChecked ? 'is-on' : ''].filter(Boolean).join(' ')} />
        {label && (
          <span className="f7-check-copy">
            {label}
            {description && <span className="f7-check-desc">{description}</span>}
          </span>
        )}
      </label>
    );
  }
);
RadioButton.displayName = 'RadioButton';

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  defaultValue = '',
  onChange,
  name,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <RadioGroupContext.Provider
      value={{
        name,
        value: current,
        disabled,
        onChange: (v) => {
          if (value === undefined) setInternal(v);
          onChange?.(v);
        },
      }}
    >
      <div role="radiogroup" className={['f7-radio-group', className].filter(Boolean).join(' ')} {...props}>
        {label && <div className="f7-field-label">{label}</div>}
        <div className="f7-check-group-items">{children}</div>
      </div>
    </RadioGroupContext.Provider>
  );
};
RadioGroup.displayName = 'RadioGroup';
