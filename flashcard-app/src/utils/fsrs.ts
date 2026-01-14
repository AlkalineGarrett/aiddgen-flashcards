import { Card, CardState, ReviewQuality, ReviewResult } from '../types/card';

// FSRS algorithm constants
const MIN_DIFFICULTY = 0.1;
const MAX_DIFFICULTY = 0.9;
const MIN_STABILITY = 0.4;
const INITIAL_STABILITY = 2.4;
const INITIAL_DIFFICULTY = 0.3;
const INITIAL_EASE_FACTOR = 2.5;

/**
 * Create initial card state for a new card
 */
export function createInitialCardState(): CardState {
  const now = Date.now();
  return {
    difficulty: INITIAL_DIFFICULTY,
    stability: INITIAL_STABILITY,
    lastReview: now,
    dueDate: now,
    reviewCount: 0,
    easeFactor: INITIAL_EASE_FACTOR,
  };
}

/**
 * Calculate new difficulty based on quality rating
 */
function calculateDifficulty(
  currentDifficulty: number,
  quality: ReviewQuality
): number {
  // Quality 0-1: increase difficulty, 2-3: maintain, 4-5: decrease
  let newDifficulty = currentDifficulty;
  
  if (quality <= 1) {
    // Forgot or hard - increase difficulty
    newDifficulty = currentDifficulty + (2 - quality) * 0.15;
  } else if (quality >= 4) {
    // Easy or perfect - decrease difficulty
    newDifficulty = currentDifficulty - (quality - 3) * 0.1;
  }
  
  // Clamp between min and max
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, newDifficulty));
}

/**
 * Calculate new stability based on quality, current stability, and difficulty
 */
function calculateStability(
  currentStability: number,
  difficulty: number,
  quality: ReviewQuality,
  reviewCount: number
): number {
  if (reviewCount === 0) {
    // First review
    if (quality >= 3) {
      return INITIAL_STABILITY * (1 + (quality - 3) * 0.2);
    } else {
      return MIN_STABILITY;
    }
  }
  
  // Subsequent reviews
  let newStability = currentStability;
  
  if (quality >= 3) {
    // Remembered - increase stability
    const factor = 1 + (quality - 3) * 0.15;
    newStability = currentStability * factor * (1 + (1 - difficulty));
  } else if (quality === 2) {
    // Hard - slight increase
    newStability = currentStability * 1.2;
  } else {
    // Forgot - reset to minimum
    newStability = MIN_STABILITY;
  }
  
  return Math.max(MIN_STABILITY, newStability);
}

/**
 * Calculate next review interval in days
 */
function calculateInterval(stability: number, difficulty: number): number {
  // Base interval on stability, adjusted by difficulty
  const baseInterval = stability;
  const adjustedInterval = baseInterval * (1 + difficulty);
  return Math.max(1, Math.round(adjustedInterval));
}

/**
 * Update card state after a review
 */
export function updateCardState(
  card: Card,
  quality: ReviewQuality,
  reviewedAt: number = Date.now()
): ReviewResult {
  const { state } = card;
  const newDifficulty = calculateDifficulty(state.difficulty, quality);
  const newStability = calculateStability(
    state.stability,
    newDifficulty,
    quality,
    state.reviewCount
  );
  
  const intervalDays = calculateInterval(newStability, newDifficulty);
  const nextReview = reviewedAt + intervalDays * 24 * 60 * 60 * 1000;
  
  const newState: CardState = {
    difficulty: newDifficulty,
    stability: newStability,
    lastReview: reviewedAt,
    dueDate: nextReview,
    reviewCount: state.reviewCount + 1,
    easeFactor: state.easeFactor, // Keep ease factor for now
  };
  
  return {
    card: {
      ...card,
      state: newState,
    },
    quality,
    reviewedAt,
    nextReview,
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: Card, now: number = Date.now()): boolean {
  return card.state.dueDate <= now;
}

/**
 * Get days until card is due (negative if overdue)
 */
export function getDaysUntilDue(card: Card, now: number = Date.now()): number {
  const diffMs = card.state.dueDate - now;
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Calculate priority score for sorting (higher = more urgent)
 */
export function getCardPriority(card: Card, now: number = Date.now()): number {
  if (!isCardDue(card, now)) {
    // Not due yet - lower priority
    return -getDaysUntilDue(card, now);
  }
  
  // Due or overdue - higher priority
  const daysOverdue = -getDaysUntilDue(card, now);
  const stabilityFactor = 1 / (card.state.stability + 1);
  return daysOverdue * 100 + stabilityFactor * 10;
}

/**
 * Sort cards by priority (most urgent first)
 */
export function sortCardsByPriority(
  cards: Card[],
  now: number = Date.now()
): Card[] {
  return [...cards].sort((a, b) => {
    const priorityA = getCardPriority(a, now);
    const priorityB = getCardPriority(b, now);
    return priorityB - priorityA; // Higher priority first
  });
}

/**
 * Get cards that are due for review
 */
export function getDueCards(
  cards: Card[],
  now: number = Date.now()
): Card[] {
  return cards.filter((card) => isCardDue(card, now));
}

