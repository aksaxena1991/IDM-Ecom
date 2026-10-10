import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tree, TreeNode, SortableTree, TreeDropPosition } from './Tree';
import { Book, FileText, Feather, Bookmark, Sparkles } from 'lucide-react';
import { Chip } from '../../display/Chip';

const meta: Meta<typeof Tree> = {
  title: 'Components/Tree',
  component: Tree,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tree>;

const SAMPLE_PROJECT_TREE: TreeNode[] = [
  {
    id: 'manuscript',
    label: 'ThoughtStream Monograph',
    icon: <Book size={16} />,
    children: [
      {
        id: 'front-matter',
        label: 'Front Matter',
        children: [
          { id: 'fm-title', label: '00_title_page.md', badge: '120 w' },
          { id: 'fm-preface', label: '01_author_preface.md', badge: '480 w' },
          { id: 'fm-toc', label: '02_table_of_contents.md' },
        ],
      },
      {
        id: 'part-one',
        label: 'Part I: The Architecture of Silence',
        children: [
          {
            id: 'ch-1',
            label: 'Chapter 1: Zero-Radius Foundations',
            badge: '1,850 w',
            icon: <Feather size={16} />,
          },
          {
            id: 'ch-2',
            label: 'Chapter 2: Hairline Geometries',
            badge: '2,200 w',
            icon: <Feather size={16} />,
          },
          {
            id: 'ch-3',
            label: 'Chapter 3: Contemplative Spacing',
            badge: '1,420 w',
            icon: <Feather size={16} />,
          },
        ],
      },
      {
        id: 'part-two',
        label: 'Part II: Typographic Dignity',
        children: [
          {
            id: 'ch-4',
            label: 'Chapter 4: The Voice of Baskerville',
            badge: '3,100 w',
            icon: <Bookmark size={16} />,
          },
          {
            id: 'ch-5',
            label: 'Chapter 5: Monospace Rhythm',
            badge: '1,960 w',
            icon: <Bookmark size={16} />,
          },
        ],
      },
      {
        id: 'back-matter',
        label: 'Appendices & Bibliography',
        children: [
          { id: 'app-a', label: 'Appendix A: Token Reference.md' },
          { id: 'app-b', label: 'Appendix B: Accessible Contrast.md' },
          { id: 'bib', label: 'Works_Cited.bib', icon: <FileText size={16} /> },
        ],
      },
    ],
  },
  {
    id: 'research-notes',
    label: 'Field Observations & Margin Notes',
    icon: <Sparkles size={16} />,
    children: [
      { id: 'note-1', label: 'Dieter_Rams_Ten_Principles.txt' },
      { id: 'note-2', label: 'E-Ink_Refresh_Latency_Log.csv' },
      { id: 'note-3', label: 'Typographic_Scale_Math.py' },
    ],
  },
];

export const FileExplorer: Story = {
  render: () => {
    const [selected, setSelected] = useState<TreeNode | null>(null);

    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
            Document Tree Explorer
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Expand branches to navigate through the monograph hierarchy.
          </p>
        </div>

        <Tree
          data={SAMPLE_PROJECT_TREE}
          defaultExpandedIds={['manuscript', 'part-one']}
          defaultSelectedId="ch-1"
          onSelect={setSelected}
        />

        <div style={{ fontSize: '12px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)', padding: '8px 12px', background: 'var(--ts-color-surface)' }}>
          Active Selection: {selected ? `${selected.label} (id: ${selected.id})` : 'Chapter 1: Zero-Radius Foundations'}
        </div>
      </div>
    );
  },
};

export const SearchableTree: Story = {
  render: () => {
    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
            Filterable Tree
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Type to filter nodes — auto-expands branches and highlights matching text.
          </p>
        </div>

        <Tree
          data={SAMPLE_PROJECT_TREE}
          searchable
          searchPlaceholder="Search files, chapters, tokens..."
          defaultExpandedIds={['manuscript']}
        />
      </div>
    );
  },
};

