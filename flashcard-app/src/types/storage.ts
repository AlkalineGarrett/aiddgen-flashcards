import { Card } from './card';

export interface StorageSchema {
  version: number;
  cards: Card[];
  lastSaved: number;
}

export const STORAGE_KEY = 'aiddgen-flashcards';
export const CURRENT_SCHEMA_VERSION = 1;

