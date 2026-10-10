import React, { forwardRef } from 'react';
import './Card.css';

export type CardVariant = 'default' | 'elevated';
export type CardPadding = 'small' | 'medium' | 'large';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card surface style: default (#FAFAF9) or elevated (#F5F5F4) */
  variant?: CardVariant;
  /** Inner padding tier. Default is 36px ('large') per design system specs */
  padding?: CardPadding;
  /** Enables hover interaction indicator and pointer cursor */
  interactive?: boolean;
}

/**
 * ThoughtStream Card Component
 *
 * Emphasizes 0px sharp edges, flat surfaces, generous 36px default padding,
 * and delicate hairline borders instead of drop shadows.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'large',
      interactive = false,
      className = '',
      tabIndex,
      ...props
    },
    ref
  ) => {
    const paddingClass = {
      small: 'ts-card--padding-sm',
      medium: 'ts-card--padding-md',
      large: 'ts-card--padding-lg',
    }[padding];

    const variantClass = variant === 'elevated' ? 'ts-card--elevated' : 'ts-card--default';

    const classNames = [
      'ts-card',
      variantClass,
      paddingClass,
      interactive ? 'ts-card--interactive' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        tabIndex={interactive ? tabIndex ?? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-card-header ${className}`.trim()} {...props}>
    {children}
  </div>
);
CardHeader.displayName = 'CardHeader';

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`ts-card-title ${className}`.trim()} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = 'CardTitle';

export const CardSubtitle: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`ts-card-subtitle ${className}`.trim()} {...props}>
    {children}
  </p>
);
CardSubtitle.displayName = 'CardSubtitle';

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-card-body ${className}`.trim()} {...props}>
    {children}
  </div>
);
CardBody.displayName = 'CardBody';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-card-footer ${className}`.trim()} {...props}>
    {children}
  </div>
);
CardFooter.displayName = 'CardFooter';
