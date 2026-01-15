import { Card } from '../types/card';
import { DeckId } from '../utils/deckStorage';
import { Study, QuizResult } from './Study';

// Re-export QuizResult for backwards compatibility
export type { QuizResult };

interface QuizProps {
  deckId: DeckId;
  topicId: string;
  onComplete: (result: QuizResult) => void;
  onCancel?: () => void; // Optional callback to exit quiz early
  filterIncorrectOnly?: boolean; // If true, only show cards that were incorrect in previous quiz
  previousIncorrectCardIds?: string[]; // Card IDs that were incorrect previously
  initialCards?: Card[]; // Optional cards to use instead of loading from storage
}

/**
 * Quiz component - a wrapper around Study component in quiz mode
 * Uses the same card storage and update logic as normal study mode
 */
export function Quiz({
  deckId,
  topicId,
  onComplete,
  onCancel,
  filterIncorrectOnly = false,
  previousIncorrectCardIds = [],
  initialCards,
}: QuizProps) {
  return (
    <Study
      deckId={deckId}
      quizMode={true}
      topicId={topicId}
      filterIncorrectOnly={filterIncorrectOnly}
      previousIncorrectCardIds={previousIncorrectCardIds}
      onQuizComplete={onComplete}
      onCancel={onCancel}
      initialCards={initialCards}
    />
  );
}
