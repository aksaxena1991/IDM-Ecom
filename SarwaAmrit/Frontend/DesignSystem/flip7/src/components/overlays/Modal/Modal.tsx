import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '../../../lib/icons';
import '../overlays.css';

export type ModalSize = 'small' | 'medium' | 'large';
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'medium',
  title,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;
  const sizeClass = { small: 'f7-modal--sm', medium: 'f7-modal--md', large: 'f7-modal--lg' }[size];
  const node = (
    <div
      className="f7-overlay"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" className={`f7-modal ${sizeClass} ${className}`.trim()}>
        <div className="f7-modal-head">
          <h3 className="f7-modal-title">{title}</h3>
          <button type="button" className="f7-icon-btn" aria-label="Close" onClick={onClose}>
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(node, document.body) : node;
};

export const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`f7-modal-body ${className}`.trim()} {...p} />
);
export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...p }) => (
  <div className={`f7-modal-footer ${className}`.trim()} {...p} />
);
Modal.displayName = 'Modal';
