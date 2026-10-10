import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SortableList, Draggable, Droppable } from './DragDrop';
import { Chip } from '../../display/Chip';
import { BookOpen, FileCheck, Sparkles } from 'lucide-react';

const meta: Meta<typeof SortableList> = {
  title: 'Components/Drag and Drop',
  component: SortableList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SortableList>;

interface ManuscriptChapter {
  id: string;
  title: string;
  readTime: string;
  status: 'draft' | 'review' | 'ready';
}

export const SortableManuscriptOutline: Story = {
  render: () => {
    const [chapters, setChapters] = useState<ManuscriptChapter[]>([
      { id: 'ch-1', title: 'Chapter I: The Architecture of Silence', readTime: '6 min read', status: 'ready' },
      { id: 'ch-2', title: 'Chapter II: The Geometry of 0px Margins', readTime: '12 min read', status: 'review' },
      { id: 'ch-3', title: 'Chapter III: White Space as a First-Class Citizen', readTime: '8 min read', status: 'ready' },
      { id: 'ch-4', title: 'Chapter IV: The Distraction-Free Horizon', readTime: '15 min read', status: 'draft' },
      { id: 'ch-5', title: 'Chapter V: Epilogue on Contemplative Craft', readTime: '4 min read', status: 'draft' },
    ]);

    return (
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '18px', color: 'var(--ts-color-text-primary)' }}>
            Manuscript Chapter Sequence
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Drag and reorder chapters to restructure the monograph narrative flow.
          </p>
        </div>

        <SortableList
          items={chapters}
          onReorder={setChapters}
          renderItem={(chapter, index, dragHandle) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {dragHandle}
                <span style={{ fontFamily: 'var(--ts-font-mono)', fontSize: '12px', color: 'var(--ts-color-text-tertiary)', width: '20px' }}>
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--ts-color-text-primary)' }}>
                    {chapter.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ts-color-text-tertiary)', fontFamily: 'var(--ts-font-mono)', marginTop: '2px' }}>
                    {chapter.readTime}
                  </div>
                </div>
              </div>

              <Chip
                variant="status"
                tone={chapter.status === 'ready' ? 'success' : 'info'}
              >
                {chapter.status}
              </Chip>
            </div>
          )}
        />
      </div>
    );
  },
};

interface CardItem {
  id: string;
  title: string;
  category: string;
}

export const TwoColumnKanbanDropZones: Story = {
  render: () => {
    const [drafts, setDrafts] = useState<CardItem[]>([
      { id: 'card-1', title: 'Meditation on Typographic Rhythm', category: 'Theory' },
      { id: 'card-2', title: 'On Libre Baskerville and Heritage', category: 'Typeface' },
      { id: 'card-3', title: 'The Elimination of Gradients', category: 'Aesthetic' },
    ]);

    const [published, setPublished] = useState<CardItem[]>([
      { id: 'card-4', title: 'Flat Plane Architecture Manifesto', category: 'Essays' },
    ]);

    const handleDropToPublished = (data: { id: string }) => {
      const item = drafts.find((d) => d.id === data.id);
      if (item) {
        setDrafts((prev) => prev.filter((d) => d.id !== data.id));
        setPublished((prev) => [...prev, item]);
      }
    };

    const handleDropToDrafts = (data: { id: string }) => {
      const item = published.find((p) => p.id === data.id);
      if (item) {
        setPublished((prev) => prev.filter((p) => p.id !== data.id));
        setDrafts((prev) => [...prev, item]);
      }
    };

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '750px', margin: '0 auto' }}>
        {/* Column 1: Draft Ideas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={16} style={{ color: 'var(--ts-color-primary)' }} />
            <h4 style={{ margin: 0, fontFamily: 'var(--ts-font-heading)', fontSize: '15px' }}>
              Incubating Ideas ({drafts.length})
            </h4>
          </div>

          <Droppable
            id="drafts-zone"
            onDrop={handleDropToDrafts}
            placeholder={<span>Drag published items here to unpublish</span>}
            style={{ minHeight: '260px' }}
          >
            {drafts.map((card) => (
              <Draggable key={card.id} id={card.id} data={{ title: card.title }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={15} style={{ color: 'var(--ts-color-text-tertiary)' }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{card.title}</div>
                    <span style={{ fontSize: '11px', color: 'var(--ts-color-text-tertiary)', fontFamily: 'var(--ts-font-mono)' }}>
                      {card.category}
                    </span>
                  </div>
                </div>
              </Draggable>
            ))}
          </Droppable>
        </div>

        {/* Column 2: Published */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileCheck size={16} style={{ color: 'var(--ts-color-success)' }} />
            <h4 style={{ margin: 0, fontFamily: 'var(--ts-font-heading)', fontSize: '15px' }}>
              Selected for Monograph ({published.length})
            </h4>
          </div>

          <Droppable
            id="published-zone"
            onDrop={handleDropToPublished}
            placeholder={<span>Drop drafts here to curate for print</span>}
            style={{ minHeight: '260px' }}
          >
            {published.map((card) => (
              <Draggable key={card.id} id={card.id} data={{ title: card.title }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BookOpen size={15} style={{ color: 'var(--ts-color-text-tertiary)' }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{card.title}</div>
                    <span style={{ fontSize: '11px', color: 'var(--ts-color-text-tertiary)', fontFamily: 'var(--ts-font-mono)' }}>
                      {card.category}
                    </span>
                  </div>
                </div>
              </Draggable>
            ))}
          </Droppable>
        </div>
      </div>
    );
  },
};
