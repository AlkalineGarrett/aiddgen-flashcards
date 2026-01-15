import { describe, it, expect } from 'vitest';
import {
  createQuizTrackingState,
  resetQuizTrackingState,
  trackQuizAnswer,
  isQuizComplete,
  QuizTrackingState,
} from './quizTracking';

describe('quizTracking', () => {
  describe('createQuizTrackingState', () => {
    it('should create initial tracking state with empty sets', () => {
      // given: creating initial state
      // should: return state with empty sets
      const state = createQuizTrackingState();
      
      expect(state.answeredCards.size).toBe(0);
      expect(state.correctCardIds.size).toBe(0);
      expect(state.incorrectCardIds.size).toBe(0);
      expect(state.answeredCards).toBeInstanceOf(Set);
      expect(state.correctCardIds).toBeInstanceOf(Set);
      expect(state.incorrectCardIds).toBeInstanceOf(Set);
    });
  });

  describe('resetQuizTrackingState', () => {
    it('should reset state to initial empty state', () => {
      // given: existing state with data
      // should: return new state with empty sets
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1', 'card2']),
        correctCardIds: new Set(['card1']),
        incorrectCardIds: new Set(['card2']),
      };
      
      const reset = resetQuizTrackingState();
      
      expect(reset.answeredCards.size).toBe(0);
      expect(reset.correctCardIds.size).toBe(0);
      expect(reset.incorrectCardIds.size).toBe(0);
    });

    it('should return same structure as createQuizTrackingState', () => {
      // given: resetting state
      // should: return same structure as initial state
      const initial = createQuizTrackingState();
      const reset = resetQuizTrackingState();
      
      expect(reset.answeredCards.size).toBe(initial.answeredCards.size);
      expect(reset.correctCardIds.size).toBe(initial.correctCardIds.size);
      expect(reset.incorrectCardIds.size).toBe(initial.incorrectCardIds.size);
    });
  });

  describe('trackQuizAnswer', () => {
    it('should track correct answer correctly', () => {
      // given: initial state and correct answer
      // should: add card to answeredCards and correctCardIds
      const state = createQuizTrackingState();
      const updated = trackQuizAnswer(state, 'card1', true);
      
      expect(updated.answeredCards.has('card1')).toBe(true);
      expect(updated.correctCardIds.has('card1')).toBe(true);
      expect(updated.incorrectCardIds.has('card1')).toBe(false);
    });

    it('should track incorrect answer correctly', () => {
      // given: initial state and incorrect answer
      // should: add card to answeredCards and incorrectCardIds
      const state = createQuizTrackingState();
      const updated = trackQuizAnswer(state, 'card1', false);
      
      expect(updated.answeredCards.has('card1')).toBe(true);
      expect(updated.correctCardIds.has('card1')).toBe(false);
      expect(updated.incorrectCardIds.has('card1')).toBe(true);
    });

    it('should add card to answeredCards regardless of correctness', () => {
      // given: tracking both correct and incorrect answers
      // should: add both to answeredCards
      let state = createQuizTrackingState();
      
      state = trackQuizAnswer(state, 'card1', true);
      state = trackQuizAnswer(state, 'card2', false);
      
      expect(state.answeredCards.has('card1')).toBe(true);
      expect(state.answeredCards.has('card2')).toBe(true);
      expect(state.answeredCards.size).toBe(2);
    });

    it('should not add correct card to incorrectCardIds', () => {
      // given: correct answer
      // should: not add to incorrectCardIds
      const state = createQuizTrackingState();
      const updated = trackQuizAnswer(state, 'card1', true);
      
      expect(updated.incorrectCardIds.has('card1')).toBe(false);
      expect(updated.incorrectCardIds.size).toBe(0);
    });

    it('should not add incorrect card to correctCardIds', () => {
      // given: incorrect answer
      // should: not add to correctCardIds
      const state = createQuizTrackingState();
      const updated = trackQuizAnswer(state, 'card1', false);
      
      expect(updated.correctCardIds.has('card1')).toBe(false);
      expect(updated.correctCardIds.size).toBe(0);
    });

    it('should track multiple answers correctly', () => {
      // given: multiple card answers
      // should: track all correctly
      let state = createQuizTrackingState();
      
      state = trackQuizAnswer(state, 'card1', true);
      state = trackQuizAnswer(state, 'card2', false);
      state = trackQuizAnswer(state, 'card3', true);
      state = trackQuizAnswer(state, 'card4', false);
      
      expect(state.answeredCards.size).toBe(4);
      expect(state.correctCardIds.size).toBe(2);
      expect(state.incorrectCardIds.size).toBe(2);
      expect(state.correctCardIds.has('card1')).toBe(true);
      expect(state.correctCardIds.has('card3')).toBe(true);
      expect(state.incorrectCardIds.has('card2')).toBe(true);
      expect(state.incorrectCardIds.has('card4')).toBe(true);
    });

    it('should not modify original state (immutability)', () => {
      // given: existing state
      // should: return new state without modifying original
      const state = createQuizTrackingState();
      const updated = trackQuizAnswer(state, 'card1', true);
      
      expect(state.answeredCards.size).toBe(0);
      expect(updated.answeredCards.size).toBe(1);
    });

    it('should handle same card answered multiple times', () => {
      // given: same card answered multiple times
      // should: track in answeredCards once, and remove from opposite set
      let state = createQuizTrackingState();
      
      state = trackQuizAnswer(state, 'card1', true);
      expect(state.correctCardIds.has('card1')).toBe(true);
      expect(state.incorrectCardIds.has('card1')).toBe(false);
      
      state = trackQuizAnswer(state, 'card1', false); // Same card, different answer
      
      // Set should only have one entry for card1 in answeredCards
      expect(state.answeredCards.size).toBe(1);
      expect(state.answeredCards.has('card1')).toBe(true);
      // Card should be removed from correctCardIds and added to incorrectCardIds
      expect(state.correctCardIds.has('card1')).toBe(false);
      expect(state.incorrectCardIds.has('card1')).toBe(true);
    });
  });

  describe('isQuizComplete', () => {
    it('should return true when all cards answered', () => {
      // given: tracking state with all cards answered
      // should: return true
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1', 'card2', 'card3']),
        correctCardIds: new Set(['card1', 'card2']),
        incorrectCardIds: new Set(['card3']),
      };
      
      const isComplete = isQuizComplete(state, 3);
      
      expect(isComplete).toBe(true);
    });

    it('should return false when not all cards answered', () => {
      // given: tracking state with fewer cards answered than total
      // should: return false
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1', 'card2']),
        correctCardIds: new Set(['card1']),
        incorrectCardIds: new Set(['card2']),
      };
      
      const isComplete = isQuizComplete(state, 5);
      
      expect(isComplete).toBe(false);
    });

    it('should return false when no cards answered', () => {
      // given: empty tracking state
      // should: return false
      const state = createQuizTrackingState();
      
      const isComplete = isQuizComplete(state, 5);
      
      expect(isComplete).toBe(false);
    });

    it('should return false when totalCards is 0', () => {
      // given: tracking state with answered cards but totalCards is 0
      // should: return false
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1']),
        correctCardIds: new Set(['card1']),
        incorrectCardIds: new Set(),
      };
      
      const isComplete = isQuizComplete(state, 0);
      
      expect(isComplete).toBe(false);
    });

    it('should return true when answeredCards size equals totalCards', () => {
      // given: exactly matching counts
      // should: return true
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1', 'card2']),
        correctCardIds: new Set(['card1']),
        incorrectCardIds: new Set(['card2']),
      };
      
      const isComplete = isQuizComplete(state, 2);
      
      expect(isComplete).toBe(true);
    });

    it('should return true when answeredCards size exceeds totalCards', () => {
      // given: more answered cards than total (edge case)
      // should: return true
      const state: QuizTrackingState = {
        answeredCards: new Set(['card1', 'card2', 'card3']),
        correctCardIds: new Set(['card1']),
        incorrectCardIds: new Set(['card2', 'card3']),
      };
      
      const isComplete = isQuizComplete(state, 2);
      
      expect(isComplete).toBe(true);
    });
  });
});

