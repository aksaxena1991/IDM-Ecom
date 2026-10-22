import React from 'react';
import './ConfettiCelebration.css';

const COLORS = ['#3B82F6', '#FBBF24', '#22C55E', '#A855F7', '#FCD34D'];

const PIECES = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 4.1) % 100}%`,
  delay: `${(i % 8) * 0.08}s`,
  color: COLORS[i % COLORS.length]!,
  size: 6 + (i % 5) * 2,
}));

export interface ConfettiCelebrationProps {
  active?: boolean;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active = true }) => {
  if (!active) return null;

  return (
    <div className="sl-confetti" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="sl-confetti-piece"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            background: piece.color,
            animationDelay: piece.delay,
          }}
        />
      ))}
    </div>
  );
};
