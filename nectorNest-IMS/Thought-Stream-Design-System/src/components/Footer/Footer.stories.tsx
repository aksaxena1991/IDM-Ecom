import type { Meta, StoryObj } from '@storybook/react';
import { Footer, type FooterColumnItem } from './Footer';
import { Button } from '../Button';
import { Input } from '../Input';
import { Mail } from 'lucide-react';

const meta: Meta<typeof Footer> = {
  title: 'Navigation/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    quote: {
      control: 'text',
      description: 'Contemplative quote or manifesto excerpt',
    },
    copyright: {
      control: 'text',
      description: 'Bottom copyright line',
    },
    showBackToTop: {
      control: 'boolean',
      description: 'Show Return to Top button',
    },
    onBackToTop: { action: 'backToTopClicked' },
    onLinkClick: { action: 'linkClicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

const sampleColumns: FooterColumnItem[] = [
  {
    title: 'Codex & Essays',
    links: [
      { label: 'The Flat Plane Manifesto', href: '#flat-plane' },
      { label: '0px Architectural Rules', href: '#zero-px', badge: 'CORE' },
      { label: 'Measuring 65ch Line Length', href: '#measure' },
      { label: 'Quiet Contemplation', href: '#quietude' },
    ],
  },
  {
    title: 'Foundations',
    links: [
      { label: 'Color Tokens', href: '#colors' },
      { label: 'Libre Baskerville Type', href: '#typography' },
      { label: 'Monospace Numerals', href: '#numerals' },
      { label: 'Hairline Dividers', href: '#dividers' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Storybook Explorer', href: 'http://localhost:6006', external: true },
      { label: 'NPM Distribution', href: 'https://npmjs.com', external: true },
      { label: 'Source Repository', href: '#github', external: true },
      { label: 'Release Ledger', href: '#releases', badge: 'v0.1' },
    ],
  },
];

/**
 * Standard Multi-Column Zen Footer
 */
export const Default: Story = {
  args: {
    quote: 'In quiet thought, clarity emerges.',
    copyright: `© ${new Date().getFullYear()} ThoughtStream. 0px Distraction-Free Design System.`,
    columns: sampleColumns,
    status: {
      label: 'All contemplative nodes operational',
      state: 'operational',
    },
    showBackToTop: true,
    newsletterSlot: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--ts-font-heading)', fontSize: '0.875rem' }}>
          Contemplative Letters
        </h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--ts-color-text-secondary)', lineHeight: 1.5 }}>
          Receive occasional reflections on software tranquility and minimalist typography.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <Input placeholder="architect@thought.stream" leadingIcon={<Mail size={14} />} />
          <Button variant="primary" size="small">Subscribe</Button>
        </div>
      </div>
    ),
  },
};

/**
 * Minimalist Single Column Footer
 */
export const Minimal: Story = {
  args: {
    quote: 'Simplicity is the ultimate sophistication.',
    copyright: `© ${new Date().getFullYear()} ThoughtStream.`,
    columns: [],
    showBackToTop: true,
    status: {
      label: 'Core systems calm',
      state: 'operational',
    },
  },
};
