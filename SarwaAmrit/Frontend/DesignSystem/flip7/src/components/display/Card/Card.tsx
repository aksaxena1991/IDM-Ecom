import React, { forwardRef } from 'react';
import './Card.css';

export type CardAccent = 'teal' | 'gold' | 'coral' | 'sky';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ accent = 'teal', interactive, padding = 'md', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={['f7-card', `f7-card--${accent}`, `f7-card--pad-${padding}`, interactive ? 'f7-card--interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`f7-card-header ${className}`.trim()} {...p} />
);
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...p }) => (
  <h3 className={`f7-card-title ${className}`.trim()} {...p} />
);
export const CardSubtitle: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...p }) => (
  <p className={`f7-card-subtitle ${className}`.trim()} {...p} />
);
export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`f7-card-body ${className}`.trim()} {...p} />
);
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`f7-card-footer ${className}`.trim()} {...p} />
);
