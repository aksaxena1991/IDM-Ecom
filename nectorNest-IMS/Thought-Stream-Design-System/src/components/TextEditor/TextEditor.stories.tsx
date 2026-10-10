import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextEditor } from './TextEditor';

const meta: Meta<typeof TextEditor> = {
  title: 'Components/TextEditor',
  component: TextEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TextEditor>;

const SAMPLE_MARKDOWN = `# The Geometry of Silence

To compose prose within a distraction-free plane is to discover the natural tempo of thought.

> "Simplicity is about subtracting the obvious and adding the meaningful."
> — John Maeda, The Laws of Simplicity

### Foundations of Contemplative Typography
1. **Zero-Radius Margins**: Eradicating decorative radiuses brings structural honesty.
2. **Hairline Planes**: Gentle stone borders divide workspace facets without sensory overload.
3. **Typographic Dignity**: Libre Baskerville honors legacy serif traditions.

---

\`\`\`typescript
const readingPurity = calculateStillness({
  radii: 0,
  borders: 'hairline',
  font: 'Baskerville',
});
\`\`\`
`;

export const DefaultSplitView: Story = {
  render: () => {
    const [content, setContent] = useState(SAMPLE_MARKDOWN);

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <TextEditor
          value={content}
          onChange={setContent}
          statusText="Committed to Drafts"
        />
      </div>
    );
  },
};

export const WriteOnlyMode: Story = {
  render: () => {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <TextEditor
          defaultValue={`# Distraction-Free Journal\n\nBegin typing your notes here in pure writing mode.`}
          viewMode="edit"
          placeholder="Write your morning reflections..."
        />
      </div>
    );
  },
};

export const PreviewOnlyMode: Story = {
  render: () => {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <TextEditor
          defaultValue={SAMPLE_MARKDOWN}
          viewMode="preview"
        />
      </div>
    );
  },
};
