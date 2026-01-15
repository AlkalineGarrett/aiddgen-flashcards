import { Card } from '../types/card';
import './components.css';

interface CardDisplayProps {
  card: Card;
  showAnswer: boolean;
  onShowAnswer: () => void;
}

export function CardDisplay({ card, showAnswer, onShowAnswer }: CardDisplayProps) {
  return (
    <div className="card-display-container">
      {card.tags && card.tags.length > 0 && (
        <div className="card-display-tags">
          {card.tags.map((tag) => (
            <span key={tag} className="card-display-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-display-front">
        {card.front}
      </div>

      {showAnswer ? (
        <div className="card-display-answer">
          <div className="card-display-answer-label">Answer:</div>
          <div>{card.back}</div>
        </div>
      ) : (
        <button
          onClick={onShowAnswer}
          className="card-display-show-button"
        >
          Show Answer
        </button>
      )}
    </div>
  );
}

