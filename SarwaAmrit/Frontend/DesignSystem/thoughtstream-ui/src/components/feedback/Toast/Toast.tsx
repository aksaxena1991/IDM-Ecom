import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Bell,
} from 'lucide-react';

export type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type ToastPlacement =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  action?: ToastAction;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const getDefaultIcon = (variant: ToastVariant) => {
  switch (variant) {
    case 'success':
      return <CheckCircle2 size={18} />;
    case 'warning':
      return <AlertTriangle size={18} />;
    case 'error':
      return <AlertCircle size={18} />;
    case 'info':
      return <Info size={18} />;
    case 'neutral':
    default:
      return <Bell size={18} />;
  }
};

/**
 * ThoughtStream Toast Component (Toasty)
 *
 * Renders an individual toast message with sharp 0px geometry,
 * hairline borders, and status accents.
 */
export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  variant = 'neutral',
  action,
  icon,
  onClose,
  className = '',
  style,
}) => {
  const displayIcon = icon !== undefined ? icon : getDefaultIcon(variant);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`ts-toast ts-toast--${variant} ${className}`.trim()}
      style={style}
    >
      {displayIcon && <span className="ts-toast-icon-wrap">{displayIcon}</span>}

      <div className="ts-toast-content">
        {title && <h5 className="ts-toast-title">{title}</h5>}
        {description && <div className="ts-toast-description">{description}</div>}
        {action && (
          <button
            type="button"
            className="ts-toast-action-btn"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className="ts-toast-close-btn"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';

// Context definition
interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toast: {
    (options: Omit<ToastItem, 'id'>): string;
    success: (
      title: string,
      description?: string,
      options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
    ) => string;
    error: (
      title: string,
      description?: string,
      options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
    ) => string;
    warning: (
      title: string,
      description?: string,
      options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
    ) => string;
    info: (
      title: string,
      description?: string,
      options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
    ) => string;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export interface ToastProviderProps {
  children: React.ReactNode;
  placement?: ToastPlacement;
  defaultDuration?: number;
}

/**
 * ThoughtStream ToastProvider
 *
 * Provides a context and portal host for queuing and displaying toasts.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  placement = 'bottom-right',
  defaultDuration = 4000,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idPrefix = useId();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => {
      const target = prev.find((t) => t.id === id);
      target?.onClose?.();
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, 'id'> & { id?: string }) => {
      const id = item.id || `${idPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duration = item.duration !== undefined ? item.duration : defaultDuration;

      const newToast: ToastItem = {
        ...item,
        id,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [defaultDuration, idPrefix, removeToast]
  );

  const toastHelper = Object.assign(
    (options: Omit<ToastItem, 'id'>) => addToast(options),
    {
      success: (
        title: string,
        description?: string,
        options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
      ) => addToast({ title, description, variant: 'success', ...options }),
      error: (
        title: string,
        description?: string,
        options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
      ) => addToast({ title, description, variant: 'error', ...options }),
      warning: (
        title: string,
        description?: string,
        options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
      ) => addToast({ title, description, variant: 'warning', ...options }),
      info: (
        title: string,
        description?: string,
        options?: Partial<Omit<ToastItem, 'id' | 'title' | 'description' | 'variant'>>
      ) => addToast({ title, description, variant: 'info', ...options }),
      dismiss: (id: string) => removeToast(id),
    }
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
        toast: toastHelper,
      }}
    >
      {children}
      {mounted &&
        createPortal(
          <div
            className={`ts-toast-container ts-toast-container--${placement}`}
            aria-live="polite"
          >
            {toasts.map((item) => (
              <Toast
                key={item.id}
                title={item.title}
                description={item.description}
                variant={item.variant}
                action={item.action}
                icon={item.icon}
                onClose={() => removeToast(item.id)}
              />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

ToastProvider.displayName = 'ToastProvider';

/**
 * Hook to access and trigger toasts anywhere within a ToastProvider
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
};
