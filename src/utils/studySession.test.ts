import { describe, it, expect } from 'vitest';
import {
  createStudySession,
  updateSessionTime,
  incrementCardsReviewed,
  StudySession,
} from './studySession';

describe('studySession', () => {
  describe('createStudySession', () => {
    it('should create session with correct initial values', () => {
      // given: creating a new session
      // should: return session with startTime, cardsReviewed: 0, timeSpent: 0
      const startTime = Date.now();
      const session = createStudySession(startTime);
      
      expect(session.startTime).toBe(startTime);
      expect(session.cardsReviewed).toBe(0);
      expect(session.timeSpent).toBe(0);
    });

    it('should use current time as default for startTime', () => {
      // given: creating session without startTime parameter
      // should: use Date.now() as default
      const before = Date.now();
      const session = createStudySession();
      const after = Date.now();
      
      expect(session.startTime).toBeGreaterThanOrEqual(before);
      expect(session.startTime).toBeLessThanOrEqual(after);
      expect(session.cardsReviewed).toBe(0);
      expect(session.timeSpent).toBe(0);
    });
  });

  describe('updateSessionTime', () => {
    it('should calculate time spent correctly in seconds', () => {
      // given: a session and current time
      // should: calculate elapsed time in seconds
      const startTime = Date.now();
      const session = createStudySession(startTime);
      const now = startTime + 5 * 1000; // 5 seconds later
      
      const updated = updateSessionTime(session, now);
      
      expect(updated.startTime).toBe(session.startTime);
      expect(updated.cardsReviewed).toBe(session.cardsReviewed);
      expect(updated.timeSpent).toBe(5);
    });

    it('should floor time to seconds (not round)', () => {
      // given: a session with partial seconds elapsed
      // should: floor to nearest second
      const startTime = Date.now();
      const session = createStudySession(startTime);
      const now = startTime + 5.9 * 1000; // 5.9 seconds later
      
      const updated = updateSessionTime(session, now);
      
      expect(updated.timeSpent).toBe(5); // Floored, not rounded
    });

    it('should use current time as default for now parameter', () => {
      // given: a session and no now parameter
      // should: use Date.now() as default
      const startTime = Date.now() - 3 * 1000; // 3 seconds ago
      const session = createStudySession(startTime);
      
      const updated = updateSessionTime(session);
      
      expect(updated.timeSpent).toBeGreaterThanOrEqual(2);
      expect(updated.timeSpent).toBeLessThanOrEqual(4); // Allow some variance
      expect(updated.startTime).toBe(session.startTime);
      expect(updated.cardsReviewed).toBe(session.cardsReviewed);
    });

    it('should preserve other session properties', () => {
      // given: a session with cardsReviewed > 0
      // should: preserve cardsReviewed when updating time
      const startTime = Date.now();
      const session: StudySession = {
        startTime,
        cardsReviewed: 5,
        timeSpent: 0,
      };
      const now = startTime + 10 * 1000;
      
      const updated = updateSessionTime(session, now);
      
      expect(updated.startTime).toBe(session.startTime);
      expect(updated.cardsReviewed).toBe(5);
      expect(updated.timeSpent).toBe(10);
    });

    it('should handle long session times', () => {
      // given: a session that has been running for a long time
      // should: calculate time correctly
      const startTime = Date.now();
      const session = createStudySession(startTime);
      const now = startTime + 3600 * 1000; // 1 hour later
      
      const updated = updateSessionTime(session, now);
      
      expect(updated.timeSpent).toBe(3600); // 1 hour = 3600 seconds
    });

    it('should return 0 for timeSpent when now equals startTime', () => {
      // given: a session where now equals startTime
      // should: return 0 for timeSpent
      const startTime = Date.now();
      const session = createStudySession(startTime);
      
      const updated = updateSessionTime(session, startTime);
      
      expect(updated.timeSpent).toBe(0);
    });
  });

  describe('incrementCardsReviewed', () => {
    it('should increment cards reviewed count', () => {
      // given: a session with cardsReviewed: 0
      // should: increment to 1
      const session = createStudySession();
      const updated = incrementCardsReviewed(session);
      
      expect(updated.cardsReviewed).toBe(1);
      expect(updated.startTime).toBe(session.startTime);
      expect(updated.timeSpent).toBe(session.timeSpent);
    });

    it('should increment from existing count', () => {
      // given: a session with cardsReviewed: 5
      // should: increment to 6
      const session: StudySession = {
        startTime: Date.now(),
        cardsReviewed: 5,
        timeSpent: 100,
      };
      
      const updated = incrementCardsReviewed(session);
      
      expect(updated.cardsReviewed).toBe(6);
      expect(updated.startTime).toBe(session.startTime);
      expect(updated.timeSpent).toBe(session.timeSpent);
    });

    it('should preserve other session properties', () => {
      // given: a session with all properties set
      // should: only update cardsReviewed
      const startTime = Date.now();
      const session: StudySession = {
        startTime,
        cardsReviewed: 3,
        timeSpent: 120,
      };
      
      const updated = incrementCardsReviewed(session);
      
      expect(updated.startTime).toBe(startTime);
      expect(updated.timeSpent).toBe(120);
      expect(updated.cardsReviewed).toBe(4);
    });

    it('should handle multiple increments', () => {
      // given: a session that is incremented multiple times
      // should: increment correctly each time
      let session = createStudySession();
      
      session = incrementCardsReviewed(session);
      expect(session.cardsReviewed).toBe(1);
      
      session = incrementCardsReviewed(session);
      expect(session.cardsReviewed).toBe(2);
      
      session = incrementCardsReviewed(session);
      expect(session.cardsReviewed).toBe(3);
    });
  });
});

