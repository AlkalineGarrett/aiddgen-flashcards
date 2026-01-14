import { useEffect, useState } from 'react';
import { DeckId, getAllDecks, setSelectedDeck } from '../utils/deckStorage';
import { loadCards } from '../utils/storage';

interface DeckSelectionProps {
  onDeckSelect: (deckId: DeckId) => void;
}

export function DeckSelection({ onDeckSelect }: DeckSelectionProps) {
  const [cardCounts, setCardCounts] = useState<Record<DeckId, number>>({
    aidd: 0,
    aiddgen: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load card counts for each deck
  useEffect(() => {
    const loadCounts = () => {
      const counts: Record<DeckId, number> = {
        aidd: 0,
        aiddgen: 0,
      };

      const decks = getAllDecks();
      decks.forEach((deck) => {
        const cards = loadCards(deck.id);
        counts[deck.id] = cards.length;
      });

      setCardCounts(counts);
      setIsLoading(false);
    };

    loadCounts();
  }, []);

  const handleDeckSelect = (deckId: DeckId) => {
    setSelectedDeck(deckId);
    onDeckSelect(deckId);
  };

  const decks = getAllDecks();

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Choose a Deck</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Select which deck you'd like to study
      </p>

      {isLoading ? (
        <div>Loading deck information...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          {decks.map((deck) => {
            const count = cardCounts[deck.id];
            return (
              <div
                key={deck.id}
                onClick={() => handleDeckSelect(deck.id)}
                style={{
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#007bff' }}>
                  {deck.name}
                </h2>
                <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  {deck.description}
                </p>
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    color: '#495057',
                  }}
                >
                  {count} {count === 1 ? 'card' : 'cards'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

