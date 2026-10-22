import React from 'react';
import './Icon.css';

export type SkyLearnIconName =
  | 'book'
  | 'pencil'
  | 'calculator'
  | 'search'
  | 'lightbulb'
  | 'star'
  | 'rocket'
  | 'leaf'
  | 'sun'
  | 'raindrop'
  | 'palette'
  | 'alphabet-block';

export type SkyLearnIconTone = 'default' | 'active' | 'achievement';
export type SkyLearnIconSize = 'sm' | 'md' | 'lg';

export interface IconProps {
  name: SkyLearnIconName;
  size?: SkyLearnIconSize;
  tone?: SkyLearnIconTone;
  label?: string;
  className?: string;
}

const paths: Record<SkyLearnIconName, React.ReactNode> = {
  book: (
    <>
      <path d="M5 6h8a2 2 0 0 1 2 2v12H7a2 2 0 0 0-2 2V6z" />
      <path d="M5 6a2 2 0 0 1 2-2h8v14H7a2 2 0 0 0-2 2" />
    </>
  ),
  pencil: (
    <>
      <path d="M14 4l6 6-9 9H5v-6l9-9z" />
      <path d="M13 5l6 6" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2M16 15h2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l5 5" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z" />
    </>
  ),
  star: <path d="M12 3l2.9 6.3 6.9 1-5 4.8 1.2 6.9L12 18.8 5 16l1.2-6.9-5-4.8 6.9-1L12 3z" />,
  rocket: (
    <>
      <path d="M12 3c3 4 4 8 4 12 0 2-1 4-4 6-3-2-4-4-4-6 0-4 1-8 4-12z" />
      <path d="M9 14l-2 6 5-2M15 14l2 6-5-2" />
    </>
  ),
  leaf: (
    <path d="M20 4S8 6 4 14c4 2 8 2 12 0-1 4-4 6-8 6 8-2 12-10 12-16z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  raindrop: <path d="M12 3c-4 6-6 9-6 12a6 6 0 1 0 12 0c0-3-2-6-6-12z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a3 3 0 0 1-3-3V9a6 6 0 0 1 6-6z" />
      <circle cx="8" cy="10" r="1" />
      <circle cx="11" cy="7" r="1" />
      <circle cx="15" cy="9" r="1" />
    </>
  ),
  'alphabet-block': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 16V8h3a2.5 2.5 0 0 1 0 5H9" />
    </>
  ),
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'sm',
  tone = 'default',
  label,
  className = '',
}) => {
  return (
    <svg
      className={['sl-icon', `sl-icon--${size}`, `sl-icon--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {paths[name]}
    </svg>
  );
};
