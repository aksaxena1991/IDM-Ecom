import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BigFriendlyButton } from '../components/actions/BigFriendlyButton/BigFriendlyButton.js';
import { LessonCard } from '../components/display/LessonCard/LessonCard.js';
import { StreakCounter } from '../components/display/StreakCounter/StreakCounter.js';
import { TagPill } from '../components/display/TagPill/TagPill.js';
import { ParentViewSwitcher } from '../components/learning/ParentViewSwitcher/ParentViewSwitcher.js';
import { HelpBubble } from '../components/overlays/HelpBubble/HelpBubble.js';
import { ConfettiCelebration } from '../components/motion/ConfettiCelebration/ConfettiCelebration.js';
import { Typography } from '../components/typography/Typography/Typography.js';

const meta: Meta = {
  title: 'SkyLearn/Templates/Lesson Dashboard',
};

export default meta;

export const Dashboard: StoryObj = {
  render: function DashboardStory() {
    const [celebrate, setCelebrate] = useState(false);

    return (
      <>
        <ConfettiCelebration active={celebrate} />
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <Typography variant="h1">Today&apos;s path</Typography>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <StreakCounter count={12} />
            <ParentViewSwitcher />
          </div>
        </header>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <TagPill variant="subject">Math</TagPill>
          <TagPill variant="easy">Easy</TagPill>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <LessonCard
            title="Multiply with groups"
            description="Connect equal groups to facts."
            progress={80}
            active
            icon="✖️"
          />
          <LessonCard
            title="Spelling patterns"
            description="Because, though, and friends."
            progress={40}
            icon="🔤"
          />
          <LessonCard title="Solar system" description="Complete math first." locked />
        </div>
        <HelpBubble message="What do you notice about how 6 groups of 4 matches the equation?" />
        <div style={{ marginTop: 32 }}>
          <BigFriendlyButton onClick={() => setCelebrate(true)}>Finish lesson (demo confetti)</BigFriendlyButton>
        </div>
      </>
    );
  },
};
