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
  return {
    answeredCards: new Set([...state.answeredCards, cardId]),
    correctCardIds: isCorrect
      ? new Set([...state.correctCardIds, cardId])
      : state.correctCardIds,
    incorrectCardIds: !isCorrect
      ? new Set([...state.incorrectCardIds, cardId])
      : state.incorrectCardIds,
  };
}

/**
 * Check if quiz is complete (all cards answered)
 */
export function isQuizComplete(tracking: QuizTrackingState, totalCards: number): boolean {
  return tracking.answeredCards.size >= totalCards && totalCards > 0;
}

