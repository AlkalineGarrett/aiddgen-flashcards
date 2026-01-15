import { useEffect, useState } from 'react';
import { DeckId, getAllDecks, setSelectedDeck, getDeckCardCounts } from '../utils/deckStorage';
import { loadCards } from '../utils/storage';
import './components.css';

interface DeckSelectionProps {
  onDeckSelect: (deckId: DeckId) => void;
}

export function DeckSelection({ onDeckSelect }: DeckSelectionProps) {
  const [cardCounts, setCardCounts] = useState<Record<DeckId, number>>({
    aidd: 0,
    aiddgen: 0,
    ai: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load card counts for each deck
  useEffect(() => {
    const counts = getDeckCardCounts(loadCards);
    setCardCounts(counts);
    setIsLoading(false);
  }, []);

  const handleDeckSelect = (deckId: DeckId) => {
    setSelectedDeck(deckId);
    onDeckSelect(deckId);
  };

  const decks = getAllDecks();

  return (
    <div className="deck-selection-container">
      <h1 className="deck-selection-title">Choose a Deck</h1>
      <p className="deck-selection-subtitle">
        Select which deck you'd like to study
      </p>

      {isLoading ? (
        <div>Loading deck information...</div>
      ) : (
        <div className="deck-selection-grid">
          {decks.map((deck) => {
            const count = cardCounts[deck.id];
            return (
              <div
                key={deck.id}
                onClick={() => handleDeckSelect(deck.id)}
                className="deck-selection-card"
              >
                <h2 className="deck-selection-card-title">
                  {deck.name}
                </h2>
                <p className="deck-selection-card-description">
                  {deck.description}
                </p>
                <div className="deck-selection-card-count">
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

