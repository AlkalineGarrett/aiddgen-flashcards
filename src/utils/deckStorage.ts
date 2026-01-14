/**
 * Utilities for managing selected deck in localStorage
 */

const SELECTED_DECK_KEY = 'aiddgen-selected-deck';

export type DeckId = 'aidd' | 'aiddgen';

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
};

/**
 * Get the currently selected deck from localStorage
 */
export function getSelectedDeck(): DeckId | null {
  try {
    const deckId = localStorage.getItem(SELECTED_DECK_KEY);
    if (deckId === 'aidd' || deckId === 'aiddgen') {
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

