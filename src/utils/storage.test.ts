import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveCards,
  loadCards,
  clearStorage,
  clearDeck,
  getAllDeckIds,
  getAllCards,
  isStorageAvailable,
  getStorageSize,
} from './storage';
import { Card } from '../types/card';
import { createInitialCardState } from './fsrs';
import { STORAGE_KEY, CURRENT_SCHEMA_VERSION } from '../types/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Test helper to create a test card
function createTestCard(
  id: string,
  front: string,
  back: string,
  overrides?: Partial<Card['state']>
): Card {
  const state = createInitialCardState();
  return {
    id,
    front,
    back,
    state: { ...state, ...overrides },
    createdAt: Date.now(),
  };
}

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Mock global localStorage for Node.js environment
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('saveCards', () => {
    it('should save cards for a specific deck', () => {
      // given: deck ID and cards array
      // should: save to localStorage with correct structure
      const deckId = 'aiddgen';
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
      ];
      
      saveCards(deckId, cards);
      
      const stored = localStorageMock.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(parsed.decks[deckId]).toHaveLength(2);
      expect(parsed.decks[deckId][0].id).toBe('1');
      expect(parsed.decks[deckId][1].id).toBe('2');
    });

    it('should preserve existing decks when saving', () => {
      // given: existing deck data
      // should: preserve other decks when saving new one
      const existingData = {
        version: CURRENT_SCHEMA_VERSION,
        decks: {
          deck1: [createTestCard('1', 'Q1', 'A1')],
        },
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      const newCards = [createTestCard('2', 'Q2', 'A2')];
      saveCards('deck2', newCards);
      
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.decks.deck1).toHaveLength(1);
      expect(stored.decks.deck2).toHaveLength(1);
    });

    it('should update existing deck when saving to same deck ID', () => {
      // given: existing deck with cards
      // should: replace with new cards
      const deckId = 'aiddgen';
      const initialCards = [createTestCard('1', 'Q1', 'A1')];
      saveCards(deckId, initialCards);
      
      const newCards = [createTestCard('2', 'Q2', 'A2'), createTestCard('3', 'Q3', 'A3')];
      saveCards(deckId, newCards);
      
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.decks[deckId]).toHaveLength(2);
      expect(stored.decks[deckId][0].id).toBe('2');
    });
  });

  describe('loadCards', () => {
    it('should load cards for a specific deck', () => {
      // given: saved cards for a deck
      // should: load and return cards
      const deckId = 'aiddgen';
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
      ];
      saveCards(deckId, cards);
      
      const loaded = loadCards(deckId);
      
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('1');
      expect(loaded[1].id).toBe('2');
    });

    it('should return empty array for non-existent deck', () => {
      // given: deck ID that doesn't exist
      // should: return empty array
      const loaded = loadCards('nonexistent');
      expect(loaded).toEqual([]);
    });

    it('should filter out invalid cards', () => {
      // given: deck with invalid card data
      // should: return only valid cards
      const deckId = 'aiddgen';
      const invalidData = {
        version: CURRENT_SCHEMA_VERSION,
        decks: {
          [deckId]: [
            createTestCard('1', 'Q1', 'A1'), // valid
            { id: '2', front: 'Q2' }, // missing back and state
            { id: '3', front: 'Q3', back: 'A3' }, // missing state
            createTestCard('4', 'Q4', 'A4'), // valid
            { id: '5', front: 'Q5', back: 'A5', state: { difficulty: 'not-a-number' } }, // invalid state
          ],
        },
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidData));
      
      const loaded = loadCards(deckId);
      
      expect(loaded).toHaveLength(2);
      expect(loaded.map(c => c.id)).toEqual(['1', '4']);
    });

    it('should validate card state fields', () => {
      // given: cards with missing state fields
      // should: filter them out
      const deckId = 'aiddgen';
      const invalidData = {
        version: CURRENT_SCHEMA_VERSION,
        decks: {
          [deckId]: [
            createTestCard('1', 'Q1', 'A1'), // valid
            {
              id: '2',
              front: 'Q2',
              back: 'A2',
              state: {
                difficulty: 0.5,
                // missing stability, dueDate, lastReview
              },
              createdAt: Date.now(),
            },
          ],
        },
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidData));
      
      const loaded = loadCards(deckId);
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
    });
  });

  describe('clearStorage', () => {
    it('should clear all stored data', () => {
      // given: stored data in localStorage
      // should: remove it
      const deckId = 'aiddgen';
      const cards = [createTestCard('1', 'Q1', 'A1')];
      saveCards(deckId, cards);
      
      expect(localStorageMock.getItem(STORAGE_KEY)).not.toBeNull();
      
      clearStorage();
      
      expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('clearDeck', () => {
    it('should clear cards for a specific deck', () => {
      // given: multiple decks
      // should: clear only specified deck
      saveCards('deck1', [createTestCard('1', 'Q1', 'A1')]);
      saveCards('deck2', [createTestCard('2', 'Q2', 'A2')]);
      
      clearDeck('deck1');
      
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.decks.deck1).toBeUndefined();
      expect(stored.decks.deck2).toHaveLength(1);
    });

    it('should handle clearing non-existent deck gracefully', () => {
      // given: deck that doesn't exist
      // should: not throw error
      saveCards('deck1', [createTestCard('1', 'Q1', 'A1')]);
      
      clearDeck('nonexistent');
      
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.decks.deck1).toHaveLength(1);
    });
  });

  describe('getAllDeckIds', () => {
    it('should return all deck IDs that have cards', () => {
      // given: multiple decks with cards
      // should: return all deck IDs
      saveCards('deck1', [createTestCard('1', 'Q1', 'A1')]);
      saveCards('deck2', [createTestCard('2', 'Q2', 'A2')]);
      saveCards('deck3', [createTestCard('3', 'Q3', 'A3')]);
      
      const deckIds = getAllDeckIds();
      
      expect(deckIds).toHaveLength(3);
      expect(deckIds).toContain('deck1');
      expect(deckIds).toContain('deck2');
      expect(deckIds).toContain('deck3');
    });

    it('should exclude empty decks', () => {
      // given: decks including one with empty array
      // should: exclude empty deck
      saveCards('deck1', [createTestCard('1', 'Q1', 'A1')]);
      saveCards('deck2', []); // empty deck
      
      const deckIds = getAllDeckIds();
      
      expect(deckIds).toHaveLength(1);
      expect(deckIds).toContain('deck1');
      expect(deckIds).not.toContain('deck2');
    });

    it('should return empty array when no decks exist', () => {
      // given: no stored data
      // should: return empty array
      const deckIds = getAllDeckIds();
      expect(deckIds).toEqual([]);
    });
  });

  describe('getAllCards', () => {
    it('should return all cards across all decks', () => {
      // given: multiple decks with cards
      // should: return all cards
      saveCards('deck1', [createTestCard('1', 'Q1', 'A1')]);
      saveCards('deck2', [createTestCard('2', 'Q2', 'A2'), createTestCard('3', 'Q3', 'A3')]);
      
      const allCards = getAllCards();
      
      expect(allCards).toHaveLength(3);
      expect(allCards.map(c => c.id)).toEqual(['1', '2', '3']);
    });

    it('should return empty array when no cards exist', () => {
      // given: no stored data
      // should: return empty array
      const allCards = getAllCards();
      expect(allCards).toEqual([]);
    });
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      // given: working localStorage
      // should: return true
      const available = isStorageAvailable();
      expect(available).toBe(true);
    });
  });

  describe('getStorageSize', () => {
    it('should return size of stored JSON string', () => {
      // given: stored cards
      // should: return JSON string length
      const cards = [createTestCard('1', 'Q1', 'A1')];
      saveCards('deck1', cards);
      
      const size = getStorageSize();
      
      expect(size).toBeGreaterThan(0);
      const stored = localStorageMock.getItem(STORAGE_KEY)!;
      expect(size).toBe(stored.length);
    });

    it('should return 0 when no data is stored', () => {
      // given: no stored data
      // should: return 0
      const size = getStorageSize();
      expect(size).toBe(0);
    });
  });

  describe('schema migration', () => {
    it('should migrate from version 0 (array format) to version 2', () => {
      // given: old format with array of cards
      // should: migrate to version 2 with decks structure when loading
      const oldData = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
      ];
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(oldData));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('1');
      expect(loaded[1].id).toBe('2');
      
      // Migration happens in memory - save to persist it
      saveCards('aiddgen', loaded);
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(stored.decks.aiddgen).toHaveLength(2);
    });

    it('should migrate from version 1 (cards array) to version 2', () => {
      // given: version 1 format with cards array
      // should: migrate to version 2 with decks structure when loading
      const version1Data = {
        version: 1,
        cards: [
          createTestCard('1', 'Q1', 'A1'),
          createTestCard('2', 'Q2', 'A2'),
        ],
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(version1Data));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toHaveLength(2);
      
      // Migration happens in memory - save to persist it
      saveCards('aiddgen', loaded);
      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!);
      expect(stored.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(stored.decks.aiddgen).toHaveLength(2);
    });

    it('should handle version 0 with cards property', () => {
      // given: version 0 format with cards property
      // should: migrate correctly
      const version0Data = {
        cards: [
          createTestCard('1', 'Q1', 'A1'),
        ],
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(version0Data));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toHaveLength(1);
    });

    it('should handle invalid version 0 data gracefully', () => {
      // given: invalid version 0 data
      // should: return empty array
      const invalidData = { invalid: 'data' };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidData));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toEqual([]);
    });

    it('should preserve current version data', () => {
      // given: data already at current version
      // should: not migrate
      const currentData = {
        version: CURRENT_SCHEMA_VERSION,
        decks: {
          aiddgen: [createTestCard('1', 'Q1', 'A1')],
        },
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(currentData));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
    });

    it('should handle missing decks structure in current version', () => {
      // given: current version but missing decks
      // should: create empty decks structure
      const invalidCurrentData = {
        version: CURRENT_SCHEMA_VERSION,
        lastSaved: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidCurrentData));
      
      const loaded = loadCards('aiddgen');
      
      expect(loaded).toEqual([]);
    });
  });
});

