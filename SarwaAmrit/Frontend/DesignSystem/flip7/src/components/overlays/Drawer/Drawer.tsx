import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '../../../lib/icons';
import '../overlays.css';

export type DrawerPlacement = 'left' | 'right' | 'bottom';
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  title,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const node = (
    <div className="f7-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`f7-drawer f7-drawer--${placement} ${className}`.trim()} role="dialog" aria-modal="true">
        <div className="f7-drawer-head">
          <h3 className="f7-drawer-title">{title}</h3>
          <button type="button" className="f7-icon-btn" aria-label="Close" onClick={onClose}><IconX /></button>
        </div>
        <div className="f7-drawer-body">{children}</div>
      </aside>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(node, document.body) : node;
};
Drawer.displayName = 'Drawer';
