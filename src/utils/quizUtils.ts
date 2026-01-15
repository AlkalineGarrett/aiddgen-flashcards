import { QuizResult } from '../components/Quiz';
import { DeckId } from './deckStorage';

/**
 * Calculate quiz score from correct and total counts
 */
export function calculateQuizScore(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

/**
 * Create a quiz result object
 */
export function createQuizResult(
  totalCards: number,
  correctCardIds: string[],
  incorrectCardIds: string[]
): QuizResult {
  const correctCount = correctCardIds.length;
  const incorrectCount = incorrectCardIds.length;
  return {
    totalCards,
    correctCards: correctCount,
    incorrectCards: incorrectCount,
    score: calculateQuizScore(correctCount, totalCards),
    correctCardIds,
    incorrectCardIds,
  };
}

/**
 * Save quiz results to localStorage
 */
export function saveQuizResults(deckId: DeckId, topicId: string, result: QuizResult): void {
  // If all cards were correct, ensure incorrect card IDs are cleared
  const resultToSave = {
    ...result,
    incorrectCardIds: result.incorrectCards === 0 ? [] : result.incorrectCardIds,
  };
  localStorage.setItem(
    `quiz-results-${deckId}-${topicId}`,
    JSON.stringify(resultToSave)
  );
}

/**
 * Load quiz results from localStorage
 */
export function loadQuizResults(deckId: DeckId, topicId: string): QuizResult | null {
  const stored = localStorage.getItem(`quiz-results-${deckId}-${topicId}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as QuizResult;
  } catch (e) {
    return null;
  }
}

/**
 * Get incorrect card IDs from saved quiz results
 */
export function getIncorrectCardIdsFromQuiz(deckId: DeckId, topicId: string): string[] {
  const result = loadQuizResults(deckId, topicId);
  return result?.incorrectCardIds || [];
}

