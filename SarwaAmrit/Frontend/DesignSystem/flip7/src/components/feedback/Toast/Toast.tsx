import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '../../../lib/icons';
import './Toast.css';

export type ToastVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info';
export interface ToastItem {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastCtx {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => string;
  dismiss: (id: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((toast: Omit<ToastItem, 'id'> & { id?: string }) => {
    const id = toast.id ?? `t-${Date.now()}`;
    setToasts((t) => [...t, { ...toast, id }]);
    return id;
  }, []);
  return (
    <Ctx.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastViewport />
    </Ctx.Provider>
  );
};

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export const Toast: React.FC<ToastItem & { onClose?: () => void }> = ({
  title,
  description,
  variant = 'neutral',
  onClose,
}) => (
  <div className={`f7-toast f7-toast--${variant}`} role="status">
    <div>
      {title && <div className="f7-toast-title">{title}</div>}
      {description && <div className="f7-toast-desc">{description}</div>}
    </div>
    {onClose && (
      <button type="button" className="f7-toast-close" aria-label="Dismiss" onClick={onClose}>
        <IconX />
      </button>
    )}
  </div>
);

const ToastViewport: React.FC = () => {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const node = (
    <div className="f7-toast-viewport">
      {ctx.toasts.map((t) => (
        <AutoToast key={t.id} item={t} onClose={() => ctx.dismiss(t.id)} />
      ))}
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(node, document.body) : node;
};

const AutoToast: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  useEffect(() => {
    const ms = item.duration ?? 3200;
    const id = window.setTimeout(onClose, ms);
    return () => window.clearTimeout(id);
  }, [item.duration, onClose]);
  return <Toast {...item} onClose={onClose} />;
};

Toast.displayName = 'Toast';
