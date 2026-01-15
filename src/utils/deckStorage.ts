/**
 * Utilities for managing selected deck in localStorage
 */

import { Card } from '../types/card';

const SELECTED_DECK_KEY = 'aiddgen-selected-deck';

export type DeckId = 'aidd' | 'aiddgen' | 'ai';

export interface DeckInfo {
  id: DeckId;
  name: string;
  description: string;
}

export const DECK_INFO: Record<DeckId, DeckInfo> = {
  aidd: {
    id: 'aidd',
    name: 'aidd/',
    description: 'Learn the generated agent rules and commands',
  },
  aiddgen: {
    id: 'aiddgen',
    name: 'aiddgen/',
    description: 'Learn the generator framework and architecture',
  },
  ai: {
    id: 'ai',
    name: 'ai/',
    description: 'Learn the AI assistant system rules and workflows',
  },
};

/**
 * Get the currently selected deck from localStorage
 */
export function getSelectedDeck(): DeckId | null {
  try {
    const deckId = localStorage.getItem(SELECTED_DECK_KEY);
    if (deckId === 'aidd' || deckId === 'aiddgen' || deckId === 'ai') {
      return deckId;
    }
    return null;
  } catch (error) {
    console.error('Failed to get selected deck:', error);
    return null;
  }
}

/**
 * Save the selected deck to localStorage
 */
export function setSelectedDeck(deckId: DeckId): void {
  try {
    localStorage.setItem(SELECTED_DECK_KEY, deckId);
  } catch (error) {
    console.error('Failed to save selected deck:', error);
  }
}

/**
 * Clear the selected deck from localStorage
 */
export function clearSelectedDeck(): void {
  try {
    localStorage.removeItem(SELECTED_DECK_KEY);
  } catch (error) {
    console.error('Failed to clear selected deck:', error);
  }
}

/**
 * Get deck info by ID
 */
export function getDeckInfo(deckId: DeckId): DeckInfo {
  return DECK_INFO[deckId];
}

/**
 * Get all available decks
 */
export function getAllDecks(): DeckInfo[] {
  return Object.values(DECK_INFO);
}

/**
 * Get card count for a deck
 */
export function getDeckCardCount(deckId: DeckId, loadCards: (deckId: string) => Card[]): number {
  const cards = loadCards(deckId);
  return cards.length;
}

/**
 * Get card counts for all decks
 */
export function getDeckCardCounts(loadCards: (deckId: string) => Card[]): Record<DeckId, number> {
  const counts: Record<DeckId, number> = {
    aidd: 0,
    aiddgen: 0,
    ai: 0,
  };

  const decks = getAllDecks();
  decks.forEach((deck) => {
    counts[deck.id] = getDeckCardCount(deck.id, loadCards);
  });

  return counts;
}

