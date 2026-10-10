import React, { useState, useRef, useEffect, useId } from 'react';
import './Dropdown.css';

export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end';

export interface DropdownProps {
  /** The element triggering the menu */
  trigger: React.ReactElement;
  /** Dropdown menu placement */
  placement?: DropdownPlacement;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback fired on open state change */
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * ThoughtStream Dropdown Menu Component
 *
 * Implements sharp 0px geometry, flat surfaces, hairline dividers,
 * keyboard accessibility, and subtle stone hover states.
 */
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  placement = 'bottom-start',
  isOpen,
  onOpenChange,
  children,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const open = isOpen !== undefined ? isOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const clonedTrigger = React.cloneElement(trigger, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen(!open);
    },
  });

  return (
    <div ref={containerRef} className="ts-dropdown-container">
      {clonedTrigger}
      {open && (
        <div
          id={menuId}
          role="menu"
          tabIndex={-1}
          className={`ts-dropdown-menu ts-dropdown--${placement} ${className}`.trim()}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};
Dropdown.displayName = 'Dropdown';

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Right-aligned hotkey or metadata hint */
  shortcut?: string;
  /** Destructive styling (error red) */
  destructive?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  shortcut,
  destructive = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const classes = [
    'ts-dropdown-item',
    destructive ? 'ts-dropdown-item--destructive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="menuitem"
      className={classes}
      onClick={onClick}
      {...props}
    >
      <span className="ts-dropdown-item-left">
        {icon && <span className="ts-dropdown-item-icon">{icon}</span>}
        <span>{children}</span>
      </span>
      {shortcut && <span className="ts-dropdown-item-shortcut">{shortcut}</span>}
    </button>
  );
};
DropdownItem.displayName = 'DropdownItem';

export const DropdownSeparator: React.FC = () => (
  <hr className="ts-dropdown-separator" role="separator" />
);
DropdownSeparator.displayName = 'DropdownSeparator';

export const DropdownLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="ts-dropdown-label">{children}</div>;
DropdownLabel.displayName = 'DropdownLabel';
