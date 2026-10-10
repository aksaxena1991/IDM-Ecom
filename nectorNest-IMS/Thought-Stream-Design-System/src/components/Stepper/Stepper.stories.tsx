import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, type StepItem } from './Stepper';
import { Button } from '../Button';
import { Sparkles, ShieldCheck, PenTool, Database } from 'lucide-react';

const meta: Meta<typeof Stepper> = {
  title: 'Navigation/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction of the stepper track',
    },
    variant: {
      control: 'select',
      options: ['default', 'numbers', 'roman', 'dots'],
      description: 'Visual indicator styling format',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size scale of indicators and text',
    },
    currentStep: {
      control: { type: 'range', min: 0, max: 4, step: 1 },
      description: '0-indexed current active step',
    },
    clickable: {
      control: 'boolean',
      description: 'Allow clicking on step headers',
    },
    showContent: {
      control: 'boolean',
      description: 'Render step content pane in vertical orientation',
    },
    expandCurrentOnly: {
      control: 'boolean',
      description: 'Only render content pane for the active step in vertical mode',
    },
    onStepClick: { action: 'stepClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const sampleSteps: StepItem[] = [
  {
    title: 'Essence',
    subtitle: 'Define core concept',
    description: 'Articulate the foundational premise of the architectural thought.',
    content: (
      <div>
        <p style={{ margin: '0 0 12px 0' }}>
          Formulate the pure distilled thought without distractions. Keep it brief and focused.
        </p>
      </div>
    ),
  },
  {
    title: 'Structure',
    subtitle: 'Determine taxonomy',
    description: 'Map boundaries, relations, and entity archetypes into a clean graph.',
    content: (
      <div>
        <p style={{ margin: '0 0 12px 0' }}>
          Assign 0px geometric boundaries and establish hairline dividers between domains.
        </p>
      </div>
    ),
  },
  {
    title: 'Contemplation',
    subtitle: 'Verify quietude',
    description: 'Assess sensory weight and remove unnecessary decorative elements.',
    optional: true,
    content: (
      <div>
        <p style={{ margin: '0 0 12px 0' }}>
          Evaluate whether any ornamentation or drop shadow remains. Strip down to pure stone planes.
        </p>
      </div>
    ),
  },
  {
    title: 'Publication',
    subtitle: 'Release to realm',
    description: 'Commit immutable version tag and distribute to active nodes.',
    content: (
      <div>
        <p style={{ margin: '0 0 12px 0' }}>
          Publish the unified design artifacts to the registry repository.
        </p>
      </div>
    ),
  },
];

/**
 * Default Horizontal Stepper
 */
export const Horizontal: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 1,
    orientation: 'horizontal',
    variant: 'default',
    size: 'md',
    clickable: true,
  },
  render: (args) => {
    const [step, setStep] = useState(args.currentStep ?? 1);

    useEffect(() => {
      if (args.currentStep !== undefined) {
        setStep(args.currentStep);
      }
    }, [args.currentStep]);

    return (
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Stepper
          {...args}
          currentStep={step}
          onStepClick={(i, s) => {
            setStep(i);
            args.onStepClick?.(i, s);
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--ts-border-subtle)', paddingTop: 16 }}>
          <Button
            variant="secondary"
            size="small"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Previous Phase
          </Button>
          <span style={{ fontFamily: 'var(--ts-font-mono)', fontSize: 13, color: 'var(--ts-color-text-tertiary)', alignSelf: 'center' }}>
            Phase {step + 1} of {sampleSteps.length}
          </span>
          <Button
            variant="primary"
            size="small"
            disabled={step === sampleSteps.length - 1}
            onClick={() => setStep((s) => Math.min(sampleSteps.length - 1, s + 1))}
          >
            Advance Phase
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Vertical Stepper with Content & Actions
 */
export const Vertical: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 1,
    orientation: 'vertical',
    variant: 'numbers',
    size: 'md',
    clickable: true,
    showContent: true,
    expandCurrentOnly: true,
  },
  render: (args) => {
    const [step, setStep] = useState(args.currentStep ?? 1);

    useEffect(() => {
      if (args.currentStep !== undefined) {
        setStep(args.currentStep);
      }
    }, [args.currentStep]);

    const verticalStepsWithControls = sampleSteps.map((s, idx) => ({
      ...s,
      content: (
        <div>
          {s.content}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {idx > 0 && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setStep(idx - 1)}
              >
                Back
              </Button>
            )}
            {idx < sampleSteps.length - 1 ? (
              <Button
                variant="primary"
                size="small"
                onClick={() => setStep(idx + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button variant="primary" size="small">
                Finish Flow
              </Button>
            )}
          </div>
        </div>
      ),
    }));

    return (
      <div style={{ maxWidth: 580, margin: '0 auto' }}>
        <Stepper
          {...args}
          steps={verticalStepsWithControls}
          currentStep={step}
          onStepClick={(i, s) => {
            setStep(i);
            args.onStepClick?.(i, s);
          }}
        />
      </div>
    );
  },
};

/**
 * Contemplative Roman Numerals
 */
export const RomanNumerals: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 2,
    orientation: 'horizontal',
    variant: 'roman',
    size: 'lg',
    clickable: true,
  },
};

/**
 * Minimalist Dots Track
 */
export const DotsVariant: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 2,
    orientation: 'horizontal',
    variant: 'dots',
    size: 'md',
    clickable: true,
  },
};

/**
 * Custom Icons Stepper
 */
export const WithIcons: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'default',
    size: 'md',
    currentStep: 1,
    steps: [
      {
        title: 'Draft',
        subtitle: 'Initial ideation',
        icon: <PenTool size={14} />,
      },
      {
        title: 'Synthesis',
        subtitle: 'Model training',
        icon: <Sparkles size={14} />,
      },
      {
        title: 'Registry',
        subtitle: 'Store in index',
        icon: <Database size={14} />,
      },
      {
        title: 'Verification',
        subtitle: 'Integrity check',
        icon: <ShieldCheck size={14} />,
      },
    ],
  },
};
