import { Card } from './card';

export interface StorageSchema {
  version: number;
  decks: { [deckId: string]: Card[] };
  lastSaved: number;
}

export const STORAGE_KEY = 'aiddgen-flashcards';
export const CURRENT_SCHEMA_VERSION = 2;

