import { describe, it, expect } from 'vitest';
import { calculateStatistics } from './statistics';
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

describe('statistics', () => {
  describe('calculateStatistics', () => {
    it('should return zero statistics for empty cards array', () => {
      // given: empty cards array
      // should: return all zeros
      const stats = calculateStatistics([]);
      
      expect(stats.totalCards).toBe(0);
      expect(stats.dueCount).toBe(0);
      expect(stats.newCount).toBe(0);
      expect(stats.learningCount).toBe(0);
      expect(stats.reviewCount).toBe(0);
      expect(stats.masteredCount).toBe(0);
      expect(stats.averageStability).toBe(0);
      expect(stats.averageDifficulty).toBe(0);
      expect(stats.totalReviews).toBe(0);
      expect(stats.retentionRate).toBe(0);
    });

    it('should count total cards correctly', () => {
      // given: cards array
      // should: return correct total count
      const cards = [
        createTestCard('1', 'Q1', 'A1'),
        createTestCard('2', 'Q2', 'A2'),
        createTestCard('3', 'Q3', 'A3'),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.totalCards).toBe(3);
    });

    it('should count due cards correctly', () => {
      // given: mix of due and not-due cards
      // should: count only due cards
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { dueDate: now - 1000 }), // due
        createTestCard('2', 'Q2', 'A2', { dueDate: now + 24 * 60 * 60 * 1000 }), // not due
        createTestCard('3', 'Q3', 'A3', { dueDate: now - 1000 }), // due
      ];
      
      const stats = calculateStatistics(cards, now);
      
      expect(stats.dueCount).toBe(2);
    });

    it('should count new cards correctly', () => {
      // given: cards with reviewCount === 0
      // should: count as new
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 0 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 1 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.newCount).toBe(2);
    });

    it('should count learning cards correctly', () => {
      // given: cards with reviewCount < 3
      // should: count as learning
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 1 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 2 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 0 }), // new, not learning
        createTestCard('4', 'Q4', 'A4', { reviewCount: 3 }), // review, not learning
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.learningCount).toBe(2);
    });

    it('should count review cards correctly', () => {
      // given: cards with reviewCount >= 3 and stability < 30
      // should: count as review
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 3, stability: 15 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 5, stability: 20 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 3, stability: 30 }), // mastered, not review
        createTestCard('4', 'Q4', 'A4', { reviewCount: 1 }), // learning, not review
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.reviewCount).toBe(2);
    });

    it('should count mastered cards correctly', () => {
      // given: cards with stability >= 30
      // should: count as mastered
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 5, stability: 30 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 10, stability: 35 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 5, stability: 29.9 }), // review, not mastered
        createTestCard('4', 'Q4', 'A4', { reviewCount: 1 }), // learning, not mastered
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.masteredCount).toBe(2);
    });

    it('should calculate average stability correctly', () => {
      // given: cards with different stability values
      // should: calculate correct average
      const cards = [
        createTestCard('1', 'Q1', 'A1', { stability: 10 }),
        createTestCard('2', 'Q2', 'A2', { stability: 20 }),
        createTestCard('3', 'Q3', 'A3', { stability: 30 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.averageStability).toBe(20); // (10 + 20 + 30) / 3
    });

    it('should calculate average difficulty correctly', () => {
      // given: cards with different difficulty values
      // should: calculate correct average
      const cards = [
        createTestCard('1', 'Q1', 'A1', { difficulty: 0.2 }),
        createTestCard('2', 'Q2', 'A2', { difficulty: 0.5 }),
        createTestCard('3', 'Q3', 'A3', { difficulty: 0.8 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.averageDifficulty).toBeCloseTo(0.5); // (0.2 + 0.5 + 0.8) / 3
    });

    it('should sum total reviews correctly', () => {
      // given: cards with different review counts
      // should: sum all review counts
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 5 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 10 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 3 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.totalReviews).toBe(18); // 5 + 10 + 3
    });

    it('should calculate retention rate correctly', () => {
      // given: cards with different stability values
      // should: calculate percentage of cards with stability > 0.4
      const cards = [
        createTestCard('1', 'Q1', 'A1', { stability: 0.5 }), // retained
        createTestCard('2', 'Q2', 'A2', { stability: 0.3 }), // not retained
        createTestCard('3', 'Q3', 'A3', { stability: 0.6 }), // retained
        createTestCard('4', 'Q4', 'A4', { stability: 0.4 }), // not retained (<= 0.4)
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.retentionRate).toBe(50); // 2 out of 4 = 50%
    });

    it('should calculate 100% retention rate when all cards retained', () => {
      // given: all cards with stability > 0.4
      // should: return 100%
      const cards = [
        createTestCard('1', 'Q1', 'A1', { stability: 0.5 }),
        createTestCard('2', 'Q2', 'A2', { stability: 1.0 }),
        createTestCard('3', 'Q3', 'A3', { stability: 0.6 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.retentionRate).toBe(100);
    });

    it('should calculate 0% retention rate when no cards retained', () => {
      // given: all cards with stability <= 0.4
      // should: return 0%
      const cards = [
        createTestCard('1', 'Q1', 'A1', { stability: 0.3 }),
        createTestCard('2', 'Q2', 'A2', { stability: 0.4 }),
        createTestCard('3', 'Q3', 'A3', { stability: 0.2 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.retentionRate).toBe(0);
    });

    it('should use current time as default for now parameter', () => {
      // given: cards and no now parameter
      // should: use Date.now() as default
      const cards = [
        createTestCard('1', 'Q1', 'A1', { dueDate: Date.now() - 1000 }),
        createTestCard('2', 'Q2', 'A2', { dueDate: Date.now() + 24 * 60 * 60 * 1000 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      // Should still calculate correctly with default now
      expect(stats.totalCards).toBe(2);
      expect(stats.dueCount).toBeGreaterThanOrEqual(1); // At least one should be due
    });

    it('should handle cards with all statuses correctly', () => {
      // given: cards representing all possible statuses
      // should: count each status correctly
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0, dueDate: now - 1000 }), // new
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1, dueDate: now - 1000 }), // learning
        createTestCard('3', 'Q3', 'A3', { reviewCount: 3, stability: 15, dueDate: now - 1000 }), // review
        createTestCard('4', 'Q4', 'A4', { reviewCount: 5, stability: 30, dueDate: now - 1000 }), // mastered
      ];
      
      const stats = calculateStatistics(cards, now);
      
      expect(stats.totalCards).toBe(4);
      expect(stats.dueCount).toBe(4);
      expect(stats.newCount).toBe(1);
      expect(stats.learningCount).toBe(1);
      expect(stats.reviewCount).toBe(1);
      expect(stats.masteredCount).toBe(1);
    });

    it('should calculate averages correctly with single card', () => {
      // given: single card
      // should: return that card's values as averages
      const cards = [
        createTestCard('1', 'Q1', 'A1', { stability: 15, difficulty: 0.5, reviewCount: 3 }),
      ];
      
      const stats = calculateStatistics(cards);
      
      expect(stats.averageStability).toBe(15);
      expect(stats.averageDifficulty).toBe(0.5);
      expect(stats.totalReviews).toBe(3);
    });
  });
});

