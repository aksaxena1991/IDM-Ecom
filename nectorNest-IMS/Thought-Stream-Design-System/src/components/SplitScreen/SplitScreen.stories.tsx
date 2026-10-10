import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SplitScreen, SplitPane } from './SplitScreen';
import { SplitGrid, SplitGridCell } from './SplitGrid';
import { BookOpen, FileText, Settings, Code } from 'lucide-react';

const meta: Meta<typeof SplitScreen> = {
  title: 'Components/SplitScreen',
  component: SplitScreen,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SplitScreen>;

const PaneContent = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => (
  <div
    style={{
      padding: '20px',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      background: 'var(--ts-color-bg)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--ts-border-subtle)', paddingBottom: '12px' }}>
      {icon && <span style={{ color: 'var(--ts-color-primary)', display: 'flex' }}>{icon}</span>}
      <div>
        <h4 style={{ margin: 0, fontFamily: 'var(--ts-font-heading)', fontSize: '15px', color: 'var(--ts-color-text-primary)' }}>
          {title}
        </h4>
        {subtitle && (
          <span style={{ fontSize: '11px', color: 'var(--ts-color-text-tertiary)', fontFamily: 'var(--ts-font-mono)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
    <div style={{ flex: 1, fontSize: '13px', lineHeight: 1.6, color: 'var(--ts-color-text-secondary)', overflowY: 'auto' }}>
      {children}
    </div>
  </div>
);

export const DualPaneEditor: Story = {
  render: () => {
    return (
      <div style={{ height: '450px', width: '100%' }}>
        <SplitScreen direction="horizontal" defaultSizes={[45, 55]}>
          <SplitPane>
            <PaneContent icon={<Code size={16} />} title="Manuscript Source" subtitle="Markdown Buffer">
              <p>
                # On the Art of Contemplation
                <br /><br />
                To write without distraction is to construct an interior sanctuary. Here, hairline dividers mark
                the boundaries of active thought, allowing the mind to rest between paragraphs.
              </p>
              <pre style={{ background: 'var(--ts-color-surface)', padding: '12px', fontFamily: 'var(--ts-font-mono)', fontSize: '12px', border: '1px solid var(--ts-border-subtle)' }}>
                {`> "Silence is not the absence of sound,\n> but the presence of stillness."`}
              </pre>
            </PaneContent>
          </SplitPane>

          <SplitPane>
            <PaneContent icon={<BookOpen size={16} />} title="Typeset Preview" subtitle="Rendered Serif Display">
              <h2 style={{ fontFamily: 'var(--ts-font-heading)', marginTop: 0, color: 'var(--ts-color-text-primary)' }}>
                On the Art of Contemplation
              </h2>
              <p style={{ fontStyle: 'italic', color: 'var(--ts-color-text-secondary)' }}>
                To write without distraction is to construct an interior sanctuary. Here, hairline dividers mark
                the boundaries of active thought, allowing the mind to rest between paragraphs.
              </p>
              <blockquote style={{ borderLeft: '2px solid var(--ts-color-primary)', paddingLeft: '16px', margin: '16px 0', color: 'var(--ts-color-text-secondary)' }}>
                Silence is not the absence of sound, but the presence of stillness.
              </blockquote>
            </PaneContent>
          </SplitPane>
        </SplitScreen>
      </div>
    );
  },
};

export const TripleSplitWorkspace: Story = {
  render: () => {
    const [sizes, setSizes] = useState<number[]>([22, 53, 25]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <div style={{ fontSize: '12px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Pane Distributions: [{sizes.map((s) => `${s.toFixed(1)}%`).join(' | ')}]
          <span style={{ marginLeft: '12px', color: 'var(--ts-color-text-tertiary)' }}>
            (Drag dividers or double-click to equalize)
          </span>
        </div>

        <div style={{ height: '480px', width: '100%' }}>
          <SplitScreen
            direction="horizontal"
            sizes={sizes}
            onResize={setSizes}
            minSize={[150, 250, 160]}
          >
            {/* Sidebar Explorer */}
            <SplitPane>
              <PaneContent icon={<FileText size={16} />} title="Explorer" subtitle="7 Documents">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ padding: '6px 8px', background: 'var(--ts-color-surface)', borderLeft: '2px solid var(--ts-color-primary)', fontWeight: 500 }}>
                    01_prologue.md
                  </li>
                  <li style={{ padding: '6px 8px', color: 'var(--ts-color-text-secondary)' }}>
                    02_geometry_of_thought.md
                  </li>
                  <li style={{ padding: '6px 8px', color: 'var(--ts-color-text-secondary)' }}>
                    03_silence_and_space.md
                  </li>
                  <li style={{ padding: '6px 8px', color: 'var(--ts-color-text-secondary)' }}>
                    04_typography_principles.md
                  </li>
                </ul>
              </PaneContent>
            </SplitPane>

            {/* Central Reader / Editor */}
            <SplitPane>
              <PaneContent icon={<BookOpen size={16} />} title="Active Chapter" subtitle="Reading Measure: 680px">
                <p>
                  The essence of a minimalist workspace lies not in subtraction for the sake of austerity,
                  but in stripping away non-essential noise so the subject matter can breathe.
                </p>
                <p>
                  When resizing panes, subtle stone borders guide the boundary without demanding cognitive attention.
                </p>
              </PaneContent>
            </SplitPane>

            {/* Metadata Inspector */}
            <SplitPane>
              <PaneContent icon={<Settings size={16} />} title="Document Meta" subtitle="Properties">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <strong style={{ color: 'var(--ts-color-text-primary)' }}>Words:</strong> 1,420
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ts-color-text-primary)' }}>Read Time:</strong> 5.2 min
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ts-color-text-primary)' }}>Status:</strong> In Review
                  </div>
                  <div>
                    <strong style={{ color: 'var(--ts-color-text-primary)' }}>Revision:</strong> v2.4
                  </div>
                </div>
              </PaneContent>
            </SplitPane>
          </SplitScreen>
        </div>
      </div>
    );
  },
};

export const VerticalSplitScreen: Story = {
  render: () => {
    return (
      <div style={{ height: '450px', width: '100%' }}>
        <SplitScreen direction="vertical" defaultSizes={[65, 35]}>
          <SplitPane>
            <PaneContent icon={<BookOpen size={16} />} title="Main Editorial Manuscript" subtitle="Primary Window">
              <p>
                In classical typography, generous vertical margins established the contemplative cadence of the page.
                By segmenting vertical views into primary text and contextual scholarly apparatus, scholars could examine
                annotations simultaneously without losing their reading place.
              </p>
            </PaneContent>
          </SplitPane>

          <SplitPane>
            <PaneContent icon={<Code size={16} />} title="Footnotes & Scholarly Citations" subtitle="Secondary View">
              <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Baskerville, J. (1757). <em>Specimen of Printing Types</em>. Birmingham.</li>
                <li>Tschichold, J. (1928). <em>Die neue Typographie</em>. Berlin.</li>
                <li>Bringhurst, R. (1992). <em>The Elements of Typographic Style</em>. Hartley & Marks.</li>
              </ol>
            </PaneContent>
          </SplitPane>
        </SplitScreen>
      </div>
    );
  },
};

/* -------------------------------------------------------------------------- */
/*                       SPLIT SCREEN GRID SYSTEM STORIES                     */
/* -------------------------------------------------------------------------- */

export const SplitScreenGrid2x2: Story = {
  render: () => {
    const [cols, setCols] = useState<number[]>([50, 50]);
    const [rows, setRows] = useState<number[]>([50, 50]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '18px' }}>
            2D Split Screen Grid System (2x2 Quad Studio)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Drag the vertical gutter, horizontal gutter, or center junction handle to resize both axes simultaneously.
            Double-click any divider or junction to equalize.
          </p>
        </div>

        <div style={{ fontSize: '12px', fontFamily: 'var(--ts-font-mono)', color: 'var(--ts-color-text-secondary)' }}>
          Columns: [{cols.map((c) => `${c.toFixed(1)}%`).join(' | ')}] • Rows: [{rows.map((r) => `${r.toFixed(1)}%`).join(' | ')}]
        </div>

        <div style={{ height: '520px', width: '100%' }}>
          <SplitGrid
            columns={2}
            rows={2}
            colSizes={cols}
            rowSizes={rows}
            onColResize={setCols}
            onRowResize={setRows}
          >
            {/* Top Left: Manuscript Buffer */}
            <SplitGridCell row={0} col={0}>
              <PaneContent icon={<FileText size={16} />} title="Manuscript Buffer" subtitle="Pane [0, 0]">
                <p>
                  To design with silence is to respect the human threshold of attention.
                  Each quadrant represents an active workspace node with dedicated scrolling.
                </p>
              </PaneContent>
            </SplitGridCell>

            {/* Top Right: Live Typeset */}
            <SplitGridCell row={0} col={1}>
              <PaneContent icon={<BookOpen size={16} />} title="Typeset Rendering" subtitle="Pane [0, 1]">
                <div style={{ fontStyle: 'italic', color: 'var(--ts-color-text-secondary)' }}>
                  "The details are not the details. They make the design."
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--ts-color-text-tertiary)' }}>
                  — Charles Eames
                </div>
              </PaneContent>
            </SplitGridCell>

            {/* Bottom Left: Diagnostics & Token Inspector */}
            <SplitGridCell row={1} col={0}>
              <PaneContent icon={<Code size={16} />} title="Token Diagnostics" subtitle="Pane [1, 0]">
                <pre style={{ margin: 0, fontSize: '11px', fontFamily: 'var(--ts-font-mono)', background: 'var(--ts-color-surface)', padding: '10px' }}>
                  {`--ts-border-subtle: #E7E5E4\n--ts-radius-none: 0px\n--ts-font-reading: Libre Baskerville`}
                </pre>
              </PaneContent>
            </SplitGridCell>

            {/* Bottom Right: Document Outline & Indices */}
            <SplitGridCell row={1} col={1}>
              <PaneContent icon={<Settings size={16} />} title="Scholarly Indexes" subtitle="Pane [1, 1]">
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <li>Index 1: Baskerville Type Specimens</li>
                  <li>Index 2: Flat Plane Architecture</li>
                  <li>Index 3: Zen Rhythms & 12px Grid</li>
                </ul>
              </PaneContent>
            </SplitGridCell>
          </SplitGrid>
        </div>
      </div>
    );
  },
};

