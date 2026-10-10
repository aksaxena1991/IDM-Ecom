import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel, PanelGroup } from './Panel';
import { Button } from '../../actions/Button';
import { Chip } from '../../display/Chip';
import { Typography } from '../../typography/Typography';

const meta: Meta<typeof PanelGroup> = {
  title: 'Components/Panel (Iterative)',
  component: PanelGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const SequentialProcess: StoryObj = {
  render: () => {
    const [openStep, setOpenStep] = useState<string[]>(['step-1']);

    return (
      <PanelGroup value={openStep} onValueChange={setOpenStep}>
        <Panel
          id="step-1"
          step="01"
          title="Manuscript Framing"
          subtitle="Define initial premise and typographic measure"
          trailing={<Chip variant="status" tone="success">Ready</Chip>}
        >
          <Typography variant="body" measure>
            Establish the core contemplative theme. Every manuscript in ThoughtStream is bounded to a
            strict 680px container to ensure natural eye return.
          </Typography>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={() => setOpenStep(['step-2'])}>
              Proceed to Typography
            </Button>
          </div>
        </Panel>

        <Panel
          id="step-2"
          step="02"
          title="Type Hierarchy Selection"
          subtitle="Pairing Libre Baskerville with Inter"
          trailing={<Chip variant="status" tone="info">Step 2</Chip>}
        >
          <Typography variant="body" measure>
            Headlines use Libre Baskerville 700 with tightened letter-spacing (-0.015em). Body copy
            resides in Inter 400 with a generous 1.8 line height.
          </Typography>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="small" onClick={() => setOpenStep(['step-1'])}>
              Previous
            </Button>
            <Button size="small" onClick={() => setOpenStep(['step-3'])}>
              Proceed to Review
            </Button>
          </div>
        </Panel>

        <Panel
          id="step-3"
          step="03"
          title="Publication & Distribution"
          subtitle="Finalize quiet newsletter distribution"
        >
          <Typography variant="body" measure>
            Configure dispatch cadence. Letters are delivered without tracking pixels, telemetry, or
            promotional banners.
          </Typography>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="small" onClick={() => setOpenStep(['step-2'])}>
              Back
            </Button>
            <Button size="small" variant="primary">
              Publish Edition
            </Button>
          </div>
        </Panel>
      </PanelGroup>
    );
  },
};

export const CollapsibleAccordion: StoryObj = {
  render: () => (
    <PanelGroup allowMultiple defaultValue={['panel-philosophy']}>
      <Panel
        id="panel-philosophy"
        title="Zero Rounded Corners"
        subtitle="Foundational geometric principle"
      >
        <Typography variant="bodySmall">
          ThoughtStream enforces 0px border radius across all interactive and container elements. Only
          avatars and radio buttons receive full 9999px rounding.
        </Typography>
      </Panel>

      <Panel
        id="panel-flat"
        title="Flat Plane Architecture"
        subtitle="No drop shadows or gradients"
      >
        <Typography variant="bodySmall">
          Physical depth is replaced by hairline borders and intentional contrast shifts. No blur filters,
          no box shadows.
        </Typography>
      </Panel>

      <Panel
        id="panel-grid"
        title="12px Base Rhythm"
        subtitle="Vertical cadence"
      >
        <Typography variant="bodySmall">
          All padding, margins, line heights, and section offsets are calibrated to multiples of 12px
          (12, 24, 36, 48, 60, 72, 96, 120).
        </Typography>
      </Panel>
    </PanelGroup>
  ),
};
