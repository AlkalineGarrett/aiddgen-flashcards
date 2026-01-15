import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadQueueConfig,
  saveQueueConfig,
  buildReviewQueue,
  incrementNewCardsStudied,
  updateMaxNewCardsPerDay,
  getQueueStats,
  ReviewQueueConfig,
} from './reviewQueue';
import { Card } from '../types/card';
import { createInitialCardState } from './fsrs';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

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

// Helper to get start of day timestamp
function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

describe('reviewQueue', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    // Mock global localStorage for Node.js environment
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  describe('loadQueueConfig', () => {
    it('should return default config when no stored config exists', () => {
      // given: no stored config in localStorage
      // should: return default config
      const config = loadQueueConfig();
      
      expect(config.maxNewCardsPerDay).toBe(20);
      expect(config.newCardsStudiedToday).toBe(0);
      expect(config.lastStudyDate).toBeGreaterThan(0);
    });

    it('should load stored config when it exists', () => {
      // given: stored config in localStorage
      // should: return stored config
      const storedConfig: ReviewQueueConfig = {
        maxNewCardsPerDay: 30,
        newCardsStudiedToday: 5,
        lastStudyDate: getStartOfDay(Date.now()),
      };
      localStorageMock.setItem('review-queue-config', JSON.stringify(storedConfig));
      
      const config = loadQueueConfig();
      
      expect(config.maxNewCardsPerDay).toBe(30);
      expect(config.newCardsStudiedToday).toBe(5);
      expect(config.lastStudyDate).toBe(storedConfig.lastStudyDate);
    });

    it('should reset daily count when it is a new day', () => {
      // given: stored config from yesterday
      // should: reset newCardsStudiedToday to 0
      const yesterday = getStartOfDay(Date.now() - 24 * 60 * 60 * 1000);
      const storedConfig: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 10,
        lastStudyDate: yesterday,
      };
      localStorageMock.setItem('review-queue-config', JSON.stringify(storedConfig));
      
      const config = loadQueueConfig();
      
      expect(config.newCardsStudiedToday).toBe(0);
      expect(config.lastStudyDate).toBe(getStartOfDay(Date.now()));
      expect(config.maxNewCardsPerDay).toBe(20);
    });

    it('should handle invalid JSON gracefully', () => {
      // given: invalid JSON in localStorage
      // should: return default config
      localStorageMock.setItem('review-queue-config', 'invalid json');
      
      const config = loadQueueConfig();
      
      expect(config.maxNewCardsPerDay).toBe(20);
      expect(config.newCardsStudiedToday).toBe(0);
    });
  });

  describe('saveQueueConfig', () => {
    it('should save config to localStorage', () => {
      // given: a config object
      // should: save it to localStorage
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 25,
        newCardsStudiedToday: 3,
        lastStudyDate: getStartOfDay(Date.now()),
      };
      
      saveQueueConfig(config);
      
      const stored = localStorageMock.getItem('review-queue-config');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.maxNewCardsPerDay).toBe(25);
      expect(parsed.newCardsStudiedToday).toBe(3);
    });
  });

  describe('buildReviewQueue', () => {
    it('should separate new cards from review cards', () => {
      // given: mix of new and review cards
      // should: separate them correctly
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0, dueDate: now - 1000 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1, dueDate: now - 1000 }),
        createTestCard('3', 'Q3', 'A3', { reviewCount: 0, dueDate: now - 1000 }),
        createTestCard('4', 'Q4', 'A4', { reviewCount: 5, dueDate: now - 1000 }),
      ];
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      expect(queue.newCards).toHaveLength(2);
      expect(queue.newCards.map(c => c.id)).toEqual(['1', '3']);
      expect(queue.reviewCards).toHaveLength(2);
      expect(queue.reviewCards.map(c => c.id)).toEqual(['2', '4']);
    });

    it('should limit new cards by daily limit', () => {
      // given: more new cards than daily limit
      // should: limit new cards in queue
      const now = Date.now();
      const cards = Array.from({ length: 30 }, (_, i) =>
        createTestCard(`card-${i}`, `Q${i}`, `A${i}`, {
          reviewCount: 0,
          dueDate: now - 1000,
        })
      );
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      expect(queue.newCards).toHaveLength(20);
      expect(queue.allCards.filter(c => c.state.reviewCount === 0)).toHaveLength(20);
    });

    it('should respect already studied new cards today', () => {
      // given: some new cards already studied today
      // should: reduce available slots
      const now = Date.now();
      const cards = Array.from({ length: 30 }, (_, i) =>
        createTestCard(`card-${i}`, `Q${i}`, `A${i}`, {
          reviewCount: 0,
          dueDate: now - 1000,
        })
      );
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 5,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      expect(queue.newCards).toHaveLength(15); // 20 - 5 = 15
    });

    it('should prioritize overdue review cards first', () => {
      // given: mix of overdue, new, and due review cards
      // should: put overdue review cards first in allCards
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0, dueDate: now - 1000 }), // new
        createTestCard('2', 'Q2', 'A2', { reviewCount: 3, dueDate: now - 2 * 24 * 60 * 60 * 1000 }), // overdue review
        createTestCard('3', 'Q3', 'A3', { reviewCount: 0, dueDate: now - 1000 }), // new
        createTestCard('4', 'Q4', 'A4', { reviewCount: 3, dueDate: now + 24 * 60 * 60 * 1000 }), // due but not overdue
      ];
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      // First card should be overdue review card
      expect(queue.allCards[0].id).toBe('2');
      expect(queue.allCards[0].state.reviewCount).toBeGreaterThan(0);
    });

    it('should exclude cards that are not due', () => {
      // given: mix of due and not-due cards
      // should: only include due cards
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0, dueDate: now - 1000 }), // due
        createTestCard('2', 'Q2', 'A2', { reviewCount: 0, dueDate: now + 24 * 60 * 60 * 1000 }), // not due
        createTestCard('3', 'Q3', 'A3', { reviewCount: 1, dueDate: now - 1000 }), // due
        createTestCard('4', 'Q4', 'A4', { reviewCount: 1, dueDate: now + 24 * 60 * 60 * 1000 }), // not due
      ];
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      expect(queue.allCards).toHaveLength(2);
      expect(queue.allCards.map(c => c.id)).toEqual(['1', '3']);
    });

    it('should return empty queue when no cards are due', () => {
      // given: only cards that are not due
      // should: return empty queue
      const now = Date.now();
      const cards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0, dueDate: now + 24 * 60 * 60 * 1000 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 1, dueDate: now + 24 * 60 * 60 * 1000 }),
      ];
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(now),
      };
      
      const queue = buildReviewQueue(cards, config, now);
      
      expect(queue.newCards).toHaveLength(0);
      expect(queue.reviewCards).toHaveLength(0);
      expect(queue.allCards).toHaveLength(0);
    });
  });

  describe('incrementNewCardsStudied', () => {
    it('should increment new cards studied count', () => {
      // given: config with 0 studied today
      // should: increment to 1
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(Date.now()),
      };
      localStorageMock.setItem('review-queue-config', JSON.stringify(config));
      
      incrementNewCardsStudied();
      
      const stored = localStorageMock.getItem('review-queue-config');
      const updated = JSON.parse(stored!);
      expect(updated.newCardsStudiedToday).toBe(1);
    });

    it('should reset count when it is a new day', () => {
      // given: config from yesterday with count > 0
      // should: reset to 0 then increment to 1
      const yesterday = getStartOfDay(Date.now() - 24 * 60 * 60 * 1000);
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 10,
        lastStudyDate: yesterday,
      };
      localStorageMock.setItem('review-queue-config', JSON.stringify(config));
      
      incrementNewCardsStudied();
      
      const stored = localStorageMock.getItem('review-queue-config');
      const updated = JSON.parse(stored!);
      expect(updated.newCardsStudiedToday).toBe(1);
      expect(updated.lastStudyDate).toBe(getStartOfDay(Date.now()));
    });
  });

  describe('updateMaxNewCardsPerDay', () => {
    it('should update max new cards per day setting', () => {
      // given: existing config
      // should: update maxNewCardsPerDay
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 5,
        lastStudyDate: getStartOfDay(Date.now()),
      };
      localStorageMock.setItem('review-queue-config', JSON.stringify(config));
      
      updateMaxNewCardsPerDay(30);
      
      const stored = localStorageMock.getItem('review-queue-config');
      const updated = JSON.parse(stored!);
      expect(updated.maxNewCardsPerDay).toBe(30);
      expect(updated.newCardsStudiedToday).toBe(5); // Should preserve other values
    });
  });

  describe('getQueueStats', () => {
    it('should calculate queue statistics correctly', () => {
      // given: a queue and config
      // should: return correct statistics
      const now = Date.now();
      const newCards = [
        createTestCard('1', 'Q1', 'A1', { reviewCount: 0 }),
        createTestCard('2', 'Q2', 'A2', { reviewCount: 0 }),
      ];
      const reviewCards = [
        createTestCard('3', 'Q3', 'A3', { reviewCount: 3 }),
        createTestCard('4', 'Q4', 'A4', { reviewCount: 5 }),
      ];
      
      const queue = {
        newCards,
        reviewCards,
        allCards: [...newCards, ...reviewCards],
      };
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 3,
        lastStudyDate: getStartOfDay(now),
      };
      
      const stats = getQueueStats(queue, config);
      
      expect(stats.totalDue).toBe(4);
      expect(stats.newCardsInQueue).toBe(2);
      expect(stats.reviewCardsInQueue).toBe(2);
      expect(stats.newCardsAvailable).toBe(19); // 2 in queue + (20 - 3) remaining = 2 + 17 = 19
      expect(stats.remainingNewCardSlots).toBe(17); // 20 - 3 = 17
    });

    it('should handle empty queue', () => {
      // given: empty queue
      // should: return zero statistics
      const queue = {
        newCards: [],
        reviewCards: [],
        allCards: [],
      };
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 0,
        lastStudyDate: getStartOfDay(Date.now()),
      };
      
      const stats = getQueueStats(queue, config);
      
      expect(stats.totalDue).toBe(0);
      expect(stats.newCardsInQueue).toBe(0);
      expect(stats.reviewCardsInQueue).toBe(0);
      expect(stats.newCardsAvailable).toBe(20);
      expect(stats.remainingNewCardSlots).toBe(20);
    });

    it('should not return negative remaining slots or available cards', () => {
      // given: more cards studied than daily limit
      // should: return 0 for remaining slots and available cards (not negative)
      const queue = {
        newCards: [],
        reviewCards: [],
        allCards: [],
      };
      
      const config: ReviewQueueConfig = {
        maxNewCardsPerDay: 20,
        newCardsStudiedToday: 25, // More than limit
        lastStudyDate: getStartOfDay(Date.now()),
      };
      
      const stats = getQueueStats(queue, config);
      
      expect(stats.remainingNewCardSlots).toBe(0); // Clamped by Math.max
      expect(stats.newCardsAvailable).toBe(0); // Clamped to 0 minimum
    });
  });
});

