import React from 'react';
import { Avatar, type AvatarTone } from '../Avatar';
import './VictoryRanking.css';

export type VictoryPlace = 1 | 2 | 3 | number;

export interface VictoryRankingItem {
  name: string;
  score: number;
  place: VictoryPlace;
}

export interface VictoryRankingProps {
  players: VictoryRankingItem[];
  className?: string;
}

const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function placeTone(place: number): AvatarTone {
  if (place === 1) return 'gold';
  if (place === 2) return 'silver';
  if (place === 3) return 'coral';
  return 'teal';
}

function placeSize(place: number): 56 | 60 | 64 {
  if (place === 2) return 64;
  if (place === 3) return 60;
  return 56;
}

export const VictoryRanking: React.FC<VictoryRankingProps> = ({ players, className = '' }) => {
  return (
    <ol className={['f7-ranking', className].filter(Boolean).join(' ')}>
      {players.map((player) => {
        const tier = player.place <= 3 ? player.place : 'rest';
        return (
          <li
            key={`${player.place}-${player.name}`}
            className={`f7-ranking-item f7-ranking-item--${tier}`}
          >
            <Avatar label={player.name} tone={placeTone(player.place)} size={placeSize(player.place)} />
            <div className="f7-ranking-copy">
              <div className="f7-ranking-name">{player.name}</div>
              <div className="f7-ranking-place">
                {player.place === 1 ? 'Winner' : `#${player.place}`}
              </div>
            </div>
            {MEDAL[player.place] && (
              <span className="f7-emoji f7-ranking-medal" role="img" aria-label={`Place ${player.place}`}>
                {MEDAL[player.place]}
              </span>
            )}
            <div className="f7-ranking-score">{player.score}</div>
          </li>
        );
      })}
    </ol>
  );
};

VictoryRanking.displayName = 'VictoryRanking';
