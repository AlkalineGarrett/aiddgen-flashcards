import { describe, it, expect } from 'vitest';
import {
  createInitialCardState,
  updateCardState,
  isCardDue,
  getCardPriority,
  sortCardsByPriority,
  getDueCards,
} from './fsrs';
import { Card } from '../types/card';

// Test helper to create a test card
function createTestCard(id: string, front: string, back: string): Card {
  return {
    id,
    front,
    back,
    state: createInitialCardState(),
    createdAt: Date.now(),
  };
}

describe('FSRS', () => {
  describe('createInitialCardState', () => {
    it('should create initial card state with correct default values', () => {
      // given: creating initial state
      // should: return state with default values
      const state = createInitialCardState();
      
      expect(state.difficulty).toBe(0.3);
      expect(state.stability).toBe(2.4);
      expect(state.reviewCount).toBe(0);
      expect(state.easeFactor).toBe(2.5);
      expect(state.dueDate).toBeLessThanOrEqual(Date.now());
      expect(state.lastReview).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('updateCardState', () => {
    it('should update card state after Good review (quality 4)', () => {
      // given: a new card
      // should: update state with increased review count and new due date
      const card = createTestCard('1', 'What is FSRS?', 'Free Spaced Repetition Scheduler');
      const result = updateCardState(card, 4);
      
      expect(result.card.state.reviewCount).toBe(1);
      expect(result.card.state.dueDate).toBeGreaterThan(card.state.dueDate);
      expect(result.quality).toBe(4);
    });

    it('should update card state after Perfect review (quality 5)', () => {
      // given: a card that was reviewed once
      // should: update state with further increased stability
      const card = createTestCard('1', 'Question', 'Answer');
      const result1 = updateCardState(card, 4);
      const result2 = updateCardState(result1.card, 5);
      
      expect(result2.card.state.reviewCount).toBe(2);
      expect(result2.card.state.dueDate).toBeGreaterThan(result1.card.state.dueDate);
    });
  });

  describe('isCardDue', () => {
    it('should return true when card is due', () => {
      // given: a card with due date in the past
      // should: return true
      const card = createTestCard('1', 'Question', 'Answer');
      card.state.dueDate = Date.now() - 1000;
      const isDue = isCardDue(card, Date.now());
      
      expect(isDue).toBe(true);
    });

    it('should return false when card is not due', () => {
      // given: a card with due date in the future
      // should: return false
      const card = createTestCard('1', 'Question', 'Answer');
      card.state.dueDate = Date.now() + 1000 * 60 * 60 * 24; // 1 day from now
      const isDue = isCardDue(card, Date.now());
      
      expect(isDue).toBe(false);
    });
  });

  describe('getCardPriority', () => {
    it('should return higher priority for overdue cards', () => {
      // given: cards with different due dates
      // should: return higher priority for more overdue cards
      const now = Date.now();
      const card1 = createTestCard('1', 'Card 1', 'Answer 1');
      card1.state.dueDate = now - 1000 * 60 * 60 * 24; // 1 day ago
      
      const card2 = createTestCard('2', 'Card 2', 'Answer 2');
      card2.state.dueDate = now - 1000 * 60 * 60 * 48; // 2 days ago
      
      const priority1 = getCardPriority(card1, now);
      const priority2 = getCardPriority(card2, now);
      
      expect(priority2).toBeGreaterThan(priority1);
    });
  });

  describe('sortCardsByPriority', () => {
    it('should sort cards by priority with most urgent first', () => {
      // given: cards with different due dates
      // should: sort with most overdue first
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Card 1', 'Answer 1'),
        createTestCard('2', 'Card 2', 'Answer 2'),
        createTestCard('3', 'Card 3', 'Answer 3'),
      ];
      
      // Make cards have different due dates
      cards[0].state.dueDate = now - 1000 * 60 * 60 * 24; // 1 day ago
      cards[1].state.dueDate = now + 1000 * 60 * 60 * 24; // 1 day from now
      cards[2].state.dueDate = now - 1000 * 60 * 60 * 48; // 2 days ago
      
      const sorted = sortCardsByPriority(cards, now);
      
      // Most overdue should be first
      expect(sorted[0].id).toBe('3'); // 2 days ago
      expect(sorted[1].id).toBe('1'); // 1 day ago
      expect(sorted[2].id).toBe('2'); // future
    });
  });

  describe('getDueCards', () => {
    it('should return only cards that are due', () => {
      // given: mix of due and not-due cards
      // should: return only due cards
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Card 1', 'Answer 1'),
        createTestCard('2', 'Card 2', 'Answer 2'),
        createTestCard('3', 'Card 3', 'Answer 3'),
      ];
      
      cards[0].state.dueDate = now - 1000; // due
      cards[1].state.dueDate = now + 1000 * 60 * 60 * 24; // not due
      cards[2].state.dueDate = now - 1000; // due
      
      const dueCards = getDueCards(cards, now);
      
      expect(dueCards).toHaveLength(2);
      expect(dueCards.map(c => c.id)).toContain('1');
      expect(dueCards.map(c => c.id)).toContain('3');
      expect(dueCards.map(c => c.id)).not.toContain('2');
    });
  });
});
