import { Card } from '../types/card';
import { getCardStatus, getStatusColor, getStatusLabel } from '../utils/cardStatus';
import { isCardDue, getDaysUntilDue } from '../utils/fsrs';

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

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const daysSinceCreated = Math.floor((now - card.createdAt) / (24 * 60 * 60 * 1000));
  const daysSinceLastReview = card.state.reviewCount > 0
    ? Math.floor((now - card.state.lastReview) / (24 * 60 * 60 * 1000))
    : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ← Back to List
      </button>

      <div
        style={{
          border: '2px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Card Details</h3>
            <span
              style={{
                backgroundColor: statusColor,
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              {getStatusLabel(status)}
            </span>
          </div>

          {card.tags && card.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#e9ecef',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Front:</div>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', marginBottom: '1rem' }}>
            {card.front}
          </div>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Back:</div>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
            {card.back}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #ddd',
            paddingTop: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Card State</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
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
                <span style={{ color: '#dc3545', fontWeight: '500' }}>
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

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #ddd' }}>
          <button
            onClick={onReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Reset Card State
          </button>
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            This will reset the card to its initial state (new card).
          </div>
        </div>
      </div>
    </div>
  );
}

