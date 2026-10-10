import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Foundations/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const CompleteTypeScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '720px' }}>
      <div>
        <Typography variant="overline">Display (40px / Libre Baskerville / 700)</Typography>
        <Typography variant="display">The Architecture of Silence</Typography>
      </div>

      <div>
        <Typography variant="overline">Headline (30px / Libre Baskerville / 700)</Typography>
        <Typography variant="headline">Reflections on Space and Restraint</Typography>
      </div>

      <div>
        <Typography variant="overline">Subhead (22px / Libre Baskerville / 400)</Typography>
        <Typography variant="subhead">On the Purposeful Reduction of Noise</Typography>
      </div>

      <div>
        <Typography variant="overline">Body Large (20px / Inter / 400 / 1.75 line height)</Typography>
        <Typography variant="bodyLarge">
          A page in a quiet room has weight. When interfaces remove decoration and let words
          reside in natural stillness, comprehension deepens effortlessly.
        </Typography>
      </div>

      <div>
        <Typography variant="overline">Body (17px / Inter / 400 / 1.8 line height)</Typography>
        <Typography variant="body" measure>
          ThoughtStream embraces generous white space as a foundational design element. The warm,
          neutral stone palette recedes behind the ideas, creating a reading experience that honors
          human attention rather than competing for it.
        </Typography>
      </div>

      <div>
        <Typography variant="overline">Body Small (15px / Inter / 400)</Typography>
        <Typography variant="bodySmall">
          Sidebar note: In accordance with Rule #8, all reading text strictly honors a maximum measure
          of 680px for optimal line lengths.
        </Typography>
      </div>

      <div>
        <Typography variant="overline">Caption (13px / Inter / 400)</Typography>
        <Typography variant="caption">Fig. 1 — Stone tokens and hairline grid structures, Oct 2026</Typography>
      </div>

      <div>
        <Typography variant="overline">Overline (11px / Inter / 600 / uppercase)</Typography>
        <Typography variant="overline">Editorial Taxonomy</Typography>
      </div>

      <div>
        <Typography variant="overline">Code (15px / Source Code Pro / 400)</Typography>
        <Typography variant="code">const readingExperience = 'uninterrupted';</Typography>
      </div>
    </div>
  ),
};
