import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../actions/Button';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from '../../display/Card';
import { Chip } from '../../display/Chip';
import { Input } from '../../actions/Input';
import { Typography } from '../../typography/Typography';
import { Divider } from '../../typography/Divider';
import { Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeProvider';

const meta: Meta = {
  title: 'Foundations/Themes',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

function ThemeTogglePreview() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="overline" color="brand">Current Theme</Typography>
          <Typography variant="subhead">
            {resolvedTheme === 'dark' ? 'Night / Contemplative Dark' : 'Warm White / Stone Light'}
          </Typography>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={toggleTheme}
          leftIcon={resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        >
          Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </Button>
      </div>

      <Card variant="elevated" padding="medium">
        <CardHeader>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Chip variant="status" tone="info">Zen Restraint</Chip>
            <Chip variant="status" tone="success">Accessible Contrast</Chip>
          </div>
          <CardTitle>Dual-Mode Contemplative Experience</CardTitle>
          <CardSubtitle>OCTOBER 2026 • THOUGHTSTREAM THEME SPECIFICATION</CardSubtitle>
        </CardHeader>
        <CardBody>
          <Typography variant="body">
            Both Light and Dark modes share the same stone restraint: zero drop shadows,
            0px border radii, and hairline division. Light embraces warm archival paper (#FAFAF9),
            while Dark invites quiet nocturnal reading (#1C1917).
          </Typography>
          <div style={{ marginTop: '16px' }}>
            <Input label="Subscriber Note" placeholder="Add an observation..." />
          </div>
        </CardBody>
        <CardFooter>
          <span style={{ fontSize: '13px', color: 'var(--ts-color-text-secondary)' }}>
            System / Persistent Local Storage
          </span>
          <Button variant="primary" size="small">Confirm</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export const InteractiveToggle: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="light">
      <ThemeTogglePreview />
    </ThemeProvider>
  ),
};

export const SideBySideComparison: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Light Theme Container */}
      <div
        data-theme="light"
        className="thoughtstream-root thoughtstream-theme-light"
        style={{
          padding: '24px',
          border: '1px solid #E7E5E4',
          backgroundColor: '#FAFAF9',
          color: '#1C1917',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sun size={16} color="#78716C" />
          <Typography variant="overline" color="brand">Light Theme (Warm White)</Typography>
        </div>
        <Typography variant="headline">Archival Paper</Typography>
        <Typography variant="bodySmall">
          Page: #FAFAF9 • Surface: #F5F5F4 • Text: #1C1917
        </Typography>
        <Divider tone="subtle" spacing="small" />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <Button variant="primary" size="small">Primary</Button>
          <Button variant="secondary" size="small">Secondary</Button>
          <Chip variant="status" tone="success">Published</Chip>
        </div>
      </div>

      {/* Dark Theme Container */}
      <div
        data-theme="dark"
        className="thoughtstream-root thoughtstream-theme-dark"
        style={{
          padding: '24px',
          border: '1px solid #44403C',
          backgroundColor: '#1C1917',
          color: '#FAFAF9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Moon size={16} color="#A8A29E" />
          <Typography variant="overline" color="brand">Dark Theme (Warm Black)</Typography>
        </div>
        <Typography variant="headline">Nocturnal Stillness</Typography>
        <Typography variant="bodySmall">
          Page: #1C1917 • Surface: #292524 • Text: #FAFAF9
        </Typography>
        <Divider tone="subtle" spacing="small" />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <Button variant="primary" size="small">Primary</Button>
          <Button variant="secondary" size="small">Secondary</Button>
          <Chip variant="status" tone="success">Published</Chip>
        </div>
      </div>
    </div>
  ),
};
