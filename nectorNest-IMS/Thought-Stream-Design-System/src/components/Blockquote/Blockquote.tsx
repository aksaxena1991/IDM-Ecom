import React from 'react';
import './Blockquote.css';

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  /** The quotation text */
  children: React.ReactNode;
  /** Attribution source or author */
  citation?: React.ReactNode;
}

/**
 * ThoughtStream Blockquote Component
 *
 * Implements literary editorial pull-quotes with Libre Baskerville italic,
 * 2px stone left border, and generous contemplative margins.
 */
export const Blockquote: React.FC<BlockquoteProps> = ({
  children,
  citation,
  className = '',
  ...props
}) => {
  return (
    <blockquote className={`ts-blockquote ${className}`.trim()} {...props}>
      <p className="ts-blockquote-content">{children}</p>
      {citation && <cite className="ts-blockquote-citation">— {citation}</cite>}
    </blockquote>
  );
};

Blockquote.displayName = 'Blockquote';
