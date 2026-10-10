import React, { forwardRef, useState, useEffect } from 'react';
import './Stepper.css';
import { Check, AlertCircle } from 'lucide-react';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';
export type StepperVariant = 'default' | 'numbers' | 'roman' | 'dots';
export type StepperSize = 'sm' | 'md' | 'lg';

export interface StepItem {
  /** Unique key or identifier for the step */
  id?: string;
  /** Primary title of the step */
  title: string;
  /** Secondary subtitle or short note */
  subtitle?: string;
  /** Extended descriptive copy */
  description?: React.ReactNode;
  /** Explicit step status; if omitted, computed automatically from active step */
  status?: StepStatus;
  /** Custom icon to override the default numeral/check */
  icon?: React.ReactNode;
  /** Marks this step as optional */
  optional?: boolean;
  /** Body content rendered below or beside step in vertical mode */
  content?: React.ReactNode;
  /** Disables step interaction */
  disabled?: boolean;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Array of step definitions */
  steps: StepItem[];
  /** Controlled 0-indexed current active step */
  currentStep?: number;
  /** Uncontrolled initial active step (default: 0) */
  defaultStep?: number;
  /** Stepper layout orientation */
  orientation?: StepperOrientation;
  /** Indicator visual variant */
  variant?: StepperVariant;
  /** Size scale */
  size?: StepperSize;
  /** Whether clicking a step triggers navigation and callbacks (default: true) */
  clickable?: boolean;
  /** Callback fired when a step indicator or header is clicked */
  onStepClick?: (stepIndex: number, step: StepItem) => void;
  /** Callback fired when the active step changes */
  onChange?: (stepIndex: number, step: StepItem) => void;
  /** Whether to render step.content (particularly in vertical mode) */
  showContent?: boolean;
  /** In vertical mode, only expand content for the active current step */
  expandCurrentOnly?: boolean;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * ThoughtStream Stepper Component
 *
 * Minimalist, zen-inspired sequential workflow navigator.
 * Supports horizontal and vertical orientations with 0px geometry,
 * hairline connection tracks, and contemplative monospace numerals.
 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      currentStep,
      defaultStep = 0,
      orientation = 'horizontal',
      variant = 'default',
      size = 'md',
      clickable = true,
      onStepClick,
      onChange,
      showContent = true,
      expandCurrentOnly = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const [internalStep, setInternalStep] = useState<number>(() => {
      if (currentStep !== undefined) return currentStep;
      return defaultStep ?? 0;
    });

    useEffect(() => {
      if (currentStep !== undefined) {
        setInternalStep(currentStep);
      }
    }, [currentStep]);

    const activeStep = internalStep;

    const formatNumeral = (index: number): React.ReactNode => {
      if (variant === 'roman') {
        return ROMAN_NUMERALS[index] || (index + 1).toString();
      }
      if (variant === 'numbers') {
        const num = index + 1;
        return num < 10 ? `0${num}` : `${num}`;
      }
      return `${index + 1}`;
    };

    const computeStatus = (step: StepItem, index: number): StepStatus => {
      if (step.status) return step.status;
      if (index < activeStep) return 'completed';
      if (index === activeStep) return 'current';
      return 'upcoming';
    };

    const handleStepClick = (index: number, step: StepItem) => {
      if (step.disabled) return;
      if (clickable) {
        setInternalStep(index);
        onStepClick?.(index, step);
        onChange?.(index, step);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, step: StepItem) => {
      if (step.disabled) return;
      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStepClick(index, step);
      }
    };

    const classes = [
      'ts-stepper',
      `ts-stepper--${orientation}`,
      `ts-stepper--${variant}`,
      `ts-stepper--${size}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <nav ref={ref} className={classes} aria-label="Progress Stepper" {...props}>
        <ol className="ts-stepper__list">
          {steps.map((step, index) => {
            const status = computeStatus(step, index);
            const isClickable = clickable && !step.disabled;
            const isCurrent = status === 'current';
            const isCompleted = status === 'completed';
            const isError = status === 'error';
            const shouldRenderContent =
              showContent &&
              step.content &&
              orientation === 'vertical' &&
              (!expandCurrentOnly || isCurrent);

            return (
              <li
                key={step.id || index}
                className={[
                  'ts-stepper__item',
                  `ts-stepper__item--${status}`,
                  isClickable ? 'ts-stepper__item--clickable' : '',
                  step.disabled ? 'ts-stepper__item--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Horizontal / Vertical Preceding Connector line */}
                {index > 0 && <div className="ts-stepper__connector-before" aria-hidden="true" />}

                {/* Step Header */}
                <div
                  className="ts-stepper__header"
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={() => handleStepClick(index, step)}
                  onKeyDown={(e) => handleKeyDown(e, index, step)}
                >
                  {/* Step Indicator Box (0px Sharp Square) */}
                  <div
                    className={[
                      'ts-stepper__indicator',
                      `ts-stepper__indicator--${status}`,
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {variant === 'dots' ? (
                      <span className="ts-stepper__dot" />
                    ) : step.icon ? (
                      step.icon
                    ) : isError ? (
                      <AlertCircle className="ts-stepper__icon" size={14} />
                    ) : isCompleted && variant === 'default' ? (
                      <Check className="ts-stepper__icon" size={14} strokeWidth={2.5} />
                    ) : (
                      <span className="ts-stepper__numeral">{formatNumeral(index)}</span>
                    )}
                  </div>

                  {/* Step Text Metadata */}
                  <div className="ts-stepper__label-wrap">
                    <div className="ts-stepper__title-row">
                      <span className="ts-stepper__title">{step.title}</span>
                      {step.optional && (
                        <span className="ts-stepper__optional-tag">Optional</span>
                      )}
                    </div>
                    {step.subtitle && (
                      <span className="ts-stepper__subtitle">{step.subtitle}</span>
                    )}
                    {step.description && (
                      <div className="ts-stepper__description">{step.description}</div>
                    )}
                  </div>
                </div>

                {/* Horizontal Following Connector Line */}
                {index < steps.length - 1 && (
                  <div className="ts-stepper__connector-after" aria-hidden="true" />
                )}

                {/* Step Body Content (Vertical Stepper Accordion / Progress Flow) */}
                {shouldRenderContent && (
                  <div className="ts-stepper__content-pane">
                    <div className="ts-stepper__content-gutter" aria-hidden="true" />
                    <div className="ts-stepper__content-body">{step.content}</div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Stepper.displayName = 'Stepper';
