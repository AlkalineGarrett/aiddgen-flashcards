import { Card } from '../types/card';
import {
  StorageSchema,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../types/storage';

/**
 * Save cards to localStorage
 */
export function saveCards(cards: Card[]): void {
  try {
    const data: StorageSchema = {
      version: CURRENT_SCHEMA_VERSION,
      cards,
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
 * Load cards from localStorage
 */
export function loadCards(): Card[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    
    if (!json) {
      return [];
    }
    
    const data = JSON.parse(json) as StorageSchema;
    
    // Handle schema migration
    const migratedData = migrateSchema(data);
    
    // Validate cards structure
    if (!Array.isArray(migratedData.cards)) {
      console.warn('Invalid cards data, returning empty array');
      return [];
    }
    
    // Validate each card has required fields
    const validCards = migratedData.cards.filter((card) => {
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
 * Migrate storage schema to current version
 */
function migrateSchema(data: any): StorageSchema {
  // If no version, assume version 0 (initial schema)
  if (!data.version || data.version < CURRENT_SCHEMA_VERSION) {
    return migrateFromVersion0(data);
  }
  
  // Already current version
  if (data.version === CURRENT_SCHEMA_VERSION) {
    return data as StorageSchema;
  }
  
  // Future version - return as-is (would need proper migration)
  console.warn(`Unknown schema version ${data.version}, attempting to use as-is`);
  return data as StorageSchema;
}

/**
 * Migrate from version 0 (no version field) to version 1
 */
function migrateFromVersion0(data: any): StorageSchema {
  // If data is just an array of cards (old format)
  if (Array.isArray(data)) {
    return {
      version: CURRENT_SCHEMA_VERSION,
      cards: data,
      lastSaved: Date.now(),
    };
  }
  
  // If data has cards but no version
  if (data.cards && Array.isArray(data.cards)) {
    return {
      version: CURRENT_SCHEMA_VERSION,
      cards: data.cards,
      lastSaved: data.lastSaved || Date.now(),
    };
  }
  
  // Invalid data - return empty
  return {
    version: CURRENT_SCHEMA_VERSION,
    cards: [],
    lastSaved: Date.now(),
  };
}

/**
 * Clear all stored cards
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
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

