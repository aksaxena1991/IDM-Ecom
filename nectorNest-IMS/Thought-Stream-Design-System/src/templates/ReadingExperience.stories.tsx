import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '../components/Card';
import { Chip } from '../components/Chip';
import { List, ListItem } from '../components/List';
import { Checkbox } from '../components/Checkbox';
import { RadioButton } from '../components/RadioButton';
import { Typography } from '../components/Typography';
import { Avatar } from '../components/Avatar';
import { Divider } from '../components/Divider';
import { Blockquote } from '../components/Blockquote';
import { Tooltip } from '../components/Tooltip';
import {
  Mail,
  ArrowRight,
  BookOpen,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle,
} from 'lucide-react';
import { useState, type ChangeEvent } from 'react';

const meta: Meta = {
  title: 'Templates/Reading Experience',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const FullBlogPostTemplate: StoryObj = {
  render: () => {
    const [saved, setSaved] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [cadence, setCadence] = useState('weekly');

    return (
      <div style={{ backgroundColor: 'var(--ts-color-bg)', color: 'var(--ts-color-text-primary)', minHeight: '100vh', padding: '48px 24px' }}>
        {/* Editorial Container restricted to 680px per Rule #8 */}
        <article style={{ maxWidth: '680px', margin: '0 auto' }}>
          {/* Header Navigation */}
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '24px',
              borderBottom: '1px solid var(--ts-border-subtle)',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar fallback="TS" size="small" />
              <Typography variant="overline" color="brand" style={{ margin: 0 }}>
                ThoughtStream Journal
              </Typography>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Chip
                variant="filter"
                selected={saved}
                icon={saved ? <CheckCircle size={13} /> : <Bookmark size={13} />}
                onClick={() => setSaved(!saved)}
              >
                {saved ? 'Saved' : 'Bookmark'}
              </Chip>
              <Tooltip content="Share this contemplative piece">
                <Button variant="ghost" size="small">
                  <Share2 size={15} />
                </Button>
              </Tooltip>
            </div>
          </header>

          {/* Article Category & Title */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Chip variant="status" tone="info">
                Monograph #42
              </Chip>
              <Chip variant="status" tone="success">
                Reading Time: 7 Min
              </Chip>
            </div>
            <Typography variant="display">The Architecture of Silence</Typography>
            <Typography variant="bodyLarge" color="secondary">
              How the deliberate reduction of interface ornamentation restores depth to modern
              thought and returns the written word to its quiet weight.
            </Typography>
          </div>

          {/* Author Byline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 0',
              borderTop: '1px solid var(--ts-border-subtle)',
              borderBottom: '1px solid var(--ts-border-subtle)',
              marginBottom: '48px',
            }}
          >
            <Avatar
              size="medium"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Clara Dupont"
            />
            <div>
              <Typography variant="caption" style={{ fontWeight: 600, color: 'var(--ts-color-text-primary)', margin: 0 }}>
                Clara Dupont
              </Typography>
              <Typography variant="caption" color="secondary" style={{ margin: 0 }}>
                Published October 10, 2026 • Curated in Geneva
              </Typography>
            </div>
          </div>

          {/* Essay Body Content */}
          <section>
            <Typography variant="body" measure>
              In an era dominated by hyperactive feeds and saturated color systems, interfaces
              have increasingly resembled bustling marketplaces rather than quiet reading rooms.
              When every pixel clamors for sensory priority, reflective thinking dissolves into
              reflexive skimming.
            </Typography>

            <Typography variant="body" measure>
              ThoughtStream began as a quiet countermeasure. We asked: what if an interface
              receded entirely? What if the background was not a sterile digital white, but a warm,
              calm tone reminiscent of archival paper? What if margins were treated not as empty
              wastes, but as contemplative breathing rooms?
            </Typography>

            <Blockquote citation="Marcus Aurelius, Meditations, IV">
              Nowhere can man find a quieter or more untroubled retreat than in his own soul,
              especially if he has within himself things by dwelling upon which he finds
              immediate ease.
            </Blockquote>

            <Typography variant="headline">The Discipline of the Hairline</Typography>
            <Typography variant="body" measure>
              Notice how this page contains no drop shadows, no gradient overlays, and no decorative
              illustrations. Separation is achieved through subtle hairline borders of exact stone
              hues (#E7E5E4) and generous 12px-aligned vertical rhythms.
            </Typography>

            <Typography variant="code" as="pre">
              {`// ThoughtStream Geometric Restraint
const borderRules = {
  radius: '0px', // Sharp, definitive edge
  shadow: 'none', // Absolutely flat plane
  gridUnit: '12px', // Rhythm aligned to the word
};`}
            </Typography>

            <Typography variant="body" measure>
              By eliminating unnecessary rounded corners, the interface aligns with the historic
              rigor of print typography. Every letter, word, and block stands upon a clear foundation.
            </Typography>
          </section>

          <Divider tone="subtle" spacing="large" />

          {/* Related Explorations */}
          <section style={{ margin: '36px 0' }}>
            <Typography variant="subhead">Related Inquiries</Typography>
            <List>
              <ListItem
                leading={<BookOpen size={18} />}
                primaryText="Typography as Architecture: From Baskerville to Screen"
                secondaryText="Published Sep 2026 • 12 min"
                trailing={<Button variant="ghost" size="small"><ArrowRight size={14} /></Button>}
                interactive
              />
              <ListItem
                leading={<Calendar size={18} />}
                primaryText="The 680px Measure: Why Eye Fatigue Dictates Line Length"
                secondaryText="Published Aug 2026 • 6 min"
                trailing={<Button variant="ghost" size="small"><ArrowRight size={14} /></Button>}
                interactive
              />
            </List>
          </section>

          {/* Newsletter Subscription Card */}
          <section style={{ marginTop: '48px' }}>
            <Card variant="elevated" padding="large">
              <CardHeader>
                <Typography variant="overline" color="brand">
                  Distraction-Free Newsletter
                </Typography>
                <CardTitle>Subscribe to Sunday Morning Letters</CardTitle>
              </CardHeader>
              <CardBody>
                <Typography variant="body" style={{ marginBottom: '24px' }}>
                  A solitary, deeply researched letter on craftsmanship, design, and philosophy.
                  Strictly one edition per week. No promotional sequences.
                </Typography>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <RadioButton
                    name="cadence"
                    label="Weekly Full Dispatch (2,000 words)"
                    checked={cadence === 'weekly'}
                    onChange={() => setCadence('weekly')}
                  />
                  <RadioButton
                    name="cadence"
                    label="Monthly Digest & Monograph"
                    checked={cadence === 'monthly'}
                    onChange={() => setCadence('monthly')}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Input
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    leadingIcon={<Mail size={16} />}
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (email) setSubmitted(true);
                    }}
                  >
                    {submitted ? 'Subscribed' : 'Join Letter'}
                  </Button>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <Checkbox
                    label="I understand letters are sent without tracking pixels or data collection."
                    defaultChecked
                  />
                </div>
              </CardBody>
              <CardFooter>
                <span style={{ fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
                  ThoughtStream Press © 2026 • Pure typography
                </span>
                <Chip variant="status" tone="success">
                  Zero Spam Guarantee
                </Chip>
              </CardFooter>
            </Card>
          </section>
        </article>
      </div>
    );
  },
};
