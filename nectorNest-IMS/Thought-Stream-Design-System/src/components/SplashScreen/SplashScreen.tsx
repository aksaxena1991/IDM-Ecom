import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import { ProgressBar } from '../ProgressBar';

export type SplashScreenMode = 'fullscreen' | 'embedded';

export interface SplashScreenProps {
  /** Controls visibility of the splash screen */
  open?: boolean;
  /** Fullscreen takeover overlay or embedded container card */
  mode?: SplashScreenMode;
  /** Custom logo emblem or node (defaults to ThoughtStream geometric zen mark) */
  logo?: React.ReactNode;
  /** Primary brand / application title in Libre Baskerville */
  title?: React.ReactNode;
  /** Secondary subtitle or description */
  subtitle?: React.ReactNode;
  /** Contemplative italicized quote or aphorism */
  quote?: React.ReactNode;
  /** Status text or sequential status stages (e.g. ['Calibrating...', 'Synchronizing...', 'Ready']) */
  status?: React.ReactNode | string[];
  /** Progress percentage (0-100) or undefined for indeterminate */
  progress?: number;
  /** Displays the hairline progress bar (default true) */
  showProgress?: boolean;
  /** Label for the interactive enter / continue button */
  actionText?: string;
  /** Callback invoked when the action button is clicked */
  onAction?: () => void;
  /** Shows a discrete skip button */
  allowSkip?: boolean;
  /** Callback invoked when skipped */
  onSkip?: () => void;
  /** Callback invoked when splash screen completely exits */
  onDismiss?: () => void;
  /** Automatically dismisses when complete */
  autoDismiss?: boolean;
  /** Milliseconds delay before auto-dismissing (default 3000ms) */
  autoDismissDelay?: number;
  /** Optional version tag in footer, e.g. "v2.0 Zenith" */
  version?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThoughtStream SplashScreen Component
 *
 * Contemplative, distraction-free application launch / boot screen
 * featuring geometric emblem, editorial typography, hairline progress, and zen aphorisms.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  open = true,
  mode = 'fullscreen',
  logo,
  title = 'ThoughtStream',
  subtitle,
  quote = '“In the quiet space between thoughts, clarity appears.”',
  status = 'Calibrating contemplation stream...',
  progress,
  showProgress = true,
  actionText,
  onAction,
  allowSkip = false,
  onSkip,
  onDismiss,
  autoDismiss = false,
  autoDismissDelay = 3000,
  version = 'Zenith 2.0',
  className = '',
  style,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  // Reset exiting state when open changes
  useEffect(() => {
    if (open) {
      setIsExiting(false);
    }
  }, [open]);

  // Status rotation if array is provided
  useEffect(() => {
    if (!Array.isArray(status) || status.length <= 1) return;

    const interval = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % status.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [status]);

  // Auto-dismiss handler
  useEffect(() => {
    if (!open || !autoDismiss) return;

    const timer = setTimeout(() => {
      handleExit();
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [open, autoDismiss, autoDismissDelay]);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.();
    }, 400); // Match CSS transition duration
  };

  if (!open && !isExiting) return null;

  const currentStatusText = Array.isArray(status) ? status[activeStageIdx] : status;

  return (
    <div
      role="dialog"
      aria-modal={mode === 'fullscreen'}
      aria-label="Application Splash Screen"
      className={[
        'ts-splash-screen',
        `ts-splash-screen--${mode}`,
        isExiting ? 'ts-splash-screen--exiting' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="ts-splash-screen-content">
        {/* Emblem */}
        <div className="ts-splash-screen-logo">
          {logo !== undefined ? (
            logo
          ) : (
            <div className="ts-splash-screen-emblem">
              <div className="ts-splash-screen-emblem-inner" />
            </div>
          )}
        </div>

        {/* Title & Tagline */}
        {title && <h1 className="ts-splash-screen-title">{title}</h1>}
        {subtitle && <p className="ts-splash-screen-subtitle">{subtitle}</p>}
        {quote && <blockquote className="ts-splash-screen-quote">{quote}</blockquote>}

        {/* Progress & Status */}
        {showProgress && (
          <div className="ts-splash-screen-loader">
            <div className="ts-splash-screen-progress-wrap">
              <ProgressBar
                value={progress}
                indeterminate={progress === undefined}
                size="xs"
                variant="primary"
              />
            </div>
            {currentStatusText && (
              <span className="ts-splash-screen-status">{currentStatusText}</span>
            )}
          </div>
        )}

        {/* Action Controls */}
        {(actionText || allowSkip) && (
          <div className="ts-splash-screen-actions">
            {actionText && (
              <button
                type="button"
                className="ts-splash-screen-btn"
                onClick={() => {
                  onAction?.();
                  handleExit();
                }}
              >
                {actionText}
              </button>
            )}

            {allowSkip && (
              <button
                type="button"
                className="ts-splash-screen-skip-btn"
                onClick={() => {
                  onSkip?.();
                  handleExit();
                }}
              >
                Skip intro
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Version Tag */}
      {version && <div className="ts-splash-screen-footer">{version}</div>}
    </div>
  );
};

SplashScreen.displayName = 'SplashScreen';
