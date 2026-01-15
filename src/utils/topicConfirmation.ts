import { Card } from '../types/card';
import { DeckId } from './deckStorage';
import { getTopicById } from './topicContent';

/**
 * Get confirmed topics for a deck from localStorage
 */
export function getConfirmedTopics(deckId: DeckId): Set<string> {
  const stored = localStorage.getItem(`confirmed-topics-${deckId}`);
  if (stored) {
    try {
      const confirmedArray = JSON.parse(stored) as string[];
      return new Set(confirmedArray);
    } catch (e) {
      // Ignore parse errors
    }
  }
  return new Set();
}

/**
 * Save confirmed topics for a deck to localStorage
 */
export function saveConfirmedTopics(deckId: DeckId, confirmedTopics: Set<string>): void {
  localStorage.setItem(
    `confirmed-topics-${deckId}`,
    JSON.stringify(Array.from(confirmedTopics))
  );
}

/**
 * Confirm a topic (mark it as confirmed)
 */
export function confirmTopic(deckId: DeckId, topicId: string): void {
  const confirmed = getConfirmedTopics(deckId);
  confirmed.add(topicId);
  saveConfirmedTopics(deckId, confirmed);
}

/**
 * Check if a topic is confirmed
 */
export function isTopicConfirmed(deckId: DeckId, topicId: string): boolean {
  const confirmed = getConfirmedTopics(deckId);
  return confirmed.has(topicId);
}

/**
 * Get flashcards for a confirmed topic that don't already exist
 */
export function getCardsForTopic(
  deckId: DeckId,
  topicId: string,
  existingCards: Card[]
): Card[] {
  const topic = getTopicById(deckId, topicId, existingCards);
  if (!topic) {
    return [];
  }

  // Filter out cards that already exist
  const existingCardIds = new Set(existingCards.map((c) => c.id));
  return topic.cards.filter((card) => !existingCardIds.has(card.id));
}

/**
 * Get all confirmed topics for a deck
 */
export function getAllConfirmedTopics(deckId: DeckId): string[] {
  const confirmed = getConfirmedTopics(deckId);
  return Array.from(confirmed);
}

/**
 * Clear all state for a deck (cards, read topics, confirmed topics, last read topic)
 */
export function clearAllDeckState(deckId: DeckId): void {
  // Clear confirmed topics
  localStorage.removeItem(`confirmed-topics-${deckId}`);
  
  // Clear read topics
  localStorage.removeItem(`read-topics-${deckId}`);
  
  // Clear last read topic
  localStorage.removeItem(`last-read-topic-${deckId}`);
}

/**
 * Get read topics for a deck from localStorage
 */
export function getReadTopics(deckId: DeckId): Set<string> {
  const stored = localStorage.getItem(`read-topics-${deckId}`);
  if (stored) {
    try {
      const readTopicsArray = JSON.parse(stored) as string[];
      return new Set(readTopicsArray);
    } catch (e) {
      // Ignore parse errors
    }
  }
  return new Set();
}

/**
 * Save read topics for a deck to localStorage
 */
export function saveReadTopics(deckId: DeckId, readTopics: Set<string>): void {
  if (readTopics.size > 0) {
    localStorage.setItem(
      `read-topics-${deckId}`,
      JSON.stringify(Array.from(readTopics))
    );
  }
}

/**
 * Mark a topic as read
 */
export function markTopicAsRead(deckId: DeckId, topicId: string): void {
  const readTopics = getReadTopics(deckId);
  readTopics.add(topicId);
  saveReadTopics(deckId, readTopics);
}

/**
 * Check if a topic is read
 */
export function isTopicRead(deckId: DeckId, topicId: string): boolean {
  const readTopics = getReadTopics(deckId);
  return readTopics.has(topicId);
}

/**
 * Get the last read topic ID for a deck
 */
export function getLastReadTopic(deckId: DeckId): string | null {
  return localStorage.getItem(`last-read-topic-${deckId}`);
}

/**
 * Set the last read topic ID for a deck
 */
export function setLastReadTopic(deckId: DeckId, topicId: string): void {
  localStorage.setItem(`last-read-topic-${deckId}`, topicId);
}

