import { Card } from '../types/card';

interface CardDisplayProps {
  card: Card;
  showAnswer: boolean;
  onShowAnswer: () => void;
}

export function CardDisplay({ card, showAnswer, onShowAnswer }: CardDisplayProps) {
  return (
    <div
      style={{
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '2rem',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        {card.tags && card.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {card.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#e0e0e0',
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

      <div style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>
        {card.front}
      </div>

      {showAnswer ? (
        <div
          style={{
            borderTop: '1px solid #ccc',
            paddingTop: '1.5rem',
            marginTop: '1.5rem',
            fontSize: '1.1rem',
            color: '#333',
          }}
        >
          <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Answer:</div>
          <div>{card.back}</div>
        </div>
      ) : (
        <button
          onClick={onShowAnswer}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Show Answer
        </button>
      )}
    </div>
  );
}

