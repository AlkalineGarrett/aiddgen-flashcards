import { useState, useEffect, useMemo } from 'react';
import { Card, ReviewQuality } from '../types/card';
import { useCardStorage } from '../utils/useStorage';
import { updateCardState } from '../utils/fsrs';
import {
  buildReviewQueue,
  loadQueueConfig,
  incrementNewCardsStudied,
  getQueueStats,
} from '../utils/reviewQueue';
import { CardDisplay } from './CardDisplay';
import { RatingButtons } from './RatingButtons';
import { StudyStats } from './StudyStats';
import { StudySettings } from './StudySettings';
import { DeckId, getDeckInfo } from '../utils/deckStorage';
import './components.css';

interface StudySession {
  startTime: number;
  cardsReviewed: number;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  totalCards: number;
  correctCards: number;
  incorrectCards: number;
  score: number; // percentage 0-100
  correctCardIds: string[];
  incorrectCardIds: string[];
}

interface StudyProps {
  deckId: DeckId;
  // Quiz mode props
  quizMode?: boolean; // If true, enable quiz mode (single chance, track results)
  topicId?: string; // If provided, filter cards to this topic only
  filterIncorrectOnly?: boolean; // If true, only show cards that were incorrect previously
  previousIncorrectCardIds?: string[]; // Card IDs that were incorrect previously
  onQuizComplete?: (result: QuizResult) => void; // Callback when quiz completes
  onCancel?: () => void; // Optional callback to exit quiz early
  initialCards?: Card[]; // Optional cards to use instead of loading from storage
}

/**
 * Extract primary topic from a tag (same logic as topicContent.ts)
 */
function extractPrimaryTopic(tag: string): string | null {
  if (tag === 'aidd' || tag === 'aiddgen') {
    return null;
  }
  const parts = tag.split('-');
  return parts[0] || null;
}

/**
 * Get the primary topic for a card
 */
function getCardPrimaryTopic(card: Card): string | null {
  if (!card.tags || card.tags.length === 0) {
    return null;
  }
  for (const tag of card.tags) {
    const primaryTopic = extractPrimaryTopic(tag);
    if (primaryTopic) {
      return primaryTopic;
    }
  }
  return null;
}

/**
 * Filter cards by topic ID
 */
function filterCardsByTopic(cards: Card[], topicId: string): Card[] {
  return cards.filter((card) => {
    const primaryTopic = getCardPrimaryTopic(card);
    return primaryTopic === topicId;
  });
}

