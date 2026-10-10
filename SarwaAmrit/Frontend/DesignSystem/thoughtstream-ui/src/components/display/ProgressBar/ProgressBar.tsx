import React from 'react';
import './ProgressBar.css';

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant =
  | 'primary'
  | 'subtle'
  | 'zen'
  | 'success'
  | 'warning'
  | 'error';

export interface ProgressBarProps {
  /** Current progress value (min to max) */
  value?: number;
  /** Minimum value (default 0) */
  min?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Secondary buffer progress value for preload/streaming */
  buffer?: number;
  /** Indeterminate animated gliding mode */
  indeterminate?: boolean;
  /** Height tier */
  size?: ProgressBarSize;
  /** Color theme variant */
  variant?: ProgressBarVariant;
  /** Label rendered on top left */
  label?: React.ReactNode;
  /** Displays percentage or custom formatted value on top right */
  showValue?: boolean;
  /** Embeds the percentage text inside the bar (recommended for size="lg") */
  embeddedValue?: boolean;
  /** Custom formatter for the displayed value */
  valueFormatter?: (value: number, max: number) => string;
  /** Segmented step mode: total number of steps */
  steps?: number;
  /** Current step (1-indexed) when steps is defined */
  currentStep?: number;
  /** Optional click handler on the progress container */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Optional click handler on individual steps in segmented mode */
  onStepClick?: (stepNumber: number) => void;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

/**
 * ThoughtStream ProgressBar Component
 *
 * Minimalist linear progress indicator with sharp 0px geometry,
 * determinate / indeterminate gliding states, step segmentation, and buffer fills.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  min = 0,
  max = 100,
  buffer,
  indeterminate = false,
  size = 'sm',
  variant = 'primary',
  label,
  showValue = false,
  embeddedValue = false,
  valueFormatter,
  steps,
  currentStep,
  onClick,
  onStepClick,
  className = '',
  style,
  'aria-label': ariaLabel,
}) => {
  const boundedVal = Math.max(min, Math.min(max, value));
  const percentage = Math.round(((boundedVal - min) / (max - min || 1)) * 100);

  const bufferPercentage =
    buffer !== undefined
      ? Math.max(0, Math.min(100, ((Math.max(min, Math.min(max, buffer)) - min) / (max - min || 1)) * 100))
      : undefined;

  const formattedVal = valueFormatter
    ? valueFormatter(boundedVal, max)
    : `${percentage}%`;

  const sizeClass = `ts-progress-track--${size}`;
  const variantClass = `ts-progress-fill--${variant}`;

  // Stepped mode
  if (steps && steps > 1) {
    const activeStep = currentStep ?? 1;

    return (
      <div
        className={`ts-progress-container ${className}`.trim()}
        style={style}
        onClick={onClick}
        role="progressbar"
        aria-valuenow={activeStep}
        aria-valuemin={1}
        aria-valuemax={steps}
        aria-label={ariaLabel || (typeof label === 'string' ? label : 'Step Progress')}
      >
        {(label || showValue) && (
          <div className="ts-progress-header">
            {label && <span className="ts-progress-label">{label}</span>}
            {showValue && (
              <span className="ts-progress-value-label">
                Step {activeStep} of {steps}
              </span>
            )}
          </div>
        )}

        <div className={`ts-progress-stepped ${sizeClass}`}>
          {Array.from({ length: steps }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < activeStep;
            const isActive = stepNum === activeStep;

            return (
              <div
                key={`step-${i}`}
                onClick={(e) => {
                  if (onStepClick) {
                    e.stopPropagation();
                    onStepClick(stepNum);
                  }
                }}
                style={onStepClick ? { cursor: 'pointer' } : undefined}
                className={[
                  'ts-progress-step',
                  sizeClass,
                  isCompleted ? 'ts-progress-step--completed' : '',
                  isActive ? 'ts-progress-step--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ts-progress-container ${className}`.trim()}
      style={style}
      onClick={onClick}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : boundedVal}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel || (typeof label === 'string' ? label : 'Progress')}
    >
      {(label || showValue) && (
        <div className="ts-progress-header">
          {label && <span className="ts-progress-label">{label}</span>}
          {showValue && !indeterminate && (
            <span className="ts-progress-value-label">{formattedVal}</span>
          )}
        </div>
      )}

      <div
        className={`ts-progress-track ${sizeClass} ${
          indeterminate ? 'ts-progress-track--indeterminate' : ''
        }`}
      >
        {/* Buffer Fill */}
        {bufferPercentage !== undefined && !indeterminate && (
          <div
            className="ts-progress-buffer"
            style={{ width: `${bufferPercentage}%` }}
          />
        )}

        {/* Primary Progress Fill */}
        <div
          className={`ts-progress-fill ${variantClass}`}
          style={{ width: indeterminate ? undefined : `${percentage}%` }}
        >
          {embeddedValue && size === 'lg' && percentage > 12 && !indeterminate && (
            <span className="ts-progress-embedded-text">{formattedVal}</span>
          )}
        </div>
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
