/**
 * Track quiz progress and results
 */
export interface QuizTrackingState {
  answeredCards: Set<string>;
  correctCardIds: Set<string>;
  incorrectCardIds: Set<string>;
}

/**
 * Create initial quiz tracking state
 */
export function createQuizTrackingState(): QuizTrackingState {
  return {
    answeredCards: new Set(),
    correctCardIds: new Set(),
    incorrectCardIds: new Set(),
  };
}

/**
 * Reset quiz tracking state
 */
export function resetQuizTrackingState(): QuizTrackingState {
  return createQuizTrackingState();
}

/**
 * Track a card answer in quiz mode
 */
export function trackQuizAnswer(
  state: QuizTrackingState,
  cardId: string,
  isCorrect: boolean
): QuizTrackingState {
  // Remove card from opposite set if it exists there
  const correctCardIds = new Set(state.correctCardIds);
  const incorrectCardIds = new Set(state.incorrectCardIds);
  
  if (isCorrect) {
    correctCardIds.add(cardId);
    incorrectCardIds.delete(cardId);
  } else {
    incorrectCardIds.add(cardId);
    correctCardIds.delete(cardId);
  }
  
  return {
    answeredCards: new Set([...state.answeredCards, cardId]),
    correctCardIds,
    incorrectCardIds,
  };
}

/**
 * Check if quiz is complete (all cards answered)
 */
export function isQuizComplete(tracking: QuizTrackingState, totalCards: number): boolean {
  return tracking.answeredCards.size >= totalCards && totalCards > 0;
}

