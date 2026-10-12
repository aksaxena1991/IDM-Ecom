import React from 'react';
import { IconX } from '../../../lib/icons';
import './NotificationBar.css';

export type NotificationTone = 'teal' | 'gold' | 'coral' | 'sky';
export interface NotificationBarProps {
  children: React.ReactNode;
  tone?: NotificationTone;
  onClose?: () => void;
  className?: string;
}

export const NotificationBar: React.FC<NotificationBarProps> = ({
  children,
  tone = 'gold',
  onClose,
  className = '',
}) => (
  <div className={['f7-note', `f7-note--${tone}`, className].filter(Boolean).join(' ')} role="status">
    <div>{children}</div>
    {onClose && (
      <button type="button" className="f7-note-close" aria-label="Dismiss" onClick={onClose}>
        <IconX />
      </button>
    )}
  </div>
);
NotificationBar.displayName = 'NotificationBar';
