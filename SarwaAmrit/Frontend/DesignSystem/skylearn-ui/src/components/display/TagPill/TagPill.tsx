import React from 'react';
import './TagPill.css';

export type TagPillVariant =
  | 'subject'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'bonus';

export interface TagPillProps {
  children: React.ReactNode;
  variant?: TagPillVariant;
}

export const TagPill: React.FC<TagPillProps> = ({ children, variant = 'subject' }) => {
  return <span className={['sl-tag', `sl-tag--${variant}`].join(' ')}>{children}</span>;
};
