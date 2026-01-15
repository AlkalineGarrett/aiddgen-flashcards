import { Card } from '../types/card';
import {
  StorageSchema,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../types/storage';

/**
 * Save cards for a specific deck to localStorage
 */
export function saveCards(deckId: string, cards: Card[]): void {
  try {
    const existingData = loadAllDecks();
    const data: StorageSchema = {
      version: CURRENT_SCHEMA_VERSION,
      decks: {
        ...existingData.decks,
        [deckId]: cards,
      },
      lastSaved: Date.now(),
    };
    
    const json = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save cards to localStorage:', error);
    // Silently fail for PoC - in production would show user notification
  }
}

/**
 * Load cards for a specific deck from localStorage
 */
export function loadCards(deckId: string): Card[] {
  try {
    const data = loadAllDecks();
    
    // Get cards for the specified deck
    const deckCards = data.decks[deckId] || [];
    
    // Validate each card has required fields
    const validCards = deckCards.filter((card) => {
      return (
        card &&
        typeof card.id === 'string' &&
        typeof card.front === 'string' &&
        typeof card.back === 'string' &&
        card.state &&
        typeof card.state.difficulty === 'number' &&
        typeof card.state.stability === 'number' &&
        typeof card.state.dueDate === 'number' &&
        typeof card.state.lastReview === 'number'
      );
    });
    
    return validCards;
  } catch (error) {
    console.error('Failed to load cards from localStorage:', error);
    // Return empty array on error - graceful fallback
    return [];
  }
}

/**
 * Load all decks data from localStorage (internal use)
 */
function loadAllDecks(): StorageSchema {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    
    if (!json) {
      return {
        version: CURRENT_SCHEMA_VERSION,
        decks: {},
        lastSaved: Date.now(),
      };
    }
    
    const data = JSON.parse(json) as any;
    const originalVersion = data.version || 0;
    
    // Handle schema migration
    const migratedData = migrateSchema(data);
    
    // If migration occurred, persist the migrated data
    if (originalVersion < CURRENT_SCHEMA_VERSION) {
      try {
        const migratedJson = JSON.stringify(migratedData);
        localStorage.setItem(STORAGE_KEY, migratedJson);
      } catch (saveError) {
        console.error('Failed to persist migrated schema:', saveError);
        // Continue with migrated data in memory even if save fails
      }
    }
    
    return migratedData;
  } catch (error) {
    console.error('Failed to load decks from localStorage:', error);
    // Return empty structure on error
    return {
      version: CURRENT_SCHEMA_VERSION,
      decks: {},
      lastSaved: Date.now(),
    };
  }
}

/**
 * Migrate storage schema to current version
 */
function migrateSchema(data: any): StorageSchema {
  const version = data.version || 0;
  
  if (version < CURRENT_SCHEMA_VERSION) {
    // Migrate through versions
    if (version < 1) {
      data = migrateFromVersion0(data);
    }
    if (data.version < 2) {
      data = migrateFromVersion1(data);
    }
  }
  
  // Already current version or migrated
  if (data.version === CURRENT_SCHEMA_VERSION) {
    // Ensure decks structure exists
    if (!data.decks || typeof data.decks !== 'object') {
      return {
        version: CURRENT_SCHEMA_VERSION,
        decks: {},
        lastSaved: data.lastSaved || Date.now(),
      };
    }
    return data as StorageSchema;
  }
  
  // Future version - return as-is (would need proper migration)
  console.warn(`Unknown schema version ${data.version}, attempting to use as-is`);
  return data as StorageSchema;
}

/**
 * Migrate from version 0 (no version field) to version 1
 */
function migrateFromVersion0(data: any): any {
  // If data is just an array of cards (old format)
  if (Array.isArray(data)) {
    return {
      version: 1,
      cards: data,
      lastSaved: Date.now(),
    };
  }
  
  // If data has cards but no version
  if (data.cards && Array.isArray(data.cards)) {
    return {
      version: 1,
      cards: data.cards,
      lastSaved: data.lastSaved || Date.now(),
    };
  }
  
  // Invalid data - return empty
  return {
    version: 1,
    cards: [],
    lastSaved: Date.now(),
  };
}

/**
 * Migrate from version 1 (cards array) to version 2 (decks object)
 */
function migrateFromVersion1(data: any): StorageSchema {
  // Get existing cards (may be in cards array or already migrated)
  const cards: Card[] = Array.isArray(data.cards) ? data.cards : [];
  
  // Assign all existing cards to "aiddgen" deck (backward compatibility)
  return {
    version: CURRENT_SCHEMA_VERSION,
    decks: {
      aiddgen: cards,
    },
    lastSaved: data.lastSaved || Date.now(),
  };
}

/**
 * Clear all stored cards for all decks
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Clear cards for a specific deck
 */
export function clearDeck(deckId: string): void {
  try {
    const data = loadAllDecks();
    const newDecks = { ...data.decks };
    delete newDecks[deckId];
    
    const updatedData: StorageSchema = {
      version: CURRENT_SCHEMA_VERSION,
      decks: newDecks,
      lastSaved: Date.now(),
    };
    
    const json = JSON.stringify(updatedData);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to clear deck from localStorage:', error);
  }
}

/**
 * Get all deck IDs that have cards
 */
export function getAllDeckIds(): string[] {
  try {
    const data = loadAllDecks();
    return Object.keys(data.decks).filter((deckId) => {
      const cards = data.decks[deckId];
      return Array.isArray(cards) && cards.length > 0;
    });
  } catch (error) {
    console.error('Failed to get deck IDs:', error);
    return [];
  }
}

/**
 * Get all cards across all decks (for migration/debugging)
 */
export function getAllCards(): Card[] {
  try {
    const data = loadAllDecks();
    const allCards: Card[] = [];
    Object.values(data.decks).forEach((deckCards) => {
      if (Array.isArray(deckCards)) {
        allCards.push(...deckCards);
      }
    });
    return allCards;
  } catch (error) {
    console.error('Failed to get all cards:', error);
    return [];
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage size estimate (rough)
 */
export function getStorageSize(): number {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? json.length : 0;
  } catch {
    return 0;
  }
}