export function Study({ 
  deckId,
  quizMode = false,
  topicId,
  filterIncorrectOnly = false,
  previousIncorrectCardIds = [],
  onQuizComplete,
  onCancel,
  initialCards,
}: StudyProps) {
  const { cards: storageCards, updateCard, isLoading: storageLoading } = useCardStorage(deckId);
  
  // Use initialCards if provided (for freshly added cards), otherwise use storage cards
  const cards = initialCards ?? storageCards;
  const isLoading = initialCards ? false : storageLoading;
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [session, setSession] = useState<StudySession | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Quiz mode state
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());
  const [correctCardIds, setCorrectCardIds] = useState<Set<string>>(new Set());
  const [incorrectCardIds, setIncorrectCardIds] = useState<Set<string>>(new Set());
  
  const deckInfo = useMemo(() => getDeckInfo(deckId), [deckId]);

  // Reset study state when deck changes or quiz mode changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSession(null);
    // Reset quiz state
    if (quizMode) {
      setAnsweredCards(new Set());
      setCorrectCardIds(new Set());
      setIncorrectCardIds(new Set());
    }
  }, [deckId, quizMode, topicId]);

  // Build review queue with proper prioritization and daily limits
  const queue = useMemo(() => {
    if (isLoading) return null;
    return buildReviewQueue(cards);
  }, [cards, isLoading]);

  const queueConfig = useMemo(() => loadQueueConfig(), []);
  const queueStats = useMemo(() => {
    if (!queue) return null;
    return getQueueStats(queue, queueConfig);
  }, [queue, queueConfig]);

  // Filter cards for quiz mode
  const dueCards = useMemo(() => {
    if (quizMode && topicId) {
      // Quiz mode: filter by topic
      let filtered = filterCardsByTopic(cards, topicId);
      
      // If filtering for incorrect only, further filter by previous incorrect card IDs
      if (filterIncorrectOnly && previousIncorrectCardIds.length > 0) {
        const incorrectSet = new Set(previousIncorrectCardIds);
        filtered = filtered.filter((card) => incorrectSet.has(card.id));
      }
      
      return filtered;
    } else {
      // Normal study mode: use queue
      return queue?.allCards || [];
    }
  }, [quizMode, topicId, cards, filterIncorrectOnly, previousIncorrectCardIds, queue]);

  // Initialize session when starting
  useEffect(() => {
    if (!isLoading && dueCards.length > 0 && !session) {
      setSession({
        startTime: Date.now(),
        cardsReviewed: 0,
        timeSpent: 0,
      });
    }
  }, [dueCards.length, isLoading, session]);

  // Check if quiz is complete (all cards answered once)
  useEffect(() => {
    if (quizMode && dueCards.length > 0 && answeredCards.size >= dueCards.length) {
      const correct = Array.from(correctCardIds);
      const incorrect = Array.from(incorrectCardIds);
      const score = dueCards.length > 0 
        ? Math.round((correct.length / dueCards.length) * 100)
        : 0;

      if (onQuizComplete) {
        onQuizComplete({
          totalCards: dueCards.length,
          correctCards: correct.length,
          incorrectCards: incorrect.length,
          score,
          correctCardIds: correct,
          incorrectCardIds: incorrect,
        });
      }
    }
  }, [quizMode, answeredCards.size, dueCards.length, correctCardIds, incorrectCardIds, onQuizComplete]);

  // Update session time
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      setSession((prev) => prev ? { ...prev, timeSpent: elapsed } : null);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Reset index if out of bounds
  useEffect(() => {
    if (dueCards.length > 0 && currentCardIndex >= dueCards.length) {
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
  }, [dueCards.length, currentCardIndex]);

  const currentCard = dueCards[currentCardIndex];

  const handleRating = (quality: ReviewQuality) => {
    if (!currentCard) return;

    // Track if this was a new card
    const wasNewCard = currentCard.state.reviewCount === 0;

    // Update card state using FSRS (this updates next review date)
    const result = updateCardState(currentCard, quality);
    updateCard(result.card);

    // Increment new cards studied if applicable
    if (wasNewCard) {
      incrementNewCardsStudied();
    }

    // Quiz mode: track answered cards and correct/incorrect
    if (quizMode) {
      setAnsweredCards((prev) => new Set([...prev, currentCard.id]));
      // Track correct/incorrect (quality >= 3 is considered correct)
      if (quality >= 3) {
        setCorrectCardIds((prev) => new Set([...prev, currentCard.id]));
      } else {
        setIncorrectCardIds((prev) => new Set([...prev, currentCard.id]));
      }
    }

    // Update session stats
    setSession((prev) =>
      prev
        ? {
            ...prev,
            cardsReviewed: prev.cardsReviewed + 1,
          }
        : null
    );

    // Move to next card
    setShowAnswer(false);
    if (quizMode) {
      // Quiz mode: single chance, move to next card or complete
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
      // If this was the last card, the useEffect above will trigger onQuizComplete
    } else {
      // Normal study mode: loop back to start if finished
      if (currentCardIndex < dueCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // Finished all cards in current queue, reset to start
        // The queue will recalculate on next render
        setCurrentCardIndex(0);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (dueCards.length === 0) {
    // Quiz mode: show specific message for filtered incorrect cards
    if (quizMode && filterIncorrectOnly) {
      return (
        <div className="study-empty">
          <h2>🎉 All Correct!</h2>
          <p className="study-empty-subtitle">
            All cards for this topic were answered correctly in your previous quiz!
          </p>
          <p className="study-empty-note">
            You can review all cards again by starting a new quiz, or continue to the next topic.
          </p>
        </div>
      );
    }
    
    // Normal study mode or quiz mode with no cards
    return (
      <div className="study-empty">
        <h2>🎉 All Done!</h2>
        <p>
          {quizMode && topicId
            ? `No cards found for topic "${topicId}" in ${deckInfo.name}`
            : `No cards are due for review right now in ${deckInfo.name}`}
        </p>
        {session && (
          <div className="study-empty-stats">
            <StudyStats session={session} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="study-container">
      {showSettings && <StudySettings onClose={() => setShowSettings(false)} />}
      
      <div className="study-header">
        <div className="study-header-top">
          <div className="study-header-info">
            {quizMode ? 'Quiz' : 'Studying'}: <strong>{deckInfo.name}</strong>
            {quizMode && topicId && (
              <>
                {' - Topic: '}<strong>{topicId}</strong>
                {filterIncorrectOnly && (
                  <span className="study-warning-badge">
                    (Reviewing previously incorrect cards)
                  </span>
                )}
              </>
            )}
          </div>
          {quizMode && onCancel && (
            <button
              onClick={onCancel}
              className="study-button"
            >
              Exit Quiz
            </button>
          )}
        </div>
        <div className="study-header-actions">
          <div>
            <strong>Card {currentCardIndex + 1} of {dueCards.length}</strong>
            {quizMode ? (
              <div className="study-card-info">
                Quiz Mode: One chance per card
              </div>
            ) : (
              queueStats && (
                <div className="study-card-info">
                  New: {queueStats.newCardsInQueue} | Review: {queueStats.reviewCardsInQueue}
                  {queueStats.remainingNewCardSlots > 0 && (
                    <span> | {queueStats.remainingNewCardSlots} new slots remaining</span>
                  )}
                </div>
              )
            )}
          </div>
          <div className="study-header-buttons">
            {session && <StudyStats session={session} />}
            {!quizMode && (
              <button
                onClick={() => setShowSettings(true)}
                className="study-button"
                title="Study Settings"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>
      </div>

      {currentCard && (
        <>
          <CardDisplay
            card={currentCard}
            showAnswer={showAnswer}
            onShowAnswer={() => setShowAnswer(true)}
          />

          {showAnswer && (
            <div className="study-rating-section">
              <RatingButtons onRate={handleRating} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

