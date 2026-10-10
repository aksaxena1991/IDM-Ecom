import React from 'react';
import './Typography.css';

export type TypographyVariant =
  | 'display'
  | 'headline'
  | 'subhead'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'code';

export type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'brand';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Typographic hierarchy tier */
  variant?: TypographyVariant;
  /** HTML element to render */
  as?: React.ElementType;
  /** Color token override */
  color?: TypographyColor;
  /** Constrain width to 680px for optimal reading measure */
  measure?: boolean;
}

const defaultElementMap: Record<TypographyVariant, React.ElementType> = {
  display: 'h1',
  headline: 'h2',
  subhead: 'h3',
  bodyLarge: 'p',
  body: 'p',
  bodySmall: 'p',
  caption: 'span',
  overline: 'span',
  code: 'code',
};

const variantClassMap: Record<TypographyVariant, string> = {
  display: 'ts-typography--display',
  headline: 'ts-typography--headline',
  subhead: 'ts-typography--subhead',
  bodyLarge: 'ts-typography--body-large',
  body: 'ts-typography--body',
  bodySmall: 'ts-typography--body-small',
  caption: 'ts-typography--caption',
  overline: 'ts-typography--overline',
  code: 'ts-typography--code',
};

/**
 * ThoughtStream Typography Component
 *
 * Implements the 9-level type scale adhering to Libre Baskerville for headlines,
 * Inter for reading body copy and UI, and Source Code Pro for mono snippets.
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  color,
  measure = false,
  children,
  className = '',
  ...props
}) => {
  const Component = as || defaultElementMap[variant];

  const classes = [
    'ts-typography',
    variantClassMap[variant],
    color ? `ts-typography--color-${color}` : '',
    measure ? 'ts-reading-measure' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

Typography.displayName = 'Typography';
