import { describe, it, expect } from 'vitest';
import {
  getCardStatus,
  getStatusColor,
  getStatusLabel,
  filterCardsByStatus,
  filterCardsByTag,
  searchCards,
} from './cardStatus';
import { Card } from '../types/card';
import { createInitialCardState } from './fsrs';

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

describe('cardStatus', () => {
  describe('getCardStatus', () => {
    it('should return "new" for card with reviewCount === 0', () => {
      // given: a card that has never been reviewed
      // should: return "new" status
      const card = createTestCard('1', 'Question', 'Answer', { reviewCount: 0 });
      const status = getCardStatus(card);
      
      expect(status).toBe('new');
    });

    it('should return "learning" for card with reviewCount < 3', () => {
      // given: a card with 1 review
      // should: return "learning" status
      const card1 = createTestCard('1', 'Question', 'Answer', { reviewCount: 1 });
      expect(getCardStatus(card1)).toBe('learning');
      
      // given: a card with 2 reviews
      // should: return "learning" status
      const card2 = createTestCard('2', 'Question', 'Answer', { reviewCount: 2 });
      expect(getCardStatus(card2)).toBe('learning');
    });

    it('should return "mastered" for card with stability >= 30', () => {
      // given: a card with reviewCount >= 3 and stability >= 30
      // should: return "mastered" status
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 5,
        stability: 30,
      });
      const status = getCardStatus(card);
      
      expect(status).toBe('mastered');
    });

    it('should return "review" for card with reviewCount >= 3 and stability < 30', () => {
      // given: a card with reviewCount >= 3 but stability < 30
      // should: return "review" status
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 3,
        stability: 15,
      });
      const status = getCardStatus(card);
      
      expect(status).toBe('review');
    });

    it('should return "review" for card with reviewCount >= 3 and stability just below 30', () => {
      // given: a card with reviewCount >= 3 and stability 29.9
      // should: return "review" status (not mastered)
      const card = createTestCard('1', 'Question', 'Answer', {
        reviewCount: 10,
        stability: 29.9,
      });
      const status = getCardStatus(card);
      
      expect(status).toBe('review');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      // given: each status type
      // should: return correct color code
      expect(getStatusColor('new')).toBe('#6c757d'); // gray
      expect(getStatusColor('learning')).toBe('#ffc107'); // yellow
      expect(getStatusColor('review')).toBe('#007bff'); // blue
      expect(getStatusColor('mastered')).toBe('#28a745'); // green
    });

    it('should return default gray color for unknown status', () => {
      // given: an invalid status (type coercion)
      // should: return default gray color
      const color = getStatusColor('unknown' as any);
      expect(color).toBe('#6c757d');
    });
  });

  describe('getStatusLabel', () => {
    it('should return capitalized label for each status', () => {
      // given: each status type
      // should: return capitalized label
      expect(getStatusLabel('new')).toBe('New');
      expect(getStatusLabel('learning')).toBe('Learning');
      expect(getStatusLabel('review')).toBe('Review');
      expect(getStatusLabel('mastered')).toBe('Mastered');
    });
  });

  describe('filterCardsByStatus', () => {
    it('should return all cards when status is "all"', () => {
      // given: cards array and "all" status
      // should: return all cards
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 5, stability: 30 }),
      ];
      
      const filtered = filterCardsByStatus(cards, 'all');
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(cards);
    });

    it('should filter cards by "new" status', () => {
      // given: cards with different statuses
      // should: return only new cards
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 0 }),
      ];
      
      const filtered = filterCardsByStatus(cards, 'new');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });

    it('should filter cards by "learning" status', () => {
      // given: cards with different statuses
      // should: return only learning cards
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 2 }),
        createTestCard('4', 'Q4', 'A4', { reviewCount: 3, stability: 15 }),
      ];
      
      const filtered = filterCardsByStatus(cards, 'learning');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['2', '3']);
    });

    it('should filter cards by "mastered" status', () => {
      // given: cards with different statuses
      // should: return only mastered cards
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 3, stability: 15 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 5, stability: 30 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 10, stability: 35 }),
      ];
      
      const filtered = filterCardsByStatus(cards, 'mastered');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['2', '3']);
    });

    it('should filter cards by "review" status', () => {
      // given: cards with different statuses
      // should: return only review cards
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 3, stability: 15 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 5, stability: 30 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 10, stability: 20 }),
      ];
      
      const filtered = filterCardsByStatus(cards, 'review');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });
  });

  describe('filterCardsByTag', () => {
    it('should return all cards when tag is "all"', () => {
      // given: cards array and "all" tag
      // should: return all cards
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
      ];
      
      const filtered = filterCardsByTag(cards, 'all');
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(cards);
    });

    it('should filter cards by tag', () => {
      // given: cards with different tags
      // should: return only cards with matching tag
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['math', 'algebra'] },
        { ...createTestCard('2', 'Q2', 'A2'), tags: ['math'] },
        { ...createTestCard('3', 'Q3', 'A3'), tags: ['science'] },
      ];
      
      const filtered = filterCardsByTag(cards, 'math');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '2']);
    });

    it('should return empty array when no cards have the tag', () => {
      // given: cards without the specified tag
      // should: return empty array
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['math'] },
        { ...createTestCard('2', 'Q2', 'A2'), tags: ['science'] },
      ];
      
      const filtered = filterCardsByTag(cards, 'history');
      expect(filtered).toHaveLength(0);
    });

    it('should handle cards without tags property', () => {
      // given: cards without tags property
      // should: exclude them from results
      const cards = [
        { ...createTestCard('1', 'Q1', 'A1'), tags: ['math'] },
        createTestCard('2', 'Q2', 'A2'), // no tags
        { ...createTestCard('3', 'Q3', 'A3'), tags: ['math'] },
      ];
      
      const filtered = filterCardsByTag(cards, 'math');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });
  });

  describe('searchCards', () => {
    it('should return all cards when search text is empty', () => {
      // given: cards array and empty search text
      // should: return all cards
      const cards = [
        createTestCard('1', 'Question 1', 'Answer 1'),
        createTestCard('2', 'Question 2', 'Answer 2'),
      ];
      
      const filtered = searchCards(cards, '');
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(cards);
    });

    it('should return all cards when search text is only whitespace', () => {
      // given: cards array and whitespace-only search text
      // should: return all cards
      const cards = [
        createTestCard('1', 'Question 1', 'Answer 1'),
        createTestCard('2', 'Question 2', 'Answer 2'),
      ];
      
      const filtered = searchCards(cards, '   ');
      expect(filtered).toHaveLength(2);
      expect(filtered).toEqual(cards);
    });

    it('should search in card front text', () => {
      // given: cards with different front text
      // should: return cards matching front text
      const cards = [
        createTestCard('1', 'JavaScript', 'Programming language'),
        createTestCard('2', 'Python', 'Another language'),
        createTestCard('3', 'Java', 'Yet another language'),
      ];
      
      const filtered = searchCards(cards, 'java');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });

    it('should search in card back text', () => {
      // given: cards with different back text
      // should: return cards matching back text
      const cards = [
        createTestCard('1', 'Q1', 'JavaScript is a language'),
        createTestCard('2', 'Q2', 'Python is a language'),
        createTestCard('3', 'Q3', 'Java is a language'),
      ];
      
      const filtered = searchCards(cards, 'python');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should be case insensitive', () => {
      // given: cards with mixed case text
      // should: match regardless of case
      const cards = [
        createTestCard('1', 'JavaScript', 'Language'),
        createTestCard('2', 'PYTHON', 'Language'),
        createTestCard('3', 'java', 'Language'),
      ];
      
      const filtered = searchCards(cards, 'JAVA');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '3']);
    });

    it('should match partial text', () => {
      // given: cards with text containing search term
      // should: return cards with partial matches
      const cards = [
        createTestCard('1', 'JavaScript', 'Language'),
        createTestCard('2', 'TypeScript', 'Language'),
        createTestCard('3', 'Python', 'Language'),
      ];
      
      const filtered = searchCards(cards, 'script');
      expect(filtered).toHaveLength(2);
      expect(filtered.map(c => c.id)).toEqual(['1', '2']);
    });

    it('should return empty array when no matches found', () => {
      // given: cards that don't match search text
      // should: return empty array
      const cards = [
        createTestCard('1', 'JavaScript', 'Language'),
        createTestCard('2', 'Python', 'Language'),
      ];
      
      const filtered = searchCards(cards, 'ruby');
      expect(filtered).toHaveLength(0);
    });
  });
});

