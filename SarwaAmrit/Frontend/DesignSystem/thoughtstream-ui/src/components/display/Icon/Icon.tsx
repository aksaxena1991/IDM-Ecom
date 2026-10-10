import React from 'react';
import './Icon.css';

export type IconVariant = 'outlined' | 'rounded' | 'sharp';
export type IconSize = 'small' | 'medium' | 'large' | number;

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols ligature name, e.g. `home`, `settings`, `arrow_forward` */
  name: string;
  /** Visual style family */
  variant?: IconVariant;
  /** Preset size or explicit pixel size */
  size?: IconSize;
  /** Filled (1) vs outline (0) glyph */
  filled?: boolean;
  /** Variable font weight (100–700) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Optical size hint for the variable font */
  opticalSize?: 20 | 24 | 40 | 48;
  /** Accessible label; omit for decorative icons (aria-hidden) */
  label?: string;
}

const SIZE_PX: Record<Exclude<IconSize, number>, number> = {
  small: 16,
  medium: 24,
  large: 32,
};

/**
 * ThoughtStream Icon — Material Symbols (Material Design).
 *
 * Renders Google Material Symbols via ligature fonts. Use `name` with the
 * official symbol name (snake_case), e.g. `check_circle`, `chevron_right`.
 */
export const Icon: React.FC<IconProps> = ({
  name,
  variant = 'outlined',
  size = 'medium',
  filled = false,
  weight = 400,
  opticalSize = 24,
  label,
  className = '',
  style,
  ...props
}) => {
  const px = typeof size === 'number' ? size : SIZE_PX[size];
  const familyClass = {
    outlined: 'material-symbols-outlined',
    rounded: 'material-symbols-rounded',
    sharp: 'material-symbols-sharp',
  }[variant];

  return (
    <span
      className={`ts-icon ${familyClass} ${className}`.trim()}
      style={{
        fontSize: px,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${opticalSize}`,
        width: px,
        height: px,
        ...style,
      }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {name}
    </span>
  );
};

Icon.displayName = 'Icon';
