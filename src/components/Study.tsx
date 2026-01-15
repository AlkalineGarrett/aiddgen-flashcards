import { useState, useEffect, useMemo } from 'react';
import { Card, ReviewQuality } from '../types/card';
import { useCardStorage } from '../utils/useStorage';
import {
  buildReviewQueue,
  loadQueueConfig,
  incrementNewCardsStudied,
  getQueueStats,
} from '../utils/reviewQueue';
import {
  filterCardsForQuiz,
  processCardReview,
  getNextCardIndex,
} from '../utils/cardUtils';
import { createQuizResult } from '../utils/quizUtils';
import {
  StudySession,
  createStudySession,
  updateSessionTime,
  incrementCardsReviewed,
} from '../utils/studySession';
import {
  QuizTrackingState,
  createQuizTrackingState,
  resetQuizTrackingState,
  trackQuizAnswer,
  isQuizComplete,
} from '../utils/quizTracking';
import { CardDisplay } from './CardDisplay';
import { RatingButtons } from './RatingButtons';
import { StudyStats } from './StudyStats';
import { StudySettings } from './StudySettings';
import { DeckId, getDeckInfo } from '../utils/deckStorage';
import './components.css';

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
  const [quizTracking, setQuizTracking] = useState<QuizTrackingState>(createQuizTrackingState());
  
  const deckInfo = useMemo(() => getDeckInfo(deckId), [deckId]);

  // Reset study state when deck changes or quiz mode changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSession(null);
    // Reset quiz state
    if (quizMode) {
      setQuizTracking(resetQuizTrackingState());
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

  // Filter cards for quiz mode or use queue for normal study
  const dueCards = useMemo(() => {
    if (quizMode) {
      // Quiz mode: filter by topic and/or incorrect cards
      return filterCardsForQuiz(
        cards,
        topicId,
        filterIncorrectOnly,
        previousIncorrectCardIds
      );
    } else {
      // Normal study mode: use queue
      return queue?.allCards || [];
    }
  }, [quizMode, topicId, cards, filterIncorrectOnly, previousIncorrectCardIds, queue]);

  // Initialize session when starting
  useEffect(() => {
    if (!isLoading && dueCards.length > 0 && !session) {
      setSession(createStudySession());
    }
  }, [dueCards.length, isLoading, session]);

  // Check if quiz is complete (all cards answered once)
  useEffect(() => {
    if (quizMode && isQuizComplete(quizTracking, dueCards.length) && onQuizComplete) {
      const correct = Array.from(quizTracking.correctCardIds);
      const incorrect = Array.from(quizTracking.incorrectCardIds);
      onQuizComplete(createQuizResult(dueCards.length, correct, incorrect));
    }
  }, [quizMode, quizTracking, dueCards.length, onQuizComplete]);

  // Update session time
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      setSession((prev) => prev ? updateSessionTime(prev) : null);
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

    // Process card review (updates state, tracks metadata)
    const reviewResult = processCardReview(currentCard, quality);
    updateCard(reviewResult.updatedCard);

    // Increment new cards studied if applicable
    if (reviewResult.wasNewCard) {
      incrementNewCardsStudied();
    }

    // Quiz mode: track answered cards and correct/incorrect
    if (quizMode) {
      setQuizTracking((prev) => trackQuizAnswer(prev, currentCard.id, reviewResult.isCorrect));
    }

    // Update session stats
    setSession((prev) => prev ? incrementCardsReviewed(prev) : null);

    // Move to next card
    setShowAnswer(false);
    const nextIndex = getNextCardIndex(currentCardIndex, dueCards.length, quizMode);
    setCurrentCardIndex(nextIndex);
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

