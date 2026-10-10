import React from 'react';
import './Divider.css';

export type DividerTone = 'subtle' | 'medium' | 'strong';
export type DividerSpacing = 'small' | 'medium' | 'large' | 'section';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Hairline border weight/color */
  tone?: DividerTone;
  /** Vertical margin tier aligned to the 12px grid */
  spacing?: DividerSpacing;
}

/**
 * ThoughtStream Divider Component
 *
 * Implements rule #3: "use #E7E5E4 hairline borders to separate sections
 * instead of shadows or color blocks."
 */
export const Divider: React.FC<DividerProps> = ({
  tone = 'subtle',
  spacing = 'medium',
  className = '',
  ...props
}) => {
  const toneClass = `ts-divider--${tone}`;
  const spacingClass = {
    small: 'ts-divider--spacing-sm',
    medium: 'ts-divider--spacing-md',
    large: 'ts-divider--spacing-lg',
    section: 'ts-divider--spacing-section',
  }[spacing];

  return (
    <hr
      className={`ts-divider ${toneClass} ${spacingClass} ${className}`.trim()}
      {...props}
    />
  );
};

Divider.displayName = 'Divider';
