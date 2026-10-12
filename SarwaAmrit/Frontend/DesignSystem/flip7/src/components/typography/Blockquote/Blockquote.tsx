import React from 'react';
import './Blockquote.css';

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  cite?: string;
  attribution?: React.ReactNode;
}

export const Blockquote: React.FC<BlockquoteProps> = ({
  children,
  cite,
  attribution,
  className = '',
  ...props
}) => (
  <blockquote className={['f7-quote', className].filter(Boolean).join(' ')} cite={cite} {...props}>
    <div className="f7-quote-body">{children}</div>
    {attribution && <footer className="f7-quote-attr">{attribution}</footer>}
  </blockquote>
);

Blockquote.displayName = 'Blockquote';
