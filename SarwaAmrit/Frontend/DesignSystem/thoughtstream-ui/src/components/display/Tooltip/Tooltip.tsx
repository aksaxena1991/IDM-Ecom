import React, { useState, useRef, useId } from 'react';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip explanatory content */
  content: React.ReactNode;
  /** Positioning relative to trigger child */
  placement?: TooltipPlacement;
  /** Milliseconds delay before showing tooltip */
  delay?: number;
  /** The element triggering the tooltip */
  children: React.ReactElement;
  /** Additional styling class */
  className?: string;
}

/**
 * ThoughtStream Tooltip Component
 *
 * Implements #1C1917 warm black background, #FAFAF9 text,
 * 0px border-radius, 6px sharp geometric arrow, 300ms delay, and 0ms leave.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  delay = 300,
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // 0ms leave per design system spec
    setVisible(false);
  };

  const trigger = React.cloneElement(children, {
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      handleMouseEnter();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      handleMouseLeave();
    },
  });

  return (
    <div className="ts-tooltip-container">
      {trigger}
      <div
        id={tooltipId}
        role="tooltip"
        className={[
          'ts-tooltip-content',
          `ts-tooltip--${placement}`,
          visible ? 'ts-tooltip-content--visible' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {content}
        <span className="ts-tooltip-arrow" aria-hidden="true" />
      </div>
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
