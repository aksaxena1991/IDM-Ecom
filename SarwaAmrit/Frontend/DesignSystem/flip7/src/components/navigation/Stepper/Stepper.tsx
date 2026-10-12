import React from 'react';
import '../nav.css';

export interface StepItem {
  id: string;
  label: React.ReactNode;
}

export interface StepperProps {
  steps: StepItem[];
  activeIndex?: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, activeIndex = 0, className = '' }) => (
  <ol className={['f7-stepper', className].filter(Boolean).join(' ')}>
    {steps.map((step, index) => (
      <li key={step.id} className={['f7-step', index <= activeIndex ? 'is-on' : ''].filter(Boolean).join(' ')}>
        <span className="f7-step-index">{index + 1}</span>
        {step.label}
      </li>
    ))}
  </ol>
);
Stepper.displayName = 'Stepper';
