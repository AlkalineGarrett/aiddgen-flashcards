import { Card } from '../types/card';
import { getCardStatus, getStatusColor, getStatusLabel } from '../utils/cardStatus';
import { isCardDue, getDaysUntilDue } from '../utils/fsrs';

interface CardListProps {
  cards: Card[];
  onCardSelect: (cardId: string) => void;
}

export function CardList({ cards, onCardSelect }: CardListProps) {
  const now = Date.now();

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        No cards match the current filters.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {cards.map((card) => {
        const status = getCardStatus(card, now);
        const statusColor = getStatusColor(status);
        const isDue = isCardDue(card, now);
        const daysUntilDue = getDaysUntilDue(card, now);

        return (
          <div
            key={card.id}
            onClick={() => onCardSelect(card.id)}
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: isDue ? '#fff3cd' : '#fff',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDue ? '#fff3cd' : '#fff';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
                  {card.front}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  {card.back.substring(0, 100)}
                  {card.back.length > 100 ? '...' : ''}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {card.tags?.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#e9ecef',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', marginLeft: '1rem' }}>
                <span
                  style={{
                    backgroundColor: statusColor,
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                  }}
                >
                  {getStatusLabel(status)}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
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
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
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

