import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import './Drawer.css';
import { X } from 'lucide-react';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'small' | 'medium' | 'large';

export interface DrawerProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Callback fired on request to close drawer */
  onClose: () => void;
  /** Edge from which the drawer slides in ('left', 'right', 'top', 'bottom') */
  placement?: DrawerPlacement;
  /** Size tier */
  size?: DrawerSize;
  /** Optional title */
  title?: React.ReactNode;
  /** Optional subtitle */
  subtitle?: React.ReactNode;
  /** Dismiss when clicking the dark backdrop */
  closeOnBackdropClick?: boolean;
  /** Dismiss when pressing Escape */
  closeOnEsc?: boolean;
  /** Hide top-right close icon button */
  hideCloseButton?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream Drawer Component
 *
 * Implements four-direction sliding panels (left, right, top, bottom),
 * flat surfaces, sharp 0px corners, hairline borders, and calm dismiss transitions.
 */
export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  size = 'medium',
  title,
  subtitle,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  hideCloseButton = false,
  children,
  className = '',
  style,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Escape listener
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

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    small: 'ts-drawer--sm',
    medium: 'ts-drawer--md',
    large: 'ts-drawer--lg',
  }[size];

  const content = (
    <div
      className="ts-drawer-overlay"
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={style}
        className={`ts-drawer ts-drawer--${placement} ${sizeClass} ${className}`.trim()}
        tabIndex={-1}
      >
        {(title || !hideCloseButton) && (
          <div className="ts-drawer-header">
            <div className="ts-drawer-header-content">
              {title && (
                <h3 id={titleId} className="ts-drawer-title">
                  {title}
                </h3>
              )}
              {subtitle && <p className="ts-drawer-subtitle">{subtitle}</p>}
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                aria-label="Close drawer"
                className="ts-drawer-close"
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
Drawer.displayName = 'Drawer';

export const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-drawer-header ${className}`.trim()} {...props}>
    <div className="ts-drawer-header-content">{children}</div>
  </div>
);
DrawerHeader.displayName = 'DrawerHeader';

export const DrawerTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`ts-drawer-title ${className}`.trim()} {...props}>
    {children}
  </h3>
);
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerSubtitle: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`ts-drawer-subtitle ${className}`.trim()} {...props}>
    {children}
  </p>
);
DrawerSubtitle.displayName = 'DrawerSubtitle';

export const DrawerBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-drawer-body ${className}`.trim()} {...props}>
    {children}
  </div>
);
DrawerBody.displayName = 'DrawerBody';

export const DrawerFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`ts-drawer-footer ${className}`.trim()} {...props}>
    {children}
  </div>
);
DrawerFooter.displayName = 'DrawerFooter';
