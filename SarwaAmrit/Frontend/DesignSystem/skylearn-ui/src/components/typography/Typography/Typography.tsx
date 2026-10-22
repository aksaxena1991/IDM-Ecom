import React from 'react';
import type { TypographyScaleKey } from '../../../tokens/typography.js';
import './Typography.css';

export type TypographyVariant = TypographyScaleKey | 'bodyLarge' | 'score';

const variantTag: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  hero: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  bodyLarge: 'p',
  body: 'p',
  small: 'p',
  caption: 'span',
  score: 'p',
};

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: keyof JSX.IntrinsicElements;
  reading?: boolean;
  mono?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  as,
  reading = false,
  mono = false,
  className = '',
  children,
  ...props
}) => {
  const Tag = (as ?? variantTag[variant]) as keyof JSX.IntrinsicElements;
  const classNames = [
    'sl-typography',
    `sl-typography--${variant}`,
    reading ? 'sl-typography--reading' : '',
    mono ? 'sl-typography--mono' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(Tag, { className: classNames, ...props }, children);
};
