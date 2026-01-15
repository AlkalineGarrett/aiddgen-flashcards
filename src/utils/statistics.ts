import { Card } from '../types/card';
import { isCardDue, getDueCards } from './fsrs';
import { getCardStatus } from './cardStatus';

export interface CollectionStatistics {
  totalCards: number;
  dueCount: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  masteredCount: number;
  averageStability: number;
  averageDifficulty: number;
  totalReviews: number;
  retentionRate: number; // percentage of cards not forgotten (stability > 0.4)
}

/**
 * Calculate collection statistics
 * 
 * Note: This function operates on the provided cards array without filtering by deck.
 * Deck filtering should be done at the caller level before passing cards to this function.
 * This design keeps the function pure and allows it to work with any subset of cards.
 * 
 * @param cards - Array of cards to calculate statistics for (should be pre-filtered by deck if needed)
 * @param now - Current timestamp for due date calculations
 * @returns Collection statistics for the provided cards
 */
export function calculateStatistics(
  cards: Card[],
  now: number = Date.now()
): CollectionStatistics {
  if (cards.length === 0) {
    return {
      totalCards: 0,
      dueCount: 0,
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      masteredCount: 0,
      averageStability: 0,
      averageDifficulty: 0,
      totalReviews: 0,
      retentionRate: 0,
    };
  }

  const dueCards = getDueCards(cards, now);
  const statusCounts = {
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  };

  let totalStability = 0;
  let totalDifficulty = 0;
  let totalReviews = 0;
  let retainedCards = 0;

  cards.forEach((card) => {
    const status = getCardStatus(card, now);
    statusCounts[status]++;
    
    totalStability += card.state.stability;
    totalDifficulty += card.state.difficulty;
    totalReviews += card.state.reviewCount;
    
    // Retention: cards with stability > 0.4 (not forgotten)
    if (card.state.stability > 0.4) {
      retainedCards++;
    }
  });

  return {
    totalCards: cards.length,
    dueCount: dueCards.length,
    newCount: statusCounts.new,
    learningCount: statusCounts.learning,
    reviewCount: statusCounts.review,
    masteredCount: statusCounts.mastered,
    averageStability: totalStability / cards.length,
    averageDifficulty: totalDifficulty / cards.length,
    totalReviews,
    retentionRate: (retainedCards / cards.length) * 100,
  };
}

