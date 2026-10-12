import React from 'react';
import '../nav.css';

export interface FooterProps {
  brand?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ brand = 'FLIP7', children, className = '' }) => (
  <footer className={['f7-footer', className].filter(Boolean).join(' ')}>
    <strong>{brand}</strong>
    <div>{children ?? 'Score tracker'}</div>
  </footer>
);
Footer.displayName = 'Footer';
