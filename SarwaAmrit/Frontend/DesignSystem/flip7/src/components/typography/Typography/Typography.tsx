import React from 'react';
import './Typography.css';

export type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'sm' | 'xs';
export type TypographyColor = 'primary' | 'dark' | 'accent' | 'coral' | 'sky';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  color?: TypographyColor;
}

const defaultElement: Record<TypographyVariant, React.ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  sm: 'p',
  xs: 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  color,
  className = '',
  children,
  ...props
}) => {
  const Component = as || defaultElement[variant];
  return (
    <Component
      className={['f7-type', `f7-type-${variant}`, color ? `f7-type--${color}` : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
};

Typography.displayName = 'Typography';
