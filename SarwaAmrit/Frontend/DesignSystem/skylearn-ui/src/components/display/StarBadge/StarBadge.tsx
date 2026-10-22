import React from 'react';
import './StarBadge.css';

export type StarTier = 'bronze' | 'silver' | 'gold';

export interface StarBadgeProps {
  tier?: StarTier;
  glow?: boolean;
  size?: 'md' | 'lg';
}

const tierLabel: Record<StarTier, string> = {
  bronze: 'Bronze star',
  silver: 'Silver star',
  gold: 'Gold star',
};

export const StarBadge: React.FC<StarBadgeProps> = ({
  tier = 'gold',
  glow = false,
  size = 'lg',
}) => {
  return (
    <div
      className={[
        'sl-star-badge',
        `sl-star-badge--${tier}`,
        `sl-star-badge--${size}`,
        glow ? 'sl-star-badge--glow sl-animate-scale-in' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={tierLabel[tier]}
    >
      ★
    </div>
  );
};
