import React, { forwardRef, useEffect, useId, useRef, createContext, useContext, useState } from 'react';
import { IconCheck } from '../../../lib/icons';
import './Checkbox.css';

interface GroupCtx {
  name?: string;
  values?: string[];
  onChange?: (value: string, checked: boolean) => void;
  disabled?: boolean;
}
const CheckboxGroupContext = createContext<GroupCtx | undefined>(undefined);

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, indeterminate = false, disabled, value, className = '', id, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const inner = useRef<HTMLInputElement>(null);
    const group = useContext(CheckboxGroupContext);
    const grouped = group && value !== undefined;
    const isChecked = grouped ? group.values?.includes(String(value)) ?? checked : checked;
    const isDisabled = disabled || group?.disabled;

    useEffect(() => {
      const node = (ref && typeof ref !== 'function' ? ref.current : inner.current);
      if (node) node.indeterminate = indeterminate;
    }, [indeterminate, ref]);

    return (
      <label htmlFor={inputId} className={['f7-check', isDisabled ? 'f7-check--disabled' : '', className].filter(Boolean).join(' ')}>
        <input
          ref={ref || inner}
          id={inputId}
          type="checkbox"
          className="f7-sr-only"
          checked={isChecked}
          disabled={isDisabled}
          value={value}
          name={group?.name || props.name}
          onChange={(e) => {
            onChange?.(e);
            if (grouped) group.onChange?.(String(value), e.target.checked);
          }}
          {...props}
        />
        <span className={['f7-check-box', isChecked ? 'is-on' : '', indeterminate ? 'is-partial' : ''].filter(Boolean).join(' ')}>
          {isChecked && !indeterminate && <IconCheck size={16} />}
          {indeterminate && <span className="f7-check-dash" />}
        </span>
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
Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  name?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  value,
  defaultValue = [],
  onChange,
  disabled,
  name,
  children,
  className = '',
  ...props
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  return (
    <CheckboxGroupContext.Provider
      value={{
        name,
        values: current,
        disabled,
        onChange: (v, checked) => {
          const next = checked ? [...current, v] : current.filter((x) => x !== v);
          if (value === undefined) setInternal(next);
          onChange?.(next);
        },
      }}
    >
      <div role="group" className={['f7-check-group', className].filter(Boolean).join(' ')} {...props}>
        {label && <div className="f7-field-label">{label}</div>}
        <div className="f7-check-group-items">{children}</div>
      </div>
    </CheckboxGroupContext.Provider>
  );
};
CheckboxGroup.displayName = 'CheckboxGroup';
