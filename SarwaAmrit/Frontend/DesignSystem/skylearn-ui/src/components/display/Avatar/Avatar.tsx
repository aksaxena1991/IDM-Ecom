import React from 'react';
import './Avatar.css';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md' }) => {
  return (
    <div className={['sl-avatar', `sl-avatar--${size}`].join(' ')} role="img" aria-label={name}>
      {src ? (
        <img className="sl-avatar__img" src={src} alt="" />
      ) : (
        <span className="sl-avatar__initials">{initials(name)}</span>
      )}
    </div>
  );
};
