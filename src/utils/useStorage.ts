import { useState, useEffect, useCallback } from 'react';
import { Card } from '../types/card';
import { loadCards, saveCards } from './storage';
import { DeckId } from './deckStorage';

/**
 * React hook for managing cards in localStorage for a specific deck
 */
export function useCardStorage(deckId: DeckId) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cards on mount or when deckId changes
  useEffect(() => {
    setIsLoading(true);
    const loaded = loadCards(deckId);
    
    // Don't initialize cards by default - users should add them topic by topic after reading
    setCards(loaded);
    setIsLoading(false);
  }, [deckId]);

  // Save cards whenever they change
  useEffect(() => {
    if (!isLoading && cards.length > 0) {
      saveCards(deckId, cards);
    }
  }, [cards, isLoading, deckId]);

  // Update a single card
  const updateCard = useCallback((updatedCard: Card) => {
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  }, []);

  // Add a new card
  const addCard = useCallback((card: Card) => {
    setCards((prev) => [...prev, card]);
  }, []);

  // Remove a card
  const removeCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  }, []);

  // Replace all cards
  const setAllCards = useCallback((newCards: Card[]) => {
    setCards(newCards);
  }, []);

  return {
    cards,
    isLoading,
    updateCard,
    addCard,
    removeCard,
    setAllCards,
  };
}

