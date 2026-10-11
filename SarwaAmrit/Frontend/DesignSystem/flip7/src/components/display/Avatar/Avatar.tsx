import React from 'react';
import './Avatar.css';

export type AvatarTone = 'teal' | 'gold' | 'silver' | 'coral';
export type AvatarSize = 56 | 60 | 64;

export interface AvatarProps {
  label: string;
  tone?: AvatarTone;
  size?: AvatarSize;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  label,
  tone = 'teal',
  size = 56,
  className = '',
}) => {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <span
      className={['f7-avatar', `f7-avatar--${tone}`, className].filter(Boolean).join(' ')}
      style={{ width: `calc(${size} * var(--f7-rpx))`, height: `calc(${size} * var(--f7-rpx))` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

Avatar.displayName = 'Avatar';
