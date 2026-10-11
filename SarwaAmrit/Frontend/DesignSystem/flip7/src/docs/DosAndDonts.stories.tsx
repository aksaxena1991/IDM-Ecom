import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/actions/Button';
import { ScoringCard } from '../components/display/ScoringCard';
import { SectionTitle } from '../components/display/SectionTitle';
import { Input } from '../components/actions/Input';

const meta: Meta = {
  title: "Foundations/Do's and Don'ts",
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj;

function Pair({
  doTitle,
  dontTitle,
  doNode,
  dontNode,
}: {
  doTitle: string;
  dontTitle: string;
  doNode: ReactNode;
  dontNode: ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
      <div>
        <SectionTitle emoji="✅">{doTitle}</SectionTitle>
        <div style={{ marginTop: 16 }}>{doNode}</div>
      </div>
      <div>
        <SectionTitle emoji="🚫">{dontTitle}</SectionTitle>
        <div style={{ marginTop: 16 }}>{dontNode}</div>
      </div>
    </div>
  );
}

export const Guidance: Story = {
  render: () => (
    <div style={{ maxWidth: 880 }}>
      <Pair
        doTitle="Colored glow on taps"
        dontTitle="Plain black shadows"
        doNode={<Button variant="primary">Deal cards</Button>}
        dontNode={
          <button
            type="button"
            style={{
              minHeight: 72,
              padding: '0 28px',
              borderRadius: 999,
              border: 'none',
              background: '#FFD23F',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              fontWeight: 800,
            }}
          >
            Deal cards
          </button>
        }
      />
      <Pair
        doTitle="Pill-shaped buttons"
        dontTitle="Sharp rectangles"
        doNode={<Button variant="flip7">Flip7</Button>}
        dontNode={
          <button
            type="button"
            style={{
              minHeight: 72,
              padding: '0 28px',
              borderRadius: 4,
              border: '3px solid #5DADE2',
              background: '#FFF8E7',
              fontWeight: 800,
              color: '#1a5f8a',
            }}
          >
            Flip7
          </button>
        }
      />
      <Pair
        doTitle="Cream input surfaces"
        dontTitle="Bare white fields"
        doNode={<Input label="Player name" placeholder="Maya" />}
        dontNode={
          <input
            placeholder="Maya"
            style={{ minHeight: 72, width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: '0 16px' }}
          />
        }
      />
      <Pair
        doTitle="Left-border card states"
        dontTitle="Color the whole card only"
        doNode={<ScoringCard title="Round 3" score={14} state="boom" meta="BOOM — bust this hand" />}
        dontNode={
          <div style={{ background: '#EF6C4A', color: '#fff', borderRadius: 8, padding: 24, fontWeight: 800 }}>
            Round 3 · 14
          </div>
        }
      />
      <Pair
        doTitle="Dashed section dividers"
        dontTitle="Heavy solid rules"
        doNode={<SectionTitle emoji="🎯">This round</SectionTitle>}
        dontNode={
          <h3 style={{ borderBottom: '4px solid #000', margin: 0, paddingBottom: 8 }}>This round</h3>
        }
      />
    </div>
  ),
};
