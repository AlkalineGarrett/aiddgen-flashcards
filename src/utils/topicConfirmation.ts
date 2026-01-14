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

