import React from 'react';
import { BigFriendlyButton } from '../../actions/BigFriendlyButton/BigFriendlyButton.js';
import { StarBadge } from '../../display/StarBadge/StarBadge.js';
import { Typography } from '../../typography/Typography/Typography.js';
import './QuizScoreCard.css';

export interface QuizScoreCardProps {
  score: number;
  maxScore?: number;
  stars?: 1 | 2 | 3;
  gotRight: string[];
  reviewNext: string[];
  onContinue?: () => void;
}

export const QuizScoreCard: React.FC<QuizScoreCardProps> = ({
  score,
  maxScore = 100,
  stars = 2,
  gotRight,
  reviewNext,
  onContinue,
}) => {
  return (
    <article className="sl-quiz-score">
      <Typography variant="score" className="sl-quiz-score__number">
        {score}
        <span className="sl-quiz-score__max">/{maxScore}</span>
      </Typography>
      <div className="sl-quiz-score__stars" aria-label={`${stars} of 3 stars`}>
        {[1, 2, 3].map((n) => (
          <StarBadge key={n} tier={n === 3 ? 'gold' : n === 2 ? 'silver' : 'bronze'} size="md" glow={n <= stars} />
        ))}
      </div>
      <section className="sl-quiz-score__section sl-quiz-score__section--ok">
        <h3>What you got right</h3>
        <ul>
          {gotRight.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="sl-quiz-score__section sl-quiz-score__section--review">
        <h3>What we&apos;ll review next time</h3>
        <ul>
          {reviewNext.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <BigFriendlyButton fullWidth onClick={onContinue}>
        Keep going!
      </BigFriendlyButton>
    </article>
  );
};
