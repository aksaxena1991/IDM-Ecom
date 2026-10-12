import React, { forwardRef } from 'react';
import './List.css';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  primaryText: React.ReactNode;
  secondaryText?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  interactive?: boolean;
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ children, className = '', ...props }, ref) => (
    <ul ref={ref} className={['f7-list', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </ul>
  )
);
List.displayName = 'List';

export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ primaryText, secondaryText, leading, trailing, interactive, className = '', ...props }, ref) => (
    <li
      ref={ref}
      className={['f7-list-item', interactive ? 'f7-list-item--interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {leading && <span className="f7-list-leading">{leading}</span>}
      <div className="f7-list-copy">
        <div className="f7-list-primary">{primaryText}</div>
        {secondaryText && <div className="f7-list-secondary">{secondaryText}</div>}
      </div>
      {trailing && <span className="f7-list-trailing">{trailing}</span>}
    </li>
  )
);
ListItem.displayName = 'ListItem';
