import React, { useState, useEffect } from 'react';
import './NotificationBar.css';
import {
  Info,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

export type NotificationBarVariant =
  | 'neutral'
  | 'info'
  | 'announcement'
  | 'warning'
  | 'error'
  | 'success';

export type NotificationBarPosition =
  | 'static'
  | 'sticky'
  | 'fixed-top'
  | 'fixed-bottom';

export type NotificationBarLayout = 'full-width' | 'contained' | 'floating';

export interface NotificationBarAction {
  label: string;
  onClick?: () => void;
  href?: string;
  target?: string;
}

export interface NotificationBarProps {
  /** Controlled visibility state */
  open?: boolean;
  /** Visual variant reflecting status or importance */
  variant?: NotificationBarVariant;
  /** Positioning mode */
  position?: NotificationBarPosition;
  /** Width containment styling */
  layout?: NotificationBarLayout;
  /** Primary headline or title text */
  title?: React.ReactNode;
  /** Explanatory description */
  description?: React.ReactNode;
  /** Optional badge indicator, e.g. "NEW", "OFFLINE" */
  badge?: React.ReactNode;
  /** Custom icon or `false` to suppress */
  icon?: React.ReactNode | false;
  /** Primary action button or link */
  action?: NotificationBarAction;
  /** Enables the sharp 0px close dismiss button */
  dismissible?: boolean;
  /** Callback invoked when dismissed */
  onDismiss?: () => void;
  /** Callback invoked when the action button or link is clicked */
  onActionClick?: (action?: NotificationBarAction) => void;
  /** Optional auto-hide timer duration in milliseconds */
  autoHideDuration?: number;
  /** Custom body children */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream NotificationBar Component
 *
 * Minimalist, full-width or contained announcement and status bar
 * with 0px sharp geometry, hairline borders, and calm editorial tones.
 */
export const NotificationBar: React.FC<NotificationBarProps> = ({
  open,
  variant = 'neutral',
  position = 'static',
  layout = 'full-width',
  title,
  description,
  badge,
  icon,
  action,
  dismissible = false,
  onDismiss,
  onActionClick,
  autoHideDuration,
  children,
  className = '',
  style,
}) => {
  const [internalVisible, setInternalVisible] = useState(true);

  useEffect(() => {
    if (open !== undefined) {
      setInternalVisible(open);
    }
  }, [open]);

  const isVisible = open !== undefined ? open : internalVisible;

  useEffect(() => {
    if (!autoHideDuration || autoHideDuration <= 0 || !isVisible) return;
    const timer = setTimeout(() => {
      if (open === undefined) {
        setInternalVisible(false);
      }
      onDismiss?.();
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, [autoHideDuration, onDismiss, isVisible, open]);

  const handleDismiss = () => {
    if (open === undefined) {
      setInternalVisible(false);
    }
    onDismiss?.();
  };

  const handleActionClick = () => {
    action?.onClick?.();
    onActionClick?.(action);
  };

  if (!isVisible) return null;

  // Resolve default icon if not explicitly set or disabled
  const renderIcon = () => {
    if (icon === false) return null;
    if (icon) return <span className="ts-notification-bar-icon">{icon}</span>;

    const iconProps = { size: 16, strokeWidth: 1.75 };
    switch (variant) {
      case 'announcement':
        return <Bell className="ts-notification-bar-icon" {...iconProps} />;
      case 'warning':
        return <AlertTriangle className="ts-notification-bar-icon" {...iconProps} />;
      case 'error':
        return <AlertCircle className="ts-notification-bar-icon" {...iconProps} />;
      case 'success':
        return <CheckCircle2 className="ts-notification-bar-icon" {...iconProps} />;
      case 'info':
      case 'neutral':
      default:
        return <Info className="ts-notification-bar-icon" {...iconProps} />;
    }
  };

  const positionClass = `ts-notification-bar--${position}`;
  const variantClass = `ts-notification-bar--${variant}`;
  const layoutClass = `ts-notification-bar--${layout}`;

  return (
    <div
      role="region"
      aria-label="Notification bar"
      className={`ts-notification-bar ${positionClass} ${variantClass} ${layoutClass} ${className}`.trim()}
      style={style}
    >
      <div className="ts-notification-bar-inner">
        {renderIcon()}

        {badge && (
          <span className="ts-notification-bar-badge">{badge}</span>
        )}

        <div className="ts-notification-bar-message">
          {title && <span className="ts-notification-bar-title">{title}</span>}
          {description && (
            <span className="ts-notification-bar-description">{description}</span>
          )}
          {children}
        </div>
      </div>

      {(action || dismissible) && (
        <div className="ts-notification-bar-aside">
          {action && (
            action.href ? (
              <a
                href={action.href}
                target={action.target}
                rel={action.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="ts-notification-bar-action"
                onClick={handleActionClick}
              >
                {action.label}
              </a>
            ) : (
              <button
                type="button"
                className="ts-notification-bar-action"
                onClick={handleActionClick}
              >
                {action.label}
              </button>
            )
          )}

          {dismissible && (
            <button
              type="button"
              className="ts-notification-bar-dismiss"
              aria-label="Dismiss notification"
              onClick={handleDismiss}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

NotificationBar.displayName = 'NotificationBar';