export const CheckableTree: Story = {
  render: () => {
    const [checked, setChecked] = useState<string[]>(['ch-1', 'ch-2']);

    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
              Export Checklist
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
              Select chapters to compile into PDF monograph.
            </p>
          </div>
          <Chip variant="status" tone="info">
            {checked.length} selected
          </Chip>
        </div>

        <Tree
          data={SAMPLE_PROJECT_TREE}
          checkable
          checkedIds={checked}
          onCheck={(ids) => setChecked(ids)}
          defaultExpandedIds={['manuscript', 'part-one']}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                           TREE WITH FILTER STORY                           */
/* -------------------------------------------------------------------------- */

const CATEGORIZED_TREE: TreeNode[] = [
  {
    id: 'manuscript',
    label: 'ThoughtStream Monograph',
    icon: <Book size={16} />,
    category: 'manuscript',
    children: [
      {
        id: 'fm-1',
        label: 'Front Matter: Prefatory Notice',
        category: 'frontmatter',
        badge: 'Editorial',
        children: [
          { id: 'fm-dedication', label: 'Dedication.md', category: 'frontmatter', badge: '120 w' },
          { id: 'fm-preface', label: 'Author_Preface.md', category: 'frontmatter', badge: '560 w' },
        ],
      },
      {
        id: 'ch-group-1',
        label: 'Part I: Contemplative Principles',
        category: 'chapter',
        children: [
          { id: 'ch-1', label: 'Chapter 01: The Geometry of Silence', category: 'chapter', badge: 'Core' },
          { id: 'ch-2', label: 'Chapter 02: Hairline Planes & Non-Radii', category: 'chapter', badge: 'Core' },
          { id: 'ch-3', label: 'Chapter 03: Monospace Footnotes', category: 'chapter', badge: 'Draft' },
        ],
      },
      {
        id: 'ch-group-2',
        label: 'Part II: Typographic Dignity',
        category: 'chapter',
        children: [
          { id: 'ch-4', label: 'Chapter 04: The Serif Horizon', category: 'chapter', badge: 'Ready' },
          { id: 'ch-5', label: 'Chapter 05: Reader Autonomy & Margin Rhythms', category: 'chapter', badge: 'Ready' },
        ],
      },
      {
        id: 'notes-group',
        label: 'Research Notes & Marginalia',
        category: 'notes',
        children: [
          { id: 'note-rams', label: 'Dieter_Rams_Functionalism.md', category: 'notes' },
          { id: 'note-eink', label: 'E-Ink_Contrast_Calibration.txt', category: 'notes' },
          { id: 'note-grid', label: 'Twelve_Point_Vertical_Measure.py', category: 'notes' },
        ],
      },
    ],
  },
];

export const TreeWithFilter: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [filterMode, setFilterMode] = useState<'filter' | 'highlight'>('filter');

    const filterCategories = [
      { id: 'all', label: 'All Items' },
      { id: 'chapter', label: 'Chapters' },
      { id: 'frontmatter', label: 'Front Matter' },
      { id: 'notes', label: 'Notes' },
    ];

    return (
      <div style={{ maxWidth: '460px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
            Tree with Advanced Filtering
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Search by text with highlight markers, filter by category tags, or switch match modes.
          </p>
        </div>

        {/* Filter Mode Control */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--ts-color-surface)', border: '1px solid var(--ts-border-subtle)' }}>
          <span style={{ fontSize: '12px', color: 'var(--ts-color-text-secondary)' }}>
            Filter Presentation Mode:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setFilterMode('filter')}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--ts-font-mono)',
                border: '1px solid var(--ts-border-subtle)',
                background: filterMode === 'filter' ? 'var(--ts-color-primary)' : 'var(--ts-color-bg)',
                color: filterMode === 'filter' ? 'var(--ts-color-bg)' : 'var(--ts-color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Prune Non-Matches
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('highlight')}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontFamily: 'var(--ts-font-mono)',
                border: '1px solid var(--ts-border-subtle)',
                background: filterMode === 'highlight' ? 'var(--ts-color-primary)' : 'var(--ts-color-bg)',
                color: filterMode === 'highlight' ? 'var(--ts-color-bg)' : 'var(--ts-color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Highlight Only
            </button>
          </div>
        </div>

        <Tree
          data={CATEGORIZED_TREE}
          searchable
          searchPlaceholder="Type chapter, title, note, or badge..."
          filterQuery={query}
          onFilterChange={setQuery}
          filterMode={filterMode}
          filterCategories={filterCategories}
          activeCategory={category}
          onCategoryChange={setCategory}
          defaultExpandedIds={['manuscript', 'ch-group-1']}
        />
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                          TREE WITH SORTABLE STORY                          */
/* -------------------------------------------------------------------------- */

export const TreeWithSortable: Story = {
  render: () => {
    const [tree, setTree] = useState<TreeNode[]>([
      {
        id: 'folder-drafts',
        label: 'Active Essays (Folder)',
        icon: <Book size={16} />,
        children: [
          { id: 'essay-1', label: '01_Silence_Over_Noise.md', badge: '1.2k w' },
          { id: 'essay-2', label: '02_Baskerville_Speaks.md', badge: '2.5k w' },
          { id: 'essay-3', label: '03_The_Zero_Radius_Grid.md', badge: '1.8k w' },
        ],
      },
      {
        id: 'folder-archive',
        label: 'Archived Monograph Outtakes (Folder)',
        icon: <Book size={16} />,
        children: [
          { id: 'essay-4', label: '04_Shadows_and_Gradients.md', badge: 'Discarded' },
          { id: 'essay-5', label: '05_Early_Rough_Notes.txt', badge: 'Fragment' },
        ],
      },
      { id: 'standalone-bib', label: 'General_Bibliography.bib', icon: <FileText size={16} />, badge: 'Root' },
    ]);

    const [lastAction, setLastAction] = useState<string>('Drag any item or folder to reorder or nest.');

    const handleMove = (
      draggedId: string,
      targetId: string,
      position: TreeDropPosition,
      newTree: TreeNode[]
    ) => {
      setTree(newTree);
      setLastAction(`Moved "${draggedId}" ${position} "${targetId}"`);
    };

    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
            Tree with Sortable Drag & Drop
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Drag nodes to reorder siblings (drop above/below) or move files inside folders (drop middle).
          </p>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)', padding: '8px 12px', background: 'var(--ts-color-surface)', border: '1px solid var(--ts-border-subtle)' }}>
          Status: {lastAction}
        </div>

        <Tree
          data={tree}
          sortable
          dragHandle
          onMoveNode={handleMove}
          defaultExpandedIds={['folder-drafts', 'folder-archive']}
        />
      </div>
    );
  },
};

export const StandaloneSortableTreeWrapper: Story = {
  render: () => {
    const initialTree: TreeNode[] = [
      {
        id: 'section-a',
        label: 'Section A: Foundations',
        icon: <Book size={16} />,
        children: [
          { id: 'sec-a1', label: 'A.1 Axiom of Simplicity.md' },
          { id: 'sec-a2', label: 'A.2 0px Border Radii.md' },
        ],
      },
      {
        id: 'section-b',
        label: 'Section B: Typography Scale',
        icon: <Book size={16} />,
        children: [
          { id: 'sec-b1', label: 'B.1 Editorial Rhythm.md' },
          { id: 'sec-b2', label: 'B.2 Baskerville & Inter.md' },
        ],
      },
    ];

    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '16px' }}>
            SortableTree Stateful Component
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Self-contained sortable tree with automatic internal state management.
          </p>
        </div>

        <SortableTree
          data={initialTree}
          dragHandle
          defaultExpandedIds={['section-a', 'section-b']}
        />
      </div>
    );
  },
};
