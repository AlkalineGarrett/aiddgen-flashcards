import { Card } from '../types/card';
import { getDueCards, sortCardsByPriority, isCardDue } from './fsrs';
import { getCardStatus } from './cardStatus';

export interface ReviewQueueConfig {
  maxNewCardsPerDay: number;
  newCardsStudiedToday: number;
  lastStudyDate: number; // timestamp of last study date (start of day)
}

export interface ReviewQueue {
  newCards: Card[];
  reviewCards: Card[];
  allCards: Card[];
}

const DEFAULT_CONFIG: ReviewQueueConfig = {
  maxNewCardsPerDay: 20,
  newCardsStudiedToday: 0,
  lastStudyDate: 0,
};

const STORAGE_KEY = 'review-queue-config';

/**
 * Load review queue configuration from localStorage
 */
export function loadQueueConfig(): ReviewQueueConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Reset daily count if it's a new day
      const today = getStartOfDay(Date.now());
      if (config.lastStudyDate !== today) {
        return {
          ...DEFAULT_CONFIG,
          maxNewCardsPerDay: config.maxNewCardsPerDay || DEFAULT_CONFIG.maxNewCardsPerDay,
          lastStudyDate: today,
          newCardsStudiedToday: 0,
        };
      }
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('Failed to load queue config:', error);
  }
  return { ...DEFAULT_CONFIG, lastStudyDate: getStartOfDay(Date.now()) };
}

/**
 * Save review queue configuration to localStorage
 */
export function saveQueueConfig(config: ReviewQueueConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save queue config:', error);
  }
}

/**
 * Get start of day timestamp
 */
function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Build review queue from card collection
 */
export function buildReviewQueue(
  cards: Card[],
  config: ReviewQueueConfig = loadQueueConfig(),
  now: number = Date.now()
): ReviewQueue {
  // Get all due cards
  const dueCards = getDueCards(cards, now);
  
  // Separate new cards (reviewCount === 0) from review cards
  const newCards: Card[] = [];
  const reviewCards: Card[] = [];
  
  dueCards.forEach((card) => {
    if (card.state.reviewCount === 0) {
      newCards.push(card);
    } else {
      reviewCards.push(card);
    }
  });
  
  // Sort both by priority
  const sortedNewCards = sortCardsByPriority(newCards, now);
  const sortedReviewCards = sortCardsByPriority(reviewCards, now);
  
  // Apply daily new card limit
  const remainingNewCardSlots = Math.max(0, config.maxNewCardsPerDay - config.newCardsStudiedToday);
  const limitedNewCards = sortedNewCards.slice(0, remainingNewCardSlots);
  
  // Mix cards: prioritize overdue review cards, then new cards, then upcoming review cards
  const allCards: Card[] = [];
  
  // First: overdue review cards (highest priority)
  const overdueReviewCards = sortedReviewCards.filter((card) => {
    const daysUntilDue = Math.round((card.state.dueDate - now) / (24 * 60 * 60 * 1000));
    return daysUntilDue < 0;
  });
  allCards.push(...overdueReviewCards);
  
  // Second: new cards (up to daily limit)
  allCards.push(...limitedNewCards);
  
  // Third: due but not overdue review cards
  const dueReviewCards = sortedReviewCards.filter((card) => {
    const daysUntilDue = Math.round((card.state.dueDate - now) / (24 * 60 * 60 * 1000));
    return daysUntilDue >= 0;
  });
  allCards.push(...dueReviewCards);
  
  return {
    newCards: limitedNewCards,
    reviewCards: sortedReviewCards,
    allCards,
  };
}

/**
 * Increment new cards studied today
 */
export function incrementNewCardsStudied(): void {
  const config = loadQueueConfig();
  const today = getStartOfDay(Date.now());
  
  // Reset if new day
  if (config.lastStudyDate !== today) {
    config.newCardsStudiedToday = 0;
    config.lastStudyDate = today;
  }
  
  config.newCardsStudiedToday += 1;
  saveQueueConfig(config);
}

/**
 * Update queue config with new daily limit
 */
export function updateMaxNewCardsPerDay(maxNewCards: number): void {
  const config = loadQueueConfig();
  config.maxNewCardsPerDay = maxNewCards;
  saveQueueConfig(config);
}

/**
 * Get current queue statistics
 */
export function getQueueStats(
  queue: ReviewQueue,
  config: ReviewQueueConfig
): {
  totalDue: number;
  newCardsAvailable: number;
  newCardsInQueue: number;
  reviewCardsInQueue: number;
  remainingNewCardSlots: number;
} {
  return {
    totalDue: queue.allCards.length,
    newCardsAvailable: queue.newCards.length + (config.maxNewCardsPerDay - config.newCardsStudiedToday),
    newCardsInQueue: queue.newCards.length,
    reviewCardsInQueue: queue.reviewCards.length,
    remainingNewCardSlots: Math.max(0, config.maxNewCardsPerDay - config.newCardsStudiedToday),
  };
}

