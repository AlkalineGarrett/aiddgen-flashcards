import { Card } from '../types/card';
import { getCardStatus, getStatusColor, getStatusLabel } from '../utils/cardStatus';
import { isCardDue, getDaysUntilDue } from '../utils/fsrs';
import { formatDate, getDaysSinceCardCreated, getDaysSinceLastReview } from '../utils/cardUtils';
import './components.css';

interface CardDetailProps {
  card: Card;
  onBack: () => void;
  onReset: () => void;
}

export function CardDetail({ card, onBack, onReset }: CardDetailProps) {
  const now = Date.now();
  const status = getCardStatus(card, now);
  const statusColor = getStatusColor(status);
  const isDue = isCardDue(card, now);
  const daysUntilDue = getDaysUntilDue(card, now);
  const daysSinceCreated = getDaysSinceCardCreated(card, now);
  const daysSinceLastReview = getDaysSinceLastReview(card, now);

  return (
    <div className="card-detail-container">
      <button
        onClick={onBack}
        className="card-detail-back-button"
      >
        ← Back to List
      </button>

      <div className="card-detail-card">
        <div className="card-detail-header">
          <div className="card-detail-header-row">
            <h3 className="card-detail-title">Card Details</h3>
            <span
              className="card-detail-status-badge"
              style={{ '--status-color': statusColor } as React.CSSProperties}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          {card.tags && card.tags.length > 0 && (
            <div className="card-detail-tags">
              {card.tags.map((tag) => (
                <span key={tag} className="card-detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card-detail-content">
          <div className="card-detail-label">Front:</div>
          <div className="card-detail-side">
            {card.front}
          </div>
          <div className="card-detail-label">Back:</div>
          <div className="card-detail-side">
            {card.back}
          </div>
        </div>

        <div className="card-detail-state">
          <h4 className="card-detail-state-title">Card State</h4>
          <div className="card-detail-state-grid">
            <div>
              <strong>Review Count:</strong> {card.state.reviewCount}
            </div>
            <div>
              <strong>Difficulty:</strong> {card.state.difficulty.toFixed(2)}
            </div>
            <div>
              <strong>Stability:</strong> {card.state.stability.toFixed(2)} days
            </div>
            <div>
              <strong>Ease Factor:</strong> {card.state.easeFactor.toFixed(2)}
            </div>
            <div>
              <strong>Created:</strong> {formatDate(card.createdAt)} ({daysSinceCreated} days ago)
            </div>
            {daysSinceLastReview !== null && (
              <div>
                <strong>Last Review:</strong> {formatDate(card.state.lastReview)} ({daysSinceLastReview} days ago)
              </div>
            )}
            <div>
              <strong>Next Review:</strong> {formatDate(card.state.dueDate)}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              {isDue ? (
                <span className="card-detail-due-warning">
                  Due {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago
                </span>
              ) : (
                <span>
                  Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card-detail-actions">
          <button
            onClick={onReset}
            className="card-detail-reset-button"
          >
            Reset Card State
          </button>
          <div className="card-detail-reset-help">
            This will reset the card to its initial state (new card).
          </div>
        </div>
      </div>
    </div>
  );
}

