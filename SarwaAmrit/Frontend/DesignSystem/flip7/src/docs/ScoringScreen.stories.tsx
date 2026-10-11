import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Logo } from '../components/brand/Logo';
import { Button } from '../components/actions/Button';
import { CounterButton } from '../components/actions/CounterButton';
import { ScoringCard } from '../components/display/ScoringCard';
import { VictoryRanking } from '../components/display/VictoryRanking';
import { SectionTitle } from '../components/display/SectionTitle';
import { Badge } from '../components/display/Badge';
import { Confetti } from '../components/motion/Confetti';
import { Crown } from '../components/motion/Crown';

const meta: Meta = {
  title: 'Templates/Scoring Mini-Program',
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj;

const phone: CSSProperties = {
  position: 'relative',
  width: 390,
  minHeight: 760,
  padding: 24,
  background: 'linear-gradient(180deg, #2BA8A2 0%, #1E8C86 28%, #EFF8F7 28%)',
  borderRadius: 32,
  boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
  overflow: 'hidden',
};

export const Setup: Story = {
  render: () => (
    <div style={phone}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <Logo banner="SCORE TRACKER" />
      </div>
      <SectionTitle emoji="🎴" tone="inverse">
        Players
      </SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0 24px' }}>
        <ScoringCard title="Maya" meta="Ready" score={<Badge tone="gold">1st</Badge>} />
        <ScoringCard title="Riley" meta="Ready" />
        <ScoringCard title="Kai" meta="Ready" />
      </div>
      <Button variant="primary" fullWidth>
        Start round
      </Button>
    </div>
  ),
};

export const Scoring: Story = {
  render: function Play() {
    const [maya, setMaya] = useState(12);
    const [boom, setBoom] = useState(false);
    const [flip7, setFlip7] = useState(false);

    return (
      <div style={phone}>
        <SectionTitle emoji="🎯" tone="inverse">
          This round
        </SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
          <ScoringCard
            state="highlighted"
            title="Maya"
            score={maya}
            meta="First player"
            actions={
              <>
                <CounterButton variant="minus" onClick={() => setMaya((n) => Math.max(0, n - 1))} />
                <CounterButton variant="plus" onClick={() => setMaya((n) => n + 1)} />
              </>
            }
          />
          <ScoringCard title="Riley" score={9} meta="3 cards" />
          <ScoringCard
            state={boom ? 'boom' : 'default'}
            title="Kai"
            score={boom ? 0 : 15}
            meta={boom ? 'Bust' : 'In play'}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Button variant="boom" active={boom} fullWidth onClick={() => setBoom((v) => !v)}>
            BOOM
          </Button>
          <Button variant="flip7" active={flip7} fullWidth onClick={() => setFlip7((v) => !v)}>
            Flip7
          </Button>
        </div>
        <Button variant="primary" fullWidth>
          Lock scores
        </Button>
      </div>
    );
  },
};

export const Victory: Story = {
  render: () => (
    <div style={phone}>
      <Confetti />
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
        <Crown />
      </div>
      <SectionTitle emoji="🏆" tone="inverse">
        Final standings
      </SectionTitle>
      <div className="f7-anim-glow" style={{ margin: '16px 0' }}>
        <VictoryRanking
          players={[
            { name: 'Maya', score: 47, place: 1 },
            { name: 'Riley', score: 38, place: 2 },
            { name: 'Kai', score: 29, place: 3 },
            { name: 'Jordan', score: 18, place: 4 },
          ]}
        />
      </div>
      <Button variant="primary" fullWidth>
        Play again
      </Button>
    </div>
  ),
};
