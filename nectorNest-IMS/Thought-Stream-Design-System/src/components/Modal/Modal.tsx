import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';
import { X } from 'lucide-react';

export type ModalSize = 'small' | 'medium' | 'large';

export interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Callback fired when modal requests closing */
  onClose: () => void;
  /** Modal size tier */
  size?: ModalSize;
  /** Close modal when clicking the backdrop overlay */
  closeOnBackdropClick?: boolean;
  /** Close modal when pressing the Escape key */
  closeOnEsc?: boolean;
  /** Optional title for accessibility */
  title?: React.ReactNode;
  /** Optional subtitle or metadata */
  subtitle?: React.ReactNode;
  /** Hide standard top-right close icon */
  hideCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * ThoughtStream Modal Component
 *
 * Implements sharp 0px geometry, flat surfaces, hairline borders,
 * escape listener, backdrop dismiss, and accessible dialog semantics.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'medium',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  title,
  subtitle,
  hideCloseButton = false,
  children,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    small: 'ts-modal--sm',
    medium: 'ts-modal--md',
    large: 'ts-modal--lg',
  }[size];

  const content = (
    <div
      className="ts-modal-overlay"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={`ts-modal ${sizeClass} ${className}`.trim()}
        tabIndex={-1}
      >
        {(title || !hideCloseButton) && (
          <div className="ts-modal-header">
            <div className="ts-modal-header-content">
              {title && (
                <h3 id={titleId} className="ts-modal-title">
                  {title}
                </h3>
              )}
              {subtitle && <p className="ts-modal-subtitle">{subtitle}</p>}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                aria-label="Close dialog"
                className="ts-modal-close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
};
Modal.displayName = 'Modal';

export const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-modal-header ${className}`.trim()} {...props}>
    <div className="ts-modal-header-content">{children}</div>
  </div>
);
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`ts-modal-title ${className}`.trim()} {...props}>
    {children}
  </h3>
);
ModalTitle.displayName = 'ModalTitle';

export const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-modal-body ${className}`.trim()} {...props}>
    {children}
  </div>
);
ModalBody.displayName = 'ModalBody';

export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-modal-footer ${className}`.trim()} {...props}>
    {children}
  </div>
);
ModalFooter.displayName = 'ModalFooter';
