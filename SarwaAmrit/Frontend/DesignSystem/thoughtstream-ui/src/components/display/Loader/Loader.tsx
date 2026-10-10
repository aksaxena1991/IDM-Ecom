import React from 'react';
import './Loader.css';

export type LoaderVariant = 'spinner' | 'dots' | 'line' | 'pulse' | 'zen';
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderColor = 'primary' | 'secondary' | 'subtle' | 'white';

export interface LoaderProps {
  /** Visual animation variant */
  variant?: LoaderVariant;
  /** Size tier or custom pixel dimension */
  size?: LoaderSize | number;
  /** Tonal color theme */
  color?: LoaderColor;
  /** Optional loading message label */
  label?: React.ReactNode;
  /** Position of the label relative to the indicator */
  labelPosition?: 'right' | 'bottom';
  /** Centers the loader inside its parent container */
  centered?: boolean;
  /** Displays a full-screen semi-translucent backdrop */
  fullscreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  /** Optional click handler for interactivity and actions */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SIZE_MAP: Record<LoaderSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
  xl: 48,
};

/**
 * ThoughtStream Loader Component
 *
 * Minimalist contemplative loading indicators with pure SVG hairline spinners,
 * 0px square rhythm dots, scanning lines, and zen geometric monograms.
 */
export const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  label,
  labelPosition = 'right',
  centered = false,
  fullscreen = false,
  className = '',
  style,
  'aria-label': ariaLabel,
  onClick,
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 24;

  const colorClass = `ts-loader--color-${color}`;
  const isVertical = labelPosition === 'bottom';

  // Render specific animated indicator
  const renderIndicator = () => {
    switch (variant) {
      case 'dots': {
        const dotSize = Math.max(3, Math.round(pixelSize / 4));
        return (
          <span className="ts-loader-dots" style={{ height: pixelSize }}>
            <span
              className="ts-loader-dot"
              style={{ width: dotSize, height: dotSize }}
            />
            <span
              className="ts-loader-dot"
              style={{ width: dotSize, height: dotSize }}
            />
            <span
              className="ts-loader-dot"
              style={{ width: dotSize, height: dotSize }}
            />
          </span>
        );
      }

      case 'line': {
        const lineWidth = Math.max(48, pixelSize * 2.5);
        const lineHeight = Math.max(2, Math.round(pixelSize / 8));
        return (
          <div
            className="ts-loader-line"
            style={{ width: lineWidth, height: lineHeight }}
          >
            <div className="ts-loader-line-bar" />
          </div>
        );
      }

      case 'pulse': {
        return (
          <div
            className="ts-loader-pulse"
            style={{ width: pixelSize, height: pixelSize }}
          />
        );
      }

      case 'zen': {
        return (
          <div
            className="ts-loader-zen"
            style={{ width: pixelSize, height: pixelSize }}
          >
            <div className="ts-loader-zen-outer" />
            <div className="ts-loader-zen-inner" />
          </div>
        );
      }

      case 'spinner':
      default: {
        const strokeWidth = Math.max(1.5, pixelSize * 0.08);
        const r = (pixelSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * r;

        return (
          <svg
            className="ts-loader-spinner-svg"
            width={pixelSize}
            height={pixelSize}
            viewBox={`0 0 ${pixelSize} ${pixelSize}`}
          >
            {/* Background subtle ring */}
            <circle
              cx={pixelSize / 2}
              cy={pixelSize / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              opacity={0.15}
            />
            {/* Spinning arc with 0px butt cap */}
            <circle
              cx={pixelSize / 2}
              cy={pixelSize / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.72}
              strokeLinecap="butt"
            />
          </svg>
        );
      }
    }
  };

  const content = (
    <div
      role="status"
      aria-label={ariaLabel || (typeof label === 'string' ? label : 'Loading')}
      className={[
        'ts-loader',
        colorClass,
        isVertical ? 'ts-loader--vertical' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onClick={onClick}
    >
      {renderIndicator()}
      {label && <span className="ts-loader-label">{label}</span>}
    </div>
  );

  if (fullscreen) {
    return <div className="ts-loader--fullscreen">{content}</div>;
  }

  if (centered) {
    return <div className="ts-loader--centered">{content}</div>;
  }

  return content;
};

Loader.displayName = 'Loader';