export const SplitScreenGridSpanningLayout: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--ts-font-heading)', fontSize: '18px' }}>
            Grid System with Cell Spanning (1-Top / 2-Bottom)
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            Header panel spans two columns (`colSpan={2}`), with resizable bottom split panes.
          </p>
        </div>

        <div style={{ height: '480px', width: '100%' }}>
          <SplitGrid
            columns={2}
            rows={2}
            defaultRowSizes={[35, 65]}
            defaultColSizes={[40, 60]}
          >
            {/* Full-width header spanning row 0 across 2 cols */}
            <SplitGridCell row={0} col={0} colSpan={2}>
              <PaneContent icon={<BookOpen size={16} />} title="Primary Monograph Overview" subtitle="Spans 2 Columns">
                <p>
                  A contemplative editorial layout allows wide contextual overviews across the upper third,
                  while analytical sub-tasks are divided into focused child panels below.
                </p>
              </PaneContent>
            </SplitGridCell>

            {/* Bottom Left */}
            <SplitGridCell row={1} col={0}>
              <PaneContent icon={<FileText size={16} />} title="Section Navigator" subtitle="Left Split">
                <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>I. On Minimalist Structure</li>
                  <li>II. The Geometry of 0px</li>
                  <li>III. Natural Stone Radiance</li>
                </ol>
              </PaneContent>
            </SplitGridCell>

            {/* Bottom Right */}
            <SplitGridCell row={1} col={1}>
              <PaneContent icon={<Code size={16} />} title="Editorial Draft Editor" subtitle="Right Split">
                <p>
                  By dragging the vertical gutter between the bottom cells or the horizontal gutter separating
                  the header, authors can adjust their workspace geometry to suit current concentration needs.
                </p>
              </PaneContent>
            </SplitGridCell>
          </SplitGrid>
        </div>
      </div>
    );
  },
};
