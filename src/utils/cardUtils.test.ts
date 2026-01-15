import { describe, it, expect, vi } from 'vitest';
import {
  resetCardState,
  formatDate,
  getDaysSince,
  getDaysSinceCardCreated,
  getDaysSinceLastReview,
  isNewCard,
  filterCardsForQuiz,
  processCardReview,
  getNextCardIndex,
} from './cardUtils';
import { Card } from '../types/card';
import { createInitialCardState, updateCardState } from './fsrs';

// Test helper to create a test card
function createTestCard(
  id: string,
  front: string,
  back: string,
  overrides?: Partial<Card['state']>
): Card {
  const state = createInitialCardState();
  return {
    id,
    front,
    back,
    state: { ...state, ...overrides },
    createdAt: Date.now(),
  };
}

describe('cardUtils', () => {
  describe('resetCardState', () => {
    it('should reset card state to initial values', () => {
      // given: a card with modified state
      // should: reset to initial state values
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 5,
        stability: 20,
        difficulty: 0.8,
      });
      
      const reset = resetCardState(card);
      
      expect(reset.id).toBe(card.id);
      expect(reset.front).toBe(card.front);
      expect(reset.back).toBe(card.back);
      expect(reset.state.reviewCount).toBe(0);
      expect(reset.state.difficulty).toBe(0.3);
      expect(reset.state.stability).toBe(2.4);
    });
  });

  describe('formatDate', () => {
    it('should format timestamp to localized date string', () => {
      // given: a timestamp
      // should: return localized date string
      const timestamp = 1609459200000; // 2021-01-01 00:00:00 UTC
      const formatted = formatDate(timestamp);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format current timestamp', () => {
      // given: current timestamp
      // should: return valid date string
      const now = Date.now();
      const formatted = formatDate(now);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('getDaysSince', () => {
    it('should calculate days since timestamp correctly', () => {
      // given: a timestamp 2 days ago
      // should: return 2
      const now = Date.now();
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
      const days = getDaysSince(twoDaysAgo, now);
      
      expect(days).toBe(2);
    });

    it('should return 0 for timestamp less than a day ago', () => {
      // given: a timestamp 12 hours ago
      // should: return 0
      const now = Date.now();
      const twelveHoursAgo = now - 12 * 60 * 60 * 1000;
      const days = getDaysSince(twelveHoursAgo, now);
      
      expect(days).toBe(0);
    });

    it('should return negative value for future timestamp', () => {
      // given: a timestamp in the future
      // should: return negative days
      const now = Date.now();
      const tomorrow = now + 24 * 60 * 60 * 1000;
      const days = getDaysSince(tomorrow, now);
      
      expect(days).toBe(-1);
    });

    it('should use current time as default', () => {
      // given: a timestamp and no now parameter
      // should: use Date.now() as default
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      const days = getDaysSince(twoDaysAgo);
      
      expect(days).toBeGreaterThanOrEqual(1);
      expect(days).toBeLessThanOrEqual(3); // Allow some variance
    });
  });

  describe('getDaysSinceCardCreated', () => {
    it('should calculate days since card creation', () => {
      // given: a card created 5 days ago
      // should: return 5
      const now = Date.now();
      const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
      const card = createTestCard('1', 'Question', 'Answer');
      card.createdAt = fiveDaysAgo;
      
      const days = getDaysSinceCardCreated(card, now);
      
      expect(days).toBe(5);
    });

    it('should use current time as default', () => {
      // given: a card and no now parameter
      // should: use Date.now() as default
      const card = createTestCard('1', 'Question', 'Answer');
      const days = getDaysSinceCardCreated(card);
      
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(1); // Should be very recent
    });
  });

  describe('getDaysSinceLastReview', () => {
    it('should return null for card that has never been reviewed', () => {
      // given: a card with reviewCount === 0
      // should: return null
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 0 });
      const days = getDaysSinceLastReview(card);
      
      expect(days).toBeNull();
    });

    it('should calculate days since last review for reviewed card', () => {
      // given: a card reviewed 3 days ago
      // should: return 3
      const now = Date.now();
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 1,
        lastReview: threeDaysAgo,
      });
      
      const days = getDaysSinceLastReview(card, now);
      
      expect(days).toBe(3);
    });

    it('should use current time as default', () => {
      // given: a reviewed card and no now parameter
      // should: use Date.now() as default
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 1,
        lastReview: Date.now() - 2 * 24 * 60 * 60 * 1000,
      });
      
      const days = getDaysSinceLastReview(card);
      
      expect(days).toBeGreaterThanOrEqual(1);
      expect(days).toBeLessThanOrEqual(3);
    });
  });

  describe('isNewCard', () => {
    it('should return true for card with reviewCount === 0', () => {
      // given: a card that has never been reviewed
      // should: return true
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 0 });
      const isNew = isNewCard(card);
      
      expect(isNew).toBe(true);
    });

    it('should return false for card with reviewCount > 0', () => {
      // given: a card that has been reviewed
      // should: return false
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 1 });
      const isNew = isNewCard(card);
      
      expect(isNew).toBe(false);
    });
  });

  describe('filterCardsForQuiz', () => {
    it('should return all cards when no filters applied', () => {
      // given: cards array with no filters
      // should: return all cards
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
        createTestCard('3', 'Q3', 'A3'),
      ];
      
      const filtered = filterCardsForQuiz(cards);
      
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(cards);
    });

    it('should filter by topic when topicId is provided', () => {
      // given: cards with different topics
      // should: return only cards matching topic
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['commands'] },
        { ...createTestCard('2', 'Q2', 'A2'), tags: ['commands'] },
        { ...createTestCard('3', 'Q3', 'A3'), tags: ['lifecycle'] },
      ];
      
      const filtered = filterCardsForQuiz(cards, 'commands');
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '2']);
    });

    it('should filter by incorrect card IDs when filterIncorrectOnly is true', () => {
      // given: cards and incorrect card IDs
      // should: return only incorrect cards
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
        createTestCard('3', 'Q3', 'A3'),
      ];
      
      const filtered = filterCardsForQuiz(
        cards,
        undefined,
        true,
        ['1', '3']
      );
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });

    it('should apply both topic and incorrect filters when both provided', () => {
      // given: cards with topics and incorrect card IDs
      // should: return cards matching both filters
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['commands'] },
        { ...createTestCard('2', 'Q2', 'A2'), tags: ['commands'] },
        { ...createTestCard('3', 'Q3', 'A3'), tags: ['lifecycle'] },
        { ...createTestCard('4', 'Q4', 'A4'), tags: ['commands'] },
      ];
      
      const filtered = filterCardsForQuiz(
        cards,
        'commands',
        true,
        ['1', '4']
      );
      
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '4']);
    });

    it('should return empty array when incorrect filter has no matches', () => {
      // given: cards and incorrect IDs that don't match
      // should: return empty array
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
      ];
      
      const filtered = filterCardsForQuiz(
        cards,
        undefined,
        true,
        ['99', '100']
      );
      
      expect(filtered).toHaveLength(0);
    });

    it('should return empty array when topic filter has no matches', () => {
      // given: cards with different topics
      // should: return empty array
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['commands'] },
        { ...createTestCard('2', 'Q2', 'A2'), tags: ['lifecycle'] },
      ];
      
      const filtered = filterCardsForQuiz(cards, 'nonexistent');
      
      expect(filtered).toHaveLength(0);
    });
  });

  describe('processCardReview', () => {
    it('should process review for new card correctly', () => {
      // given: a new card with quality 4
      // should: return wasNewCard=true and update card state
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 0 });
      const result = processCardReview(card, 4);
      
      expect(result.wasNewCard).toBe(true);
      expect(result.isCorrect).toBe(true);
      expect(result.updatedCard.state.reviewCount).toBe(1);
    });

    it('should process review for existing card correctly', () => {
      // given: a card that has been reviewed before
      // should: return wasNewCard=false and update card state
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 2 });
      const result = processCardReview(card, 5);
      
      expect(result.wasNewCard).toBe(false);
      expect(result.isCorrect).toBe(true);
      expect(result.updatedCard.state.reviewCount).toBe(3);
    });

    it('should mark incorrect when quality < 3', () => {
      // given: a card reviewed with quality 2
      // should: return isCorrect=false
      const card = createTestCard('1', 'Question', 'Answer');
      const result = processCardReview(card, 2);
      
      expect(result.isCorrect).toBe(false);
    });

    it('should mark correct when quality >= 3', () => {
      // given: cards reviewed with quality 3, 4, 5
      // should: return isCorrect=true for all
      const card1 = createTestCard('1', 'Q1', 'A1');
      const card2 = createTestCard('2', 'Q2', 'A2');
      const card3 = createTestCard('3', 'Q3', 'A3');
      
      expect(processCardReview(card1, 3).isCorrect).toBe(true);
      expect(processCardReview(card2, 4).isCorrect).toBe(true);
      expect(processCardReview(card3, 5).isCorrect).toBe(true);
    });

    it('should use provided reviewedAt timestamp', () => {
      // given: a card and specific timestamp
      // should: use that timestamp for review
      const card = createTestCard('1', 'Question', 'Answer');
      const reviewedAt = 1609459200000;
      const result = processCardReview(card, 4, reviewedAt);
      
      expect(result.updatedCard.state.lastReview).toBe(reviewedAt);
    });
  });

  describe('getNextCardIndex', () => {
    describe('quiz mode', () => {
      it('should move to next card when not at last card', () => {
        // given: current index 0, total 5, quiz mode
        // should: return 1
        const next = getNextCardIndex(0, 5, true);
        expect(next).toBe(1);
      });

      it('should stay at last card when at last card', () => {
        // given: current index 4, total 5, quiz mode
        // should: return 4 (stay at last)
        const next = getNextCardIndex(4, 5, true);
        expect(next).toBe(4);
      });

      it('should handle single card in quiz mode', () => {
        // given: current index 0, total 1, quiz mode
        // should: return 0 (stay at only card)
        const next = getNextCardIndex(0, 1, true);
        expect(next).toBe(0);
      });
    });

    describe('normal study mode', () => {
      it('should move to next card when not at last card', () => {
        // given: current index 0, total 5, normal mode
        // should: return 1
        const next = getNextCardIndex(0, 5, false);
        expect(next).toBe(1);
      });

      it('should loop back to start when at last card', () => {
        // given: current index 4, total 5, normal mode
        // should: return 0 (loop back)
        const next = getNextCardIndex(4, 5, false);
        expect(next).toBe(0);
      });

      it('should handle single card in normal mode', () => {
        // given: current index 0, total 1, normal mode
        // should: return 0 (loop back to start)
        const next = getNextCardIndex(0, 1, false);
        expect(next).toBe(0);
      });

      it('should loop correctly through multiple cards', () => {
        // given: multiple cards in normal mode
        // should: loop back to start after last card
        const total = 3;
        expect(getNextCardIndex(0, total, false)).toBe(1);
        expect(getNextCardIndex(1, total, false)).toBe(2);
        expect(getNextCardIndex(2, total, false)).toBe(0); // loop back
      });
    });
  });
});

