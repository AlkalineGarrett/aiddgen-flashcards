import { useState, useEffect, useCallback } from 'react';
import { Card } from '../types/card';
import { loadCards, saveCards } from './storage';

/**
 * React hook for managing cards in localStorage
 */
export function useCardStorage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cards on mount
  useEffect(() => {
    const loaded = loadCards();
    setCards(loaded);
    setIsLoading(false);
  }, []);

  // Save cards whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveCards(cards);
    }
  }, [cards, isLoading]);

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

