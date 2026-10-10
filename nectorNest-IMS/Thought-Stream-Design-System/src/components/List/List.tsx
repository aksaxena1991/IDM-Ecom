import React, { forwardRef } from 'react';
import './List.css';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Main primary line of text */
  primaryText: React.ReactNode;
  /** Secondary supporting metadata line */
  secondaryText?: React.ReactNode;
  /** 20px leading icon or avatar */
  leading?: React.ReactNode;
  /** Trailing metadata, button, or disclosure icon */
  trailing?: React.ReactNode;
  /** Enables hover feedback */
  interactive?: boolean;
}

/**
 * ThoughtStream List Component
 *
 * Implements 16px vertical padding, subtle hairline borders,
 * stone leading icons, and calm hover states.
 */
export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <ul ref={ref} className={`ts-list ${className}`.trim()} {...props}>
        {children}
      </ul>
    );
  }
);
List.displayName = 'List';

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      primaryText,
      secondaryText,
      leading,
      trailing,
      interactive = false,
      className = '',
      tabIndex,
      onClick,
      ...props
    },
    ref
  ) => {
    const classes = [
      'ts-list-item',
      interactive || onClick ? 'ts-list-item--interactive' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <li
        ref={ref}
        className={classes}
        tabIndex={interactive || onClick ? tabIndex ?? 0 : undefined}
        onClick={onClick}
        {...props}
      >
        <div className="ts-list-item-main">
          {leading && <div className="ts-list-item-leading">{leading}</div>}
          <div className="ts-list-item-text-group">
            <span className="ts-list-item-primary">{primaryText}</span>
            {secondaryText && (
              <span className="ts-list-item-secondary">{secondaryText}</span>
            )}
          </div>
        </div>

        {trailing && <div className="ts-list-item-trailing">{trailing}</div>}
      </li>
    );
  }
);
ListItem.displayName = 'ListItem';
