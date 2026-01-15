import { Card } from '../types/card';
import { getCardStatus, getStatusColor, getStatusLabel } from '../utils/cardStatus';
import { isCardDue, getDaysUntilDue } from '../utils/fsrs';
import './components.css';

interface CardListProps {
  cards: Card[];
  onCardSelect: (cardId: string) => void;
}

export function CardList({ cards, onCardSelect }: CardListProps) {
  const now = Date.now();

  if (cards.length === 0) {
    return (
      <div className="card-list-empty">
        No cards match the current filters.
      </div>
    );
  }

  return (
    <div className="card-list-container">
      {cards.map((card) => {
        const status = getCardStatus(card, now);
        const statusColor = getStatusColor(status);
        const isDue = isCardDue(card, now);
        const daysUntilDue = getDaysUntilDue(card, now);

        return (
          <div
            key={card.id}
            onClick={() => onCardSelect(card.id)}
            className={`card-list-item ${isDue ? 'card-list-item-due' : ''}`}
          >
            <div className="card-list-item-content">
              <div className="card-list-item-main">
                <div className="card-list-item-front">
                  {card.front}
                </div>
                <div className="card-list-item-back-preview">
                  {card.back.substring(0, 100)}
                  {card.back.length > 100 ? '...' : ''}
                </div>
                <div className="card-list-item-tags">
                  {card.tags?.map((tag) => (
                    <span key={tag} className="card-list-item-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card-list-item-side">
                <span
                  className="card-list-item-status"
                  style={{ '--status-color': statusColor } as React.CSSProperties}
                >
                  {getStatusLabel(status)}
                </span>
                <div className="card-list-item-meta">
                  {isDue ? (
                    <span className="card-list-item-due-warning">
                      Due {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago
                    </span>
                  ) : (
                    <span>
                      Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="card-list-item-meta">
                  Reviews: {card.state.reviewCount}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

