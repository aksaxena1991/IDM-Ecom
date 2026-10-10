import React, { useState } from 'react';
import './Avatar.css';

export type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Accessible alt description or author name */
  alt?: string;
  /** Fallback initials if image fails or is omitted */
  fallback?: string;
  /** Size tier */
  size?: AvatarSize;
}

/**
 * ThoughtStream Avatar Component
 *
 * Implements 9999px full circular rounding (strictly permitted by the design system
 * for avatars and radio buttons only).
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'medium',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClass = {
    small: 'ts-avatar--sm',
    medium: 'ts-avatar--md',
    large: 'ts-avatar--lg',
  }[size];

  const initials = fallback || (alt ? alt.substring(0, 2).toUpperCase() : '?');

  return (
    <div
      className={`ts-avatar ${sizeClass} ${className}`.trim()}
      role="img"
      aria-label={alt || 'User avatar'}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="ts-avatar-img"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';
