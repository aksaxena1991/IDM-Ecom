import React from 'react';
import './Logo.css';

const FAN_COLORS = [
  'var(--f7-color-coral)',
  'var(--f7-color-accent)',
  'var(--f7-color-primary)',
  'var(--f7-color-sky)',
  'var(--f7-color-primary-dark)',
] as const;

const FAN_ANGLES = [-24, -12, 0, 12, 24] as const;

export interface LogoProps {
  /** Ribbon banner copy */
  banner?: string;
  /** Compact header vs full setup-page lockup */
  size?: 'default' | 'compact';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  banner = 'THE CARD GAME',
  size = 'default',
  className = '',
}) => {
  return (
    <div className={['f7-logo', `f7-logo--${size}`, className].filter(Boolean).join(' ')}>
      <div className="f7-logo-fan" aria-hidden="true">
        {FAN_ANGLES.map((angle, index) => (
          <span
            key={angle}
            className="f7-logo-fan-card"
            style={{
              background: FAN_COLORS[index],
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          />
        ))}
      </div>

      <div className="f7-logo-mark">
        <div className="f7-logo-plate">
          <span className="f7-logo-flip">FLIP</span>
          <span className="f7-logo-seven">7</span>
        </div>
      </div>

      <div className="f7-logo-ribbon">
        <span className="f7-logo-ribbon-text">{banner}</span>
      </div>
    </div>
  );
};

Logo.displayName = 'Logo';
