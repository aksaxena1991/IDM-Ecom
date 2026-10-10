import React, { useState, useRef, useEffect, useId } from 'react';
import './Popover.css';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom'
  | 'top-start'
  | 'top-end'
  | 'top';

export interface PopoverProps {
  /** The element triggering the popover */
  trigger: React.ReactElement;
  /** Popover body content */
  content: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  /** Anchor placement */
  placement?: PopoverPlacement;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback on open state change */
  onOpenChange?: (open: boolean) => void;
  /** Width or style override */
  style?: React.CSSProperties;
  className?: string;
}

/**
 * ThoughtStream Popover Component
 *
 * Implements anchored floating surfaces with 0px geometry,
 * hairline borders, flat appearance, and dismiss-on-outside-click.
 */
export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = 'bottom-start',
  isOpen,
  onOpenChange,
  style,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  const open = isOpen !== undefined ? isOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (isOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  // Click outside listener
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
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? popoverId : undefined,
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen(!open);
    },
  });

  return (
    <div ref={containerRef} className="ts-popover-container">
      {clonedTrigger}
      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-modal="false"
          style={style}
          className={`ts-popover-content ts-popover--${placement} ${className}`.trim()}
          tabIndex={-1}
        >
          {typeof content === 'function'
            ? content({ close: () => setOpen(false) })
            : content}
        </div>
      )}
    </div>
  );
};

Popover.displayName = 'Popover';
