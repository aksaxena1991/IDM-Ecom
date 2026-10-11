import React from 'react';
import './Confetti.css';

const PIECES = [
  { left: '8%', delay: '0s', duration: '3.2s', size: 10, shape: 'rect', color: '#FFD23F', drift: '-28px', spin: '620deg' },
  { left: '18%', delay: '0.2s', duration: '4.1s', size: 8, shape: 'circle', color: '#EF6C4A', drift: '36px', spin: '-480deg' },
  { left: '28%', delay: '0.45s', duration: '3.6s', size: 14, shape: 'rect', color: '#2BA8A2', drift: '18px', spin: '720deg' },
  { left: '38%', delay: '0.1s', duration: '4.5s', size: 7, shape: 'circle', color: '#5DADE2', drift: '-40px', spin: '400deg' },
  { left: '48%', delay: '0.55s', duration: '3.4s', size: 12, shape: 'rect', color: '#FFE47A', drift: '22px', spin: '-560deg' },
  { left: '58%', delay: '0.3s', duration: '4.2s', size: 9, shape: 'circle', color: '#FF8A6A', drift: '-16px', spin: '540deg' },
  { left: '68%', delay: '0.05s', duration: '3.8s', size: 11, shape: 'rect', color: '#3CC4BD', drift: '44px', spin: '-700deg' },
  { left: '76%', delay: '0.7s', duration: '3.3s', size: 6, shape: 'circle', color: '#E6B800', drift: '-32px', spin: '360deg' },
  { left: '86%', delay: '0.25s', duration: '4.4s', size: 13, shape: 'rect', color: '#EF6C4A', drift: '12px', spin: '800deg' },
  { left: '94%', delay: '0.5s', duration: '3.7s', size: 8, shape: 'circle', color: '#2BA8A2', drift: '-24px', spin: '-440deg' },
] as const;

export interface ConfettiProps {
  active?: boolean;
  className?: string;
}

export const Confetti: React.FC<ConfettiProps> = ({ active = true, className = '' }) => {
  if (!active) return null;

  return (
    <div className={['f7-confetti', className].filter(Boolean).join(' ')} aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className={`f7-confetti-piece f7-confetti-piece--${piece.shape}`}
          style={{
            left: piece.left,
            width: `calc(${piece.size} * var(--f7-rpx))`,
            height: `calc(${piece.size} * var(--f7-rpx))`,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ['--f7-confetti-drift' as string]: piece.drift,
            ['--f7-confetti-spin' as string]: piece.spin,
          }}
        />
      ))}
    </div>
  );
};

Confetti.displayName = 'Confetti';
