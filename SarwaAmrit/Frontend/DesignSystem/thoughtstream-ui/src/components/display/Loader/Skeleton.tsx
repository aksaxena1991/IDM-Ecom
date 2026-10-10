import React from 'react';
import './Loader.css';

export type SkeletonVariant = 'text' | 'rectangular' | 'avatar' | 'card';

export interface SkeletonProps {
  /** Skeleton shape variant */
  variant?: SkeletonVariant;
  /** Width in px or CSS string */
  width?: string | number;
  /** Height in px or CSS string */
  height?: string | number;
  /** Number of skeleton units to render */
  count?: number;
  /** Enables the gentle shimmering gradient animation (default true) */
  shimmer?: boolean;
  /** Applies circular radius (avatar exception only) */
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Optional click handler for interactivity and actions */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * ThoughtStream Skeleton Component
 *
 * Minimalist placeholder loader with strict 0px edges,
 * tonal surface shading, and subtle linear shimmering.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  shimmer = true,
  circle = false,
  className = '',
  style,
  onClick,
}) => {
  const shimmerClass = shimmer ? 'ts-skeleton--shimmer' : '';

  if (variant === 'card') {
    return (
      <div
        className={`ts-skeleton-card ${className}`.trim()}
        style={style}
        onClick={onClick}
      >
        <div className="ts-skeleton-card-header">
          <div
            className={`ts-skeleton ${shimmerClass} ${
              circle ? 'ts-skeleton--avatar' : 'ts-skeleton--avatar-square'
            }`}
            style={{ width: 40, height: 40, flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div
              className={`ts-skeleton ts-skeleton--text ${shimmerClass}`}
              style={{ width: '60%', height: 14, marginBottom: 6 }}
            />
            <div
              className={`ts-skeleton ts-skeleton--text ${shimmerClass}`}
              style={{ width: '40%', height: 10, marginBottom: 0 }}
            />
          </div>
        </div>
        <div
          className={`ts-skeleton ${shimmerClass}`}
          style={{ width: '100%', height: 80 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className={`ts-skeleton ts-skeleton--text ${shimmerClass}`} style={{ width: '100%' }} />
          <div className={`ts-skeleton ts-skeleton--text ${shimmerClass}`} style={{ width: '85%' }} />
          <div className={`ts-skeleton ts-skeleton--text ${shimmerClass}`} style={{ width: '65%' }} />
        </div>
      </div>
    );
  }

  const elements = Array.from({ length: count }, (_, i) => {
    // For multi-line text, give the last item a natural varied width if width wasn't explicit
    const isLast = i === count - 1;
    const computedWidth =
      width !== undefined
        ? width
        : variant === 'text' && count > 1 && isLast
        ? '70%'
        : variant === 'avatar'
        ? 36
        : '100%';

    const computedHeight =
      height !== undefined
        ? height
        : variant === 'text'
        ? 14
        : variant === 'avatar'
        ? 36
        : 100;

    const variantClass =
      variant === 'avatar'
        ? circle
          ? 'ts-skeleton--avatar'
          : 'ts-skeleton--avatar-square'
        : `ts-skeleton--${variant}`;

    return (
      <div
        key={`skel-${i}`}
        className={`ts-skeleton ${variantClass} ${shimmerClass} ${className}`.trim()}
        style={{
          width: computedWidth,
          height: computedHeight,
          ...style,
        }}
        onClick={onClick}
        aria-hidden="true"
      />
    );
  });

  return count === 1 ? (
    elements[0]
  ) : (
    <div
      className={`ts-skeleton-group ${className}`.trim()}
      style={style}
      onClick={onClick}
    >
      {elements}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
