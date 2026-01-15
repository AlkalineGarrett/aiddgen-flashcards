/**
 * Study session state
 */
export interface StudySession {
  startTime: number;
  cardsReviewed: number;
  timeSpent: number; // in seconds
}

/**
 * Create a new study session
 */
export function createStudySession(startTime: number = Date.now()): StudySession {
  return {
    startTime,
    cardsReviewed: 0,
    timeSpent: 0,
  };
}

/**
 * Update session time spent
 */
export function updateSessionTime(session: StudySession, now: number = Date.now()): StudySession {
  const elapsed = Math.floor((now - session.startTime) / 1000);
  return {
    ...session,
    timeSpent: elapsed,
  };
}

/**
 * Increment cards reviewed count
 */
export function incrementCardsReviewed(session: StudySession): StudySession {
  return {
    ...session,
    cardsReviewed: session.cardsReviewed + 1,
  };
}

