import { Card, ReviewQuality } from '../types/card';
import { createInitialCardState, updateCardState } from './fsrs';
import { filterCardsByTopic } from './topicContent';

/**
 * Reset a card's state to initial values
 */
export function resetCardState(card: Card): Card {
  return {
    ...card,
    state: createInitialCardState(),
  };
}

/**
 * Format a timestamp to a localized date/time string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Calculate days since a timestamp
 */
export function getDaysSince(timestamp: number, now: number = Date.now()): number {
  return Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));
}

/**
 * Calculate days since card creation
 */
export function getDaysSinceCardCreated(card: Card, now: number = Date.now()): number {
  return getDaysSince(card.createdAt, now);
}

/**
 * Calculate days since last review (returns null if never reviewed)
 */
export function getDaysSinceLastReview(card: Card, now: number = Date.now()): number | null {
  if (card.state.reviewCount === 0) {
    return null;
  }
  return getDaysSince(card.state.lastReview, now);
}

/**
 * Check if a card is new (never reviewed)
 */
export function isNewCard(card: Card): boolean {
  return card.state.reviewCount === 0;
}

/**
 * Filter cards for quiz mode
 * - Filters by topic if topicId is provided
 * - Filters by incorrect card IDs if filterIncorrectOnly is true
 */
export function filterCardsForQuiz(
  cards: Card[],
  topicId?: string,
  filterIncorrectOnly?: boolean,
  previousIncorrectCardIds?: string[]
): Card[] {
  let filtered = cards;

  // Filter by topic if provided
  if (topicId) {
    filtered = filterCardsByTopic(filtered, topicId);
  }

  // Filter by incorrect card IDs if needed
  if (filterIncorrectOnly && previousIncorrectCardIds && previousIncorrectCardIds.length > 0) {
    const incorrectSet = new Set(previousIncorrectCardIds);
    filtered = filtered.filter((card) => incorrectSet.has(card.id));
  }

  return filtered;
}

/**
 * Result of processing a card review
 */
export interface ReviewProcessResult {
  updatedCard: Card;
  wasNewCard: boolean;
  isCorrect: boolean; // quality >= 3
}

/**
 * Process a card review: update card state and track metadata
 */
export function processCardReview(
  card: Card,
  quality: ReviewQuality,
  reviewedAt: number = Date.now()
): ReviewProcessResult {
  const wasNewCard = isNewCard(card);
  const result = updateCardState(card, quality, reviewedAt);
  const isCorrect = quality >= 3;

  return {
    updatedCard: result.card,
    wasNewCard,
    isCorrect,
  };
}

/**
 * Get next card index after rating
 */
export function getNextCardIndex(
  currentIndex: number,
  totalCards: number,
  quizMode: boolean
): number {
  if (quizMode) {
    // Quiz mode: single chance, move to next card or stay at last
    if (currentIndex < totalCards - 1) {
      return currentIndex + 1;
    }
    // Already at last card, stay there (completion will be handled by parent)
    return currentIndex;
  } else {
    // Normal study mode: loop back to start if finished
    if (currentIndex < totalCards - 1) {
      return currentIndex + 1;
    }
    // Finished all cards, reset to start
    return 0;
  }
}

