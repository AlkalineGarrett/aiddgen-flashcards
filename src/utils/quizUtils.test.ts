import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateQuizScore,
  createQuizResult,
  saveQuizResults,
  loadQuizResults,
  getIncorrectCardIdsFromQuiz,
} from './quizUtils';
import { QuizResult } from '../components/Quiz';
import { DeckId } from './deckStorage';

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

describe('quizUtils', () => {
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

  describe('calculateQuizScore', () => {
    it('should calculate score as percentage correctly', () => {
      // given: correct and total counts
      // should: return rounded percentage
      expect(calculateQuizScore(8, 10)).toBe(80);
      expect(calculateQuizScore(5, 10)).toBe(50);
      expect(calculateQuizScore(9, 10)).toBe(90);
    });

    it('should return 0 when totalCount is 0', () => {
      // given: zero total count
      // should: return 0 to avoid division by zero
      expect(calculateQuizScore(5, 0)).toBe(0);
      expect(calculateQuizScore(0, 0)).toBe(0);
    });

    it('should round score correctly', () => {
      // given: scores that need rounding
      // should: round to nearest integer
      expect(calculateQuizScore(1, 3)).toBe(33); // 33.33... rounded
      expect(calculateQuizScore(2, 3)).toBe(67); // 66.66... rounded
      expect(calculateQuizScore(1, 7)).toBe(14); // 14.28... rounded
    });

    it('should return 100 for perfect score', () => {
      // given: all correct
      // should: return 100
      expect(calculateQuizScore(10, 10)).toBe(100);
      expect(calculateQuizScore(5, 5)).toBe(100);
    });

    it('should return 0 for zero correct', () => {
      // given: no correct answers
      // should: return 0
      expect(calculateQuizScore(0, 10)).toBe(0);
      expect(calculateQuizScore(0, 5)).toBe(0);
    });
  });

  describe('createQuizResult', () => {
    it('should create quiz result object correctly', () => {
      // given: total cards, correct IDs, and incorrect IDs
      // should: create result with correct counts and score
      const result = createQuizResult(
        10,
        ['card1', 'card2', 'card3'],
        ['card4', 'card5']
      );
      
      expect(result.totalCards).toBe(10);
      expect(result.correctCards).toBe(3);
      expect(result.incorrectCards).toBe(2);
      expect(result.score).toBe(30); // 3/10 = 30%
      expect(result.correctCardIds).toEqual(['card1', 'card2', 'card3']);
      expect(result.incorrectCardIds).toEqual(['card4', 'card5']);
    });

    it('should handle empty correct and incorrect arrays', () => {
      // given: no correct or incorrect cards
      // should: create result with zero counts
      const result = createQuizResult(5, [], []);
      
      expect(result.totalCards).toBe(5);
      expect(result.correctCards).toBe(0);
      expect(result.incorrectCards).toBe(0);
      expect(result.score).toBe(0);
      expect(result.correctCardIds).toEqual([]);
      expect(result.incorrectCardIds).toEqual([]);
    });

    it('should handle all correct cards', () => {
      // given: all cards correct
      // should: create result with 100% score
      const result = createQuizResult(
        5,
        ['card1', 'card2', 'card3', 'card4', 'card5'],
        []
      );
      
      expect(result.totalCards).toBe(5);
      expect(result.correctCards).toBe(5);
      expect(result.incorrectCards).toBe(0);
      expect(result.score).toBe(100);
    });

    it('should handle all incorrect cards', () => {
      // given: all cards incorrect
      // should: create result with 0% score
      const result = createQuizResult(
        5,
        [],
        ['card1', 'card2', 'card3', 'card4', 'card5']
      );
      
      expect(result.totalCards).toBe(5);
      expect(result.correctCards).toBe(0);
      expect(result.incorrectCards).toBe(5);
      expect(result.score).toBe(0);
    });
  });

  describe('saveQuizResults', () => {
    it('should save quiz results to localStorage with correct key', () => {
      // given: deck ID, topic ID, and quiz result
      // should: save to localStorage with formatted key
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 10,
        correctCards: 7,
        incorrectCards: 3,
        score: 70,
        correctCardIds: ['card1', 'card2'],
        incorrectCardIds: ['card3', 'card4'],
      };
      
      saveQuizResults(deckId, topicId, result);
      
      const stored = localStorageMock.getItem(`quiz-results-${deckId}-${topicId}`);
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.totalCards).toBe(10);
      expect(parsed.correctCards).toBe(7);
      expect(parsed.incorrectCards).toBe(3);
      expect(parsed.score).toBe(70);
    });

    it('should clear incorrect card IDs when all cards were correct', () => {
      // given: quiz result with all correct cards
      // should: save with empty incorrectCardIds array
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 5,
        correctCards: 5,
        incorrectCards: 0,
        score: 100,
        correctCardIds: ['card1', 'card2', 'card3', 'card4', 'card5'],
        incorrectCardIds: ['should-be-cleared'], // Should be cleared
      };
      
      saveQuizResults(deckId, topicId, result);
      
      const stored = localStorageMock.getItem(`quiz-results-${deckId}-${topicId}`);
      const parsed = JSON.parse(stored!);
      
      expect(parsed.incorrectCardIds).toEqual([]);
      expect(parsed.correctCards).toBe(5);
    });

    it('should preserve incorrect card IDs when some cards were incorrect', () => {
      // given: quiz result with some incorrect cards
      // should: preserve incorrectCardIds
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 5,
        correctCards: 3,
        incorrectCards: 2,
        score: 60,
        correctCardIds: ['card1', 'card2', 'card3'],
        incorrectCardIds: ['card4', 'card5'],
      };
      
      saveQuizResults(deckId, topicId, result);
      
      const stored = localStorageMock.getItem(`quiz-results-${deckId}-${topicId}`);
      const parsed = JSON.parse(stored!);
      
      expect(parsed.incorrectCardIds).toEqual(['card4', 'card5']);
    });
  });

  describe('loadQuizResults', () => {
    it('should load quiz results from localStorage', () => {
      // given: saved quiz results in localStorage
      // should: load and return the result
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 10,
        correctCards: 8,
        incorrectCards: 2,
        score: 80,
        correctCardIds: ['card1', 'card2'],
        incorrectCardIds: ['card3'],
      };
      
      localStorageMock.setItem(
        `quiz-results-${deckId}-${topicId}`,
        JSON.stringify(result)
      );
      
      const loaded = loadQuizResults(deckId, topicId);
      
      expect(loaded).not.toBeNull();
      expect(loaded!.totalCards).toBe(10);
      expect(loaded!.correctCards).toBe(8);
      expect(loaded!.incorrectCards).toBe(2);
      expect(loaded!.score).toBe(80);
      expect(loaded!.correctCardIds).toEqual(['card1', 'card2']);
      expect(loaded!.incorrectCardIds).toEqual(['card3']);
    });

    it('should return null when no results exist', () => {
      // given: no saved results in localStorage
      // should: return null
      const deckId: DeckId = 'aiddgen';
      const topicId = 'nonexistent';
      
      const loaded = loadQuizResults(deckId, topicId);
      
      expect(loaded).toBeNull();
    });

    it('should return null when JSON is invalid', () => {
      // given: invalid JSON in localStorage
      // should: return null
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      
      localStorageMock.setItem(
        `quiz-results-${deckId}-${topicId}`,
        'invalid json'
      );
      
      const loaded = loadQuizResults(deckId, topicId);
      
      expect(loaded).toBeNull();
    });

    it('should handle different deck and topic combinations', () => {
      // given: results for different deck/topic pairs
      // should: load correct result for each pair
      const result1: QuizResult = {
        totalCards: 5,
        correctCards: 3,
        incorrectCards: 2,
        score: 60,
        correctCardIds: ['card1'],
        incorrectCardIds: ['card2'],
      };
      
      const result2: QuizResult = {
        totalCards: 10,
        correctCards: 10,
        incorrectCards: 0,
        score: 100,
        correctCardIds: ['card3'],
        incorrectCardIds: [],
      };
      
      localStorageMock.setItem('quiz-results-aiddgen-commands', JSON.stringify(result1));
      localStorageMock.setItem('quiz-results-aiddgen-lifecycle', JSON.stringify(result2));
      
      expect(loadQuizResults('aiddgen', 'commands')).toEqual(result1);
      expect(loadQuizResults('aiddgen', 'lifecycle')).toEqual(result2);
    });
  });

  describe('getIncorrectCardIdsFromQuiz', () => {
    it('should return incorrect card IDs from saved quiz results', () => {
      // given: saved quiz results with incorrect card IDs
      // should: return the incorrect card IDs
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 5,
        correctCards: 3,
        incorrectCards: 2,
        score: 60,
        correctCardIds: ['card1', 'card2', 'card3'],
        incorrectCardIds: ['card4', 'card5'],
      };
      
      localStorageMock.setItem(
        `quiz-results-${deckId}-${topicId}`,
        JSON.stringify(result)
      );
      
      const incorrectIds = getIncorrectCardIdsFromQuiz(deckId, topicId);
      
      expect(incorrectIds).toEqual(['card4', 'card5']);
    });

    it('should return empty array when no results exist', () => {
      // given: no saved results
      // should: return empty array
      const deckId: DeckId = 'aiddgen';
      const topicId = 'nonexistent';
      
      const incorrectIds = getIncorrectCardIdsFromQuiz(deckId, topicId);
      
      expect(incorrectIds).toEqual([]);
    });

    it('should return empty array when all cards were correct', () => {
      // given: saved results with all correct cards
      // should: return empty array
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      const result: QuizResult = {
        totalCards: 5,
        correctCards: 5,
        incorrectCards: 0,
        score: 100,
        correctCardIds: ['card1', 'card2', 'card3', 'card4', 'card5'],
        incorrectCardIds: [],
      };
      
      localStorageMock.setItem(
        `quiz-results-${deckId}-${topicId}`,
        JSON.stringify(result)
      );
      
      const incorrectIds = getIncorrectCardIdsFromQuiz(deckId, topicId);
      
      expect(incorrectIds).toEqual([]);
    });

    it('should return empty array when invalid JSON exists', () => {
      // given: invalid JSON in localStorage
      // should: return empty array
      const deckId: DeckId = 'aiddgen';
      const topicId = 'commands';
      
      localStorageMock.setItem(
        `quiz-results-${deckId}-${topicId}`,
        'invalid json'
      );
      
      const incorrectIds = getIncorrectCardIdsFromQuiz(deckId, topicId);
      
      expect(incorrectIds).toEqual([]);
    });
  });
});

