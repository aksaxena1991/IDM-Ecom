import React, { useEffect, useId } from 'react';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, children, onClose, footer }) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sl-modal-root" role="presentation" onClick={() => onClose?.()}>
      <div
        className="sl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sl-modal__header">
          <h2 id={titleId} className="sl-modal__title">
            {title}
          </h2>
          {onClose ? (
            <button type="button" className="sl-modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          ) : null}
        </header>
        <div className="sl-modal__body">{children}</div>
        {footer ? <footer className="sl-modal__footer">{footer}</footer> : null}
      </div>
    </div>
  );
};
